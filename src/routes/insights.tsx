import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { articles as staticArticles } from "@/data/articles";
import { listGeneratedArticles } from "@/lib/articles.functions";

const PAGE_SIZE = 18;

export const Route = createFileRoute("/insights")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Math.max(1, Number(search.page) || 1),
  }),

  loader: async () => {
    const generated = await listGeneratedArticles().catch(() => []);
    return { generated };
  },
  head: () => ({
    meta: [
      { title: "Global Research | Veritas Global Advisory" },
      { name: "description", content: "Research briefings and analysis from Veritas Global Advisory across global affairs, governance, business, and regional studies." },
      { property: "og:title", content: "Global Research - Veritas Global Advisory" },
      { property: "og:description", content: "Featured reports, country studies, and briefings from our editorial desks and network of senior fellows." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/insights" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/insights" }],
  }),
  component: InsightsPage,
});

const categories = ["All", "Global Affairs", "Education & Soft Power", "Politics & Governance", "Business & Investment", "Africa Watch", "Asia Focus", "Europe & Eurasia", "Americas Briefing", "Middle East Insights"];
const regions = ["All Regions", "Africa", "Asia-Pacific", "Europe", "Middle East", "Americas"];

function InsightsPage() {
  const { generated } = Route.useLoaderData();
  const articles = useMemo(
    () =>
      [...generated, ...staticArticles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [generated]
  );
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [reg, setReg] = useState("All Regions");

  const filtered = useMemo(() => articles.filter((a) =>
    (cat === "All" || a.tag === cat) &&
    (reg === "All Regions" || a.region === reg) &&
    (q === "" || a.title.toLowerCase().includes(q.toLowerCase()))
  ), [articles, q, cat, reg]);

  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: "/insights" });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [filtered, current]
  );

  const goTo = (p: number) => {
    navigate({ search: { page: p }, resetScroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to the first page whenever filters change.
  useEffect(() => {
    if (page !== 1) navigate({ search: { page: 1 }, resetScroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, reg]);


  return (
    <>
      <PageHeader eyebrow="Global Research" title="Research, analysis, and strategic foresight."
        intro="Featured reports, country studies, and briefings from our analysts and senior fellows." />

      <Section>
        <div className="card-elevated p-6 mb-12 grid lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search research, reports, regions..."
              aria-label="Search research and briefings"
              className="w-full h-12 pl-11 pr-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]"
            />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category" className="h-12 px-4 border border-border bg-background text-sm">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={reg} onChange={(e) => setReg(e.target.value)} aria-label="Filter by region" className="h-12 px-4 border border-border bg-background text-sm">
            {regions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((a) => (
            <Link key={a.slug} to="/insights/$slug" params={{ slug: a.slug }} className="card-elevated block group">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={a.img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-[var(--gold)] font-semibold">{a.tag}</span>
                  <span>·</span><span>{a.region}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-[var(--navy-deep)] line-clamp-3">{a.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{a.summary}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.author}</span><span>{a.date}</span>
                </div>
                <span className="link-arrow mt-5">Read briefing</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">No research matches your filters.</div>
          )}
        </div>
      </Section>
      <ImageStrip start={0} eyebrow="Editorial Desks" title="Where our research is produced." />
    </>
  );
}
