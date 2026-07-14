import { supabase } from "@/integrations/supabase/client";

export type FormField = { label: string; value: string };

export type SubmitFormPayload = {
  formType: "contact" | "careers" | "talent";
  department?: "general" | "business" | "research" | "careers" | "media";
  formTitle: string;
  formSubtitle?: string;
  replyTo?: string;
  fields: FormField[];
  resumePath?: string;
  resumeName?: string;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadResume(
  file: File,
  formType: SubmitFormPayload["formType"],
): Promise<{ path: string; name: string }> {
  if (!ALLOWED_TYPES.includes(file.type) && !/\.(pdf|docx?|)$/i.test(file.name)) {
    throw new Error("Resume must be a PDF or Word document.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Resume must be 10 MB or smaller.");
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const path = `${formType}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("resumes").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message || "Resume upload failed.");
  return { path, name: file.name };
}

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
