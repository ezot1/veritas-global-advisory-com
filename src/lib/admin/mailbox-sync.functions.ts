import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { DEPARTMENT_INBOXES } from '@/lib/email/config'
import { mailboxDepartment, mailboxReference, parseMailboxBatch } from './mailbox-utils'

const GMAIL_API = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'
const GMAIL_BATCH_API = 'https://connector-gateway.lovable.dev/google_mail/batch/gmail/v1'

type GmailHeader = { name?: string; value?: string }
type GmailPart = {
  mimeType?: string
  body?: { data?: string }
  parts?: GmailPart[]
}
type GmailMessage = {
  id?: string
  internalDate?: string
  labelIds?: string[]
  payload?: GmailPart & { headers?: GmailHeader[] }
}

function header(message: GmailMessage, name: string): string {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function extractEmail(value: string): string | null {
  const match = value.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/)
  return match ? match[0].toLowerCase() : null
}

function senderName(value: string, fallback: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/^"|"$/g, '').trim() || fallback
}

function normalizeSubject(value: string): string {
  return value.replace(/^\s*((re|fw|fwd)\s*:\s*)+/i, '').trim().toLowerCase()
}

function decodeBase64Url(value: string): string {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(normalized)
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
  } catch {
    return ''
  }
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function findBody(part: GmailPart | undefined, mimeType: string): string {
  if (!part) return ''
  if (part.mimeType === mimeType && part.body?.data) return decodeBase64Url(part.body.data)
  for (const child of part.parts ?? []) {
    const value = findBody(child, mimeType)
    if (value) return value
  }
  return ''
}

function messageBody(message: GmailMessage): string {
  const plain = findBody(message.payload, 'text/plain').trim()
  if (plain) return plain.slice(0, 50000)
  return stripHtml(findBody(message.payload, 'text/html')).slice(0, 50000)
}

