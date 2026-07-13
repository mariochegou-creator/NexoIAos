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

// Cria a conta de um novo colaborador já com senha temporária (sem depender de envio de
// e-mail — o limite de envio padrão do Supabase é baixo demais pra esse uso ocasional).
// O admin recebe a senha na tela pra repassar por WhatsApp. No primeiro login, o flag
// `must_complete_setup` manda o colaborador pra tela de completar cadastro, onde ele troca
// a senha e preenche foto/telefone/habilidades.
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
    return jsonResponse({ error: "Só administradores podem adicionar colaborador." }, 403);
  }

  const { email, name, role, color } = await req.json().catch(() => ({} as any));
  if (!email || !name || !role) return jsonResponse({ error: "Preencha e-mail, nome e função." }, 400);
  if (!["admin", "operacional", "financeiro"].includes(role)) {
    return jsonResponse({ error: "Função inválida." }, 400);
  }

  const tempPassword = generateTempPassword();
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password: tempPassword, email_confirm: true, user_metadata: { name },
  });
  if (createErr || !created?.user) {
    return jsonResponse({ error: createErr?.message || "Não foi possível criar a conta (o e-mail já existe?)." }, 400);
  }

  const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
    id: created.user.id, name, role, color: color || "#00c8e8", must_complete_setup: true,
  });
  if (profileErr) return jsonResponse({ error: profileErr.message }, 400);

  return jsonResponse({ ok: true, email, tempPassword });
});
