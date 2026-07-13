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

function generateTempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const raw = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "");
  return raw.slice(0, 10) + "!1";
}

// Gera uma nova senha temporária pra um colaborador que já existe (ex: ele errou ao
// copiar a senha original, ou o link/WhatsApp corrompeu algum caractere). Reaproveita o
// mesmo fluxo de "create-collaborator": senha nova entregue na tela pro admin repassar,
// e must_complete_setup volta a true pra ele cair na tela de completar cadastro de novo.
// Só admin pode chamar — checado via o profile de quem está autenticado na requisição.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return jsonResponse({ error: "Não autenticado." }, 401);
  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData.user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { data: callerProfile } = await supabaseAdmin
    .from("profiles").select("role").eq("id", authData.user.id).single();
  if (!callerProfile || callerProfile.role !== "admin") {
    return jsonResponse({ error: "Só administradores podem gerar nova senha." }, 403);
  }

  const { userId } = await req.json().catch(() => ({} as any));
  if (!userId) return jsonResponse({ error: "Informe o colaborador." }, 400);

  const { data: target, error: targetErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (targetErr || !target?.user) return jsonResponse({ error: "Colaborador não encontrado." }, 404);

  const tempPassword = generateTempPassword();
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });
  if (updateErr) return jsonResponse({ error: updateErr.message }, 400);

  const { error: profileErr } = await supabaseAdmin.from("profiles")
    .update({ must_complete_setup: true }).eq("id", userId);
  if (profileErr) return jsonResponse({ error: profileErr.message }, 400);

  return jsonResponse({ ok: true, email: target.user.email, tempPassword });
});
