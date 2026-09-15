import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const REGIONAL_FOCUSES = [
  {
    region: "Asia-Pacific",
    tag: "Asia Focus",
    focus: "Indo-Pacific security, technology supply chains, trade, and regional diplomacy",
    author: "Dr. Maya Chen, Senior Fellow for Asia-Pacific Strategy",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    region: "Europe",
    tag: "Europe & Eurasia",
    focus: "European security, industrial policy, energy resilience, and transatlantic relations",
    author: "Dr. Elias Moreau, Senior Fellow for European Affairs",
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    region: "Africa",
    tag: "Africa Watch",
    focus: "African trade, critical minerals, governance, infrastructure, and regional integration",
    author: "Amara Okafor, Senior Fellow for African Markets and Governance",
    image: "https://images.unsplash.com/photo-1489493512598-d08130f49bea?auto=format&fit=crop&w=1600&q=80",
  },
  {
    region: "Middle East",
    tag: "Middle East Insights",
    focus: "Middle Eastern security, energy transitions, capital flows, and economic diversification",
    author: "Dr. Samir Haddad, Senior Fellow for Middle East Strategy",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    region: "Americas",
    tag: "Americas Briefing",
    focus: "trade, investment, democratic governance, and strategic competition across the Americas",
    author: "Sofia Alvarez, Senior Fellow for the Americas",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1600&q=80",
  },
] as const;


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
  const pick = REGIONAL_FOCUSES[idx % REGIONAL_FOCUSES.length];

  const gateway = createLovableAiGatewayProvider(lovableKey);

  const prompt = `Write an in-depth, ~1200 word institutional research briefing from Veritas Global Advisory focused on current, real-world developments in ${pick.region} for 2026, with particular attention to ${pick.focus}. Connect regional developments to global geopolitical, economic, security, and business implications. Voice must be authoritative, analytical, and comparable to a top-tier think tank or consulting firm. Do NOT use em dashes; use hyphens with spaces instead. Cite specific countries, institutions, figures, and recent events. Structure as 10-14 substantive paragraphs.

Return:
- title: sharp, editorial (max 140 chars, no colon-heavy academic style)
- summary: 2-3 sentence executive summary (max 400 chars)
- body: array of 10-14 paragraph strings (each 120-220 words)`;

  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    output: Output.object({
      schema: z.object({
        title: z.string(),
        summary: z.string(),
        body: z.array(z.string()),
      }),
    }),
    prompt,
  });

  const generated = output;
  const baseSlug = slugify(generated.title) || "worldwide-briefing";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { error: insertError } = await admin.from("generated_articles").insert({
    slug,
    continent: pick.region,
    tag: pick.tag,
    region: pick.region,
    title: generated.title,
    summary: generated.summary,
    body: generated.body,
    author: pick.author,
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

const MIN_INTERVAL_MS = 12 * 60 * 60 * 1000; // one run per 12 hours max

function isAuthorized(request: Request): boolean {
  const expected = process.env.ARTICLE_GENERATE_SECRET;
  if (!expected) return false;
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-generate-secret") ?? url.searchParams.get("secret");
  return provided === expected;
}

async function throttled(): Promise<boolean> {
  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data } = await admin
    .from("article_rotation_state")
    .select("last_run_at")
    .eq("id", 1)
    .maybeSingle();
  if (!data?.last_run_at) return false;
  return Date.now() - new Date(data.last_run_at).getTime() < MIN_INTERVAL_MS;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    if (await throttled()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Rate limited: an article was generated recently" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await generate();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-article failed", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Article generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const Route = createFileRoute("/api/public/hooks/generate-article")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
