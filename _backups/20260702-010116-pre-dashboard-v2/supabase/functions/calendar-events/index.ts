import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest } from "../_shared/supabaseAdmin.ts";
import { getValidGoogleToken } from "../_shared/googleCalendar.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  const token = await getValidGoogleToken(user.id);
  if (!token) return jsonResponse({ connected: false, events: [] });

  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: "8",
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    console.error("google calendar events error:", await res.text());
    return jsonResponse({ connected: true, events: [], error: "Falha ao buscar eventos." }, 502);
  }
  const data = await res.json();
  const events = (data.items || []).map((e: Record<string, unknown>) => ({
    id: e.id,
    title: e.summary || "(sem título)",
    start: (e.start as { dateTime?: string; date?: string })?.dateTime || (e.start as { date?: string })?.date,
    end: (e.end as { dateTime?: string; date?: string })?.dateTime || (e.end as { date?: string })?.date,
    link: e.htmlLink,
  }));

  return jsonResponse({ connected: true, events });
});
