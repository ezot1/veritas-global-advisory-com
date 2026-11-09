import React from 'react'
import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'
import { EmailLayout } from './email-layout'

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
  <EmailLayout title={formTitle} headerText={headerText} brandColor={brandColor} preview={formSubtitle} footerText={`${submittedAt ? `Submitted ${new Date(submittedAt).toUTCString()}. ` : ''}${footerText} Reply directly to respond to the sender where an email was provided.`}>
          <Text style={s.muted}>{formSubtitle}</Text>
          <Section style={{ border: `1px solid ${s.BORDER}`, marginTop: '16px' }}>
            {fields.map((f, i) => (
              <Section key={`${f.label}-${i}`} style={s.field}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <Text style={s.fieldValue}>{f.value || '-'}</Text>
              </Section>
            ))}
          </Section>
  </EmailLayout>
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

