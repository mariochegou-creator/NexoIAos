import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cliente com service role: só roda dentro das Edge Functions, nunca no browser.
export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Resolve o usuário autenticado a partir do JWT enviado pelo front (Authorization: Bearer <access_token>).
export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
