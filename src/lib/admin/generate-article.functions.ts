import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const generateArticleNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ resume: z.boolean().default(false) }))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: state, error } = await supabaseAdmin.from("article_rotation_state").select("paused_reason").eq("id", 1).single();
    if (error) throw error;
    if (state.paused_reason && !data.resume) return { status: "paused" as const, reason: state.paused_reason };
    const { generateArticle } = await import("@/lib/article-generator.server");
    return { status: "published" as const, ...await generateArticle(true, data.resume) };
  });
