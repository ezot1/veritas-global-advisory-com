import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), generate: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc: mocks.rpc } }));
vi.mock("@lovable.dev/ai-gateway", () => ({ generateResponse: mocks.generate, GatewayError: class extends Error {} }));
import { generateArticle } from "./article-generator.server";

describe("article pause recovery", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("does not run the provider when automatic generation is paused", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(generateArticle(false)).rejects.toThrow("paused");
    expect(mocks.rpc).toHaveBeenCalledWith("claim_article_generation", expect.objectContaining({ p_manual: false, p_resume: false }));
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("requests exactly one explicitly approved attempt and retains a pause on failure", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValue({ error: null });
    mocks.generate.mockRejectedValue(new Error("Invalid research"));
    await expect(generateArticle(true, true)).rejects.toThrow("Invalid research");
    expect(mocks.rpc).toHaveBeenCalledWith("claim_article_generation", expect.objectContaining({ p_manual: true, p_resume: true }));
    expect(mocks.generate).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith("fail_article_generation", expect.objectContaining({ p_reason: "Research generation needs review before another attempt" }));
    expect(mocks.rpc).not.toHaveBeenCalledWith("complete_article_generation", expect.anything());
  });
});