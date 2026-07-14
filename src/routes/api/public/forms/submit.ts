import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Veritas Global Advisory'
const SENDER_DOMAIN = 'notify.veritasglobaladvisory.org'
const FROM_DOMAIN = 'veritasglobaladvisory.org'

const DEPARTMENT_INBOXES: Record<string, string> = {
  general: 'info@veritasglobaladvisory.org',
  business: 'business@veritasglobaladvisory.org',
  research: 'research@veritasglobaladvisory.org',
  careers: 'careers@veritasglobaladvisory.org',
  media: 'media@veritasglobaladvisory.org',
}

const DEPARTMENT_LABELS: Record<string, string> = {
  general: 'Veritas Global Advisory — General',
  business: 'Veritas Global Advisory — Business',
  research: 'Veritas Global Advisory — Research',
  careers: 'Veritas Global Advisory — Careers',
  media: 'Veritas Global Advisory — Media',
}

function resolveDepartmentKey(parsed: z.infer<typeof bodySchema>): string {
  if (parsed.formType === 'careers') return 'careers'
  if (parsed.formType === 'talent') return 'research'
  return parsed.department ?? 'general'
}

const fieldSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().max(5000),
})

const bodySchema = z.object({
  formType: z.enum(['contact', 'careers', 'talent']),
  department: z.enum(['general', 'business', 'research', 'careers', 'media']).optional(),
  formTitle: z.string().trim().min(1).max(160),
  formSubtitle: z.string().trim().max(280).optional(),
  replyTo: z.string().trim().email().max(254).optional(),
  fields: z.array(fieldSchema).min(1).max(40),
  resumePath: z.string().trim().max(500).optional(),
  resumeName: z.string().trim().max(200).optional(),
})

function resolveRecipient(parsed: z.infer<typeof bodySchema>): string {
  if (parsed.formType === 'careers') return DEPARTMENT_INBOXES.careers
  if (parsed.formType === 'talent') return DEPARTMENT_INBOXES.research
  return DEPARTMENT_INBOXES[parsed.department ?? 'general'] ?? DEPARTMENT_INBOXES.general
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const Route = createFileRoute('/api/public/forms/submit')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500, headers: corsHeaders })
        }

        let parsed: z.infer<typeof bodySchema>
        try {
          const raw = await request.json()
          parsed = bodySchema.parse(raw)
        } catch (err) {
          return Response.json(
            { error: 'Invalid submission', detail: err instanceof Error ? err.message : 'parse error' },
            { status: 400, headers: corsHeaders },
          )
        }

        const recipient = resolveRecipient(parsed)
        const deptKey = resolveDepartmentKey(parsed)
        const fromAddress = DEPARTMENT_INBOXES[deptKey]
        const fromLabel = DEPARTMENT_LABELS[deptKey] ?? SITE_NAME
        const template = TEMPLATES['form-notification']
        if (!template) {
          return Response.json({ error: 'Template missing' }, { status: 500, headers: corsHeaders })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        // Load branding overrides for this template
        const { data: settingsRow } = await supabase
          .from('email_template_settings')
          .select('brand_color, header_text, intro_text, footer_text')
          .eq('template_name', 'form-notification')
          .maybeSingle()

        // If a resume was uploaded, sign a long-lived URL and append as a field
        const enrichedFields = [...parsed.fields]
        let resumeSignedUrl: string | null = null
        if (parsed.resumePath) {
          const { data: signed } = await supabase.storage
            .from('resumes')
            .createSignedUrl(parsed.resumePath, 60 * 60 * 24 * 30) // 30 days
          if (signed?.signedUrl) {
            resumeSignedUrl = signed.signedUrl
            enrichedFields.push({
              label: 'Resume',
              value: `${parsed.resumeName ?? 'Download'} — ${signed.signedUrl}`,
            })
          }
        }

        const templateData = {
          formTitle: parsed.formTitle,
          formSubtitle: settingsRow?.intro_text?.trim() ? settingsRow.intro_text : parsed.formSubtitle,
          fields: enrichedFields,
          submittedAt: new Date().toISOString(),
          brandColor: settingsRow?.brand_color ?? '#b08838',
          headerText: settingsRow?.header_text ?? 'VERITAS GLOBAL ADVISORY',
          footerText: settingsRow?.footer_text ?? 'Submitted via the Veritas Global Advisory website.',
        }

        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const text = await render(element, { plainText: true })



        const messageId = crypto.randomUUID()

        // Helper to find a field value by label (case-insensitive contains)
        const findField = (needle: string) =>
          parsed.fields.find((f) => f.label.toLowerCase().includes(needle))?.value ?? null
        const messageVal =
          findField('message') ?? findField('cover') ?? findField('summary') ?? null

        await supabase.from('form_submissions').insert({
          form_type: parsed.formType,
          department: parsed.department ?? null,
          recipient_email: recipient,
          subject: parsed.formTitle,
          sender_name: findField('name'),
          sender_email: parsed.replyTo ?? findField('email'),
          sender_organization: findField('organization') ?? findField('company'),
          sender_country: findField('country'),
          message: messageVal,
          fields: enrichedFields,
          status: 'new',
        })

        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: 'form-notification',
          recipient_email: recipient,
          status: 'pending',
          metadata: { form_type: parsed.formType, department: parsed.department ?? null },
        })

        const { error: enqueueError } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: recipient,
            from: `${fromLabel} <${fromAddress}>`,
            sender_domain: SENDER_DOMAIN,
            subject: parsed.formTitle,
            html,
            text,
            purpose: 'transactional',
            label: `form-${parsed.formType}`,
            idempotency_key: messageId,
            reply_to: parsed.replyTo,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          console.error('Failed to enqueue form notification', { error: enqueueError })
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: 'form-notification',
            recipient_email: recipient,
            status: 'failed',
            error_message: 'Failed to enqueue',
          })
          return Response.json({ error: 'Failed to send' }, { status: 500, headers: corsHeaders })
        }

        return Response.json({ success: true }, { headers: corsHeaders })
      },
    },
  },
})
