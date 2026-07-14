import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type GlobeMarker = {
  id: string;
  label: string;
  kind: string;
  latitude: number;
  longitude: number;
  href: string | null;
  description: string | null;
};

export const listGlobeMarkers = createServerFn({ method: "GET" }).handler(async (): Promise<GlobeMarker[]> => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("globe_markers")
    .select("id,label,kind,latitude,longitude,href,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GlobeMarker[];
});
