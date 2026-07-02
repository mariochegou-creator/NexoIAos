import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { syncTaskToTodoist } from "../_shared/todoist.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { task_id } = await req.json().catch(() => ({ task_id: null }));
  if (!task_id) return jsonResponse({ error: "task_id obrigatório." }, 400);

  const { data: task, error } = await supabaseAdmin.from("tasks").select("*").eq("id", task_id).single();
  if (error || !task) return jsonResponse({ error: "Tarefa não encontrada." }, 404);

  try {
    await syncTaskToTodoist(task);
  } catch (err) {
    console.error("todoist-sync error:", err);
    return jsonResponse({ synced: false, error: "Falha ao sincronizar com o Todoist." }, 502);
  }

  return jsonResponse({ synced: true });
});
