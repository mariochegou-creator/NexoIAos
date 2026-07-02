import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { verifyState } from "../_shared/state.ts";

const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback`;
const DASHBOARD_URL = Deno.env.get("DASHBOARD_URL") ?? "https://dashboard.nexoialocal.com.br";

function backToDashboard(result: "connected" | "error", provider?: string, message?: string) {
  const params = new URLSearchParams({ integration: result });
  if (provider) params.set("provider", provider);
  if (message) params.set("message", message);
  return Response.redirect(`${DASHBOARD_URL}/?${params.toString()}`, 302);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");

  if (providerError || !code || !stateParam) {
    return backToDashboard("error", undefined, providerError ?? "missing_code");
  }

  const state = await verifyState(stateParam);
  if (!state) return backToDashboard("error", undefined, "invalid_state");

  try {
    if (state.provider === "google_calendar") {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
          client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      });
      const tokens = await res.json();
      if (!res.ok) throw new Error(tokens.error_description || tokens.error || "token_exchange_failed");

      const row: Record<string, unknown> = {
        user_id: state.userId,
        provider: "google_calendar",
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
      // prompt=consent garante refresh_token na primeira autorização; em reconexões o Google pode omitir.
      if (tokens.refresh_token) row.refresh_token = tokens.refresh_token;

      await supabaseAdmin.from("integration_tokens").upsert(row, { onConflict: "user_id,provider" });
    } else {
      const res = await fetch("https://todoist.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get("TODOIST_CLIENT_ID")!,
          client_secret: Deno.env.get("TODOIST_CLIENT_SECRET")!,
        }),
      });
      const tokens = await res.json();
      if (!res.ok || !tokens.access_token) throw new Error(tokens.error || "token_exchange_failed");

      await supabaseAdmin.from("integration_tokens").upsert({
        user_id: state.userId,
        provider: "todoist",
        access_token: tokens.access_token,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,provider" });
    }
  } catch (err) {
    console.error("oauth-callback error:", err);
    return backToDashboard("error", state.provider, "token_exchange_failed");
  }

  return backToDashboard("connected", state.provider);
});
