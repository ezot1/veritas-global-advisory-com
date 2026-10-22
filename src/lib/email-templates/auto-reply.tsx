import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'

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
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject}</Preview>
    <Body style={s.main}>
      <Container style={s.card}>
        <Section style={s.band}>
          <Text style={s.bandText(brandColor)}>{headerText}</Text>
        </Section>
        <Section style={s.goldRule(brandColor)}>&nbsp;</Section>
        <Section style={s.content}>
          <Heading style={s.h1}>{subject}</Heading>
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
          <Text style={{ ...s.muted, margin: '0 0 20px' }}>{fromEmail}</Text>
        </Section>
        <Section style={s.footerWrap}>
          <Text style={s.footer}>
            Veritas Global Advisory · Miami, Florida · veritasglobaladvisory.org
            <br />
            {footerText}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
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
  backgroundColor: '#f7f3ea',
  borderLeft: `3px solid ${s.GOLD}`,
  padding: '12px 16px',
  margin: '4px 0 18px',
}
const refLabel: React.CSSProperties = { ...s.footer, letterSpacing: '0.18em', fontWeight: 700, margin: '0 0 2px' }
const refValue: React.CSSProperties = { ...s.p, fontSize: '18px', fontWeight: 700, color: s.NAVY, margin: 0 }
