import { supabaseAdmin } from "./supabaseAdmin.ts";

const TODOIST_API = "https://api.todoist.com/api/v1";

interface TokenRow {
  access_token: string;
  todoist_project_id: string | null;
}

async function getTodoistToken(userId: string): Promise<TokenRow | null> {
  const { data } = await supabaseAdmin
    .from("integration_tokens")
    .select("access_token, todoist_project_id")
    .eq("user_id", userId)
    .eq("provider", "todoist")
    .maybeSingle<TokenRow>();
  return data;
}

async function ensureProject(userId: string, accessToken: string, existingProjectId: string | null): Promise<string> {
  if (existingProjectId) return existingProjectId;

  const list = await fetch(`${TODOIST_API}/projects`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((r) => r.json());
  const found = (list?.results || []).find((p: { name: string }) => p.name === "NEXO IA");
  let projectId = found?.id as string | undefined;

  if (!projectId) {
    const created = await fetch(`${TODOIST_API}/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "NEXO IA" }),
    }).then((r) => r.json());
    projectId = created.id;
  }

  await supabaseAdmin.from("integration_tokens")
    .update({ todoist_project_id: projectId, updated_at: new Date().toISOString() })
    .eq("user_id", userId).eq("provider", "todoist");

  return projectId!;
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  client_name: string | null;
  prazo: string | null;
  assigned_user_id: string | null;
  todoist_task_id: string | null;
}

// Cria/atualiza/conclui o item equivalente no Todoist do responsável pela tarefa.
// Não faz nada (silenciosamente) se o responsável não tiver o Todoist conectado.
export async function syncTaskToTodoist(task: TaskRow) {
  if (!task.assigned_user_id) return;

  const tokenRow = await getTodoistToken(task.assigned_user_id);
  if (!tokenRow) return;

  const projectId = await ensureProject(task.assigned_user_id, tokenRow.access_token, tokenRow.todoist_project_id);
  const content = task.client_name ? `[${task.client_name}] ${task.title}` : task.title;
  const headers = { Authorization: `Bearer ${tokenRow.access_token}`, "Content-Type": "application/json" };
  // `prazo` pode vir com hora (YYYY-MM-DDTHH:MM) ou só data (YYYY-MM-DD).
  const dueField = task.prazo?.includes("T") ? { due_datetime: task.prazo } : { due_date: task.prazo || undefined };

  if (!task.todoist_task_id) {
    if (task.status === "concluido") return; // não recria tarefa já concluída
    const created = await fetch(`${TODOIST_API}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content, project_id: projectId, ...dueField }),
    }).then((r) => r.json());

    if (created?.id) {
      await supabaseAdmin.from("tasks").update({ todoist_task_id: created.id }).eq("id", task.id);
    }
    return;
  }

  // Já existe no Todoist: atualiza conteúdo/prazo e sincroniza estado de conclusão.
  await fetch(`${TODOIST_API}/tasks/${task.todoist_task_id}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content, ...dueField }),
  });

  const closeEndpoint = task.status === "concluido" ? "close" : "reopen";
  await fetch(`${TODOIST_API}/tasks/${task.todoist_task_id}/${closeEndpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenRow.access_token}` },
  });
}
