import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'
import { EmailLayout } from './email-layout'

interface Props {
  subject?: string
  bodyText?: string
  fromLabel?: string
  fromEmail?: string
  brandColor?: string
  headerText?: string
  introText?: string
  signature?: string
  footerText?: string
}

const Email = ({
  subject = 'A message from Veritas Global Advisory',
  bodyText = '',
  fromLabel = 'Veritas Global Advisory',
  fromEmail = 'info@veritasglobaladvisory.org',
  brandColor = s.GOLD,
  headerText = 'VERITAS GLOBAL ADVISORY',
  introText = '',
  signature = 'Veritas Global Advisory',
  footerText = 'Reply directly to this email to reach us.',
}: Props) => (
  <EmailLayout title={subject} headerText={headerText} brandColor={brandColor} preview={bodyText.trim().slice(0, 150) || subject} footerText={footerText}>
          {introText ? <Text style={s.muted}>{introText}</Text> : null}
          {bodyText.replace(/\r\n?/g, '\n').split(/\n[\t ]*\n+/).filter((para) => para.trim()).map((para, i) => (
            <Text key={i} style={s.p}>{para}</Text>
          ))}
          {signature ? <Text style={s.signature}>{signature}</Text> : null}
          {fromLabel !== signature ? <Text style={{ ...s.muted, margin: 0 }}>{fromLabel}</Text> : null}
          <Text style={{ ...s.muted, margin: 0 }}>{fromEmail}</Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => (data?.subject as string) || 'A message from Veritas Global Advisory',
  displayName: 'Admin reply',
  previewData: {
    subject: 'Re: Partnership inquiry',
    bodyText: 'Thank you for reaching out.\n\nWe would be glad to schedule a call next week.',
    fromLabel: 'Veritas Global Advisory - Business',
    fromEmail: 'business@veritasglobaladvisory.org',
  },
} satisfies TemplateEntry
