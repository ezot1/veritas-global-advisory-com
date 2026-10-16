import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { articles } from "@/data/articles";
import { Button } from "@/components/ui/button";

const sample = articles.find((article) => article.slug === "nearshoring-mexico-vs-vietnam-comparison");

export const Route = createFileRoute("/sample-briefing")({
  head: () => ({
    meta: [
      { title: "Sample Briefing: Nearshoring | Veritas Global Advisory" },
      { name: "description", content: "Read a published Veritas briefing comparing Mexico and Vietnam as nearshoring hubs. A public research sample, not a client case study." },
      { property: "og:title", content: "Sample Briefing | Veritas Global Advisory" },
      { property: "og:description", content: "Published analysis on Mexico, Vietnam and supply-chain diversification, presented as a public research sample." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/sample-briefing" }],
  }),
  component: SampleBriefingPage,
});

function SampleBriefingPage() {
  if (!sample) return <div className="container-x py-24">Sample briefing unavailable.</div>;

  return (
    <>
      <header className="bg-navy-deep text-primary-foreground">
        <div className="container-x py-16 md:py-24">
          <Button asChild variant="link" className="h-auto p-0 text-gold">
            <Link to="/insights"><ArrowLeft /> Research archive</Link>
          </Button>
          <p className="mt-10 text-sm font-medium uppercase text-gold">Veritas Global Advisory · Sample briefing</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">{sample.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed">{sample.summary}</p>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-gold/40 pt-6 text-sm">
            <div><dt className="text-gold">Published</dt><dd className="mt-1">{sample.date}</dd></div>
            <div><dt className="text-gold">Region</dt><dd className="mt-1">{sample.region}</dd></div>
            <div><dt className="text-gold">Category</dt><dd className="mt-1">{sample.tag}</dd></div>
          </dl>
        </div>
      </header>

      <div className="container-x grid gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0 max-w-3xl">
          <p className="mb-8 border-l-2 border-gold pl-5 text-sm leading-relaxed text-muted-foreground">
            Public research sample. This is an existing published briefing, not a commissioned client report or a claim of client results. Original byline: {sample.author}.
          </p>
          <img src={sample.img} alt="Mexico and Vietnam nearshoring research illustration" className="mb-10 aspect-video w-full object-cover" />
          <h2 className="mb-6 text-2xl font-semibold">The briefing</h2>
          <div className="space-y-6">
            {sample.body.map((paragraph, index) => <p key={index} className="text-base leading-relaxed md:text-lg">{paragraph}</p>)}
          </div>
        </article>
        <aside className="space-y-8 border-t border-border pt-8 lg:border-t-0 lg:pt-0">
          <div>
            <h2 className="text-lg font-semibold">Publication details</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Reproduced from the public Veritas research archive. The original publication date and byline are retained.</p>
            <Button asChild variant="link" className="mt-4 h-auto whitespace-normal p-0 text-left">
              <Link to="/insights/$slug" params={{ slug: sample.slug }}>Original publication <ArrowUpRight /></Link>
            </Button>
          </div>
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Discuss a research brief</h2>
            <Button asChild variant="outline" className="mt-4"><Link to="/contact">Contact Veritas <ArrowUpRight /></Link></Button>
          </div>
        </aside>
      </div>
    </>
  );
}