import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import * as s from './brand-styles'

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
          {introText ? <Text style={s.muted}>{introText}</Text> : null}
          {bodyText.split(/\n{2,}/).map((para, i) => (
            <Text key={i} style={s.p}>{para}</Text>
          ))}
          {signature ? <Text style={s.signature}>{signature}</Text> : null}
          <Text style={{ ...s.muted, margin: '0 0 20px' }}>{fromEmail}</Text>
        </Section>
        <Section style={s.footerWrap}>
          <Text style={s.footer}>
            {fromLabel} · Miami, Florida · veritasglobaladvisory.org
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
  subject: (data: Record<string, any>) => (data?.subject as string) || 'A message from Veritas Global Advisory',
  displayName: 'Admin reply',
  previewData: {
    subject: 'Re: Partnership inquiry',
    bodyText: 'Thank you for reaching out.\n\nWe would be glad to schedule a call next week.',
    fromLabel: 'Veritas Global Advisory - Business',
    fromEmail: 'business@veritasglobaladvisory.org',
  },
} satisfies TemplateEntry
