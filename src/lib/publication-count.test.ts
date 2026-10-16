import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { countPublishedBriefings } from "./publication-count";

describe("published briefing count", () => {
  test("counts actual published records instead of claiming 100", () => {
    assert.equal(countPublishedBriefings([{ slug: "one" }, { slug: "two" }], [{ slug: "three" }]), 3);
  });
  test("counts duplicate public URLs only once", () => {
    assert.equal(countPublishedBriefings([{ slug: "one" }], [{ slug: "one" }, { slug: "two" }]), 2);
  });
  test("uses available static publications when generated publications are unavailable", () => {
    assert.equal(countPublishedBriefings([{ slug: "one" }], []), 1);
  });
});