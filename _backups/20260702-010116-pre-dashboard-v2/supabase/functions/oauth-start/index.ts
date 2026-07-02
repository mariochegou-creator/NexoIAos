import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest } from "../_shared/supabaseAdmin.ts";
import { signState } from "../_shared/state.ts";

const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback`;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  const { provider } = await req.json().catch(() => ({ provider: null }));
  if (provider !== "google_calendar" && provider !== "todoist") {
    return jsonResponse({ error: "Provider inválido." }, 400);
  }

  const state = await signState({
    userId: user.id,
    provider,
    exp: Math.floor(Date.now() / 1000) + 600, // 10 min pra completar o fluxo
  });

  let url: string;
  if (provider === "google_calendar") {
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) return jsonResponse({ error: "Integração Google Calendar ainda não configurada." }, 503);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      state,
    });
    url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } else {
    const clientId = Deno.env.get("TODOIST_CLIENT_ID");
    if (!clientId) return jsonResponse({ error: "Integração Todoist ainda não configurada." }, 503);
    const params = new URLSearchParams({
      client_id: clientId,
      scope: "data:read_write",
      state,
    });
    url = `https://todoist.com/oauth/authorize?${params.toString()}`;
  }

  return jsonResponse({ url });
});
