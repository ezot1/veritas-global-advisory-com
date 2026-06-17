import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/about", label: "Who We Are" },
  { to: "/services", label: "Services" },
  { to: "/insights", label: "Insights" },
  { to: "/talent", label: "Global Talent" },
  { to: "/leadership", label: "Leadership" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="container-x flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <span className="grid place-items-center h-9 w-9 bg-[var(--navy-deep)] text-[var(--gold)] font-semibold tracking-tight">V</span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-[0.16em] uppercase text-[var(--navy-deep)]">Veritas</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Global Advisory</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[13px] font-medium tracking-wide text-foreground/80 hover:text-[var(--navy-deep)] transition-colors"
              activeProps={{ className: "text-[var(--navy-deep)] font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link to="/contact" className="btn-primary !py-2.5 !px-5 !text-xs">Engage Us</Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-x py-4 flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium border-b border-border/60 last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary mt-4 !w-full">Engage Us</Link>
          </div>
        </div>
      )}
    </header>
  );
}
