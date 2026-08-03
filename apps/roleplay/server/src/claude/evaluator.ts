// Avaliador de sessão: transcrição completa + rubrica do modo → Scorecard em JSON
// estruturado (output_config.format json_schema), effort high.

import { anthropic, EVAL_MODEL } from './client.ts';
import { AVALIADOR_BASE, AVALIADOR_MODO } from './prompts.ts';
import type { Modo, Persona, Scorecard, Turn } from '../../../shared/types.ts';

const SCORECARD_SCHEMA = {
  type: 'object',
  properties: {
    nota: { type: 'number', description: 'Nota geral 0-10 (uma casa decimal)' },
    desfecho: {
      type: ['string', 'null'],
      description:
        'cold_call: agendou|nao_agendou|desligou. r2: pedido|avanco|continuacao|nao_venda. r1: null ou breve rótulo do próximo passo.',
    },
    etapas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          nota: { type: 'number' },
          comentario: { type: 'string', description: 'Objetivo, citando evidência da transcrição' },
        },
        required: ['nome', 'nota', 'comentario'],
        additionalProperties: false,
      },
    },
    checklist: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          ok: { type: 'boolean' },
          comentario: { type: 'string' },
        },
        required: ['item', 'ok', 'comentario'],
        additionalProperties: false,
      },
    },
    flags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Erros graves detectados (ex.: escassez artificial). Vazio se nenhum.',
    },
    perguntas_que_faltaram: {
      type: 'array',
      items: { type: 'string' },
      description:
        '2-3 perguntas prontas, cada uma citando literalmente um dado/frase que o prospect falou NESTA sessão',
    },
    coaching: {
      type: 'string',
      description: 'Parágrafo de coaching direto, tom Nexo: o que manter, o que mudar amanhã',
    },
  },
  required: ['nota', 'desfecho', 'etapas', 'checklist', 'flags', 'perguntas_que_faltaram', 'coaching'],
  additionalProperties: false,
} as const;

function renderTranscricao(turns: Turn[]): string {
  return turns
    .map((t) => `${t.papel === 'vendedor' ? 'VENDEDOR' : 'PROSPECT'}: ${t.texto}`)
    .join('\n');
}

export async function evaluateSession(
  modo: Modo,
  persona: Persona,
  turns: Turn[],
  duracaoSegundos: number,
): Promise<Scorecard> {
  const contexto = [
    `## Contexto da sessão`,
    `- Modo: ${modo}`,
    `- Prospect simulado: ${persona.nome}, ${persona.negocio} (${persona.nicho}), ${persona.cidade}`,
    `- Números reais do card: faturamento ${persona.numeros.faturamento_mes}; ticket ${persona.numeros.ticket_medio}; movimento ${persona.numeros.movimento}; meta ${persona.numeros.meta}`,
    `- Duração: ${Math.round(duracaoSegundos / 60)} min`,
    ``,
    `## Transcrição`,
    renderTranscricao(turns),
  ].join('\n');

  const response = await anthropic.messages.create({
    model: EVAL_MODEL,
    max_tokens: 4000,
    system: `${AVALIADOR_BASE}\n\n---\n\n${AVALIADOR_MODO[modo]}`,
    messages: [{ role: 'user', content: contexto }],
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: SCORECARD_SCHEMA as unknown as Record<string, unknown> },
    },
  });

  const texto = response.content.find((b) => b.type === 'text');
  if (!texto || texto.type !== 'text') {
    throw new Error(`Avaliador não retornou texto (stop_reason=${response.stop_reason})`);
  }
  return JSON.parse(texto.text) as Scorecard;
}
