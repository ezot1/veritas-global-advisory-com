import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className = "",
  dark = false,
}: {
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  dark?: boolean;
  backdrop?: boolean;
  backdropVariant?: "network" | "grid" | "orbit" | "meridian";
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden py-20 md:py-24 ${dark ? "bg-[var(--navy-deep)] text-white" : ""} ${className}`}
    >
      <div className="container-x relative">
        {(eyebrow || title || intro) && (
          <Reveal className="max-w-3xl mb-16">
            {eyebrow && <span className={`eyebrow ${dark ? "!text-white/70" : ""}`}>{eyebrow}</span>}
            {title && <h2 className="display-2 mt-5 text-balance">{title}</h2>}
            {intro && (
              <p className={`mt-6 text-lg leading-relaxed text-pretty ${dark ? "text-white/75" : "text-muted-foreground"}`}>
                {intro}
              </p>
            )}
          </Reveal>
        )}
        <Reveal delay={0.1}>{children}</Reveal>
      </div>
    </section>
  );
}
