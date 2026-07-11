import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { TEMPLATES } from '@/lib/email-templates/registry'

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc('has_role', { _user_id: ctx.userId, _role: 'admin' })
  if (!isAdmin) throw new Error('Forbidden')
}

export const listEmailTemplateSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context)
    const { data, error } = await context.supabase
      .from('email_template_settings')
      .select('*')
      .order('template_name')
    if (error) throw new Error(error.message)
    const known = Object.keys(TEMPLATES).map((name) => {
      const existing = (data ?? []).find((r: any) => r.template_name === name)
      return (
        existing ?? {
          template_name: name,
          brand_color: '#b08838',
          header_text: 'VERITAS GLOBAL ADVISORY',
          intro_text: '',
          signature: '',
          footer_text: '',
        }
      )
    })
    return { settings: known }
  })

export const upsertEmailTemplateSetting = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    template_name: string
    brand_color: string
    header_text: string
    intro_text: string
    signature: string
    footer_text: string
  }) =>
    z
      .object({
        template_name: z.string().trim().min(1).max(100),
        brand_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #b08838'),
        header_text: z.string().trim().max(120),
        intro_text: z.string().max(2000),
        signature: z.string().max(500),
        footer_text: z.string().max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context)
    if (!TEMPLATES[data.template_name]) throw new Error('Unknown template')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('email_template_settings')
      .upsert({ ...data, updated_by: context.userId }, { onConflict: 'template_name' })
    if (error) throw new Error(error.message)
    return { success: true }
  })

// Reply templates (snippets)
export const listReplyTemplates = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context)
    const { data, error } = await context.supabase
      .from('reply_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { templates: data ?? [] }
  })

const snippetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  department: z
    .enum(['general', 'business', 'research', 'careers', 'media'])
    .optional()
    .nullable(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
})

export const createReplyTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof snippetSchema>) => snippetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error, data: row } = await supabaseAdmin
      .from('reply_templates')
      .insert({ ...data, department: data.department ?? null, created_by: context.userId })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return { template: row }
  })

export const updateReplyTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof snippetSchema> & { id: string }) =>
    snippetSchema.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { id, ...rest } = data
    const { error } = await supabaseAdmin
      .from('reply_templates')
      .update({ ...rest, department: rest.department ?? null })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
  })

export const deleteReplyTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin.from('reply_templates').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { success: true }
  })
