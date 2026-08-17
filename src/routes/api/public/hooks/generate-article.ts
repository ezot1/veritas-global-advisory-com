import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const WORLD_FOCUS = {
  region: "Worldwide",
  tag: "Global Affairs",
  image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
};


function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function generate() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const lovableKey = process.env.LOVABLE_API_KEY!;
  if (!supabaseUrl || !serviceKey || !lovableKey) {
    throw new Error("Missing required env vars");
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Read + advance rotation
  const { data: state } = await admin
    .from("article_rotation_state")
    .select("next_index")
    .eq("id", 1)
    .maybeSingle();
  const idx = state?.next_index ?? 0;
  const pick = WORLD_FOCUS;

  const gateway = createLovableAiGatewayProvider(lovableKey);

  const prompt = `Write an in-depth, ~1200 word institutional research briefing from Veritas Global Advisory focused on current, real-world worldwide developments for 2026. Cover geopolitics, economics, security, and business implications across multiple regions. Voice must be authoritative, analytical, and comparable to a top-tier think tank or consulting firm. Do NOT use em dashes; use hyphens with spaces instead. Cite specific countries, institutions, figures, and recent events. Structure as 10-14 substantive paragraphs.

Return:
- title: sharp, editorial (max 140 chars, no colon-heavy academic style)
- summary: 2-3 sentence executive summary (max 400 chars)
- body: array of 10-14 paragraph strings (each 120-220 words)
- author: a plausible senior fellow name for Veritas Global Advisory`;

  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    output: Output.object({
      schema: z.object({
        title: z.string(),
        summary: z.string(),
        body: z.array(z.string()),
        author: z.string(),
      }),
    }),
    prompt,
  });

  const generated = output;
  const baseSlug = slugify(generated.title) || "worldwide-briefing";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { error: insertError } = await admin.from("generated_articles").insert({
    slug,
    continent: "Worldwide",
    tag: pick.tag,
    region: pick.region,
    title: generated.title,
    summary: generated.summary,
    body: generated.body,
    author: generated.author || "Veritas Research Desk",
    image_url: pick.image,
    published_date: formatDate(new Date()),
  });
  if (insertError) throw insertError;

  await admin
    .from("article_rotation_state")
    .update({ next_index: idx + 1, last_run_at: new Date().toISOString() })
    .eq("id", 1);

  return { slug, region: pick.region, title: generated.title };

}

export const Route = createFileRoute("/api/public/hooks/generate-article")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await generate();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("generate-article failed", err);
          return new Response(
            JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      GET: async () => {
        // Allow manual trigger via browser for testing
        try {
          const result = await generate();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
