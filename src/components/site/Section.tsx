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
  image,
  imageAlt = "",
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
      className={`relative overflow-hidden py-24 md:py-32 ${dark ? "bg-[var(--navy-deep)] text-white" : ""} ${className}`}
    >
      {image && (
        <div aria-hidden className="absolute inset-0">
          <img
            src={image}
            alt={imageAlt}
            width={1920}
            height={768}
            loading="lazy"
            className="h-full w-full object-cover animate-kenburns"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklab, var(--navy-deep) 58%, transparent), color-mix(in oklab, var(--navy-deep) 78%, transparent))",
            }}
          />
        </div>
      )}
      {(dark || backdrop) && <DataBackdrop variant={backdropVariant} className={image ? "opacity-30" : ""} />}
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
