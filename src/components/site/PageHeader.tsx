import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(212,175,55,.5), transparent 40%), radial-gradient(circle at 80% 70%, rgba(212,175,55,.3), transparent 40%)",
        }}
      />
      <div className="container-x relative py-28 md:py-36">
        <span className="eyebrow !text-white/70">{eyebrow}</span>
        <h1 className="display-1 mt-6 max-w-4xl text-balance">{title}</h1>
        {intro && <p className="mt-7 max-w-2xl text-lg text-white/75 leading-relaxed">{intro}</p>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--gold)]/40" />
    </section>
  );
}
