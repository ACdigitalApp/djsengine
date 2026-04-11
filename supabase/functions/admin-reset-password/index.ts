import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "acdigital.app@gmail.com";
  const password = "115711";

  // Try to find existing user
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  
  if (listErr) {
    return new Response(JSON.stringify({ error: listErr.message }), { status: 500, headers: corsHeaders });
  }

  const existing = users?.find(u => u.email === email);

  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify({ ok: true, action: "password_reset", userId: existing.id }), { headers: corsHeaders });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify({ ok: true, action: "user_created", userId: data.user.id }), { headers: corsHeaders });
  }
});
