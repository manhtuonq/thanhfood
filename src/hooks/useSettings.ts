import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SettingKey = "owner" | "branding" | "footer" | "socials";

export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((r: any) => { map[r.key] = r.value; });
      return map as Record<SettingKey, any>;
    },
  });
}
