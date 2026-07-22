import type { ComponentType } from 'react'
import { template as formNotification } from './form-notification'
import { template as adminReply } from './admin-reply'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient - overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'form-notification': formNotification,
  'admin-reply': adminReply,
}
