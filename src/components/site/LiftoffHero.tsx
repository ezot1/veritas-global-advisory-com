import { Link } from "@tanstack/react-router";
import heroWorld from "@/assets/hero-world.jpg";

export function LiftoffHero({ publicationCount }: { publicationCount: number }) {
  return (
    <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <img
        src={heroWorld}
        alt=""
        width={1920}
        height={1280}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--navy-deep) 44%, transparent), color-mix(in oklab, var(--navy-deep) 64%, transparent))",
        }}
      />

      <div className="container-x relative pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-5xl">
          <span className="eyebrow !text-[var(--gold)]">
            Global Advisory · Research · Intelligence
          </span>
          <h1 className="display-1 mt-7 text-balance">
            Navigating Complexity.
            <br />
            Connecting Opportunities.
            <br />
            <span className="text-[var(--gold)]">
              Shaping Global Solutions.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed text-pretty">
            Veritas Global Advisory is an international consulting and advisory firm providing
            strategic intelligence, business consulting, governance analysis, political risk
            assessment, market-entry support, and global talent solutions across regions and sectors.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/services"
              className="btn-primary !bg-[var(--gold)] !border-[var(--gold)] !text-[var(--navy-deep)] hover:!bg-white hover:!border-white"
            >
              Explore Our Services
            </Link>
            <Link to="/talent" className="btn-ghost !text-white">
              Join Our Global Network
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/15 border border-white/15">
          {[
            { v: "12", l: "Countries Covered" },
            { v: "52", l: "Experts Worldwide" },
            { v: publicationCount.toLocaleString(), l: "Published Briefings" },
            { v: "5", l: "Regional Divisions" },
          ].map((s) => (
            <div key={s.l} className="bg-[var(--navy-deep)] p-8">
              <div className="text-4xl md:text-5xl font-semibold text-[var(--gold)] tracking-tight">
                {s.v}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
