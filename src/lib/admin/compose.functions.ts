import * as React from 'react'
import { render } from '@react-email/components'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SENDER_DOMAIN = 'notify.veritasglobaladvisory.org'

const DEPARTMENT_INBOXES: Record<string, string> = {
  general: 'info@veritasglobaladvisory.org',
  business: 'business@veritasglobaladvisory.org',
  research: 'research@veritasglobaladvisory.org',
  careers: 'careers@veritasglobaladvisory.org',
  media: 'media@veritasglobaladvisory.org',
}
const DEPARTMENT_LABELS: Record<string, string> = {
  general: 'Veritas Global Advisory - General',
  business: 'Veritas Global Advisory - Business',
  research: 'Veritas Global Advisory - Research',
  careers: 'Veritas Global Advisory - Careers',
  media: 'Veritas Global Advisory - Media',
}

/**
 * Compose and send a brand new email from the admin console.
 * One recipient per send: this is a transactional one-to-one message,
 * not a bulk or marketing channel.
 */
export const sendComposedEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { toEmail: string; subject: string; body: string; fromDepartment?: string }) =>
    z
      .object({
        toEmail: z.string().trim().email().max(254),
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(20000),
        fromDepartment: z.enum(['general', 'business', 'research', 'careers', 'media']).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context

    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    const deptKey = data.fromDepartment ?? 'general'
    const fromEmail = DEPARTMENT_INBOXES[deptKey] ?? DEPARTMENT_INBOXES.general
    const fromLabel = DEPARTMENT_LABELS[deptKey] ?? DEPARTMENT_LABELS.general

    const template = TEMPLATES['admin-reply']
    if (!template) throw new Error('Email template missing')

    const { data: settingsRow } = await supabase
      .from('email_template_settings')
      .select('brand_color, header_text, intro_text, signature, footer_text')
      .eq('template_name', 'admin-reply')
      .maybeSingle()

    const element = React.createElement(template.component, {
      subject: data.subject,
      bodyText: data.body,
      fromLabel,
      fromEmail,
      brandColor: settingsRow?.brand_color ?? '#b08838',
      headerText: settingsRow?.header_text ?? 'VERITAS GLOBAL ADVISORY',
      introText: settingsRow?.intro_text ?? '',
      signature: settingsRow?.signature ?? fromLabel,
      footerText: settingsRow?.footer_text ?? 'Reply directly to this email to reach us.',
    })
    const html = await render(element)
    const text = await render(element, { plainText: true })

    const messageId = crypto.randomUUID()
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const logSend = async (status: string, errorMessage?: string) => {
      const { error } = await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'admin-compose',
        recipient_email: data.toEmail,
        status,
        error_message: errorMessage,
        metadata: {
          department: deptKey,
          subject: data.subject,
          body: data.body,
          from_email: fromEmail,
          sent_by: userId,
        },
      })
      if (error) console.error('Failed to write email_send_log', { code: error.code, message: error.message })
    }

    const { EmailAPIError, sendLovableEmail } = await import('@lovable.dev/email-js')

    try {
      await sendLovableEmail(
        {
          to: data.toEmail,
          from: `${fromLabel} <${fromEmail}>`,
          sender_domain: SENDER_DOMAIN,
          subject: data.subject,
          html,
          text,
          purpose: 'transactional',
          label: 'admin-compose',
          idempotency_key: messageId,
          reply_to: fromEmail,
        },
        { apiKey: process.env['LOVABLE_API_KEY']!, sendUrl: process.env['LOVABLE_SEND_URL'] },
      )
    } catch (error) {
      const suppressed = error instanceof EmailAPIError && error.code === 'recipient_suppressed'
      const msg = error instanceof Error ? error.message : String(error)
      await logSend(suppressed ? 'suppressed' : 'failed', suppressed ? 'Recipient suppressed' : msg.slice(0, 1000))
      if (suppressed) {
        return { success: false, suppressed: true, messageId }
      }
      throw new Error('Failed to send email: ' + msg)
    }

    await logSend('sent')
    return { success: true, suppressed: false, messageId }
  })

export const listSentEmails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('id, recipient_email, status, error_message, metadata, created_at')
      .eq('template_name', 'admin-compose')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error(error.message)
    return {
      messages: (rows ?? []).map((r) => ({
        id: r.id as string,
        recipient_email: r.recipient_email as string,
        status: r.status as string,
        error_message: (r.error_message as string | null) ?? null,
        subject: ((r.metadata as { subject?: string } | null)?.subject ?? '') as string,
        created_at: r.created_at as string,
      })),
    }
  })

/** Every outbound email this site has sent: composed, replies, and automatic messages. */
export const listAllSentEmails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(500).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('id, template_name, recipient_email, status, error_message, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(data.limit ?? 200)
    if (error) throw new Error(error.message)

    return {
      messages: (rows ?? []).map((r) => {
        const meta = (r.metadata ?? {}) as { subject?: string; body?: string; from_email?: string; form_type?: string }
        return {
          id: r.id as string,
          template_name: (r.template_name as string) ?? '',
          recipient_email: r.recipient_email as string,
          status: r.status as string,
          error_message: (r.error_message as string | null) ?? null,
          subject: meta.subject ?? meta.form_type ?? '',
          body: meta.body ?? '',
          from_email: meta.from_email ?? '',
          created_at: r.created_at as string,
        }
      }),
    }
  })
