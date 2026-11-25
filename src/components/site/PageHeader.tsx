import type { ReactNode } from "react";
import heroWorld from "@/assets/hero-world.jpg";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image = heroWorld,
  imageAlt = "",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  variant?: "network" | "grid" | "orbit" | "meridian";
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--navy-deep) 72%, transparent), color-mix(in oklab, var(--navy-deep) 88%, transparent))",
          }}
        />
      </div>

      <div className="container-x relative py-28 md:py-36">
        <span className="eyebrow !text-[var(--gold)]">
          {eyebrow}
        </span>
        <h1 className="display-1 mt-6 max-w-4xl text-balance">
          {title}
        </h1>
        {intro && (
          <p className="mt-8 max-w-2xl text-lg text-white/85 leading-relaxed">
            {intro}
          </p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--gold)]/40" />
    </section>
  );
}

