import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: "Não autenticado." }, 401);

  if (req.method === "DELETE") {
    const { provider } = await req.json().catch(() => ({ provider: null }));
    if (provider !== "google_calendar" && provider !== "todoist") {
      return jsonResponse({ error: "Provider inválido." }, 400);
    }
    await supabaseAdmin.from("integration_tokens").delete().eq("user_id", user.id).eq("provider", provider);
    return jsonResponse({ ok: true });
  }

  const { data } = await supabaseAdmin
    .from("integration_tokens")
    .select("provider")
    .eq("user_id", user.id);

  const connected = new Set((data || []).map((r) => r.provider));
  return jsonResponse({
    google_calendar: connected.has("google_calendar"),
    todoist: connected.has("todoist"),
  });
});
