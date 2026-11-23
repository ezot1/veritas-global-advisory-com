import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { LiftoffHero } from "@/components/site/LiftoffHero";
import { Reveal } from "@/components/site/Reveal";
import { listGeneratedArticles } from "@/lib/articles.functions";
import { articles as staticArticles } from "@/data/articles";
import { countPublishedBriefings } from "@/lib/publication-count";
import { LatestBriefing } from "@/components/site/LatestBriefing";
import {
  Briefcase, Landmark, Shield, Activity, Scale, Search,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veritas Global Advisory | Strategic Intelligence" },
      { name: "description", content: "International consulting and advisory firm delivering strategic intelligence, political risk, governance, and market-entry advisory worldwide." },
      { property: "og:title", content: "Veritas Global Advisory | Strategic Intelligence" },
      { property: "og:description", content: "Global insights, strategic solutions, and trusted expertise across five regional divisions." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/" }],
  }),
  loader: async ({ context }) => {
    void context;
    const generated = await listGeneratedArticles().catch(() => []);
    return { generated };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="container-x py-24">
      {error instanceof Error ? error.message : "Something went wrong."}
    </div>
  ),
  notFoundComponent: () => <div className="container-x py-24">Not found.</div>,
  component: Index,
});

const services = [
  { icon: Briefcase, title: "International Business Consulting", items: ["Market Entry Strategy", "Business Expansion Advisory", "Investment Facilitation", "Trade Advisory", "International Partnerships"] },
  { icon: Landmark, title: "Public Policy & Governance", items: ["Policy Analysis", "Governance Assessments", "Institutional Development", "Public Sector Reform", "Stakeholder Engagement"] },
  { icon: Activity, title: "Political Risk Analysis", items: ["Country Risk Reports", "Election Monitoring", "Political Economy Analysis", "Regulatory Forecasting", "Geopolitical Briefings"] },
  { icon: Shield, title: "Security & Risk Advisory", items: ["Regional Security Assessments", "Conflict Analysis", "Crisis Monitoring", "Security Environment Reporting", "Risk Management Support"] },
  { icon: Scale, title: "Human Rights & Social Impact", items: ["Human Rights Assessments", "Social Impact Evaluations", "Community Engagement", "ESG Advisory Support"] },
  { icon: Search, title: "Research & Analysis", items: ["Country Studies", "Due Diligence Research", "Strategic Reports", "Sector Analysis", "Trend Forecasting"] },
];

const regions = [
  { name: "Africa", experts: "10 experts" },
  { name: "Asia-Pacific", experts: "13 experts" },
  { name: "Europe", experts: "12 experts" },
  { name: "Middle East", experts: "8 experts" },
  { name: "Americas", experts: "9 experts" },
];

