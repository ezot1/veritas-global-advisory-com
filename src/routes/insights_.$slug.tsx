import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { findArticle, articles } from "@/data/articles";

export const Route = createFileRoute("/insights_/$slug")({
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ params, loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | Veritas Global Advisory` },
          { name: "description", content: loaderData.article.summary },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.summary },
          { property: "og:type", content: "article" },
          { property: "og:url", content: `https://veritasglobaladvisory.org/insights/${params.slug}` },
          { property: "og:image", content: `https://veritasglobaladvisory.org${loaderData.article.img}` },
          { property: "article:author", content: loaderData.article.author },
          { property: "article:published_time", content: loaderData.article.date },
        ]
      : [{ title: "Insight | Veritas Global Advisory" }],
    links: loaderData
      ? [{ rel: "canonical", href: `https://veritasglobaladvisory.org/insights/${params.slug}` }]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: loaderData.article.title,
              description: loaderData.article.summary,
              author: { "@type": "Person", name: loaderData.article.author },
              datePublished: loaderData.article.date,
              image: `https://veritasglobaladvisory.org${loaderData.article.img}`,
              publisher: {
                "@type": "Organization",
                name: "Veritas Global Advisory",
                logo: { "@type": "ImageObject", url: "https://veritasglobaladvisory.org/favicon.png" },
              },
              mainEntityOfPage: `https://veritasglobaladvisory.org/insights/${params.slug}`,
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Section>
      <h1 className="display-2">Article not found</h1>
      <p className="mt-4 text-muted-foreground">The briefing you requested is unavailable.</p>
      <Link to="/insights" className="link-arrow mt-8 inline-flex">Back to insights</Link>
    </Section>
  ),
  errorComponent: ({ reset }) => (
    <Section>
      <h1 className="display-3">Something went wrong.</h1>
      <button onClick={reset} className="btn-primary mt-6">Retry</button>
    </Section>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);
  const words = article.body.join(" ").split(/\s+/).length;
  const readTime = Math.max(5, Math.round(words / 220));

  return (
    <>
      <header className="bg-[var(--navy-deep)] text-white">
        <div className="container-x pt-20 pb-14 md:pt-28 md:pb-20">
          <Link to="/insights" className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)] hover:text-white">← Back to research</Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/70">
            <span className="text-[var(--gold)] font-semibold">{article.tag}</span>
            <span>·</span><span>{article.region}</span>
            <span>·</span><span>{article.date}</span>
            <span>·</span><span>{readTime} min read</span>
          </div>
          <h1 className="display-1 mt-6 max-w-4xl text-balance">{article.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-white/80 leading-relaxed">{article.summary}</p>
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/55">By {article.author} · Veritas Research</p>
        </div>
      </header>

      <div className="container-x py-16 md:py-20 grid lg:grid-cols-[1fr_280px] gap-14">
        <article className="max-w-3xl">
          <div className="aspect-[16/9] overflow-hidden mb-10 border border-border">
            <img src={article.img} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="prose-veritas">
            {article.body.map((p: string, i: number) => (
              <p key={i} className="text-[17px] leading-[1.85] text-foreground mb-6">{p}</p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-12">
            This research briefing is published by Veritas Global Advisory's editorial desks. Views expressed are those of the authors and do not constitute investment advice.
          </p>
        </article>

        <aside className="space-y-10">
          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--gold)] mb-4">In this briefing</h4>
            <ul className="space-y-2 text-sm text-foreground">
              <li>· Strategic context</li>
              <li>· Operational implications</li>
              <li>· Risk assessment</li>
              <li>· Outlook</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--gold)] mb-4">Related research</h4>
            <ul className="space-y-5">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to="/insights/$slug" params={{ slug: r.slug }} className="block group">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">{r.tag}</div>
                    <div className="mt-1 text-sm font-semibold leading-snug text-[var(--navy-deep)] group-hover:underline">{r.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
