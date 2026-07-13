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

// Desliga um colaborador: reatribui trabalho ATIVO (tarefas não concluídas, leads em aberto,
// clientes não encerrados, prospecção pendente) pra quem está desligando, apaga o login e o
// perfil. Histórico (activity_log, handoff, tarefas/leads/clientes já fechados) mantém o nome
// antigo de propósito — só o trabalho em andamento precisa de um dono novo.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return jsonResponse({ error: "Não autenticado." }, 401);
  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData.user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { data: callerProfile } = await supabaseAdmin
    .from("profiles").select("name,role").eq("id", authData.user.id).single();
  if (!callerProfile || callerProfile.role !== "admin") {
    return jsonResponse({ error: "Só administradores podem desligar colaborador." }, 403);
  }

  const { userId } = await req.json().catch(() => ({} as any));
  if (!userId) return jsonResponse({ error: "userId obrigatório." }, 400);
  if (userId === authData.user.id) return jsonResponse({ error: "Você não pode desligar a si mesmo." }, 400);

  const { data: target } = await supabaseAdmin.from("profiles").select("name").eq("id", userId).single();
  if (!target) return jsonResponse({ error: "Colaborador não encontrado." }, 404);

  const reassignTo = callerProfile.name;
  const targetName = target.name;
  const now = new Date().toISOString();

  await supabaseAdmin.from("tasks").update({ resp: reassignTo, updated_at: now })
    .eq("resp", targetName).neq("status", "concluido");
  await supabaseAdmin.from("leads").update({ responsavel: reassignTo, updated_at: now })
    .eq("responsavel", targetName).not("etapa_funil", "in", "(fechado,perdido)");
  await supabaseAdmin.from("clientes").update({ responsavel: reassignTo })
    .eq("responsavel", targetName).neq("status", "encerrado");
  await supabaseAdmin.from("prospeccao").update({ responsavel: reassignTo, updated_at: now })
    .eq("responsavel", targetName).eq("status", "pendente");

  await supabaseAdmin.from("activity_log").insert({
    client_name: null,
    user_name: reassignTo,
    description: `${targetName} foi desligado(a) — tarefas, leads e clientes ativos foram reatribuídos pra ${reassignTo}.`,
  });

  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (delErr) return jsonResponse({ error: delErr.message }, 400);
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  return jsonResponse({ ok: true, reassignedTo: reassignTo });
});
