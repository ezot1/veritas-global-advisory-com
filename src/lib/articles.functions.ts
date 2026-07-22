import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Article } from "@/data/articles";

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function rowToArticle(row: any): Article {
  return {
    slug: row.slug,
    img: row.image_url,
    tag: row.tag,
    region: row.region,
    title: row.title,
    author: row.author,
    date: row.published_date,
    summary: row.summary,
    body: Array.isArray(row.body) ? row.body : [],
  };
}

export const listGeneratedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("generated_articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [] as Article[];
  return (data ?? []).map(rowToArticle);
});
