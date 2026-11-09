import { describe, expect, it } from "vitest";
import { ARTICLE_INTERVAL_DAYS, researchArticleSchema, validateResearchSources } from "./article-research";

describe("article research rules", () => {
  it("uses the requested two-week interval", () => expect(ARTICLE_INTERVAL_DAYS).toBe(14));
  it("rejects generic short articles without sourced evidence", () => {
    expect(researchArticleSchema.safeParse({ title: "A generic regional overview", summary: "Generic", body: ["Commentary"], sources: [] }).success).toBe(false);
  });
  it("rejects citations to sources not found during research", () => {
    expect(() => validateResearchSources({ title: "Research", summary: "Summary", body: ["Evidence [1]"], sources: [{ title: "Invented source", url: "https://example.org/invented" }] }, new Set())).toThrow("not returned");
  });
});