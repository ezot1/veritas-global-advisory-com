import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Who We Are | Veritas Global Advisory" },
      { name: "description", content: "Mission, vision, and values of Veritas Global Advisory — an international consulting and advisory institution across five regions." },
      { property: "og:title", content: "Who We Are — Veritas Global Advisory" },
      { property: "og:description", content: "The mission, vision, and core values behind Veritas Global Advisory's international consulting and advisory work." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/about" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Who We Are"
        title="An international advisory institution for a complex world."
        intro="Veritas Global Advisory connects research, intelligence, and strategic counsel across five regional divisions to help leaders navigate uncertainty with clarity."
      />
      <Section eyebrow="Our Foundations" title="Mission, vision, and the values that guide our work.">
        <div className="grid lg:grid-cols-2 gap-14">
          <Block title="Mission" body="To deliver high-quality consulting, research, strategic intelligence, and global advisory services that create value for clients worldwide." />
          <Block title="Vision" body="To become a globally trusted consulting and advisory institution connecting expertise, knowledge, and solutions across continents." />
        </div>
      </Section>
      <Section eyebrow="Core Values" title="Principles that shape every engagement." className="bg-[var(--secondary)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {["Integrity", "Professionalism", "Evidence-Based Analysis", "Global Perspective", "Confidentiality", "Excellence", "Diversity & Inclusion", "Independence"].map((v) => (
            <div key={v} className="bg-background p-8">
              <div className="text-lg font-semibold text-[var(--navy-deep)]">{v}</div>
            </div>
          ))}
        </div>
      </Section>
      <ImageStrip start={0} eyebrow="The Institution" title="A global advisory firm at work." />
    </>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="display-2 mb-6">{title}</h3>
      <p className="text-lg text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
