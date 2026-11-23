import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  variant?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="bg-[var(--navy-deep)] text-primary-foreground border-b-2 border-[var(--gold)]">
      <div className="container-x py-20 md:py-24">
        <span className="eyebrow !text-[var(--gold)]">{eyebrow}</span>
        <h1 className="display-1 mt-5 max-w-4xl text-balance">{title}</h1>
        {intro && <p className="mt-7 max-w-2xl text-lg text-primary-foreground/80 leading-relaxed">{intro}</p>}
      </div>
    </section>
  );
}
