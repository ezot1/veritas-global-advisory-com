import type { ReactNode } from "react";

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
}) {
  return (
    <section
      className={`py-24 md:py-32 ${dark ? "bg-[var(--navy-deep)] text-white" : ""} ${className}`}
    >
      <div className="container-x">
        {(eyebrow || title || intro) && (
          <div className="max-w-3xl mb-16">
            {eyebrow && <span className={`eyebrow ${dark ? "!text-white/70" : ""}`}>{eyebrow}</span>}
            {title && <h2 className="display-2 mt-5 text-balance">{title}</h2>}
            {intro && (
              <p className={`mt-6 text-lg leading-relaxed text-pretty ${dark ? "text-white/75" : "text-muted-foreground"}`}>
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
