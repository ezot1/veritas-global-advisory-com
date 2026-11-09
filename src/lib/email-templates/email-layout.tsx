import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import * as s from './brand-styles'

export function EmailLayout({ title, headerText, brandColor, preview, footerText, children }: {
  title: string
  headerText: string
  brandColor: string
  preview?: string
  footerText?: string
  children: React.ReactNode
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview || title}</Preview>
      <Body style={s.main}>
        <Container style={s.card}>
          <Section style={s.band}><Text style={s.bandText(brandColor)}>{headerText}</Text></Section>
          <Section style={s.goldRule(brandColor)}>&nbsp;</Section>
          <Section style={s.content}>
            <Heading style={s.h1}>{title}</Heading>
            {children}
          </Section>
          <Section style={s.footerWrap}>
            <Text style={{ ...s.footer, fontWeight: 700, color: s.NAVY }}>Veritas Global Advisory</Text>
            <Text style={s.footer}>Miami, Florida</Text>
            {footerText ? <Text style={{ ...s.footer, marginTop: '8px' }}>{footerText}</Text> : null}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}