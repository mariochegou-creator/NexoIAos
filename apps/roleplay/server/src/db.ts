// Persistência no Supabase do DASHBOARD/MazyOS (ref norgsipmgxbakfmkqcnl).
// Existem DOIS projetos Supabase na Nexo (dashboard e DeskcommCRM) e uma chave errada
// escreve no lugar errado — por isso o boot decodifica o ref do JWT e se recusa a
// subir se a chave não bater com a URL. Sem env configurado, cai num modo memória
// (dev local sem persistência).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Scorecard, SessionDetail, SessionSummary, Turn } from './shared-types.ts';

const TABLE = 'roleplay_sessoes';

function jwtRef(jwt: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf-8'));
    return payload.ref ?? null;
  } catch {
    return null;
  }
}

let supabase: SupabaseClient | null = null;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (url && key) {
  const urlRef = new URL(url).hostname.split('.')[0];
  const keyRef = jwtRef(key);
  if (keyRef && keyRef !== urlRef) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY é do projeto "${keyRef}" mas SUPABASE_URL aponta pra "${urlRef}". ` +
        `Provavelmente a chave do CRM foi usada no lugar da do dashboard. Corrija o .env.`,
    );
  }
  supabase = createClient(url, key, { auth: { persistSession: false } });
  console.log(`[db] Supabase conectado (projeto ${urlRef})`);
} else {
  console.warn('[db] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes — modo memória (sem persistência)');
}

// Fallback em memória pro dev local sem Supabase
const memRows = new Map<string, Record<string, unknown>>();

type Row = {
  id: string;
  vendedor: string;
  modo: string;
  dificuldade: string;
  persona_slug: string | null;
  persona: unknown;
  transcricao: Turn[];
  scorecard: Scorecard | null;
  nota: number | null;
  duracao_segundos: number | null;
  status: string;
  created_at: string;
  finalizada_em: string | null;
};

export async function dbInsertSession(row: Omit<Row, 'created_at' | 'finalizada_em'>): Promise<void> {
  if (!supabase) {
    memRows.set(row.id, { ...row, created_at: new Date().toISOString(), finalizada_em: null });
    return;
  }
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) throw new Error(`[db] insert falhou: ${error.message}`);
}

export async function dbUpdateSession(id: string, patch: Partial<Row>): Promise<void> {
  if (!supabase) {
    const cur = memRows.get(id);
    if (cur) memRows.set(id, { ...cur, ...patch });
    return;
  }
  const { error } = await supabase.from(TABLE).update(patch).eq('id', id);
  if (error) console.error(`[db] update falhou (${id}): ${error.message}`);
}

function toSummary(r: Row): SessionSummary {
  const persona = r.persona as { nome?: string; negocio?: string };
  return {
    id: r.id,
    vendedor: r.vendedor as SessionSummary['vendedor'],
    modo: r.modo as SessionSummary['modo'],
    dificuldade: r.dificuldade as SessionSummary['dificuldade'],
    persona_nome: persona?.nome ?? '?',
    persona_negocio: persona?.negocio ?? '?',
    nota: r.nota,
    status: r.status as SessionSummary['status'],
    duracao_segundos: r.duracao_segundos,
    created_at: r.created_at,
  };
}

export async function dbListSessions(filtro: { vendedor?: string; modo?: string }): Promise<SessionSummary[]> {
  if (!supabase) {
    let rows = [...memRows.values()] as Row[];
    if (filtro.vendedor) rows = rows.filter((r) => r.vendedor === filtro.vendedor);
    if (filtro.modo) rows = rows.filter((r) => r.modo === filtro.modo);
    return rows
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(toSummary);
  }
  let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false }).limit(200);
  if (filtro.vendedor) q = q.eq('vendedor', filtro.vendedor);
  if (filtro.modo) q = q.eq('modo', filtro.modo);
  const { data, error } = await q;
  if (error) throw new Error(`[db] list falhou: ${error.message}`);
  return (data as Row[]).map(toSummary);
}

export async function dbGetSession(id: string): Promise<SessionDetail | null> {
  let row: Row | null = null;
  if (!supabase) {
    row = (memRows.get(id) as Row | undefined) ?? null;
  } else {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`[db] get falhou: ${error.message}`);
    row = data as Row | null;
  }
  if (!row) return null;
  return {
    ...toSummary(row),
    persona: row.persona as SessionDetail['persona'],
    transcricao: row.transcricao ?? [],
    scorecard: row.scorecard,
  };
}
