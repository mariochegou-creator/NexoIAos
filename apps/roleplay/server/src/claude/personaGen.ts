// Geração dinâmica de persona por nicho, no mesmo shape das fixas (com memoria_r1
// pra funcionar também no modo R2, e varredura pro modo reuniao_unica).

import { anthropic, EVAL_MODEL } from './client.ts';
import type { Dificuldade, Modo, Persona } from '../../../shared/types.ts';

// varredura só entra no schema (e só é pedida ao modelo) pro modo reuniao_unica —
// gerar esse dossiê pra cold_call/r1/r2, que nunca leem persona.varredura, seria
// custo e latência jogados fora.
function buildSchema(incluirVarredura: boolean) {
  return {
    type: 'object',
    properties: {
      nome: { type: 'string', description: 'Primeiro nome ou apelido do dono, comum no interior da Bahia' },
      negocio: { type: 'string' },
      nicho: { type: 'string' },
      cidade: { type: 'string', description: 'Cidade pequena real do oeste da Bahia' },
      numeros: {
        type: 'object',
        properties: {
          faturamento_mes: { type: 'string' },
          ticket_medio: { type: 'string' },
          movimento: { type: 'string' },
          meta: { type: 'string' },
        },
        required: ['faturamento_mes', 'ticket_medio', 'movimento', 'meta'],
        additionalProperties: false,
      },
      dores: {
        type: 'array',
        items: { type: 'string' },
        description: '2-3 dores NAS PALAVRAS do dono (informal, sem jargão)',
      },
      personalidade: { type: 'string', enum: ['falante', 'seco', 'desconfiado', 'apressado'] },
      orcamento_implicito: { type: 'string' },
      memoria_r1: {
        type: 'object',
        properties: {
          dores_prioritarias: { type: 'array', items: { type: 'string' } },
          numeros_levantados: { type: 'string' },
          combinado: { type: 'string' },
        },
        required: ['dores_prioritarias', 'numeros_levantados', 'combinado'],
        additionalProperties: false,
      },
      ...(incluirVarredura
        ? {
            varredura: {
              type: 'object',
              properties: {
                termo_busca: { type: 'string', description: 'ex.: "marcenaria em Guanambi"' },
                posicao: { type: 'string', description: 'ex.: "não aparece na 1ª página" ou "6º lugar"' },
                concorrentes_na_frente: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '2-3, cada um com nota/tipo embutido no texto',
                },
                tem_site: { type: 'boolean' },
                tem_instagram: { type: 'boolean' },
                nota_google: { type: 'string' },
              },
              required: ['termo_busca', 'posicao', 'concorrentes_na_frente', 'tem_site', 'tem_instagram', 'nota_google'],
              additionalProperties: false,
            },
          }
        : {}),
    },
    required: [
      'nome',
      'negocio',
      'nicho',
      'cidade',
      'numeros',
      'dores',
      'personalidade',
      'orcamento_implicito',
      'memoria_r1',
      ...(incluirVarredura ? ['varredura'] : []),
    ],
    additionalProperties: false,
  };
}

const INSTRUCAO = `Crie a persona de um dono de negócio local de cidade pequena do interior da Bahia para um simulador de treino de vendas da Nexo IA (agência de marketing digital). Contexto da Nexo: clientes típicos faturam até R$ 100 mil/mês, têm pouca verba pra ferramenta e tráfego pago, e as dores comuns são: não aparecer no Google, Instagram parado, mensagem no WhatsApp que não vira venda, movimento caindo, anúncio sem retorno, sem controle de cliente/recompra, concorrente na frente.

Regras:
- Números coerentes entre si (faturamento ≈ ticket × volume) e com o porte do nicho pedido.
- Dores nas PALAVRAS do dono ("chega mensagem mas o povo some"), nunca em jargão ("conversão baixa").
- memoria_r1 = resumo plausível de uma primeira reunião de diagnóstico já realizada: dores em ordem de prioridade, números levantados (com uma estimativa de custo do problema em R$) e o que ficou combinado.
- Na dificuldade "dificil", inclua um elemento de resistência real (trauma com agência anterior, sócio cético, orçamento travado).`;

const INSTRUCAO_VARREDURA = `
- varredura = o resultado REAL (mas que o dono não sabe de cor) de pesquisar "<o que ele vende> em <cidade>" no Google: sua posição (a maioria não aparece na 1ª página ou nem aparece — a maior parte desses donos não tem site), 2-3 concorrentes que aparecem na frente (nome + nota + se tem site ou só rede social), se ele mesmo tem site (geralmente não) e Instagram (geralmente tem, mas parado), e a nota dele no Google.`;

export async function generatePersona(nicho: string, dificuldade: Dificuldade, modo: Modo): Promise<Persona> {
  const incluirVarredura = modo === 'reuniao_unica';
  const response = await anthropic.messages.create({
    model: EVAL_MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `${INSTRUCAO}${incluirVarredura ? INSTRUCAO_VARREDURA : ''}\n\nNicho pedido: ${nicho}\nDificuldade: ${dificuldade}`,
      },
    ],
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: buildSchema(incluirVarredura) as unknown as Record<string, unknown> },
    },
  });
  const texto = response.content.find((b) => b.type === 'text');
  if (!texto || texto.type !== 'text') {
    throw new Error(`Gerador de persona não retornou texto (stop_reason=${response.stop_reason})`);
  }
  const card = JSON.parse(texto.text) as Omit<Persona, 'slug'>;
  return { ...card, slug: null };
}
