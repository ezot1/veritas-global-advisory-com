import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { Briefcase, Landmark, Shield, Activity, Scale, Search } from "lucide-react";

const SERVICE_ITEMS = [
  "International Business Consulting",
  "Public Policy & Governance",
  "Political Risk Analysis",
  "Security & Risk Advisory",
  "Human Rights & Social Impact",
  "Research & Intelligence Services",
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Veritas Global Advisory" },
      { name: "description", content: "Strategic intelligence, business consulting, governance, political risk, security advisory, human rights, and research services." },
      { property: "og:title", content: "Advisory Services - Veritas Global Advisory" },
      { property: "og:description", content: "Six interconnected advisory practices: business consulting, governance, political risk, security, human rights, and research." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/services" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Veritas Global Advisory",
          url: "https://veritasglobaladvisory.org/services",
          areaServed: "Worldwide",
          makesOffer: SERVICE_ITEMS.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s },
          })),
        }),
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Briefcase, title: "International Business Consulting", items: ["Market Entry Strategy", "Business Expansion Advisory", "Investment Facilitation", "Trade Advisory", "International Partnerships"] },
  { icon: Landmark, title: "Public Policy & Governance", items: ["Policy Analysis", "Governance Assessments", "Institutional Development", "Public Sector Reform", "Stakeholder Engagement"] },
  { icon: Activity, title: "Political Risk Analysis", items: ["Country Risk Reports", "Election Monitoring Assessments", "Political Economy Analysis", "Regulatory Forecasting", "Geopolitical Briefings"] },
  { icon: Shield, title: "Security & Risk Advisory", items: ["Regional Security Assessments", "Conflict Analysis", "Crisis Monitoring", "Security Environment Reporting", "Risk Management Support"] },
  { icon: Scale, title: "Human Rights & Social Impact", items: ["Human Rights Assessments", "Social Impact Evaluations", "Community Engagement Studies", "ESG Advisory Support"] },
  { icon: Search, title: "Research & Intelligence Services", items: ["Country Studies", "Due Diligence Research", "Strategic Reports", "Sector Analysis", "Trend Forecasting"] },
];

function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow="Services" title="Advisory practices built around the decisions that matter."
        intro="Six interconnected disciplines combining cross-regional expertise, rigorous research, and field-tested judgment." />
      <Section>
        <div className="space-y-px bg-border">
          {services.map((s, idx) => (
            <div key={s.title} className="bg-background grid lg:grid-cols-[260px_1fr_1fr] gap-10 p-10">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">0{idx + 1} · Practice</div>
                <span className="grid place-items-center h-14 w-14 bg-[var(--navy-deep)] text-[var(--gold)] mt-5">
                  <s.icon className="h-6 w-6" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[var(--navy-deep)] leading-tight">{s.title}</h3>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Integrated advisory drawing on our regional networks, primary research, and proprietary intelligence frameworks.
                </p>
              </div>
              <ul className="space-y-3 text-sm">
                {s.items.map((i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                    <span className="text-[var(--gold)]">◆</span>{i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <ImageStrip start={1} eyebrow="Practice Areas" title="Six disciplines, one global perspective." />
    </>
  );
}
