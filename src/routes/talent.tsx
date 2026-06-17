import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { useState } from "react";

export const Route = createFileRoute("/talent")({
  head: () => ({
    meta: [
      { title: "Global Talent Network — Veritas Global Advisory" },
      { name: "description", content: "Join the Veritas Global Advisory expert network of researchers, policy analysts, economists, and practitioners worldwide." },
    ],
  }),
  component: TalentPage,
});

const categories = [
  "International Students", "Researchers", "Policy Analysts", "Journalists",
  "Economists", "Social Workers", "Human Rights Specialists", "Security Analysts",
  "Religious Affairs Researchers", "Development Practitioners", "Legal Experts", "Business Consultants",
];

function TalentPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Global Talent Network" title="Join our international expert network."
        intro="Veritas Global Advisory continuously seeks highly qualified professionals and specialists from diverse disciplines and geographic regions." />

      <Section eyebrow="Expert Categories" title="Disciplines we recruit across continents.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {categories.map((c) => (
            <div key={c} className="bg-background p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">Discipline</div>
              <div className="mt-3 font-medium text-[var(--navy-deep)]">{c}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Application" title="Submit your profile." className="bg-[var(--secondary)]">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="card-elevated p-8 md:p-12 max-w-4xl grid sm:grid-cols-2 gap-6"
        >
          <Field label="Full Name" name="name" required />
          <Field label="Country" name="country" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="LinkedIn Profile" name="linkedin" type="url" />
          <Field label="Area of Expertise" name="expertise" required />
          <Field label="Years of Experience" name="years" type="number" />
          <Field label="Languages Spoken" name="languages" className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Professional Biography</label>
            <textarea name="bio" rows={5} className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">CV Upload (PDF)</label>
            <input type="file" accept=".pdf,.doc,.docx" className="w-full text-sm" />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-4">
            {sent ? (
              <p className="text-[var(--navy-deep)] font-medium">Thank you — your application has been received.</p>
            ) : <span className="text-xs text-muted-foreground">All applications are reviewed by our talent team.</span>}
            <button type="submit" className="btn-primary">Submit Application</button>
          </div>
        </form>
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
