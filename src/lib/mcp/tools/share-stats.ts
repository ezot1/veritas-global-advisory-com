import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "article_share_stats",
  title: "Article share stats",
  description:
    "Summarise how often briefings have been shared, broken down by channel (whatsapp, x, linkedin, email, copy). Admin access only.",
  inputSchema: {
    slug: z.string().optional().describe("Limit the summary to one article slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("article_share_events")
      .select("article_slug, article_title, channel")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (slug) query = query.eq("article_slug", slug);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const byArticle = new Map<string, { slug: string; title: string; total: number; channels: Record<string, number> }>();
    for (const row of data ?? []) {
      const key = row.article_slug ?? "unknown";
      const entry = byArticle.get(key) ?? {
        slug: key,
        title: row.article_title ?? key,
        total: 0,
        channels: {} as Record<string, number>,
      };
      const channel: string = row.channel ?? "unknown";
      entry.total += 1;
      entry.channels[channel] = (entry.channels[channel] ?? 0) + 1;
      byArticle.set(key, entry);
    }
    const stats = [...byArticle.values()].sort((a, b) => b.total - a.total);
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: { stats },
    };
  },
});
