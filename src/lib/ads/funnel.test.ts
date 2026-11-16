import { describe, it, expect } from 'vitest'
import { funnelRates, sumTotals } from './funnel'

describe('ads funnel', () => {
  it('computes rates', () => {
    const r = funnelRates({ impressions: 1000, clicks: 50, cost: 500, conversions: 5, value: 2000 })
    expect(r.ctr).toBe(0.05)
    expect(r.conversionRate).toBe(0.1)
    expect(r.cpc).toBe(10)
    expect(r.costPerConversion).toBe(100)
  })
  it('returns null instead of zero when there is no data', () => {
    const r = funnelRates(sumTotals([]))
    expect(r.ctr).toBeNull()
    expect(r.costPerConversion).toBeNull()
  })
})
