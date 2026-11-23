import type { ReactNode } from "react";
import { DataBackdrop } from "./DataBackdrop";
import heroWorld from "@/assets/hero-world.jpg";

export function PageHeader({
  eyebrow,
  title,
  intro,
  variant = "network",
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
      {/* Photographic base with slow ambient zoom */}
      <div aria-hidden className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover animate-kenburns"
        />
        {/* Navy gradient scrim for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--navy-deep) 72%, transparent), color-mix(in oklab, var(--navy-deep) 88%, transparent))",
          }}
        />
        {/* Corner glow accents */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, color-mix(in oklab, var(--gold) 45%, transparent), transparent 35%), radial-gradient(circle at 85% 80%, color-mix(in oklab, #2d8a9e 40%, transparent), transparent 40%)",
          }}
        />
      </div>

      <DataBackdrop variant={variant} className="opacity-40" />

      <div className="container-x relative py-28 md:py-36">
        <span className="eyebrow !text-white/70 opacity-0 animate-[fade-up_.7s_.15s_forwards]">
          {eyebrow}
        </span>
        <h1 className="display-1 mt-6 max-w-4xl text-balance opacity-0 animate-[fade-up_.85s_.3s_forwards]">
          {title}
        </h1>
        {intro && (
          <p className="mt-9 max-w-2xl text-lg text-white/80 leading-relaxed opacity-0 animate-[fade-up_.85s_.5s_forwards]">
            {intro}
          </p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--gold)]/40" />
    </section>
  );
}

