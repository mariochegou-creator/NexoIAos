import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getValidGoogleToken } from "../_shared/googleCalendar.ts";

// Roda ANTES da tarefa ser apagada do banco: remove o evento no Google Calendar
// e a tarefa no Todoist do responsável, pra não deixar lixo órfão nas duas integrações.
Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { task_id } = await req.json().catch(() => ({ task_id: null }));
  if (!task_id) return jsonResponse({ error: "task_id obrigatório." }, 400);

  const { data: task } = await supabaseAdmin.from("tasks").select("*").eq("id", task_id).single();
  if (!task || !task.assigned_user_id) return jsonResponse({ ok: true });

  if (task.google_event_id) {
    try {
      const token = await getValidGoogleToken(task.assigned_user_id);
      if (token) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.google_event_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("task-delete-cleanup calendar error:", err);
    }
  }

  if (task.todoist_task_id) {
    try {
      const { data: tokenRow } = await supabaseAdmin
        .from("integration_tokens").select("access_token")
        .eq("user_id", task.assigned_user_id).eq("provider", "todoist").maybeSingle();
      if (tokenRow) {
        await fetch(`https://api.todoist.com/api/v1/tasks/${task.todoist_task_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenRow.access_token}` },
        });
      }
    } catch (err) {
      console.error("task-delete-cleanup todoist error:", err);
    }
  }

  return jsonResponse({ ok: true });
});
