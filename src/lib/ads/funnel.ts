export type Totals = { impressions: number; clicks: number; cost: number; conversions: number; value: number }

const ratio = (a: number, b: number) => (b > 0 ? a / b : null)

/** Funnel rates; null means "not enough data", never zero. */
export function funnelRates(t: Totals) {
  return {
    ctr: ratio(t.clicks, t.impressions),
    conversionRate: ratio(t.conversions, t.clicks),
    cpc: ratio(t.cost, t.clicks),
    cpm: t.impressions > 0 ? (t.cost / t.impressions) * 1000 : null,
    costPerConversion: ratio(t.cost, t.conversions),
    roas: ratio(t.value, t.cost),
  }
}

export function sumTotals(rows: Totals[]): Totals {
  return rows.reduce(
    (a, r) => ({ impressions: a.impressions + r.impressions, clicks: a.clicks + r.clicks, cost: a.cost + r.cost, conversions: a.conversions + r.conversions, value: a.value + r.value }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0, value: 0 },
  )
}
