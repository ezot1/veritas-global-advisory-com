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

function departmentKeyForSubmission(formType: string, department: string | null): string {
  if (formType === 'careers') return 'careers'
  if (formType === 'talent') return 'research'
  return department ?? 'general'
}

export const sendAdminReply = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string; subject: string; body: string; fromDepartment?: string; toEmail?: string }) =>
    z
      .object({
        submissionId: z.string().uuid(),
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(20000),
        fromDepartment: z.enum(['general', 'business', 'research', 'careers', 'media']).optional(),
        toEmail: z.string().trim().email().max(254).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context

    // Admin check
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    // Load submission
    const { data: submission, error: subErr } = await supabase
      .from('form_submissions')
      .select('id, form_type, department, sender_email, sender_name, subject')
      .eq('id', data.submissionId)
      .maybeSingle()
    if (subErr || !submission) throw new Error('Submission not found')
    const recipient = data.toEmail ?? submission.sender_email
    if (!recipient) throw new Error('Submission has no sender email to reply to')

    const deptKey = data.fromDepartment ?? 'general'
    const fromEmail = DEPARTMENT_INBOXES[deptKey] ?? DEPARTMENT_INBOXES.general
    const fromLabel = DEPARTMENT_LABELS[deptKey] ?? DEPARTMENT_LABELS.general


    const template = TEMPLATES['admin-reply']
    if (!template) throw new Error('Reply template missing')

    // Load per-template branding overrides
    const { data: settingsRow } = await supabase
      .from('email_template_settings')
      .select('brand_color, header_text, intro_text, signature, footer_text')
      .eq('template_name', 'admin-reply')
      .maybeSingle()

    const templateData = {
      subject: data.subject,
      bodyText: data.body,
      fromLabel,
      fromEmail,
      brandColor: settingsRow?.brand_color ?? '#b08838',
      headerText: settingsRow?.header_text ?? 'VERITAS GLOBAL ADVISORY',
      introText: settingsRow?.intro_text ?? '',
      signature: settingsRow?.signature ?? fromLabel,
      footerText: settingsRow?.footer_text ?? 'Reply directly to this email to reach us.',
    }

    const element = React.createElement(template.component, templateData)
    const html = await render(element)
    const text = await render(element, { plainText: true })

    const messageId = crypto.randomUUID()
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    // Store the outbound message
    const { error: insertErr } = await supabaseAdmin.from('submission_messages').insert({
      submission_id: submission.id,
      direction: 'outbound',
      from_email: fromEmail,
      from_label: fromLabel,
      to_email: submission.sender_email,
      reply_to: fromEmail,
      subject: data.subject,
      body_text: data.body,
      message_id: messageId,
      status: 'queued',
      sent_by: userId,
    })
    if (insertErr) throw new Error('Failed to record reply: ' + insertErr.message)

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'admin-reply',
      recipient_email: submission.sender_email,
      status: 'pending',
      metadata: { submission_id: submission.id, department: deptKey },
    })

    const { error: enqErr } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: submission.sender_email,
        from: `${fromLabel} <${fromEmail}>`,
        sender_domain: SENDER_DOMAIN,
        subject: data.subject,
        html,
        text,
        purpose: 'transactional',
        label: 'admin-reply',
        idempotency_key: messageId,
        reply_to: fromEmail,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqErr) {
      await supabaseAdmin
        .from('submission_messages')
        .update({ status: 'failed', error_message: enqErr.message })
        .eq('message_id', messageId)
      throw new Error('Failed to send reply: ' + enqErr.message)
    }

    // Update submission status
    await supabaseAdmin.from('form_submissions').update({ status: 'replied' }).eq('id', submission.id)

    return { success: true, messageId }
  })

export const listSubmissionMessages = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string }) =>
    z.object({ submissionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    const { data: rows, error } = await supabase
      .from('submission_messages')
      .select('id, direction, from_email, from_label, to_email, subject, body_text, status, error_message, created_at')
      .eq('submission_id', data.submissionId)
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return { messages: rows ?? [] }
  })
