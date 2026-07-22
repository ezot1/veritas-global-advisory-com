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
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">Division</div>
              <div className="mt-3 font-semibold text-[var(--navy-deep)]">{d}</div>
            </div>
          ))}
        </div>
      </Section>
      <ImageStrip start={2} eyebrow="At Work" title="Our leadership in action." />
    </>
  );
}

function Profile({ name, role, bio }: { name: string; role: string; bio?: string }) {
  return (
    <div className="bg-background p-7">
      <div className="aspect-[3/4] bg-gradient-to-br from-[var(--navy-deep)] to-[var(--navy)] mb-5 grid place-items-center text-[var(--gold)] text-5xl font-semibold">
        {name.split(" ").slice(-1)[0][0]}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{role}</div>
      <div className="mt-2 font-semibold text-[var(--navy-deep)]">{name}</div>
      {bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{bio}</p>}
    </div>
  );
}
