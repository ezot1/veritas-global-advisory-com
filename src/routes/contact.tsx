import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Veritas Global Advisory" },
      { name: "description", content: "Contact Veritas Global Advisory. Headquarters in London, United Kingdom." },
    ],
  }),
  component: ContactPage,
});

const emails = [
  ["General", "info@veritasglobaladvisory.com"],
  ["Business", "business@veritasglobaladvisory.com"],
  ["Research", "research@veritasglobaladvisory.com"],
  ["Careers", "careers@veritasglobaladvisory.com"],
  ["Media", "media@veritasglobaladvisory.com"],
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Contact" title="Engage with Veritas Global Advisory."
        intro="Reach our headquarters in London or contact the practice most relevant to your inquiry." />

      <Section>
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14">
          <aside>
            <div className="gold-rule mb-6" />
            <h3 className="display-3 mb-4">Headquarters</h3>
            <p className="text-muted-foreground leading-relaxed">
              Veritas Global Advisory<br />
              1450 Brickell Avenue, Suite 2400<br />
              Miami, Florida 33131, USA
            </p>
            <div className="mt-10 space-y-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Direct contacts</div>
              <ul className="space-y-3">
                {emails.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">{k}</span>
                    <a href={`mailto:${v}`} className="text-sm font-medium text-[var(--navy-deep)] hover:text-[var(--gold)]">{v}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="card-elevated p-8 md:p-12 grid sm:grid-cols-2 gap-6 self-start">
            <Field label="Name" name="name" required />
            <Field label="Organization" name="org" />
            <Field label="Country" name="country" />
            <Field label="Email" name="email" type="email" required />
            <Field label="Subject" name="subject" required className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message</label>
              <textarea name="message" rows={6} required className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
              {sent
                ? <p className="text-[var(--navy-deep)] font-medium">Thank you. we'll respond shortly.</p>
                : <span className="text-xs text-muted-foreground">Replies typically within two business days.</span>}
              <button type="submit" className="btn-primary">Send Inquiry</button>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}

function Field({ label, name, type = "text", required, className = "" }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}{required && <span className="text-[var(--gold)]"> *</span>}</label>
      <input name={name} type={type} required={required} className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
    </div>
  );
}