/** Import genuine Gmail replies into existing Veritas conversations. */
export const syncMailboxReplies = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) throw new Error('Forbidden')

    const lovableKey = process.env['LOVABLE_API_KEY']
    const gmailKey = process.env['GOOGLE_MAIL_API_KEY']
    if (!lovableKey || !gmailKey) throw new Error('The receiving mailbox is not connected.')

    const gatewayHeaders = {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': gmailKey,
    }
    const listResponse = await fetch(
      `${GMAIL_API}/users/me/messages?maxResults=50&q=${encodeURIComponent(`in:inbox newer_than:30d {${Object.values(DEPARTMENT_INBOXES).map((address) => `to:${address}`).join(' ')}}`)}`,
      { headers: gatewayHeaders },
    )
    if (!listResponse.ok) {
      const detail = await listResponse.text()
      console.error(`Mailbox list failed [${listResponse.status}]: ${detail}`)
      throw new Error(`Could not refresh the receiving mailbox [${listResponse.status}]: ${detail}`)
    }
    const listed = (await listResponse.json()) as { messages?: { id?: string }[] }
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const listedIds = (listed.messages ?? []).flatMap((item) => (item.id ? [item.id] : []))
    if (!listedIds.length) return { imported: 0, checked: 0 }
    const { data: stored, error: storedError } = await supabaseAdmin.from('submission_messages').select('message_id').in('message_id', listedIds.map((id) => `gmail:${id}`))
    if (storedError) throw new Error('Could not check previously imported mail.')
    const storedIds = new Set((stored ?? []).map((row) => row.message_id))
    const ids = listedIds.filter((id) => !storedIds.has(`gmail:${id}`))
    if (ids.length === 0) return { imported: 0, checked: 0 }

    const requestBoundary = `batch_${crypto.randomUUID()}`
    const batchBody = ids
      .map(
        (id) =>
          `--${requestBoundary}\r\nContent-Type: application/http\r\nContent-ID: <${id}>\r\n\r\nGET /gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full HTTP/1.1\r\n\r\n`,
      )
      .join('') + `--${requestBoundary}--\r\n`
    const batchResponse = await fetch(GMAIL_BATCH_API, {
      method: 'POST',
      headers: { ...gatewayHeaders, 'Content-Type': `multipart/mixed; boundary=${requestBoundary}` },
      body: batchBody,
    })
    if (!batchResponse.ok) {
      const detail = await batchResponse.text()
      console.error(`Mailbox batch failed [${batchResponse.status}]: ${detail}`)
      throw new Error(`Could not read messages from the receiving mailbox [${batchResponse.status}]: ${detail}`)
    }
    const messages = parseMailboxBatch<GmailMessage>(await batchResponse.text(), batchResponse.headers.get('content-type') ?? '')
    if (messages.length === 0) return { imported: 0, checked: ids.length }

    const gmailIds = messages.flatMap((message) => (message.id ? [`gmail:${message.id}`] : []))
    const { data: existingRows } = await supabaseAdmin
      .from('submission_messages')
      .select('message_id')
      .in('message_id', gmailIds)
    const existing = new Set((existingRows ?? []).map((row) => row.message_id))

    const senders = Array.from(
      new Set(messages.map((message) => extractEmail(header(message, 'from'))).filter((value): value is string => Boolean(value))),
    )
    if (senders.length === 0) return { imported: 0, checked: messages.length }
    const { data: conversations, error: conversationError } = await supabaseAdmin
      .from('form_submissions')
      .select('id, sender_email, sender_name, subject, recipient_email, created_at, reference_number')
      .in('sender_email', senders)
      .order('created_at', { ascending: false })
    if (conversationError) throw new Error('Could not match mailbox replies to conversations.')

    let imported = 0
    for (const message of messages) {
      if (!message.id || existing.has(`gmail:${message.id}`)) continue
      const fromValue = header(message, 'from')
      const fromEmail = extractEmail(fromValue)
      const subject = header(message, 'subject').trim() || '(no subject)'
      const normalized = normalizeSubject(subject)
      const matches = (conversations ?? []).filter(
        (conversation) =>
          conversation.sender_email?.toLowerCase() === fromEmail && normalizeSubject(conversation.subject ?? '') === normalized,
      )
      let conversation: NonNullable<typeof conversations>[number] | undefined = matches.find((row) => row.reference_number === mailboxReference(subject)) ?? matches.at(0)
      const reference = mailboxReference(subject)
      if (reference && fromEmail) {
        const { data: referenced } = await supabaseAdmin.from('form_submissions')
          .select('id, sender_email, sender_name, subject, recipient_email, created_at, reference_number')
          .eq('reference_number', reference).eq('sender_email', fromEmail).maybeSingle()
        conversation = referenced ?? conversation
      }
      const body = messageBody(message)
      if (!fromEmail) continue

      const labels = message.labelIds ?? []
      const status = labels.includes('TRASH') ? 'trash' : labels.includes('SPAM') ? 'spam' : 'new'
      const recipient = extractEmail(header(message, 'to')) ?? DEPARTMENT_INBOXES.general
      const date = new Date(Number(message.internalDate ?? Date.now()))
      const receivedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
      if (!conversation) {
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`gmail:${message.id}`)))
        const hex = Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')).join('')
        const submissionId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`
        const { data: created, error: createError } = await supabaseAdmin.from('form_submissions').upsert({
          id: submissionId, form_type: 'email', department: mailboxDepartment(`${header(message, 'to')} ${header(message, 'cc')}`),
          recipient_email: recipient, subject, sender_email: fromEmail, sender_name: senderName(fromValue, fromEmail),
          message: body || '(No message text)', fields: [], status, source: 'Google Workspace', created_at: receivedAt,
        }, { onConflict: 'id', ignoreDuplicates: true })
          .select('id, sender_email, sender_name, subject, recipient_email, created_at, reference_number').maybeSingle()
        if (createError) throw new Error(`Could not save incoming mail: ${createError.message}`)
        conversation = created ?? (await supabaseAdmin.from('form_submissions').select('id, sender_email, sender_name, subject, recipient_email, created_at, reference_number').eq('id', submissionId).single()).data ?? undefined
        if (conversation) conversations?.unshift(conversation)
      }
      if (!conversation) throw new Error('Could not open the incoming mail conversation.')
      const { error: insertError } = await supabaseAdmin.from('submission_messages').insert({
        submission_id: conversation.id,
        direction: 'inbound',
        from_email: fromEmail,
        from_label: senderName(fromValue, conversation.sender_name ?? fromEmail),
        to_email: extractEmail(header(message, 'to')) ?? conversation.recipient_email,
        reply_to: fromEmail,
        subject,
        body_text: body || '(No message text)',
        created_at: receivedAt,
        message_id: `gmail:${message.id}`,
        status: 'received',
      })
      if (insertError) {
        if (insertError.code === '23505') continue
        throw new Error(`Could not save incoming message: ${insertError.message}`)
      }
      const { error: updateError } = await supabaseAdmin
        .from('form_submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
      if (updateError) throw new Error(`Could not update the inbox: ${updateError.message}`)
      imported += 1
    }

    return { imported, checked: messages.length }
  })