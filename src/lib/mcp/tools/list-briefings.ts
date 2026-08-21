import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_briefings",
  title: "List research briefings",
  description: "List published Veritas Global Advisory research briefings, newest first.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum briefings to return (default 10, max 50)."),
    include_body: z.boolean().optional().describe("Include full article body paragraphs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, include_body }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const columns = include_body
      ? "slug, title, summary, body, author, region, tag, image_url, published_date, created_at"
      : "slug, title, summary, author, region, tag, published_date, created_at";
    const { data, error } = await supabase
      .from("generated_articles")
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 10, 1), 50));
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { briefings: data ?? [] },
    };
  },
});
