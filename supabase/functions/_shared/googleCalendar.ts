import { supabaseAdmin } from "./supabaseAdmin.ts";

interface TokenRow {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
}

// Retorna um access_token válido para o Calendar do usuário, renovando via refresh_token se preciso.
export async function getValidGoogleToken(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("integration_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .maybeSingle<TokenRow>();

  if (!data) return null;

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const stillValid = expiresAt - Date.now() > 60_000; // margem de 1 min
  if (stillValid) return data.access_token;

  if (!data.refresh_token) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const refreshed = await res.json();
  if (!res.ok) {
    console.error("google refresh failed:", refreshed);
    return null;
  }

  await supabaseAdmin.from("integration_tokens").update({
    access_token: refreshed.access_token,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("provider", "google_calendar");

  return refreshed.access_token;
}

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface TaskRow {
  id: string;
  title: string;
  status: string;
  client_name: string | null;
  prazo: string | null;
  assigned_user_id: string | null;
  google_event_id: string | null;
}

// Cria/atualiza/remove o evento equivalente no Google Calendar do responsável pela tarefa.
// Sem prazo não vira evento. Não faz nada (silenciosamente) se o responsável não tiver o Calendar conectado.
export async function syncTaskToGoogleCalendar(task: TaskRow) {
  if (!task.assigned_user_id) return;

  const token = await getValidGoogleToken(task.assigned_user_id);
  if (!token) return;

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const summary = task.client_name ? `[${task.client_name}] ${task.title}` : task.title;

  if (!task.prazo) {
    if (task.google_event_id) {
      await fetch(`${CALENDAR_API}/${task.google_event_id}`, { method: "DELETE", headers });
      await supabaseAdmin.from("tasks").update({ google_event_id: null }).eq("id", task.id);
    }
    return;
  }

  // `prazo` guarda hora local (America/Bahia) sem conversão — manda o horário cru
  // pro Google junto com o timeZone, em vez de converter pra UTC (o valor não é UTC de verdade).
  const TIME_ZONE = "America/Bahia";
  const hasTime = task.prazo.includes("T") && task.prazo.slice(11, 16) !== "00:00";
  const body: Record<string, unknown> = { summary };
  if (hasTime) {
    const localDateTime = task.prazo.slice(0, 19); // "YYYY-MM-DDTHH:MM:SS", sem offset
    const start = new Date(`${localDateTime}Z`); // só pra fazer aritmética de +1h, sem usar como valor final
    const endLocal = new Date(start.getTime() + 60 * 60 * 1000).toISOString().slice(0, 19);
    body.start = { dateTime: localDateTime, timeZone: TIME_ZONE };
    body.end = { dateTime: endLocal, timeZone: TIME_ZONE };
  } else {
    const day = task.prazo.slice(0, 10);
    const next = new Date(`${day}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    body.start = { date: day };
    body.end = { date: next.toISOString().slice(0, 10) };
  }

  if (!task.google_event_id) {
    const created = await fetch(CALENDAR_API, { method: "POST", headers, body: JSON.stringify(body) })
      .then((r) => r.json());
    if (created?.id) {
      await supabaseAdmin.from("tasks").update({ google_event_id: created.id }).eq("id", task.id);
    }
    return;
  }

  await fetch(`${CALENDAR_API}/${task.google_event_id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
}
