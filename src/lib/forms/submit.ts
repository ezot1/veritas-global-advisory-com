export type FormField = { label: string; value: string };

export type SubmitFormPayload = {
  formType: "contact" | "careers" | "talent";
  department?: "general" | "business" | "research" | "careers" | "media";
  formTitle: string;
  formSubtitle?: string;
  replyTo?: string;
  fields: FormField[];
};

export async function submitForm(payload: SubmitFormPayload): Promise<void> {
  const res = await fetch("/api/public/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "Submission failed";
    try {
      const j = await res.json();
      detail = j?.detail || j?.error || detail;
    } catch {}
    throw new Error(detail);
  }
}
