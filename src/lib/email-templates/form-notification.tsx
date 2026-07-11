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

interface FormField {
  label: string
  value: string
}

interface Props {
  formTitle?: string
  formSubtitle?: string
  fields?: FormField[]
  submittedAt?: string
  brandColor?: string
  headerText?: string
  footerText?: string
}

const Email = ({
  formTitle = 'New website inquiry',
  formSubtitle = 'A new submission has been received from veritasglobaladvisory.org.',
  fields = [],
  submittedAt,
  brandColor = '#b08838',
  headerText = 'VERITAS GLOBAL ADVISORY',
  footerText = 'Submitted via the Veritas Global Advisory website.',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{formTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={{ ...brandMark, color: brandColor }}>{headerText}</Text>
          <Heading style={h1}>{formTitle}</Heading>
          <Text style={lead}>{formSubtitle}</Text>
        </Section>

        <Hr style={hr} />

        <Section>
          {fields.map((f) => (
            <Section key={f.label} style={row}>
              <Text style={label}>{f.label}</Text>
              <Text style={value}>{f.value || '—'}</Text>
            </Section>
          ))}
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          {submittedAt ? `Submitted ${submittedAt}. ` : ''}{footerText}{' '}
          Reply directly to this thread to respond to the sender (where an email
          was provided).
        </Text>
      </Container>
    </Body>
  </Html>
)


export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data?.formTitle as string) || 'New website inquiry — Veritas Global Advisory',
  displayName: 'Form submission notification',
  previewData: {
    formTitle: 'New contact inquiry — General',
    formSubtitle: 'A visitor submitted the contact form.',
    fields: [
      { label: 'Name', value: 'Jane Doe' },
      { label: 'Organization', value: 'Acme Foundation' },
      { label: 'Email', value: 'jane@example.com' },
      { label: 'Country', value: 'United Kingdom' },
      { label: 'Subject', value: 'Partnership inquiry' },
      { label: 'Message', value: 'We would like to discuss a joint research program.' },
    ],
    submittedAt: new Date().toISOString(),
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
const header: React.CSSProperties = { paddingBottom: '8px' }
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
const lead: React.CSSProperties = {
  fontSize: '14px',
  color: '#4a5568',
  margin: 0,
  lineHeight: 1.55,
}
const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}
const row: React.CSSProperties = { margin: '0 0 14px' }
const label: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: '#6b7280',
  margin: '0 0 4px',
  textTransform: 'uppercase',
  fontWeight: 600,
}
const value: React.CSSProperties = {
  fontSize: '14px',
  color: '#0b1c3a',
  margin: 0,
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
}
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: 0,
  lineHeight: 1.55,
}
