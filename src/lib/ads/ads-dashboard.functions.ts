import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const GATEWAY = 'https://connector-gateway.lovable.dev/google_ads/v25'

type Row = {
  campaign?: { id?: string; name?: string; status?: string; advertisingChannelType?: string }
  segments?: { date?: string }
  customer?: { currencyCode?: string; descriptiveName?: string; timeZone?: string }
  metrics?: { impressions?: string; clicks?: string; costMicros?: string; conversions?: number; conversionsValue?: number }
}

async function gaql(query: string): Promise<Row[]> {
  const lovableKey = process.env['LOVABLE_API_KEY']
  const connKey = process.env['GOOGLE_ADS_API_KEY']
  const customerId = process.env['GOOGLE_ADS_CUSTOMER_ID']
  if (!lovableKey || !connKey || !customerId) throw new Error('Google Ads is not connected to this project')
  const out: Row[] = []
  let pageToken: string | undefined
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${GATEWAY}/customers/${encodeURIComponent(customerId)}/googleAds:search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': connKey },
      body: JSON.stringify({ query, ...(pageToken ? { pageToken } : {}) }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`Google Ads report failed [${res.status}]: ${body}`)
      throw new Error(`Google Ads report failed [${res.status}]`)
    }
    const page = (await res.json()) as { results?: Row[]; nextPageToken?: string }
    out.push(...(page.results ?? []))
    pageToken = page.nextPageToken
    if (!pageToken) break
  }
  return out
}

const RANGES = { LAST_7_DAYS: 7, LAST_14_DAYS: 14, LAST_30_DAYS: 30 } as const

export const getAdsDashboard = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ range: z.enum(['LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS']) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' })
    if (!isAdmin) throw new Error('Forbidden')
    const m = 'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value'
    const [account, campaigns, daily] = await Promise.all([
      gaql('SELECT customer.currency_code, customer.descriptive_name, customer.time_zone FROM customer'),
      gaql(`SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, ${m} FROM campaign WHERE segments.date DURING ${data.range} AND campaign.status != 'REMOVED'`),
      gaql(`SELECT segments.date, ${m} FROM customer WHERE segments.date DURING ${data.range}`),
    ])
    const num = (v: unknown) => Number(v ?? 0) || 0
    const metrics = (r: Row) => ({
      impressions: num(r.metrics?.impressions),
      clicks: num(r.metrics?.clicks),
      cost: num(r.metrics?.costMicros) / 1_000_000,
      conversions: num(r.metrics?.conversions),
      value: num(r.metrics?.conversionsValue),
    })
    // Also list campaigns with no activity in the window
    const allCampaigns = await gaql(`SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign WHERE campaign.status != 'REMOVED'`)
    const byId = new Map(campaigns.map((r) => [r.campaign?.id, r]))
    return {
      days: RANGES[data.range],
      account: {
        name: account[0]?.customer?.descriptiveName ?? 'Google Ads',
        currency: account[0]?.customer?.currencyCode ?? '',
        timeZone: account[0]?.customer?.timeZone ?? '',
      },
      campaigns: allCampaigns.map((c) => {
        const r = byId.get(c.campaign?.id)
        return {
          id: c.campaign?.id ?? '',
          name: c.campaign?.name ?? 'Untitled',
          status: c.campaign?.status ?? '',
          type: c.campaign?.advertisingChannelType ?? '',
          ...metrics(r ?? {}),
        }
      }),
      daily: daily
        .map((r) => ({ date: r.segments?.date ?? '', ...metrics(r) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      fetchedAt: new Date().toISOString(),
    }
  })
