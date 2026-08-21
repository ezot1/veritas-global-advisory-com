import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_submission",
  title: "Get inquiry",
  description:
    "Get one inquiry in full, including its message body, submitted fields and the reply thread. Admin access only.",
  inputSchema: { id: z.string().describe("The inquiry id (uuid).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: submission, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!submission) return { content: [{ type: "text", text: `No inquiry found with id ${id}` }], isError: true };

    const { data: messages } = await supabase
      .from("submission_messages")
      .select("id, direction, from_email, to_email, subject, body_text, status, created_at")
      .eq("submission_id", id)
      .order("created_at", { ascending: true });

    const result = { submission, messages: messages ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
