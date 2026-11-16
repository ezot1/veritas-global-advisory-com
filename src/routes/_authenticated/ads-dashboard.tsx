import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdsDashboard } from "@/lib/ads/ads-dashboard.functions";
import { funnelRates, sumTotals } from "@/lib/ads/funnel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/ads-dashboard")({
  head: () => ({
    meta: [
      { title: "Ads Dashboard | Veritas Global Advisory Admin" },
      { name: "description", content: "Private Google Ads performance from impression to conversion." },
      { property: "og:title", content: "Ads Dashboard | Veritas Global Advisory Admin" },
      { property: "og:description", content: "Private Google Ads performance from impression to conversion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdsDashboard,
});

type Range = "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS";
const RANGE_LABELS: Record<Range, string> = { LAST_7_DAYS: "7 days", LAST_14_DAYS: "14 days", LAST_30_DAYS: "30 days" };

function AdsDashboard() {
  const [range, setRange] = useState<Range>("LAST_30_DAYS");
  const fetchFn = useServerFn(getAdsDashboard);
  const q = useQuery({ queryKey: ["ads-dashboard", range], queryFn: () => fetchFn({ data: { range } }), staleTime: 5 * 60_000 });

  const cur = q.data?.account.currency ?? "";
  const money = (v: number | null) => (v == null ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD", maximumFractionDigits: 2 }).format(v));
  const int = (v: number) => new Intl.NumberFormat().format(Math.round(v));
  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(2)}%`);
  const totals = sumTotals(q.data?.daily ?? []);
  const rates = funnelRates(totals);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-navy-deep text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Private · Admin only</p>
            <h1 className="mt-2 text-3xl font-semibold">Ads Dashboard</h1>
            <p className="mt-1 text-sm opacity-80">{q.data ? `${q.data.account.name} · Google Ads · ${cur}` : "Google Ads"}</p>
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <Button key={r} size="sm" variant={r === range ? "secondary" : "ghost"} onClick={() => setRange(r)} className={r === range ? "" : "text-primary-foreground hover:bg-primary-foreground/10"}>
                Last {RANGE_LABELS[r]}
              </Button>
            ))}
            <Link to="/admin" className="ml-2 text-sm underline opacity-80">Back to inbox</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {q.isLoading && <p className="text-muted-foreground">Loading your ads results…</p>}
        {q.error && (
          <div className="rounded-lg border border-destructive/40 bg-card p-5 text-sm">
            <p className="font-medium text-destructive">Could not load your ads results.</p>
            <p className="mt-1 text-muted-foreground">{q.error.message === "Forbidden" ? "This page is only available to the site admin." : "Google Ads didn't respond. This is not the same as zero results — try again shortly."}</p>
          </div>
        )}

        {q.data && (
          <>
            {q.data.campaigns.length === 0 && (
              <div className="rounded-lg border border-gold/40 bg-card p-5 text-sm">
                <p className="font-medium">No campaigns yet</p>
                <p className="mt-1 text-muted-foreground">Your account has no campaigns, so there's nothing to show. Numbers will appear here automatically once a campaign starts running (billing must be set up in Google Ads first).</p>
              </div>
            )}

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Journey · last {RANGE_LABELS[range]}</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <Stage label="Impressions" hint="Times your ads were shown" value={int(totals.impressions)} />
                <Stage label="Clicks" hint="People who clicked through" value={int(totals.clicks)} rate={`${pct(rates.ctr)} click rate`} />
                <Stage label="Conversions" hint="Actions Google Ads recorded as results" value={totals.conversions.toFixed(totals.conversions % 1 ? 1 : 0)} rate={`${pct(rates.conversionRate)} of clicks`} />
                <Stage label="Spend" hint="Total cost in this period" value={money(totals.cost)} />
              </div>
              <div className="mt-3 grid gap-3 grid-cols-2 md:grid-cols-4">
                <Small label="Cost per click" value={money(rates.cpc)} />
                <Small label="Cost per 1,000 views" value={money(rates.cpm)} />
                <Small label="Cost per conversion" value={money(rates.costPerConversion)} />
                <Small label="Return on spend" value={rates.roas == null ? "—" : `${rates.roas.toFixed(2)}×`} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">"—" means there isn't enough data yet to calculate it.</p>
            </section>

            <section className="rounded-lg border bg-card p-5 shadow-card">
              <h2 className="font-semibold">Daily trend</h2>
              {q.data.daily.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No daily activity in this period.</p>
              ) : (
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={q.data.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Area yAxisId="l" type="monotone" dataKey="impressions" name="Impressions" stroke="var(--navy)" fill="var(--navy)" fillOpacity={0.12} />
                      <Area yAxisId="r" type="monotone" dataKey="clicks" name="Clicks" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-lg border bg-card shadow-card overflow-x-auto">
              <h2 className="p-5 pb-0 font-semibold">Campaigns</h2>
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b">
                    {["Campaign", "Status", "Impressions", "Clicks", "Click rate", "Conversions", "Spend", "Cost / conv."].map((h) => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {q.data.campaigns.length === 0 && <tr><td colSpan={8} className="px-5 py-6 text-center text-muted-foreground">No campaigns yet.</td></tr>}
                  {q.data.campaigns.map((c) => {
                    const r = funnelRates(c);
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-5 py-3 font-medium">{c.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{c.status.toLowerCase()}</td>
                        <td className="px-5 py-3">{int(c.impressions)}</td>
                        <td className="px-5 py-3">{int(c.clicks)}</td>
                        <td className="px-5 py-3">{pct(r.ctr)}</td>
                        <td className="px-5 py-3">{c.conversions.toFixed(1)}</td>
                        <td className="px-5 py-3">{money(c.cost)}</td>
                        <td className="px-5 py-3">{money(r.costPerConversion)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
            <p className="text-xs text-muted-foreground">Figures come live from Google Ads using its own attribution settings, in the account's time zone ({q.data.account.timeZone}). Conversions are what Google Ads recorded, not verified sales. Updated {new Date(q.data.fetchedAt).toLocaleString()}.</p>
          </>
        )}
      </main>
    </div>
  );
}

function Stage({ label, hint, value, rate }: { label: string; hint: string; value: string; rate?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-card">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-navy">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {rate && <p className="mt-2 text-xs font-medium text-gold">{rate}</p>}
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
