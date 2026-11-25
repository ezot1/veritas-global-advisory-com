import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership | Veritas Global Advisory" },
      { name: "description", content: "Board of directors, executive leadership, advisory council, and regional offices of Veritas Global Advisory." },
      { property: "og:title", content: "Leadership - Veritas Global Advisory" },
      { property: "og:description", content: "The board, executives, and senior fellows guiding Veritas Global Advisory across five regional divisions." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/leadership" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/leadership" }],
  }),
  component: LeadershipPage,
});

const board = [
  { name: "Sir Edmund Whitcombe", role: "Chairperson", bio: "Former diplomat; 30+ years in international affairs." },
  { name: "Dr. Amara Diallo", role: "Vice Chairperson", bio: "Economist and former central bank advisor." },
  { name: "Prof. Henry Okonkwo", role: "Independent Director", bio: "Public policy scholar, governance specialist." },
];
const execs = [
  { name: "Dr. Yusra Khan", role: "Chief Executive Officer" },
  { name: "Marcus Lindqvist", role: "Deputy CEO" },
  { name: "Sofia Reyes", role: "Chief Operating Officer" },
  { name: "Dr. Tarek Halabi", role: "Chief Strategy Officer" },
  { name: "Olivia Brennan", role: "Chief Financial Officer" },
];
const council = [
  { name: "Ambassador R. Suzuki", role: "Senior Fellow · Asia-Pacific" },
  { name: "Dr. C. van Heerden", role: "Distinguished Scholar · Africa" },
  { name: "Prof. M. Volkov", role: "Senior Fellow · Europe & Eurasia" },
  { name: "Dr. F. Al-Rashid", role: "Regional Advisor · Middle East" },
  { name: "Hon. P. Castillo", role: "Senior Fellow · Americas" },
];

function LeadershipPage() {
  return (
    <>
      <PageHeader eyebrow="Leadership" title="The people shaping Veritas Global Advisory."
        intro="A board of directors, an executive leadership team, and an advisory council of senior fellows and former diplomats." />

      <Section eyebrow="Board of Directors" title="Governance and stewardship.">
        <div className="grid md:grid-cols-3 gap-px bg-border">
          {board.map((p) => <Profile key={p.name} {...p} />)}
        </div>
      </Section>

      <Section eyebrow="Executive Leadership" title="Operational direction." className="bg-[var(--secondary)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
          {execs.map((p) => <Profile key={p.name} {...p} />)}
        </div>
      </Section>

      <Section eyebrow="Advisory Council" title="Senior fellows, scholars, and regional advisors.">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
          {council.map((p) => <Profile key={p.name} {...p} />)}
        </div>
      </Section>

      <Section eyebrow="Regional Offices" title="Five divisions. One firm." className="bg-[var(--secondary)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
          {["Africa Division", "Asia-Pacific Division", "Europe Division", "Middle East Division", "Americas Division"].map((d) => (
            <div key={d} className="bg-background p-7">
              <div className="font-semibold text-[var(--navy-deep)]">{d}</div>
            </div>
          ))}
        </div>
      </Section>
      <ImageStrip start={2} eyebrow="At Work" title="Our leadership in action." />
    </>
  );
}

function Profile({ name, role, bio }: { name: string; role: string; bio?: string }) {
  const initials = name
    .replace(/^(Sir|Dr\.|Prof\.|Ambassador|Hon\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <div className="bg-background p-7 flex flex-col justify-between border-t-2 border-t-[var(--gold)]/70">
      <div>
        <div className="inline-grid place-items-center h-11 w-11 bg-[var(--navy-deep)] text-[var(--gold)] text-sm font-semibold tracking-wider mb-5">
          {initials}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{role}</div>
        <div className="mt-2 text-lg font-semibold text-[var(--navy-deep)]">{name}</div>
        {bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}
