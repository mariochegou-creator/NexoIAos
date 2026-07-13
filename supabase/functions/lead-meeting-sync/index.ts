import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getValidGoogleToken } from "../_shared/googleCalendar.ts";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TIME_ZONE = "America/Bahia";
const STAGE_LABEL: Record<string, string> = { r1_agendada: "R1", r2_agendada: "R2" };
const STAGE_DATE_FIELD: Record<string, string> = { r1_agendada: "data_r1_prevista", r2_agendada: "data_r2_prevista" };

// Cria (ou atualiza, se já existir um evento pra essa mesma etapa) o evento de R1/R2 no Google
// Calendar do responsável pelo lead, com Google Meet e convite por e-mail pro cliente.
Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { lead_id } = await req.json().catch(() => ({ lead_id: null }));
  if (!lead_id) return jsonResponse({ error: "lead_id obrigatório." }, 400);

  const { data: lead, error } = await supabaseAdmin.from("leads").select("*").eq("id", lead_id).single();
  if (error || !lead) return jsonResponse({ error: "Lead não encontrado." }, 404);

  const stage = lead.etapa_funil as string;
  const dateField = STAGE_DATE_FIELD[stage];
  if (!dateField) return jsonResponse({ error: "Lead não está numa etapa de reunião (R1 ou R2 agendada)." }, 400);
  if (!lead.email) return jsonResponse({ error: "Informe o e-mail do cliente antes de agendar." }, 400);
  const meetingAt = lead[dateField] as string | null;
  if (!meetingAt) return jsonResponse({ error: "Informe a data e hora da reunião." }, 400);

  // Responsável guardado como nome (texto) em leads — resolve pro profile dele pra saber de
  // quem é a agenda do Google. Se não achar, cai na agenda de quem clicou em "Agendar".
  let assignedUserId: string | null = null;
  if (lead.responsavel) {
    const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("name", lead.responsavel).maybeSingle();
    assignedUserId = profile?.id || null;
  }
  if (!assignedUserId) assignedUserId = user.id;

  const token = await getValidGoogleToken(assignedUserId);
  if (!token) return jsonResponse({ connected: false, error: "Conecte o Google Calendar em \"Minha conta\" antes de agendar." });

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // `meetingAt` guarda hora local (America/Bahia) sem conversão, igual o sync de tasks —
  // manda o horário cru pro Google junto com o timeZone.
  const localDateTime = meetingAt.slice(0, 19);
  const startForMath = new Date(`${localDateTime}Z`);
  const endLocal = new Date(startForMath.getTime() + 45 * 60 * 1000).toISOString().slice(0, 19);

  const body: Record<string, unknown> = {
    summary: `${STAGE_LABEL[stage]} — ${lead.nome}`,
    description: [lead.segmento, lead.cidade].filter(Boolean).join(" · ") || undefined,
    start: { dateTime: localDateTime, timeZone: TIME_ZONE },
    end: { dateTime: endLocal, timeZone: TIME_ZONE },
    attendees: [{ email: lead.email }],
    conferenceData: {
      createRequest: {
        requestId: `${lead.id}-${stage}-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const reuseEvent = Boolean(lead.google_event_id) && lead.google_event_stage === stage;
  const url = reuseEvent ? `${CALENDAR_API}/${lead.google_event_id}` : CALENDAR_API;
  const method = reuseEvent ? "PATCH" : "POST";

  const res = await fetch(`${url}?conferenceDataVersion=1&sendUpdates=all`, { method, headers, body: JSON.stringify(body) });
  if (!res.ok) {
    console.error("lead-meeting-sync google error:", await res.text());
    return jsonResponse({ synced: false, error: "Falha ao criar o evento no Google Calendar." }, 502);
  }
  const created = await res.json();
  const meetLink = created?.hangoutLink
    || (created?.conferenceData?.entryPoints || []).find((e: { entryPointType?: string }) => e.entryPointType === "video")?.uri
    || null;

  await supabaseAdmin.from("leads").update({
    google_event_id: created.id,
    google_event_stage: stage,
    google_meet_link: meetLink,
    updated_at: new Date().toISOString(),
  }).eq("id", lead_id);

  return jsonResponse({ synced: true, meet_link: meetLink, event_link: created.htmlLink });
});
