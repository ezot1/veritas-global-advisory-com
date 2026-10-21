import { describe, expect, it } from 'vitest'
import { mailboxDepartment, mailboxReference, parseMailboxBatch } from './mailbox-utils'

describe('Google Workspace inbox intake', () => {
  it('routes info mail to general', () => {
    expect(mailboxDepartment('Veritas <info@veritasglobaladvisory.org>')).toBe('general')
  })
  it('routes business mail to business', () => {
    expect(mailboxDepartment('business@veritasglobaladvisory.org')).toBe('business')
  })
  it('routes careers mail to careers', () => {
    expect(mailboxDepartment('careers@veritasglobaladvisory.org')).toBe('careers')
  })
  it('matches a Veritas reference in a reply', () => {
    expect(mailboxReference('Re: [VG-1001] Collaboration')).toBe('VG-1001')
  })
  it('rejects failed batch entries instead of silently losing mail', () => {
    expect(() => parseMailboxBatch('--b\r\nContent-Type: application/http\r\n\r\nHTTP/1.1 403 Forbidden\r\n\r\n{}\r\n--b--', 'multipart/mixed; boundary=b')).toThrow('403')
  })
})