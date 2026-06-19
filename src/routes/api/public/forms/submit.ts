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
        const template = TEMPLATES['form-notification']
        if (!template) {
          return Response.json({ error: 'Template missing' }, { status: 500, headers: corsHeaders })
        }

        const templateData = {
          formTitle: parsed.formTitle,
          formSubtitle: parsed.formSubtitle,
          fields: parsed.fields,
          submittedAt: new Date().toISOString(),
        }

        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const text = await render(element, { plainText: true })

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        const messageId = crypto.randomUUID()

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
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
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
