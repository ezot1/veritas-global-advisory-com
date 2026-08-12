import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/data/articles";

export function LatestBriefing({ article }: { article: Article }) {
  return (
    <section aria-labelledby="latest-briefing" className="border-b border-border bg-[var(--secondary)]">
      <div className="container-x py-14 md:py-20 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
        <Link
          to="/insights/$slug"
          params={{ slug: article.slug }}
          className="group relative block overflow-hidden"
        >
          <img
            src={article.img}
            alt={article.title}
            loading="eager"
            className="w-full aspect-[16/10] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
          />
          <span className="absolute left-0 top-0 bg-[var(--navy-deep)] text-white text-[10px] uppercase tracking-[0.28em] px-4 py-2">
            Latest Briefing
          </span>
        </Link>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)] mb-4">
            {article.tag} · {article.region}
          </p>
          <h2 id="latest-briefing" className="display-2 mb-5">
            <Link
              to="/insights/$slug"
              params={{ slug: article.slug }}
              className="hover:text-[var(--navy-deep)] transition-colors"
            >
              {article.title}
            </Link>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-prose">{article.summary}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {article.author} · {article.date}
          </p>
          <Link
            to="/insights/$slug"
            params={{ slug: article.slug }}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[var(--navy-deep)] border-b border-[var(--gold)] pb-1"
          >
            Read the briefing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
