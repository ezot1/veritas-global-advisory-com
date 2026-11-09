import { createFileRoute } from "@tanstack/react-router";

function isAuthorized(request: Request): boolean {
  const accepted = [process.env.ARTICLE_GENERATE_SECRET, process.env.ARTICLE_CRON_SECRET].filter(
    (s): s is string => !!s,
  );
  if (accepted.length === 0) return false;
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-generate-secret") ?? url.searchParams.get("secret");
  return !!provided && accepted.includes(provided);
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const { generateArticle } = await import("@/lib/article-generator.server");
    const result = await generateArticle(false);
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
