import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'
import { EmailLayout } from './email-layout'

interface Props {
  firstName?: string
  subject?: string
  referenceNumber?: string
  brandColor?: string
  headerText?: string
  footerText?: string
  fromEmail?: string
}

const Email = ({
  firstName = '',
  subject = 'We have received your inquiry',
  referenceNumber = '',
  brandColor = s.GOLD,
  headerText = 'VERITAS GLOBAL ADVISORY',
  footerText = 'This is an automated confirmation of receipt.',
  fromEmail = 'info@veritasglobaladvisory.org',
}: Props) => (
  <EmailLayout title={subject} headerText={headerText} brandColor={brandColor} footerText={footerText}>
          <Text style={s.p}>Dear {firstName ? firstName.trim() : 'Sir or Madam'},</Text>
          <Text style={s.p}>
            Thank you for contacting Veritas Global Advisory. We have received your inquiry and the appropriate
            team will review it and respond shortly.
          </Text>
          {referenceNumber ? (
            <Section style={refBox}>
              <Text style={refLabel}>YOUR REFERENCE</Text>
              <Text style={refValue}>{referenceNumber}</Text>
            </Section>
          ) : null}
          <Text style={s.p}>If you have anything to add, simply reply to this email.</Text>
          <Text style={s.signature}>Veritas Global Advisory</Text>
          <Text style={{ ...s.muted, margin: 0 }}>{fromEmail}</Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data?.referenceNumber
      ? `We have received your inquiry | ${data.referenceNumber} | Veritas Global Advisory`
      : 'We have received your inquiry | Veritas Global Advisory',
  displayName: 'Inquiry confirmation (visitor)',
  previewData: { firstName: 'Jane', subject: 'We have received your inquiry', referenceNumber: 'VG-1001' },
} satisfies TemplateEntry

const refBox: React.CSSProperties = {
  backgroundColor: s.SOFT,
  borderLeft: `3px solid ${s.GOLD}`,
  padding: '12px 16px',
  margin: '4px 0 18px',
}
const refLabel: React.CSSProperties = { ...s.footer, fontWeight: 700, margin: '0 0 2px' }
const refValue: React.CSSProperties = { ...s.p, fontSize: '18px', fontWeight: 700, color: s.NAVY, margin: 0 }
