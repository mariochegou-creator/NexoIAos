// Login pelo CRM: os colaboradores entram com o MESMO e-mail/senha do DeskcommCRM.
// O app não guarda senha — repassa o login pro Supabase Auth do projeto do CRM
// (pdtbrtccausjlrzzsiqe) e depois só valida o token a cada requisição.
// Sem CRM_SUPABASE_URL/KEY configurados, o app roda aberto (dev local).

const CRM_URL = process.env.CRM_SUPABASE_URL || '';
const CRM_KEY = process.env.CRM_SUPABASE_SERVICE_KEY || '';

export function authEnabled(): boolean {
  return Boolean(CRM_URL && CRM_KEY);
}

export interface UsuarioLogado {
  id: string;
  email: string;
}

export async function loginCRM(
  email: string,
  senha: string,
): Promise<{ token: string; usuario: UsuarioLogado } | { erro: string }> {
  const res = await fetch(`${CRM_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: CRM_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: senha }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    user?: { id: string; email: string };
    error_description?: string;
    msg?: string;
  };
  if (!res.ok || !json.access_token || !json.user) {
    return { erro: 'E-mail ou senha inválidos (use o mesmo login do CRM).' };
  }
  return { token: json.access_token, usuario: { id: json.user.id, email: json.user.email } };
}

// Cache de validação (evita bater no Supabase a cada turno de voz)
const cache = new Map<string, { usuario: UsuarioLogado; validoAte: number }>();
const CACHE_MS = 5 * 60 * 1000;

export async function validarToken(token: string): Promise<UsuarioLogado | null> {
  const hit = cache.get(token);
  if (hit && hit.validoAte > Date.now()) return hit.usuario;

  const res = await fetch(`${CRM_URL}/auth/v1/user`, {
    headers: { apikey: CRM_KEY, authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    cache.delete(token);
    return null;
  }
  const json = (await res.json()) as { id?: string; email?: string };
  if (!json.id || !json.email) return null;
  const usuario = { id: json.id, email: json.email };
  cache.set(token, { usuario, validoAte: Date.now() + CACHE_MS });
  if (cache.size > 500) cache.clear();
  return usuario;
}
