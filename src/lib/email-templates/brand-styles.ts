import type React from 'react'

// Email-safe equivalents of the site's navy/gold design tokens.
export const NAVY = '#0a2342'
export const GOLD = '#d4af37'
export const BORDER = '#e2e8f0'
export const SOFT = '#f8fafc'

export const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: NAVY,
  margin: 0,
  padding: '24px 12px',
}
export const card: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  width: '100%',
  border: `1px solid ${BORDER}`,
  borderRadius: '4px',
  overflow: 'hidden',
}
export const band: React.CSSProperties = { backgroundColor: NAVY, padding: '22px 24px' }
export const bandText = (color: string): React.CSSProperties => ({
  color,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  letterSpacing: 0,
  lineHeight: 1.6,
  fontWeight: 700,
  margin: 0,
})
export const goldRule = (color: string): React.CSSProperties => ({ height: '3px', backgroundColor: color, lineHeight: '3px', fontSize: '1px' })
export const content: React.CSSProperties = { padding: '28px 24px 24px' }
export const h1: React.CSSProperties = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '22px', fontWeight: 600, color: NAVY, margin: '0 0 20px', lineHeight: 1.4, overflowWrap: 'anywhere' }
export const p: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '15px',
  color: '#1f2a3d',
  margin: '0 0 14px',
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}
export const muted: React.CSSProperties = { ...p, color: '#5b6577', fontSize: '14px' }
export const signature: React.CSSProperties = { ...p, margin: '22px 0 4px', fontWeight: 600, color: NAVY }
export const footerWrap: React.CSSProperties = { padding: '18px 24px', borderTop: `1px solid ${BORDER}`, backgroundColor: SOFT }
export const footer: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  color: '#6b7280',
  margin: 0,
  lineHeight: 1.6,
  overflowWrap: 'anywhere',
}
export const field: React.CSSProperties = { borderBottom: `1px solid ${BORDER}`, padding: '12px 16px' }
export const fieldLabel: React.CSSProperties = { ...footer, fontWeight: 700, margin: '0 0 4px', color: NAVY }
export const fieldValue: React.CSSProperties = { ...p, fontSize: '14px', margin: 0 }
