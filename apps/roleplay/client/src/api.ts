import type {
  CreateSessionRequest,
  CreateSessionResponse,
  Persona,
  Scorecard,
  SessionDetail,
  SessionSummary,
} from '../../shared/types.ts';

const CODE_KEY = 'nexo_treino_code';

export function getAccessCode(): string {
  return localStorage.getItem(CODE_KEY) ?? '';
}
export function setAccessCode(code: string): void {
  localStorage.setItem(CODE_KEY, code);
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  const code = getAccessCode();
  if (code) h['x-access-code'] = code;
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
  personas: () => req<Persona[]>('/api/personas'),
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
