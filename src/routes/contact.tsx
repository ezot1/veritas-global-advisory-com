import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { useState } from "react";
import { submitForm } from "@/lib/forms/submit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Veritas Global Advisory" },
      { name: "description", content: "Contact Veritas Global Advisory. Headquarters in Miami, Florida, USA." },
    ],
  }),
  component: ContactPage,
});

const emails = [
  ["General", "info@veritasglobaladvisory.org"],
  ["Business", "business@veritasglobaladvisory.org"],
  ["Research", "research@veritasglobaladvisory.org"],
  ["Careers", "careers@veritasglobaladvisory.org"],
  ["Media", "media@veritasglobaladvisory.org"],
];

const DEPARTMENTS = [
  { value: "general", label: "General inquiry" },
  { value: "business", label: "Business / consulting" },
  { value: "research", label: "Research & analysis" },
  { value: "careers", label: "Careers" },
  { value: "media", label: "Media & press" },
] as const;

type DeptValue = (typeof DEPARTMENTS)[number]["value"];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const department = (fd.get("department") as DeptValue) || "general";
    const deptLabel = DEPARTMENTS.find(d => d.value === department)?.label ?? "General";
    try {
      await submitForm({
        formType: "contact",
        department,
        formTitle: `New contact inquiry — ${deptLabel}`,
        formSubtitle: "A visitor submitted the contact form on veritasglobaladvisory.org.",
        replyTo: String(fd.get("email") || ""),
        fields: [
          { label: "Name", value: String(fd.get("name") || "") },
          { label: "Organization", value: String(fd.get("org") || "") },
          { label: "Country", value: String(fd.get("country") || "") },
          { label: "Email", value: String(fd.get("email") || "") },
          { label: "Department", value: deptLabel },
          { label: "Subject", value: String(fd.get("subject") || "") },
          { label: "Message", value: String(fd.get("message") || "") },
        ],
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Please email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Contact" title="Engage with Veritas Global Advisory."
        intro="Reach our headquarters in Miami or contact the practice most relevant to your inquiry." />

      <Section>
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14">
          <aside>
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

          <form onSubmit={handleSubmit} className="card-elevated p-8 md:p-12 grid sm:grid-cols-2 gap-6 self-start">
            <Field label="Name" name="name" required />
            <Field label="Organization" name="org" />
            <Field label="Country" name="country" />
            <Field label="Email" name="email" type="email" required />
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Department <span className="text-[var(--gold)]">*</span>
              </label>
              <select name="department" required defaultValue="general"
                className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]">
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <Field label="Subject" name="subject" required className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message</label>
              <textarea name="message" rows={6} required maxLength={5000} className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
              {sent
                ? <p className="text-[var(--navy-deep)] font-medium">Thank you. We'll respond shortly.</p>
                : error
                  ? <p className="text-sm text-red-600">{error}</p>
                  : <span className="text-xs text-muted-foreground">Replies typically within two business days.</span>}
              <button type="submit" disabled={sending || sent} className="btn-primary disabled:opacity-60">
                {sending ? "Sending…" : sent ? "Sent" : "Send Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </Section>
      <ImageStrip start={5} eyebrow="Our Presence" title="Miami headquarters and global reach." />
    </>
  );
}

function Field({ label, name, type = "text", required, className = "" }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}{required && <span className="text-[var(--gold)]"> *</span>}</label>
      <input name={name} type={type} required={required} maxLength={500} className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
    </div>
  );
}
