import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, roleId, phone } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Créer l'utilisateur dans Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password: "Diginets2025!",
  email_confirm: true,
  user_metadata: { first_name: firstName, last_name: lastName }
});

    if (authError) throw authError;

    // Créer le profil dans public.users
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: "00000000-0000-0000-0000-000000000001",
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        role_id: roleId,
        is_active: true,
        password_hash: "supabase_auth",
      });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});