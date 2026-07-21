import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { articles } from "@/data/articles";

const BASE_URL = "https://veritasglobaladvisory.org";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/insights", changefreq: "weekly", priority: "0.9" },
          { path: "/talent", changefreq: "monthly", priority: "0.7" },
          { path: "/leadership", changefreq: "monthly", priority: "0.7" },
          { path: "/careers", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/auth", changefreq: "never", priority: "0.1" },
          { path: "/admin", changefreq: "never", priority: "0.1" },
          { path: "/email/unsubscribe", changefreq: "never", priority: "0.1" },
          { path: "/api/public/forms/submit", changefreq: "never", priority: "0.1" },
          ...articles.map((a) => ({
            path: `/insights/${a.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n` +
              `    <loc>${BASE_URL}${e.path}</loc>\n` +
              (e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>\n` : "") +
              (e.priority ? `    <priority>${e.priority}</priority>\n` : "") +
              `  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
