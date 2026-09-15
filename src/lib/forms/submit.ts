import { supabase } from "@/integrations/supabase/client";
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/email/config";

export type FormField = { label: string; value: string };

export type SubmitFormPayload = {
  formType: "contact" | "careers" | "talent" | "media";
  department?: "general" | "business" | "research" | "careers" | "media";
  inquiryType?: string;
  service?: string;
  phone?: string;
  country?: string;
  organization?: string;
  preferredContactMethod?: string;
  source?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  consent?: boolean;
  /** Hidden anti-spam field; leave empty. */
  website?: string;
  formTitle: string;
  formSubtitle?: string;
  replyTo?: string;
  fields: FormField[];
  resumePath?: string;
  resumeName?: string;
};

export async function uploadResume(
  file: File,
  formType: SubmitFormPayload["formType"],
): Promise<{ path: string; name: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_ATTACHMENT_MIME.includes(file.type) && !ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
    throw new Error("Attachments must be PDF, Word, Excel, PNG or JPG files.");
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachments must be 10 MB or smaller.");
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const path = `${formType}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("resumes").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message || "Upload failed.");
  return { path, name: file.name };
}

export const uploadAttachment = uploadResume;

export async function submitForm(payload: SubmitFormPayload): Promise<{ reference: string }> {
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
  try {
    const j = await res.json();
    return { reference: (j?.reference as string) ?? "" };
  } catch {
    return { reference: "" };
  }
}
