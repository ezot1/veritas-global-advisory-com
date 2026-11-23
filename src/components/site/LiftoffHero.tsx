import { Link } from "@tanstack/react-router";

export function LiftoffHero({ publicationCount }: { publicationCount: number }) {
  const stats = [
    { v: "12", l: "Countries covered" },
    { v: "52", l: "Experts worldwide" },
    { v: publicationCount.toLocaleString(), l: "Published briefings" },
    { v: "5", l: "Regional divisions" },
  ];
  return (
    <section className="bg-[var(--navy-deep)] text-primary-foreground border-b-2 border-[var(--gold)]">
      <div className="container-x pt-10 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-4xl">
          <span className="eyebrow !text-[var(--gold)]">Miami · Global advisory and research</span>
          <h1 className="display-1 mt-6 text-balance">Veritas Global Advisory</h1>
          <p className="mt-7 text-2xl font-serif text-[var(--gold)]">Independent analysis for decisions across borders.</p>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80 leading-relaxed text-pretty">
            Veritas Global Advisory provides strategic intelligence, business consulting, governance analysis,
            political risk assessment, market-entry support and global talent solutions across regions and sectors.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary !px-5 !py-3 !bg-[var(--gold)] !border-[var(--gold)] !text-[var(--navy-deep)] hover:!bg-primary-foreground hover:!border-primary-foreground">
              Explore services
            </Link>
            <Link to="/insights" className="btn-ghost !px-5 !py-3 !text-primary-foreground">Read our research</Link>
          </div>
        </div>
        <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 border-t border-primary-foreground/20">
          {stats.map((s) => (
            <div key={s.l} className="pt-6 pr-6">
              <dt className="text-xs uppercase tracking-[0.14em] text-primary-foreground/65">{s.l}</dt>
              <dd className="mt-2 text-3xl md:text-4xl font-semibold text-[var(--gold)]">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
