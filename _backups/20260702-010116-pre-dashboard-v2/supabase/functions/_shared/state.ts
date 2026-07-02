// Assina/valida o parâmetro `state` do fluxo OAuth, pra garantir que o callback
// sabe pra qual usuário do Supabase o token pertence, sem confiar em nada vindo do browser.

async function hmacKey() {
  const secret = Deno.env.get("STATE_SECRET") ?? "";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + (4 - (str.length % 4)) % 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

export interface OAuthStatePayload {
  userId: string;
  provider: "google_calendar" | "todoist";
  exp: number; // epoch seconds
}

export async function signState(payload: OAuthStatePayload): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifyState(state: string): Promise<OAuthStatePayload | null> {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const key = await hmacKey();
  const valid = await crypto.subtle.verify("HMAC", key, b64urlDecode(sig), new TextEncoder().encode(body));
  if (!valid) return null;
  const payload: OAuthStatePayload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
