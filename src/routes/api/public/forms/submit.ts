import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'
import {
  DEPARTMENT_KEYS,
  FROM_DOMAIN,
  SITE_NAME,
  departmentForInquiryType,
  inboxForDepartment,
  labelForDepartment,
  sanitizeHeaderValue,
} from '@/lib/email/config'
import { sendEmail } from '@/lib/email/send.server'

// Monitored mailbox that can actually receive mail. The @veritasglobaladvisory.org
// addresses have no MX record yet, so any reply sent there bounces.
const receivingInbox = () => process.env['REPLY_INBOX'] ?? 'ezrao652@gmail.com'

const fieldSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().max(5000),
})

const bodySchema = z.object({
  formType: z.enum(['contact', 'careers', 'talent', 'media']),
  department: z.enum(['general', 'business', 'research', 'careers', 'media']).optional(),
  inquiryType: z.string().trim().max(80).optional(),
  service: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  organization: z.string().trim().max(160).optional(),
  preferredContactMethod: z.string().trim().max(40).optional(),
  source: z.string().trim().max(60).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  consent: z.boolean().optional(),
  /** Hidden anti-spam field: must stay empty. */
  website: z.string().max(200).optional(),
  formTitle: z.string().trim().min(1).max(160),
  formSubtitle: z.string().trim().max(280).optional(),
  replyTo: z.string().trim().email().max(254).optional(),
  fields: z.array(fieldSchema).min(1).max(40),
  resumePath: z.string().trim().max(500).optional(),
  resumeName: z.string().trim().max(200).optional(),
})

type Body = z.infer<typeof bodySchema>

