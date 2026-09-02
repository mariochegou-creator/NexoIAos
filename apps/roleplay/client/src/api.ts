import type {
  CreateSessionRequest,
  CreateSessionResponse,
  Persona,
  Scorecard,
  SessionDetail,
  SessionSummary,
} from '../../shared/types.ts';

const TOKEN_KEY = 'nexo_treino_token';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  const token = getToken();
  if (token) h.authorization = `Bearer ${token}`;
  return h;
}

export class UnauthorizedError extends Error {}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
  if (res.status === 401) throw new UnauthorizedError('código de acesso inválido');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () =>
    req<{ ok: boolean; anthropic: boolean; supabase: boolean; voz: boolean }>('/api/health'),
  personas: () => req<Persona[]>('/api/personas'),
  login: async (email: string, senha: string): Promise<void> => {
    const res = await req<{ token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setToken(res.token);
  },
  stt: async (audio: Blob): Promise<string> => {
    const h: Record<string, string> = { 'content-type': audio.type || 'audio/webm' };
    const token = getToken();
    if (token) h.authorization = `Bearer ${token}`;
    const res = await fetch('/api/stt', { method: 'POST', headers: h, body: audio });
    if (!res.ok) throw new Error('não consegui transcrever sua fala — tente de novo');
    const json = (await res.json()) as { texto: string };
    return json.texto;
  },
  tts: async (texto: string, voz?: string): Promise<Blob> => {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ texto, voz }),
    });
    if (!res.ok) throw new Error('TTS falhou');
    return res.blob();
  },
  createSession: (body: CreateSessionRequest) =>
    req<CreateSessionResponse>('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),
  finishSession: (id: string, abandonar = false) =>
    req<{ scorecard?: Scorecard; duracao_segundos?: number; abandonada?: boolean }>(
      `/api/sessions/${id}/finish`,
      { method: 'POST', body: JSON.stringify({ abandonar }) },
    ),
  listSessions: (filtro: { vendedor?: string; modo?: string }) => {
    const qs = new URLSearchParams();
    if (filtro.vendedor) qs.set('vendedor', filtro.vendedor);
    if (filtro.modo) qs.set('modo', filtro.modo);
    return req<SessionSummary[]>(`/api/sessions?${qs}`);
  },
  getSession: (id: string) => req<SessionDetail>(`/api/sessions/${id}`),
};

// Turno via SSE: POST + leitura manual do stream (EventSource só faz GET)
export async function streamTurn(
  sessionId: string,
  texto: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const res = await fetch(`/api/sessions/${sessionId}/turns`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ texto }),
  });
  if (res.status === 401) throw new UnauthorizedError('código de acesso inválido');
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `erro ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalTexto = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const payload = JSON.parse(line.slice(5).trim()) as {
        delta?: string;
        done?: boolean;
        texto?: string;
        error?: string;
      };
      if (payload.error) throw new Error(payload.error);
      if (payload.delta) onDelta(payload.delta);
      if (payload.done && payload.texto !== undefined) finalTexto = payload.texto;
    }
  }
  return finalTexto;
}
