import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { DataBackdrop } from "./DataBackdrop";

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className = "",
  dark = false,
  backdrop = false,
  backdropVariant = "network",
}: {
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  dark?: boolean;
  backdrop?: boolean;
  backdropVariant?: "network" | "grid" | "orbit" | "meridian";
}) {
  return (
    <section
      className={`relative overflow-hidden py-24 md:py-32 ${dark ? "bg-[var(--navy-deep)] text-white" : ""} ${className}`}
    >
      {(dark || backdrop) && <DataBackdrop variant={backdropVariant} />}
      <div className="container-x relative">
        {(eyebrow || title || intro) && (
          <Reveal className="max-w-3xl mb-16">
            {eyebrow && <span className={`eyebrow ${dark ? "!text-white/70" : ""}`}>{eyebrow}</span>}
            {title && <h2 className="display-2 mt-5 text-balance underline-gold">{title}</h2>}
            {intro && (
              <p className={`mt-10 text-lg leading-relaxed text-pretty ${dark ? "text-white/75" : "text-muted-foreground"}`}>
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
