// Estado em memória das sessões ativas + espelho no Supabase a cada turno.

import { randomUUID } from 'node:crypto';
import type { Dificuldade, Modo, Persona, Turn, Vendedor } from './shared-types.ts';
import { dbInsertSession, dbUpdateSession } from './db.ts';

export interface ActiveSession {
  id: string;
  vendedor: Vendedor;
  modo: Modo;
  dificuldade: Dificuldade;
  persona: Persona;
  turns: Turn[];
  createdAt: number;
  status: 'em_andamento' | 'finalizada' | 'abandonada';
  turnoEmAndamento: boolean;
}

const sessions = new Map<string, ActiveSession>();

export async function createSession(
  vendedor: Vendedor,
  modo: Modo,
  dificuldade: Dificuldade,
  persona: Persona,
): Promise<ActiveSession> {
  const s: ActiveSession = {
    id: randomUUID(),
    vendedor,
    modo,
    dificuldade,
    persona,
    turns: [],
    createdAt: Date.now(),
    status: 'em_andamento',
    turnoEmAndamento: false,
  };
  sessions.set(s.id, s);
  await dbInsertSession({
    id: s.id,
    vendedor,
    modo,
    dificuldade,
    persona_slug: persona.slug,
    persona,
    transcricao: [],
    scorecard: null,
    nota: null,
    duracao_segundos: null,
    status: 'em_andamento',
  });
  return s;
}

export function getActive(id: string): ActiveSession | undefined {
  return sessions.get(id);
}

export function pushTurn(s: ActiveSession, turn: Turn): void {
  s.turns.push(turn);
  // Autosave (fire-and-forget): a transcrição no banco nunca fica mais de 1 turno atrás
  void dbUpdateSession(s.id, { transcricao: s.turns });
}

export function duracaoSegundos(s: ActiveSession): number {
  return Math.round((Date.now() - s.createdAt) / 1000);
}

export function closeSession(s: ActiveSession, status: 'finalizada' | 'abandonada'): void {
  s.status = status;
  sessions.delete(s.id);
}
