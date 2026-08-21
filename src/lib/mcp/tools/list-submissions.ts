import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_submissions",
  title: "List inquiries",
  description:
    "List inquiries submitted through the contact, careers and talent-network forms, newest first. Admin access only.",
  inputSchema: {
    status: z.enum(["new", "read", "replied", "archived"]).optional().describe("Filter by workflow status."),
    form_type: z.string().optional().describe("Filter by form type, e.g. contact, careers, talent."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, form_type, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("form_submissions")
      .select(
        "id, form_type, department, subject, sender_name, sender_email, sender_organization, sender_country, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));
    if (status) query = query.eq("status", status);
    if (form_type) query = query.eq("form_type", form_type);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { submissions: data ?? [] },
    };
  },
});
