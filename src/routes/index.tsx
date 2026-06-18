import { createFileRoute, Link } from "@tanstack/react-router";
import heroWorld from "@/assets/hero-world.jpg";
import globeImg from "@/assets/globe.jpg";
import insight1 from "@/assets/insight-1.jpg";
import insight2 from "@/assets/insight-2.jpg";
import insight3 from "@/assets/insight-3.jpg";
import insight4 from "@/assets/insight-4.jpg";
import { Section } from "@/components/site/Section";
import { StatCounter } from "@/components/site/StatCounter";
import {
  Briefcase, Landmark, Shield, Activity, Scale, Search,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veritas Global Advisory | Navigating Complexity. Connecting Opportunities." },
      { name: "description", content: "International consulting, research, and advisory firm providing strategic intelligence, political risk assessment, governance advisory, and global talent solutions." },
      { property: "og:title", content: "Veritas Global Advisory" },
      { property: "og:description", content: "Global Insights. Strategic Solutions. Trusted Expertise." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Briefcase, title: "International Business Consulting", items: ["Market Entry Strategy", "Business Expansion Advisory", "Investment Facilitation", "Trade Advisory", "International Partnerships"] },
  { icon: Landmark, title: "Public Policy & Governance", items: ["Policy Analysis", "Governance Assessments", "Institutional Development", "Public Sector Reform", "Stakeholder Engagement"] },
  { icon: Activity, title: "Political Risk Analysis", items: ["Country Risk Reports", "Election Monitoring", "Political Economy Analysis", "Regulatory Forecasting", "Geopolitical Briefings"] },
  { icon: Shield, title: "Security & Risk Advisory", items: ["Regional Security Assessments", "Conflict Analysis", "Crisis Monitoring", "Security Environment Reporting", "Risk Management Support"] },
  { icon: Scale, title: "Human Rights & Social Impact", items: ["Human Rights Assessments", "Social Impact Evaluations", "Community Engagement", "ESG Advisory Support"] },
  { icon: Search, title: "Research & Intelligence", items: ["Country Studies", "Due Diligence Research", "Strategic Reports", "Sector Analysis", "Trend Forecasting"] },
];

const regions = [
  { name: "Africa", experts: "120+ experts", reports: "240 reports" },
  { name: "Asia-Pacific", experts: "150+ experts", reports: "310 reports" },
  { name: "Europe", experts: "90+ experts", reports: "220 reports" },
  { name: "Middle East", experts: "80+ experts", reports: "180 reports" },
  { name: "Americas", experts: "100+ experts", reports: "200 reports" },
];

