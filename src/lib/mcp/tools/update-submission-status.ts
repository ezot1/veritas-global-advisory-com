import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_submission_status",
  title: "Update inquiry status",
  description: "Change an inquiry's workflow status (new, read, replied, archived). Admin access only.",
  inputSchema: {
    id: z.string().describe("The inquiry id (uuid)."),
    status: z.enum(["new", "read", "replied", "archived"]).describe("New workflow status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("form_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No inquiry updated for id ${id}` }], isError: true };
    return {
      content: [{ type: "text", text: `Inquiry ${data.id} is now "${data.status}".` }],
      structuredContent: { submission: data },
    };
  },
});