function Index() {
  const { generated } = Route.useLoaderData();
  const sorted = [...generated, ...staticArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latest = sorted[0];
  const insights = sorted.slice(1, 5);

  return (
    <>
      {/* HERO */}
      <LiftoffHero publicationCount={countPublishedBriefings(staticArticles, generated)} />

      {/* LATEST BRIEFING */}
      {latest ? <LatestBriefing article={latest} /> : null}


      {/* WHO WE ARE */}
      <Section eyebrow="Who We Are" title="An institution built for a complex, multipolar world.">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <Pillar title="Our Mission" body="To deliver high-quality consulting, research, strategic intelligence, and global advisory services that create value for clients worldwide." />
          <Pillar title="Our Vision" body="To become a globally trusted consulting and advisory institution connecting expertise, knowledge, and solutions across continents." />
          <div>
            <h3 className="display-3 mb-6">Core Values</h3>
            <ul className="space-y-3 text-foreground">
              {["Integrity", "Professionalism", "Evidence-Based Analysis", "Global Perspective", "Confidentiality", "Excellence", "Diversity & Inclusion"].map((v) => (
                <li key={v} className="flex items-start gap-3 border-b border-border pb-3">

                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* SERVICES */}
      <Section eyebrow="Practices" title="Six interconnected disciplines. One global perspective." intro="Our advisory practices bring together rigorous analysis, cross-regional expertise, and field experience to support decisions of consequence.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {services.map((s, idx) => (
            <div key={s.title}>
              <div className="bg-card p-9 h-full">
                <div className="flex items-start justify-between mb-8">
                  <span className="grid place-items-center h-10 w-10 border border-border text-[var(--navy-deep)]">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-semibold leading-snug mb-5 text-[var(--navy-deep)]">{s.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {s.items.map((i) => <li key={i} className="flex gap-2"><span className="text-[var(--gold)]">·</span>{i}</li>)}
                </ul>
                <Link to="/services" className="link-arrow mt-8">Explore</Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* GLOBAL COVERAGE */}
      <Section eyebrow="Global Coverage" title="Five regional divisions." className="bg-[var(--secondary)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 border-t border-border">
          {regions.map((r) => (
            <div key={r.name} className="py-6 pr-6 border-b border-border lg:border-b-0">
              <div className="text-lg font-semibold">{r.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{r.experts}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* INSIGHTS */}
      <Section eyebrow="Global Insights" title="Analysis and intelligence from our editorial desks." intro="Featured reports, regional briefings, and strategic foresight from our network of analysts.">
        <div className="grid lg:grid-cols-2 gap-10">
          {insights[0] ? <Reveal><FeaturedInsight item={insights[0]} /></Reveal> : null}
          <div className="grid sm:grid-cols-1 gap-6">
            {insights.slice(1).map((i, idx) => (
              <Reveal key={i.title} delay={0.1 + idx * 0.1}><InsightCard item={i} /></Reveal>
            ))}
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <Link to="/insights" className="btn-ghost !text-[var(--navy-deep)]">Browse all insights</Link>
        </div>
      </Section>

      {/* TALENT CTA */}
      <Section dark eyebrow="Global Talent Network" title="Join a network of analysts, scholars, and practitioners shaping global solutions." intro="Veritas continuously seeks highly qualified professionals from diverse disciplines and geographic regions.">
        <div className="grid md:grid-cols-3 gap-px bg-white/10">
          {["Policy Analysts", "Researchers", "Economists", "Security Analysts", "Legal Experts", "Business Consultants"].map((c, i) => (
            <Reveal key={c} delay={i * 0.07}>
              <div className="bg-[var(--navy-deep)] p-6">
                <div className="text-lg font-medium">{c}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <Link to="/talent" className="btn-primary !bg-[var(--gold)] !border-[var(--gold)] !text-[var(--navy-deep)] hover:!bg-white hover:!border-white">Apply to the Network</Link>
        </div>
      </Section>
    </>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
          <div>
            <h3 className="display-3 mb-5">{title}</h3>
      <p className="text-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function FeaturedInsight({ item }: { item: { slug: string; img: string; tag: string; title: string; date: string } }) {
  return (
    <Link to="/insights/$slug" params={{ slug: item.slug }} className="card-elevated block group">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={item.img} alt="" loading="lazy" className="w-full h-full object-cover " />
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-[var(--gold)] font-semibold">{item.tag}</span>
          <span>·</span>
          <span>{item.date}</span>
        </div>
        <h3 className="mt-5 text-2xl md:text-3xl font-semibold leading-tight text-[var(--navy-deep)]">{item.title}</h3>
        <span className="link-arrow mt-6">Read briefing</span>
      </div>
    </Link>
  );
}

function InsightCard({ item }: { item: { slug: string; img: string; tag: string; title: string; date: string } }) {
  return (
    <Link to="/insights/$slug" params={{ slug: item.slug }} className="card-elevated grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr]">
      <div className="overflow-hidden">
        <img src={item.img} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--gold)] font-semibold">{item.tag}</div>
        <h4 className="mt-3 text-base md:text-lg font-semibold leading-snug text-[var(--navy-deep)] line-clamp-3">{item.title}</h4>
        <div className="mt-3 text-xs text-muted-foreground">{item.date}</div>
      </div>
    </Link>
  );
}
