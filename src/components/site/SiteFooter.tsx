import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--navy-deep)] text-white/85 mt-24">
      <div className="container-x py-20 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <LogoMark size={44} variant="gold" />
            <span className="text-lg font-semibold tracking-[0.22em] uppercase">Veritas</span>
          </div>
          <p className="text-sm leading-relaxed text-white/65 max-w-sm">
            Global Insights. Strategic Solutions. Trusted Expertise. An international consulting,
            research, and advisory firm connecting expertise across continents.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/55">Headquarters · Miami, Florida, USA</p>
        </div>

        <FooterCol title="Navigate" links={[
          { to: "/about", label: "Who We Are" },
          { to: "/services", label: "Services" },
          { to: "/insights", label: "Insights" },
          { to: "/leadership", label: "Leadership" },
        ]} />
        <FooterCol title="Engage" links={[
          { to: "/careers", label: "Careers" },
          { to: "/talent", label: "Global Talent Network" },
          { to: "/contact", label: "Contact" },
        ]} />
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--gold)] mb-5">Direct</h4>
          <ul className="space-y-2 text-sm break-all">
            <li><a className="hover:text-white" href="mailto:info@veritasglobaladvisory.org">info@veritasglobaladvisory.org</a></li>
            <li><a className="hover:text-white" href="mailto:business@veritasglobaladvisory.org">business@veritasglobaladvisory.org</a></li>
            <li><a className="hover:text-white" href="mailto:research@veritasglobaladvisory.org">research@veritasglobaladvisory.org</a></li>
            <li><a className="hover:text-white" href="mailto:careers@veritasglobaladvisory.org">careers@veritasglobaladvisory.org</a></li>
            <li><a className="hover:text-white" href="mailto:media@veritasglobaladvisory.org">media@veritasglobaladvisory.org</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/55">
          <p>© 2026 Veritas Global Advisory. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Ethics Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--gold)] mb-5">{title}</h4>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-white/75 hover:text-white transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
