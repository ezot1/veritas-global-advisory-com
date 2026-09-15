/**
 * Single configuration layer for outbound email and inquiry routing.
 * Swapping email providers means changing the send adapter only - no feature
 * code imports a provider SDK directly.
 */

export const SITE_NAME = 'Veritas Global Advisory'
export const SITE_URL = 'https://www.veritasglobaladvisory.org'

/** Verified delegated sending subdomain. Never the root domain. */
export const SENDER_DOMAIN = 'notify.veritasglobaladvisory.org'
/** Domain shown in the From: header. */
export const FROM_DOMAIN = 'veritasglobaladvisory.org'

export type DepartmentKey = 'general' | 'business' | 'research' | 'careers' | 'media'

export const DEPARTMENT_KEYS: DepartmentKey[] = ['general', 'business', 'research', 'careers', 'media']

export const DEPARTMENT_INBOXES: Record<DepartmentKey, string> = {
  general: 'info@veritasglobaladvisory.org',
  business: 'business@veritasglobaladvisory.org',
  research: 'research@veritasglobaladvisory.org',
  careers: 'careers@veritasglobaladvisory.org',
  media: 'media@veritasglobaladvisory.org',
}

/** Fallback address that can never be removed in admin settings. */
export const FALLBACK_INBOX = DEPARTMENT_INBOXES.general

export const DEPARTMENT_LABELS: Record<DepartmentKey, string> = {
  general: 'Veritas Global Advisory - General',
  business: 'Veritas Global Advisory - Business',
  research: 'Veritas Global Advisory - Research',
  careers: 'Veritas Global Advisory - Careers',
  media: 'Veritas Global Advisory - Media',
}

/** Public inquiry types offered on the contact form. */
export const INQUIRY_TYPES = [
  'General Inquiry',
  'Business Consulting',
  'Public Policy & Governance',
  'Political Risk Analysis',
  'Security & Risk Advisory',
  'Human Rights & Social Impact',
  'Research & Analysis',
  'Careers',
  'Media',
] as const

export type InquiryType = (typeof INQUIRY_TYPES)[number]

/** Inquiry type -> internal department. Anything unknown falls back to general. */
const INQUIRY_TYPE_ROUTING: Record<string, DepartmentKey> = {
  'General Inquiry': 'general',
  'Business Consulting': 'business',
  'Public Policy & Governance': 'research',
  'Political Risk Analysis': 'research',
  'Security & Risk Advisory': 'business',
  'Human Rights & Social Impact': 'research',
  'Research & Analysis': 'research',
  Careers: 'careers',
  Media: 'media',
}

export function departmentForInquiryType(inquiryType?: string | null): DepartmentKey {
  if (!inquiryType) return 'general'
  return INQUIRY_TYPE_ROUTING[inquiryType] ?? 'general'
}

export function inboxForDepartment(
  department: string | null | undefined,
  overrides?: Record<string, string> | null,
): string {
  const key = (department ?? 'general') as DepartmentKey
  const override = overrides?.[key]
  if (override && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(override)) return override
  return DEPARTMENT_INBOXES[key] ?? FALLBACK_INBOX
}

export function labelForDepartment(department: string | null | undefined): string {
  const key = (department ?? 'general') as DepartmentKey
  return DEPARTMENT_LABELS[key] ?? SITE_NAME
}

/** Services offered, used by the contact form's "service of interest" field. */
export const SERVICES = [
  'International Business Consulting',
  'Public Policy & Governance',
  'Political Risk Analysis',
  'Security & Risk Advisory',
  'Human Rights & Social Impact',
  'Research & Analysis',
  'Other',
] as const

export const PREFERRED_CONTACT_METHODS = ['Email', 'Phone', 'Video call'] as const

export const INQUIRY_STATUSES = [
  'new',
  'in_review',
  'assigned',
  'waiting_client',
  'responded',
  'closed',
  'spam',
] as const

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_review: 'In Review',
  assigned: 'Assigned',
  waiting_client: 'Waiting for Client',
  responded: 'Responded',
  closed: 'Closed',
  spam: 'Spam',
  trash: 'Trash',
  replied: 'Responded',
}

export const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

export const SOURCES = ['Website Contact Form', 'Career Application', 'Media Request', 'Other'] as const

/** Attachment rules shared by the browser and the server. */
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg']
export const ALLOWED_ATTACHMENT_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

/** Strips CR/LF so user input can never inject extra email headers. */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}
