import type { FastifyInstance } from 'fastify';
import {
  LIMITES,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type Turn,
} from '../shared-types.ts';
import { createSession, getActive, pushTurn, duracaoSegundos, closeSession } from '../sessionStore.ts';
import { getPersonaFixa, PERSONAS_FIXAS } from '../personas/fixas.ts';
import { generatePersona } from '../claude/personaGen.ts';
import { streamProspectTurn, aberturaColdCall } from '../claude/prospect.ts';
import { evaluateSession } from '../claude/evaluator.ts';
import { dbGetSession, dbListSessions, dbUpdateSession } from '../db.ts';

export function registerSessionRoutes(app: FastifyInstance): void {
  app.get('/api/personas', async () => PERSONAS_FIXAS);

  app.post<{ Body: CreateSessionRequest }>('/api/sessions', async (req, reply) => {
    const { vendedor, modo, dificuldade, persona_slug, nicho } = req.body ?? ({} as CreateSessionRequest);
    if (!vendedor || !modo || !dificuldade) {
      return reply.code(400).send({ error: 'vendedor, modo e dificuldade são obrigatórios' });
    }
    let persona;
    if (persona_slug) {
      persona = getPersonaFixa(persona_slug);
      if (!persona) return reply.code(400).send({ error: `persona "${persona_slug}" não existe` });
    } else if (nicho) {
      persona = await generatePersona(nicho, dificuldade);
    } else {
      return reply.code(400).send({ error: 'informe persona_slug ou nicho' });
    }

    const s = await createSession(vendedor, modo, dificuldade, persona);
    let abertura: string | null = null;
    if (modo === 'cold_call') {
      abertura = aberturaColdCall(persona);
      pushTurn(s, { papel: 'prospect', texto: abertura, ts: new Date().toISOString() });
    }
    const res: CreateSessionResponse = { id: s.id, persona, abertura };
    return res;
  });

  // Turno do vendedor → resposta do prospect via SSE
  app.post<{ Params: { id: string }; Body: { texto: string } }>(
    '/api/sessions/:id/turns',
    async (req, reply) => {
      const s = getActive(req.params.id);
      if (!s) return reply.code(404).send({ error: 'sessão não encontrada ou já encerrada' });
      const texto = (req.body?.texto ?? '').trim();
      if (!texto) return reply.code(400).send({ error: 'texto vazio' });
      if (s.turnoEmAndamento) return reply.code(409).send({ error: 'turno anterior ainda em andamento' });
      if (s.turns.length >= LIMITES[s.modo].maxTurnos) {
        return reply.code(409).send({ error: 'limite de turnos da sessão atingido — encerre e avalie' });
      }

      s.turnoEmAndamento = true;
      pushTurn(s, { papel: 'vendedor', texto, ts: new Date().toISOString() });

      reply.raw.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      });
      const send = (data: unknown) => reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);

      try {
        const resposta = await streamProspectTurn(
          s.modo,
          s.persona,
          s.dificuldade,
          s.turns,
          (delta) => send({ delta }),
        );
        pushTurn(s, { papel: 'prospect', texto: resposta, ts: new Date().toISOString() });
        send({ done: true, texto: resposta });
      } catch (err) {
        req.log.error(err, 'erro no turno do prospect');
        send({ error: err instanceof Error ? err.message : 'erro ao gerar resposta' });
      } finally {
        s.turnoEmAndamento = false;
        reply.raw.end();
      }
      return reply;
    },
  );

  app.post<{ Params: { id: string }; Body: { abandonar?: boolean } }>(
    '/api/sessions/:id/finish',
    async (req, reply) => {
      const s = getActive(req.params.id);
      if (!s) return reply.code(404).send({ error: 'sessão não encontrada ou já encerrada' });
      const duracao = duracaoSegundos(s);

      if (req.body?.abandonar || s.turns.filter((t) => t.papel === 'vendedor').length < 2) {
        closeSession(s, 'abandonada');
        await dbUpdateSession(s.id, {
          status: 'abandonada',
          duracao_segundos: duracao,
          finalizada_em: new Date().toISOString(),
        });
        return { abandonada: true };
      }

      const scorecard = await evaluateSession(s.modo, s.persona, s.turns, duracao);
      closeSession(s, 'finalizada');
      await dbUpdateSession(s.id, {
        status: 'finalizada',
        scorecard,
        nota: scorecard.nota,
        duracao_segundos: duracao,
        finalizada_em: new Date().toISOString(),
      });
      return { scorecard, duracao_segundos: duracao };
    },
  );

  app.get<{ Querystring: { vendedor?: string; modo?: string } }>('/api/sessions', async (req) => {
    return dbListSessions({ vendedor: req.query.vendedor, modo: req.query.modo });
  });

  app.get<{ Params: { id: string } }>('/api/sessions/:id', async (req, reply) => {
    const detail = await dbGetSession(req.params.id);
    if (!detail) return reply.code(404).send({ error: 'sessão não encontrada' });
    // Se ainda ativa em memória, a transcrição mais fresca é a do store
    const active = getActive(req.params.id);
    if (active) detail.transcricao = active.turns;
    return detail;
  });
}
