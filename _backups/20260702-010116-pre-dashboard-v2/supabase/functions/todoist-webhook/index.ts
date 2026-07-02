import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

// Verifica a assinatura HMAC-SHA256 que o Todoist envia em cada webhook, usando o
// client_secret do app (nunca confiar em payload de webhook sem verificar a origem).
async function isValidSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = Deno.env.get("TODOIST_CLIENT_SECRET") ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signatureHeader;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  const rawBody = await req.text();
  const signature = req.headers.get("X-Todoist-Hmac-SHA256");
  if (!(await isValidSignature(rawBody, signature))) {
    return new Response("invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.event_name as string;
  const itemId = payload.event_data?.id as string | undefined;

  if (itemId && (eventName === "item:completed" || eventName === "item:uncompleted")) {
    const newStatus = eventName === "item:completed" ? "concluido" : "pendente";
    await supabaseAdmin.from("tasks").update({ status: newStatus }).eq("todoist_task_id", itemId);
  }

  // Todoist só precisa de um 200 rápido — o processamento acima já foi feito.
  return new Response("ok", { status: 200 });
});
