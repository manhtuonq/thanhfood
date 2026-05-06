// Bootstrap admin user thanhfood / 123zxc123 (idempotent)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const ADMIN_EMAIL = "thanhfood@admin.local";
  const ADMIN_PASSWORD = "123zxc123";
  const ADMIN_USERNAME = "thanhfood";

  try {
    // Check existing
    const { data: existing } = await supabase.auth.admin.listUsers();
    let user = existing?.users?.find((u) => u.email === ADMIN_EMAIL);

    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { username: ADMIN_USERNAME, display_name: "Thanh Food Admin" },
      });
      if (error) throw error;
      user = data.user!;
    }

    // Ensure admin role
    await supabase.from("user_roles").upsert(
      { user_id: user!.id, role: "admin" },
      { onConflict: "user_id,role" }
    );
    // Ensure profile username
    await supabase.from("profiles").upsert({
      id: user!.id,
      username: ADMIN_USERNAME,
      display_name: "Thanh Food Admin",
    });

    return new Response(
      JSON.stringify({ ok: true, username: ADMIN_USERNAME, email: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
