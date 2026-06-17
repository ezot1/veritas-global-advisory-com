import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { useMemo, useState } from "react";
import insight1 from "@/assets/insight-1.jpg";
import insight2 from "@/assets/insight-2.jpg";
import insight3 from "@/assets/insight-3.jpg";
import insight4 from "@/assets/insight-4.jpg";
import { Search } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Global Insights — Veritas Global Advisory" },
      { name: "description", content: "Research, intelligence briefings, and analysis from Veritas Global Advisory across global affairs, governance, business, and regional studies." },
    ],
  }),
  component: InsightsPage,
});

const categories = ["All", "Global Affairs", "Politics & Governance", "Business & Investment", "Africa Watch", "Asia Focus", "Europe & Eurasia", "Americas Briefing", "Middle East Insights"];
const regions = ["All Regions", "Africa", "Asia-Pacific", "Europe", "Middle East", "Americas"];

const articles = [
  { img: insight1, tag: "Global Affairs", region: "Europe", title: "The New Multipolar Order: Strategic Implications for 2026", author: "Dr. A. Hassan", date: "Mar 12, 2026" },
  { img: insight2, tag: "Business & Investment", region: "Asia-Pacific", title: "Capital Flows Realign: Emerging Markets in Focus", author: "M. Chen", date: "Mar 8, 2026" },
  { img: insight3, tag: "Politics & Governance", region: "Europe", title: "Election Cycles and Regulatory Risk in Europe", author: "L. Petrov", date: "Mar 4, 2026" },
  { img: insight4, tag: "Middle East Insights", region: "Middle East", title: "Energy Transition and Geopolitics in the Gulf", author: "S. Al-Mansoori", date: "Feb 28, 2026" },
  { img: insight1, tag: "Africa Watch", region: "Africa", title: "Sahel Security Outlook: Drivers and Trajectories", author: "K. Okafor", date: "Feb 22, 2026" },
  { img: insight2, tag: "Americas Briefing", region: "Americas", title: "US-LatAm Nearshoring: Industrial Strategy Shifts", author: "R. Mendez", date: "Feb 18, 2026" },
];

function InsightsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [reg, setReg] = useState("All Regions");

  const filtered = useMemo(() => articles.filter((a) =>
    (cat === "All" || a.tag === cat) &&
    (reg === "All Regions" || a.region === reg) &&
    (q === "" || a.title.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat, reg]);

  return (
    <>
      <PageHeader eyebrow="Global Insights" title="Intelligence, analysis, and strategic foresight."
        intro="Featured reports, country studies, and briefings from our analysts and senior fellows." />

      <Section>
        {/* Search + filters */}
        <div className="card-elevated p-6 mb-12 grid lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search insights, reports, regions..."
              className="w-full h-12 pl-11 pr-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]"
            />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-12 px-4 border border-border bg-background text-sm">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={reg} onChange={(e) => setReg(e.target.value)} className="h-12 px-4 border border-border bg-background text-sm">
            {regions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((a) => (
            <Link key={a.title} to="/insights" className="card-elevated block group">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={a.img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-[var(--gold)] font-semibold">{a.tag}</span>
                  <span>·</span><span>{a.region}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-[var(--navy-deep)]">{a.title}</h3>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.author}</span><span>{a.date}</span>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">No insights match your filters.</div>
          )}
        </div>
      </Section>
    </>
  );
}
