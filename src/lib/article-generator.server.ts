import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import { researchArticleSchema, researchPrompt, validateResearchSources } from "./article-research";

export const REGIONAL_FOCUSES = [
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
    image: "https://veritasglobaladvisory.org/__l5e/assets-v1/de6e278c-169e-44f5-bc8d-eddd4bfb6d44/insight-middle-east.jpg",
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

export async function generateArticle(manual = true, resume = false) {
  const token = crypto.randomUUID();
  const { data: idx, error } = await supabaseAdmin.rpc("claim_article_generation", { p_token: token, p_manual: manual, p_resume: resume });
  if (error) throw error;
  if (idx === null) throw new Error("Article generation is paused, already running, or not yet due");
  const pick = REGIONAL_FOCUSES[idx % REGIONAL_FOCUSES.length];
  if (!pick) throw new Error("Invalid regional rotation");
  try {
    const response = await generateResponse({
      model: "openai/gpt-6-astra",
      input: researchPrompt(pick.region, pick.focus, new Date().toISOString().slice(0, 10)),
      tools: [{ type: "web_search", search_context_size: "high" }],
      max_tool_calls: 10,
      include: ["web_search_call.action.sources"],
      text: { format: { type: "json_schema", name: "research_article", strict: true, schema: z.toJSONSchema(researchArticleSchema.extend({ sources: z.array(z.object({ title: z.string(), url: z.string() })).min(6).max(14) })) } },
    });
    const researchedUrls = new Set<string>();
    let text = "";
    for (const item of response.output) {
      if (item.type === "web_search_call" && item.action) {
        if (item.action.type === "search") item.action.sources?.forEach((s) => researchedUrls.add(s.url));
        if ((item.action.type === "open_page" || item.action.type === "find_in_page") && item.action.url) researchedUrls.add(item.action.url);
      }
      if (item.type === "message") for (const part of item.content) {
        if (part.type === "refusal") throw new Error("Research generation was refused");
        if (part.type === "output_text") {
          text += part.text;
          for (const annotation of part.annotations) if (annotation.type === "url_citation") researchedUrls.add(annotation.url);
        }
      }
    }
    if (response.status !== "completed") throw new Error("Research generation did not complete");
    const article = researchArticleSchema.parse(JSON.parse(text));
    validateResearchSources(article, researchedUrls);
    const slug = `${slugify(article.title)}-${token.slice(0, 8)}`;
    const { data: completed, error: completeError } = await supabaseAdmin.rpc("complete_article_generation", {
      p_token: token,
      p_article: {
        slug, continent: pick.region, tag: pick.tag, region: pick.region,
        title: article.title, summary: article.summary,
        body: [...article.body, "Sources and references", ...article.sources.map((s, i) => `[${i + 1}] ${s.title} - ${s.url}`)],
        author: "Veritas Global Advisory Research Desk", image_url: pick.image,
        published_date: formatDate(new Date()),
      },
    });
    if (completeError) throw completeError;
    if (!completed) throw new Error("Research publication lock was lost");
    return { slug, region: pick.region, title: article.title };
  } catch (err) {
    const reason = err instanceof GatewayError ? `Research generation paused: ${err.code}` : "Research generation needs review before another attempt";
    const { error: releaseError } = await supabaseAdmin.rpc("fail_article_generation", { p_token: token, p_reason: reason });
    if (releaseError) console.error("Could not record article generation pause", releaseError);
    throw err;
  }
}
