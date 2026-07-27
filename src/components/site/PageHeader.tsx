import type { ReactNode } from "react";
import { DataBackdrop } from "./DataBackdrop";

export function PageHeader({
  eyebrow,
  title,
  intro,
  variant = "network",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  variant?: "network" | "grid" | "orbit" | "meridian";
}) {
  return (
    <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <DataBackdrop variant={variant} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(212,175,55,.55), transparent 40%), radial-gradient(circle at 80% 70%, rgba(45,138,158,.4), transparent 45%)",
        }}
      />
      <div className="container-x relative py-28 md:py-36">
        <span
          className="eyebrow !text-white/70 opacity-0 animate-[fade-up_.7s_.15s_forwards]"
        >
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
