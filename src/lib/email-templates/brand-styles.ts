import type React from 'react'

// Shared Veritas email look: white card on soft grey, navy header band, gold rule.
export const NAVY = '#0b1c3a'
export const GOLD = '#b08838'

export const main: React.CSSProperties = {
  backgroundColor: '#f4f5f7',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: NAVY,
  margin: 0,
  padding: '24px 0',
}
export const card: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e3e6eb',
  borderRadius: '6px',
  overflow: 'hidden',
}
export const band: React.CSSProperties = { backgroundColor: NAVY, padding: '22px 32px' }
export const bandText = (color: string): React.CSSProperties => ({
  color,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  letterSpacing: '0.24em',
  fontWeight: 700,
  margin: 0,
})
export const goldRule = (color: string): React.CSSProperties => ({ height: '3px', backgroundColor: color, lineHeight: '3px', fontSize: '1px' })
export const content: React.CSSProperties = { padding: '28px 32px 8px' }
export const h1: React.CSSProperties = { fontSize: '21px', fontWeight: 600, color: NAVY, margin: '0 0 18px', lineHeight: 1.35 }
export const p: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '15px',
  color: '#1f2a3d',
  margin: '0 0 14px',
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
}
export const muted: React.CSSProperties = { ...p, color: '#5b6577', fontSize: '14px' }
export const signature: React.CSSProperties = { ...p, margin: '22px 0 4px', fontWeight: 600, color: NAVY }
export const footerWrap: React.CSSProperties = { padding: '18px 32px 24px', borderTop: '1px solid #eceef2', backgroundColor: '#fafbfc' }
export const footer: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  color: '#6b7280',
  margin: 0,
  lineHeight: 1.6,
}