function resolveDepartmentKey(parsed: Body): string {
  if (parsed.formType === 'careers') return 'careers'
  if (parsed.formType === 'media') return 'media'
  if (parsed.formType === 'talent') return 'research'
  if (parsed.inquiryType) return departmentForInquiryType(parsed.inquiryType)
  const dept = parsed.department ?? 'general'
  return DEPARTMENT_KEYS.includes(dept) ? dept : 'general'
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

        let parsed: Body
        try {
          const raw = await request.json()
          parsed = bodySchema.parse(raw)
        } catch (err) {
          return Response.json(
            { error: 'Invalid submission', detail: err instanceof Error ? err.message : 'parse error' },
            { status: 400, headers: corsHeaders },
          )
        }

        // Honeypot: silently accept, store nothing.
        if (parsed.website && parsed.website.trim().length > 0) {
          return Response.json({ success: true }, { headers: corsHeaders })
        }

        const deptKey = resolveDepartmentKey(parsed)

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        // Configurable department addresses (admin settings), with hard fallback.
        const { data: settings } = await supabase
          .from('email_settings')
          .select('department_addresses, auto_reply_enabled, email_signature')
          .eq('id', 1)
          .maybeSingle()
        const overrides = (settings?.department_addresses ?? null) as Record<string, string> | null
        const recipient = inboxForDepartment(deptKey, overrides)
        const fromAddress = inboxForDepartment(deptKey, overrides)
        const fromLabel = labelForDepartment(deptKey)

        const template = TEMPLATES['form-notification']
        if (!template) {
          return Response.json({ error: 'Template missing' }, { status: 500, headers: corsHeaders })
        }

        // Rate limit: at most 3 submissions per email address in 10 minutes.
        if (parsed.replyTo) {
          const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
          const { count } = await supabase
            .from('form_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('sender_email', parsed.replyTo)
            .gte('created_at', since)
          if ((count ?? 0) >= 3) {
            return Response.json(
              { error: 'Too many submissions', detail: 'Please wait a few minutes before sending another inquiry.' },
              { status: 429, headers: corsHeaders },
            )
          }
        }

        // Load branding overrides for this template
        const { data: settingsRow } = await supabase
          .from('email_template_settings')
          .select('brand_color, header_text, intro_text, footer_text')
          .eq('template_name', 'form-notification')
          .maybeSingle()

        // If a resume was uploaded, sign a long-lived URL and append as a field
        const enrichedFields = [...parsed.fields]
        if (parsed.resumePath) {
          const { data: signed } = await supabase.storage
            .from('resumes')
            .createSignedUrl(parsed.resumePath, 60 * 60 * 24 * 30) // 30 days
          if (signed?.signedUrl) {
            enrichedFields.push({
              label: 'Resume',
              value: `${parsed.resumeName ?? 'Download'} - ${signed.signedUrl}`,
            })
          }
        }

        // Helper to find a field value by label (case-insensitive contains)
        const findField = (needle: string) =>
          parsed.fields.find((f) => f.label.toLowerCase().includes(needle))?.value ?? null
        const messageVal = findField('message') ?? findField('cover') ?? findField('summary') ?? null

        // Persist the inquiry FIRST. If storage fails we must not tell the visitor it worked.
        const { data: insertedSubmission, error: insertError } = await supabase
          .from('form_submissions')
          .insert({
            form_type: parsed.formType,
            department: deptKey,
            inquiry_type: parsed.inquiryType ?? null,
            service: parsed.service ?? null,
            preferred_contact_method: parsed.preferredContactMethod ?? null,
            priority: parsed.priority ?? 'normal',
            source:
              parsed.source ??
              (parsed.formType === 'careers'
                ? 'Career Application'
                : parsed.formType === 'media'
                  ? 'Media Request'
                  : 'Website Contact Form'),
            recipient_email: recipient,
            subject: parsed.formTitle,
            sender_name: findField('name'),
            sender_email: parsed.replyTo ?? findField('email'),
            sender_phone: parsed.phone ?? findField('phone'),
            sender_organization: parsed.organization ?? findField('organization') ?? findField('company'),
            sender_country: parsed.country ?? findField('country'),
            message: messageVal,
            fields: enrichedFields,
            status: 'new',
          })
          .select('id, reference_number')
          .maybeSingle()

        if (insertError || !insertedSubmission) {
          console.error('Failed to store inquiry', insertError?.message)
          return Response.json(
            { error: 'Could not save your inquiry', detail: 'Please try again shortly.' },
            { status: 503, headers: corsHeaders },
          )
        }

        const inquiryId = insertedSubmission.id as string
        const reference = (insertedSubmission.reference_number as string | null) ?? ''
        const notificationSubject = sanitizeHeaderValue(
          reference ? `New Veritas Global Advisory Inquiry #${reference}` : parsed.formTitle,
        )

        await supabase.from('inquiry_activity').insert({
          submission_id: inquiryId,
          event_type: 'received',
          detail: `Inquiry received via ${parsed.formType} form`,
          metadata: { department: deptKey, inquiry_type: parsed.inquiryType ?? null },
        })

        const dashboardUrl = `${(process.env['SITE_URL'] ?? 'https://www.veritasglobaladvisory.org').replace(/\/$/, '')}/admin?inquiry=${inquiryId}`

        const detailFields = [
          ...enrichedFields,
          ...(reference ? [{ label: 'Inquiry ID', value: reference }] : []),
          ...(parsed.preferredContactMethod
            ? [{ label: 'Preferred contact method', value: parsed.preferredContactMethod }]
            : []),
        ]

        const templateData = {
          formTitle: notificationSubject,
          formSubtitle: settingsRow?.intro_text?.trim() ? settingsRow.intro_text : parsed.formSubtitle,
          fields: detailFields,
          submittedAt: new Date().toISOString(),
          brandColor: settingsRow?.brand_color ?? '#b08838',
          headerText: settingsRow?.header_text ?? 'VERITAS GLOBAL ADVISORY',
          footerText: settingsRow?.footer_text ?? 'Submitted via the Veritas Global Advisory website.',
          dashboardUrl,
        }

        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const text = await render(element, { plainText: true })

        const messageId = crypto.randomUUID()

        // In-house reply link: the sender answers on our own site and the message
        // lands straight in the admin inbox thread, with no external mailbox needed.
        let publicReplyUrl = ''
        if (parsed.replyTo) {
          const replyToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
          const { error: linkErr } = await supabase.from('reply_links').insert({
            token: replyToken,
            submission_id: inquiryId,
            email: parsed.replyTo,
            name: findField('name'),
          })
          if (!linkErr) {
            const base = process.env['SITE_URL'] ?? 'https://www.veritasglobaladvisory.org'
            publicReplyUrl = `${base.replace(/\/$/, '')}/reply/${replyToken}`
          }
        }

        const logSend = async (
          status: string,
          errorMessage: string | undefined,
          templateName: string,
          recipientEmail: string,
          fromEmail: string,
          subject: string,
          providerMessageId?: string,
        ) => {
          await supabase.from('email_send_log').insert({
            message_id: providerMessageId ?? messageId,
            template_name: templateName,
            recipient_email: recipientEmail,
            status,
            error_message: errorMessage,
            metadata: { form_type: parsed.formType, department: deptKey, reference },
          })
          await supabase.from('email_logs').insert({
            inquiry_id: inquiryId,
            direction: 'outbound',
            from_address: fromEmail,
            to_address: recipientEmail,
            reply_to: parsed.replyTo ?? null,
            subject,
            provider_message_id: providerMessageId ?? messageId,
            status: status === 'sent' ? 'sent' : status === 'suppressed' ? 'failed' : 'failed',
            error_message: errorMessage ?? null,
            sent_at: status === 'sent' ? new Date().toISOString() : null,
          })
        }

        const notification = await sendEmail({
          to: recipient,
          fromLabel,
          fromEmail: fromAddress,
          subject: notificationSubject,
          html,
          text,
          replyTo: parsed.replyTo,
          label: `form-${parsed.formType}`,
          idempotencyKey: messageId,
        })
        await logSend(
          notification.status,
          notification.status === 'sent' ? undefined : notification.error,
          'form-notification',
          recipient,
          fromAddress,
          notificationSubject,
        )

        // Also deliver copies to real, monitored mailboxes. The @veritasglobaladvisory.org
        // addresses have no mail host yet, so notifications sent only there are never received.
        const adminMailboxList = (process.env['ADMIN_NOTIFY_EMAIL'] ?? 'Polungah@gmail.com, ezrao652@gmail.com')
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean)
        for (const adminMailbox of adminMailboxList) {
          if (adminMailbox.toLowerCase() === recipient.toLowerCase()) continue
          const copyMessageId = crypto.randomUUID()
          const copy = await sendEmail({
            to: adminMailbox,
            fromLabel,
            fromEmail: fromAddress,
            subject: notificationSubject,
            html,
            text,
            replyTo: parsed.replyTo,
            label: `form-${parsed.formType}-admin-copy`,
            idempotencyKey: copyMessageId,
          })
          await logSend(
            copy.status,
            copy.status === 'sent' ? undefined : copy.error,
            'form-notification-admin-copy',
            adminMailbox,
            fromAddress,
            notificationSubject,
            copyMessageId,
          )
        }

        // Automatic confirmation to the visitor
        const autoReplyEnabled = settings?.auto_reply_enabled ?? true
        if (parsed.replyTo && autoReplyEnabled) {
          const autoReplyTemplate = TEMPLATES['auto-reply']
          if (autoReplyTemplate) {
            const firstNameValue = findField('first name') ?? findField('name') ?? findField('full name') ?? ''
            const firstName = String(firstNameValue).trim().split(/\s+/)[0]

            const autoReplyData = {
              firstName,
              subject: 'We have received your inquiry',
              referenceNumber: reference,
              brandColor: settingsRow?.brand_color ?? '#b08838',
              headerText: settingsRow?.header_text ?? 'VERITAS GLOBAL ADVISORY',
              footerText: settings?.email_signature?.trim()
                ? settings.email_signature
                : (settingsRow?.footer_text ?? 'Veritas Global Advisory | veritasglobaladvisory.org'),
              fromEmail: 'info@veritasglobaladvisory.org',
              replyUrl: publicReplyUrl,
            }
            const autoReplyElement = React.createElement(autoReplyTemplate.component, autoReplyData)
            const autoReplyHtml = await render(autoReplyElement)
            const autoReplyText = await render(autoReplyElement, { plainText: true })
            const autoReplySubject = reference
              ? `We have received your inquiry | ${reference} | Veritas Global Advisory`
              : 'We have received your inquiry | Veritas Global Advisory'
            const autoReplyMessageId = crypto.randomUUID()

            const confirmation = await sendEmail({
              to: parsed.replyTo,
              fromLabel: SITE_NAME,
              fromEmail: `info@${FROM_DOMAIN}`,
              subject: autoReplySubject,
              html: autoReplyHtml,
              text: autoReplyText,
              replyTo: receivingInbox(),
              label: `auto-reply-${parsed.formType}`,
              idempotencyKey: autoReplyMessageId,
            })
            await logSend(
              confirmation.status,
              confirmation.status === 'sent' ? undefined : confirmation.error,
              'auto-reply',
              parsed.replyTo,
              `info@${FROM_DOMAIN}`,
              autoReplySubject,
              autoReplyMessageId,
            )
          }
        }

        await supabase
          .from('form_submissions')
          .update({ email_status: notification.status === 'sent' ? 'sent' : 'failed' })
          .eq('id', inquiryId)

        return Response.json({ success: true, reference }, { headers: corsHeaders })
      },
    },
  },
})
