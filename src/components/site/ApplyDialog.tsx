import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { submitForm } from "@/lib/forms/submit";

export type ApplyJob = { title: string; dept: string; region: string };

export function ApplyDialog({ job, onClose }: { job: ApplyJob | null; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    nationality: "", location: "", linkedin: "", portfolio: "",
    yearsExp: "", education: "", languages: "",
    cover: "", availability: "", workAuth: "",
  });

  useEffect(() => {
    if (!job) return;
    setSubmitted(false);
    setError(null);
    setForm((f) => ({ ...f, firstName: "", lastName: "", email: "", phone: "", cover: "" }));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [job, onClose]);

  if (!job) return null;

  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitForm({
        formType: "careers",
        formTitle: `New application — ${job.title} (${job.dept}, ${job.region})`,
        formSubtitle: "A candidate applied through the Veritas Global Advisory careers page.",
        replyTo: form.email,
        fields: [
          { label: "Position", value: `${job.title} — ${job.dept} · ${job.region}` },
          { label: "First name", value: form.firstName },
          { label: "Last name", value: form.lastName },
          { label: "Email", value: form.email },
          { label: "Phone", value: form.phone },
          { label: "Nationality", value: form.nationality },
          { label: "Current location", value: form.location },
          { label: "LinkedIn", value: form.linkedin },
          { label: "Portfolio / website", value: form.portfolio },
          { label: "Years of experience", value: form.yearsExp },
          { label: "Highest education", value: form.education },
          { label: "Languages spoken", value: form.languages },
          { label: "Earliest availability", value: form.availability },
          { label: "Work authorization", value: form.workAuth },
          { label: "Cover note", value: form.cover },
        ],
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-[var(--navy-deep)]/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-background w-full md:max-w-3xl max-h-[92vh] overflow-y-auto border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[var(--navy-deep)] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">Apply · {job.dept} · {job.region}</div>
            <h3 className="mt-2 text-xl md:text-2xl font-semibold">{job.title}</h3>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-white/80 hover:text-white p-1"><X className="h-5 w-5" /></button>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <h4 className="text-2xl font-semibold text-[var(--navy-deep)]">Application received.</h4>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Thank you, {form.firstName || "candidate"}. Our talent team will review your submission and respond within 10 business days.
            </p>
            <button onClick={onClose} className="btn-primary mt-8">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 md:p-8 space-y-6">
            <Grid>
              <Field label="First name" required><input required value={form.firstName} onChange={handle("firstName")} className={input} /></Field>
              <Field label="Last name" required><input required value={form.lastName} onChange={handle("lastName")} className={input} /></Field>
            </Grid>
            <Grid>
              <Field label="Email" required><input required type="email" value={form.email} onChange={handle("email")} className={input} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={handle("phone")} className={input} /></Field>
            </Grid>
            <Grid>
              <Field label="Nationality"><input value={form.nationality} onChange={handle("nationality")} className={input} /></Field>
              <Field label="Current location"><input value={form.location} onChange={handle("location")} placeholder="City, Country" className={input} /></Field>
            </Grid>
            <Grid>
              <Field label="LinkedIn URL"><input value={form.linkedin} onChange={handle("linkedin")} className={input} /></Field>
              <Field label="Portfolio / website"><input value={form.portfolio} onChange={handle("portfolio")} className={input} /></Field>
            </Grid>
            <Grid>
              <Field label="Years of experience">
                <select value={form.yearsExp} onChange={handle("yearsExp")} className={input}>
                  <option value="">Select…</option>
                  <option>0–2</option><option>3–5</option><option>6–10</option><option>11–15</option><option>16+</option>
                </select>
              </Field>
              <Field label="Highest education">
                <select value={form.education} onChange={handle("education")} className={input}>
                  <option value="">Select…</option>
                  <option>Bachelor's</option><option>Master's</option><option>MBA</option><option>Doctorate</option><option>Other</option>
                </select>
              </Field>
            </Grid>
            <Field label="Languages spoken"><input value={form.languages} onChange={handle("languages")} placeholder="e.g. English, French, Arabic" className={input} /></Field>
            <Grid>
              <Field label="Earliest availability"><input value={form.availability} onChange={handle("availability")} placeholder="e.g. Immediate, 1 month" className={input} /></Field>
              <Field label="Work authorization">
                <select value={form.workAuth} onChange={handle("workAuth")} className={input}>
                  <option value="">Select…</option>
                  <option>Citizen / permanent resident in role region</option>
                  <option>Will require visa sponsorship</option>
                  <option>Remote-only</option>
                </select>
              </Field>
            </Grid>
            <Field label="Cover note" required>
              <textarea required rows={5} value={form.cover} onChange={handle("cover")} placeholder="Briefly describe your relevant experience and why this role." className={input + " resize-y"} />
            </Field>
            <div className="text-xs text-muted-foreground">
              By submitting you consent to Veritas Global Advisory processing your details in accordance with our Privacy Policy.
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost !text-[var(--navy-deep)]">Cancel</button>
              <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
                {sending ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const input = "w-full h-11 px-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}{required && <span className="text-[var(--gold)]"> *</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-5">{children}</div>;
}
