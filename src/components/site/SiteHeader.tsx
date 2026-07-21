import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageBar } from "./LanguageBar";
import { BrandLockup } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/about", label: "Who We Are" },
  { to: "/services", label: "Services" },
  { to: "/insights", label: "Research" },
  { to: "/talent", label: "Global Talent" },
  { to: "/leadership", label: "Leadership" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { if (mounted) setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (mounted) setIsAdmin(!!data);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") check();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container-x flex items-center justify-between gap-3 h-20">
        <BrandLockup onClick={() => setOpen(false)} />

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[13px] font-medium tracking-wide text-foreground hover:text-[var(--navy-deep)] transition-colors"
              activeProps={{ className: "text-[var(--navy-deep)] font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <LanguageBar />
          {isAdmin && (
            <Link to="/admin" className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)] hover:text-[var(--navy-deep)]">
              Inbox
            </Link>
          )}
          <Link to="/contact" className="btn-primary !py-2.5 !px-5 !text-xs">Engage Us</Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageBar compact />
          <button
            aria-label="Toggle menu"
            className="p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
