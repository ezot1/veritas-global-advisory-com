import { describe, expect, test } from "bun:test";
import { countPublishedBriefings } from "./publication-count";

describe("published briefing count", () => {
  test("counts actual published records instead of claiming 100", () => {
    expect(countPublishedBriefings([{ slug: "one" }, { slug: "two" }], [{ slug: "three" }])).toBe(3);
  });
  test("counts duplicate public URLs only once", () => {
    expect(countPublishedBriefings([{ slug: "one" }], [{ slug: "one" }, { slug: "two" }])).toBe(2);
  });
  test("uses available static publications when generated publications are unavailable", () => {
    expect(countPublishedBriefings([{ slug: "one" }], [])).toBe(1);
  });
});