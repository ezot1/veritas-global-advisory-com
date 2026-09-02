import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  firstName?: string
  subject?: string
  brandColor?: string
  headerText?: string
  footerText?: string
  fromEmail?: string
}

const Email = ({
  firstName = '',
  subject = 'We have received your message',
  brandColor = '#b08838',
  headerText = 'VERITAS GLOBAL ADVISORY',
  footerText = 'This is an automated confirmation. Please do not reply to this email.',
  fromEmail = 'info@veritasglobaladvisory.org',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={{ ...brandMark, color: brandColor }}>{headerText}</Text>
          <Heading style={h1}>{subject}</Heading>
        </Section>
        <Hr style={hr} />
        <Section>
          <Text style={greeting}>
            Greetings {firstName ? firstName.trim() : 'there'},
          </Text>
          <Text style={p}>
            We have received your email. We will be in touch in the shortest time possible.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Veritas Global Advisory<br />
          {footerText}{' '}
          {fromEmail && <>Reach us at {fromEmail}.</>}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: () => 'We have received your message - Veritas Global Advisory',
  displayName: 'Applicant auto-reply',
  previewData: {
    firstName: 'Jane',
    subject: 'We have received your message',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: '#0b1c3a',
}
const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px 28px',
}
const brandMark: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.22em',
  margin: '0 0 16px',
  fontWeight: 600,
}
const h1: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 600,
  color: '#0b1c3a',
  margin: '0 0 8px',
  lineHeight: 1.3,
}
const hr: React.CSSProperties = { borderColor: '#e5e7eb', margin: '24px 0' }
const greeting: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#0b1c3a',
  margin: '0 0 14px',
  lineHeight: 1.5,
}
const p: React.CSSProperties = {
  fontSize: '15px',
  color: '#0b1c3a',
  margin: '0 0 14px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
}
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: 0,
  lineHeight: 1.55,
}
