import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * In-house reply links.
 *
 * Every outbound admin reply carries a private link back to the site. The
 * recipient answers on that page and the message lands directly in the admin
 * inbox thread, with no mailbox, MX record, or forwarding service involved.
 */

const tokenSchema = z.string().trim().min(20).max(80)

export const getReplyLink = createServerFn({ method: 'POST' })
  .inputValidator((input: { token: string }) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: link } = await supabaseAdmin
      .from('reply_links')
      .select('id, submission_id, email, name, expires_at')
      .eq('token', data.token)
      .maybeSingle()

    if (!link) return { valid: false as const }
    if (new Date(link.expires_at).getTime() < Date.now()) return { valid: false as const }

    const { data: submission } = await supabaseAdmin
      .from('form_submissions')
      .select('subject')
      .eq('id', link.submission_id)
      .maybeSingle()

    return {
      valid: true as const,
      name: link.name ?? null,
      email: link.email,
      subject: submission?.subject ?? 'Your message to Veritas Global Advisory',
    }
  })

export const submitReplyViaLink = createServerFn({ method: 'POST' })
  .inputValidator((input: { token: string; body: string }) =>
    z.object({ token: tokenSchema, body: z.string().trim().min(2).max(20000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: link } = await supabaseAdmin
      .from('reply_links')
      .select('id, submission_id, email, name, expires_at, use_count')
      .eq('token', data.token)
      .maybeSingle()
    if (!link || new Date(link.expires_at).getTime() < Date.now()) {
      throw new Error('This reply link is no longer valid.')
    }
    if (link.use_count >= 50) throw new Error('This reply link has reached its limit.')

    const { data: submission } = await supabaseAdmin
      .from('form_submissions')
      .select('id, subject, recipient_email')
      .eq('id', link.submission_id)
      .maybeSingle()
    if (!submission) throw new Error('Conversation not found.')

    const subject = submission.subject?.toLowerCase().startsWith('re:')
      ? submission.subject
      : `Re: ${submission.subject ?? 'Your message'}`

    const { error: msgErr } = await supabaseAdmin.from('submission_messages').insert({
      submission_id: submission.id,
      direction: 'inbound',
      from_email: link.email,
      from_label: link.name ?? link.email,
      to_email: submission.recipient_email ?? 'info@veritasglobaladvisory.org',
      reply_to: link.email,
      subject,
      body_text: data.body,
      message_id: crypto.randomUUID(),
      status: 'received',
    })
    if (msgErr) throw new Error('Could not deliver your reply. Please try again.')

    await supabaseAdmin
      .from('form_submissions')
      .update({ status: 'new', updated_at: new Date().toISOString() })
      .eq('id', submission.id)

    await supabaseAdmin
      .from('reply_links')
      .update({ use_count: link.use_count + 1, last_used_at: new Date().toISOString() })
      .eq('id', link.id)

    return { success: true }
  })
