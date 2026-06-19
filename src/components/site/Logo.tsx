import { Link } from "@tanstack/react-router";

export function LogoMark({ size = 40, variant = "dark" }: { size?: number; variant?: "dark" | "gold" }) {
  const bg = variant === "dark" ? "var(--navy-deep)" : "var(--gold)";
  const fg = variant === "dark" ? "var(--gold)" : "var(--navy-deep)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Veritas Global Advisory"
      className="shrink-0"
    >
      <rect width="48" height="48" fill={bg} />
      {/* Globe meridians */}
      <g stroke={fg} strokeWidth="0.8" fill="none" opacity="0.55">
        <circle cx="24" cy="24" r="14" />
        <ellipse cx="24" cy="24" rx="6" ry="14" />
        <ellipse cx="24" cy="24" rx="14" ry="6" />
        <line x1="10" y1="24" x2="38" y2="24" />
      </g>
      {/* V monogram */}
      <path
        d="M14 14 L24 34 L34 14"
        stroke={fg}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Compass tick */}
      <circle cx="24" cy="34" r="1.6" fill={fg} />
      {/* Gold corner accents */}
      <path d="M0 0 H6 V1 H1 V6 H0 Z" fill={fg} opacity="0.9" />
      <path d="M48 48 H42 V47 H47 V42 H48 Z" fill={fg} opacity="0.9" />
    </svg>
  );
}

export function BrandLockup({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-3 group">
      <LogoMark size={42} />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-[0.22em] uppercase text-[var(--navy-deep)]">
          Veritas
        </span>
        <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
          Global Advisory
        </span>
      </span>
    </Link>
  );
}
