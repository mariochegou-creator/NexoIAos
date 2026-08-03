// Geração das falas do prospect: system prompt em blocos (base+modo cacheados,
// persona dinâmica), streaming pra latência de voz, effort low.

import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, PROSPECT_MODEL } from './client.ts';
import { PROSPECT_BASE, PROSPECT_MODO } from './prompts.ts';
import type { Dificuldade, Modo, Persona, Turn } from '../../../shared/types.ts';

function personaBlock(persona: Persona, modo: Modo, dificuldade: Dificuldade): string {
  const linhas = [
    `# Card da sua persona (fatos imutáveis)`,
    ``,
    `- Dificuldade desta sessão: ${dificuldade}`,
    `- Você: ${persona.nome}, dono(a) de "${persona.negocio}" (${persona.nicho}) em ${persona.cidade}`,
    `- Faturamento: ${persona.numeros.faturamento_mes}`,
    `- Ticket médio: ${persona.numeros.ticket_medio}`,
    `- Movimento: ${persona.numeros.movimento}`,
    `- Sua meta (você tem esse número na cabeça): ${persona.numeros.meta}`,
    `- Suas dores (nas suas palavras, saem aos poucos):`,
    ...persona.dores.map((d) => `  - "${d}"`),
    `- Personalidade: ${persona.personalidade}`,
    `- Orçamento implícito (só sob pressão bem-feita): ${persona.orcamento_implicito}`,
  ];
  if (modo === 'r2' && persona.memoria_r1) {
    linhas.push(
      ``,
      `## Sua memória da R1 (a primeira reunião, que já aconteceu)`,
      `- Dores que você confirmou, na ordem que VOCÊ priorizou:`,
      ...persona.memoria_r1.dores_prioritarias.map((d, i) => `  ${i + 1}. ${d}`),
      `- Números que você falou na R1: ${persona.memoria_r1.numeros_levantados}`,
      `- O que ficou combinado: ${persona.memoria_r1.combinado}`,
    );
  }
  return linhas.join('\n');
}

export function buildProspectSystem(
  modo: Modo,
  persona: Persona,
  dificuldade: Dificuldade,
): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: `${PROSPECT_BASE}\n\n---\n\n${PROSPECT_MODO[modo]}`,
      cache_control: { type: 'ephemeral' },
    },
    { type: 'text', text: personaBlock(persona, modo, dificuldade) },
  ];
}

// Fala inicial do prospect atendendo a cold call — canned (custo/latência zero).
export function aberturaColdCall(persona: Persona): string {
  switch (persona.personalidade) {
    case 'seco':
      return 'Alô.';
    case 'apressado':
      return 'Alô, fala.';
    case 'desconfiado':
      return 'Alô? Quem é?';
    default:
      return 'Alô?';
  }
}

function toMessages(turns: Turn[]): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = [];
  // A API exige que a primeira mensagem seja user; se a conversa abre com o prospect
  // (cold call), prefixamos um turno sintético de contexto.
  if (turns.length > 0 && turns[0].papel === 'prospect') {
    messages.push({ role: 'user', content: '[Início da ligação — seu telefone toca e você atende]' });
  }
  for (const t of turns) {
    messages.push({
      role: t.papel === 'vendedor' ? 'user' : 'assistant',
      content: t.texto,
    });
  }
  return messages;
}

export async function streamProspectTurn(
  modo: Modo,
  persona: Persona,
  dificuldade: Dificuldade,
  turns: Turn[],
  onDelta: (texto: string) => void,
): Promise<string> {
  const stream = anthropic.messages.stream({
    model: PROSPECT_MODEL,
    max_tokens: 300,
    system: buildProspectSystem(modo, persona, dificuldade),
    messages: toMessages(turns),
    output_config: { effort: 'low' },
  });
  stream.on('text', (delta) => onDelta(delta));
  const final = await stream.finalMessage();
  return final.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}