const insights = [
  { img: insight1, tag: "Global Affairs", title: "The New Multipolar Order: Strategic Implications for 2026", date: "Mar 12, 2026", featured: true },
  { img: insight2, tag: "Business & Investment", title: "Capital Flows Realign: Emerging Markets in Focus", date: "Mar 8, 2026" },
  { img: insight3, tag: "Politics & Governance", title: "Election Cycles and Regulatory Risk in Europe", date: "Mar 4, 2026" },
  { img: insight4, tag: "Middle East Insights", title: "Energy Transition and Geopolitics in the Gulf", date: "Feb 28, 2026" },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
        <img
          src={heroWorld}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-deep)]/70 via-[var(--navy-deep)]/60 to-[var(--navy-deep)]" />
        <div className="container-x relative pt-32 pb-28 md:pt-44 md:pb-36">
          <div className="max-w-5xl">
            <span className="eyebrow !text-[var(--gold)]">Global Advisory · Research · Intelligence</span>
            <h1 className="display-1 mt-7 text-balance">
              Navigating Complexity.<br />
              Connecting Opportunities.<br />
              <span className="text-[var(--gold)]">Shaping Global Solutions.</span>
            </h1>
            <p className="mt-9 max-w-2xl text-lg md:text-xl text-white/80 leading-relaxed text-pretty">
              Veritas Global Advisory is an international consulting and advisory firm providing
              strategic intelligence, business consulting, governance analysis, political risk
              assessment, market-entry support, and global talent solutions across regions and sectors.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link to="/services" className="btn-primary !bg-[var(--gold)] !border-[var(--gold)] !text-[var(--navy-deep)] hover:!bg-white hover:!border-white">Explore Our Services</Link>
              <Link to="/talent" className="btn-ghost !text-white">Join Our Global Network</Link>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/15 border border-white/15">
            {[
              { v: "50+", l: "Countries Covered" },
              { v: "500+", l: "Experts Worldwide" },
              { v: "1,000+", l: "Research Publications" },
              { v: "5", l: "Regional Divisions" },
            ].map((s) => (
              <div key={s.l} className="bg-[var(--navy-deep)] p-8">
                <div className="text-4xl md:text-5xl font-semibold text-[var(--gold)] tracking-tight">{s.v}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <Section eyebrow="Who We Are" title="An institution built for a complex, multipolar world.">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <Pillar title="Our Mission" body="To deliver high-quality consulting, research, strategic intelligence, and global advisory services that create value for clients worldwide." />
          <Pillar title="Our Vision" body="To become a globally trusted consulting and advisory institution connecting expertise, knowledge, and solutions across continents." />
          <div>
            <div className="gold-rule mb-6" />
            <h3 className="display-3 mb-6">Core Values</h3>
            <ul className="space-y-3 text-foreground/85">
              {["Integrity", "Professionalism", "Evidence-Based Analysis", "Global Perspective", "Confidentiality", "Excellence", "Diversity & Inclusion"].map((v) => (
                <li key={v} className="flex items-start gap-3 border-b border-border pb-3">
                  <span className="text-[var(--gold)] mt-1">◆</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* STATS */}
      <section className="border-y border-border bg-[var(--secondary)]">
        <div className="container-x py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter value={50} suffix="+" label="Countries Covered" />
          <StatCounter value={500} suffix="+" label="Experts Worldwide" />
          <StatCounter value={1000} suffix="+" label="Research Publications" />
          <StatCounter value={5} label="Regional Divisions" />
        </div>
      </section>

      {/* SERVICES */}
      <Section eyebrow="Practices" title="Six interconnected disciplines. One global perspective." intro="Our advisory practices bring together rigorous analysis, cross-regional expertise, and field experience to support decisions of consequence.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {services.map((s) => (
            <div key={s.title} className="card-elevated p-9 group">
              <div className="flex items-start justify-between mb-8">
                <span className="grid place-items-center h-12 w-12 bg-[var(--navy-deep)] text-[var(--gold)]">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">0{services.indexOf(s) + 1}</span>
              </div>
              <h3 className="text-xl font-semibold leading-snug mb-5 text-[var(--navy-deep)]">{s.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => <li key={i} className="flex gap-2"><span className="text-[var(--gold)]">·</span>{i}</li>)}
              </ul>
              <Link to="/services" className="link-arrow mt-8">Explore</Link>
            </div>
          ))}
        </div>
      </Section>

      {/* GLOBAL COVERAGE */}
      <Section eyebrow="Global Coverage" title="Five regions. One integrated intelligence network." className="bg-[var(--secondary)]">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div className="relative aspect-square max-w-xl mx-auto w-full">
            <img src={globeImg} alt="Global coverage" loading="lazy" width={1024} height={1024} className="absolute inset-0 w-full h-full object-cover rounded-full animate-spin-slow" style={{ animation: "spin 120s linear infinite" }} />
            <div className="absolute inset-0 rounded-full ring-1 ring-[var(--gold)]/30" />
          </div>
          <div className="space-y-px bg-border">
            {regions.map((r) => (
              <div key={r.name} className="bg-card p-6 flex items-center justify-between group hover:bg-[var(--navy-deep)] hover:text-white transition-colors">
                <div>
                  <div className="text-lg font-semibold">{r.name}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground group-hover:text-white/65 mt-1">{r.experts} · {r.reports}</div>
                </div>
                <span className="text-[var(--gold)] text-xl">→</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* INSIGHTS */}
      <Section eyebrow="Global Insights" title="Analysis and intelligence from our editorial desks." intro="Featured reports, regional briefings, and strategic foresight from our network of analysts.">
        <div className="grid lg:grid-cols-2 gap-10">
          <FeaturedInsight item={insights[0]} />
          <div className="grid sm:grid-cols-1 gap-6">
            {insights.slice(1).map((i) => <InsightCard key={i.title} item={i} />)}
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <Link to="/insights" className="btn-ghost !text-[var(--navy-deep)]">Browse all insights</Link>
        </div>
      </Section>

      {/* TALENT CTA */}
      <Section dark eyebrow="Global Talent Network" title="Join a network of analysts, scholars, and practitioners shaping global solutions." intro="Veritas continuously seeks highly qualified professionals from diverse disciplines and geographic regions.">
        <div className="grid md:grid-cols-3 gap-px bg-white/10">
          {["Policy Analysts", "Researchers", "Economists", "Security Analysts", "Legal Experts", "Business Consultants"].map((c) => (
            <div key={c} className="bg-[var(--navy-deep)] p-6 border border-white/10">
              <div className="text-sm uppercase tracking-[0.16em] text-[var(--gold)]">Open</div>
              <div className="mt-3 text-lg font-medium">{c}</div>
            </div>
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
      <div className="gold-rule mb-6" />
      <h3 className="display-3 mb-5">{title}</h3>
      <p className="text-foreground/80 leading-relaxed">{body}</p>
    </div>
  );
}

function FeaturedInsight({ item }: { item: { img: string; tag: string; title: string; date: string } }) {
  return (
    <Link to="/insights" className="card-elevated block group">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={item.img} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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

function InsightCard({ item }: { item: { img: string; tag: string; title: string; date: string } }) {
  return (
    <Link to="/insights" className="card-elevated grid grid-cols-[140px_1fr] sm:grid-cols-[200px_1fr]">
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
