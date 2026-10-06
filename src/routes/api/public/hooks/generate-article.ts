import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateArticle } from "@/lib/article-generator.server";

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
    const result = await generateArticle();
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
