import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  subject?: string
  bodyText?: string
  fromLabel?: string
  fromEmail?: string
}

const Email = ({
  subject = 'A message from Veritas Global Advisory',
  bodyText = '',
  fromLabel = 'Veritas Global Advisory',
  fromEmail = 'info@veritasglobaladvisory.org',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={brandMark}>VERITAS GLOBAL ADVISORY</Text>
          <Heading style={h1}>{subject}</Heading>
        </Section>
        <Hr style={hr} />
        <Section>
          {bodyText.split(/\n{2,}/).map((para, i) => (
            <Text key={i} style={p}>{para}</Text>
          ))}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          {fromLabel}<br />
          Reply directly to this email to reach us at {fromEmail}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => (data?.subject as string) || 'A message from Veritas Global Advisory',
  displayName: 'Admin reply',
  previewData: {
    subject: 'Re: Partnership inquiry',
    bodyText: 'Thank you for reaching out.\n\nWe would be glad to schedule a call next week.',
    fromLabel: 'Veritas Global Advisory — Business',
    fromEmail: 'business@veritasglobaladvisory.org',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: '#0b1c3a',
}
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', padding: '32px 28px' }
const brandMark: React.CSSProperties = {
  fontSize: '11px', letterSpacing: '0.22em', color: '#b08838', margin: '0 0 16px', fontWeight: 600,
}
const h1: React.CSSProperties = { fontSize: '22px', fontWeight: 600, color: '#0b1c3a', margin: '0 0 8px', lineHeight: 1.3 }
const hr: React.CSSProperties = { borderColor: '#e5e7eb', margin: '20px 0' }
const p: React.CSSProperties = { fontSize: '15px', color: '#0b1c3a', margin: '0 0 14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.55 }
