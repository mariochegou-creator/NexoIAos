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
