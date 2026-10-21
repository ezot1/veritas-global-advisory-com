import { DEPARTMENT_INBOXES, type DepartmentKey } from '@/lib/email/config'

export function mailboxDepartment(recipients: string): DepartmentKey {
  const addresses: string[] = recipients.toLowerCase().match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []
  for (const [department, address] of Object.entries(DEPARTMENT_INBOXES)) {
    if (addresses.includes(address)) return department as DepartmentKey
  }
  return 'general'
}

export function mailboxReference(subject: string): string | null {
  return subject.match(/\bVG-\d+\b/i)?.[0].toUpperCase() ?? null
}

export function parseMailboxBatch<T>(raw: string, contentType: string): T[] {
  const boundary = contentType.match(/boundary="?([^";]+)"?/i)?.[1]
  if (!/^multipart\/mixed\b/i.test(contentType) || !boundary) throw new Error('Invalid mailbox batch response')
  const entries: T[] = []
  for (const part of raw.split(`--${boundary}`).slice(1)) {
    if (part.trim() === '--' || !part.trim()) continue
    const envelopeEnd = part.indexOf('\r\n\r\n')
    const response = part.slice(envelopeEnd + 4)
    const status = response.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})/)
    if (!status || Number(status[1]) < 200 || Number(status[1]) >= 300) {
      throw new Error(`Mailbox message read failed [${status?.[1] ?? 'invalid response'}]: ${response}`)
    }
    const bodyStart = response.indexOf('\r\n\r\n')
    if (bodyStart < 0) throw new Error('Missing mailbox message body')
    entries.push(JSON.parse(response.slice(bodyStart + 4).trim()) as T)
  }
  return entries
}