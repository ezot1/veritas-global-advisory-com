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
  inReplyTo: z.string().trim().max(400).optional(),
  references: z.string().trim().max(1000).optional(),
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

/** Decode quoted-printable / base64 transfer encodings. */
function decodeBody(body: string, encoding: string): string {
  const enc = encoding.toLowerCase()
  if (enc === 'base64') {
    try {
      const bin = atob(body.replace(/\s+/g, ''))
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
      return new TextDecoder('utf-8').decode(bytes)
    } catch {
      return body
    }
  }
  if (enc === 'quoted-printable') {
    return body
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  }
  return body
}

/** Decode RFC 2047 encoded-word headers (=?UTF-8?B?...?=). */
function decodeHeaderValue(value: string): string {
  return value.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, _cs, kind, text) =>
    decodeBody(String(kind).toUpperCase() === 'B' ? text : String(text).replace(/_/g, ' '),
      String(kind).toUpperCase() === 'B' ? 'base64' : 'quoted-printable'),
  )
}

type ParsedMime = {
  from: string
  to?: string
  subject?: string
  text?: string
  html?: string
  messageId?: string
  inReplyTo?: string
  references?: string
}

/** Minimal RFC 822 parser: headers plus the best text/html part. */
function parseRawEmail(raw: string): ParsedMime {
  const normalized = raw.replace(/\r\n/g, '\n')
  const split = normalized.indexOf('\n\n')
  const headerBlock = split === -1 ? normalized : normalized.slice(0, split)
  const body = split === -1 ? '' : normalized.slice(split + 2)

  const headers = new Map<string, string>()
  for (const line of headerBlock.replace(/\n[ \t]+/g, ' ').split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim().toLowerCase()
      if (!headers.has(key)) headers.set(key, line.slice(idx + 1).trim())
    }
  }

  const contentType = headers.get('content-type') ?? 'text/plain'
  const encoding = headers.get('content-transfer-encoding') ?? '7bit'

  let text: string | undefined
  let html: string | undefined

  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i)
  if (boundaryMatch) {
    const parts = body.split(`--${boundaryMatch[1]}`)
    for (const part of parts) {
      const pSplit = part.indexOf('\n\n')
      if (pSplit === -1) continue
      const pHeaders = part.slice(0, pSplit).toLowerCase()
      const pEnc = pHeaders.match(/content-transfer-encoding:\s*([^\n;]+)/)?.[1]?.trim() ?? '7bit'
      const content = decodeBody(part.slice(pSplit + 2), pEnc)
      if (pHeaders.includes('text/plain') && !text) text = content
      else if (pHeaders.includes('text/html') && !html) html = content
    }
  } else {
    const decoded = decodeBody(body, encoding)
    if (contentType.toLowerCase().includes('text/html')) html = decoded
    else text = decoded
  }

  return {
    from: decodeHeaderValue(headers.get('from') ?? ''),
    to: headers.get('to') ? decodeHeaderValue(headers.get('to')!) : undefined,
    subject: headers.get('subject') ? decodeHeaderValue(headers.get('subject')!) : undefined,
    text: text?.trim() || undefined,
    html: html?.trim() || undefined,
    messageId: headers.get('message-id')?.replace(/[<>]/g, '') || undefined,
    inReplyTo: headers.get('in-reply-to')?.replace(/[<>]/g, '') || undefined,
    references: headers.get('references')?.replace(/[<>]/g, '') || undefined,
  }
}

/** Brevo Inbound Parsing posts { items: [ { From, To, Subject, RawTextBody, ... } ] }. */
function normalizeBrevo(raw: Record<string, unknown>): Record<string, unknown> {
  const items = (raw as { items?: unknown[] }).items
  const item = Array.isArray(items) ? (items[0] as Record<string, any> | undefined) : undefined
  if (!item) return raw
  const headers = (item['Headers'] ?? {}) as Record<string, unknown>
  const firstTo = Array.isArray(item['To']) ? (item['To'][0] as Record<string, unknown> | undefined) : undefined
  return {
    from: String(item['From']?.Address ?? ''),
    fromName: item['From']?.Name ? String(item['From'].Name) : undefined,
    to: firstTo?.['Address'] ? String(firstTo['Address']) : undefined,
    subject: item['Subject'] ? String(item['Subject']) : undefined,
    text: item['RawTextBody'] ? String(item['RawTextBody']) : undefined,
    html: item['RawHtmlBody'] ? String(item['RawHtmlBody']) : undefined,
    messageId: item['MessageId'] ? String(item['MessageId']).replace(/[<>]/g, '') : undefined,
    inReplyTo: headers['In-Reply-To'] ? String(headers['In-Reply-To']).replace(/[<>]/g, '') : undefined,
    references: headers['References'] ? String(headers['References']).replace(/[<>]/g, '').slice(0, 1000) : undefined,
  }
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
            raw = normalizeBrevo(raw)
          }
          } else if (
            contentType.includes('message/rfc822') ||
            contentType.includes('text/plain') ||
            contentType === ''
          ) {
            raw = parseRawEmail(await request.text()) as unknown as Record<string, unknown>
          } else {
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
              inReplyTo: get('inReplyTo', 'In-Reply-To'),
              references: get('references', 'References'),
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

        if (parsed.messageId) {
          const { data: dupe } = await supabase
            .from('submission_messages')
            .select('id')
            .eq('message_id', parsed.messageId)
            .maybeSingle()
          if (dupe) return Response.json({ ok: true, duplicate: true })
        }

        let submissionId: string | null = null

        // 1. Try matching by In-Reply-To header
        if (parsed.inReplyTo) {
          const { data: parentMsg } = await supabase
            .from('submission_messages')
            .select('submission_id')
            .eq('message_id', parsed.inReplyTo)
            .maybeSingle()
          if (parentMsg) {
            submissionId = parentMsg.submission_id
          }
        }

        // 2. Fallback to sender email if no match by message ID
        if (!submissionId) {
          const { data: existing } = await supabase
            .from('form_submissions')
            .select('id')
            .eq('sender_email', senderEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          submissionId = existing?.id ?? null
        }

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
