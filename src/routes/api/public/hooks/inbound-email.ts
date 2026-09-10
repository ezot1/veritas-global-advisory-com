import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

/**
 * Inbound email receiver.
 *
 * A mail forwarding service (Cloudflare Email Routing worker, Zapier, Make,
 * ImprovMX webhook, Mailgun routes, etc.) POSTs incoming replies here.
 * The message is attached to the matching conversation in the admin inbox,
 * or filed as a new inquiry when no earlier thread exists.
 *
 * Auth: shared secret in the `x-inbound-secret` header (INBOUND_EMAIL_SECRET).
 */

const bodySchema = z.object({
  from: z.string().trim().max(320),
  fromName: z.string().trim().max(200).optional(),
  to: z.string().trim().max(320).optional(),
  subject: z.string().trim().max(500).optional(),
  text: z.string().max(100000).optional(),
  html: z.string().max(400000).optional(),
  messageId: z.string().trim().max(400).optional(),
})

function extractEmail(value: string): string | null {
  const match = value.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/)
  return match ? match[0].toLowerCase() : null
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const Route = createFileRoute('/api/public/hooks/inbound-email')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env['INBOUND_EMAIL_SECRET']
        if (!secret) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const url = new URL(request.url)
        const provided = request.headers.get('x-inbound-secret') ?? url.searchParams.get('secret') ?? ''
        if (provided !== secret) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        let parsed: z.infer<typeof bodySchema>
        try {
          const contentType = request.headers.get('content-type') ?? ''
          let raw: Record<string, unknown>
          if (contentType.includes('application/json')) {
            raw = (await request.json()) as Record<string, unknown>
          } else {
            // Form-encoded / multipart providers (Mailgun routes, Zapier, Make, ImprovMX)
            const form = await request.formData()
            const get = (...keys: string[]) => {
              for (const k of keys) {
                const v = form.get(k)
                if (typeof v === 'string' && v.trim()) return v
              }
              return undefined
            }
            raw = {
              from: get('from', 'sender', 'From'),
              fromName: get('fromName', 'from_name'),
              to: get('to', 'recipient', 'To'),
              subject: get('subject', 'Subject'),
              text: get('text', 'stripped-text', 'body-plain'),
              html: get('html', 'stripped-html', 'body-html'),
              messageId: get('messageId', 'Message-Id', 'message-id'),
            }
          }
          parsed = bodySchema.parse(raw)
        } catch (err) {
          return Response.json(
            { error: 'Invalid payload', detail: err instanceof Error ? err.message : 'parse error' },
            { status: 400 },
          )
        }


        const senderEmail = extractEmail(parsed.from)
        if (!senderEmail) return Response.json({ error: 'Unparsable sender address' }, { status: 400 })

        const toEmail = (parsed.to && extractEmail(parsed.to)) || 'info@veritasglobaladvisory.org'
        const subject = parsed.subject?.trim() || '(no subject)'
        const bodyText = (parsed.text?.trim() || (parsed.html ? stripHtml(parsed.html) : '')).slice(0, 50000)
        const senderName =
          parsed.fromName?.trim() || parsed.from.replace(/<[^>]*>/, '').replace(/"/g, '').trim() || senderEmail

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        // Ignore duplicate deliveries of the same message
        if (parsed.messageId) {
          const { data: dupe } = await supabase
            .from('submission_messages')
            .select('id')
            .eq('message_id', parsed.messageId)
            .maybeSingle()
          if (dupe) return Response.json({ ok: true, duplicate: true })
        }

        // Attach to the most recent conversation from this sender, else open one
        const { data: existing } = await supabase
          .from('form_submissions')
          .select('id')
          .eq('sender_email', senderEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        let submissionId = existing?.id ?? null

        if (!submissionId) {
          const { data: created, error: createErr } = await supabase
            .from('form_submissions')
            .insert({
              form_type: 'contact',
              department: 'general',
              subject,
              recipient_email: toEmail,
              sender_email: senderEmail,
              sender_name: senderName,
              message: bodyText,
              status: 'new',
              fields: [{ label: 'Source', value: 'Email reply' }],
            })
            .select('id')
            .single()
          if (createErr || !created) {
            return Response.json({ error: 'Failed to record message' }, { status: 500 })
          }
          submissionId = created.id
        }

        const { error: msgErr } = await supabase.from('submission_messages').insert({
          submission_id: submissionId,
          direction: 'inbound',
          from_email: senderEmail,
          from_label: senderName,
          to_email: toEmail,
          reply_to: senderEmail,
          subject,
          body_text: bodyText,
          message_id: parsed.messageId ?? crypto.randomUUID(),
          status: 'received',
        })
        if (msgErr) return Response.json({ error: 'Failed to record message' }, { status: 500 })

        await supabase
          .from('form_submissions')
          .update({ status: 'new', updated_at: new Date().toISOString() })
          .eq('id', submissionId)

        return Response.json({ ok: true, submissionId })
      },
    },
  },
})
