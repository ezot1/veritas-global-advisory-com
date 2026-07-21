import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { useState } from "react";
import { submitForm, uploadResume } from "@/lib/forms/submit";

export const Route = createFileRoute("/talent")({
  head: () => ({
    meta: [
      { title: "Global Talent Network | Veritas Global Advisory" },
      { name: "description", content: "Join the Veritas Global Advisory expert network of researchers, policy analysts, economists, and practitioners worldwide." },
      { property: "og:title", content: "Global Talent Network — Veritas Global Advisory" },
      { property: "og:description", content: "Apply to a global network of researchers, analysts, economists, and practitioners shaping strategic advisory across five regions." },
      { property: "og:url", content: "https://veritasglobaladvisory.org/talent" },
    ],
    links: [{ rel: "canonical", href: "https://veritasglobaladvisory.org/talent" }],
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      let resumeInfo: { path: string; name: string } | null = null;
      if (resume) resumeInfo = await uploadResume(resume, "talent");
      await submitForm({
        formType: "talent",
        formTitle: "New Global Talent Network application",
        formSubtitle: "A specialist submitted the talent network form.",
        replyTo: String(fd.get("email") || ""),
        resumePath: resumeInfo?.path,
        resumeName: resumeInfo?.name,
        fields: [
          { label: "Full name", value: String(fd.get("name") || "") },
          { label: "Country", value: String(fd.get("country") || "") },
          { label: "Email", value: String(fd.get("email") || "") },
          { label: "LinkedIn", value: String(fd.get("linkedin") || "") },
          { label: "Area of expertise", value: String(fd.get("expertise") || "") },
          { label: "Years of experience", value: String(fd.get("years") || "") },
          { label: "Languages spoken", value: String(fd.get("languages") || "") },
          { label: "Professional biography", value: String(fd.get("bio") || "") },
        ],
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSending(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="card-elevated p-8 md:p-12 max-w-4xl grid sm:grid-cols-2 gap-6">
          <Field label="Full Name" name="name" required />
          <Field label="Country" name="country" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="LinkedIn Profile" name="linkedin" type="url" />
          <Field label="Area of Expertise" name="expertise" required />
          <Field label="Years of Experience" name="years" type="number" />
          <Field label="Languages Spoken" name="languages" className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label htmlFor="talent-bio" className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Professional Biography</label>
            <textarea id="talent-bio" name="bio" rows={5} maxLength={5000} className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">CV Upload (PDF) — please email separately to research@veritasglobaladvisory.org</label>
            <input type="file" accept=".pdf,.doc,.docx" className="w-full text-sm" disabled />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-4">
            {sent
              ? <p className="text-[var(--navy-deep)] font-medium">Thank you. Your application has been received.</p>
              : error
                ? <p className="text-sm text-red-600">{error}</p>
                : <span className="text-xs text-muted-foreground">All applications are reviewed by our talent team.</span>}
            <button type="submit" disabled={sending || sent} className="btn-primary disabled:opacity-60">
              {sending ? "Submitting…" : sent ? "Sent" : "Submit Application"}
            </button>
          </div>
        </form>
      </Section>
      <ImageStrip start={4} eyebrow="The Network" title="Experts working across continents." />
    </>
  );
}

function Field({ label, name, type = "text", required, className = "" }: { label: string; name: string; type?: string; required?: boolean; className?: string }) {
  const id = `talent-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}{required && <span className="text-[var(--gold)]"> *</span>}</label>
      <input id={id} name={name} type={type} required={required} className="w-full h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
    </div>
  );
}
