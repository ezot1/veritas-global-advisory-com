import { describe, expect, it } from "vitest";
import { safeArticleUrl, splitArticleReferences } from "./article-presentation";

describe("article source handling", () => {
  it("retains numbered destinations and removes duplicate reference labels", () => {
    const result = splitArticleReferences(["Evidence [1]", "Sources and references", "[1] [1] Official report - https://example.org/report?year=2026"]);
    expect(result.paragraphs).toEqual(["Evidence [1]"]);
    expect(result.references).toEqual([{ number: 1, title: "Official report", url: "https://example.org/report?year=2026" }]);
  });
  it("keeps articles without bibliography unchanged", () => {
    expect(splitArticleReferences(["Existing analysis"]).paragraphs).toEqual(["Existing analysis"]);
  });
  it("only allows web links", () => {
    expect(safeArticleUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeArticleUrl("https://example.org/report")).toBe("https://example.org/report");
  });
});