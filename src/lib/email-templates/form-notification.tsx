import React from 'react'
import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'

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
  dashboardUrl?: string
}

const Email = ({
  formTitle = 'New website inquiry',
  formSubtitle = 'A new submission has been received from veritasglobaladvisory.org.',
  fields = [],
  submittedAt,
  brandColor = s.GOLD,
  headerText = 'VERITAS GLOBAL ADVISORY',
  footerText = 'Submitted via the Veritas Global Advisory website.',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{formTitle}</Preview>
    <Body style={s.main}>
      <Container style={s.card}>
        <Section style={s.band}>
          <Text style={s.bandText(brandColor)}>{headerText}</Text>
        </Section>
        <Section style={s.goldRule(brandColor)}>&nbsp;</Section>
        <Section style={s.content}>
          <Heading style={s.h1}>{formTitle}</Heading>
          <Text style={s.muted}>{formSubtitle}</Text>
          <Section style={table}>
            {fields.map((f, i) => (
              <Row key={f.label} style={{ backgroundColor: i % 2 ? '#ffffff' : '#f8f9fb' }}>
                <Column style={labelCell}>{f.label}</Column>
                <Column style={valueCell}>{f.value || '-'}</Column>
              </Row>
            ))}
          </Section>
        </Section>
        <Section style={s.footerWrap}>
          <Text style={s.footer}>
            {submittedAt ? `Submitted ${new Date(submittedAt).toUTCString()}. ` : ''}
            {footerText} Reply directly to respond to the sender where an email was provided.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data?.formTitle as string) || 'New website inquiry - Veritas Global Advisory',
  displayName: 'Form submission notification',
  previewData: {
    formTitle: 'New contact inquiry - General',
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

const table: React.CSSProperties = { border: '1px solid #e3e6eb', borderRadius: '4px', margin: '8px 0 24px' }
const labelCell: React.CSSProperties = {
  ...s.footer,
  width: '32%',
  padding: '10px 14px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 700,
  verticalAlign: 'top',
}
const valueCell: React.CSSProperties = { ...s.p, fontSize: '14px', margin: 0, padding: '10px 14px', verticalAlign: 'top' }
