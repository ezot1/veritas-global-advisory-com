import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const REGION_BY_COUNTRY: Record<string, string> = {}
const REGION_MAP: Record<string, string[]> = {
  Africa: [
    'nigeria', 'ghana', 'kenya', 'south africa', 'egypt', 'ethiopia', 'tanzania', 'uganda', 'rwanda',
    'senegal', 'morocco', 'algeria', 'tunisia', 'zambia', 'zimbabwe', 'botswana', 'namibia', 'cameroon',
    'ivory coast', "cote d'ivoire", 'congo', 'drc', 'democratic republic of the congo', 'mozambique',
    'angola', 'sudan', 'somalia', 'malawi', 'mali', 'burkina faso', 'benin', 'togo', 'liberia', 'sierra leone',
  ],
  'Asia-Pacific': [
    'china', 'japan', 'india', 'south korea', 'korea', 'singapore', 'malaysia', 'indonesia', 'thailand',
    'vietnam', 'philippines', 'australia', 'new zealand', 'pakistan', 'bangladesh', 'sri lanka', 'nepal',
    'taiwan', 'hong kong', 'cambodia', 'myanmar', 'mongolia', 'fiji', 'papua new guinea',
  ],
  Europe: [
    'united kingdom', 'uk', 'england', 'scotland', 'wales', 'ireland', 'france', 'germany', 'spain', 'portugal',
    'italy', 'netherlands', 'belgium', 'switzerland', 'austria', 'sweden', 'norway', 'denmark', 'finland',
    'poland', 'czech republic', 'czechia', 'hungary', 'romania', 'bulgaria', 'greece', 'ukraine', 'russia',
    'serbia', 'croatia', 'slovakia', 'slovenia', 'estonia', 'latvia', 'lithuania', 'iceland', 'luxembourg',
  ],
  'Middle East': [
    'united arab emirates', 'uae', 'saudi arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'israel', 'jordan',
    'lebanon', 'iraq', 'iran', 'turkey', 'syria', 'yemen', 'palestine',
  ],
  Americas: [
    'united states', 'usa', 'us', 'u.s.', 'u.s.a.', 'america', 'canada', 'mexico', 'brazil', 'argentina',
    'chile', 'colombia', 'peru', 'venezuela', 'ecuador', 'bolivia', 'uruguay', 'paraguay', 'panama',
    'costa rica', 'guatemala', 'jamaica', 'trinidad and tobago', 'cuba', 'dominican republic', 'haiti',
  ],
}
for (const [region, countries] of Object.entries(REGION_MAP)) {
  for (const c of countries) REGION_BY_COUNTRY[c] = region
}

function regionFor(country: string | null): string {
  if (!country) return 'Unspecified'
  return REGION_BY_COUNTRY[country.trim().toLowerCase()] ?? 'Other'
}

export type ReplyTrackingContact = {
  submissionId: string
  name: string
  email: string
  country: string | null
  region: string
  formType: string
  department: string | null
  replyCount: number
  firstReplyHours: number | null
  avgReplyHours: number | null
  lastReplyAt: string | null
  topics: string[]
}

export const listReplyTracking = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')

    const { data: subs, error: subErr } = await supabase
      .from('form_submissions')
      .select('id, form_type, department, sender_name, sender_email, sender_country, subject, status')
      .order('created_at', { ascending: false })
      .limit(500)
    if (subErr) throw new Error(subErr.message)

    const ids = (subs ?? []).map((s) => s.id)
    if (ids.length === 0) return { contacts: [] as ReplyTrackingContact[] }

    const { data: msgs, error: msgErr } = await supabase
      .from('submission_messages')
      .select('submission_id, direction, subject, created_at')
      .in('submission_id', ids)
      .order('created_at', { ascending: true })
    if (msgErr) throw new Error(msgErr.message)

    const bySubmission = new Map<string, { direction: string; subject: string; created_at: string }[]>()
    for (const m of msgs ?? []) {
      const arr = bySubmission.get(m.submission_id) ?? []
      arr.push({ direction: m.direction, subject: m.subject, created_at: m.created_at })
      bySubmission.set(m.submission_id, arr)
    }

    const contacts: ReplyTrackingContact[] = []
    for (const s of subs ?? []) {
      const thread = bySubmission.get(s.id) ?? []
      const inbound = thread.filter((m) => m.direction === 'inbound')
      if (inbound.length === 0) continue

      const gaps: number[] = []
      let lastOutbound: number | null = null
      for (const m of thread) {
        const t = new Date(m.created_at).getTime()
        if (m.direction === 'outbound') lastOutbound = t
        else if (lastOutbound !== null) {
          gaps.push((t - lastOutbound) / 3_600_000)
          lastOutbound = null
        }
      }

      const topics = Array.from(
        new Set(inbound.map((m) => (m.subject || s.subject || '').replace(/^\s*(re|fwd)\s*:\s*/gi, '').trim()).filter(Boolean)),
      ).slice(0, 5)

      contacts.push({
        submissionId: s.id,
        name: s.sender_name ?? s.sender_email ?? 'Unknown',
        email: s.sender_email ?? '',
        country: s.sender_country,
        region: regionFor(s.sender_country),
        formType: s.form_type,
        department: s.department,
        replyCount: inbound.length,
        firstReplyHours: gaps.length > 0 ? Math.round(gaps[0]! * 10) / 10 : null,
        avgReplyHours: gaps.length > 0 ? Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 10) / 10 : null,
        lastReplyAt: inbound[inbound.length - 1]!.created_at,
        topics: topics.length > 0 ? topics : [s.subject],
      })
    }

    contacts.sort((a, b) => a.region.localeCompare(b.region) || (b.lastReplyAt ?? '').localeCompare(a.lastReplyAt ?? ''))
    return { contacts }
  })
