import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Grava os dados da tela "Complete seu cadastro" (telefone, habilidades, foto, e o flag
// must_complete_setup) via service role. Precisa ser uma function porque colaboradores
// não-admin (a maioria dos primeiros logins) não têm permissão de RLS pra dar update na
// própria linha de `profiles` direto do client — só admin edita profiles hoje. Sem isso, o
// update ficava silencioso (RLS bloqueia sem erro) e o flag nunca virava false, prendendo o
// colaborador num loop de "complete seu cadastro" mesmo com a senha nova certa.
// Só atualiza a própria linha de quem chamou (nunca outro id, nunca o campo `role`).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return jsonResponse({ error: "Não autenticado." }, 401);
  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData.user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { telefone, habilidades, avatarUrl } = await req.json().catch(() => ({} as any));

  const updateObj: Record<string, unknown> = {
    telefone: telefone || null,
    habilidades: habilidades || null,
    must_complete_setup: false,
  };
  if (avatarUrl) updateObj.avatar_url = avatarUrl;

  const { error: profileErr } = await supabaseAdmin.from("profiles")
    .update(updateObj).eq("id", authData.user.id);
  if (profileErr) return jsonResponse({ error: profileErr.message }, 400);

  return jsonResponse({ ok: true });
});
