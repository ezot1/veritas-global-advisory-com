/**
 * Provider adapter. Every outbound email in the app goes through sendEmail()
 * so the underlying provider can be replaced in one place.
 *
 * Current provider: Lovable managed email (LOVABLE_API_KEY).
 * To move to Resend/SendGrid later, reimplement sendEmail() only.
 */
import { SENDER_DOMAIN, sanitizeHeaderValue } from './config'

export interface SendEmailInput {
  to: string
  fromLabel: string
  fromEmail: string
  subject: string
  html: string
  text: string
  replyTo?: string | undefined
  /** Short provider label for grouping in delivery logs. */
  label: string
  idempotencyKey: string
}

export type SendEmailResult =
  | { status: 'sent'; providerMessageId: string }
  | { status: 'suppressed'; error: string }
  | { status: 'failed'; error: string }

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env['LOVABLE_API_KEY']
  if (!apiKey) return { status: 'failed', error: 'Email provider is not configured' }

  const { EmailAPIError, sendLovableEmail } = await import('@lovable.dev/email-js')

  try {
    await sendLovableEmail(
      {
        to: input.to,
        from: `${sanitizeHeaderValue(input.fromLabel)} <${input.fromEmail}>`,
        sender_domain: SENDER_DOMAIN,
        subject: sanitizeHeaderValue(input.subject),
        html: input.html,
        text: input.text,
        purpose: 'transactional',
        label: input.label,
        idempotency_key: input.idempotencyKey,
        reply_to: input.replyTo,
      },
      { apiKey, sendUrl: process.env['LOVABLE_SEND_URL'] },
    )
  } catch (error) {
    const suppressed = error instanceof EmailAPIError && error.code === 'recipient_suppressed'
    const message = error instanceof Error ? error.message : String(error)
    if (suppressed) return { status: 'suppressed', error: 'Recipient suppressed' }
    return { status: 'failed', error: message.slice(0, 1000) }
  }

  return { status: 'sent', providerMessageId: input.idempotencyKey }
}
