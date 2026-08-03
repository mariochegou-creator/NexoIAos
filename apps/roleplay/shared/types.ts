// Tipos compartilhados entre client e server do Nexo Treino.

export type Vendedor = 'david' | 'mario';
export type Modo = 'cold_call' | 'r1' | 'r2';
export type Dificuldade = 'facil' | 'media' | 'dificil';
export type Personalidade = 'falante' | 'seco' | 'desconfiado' | 'apressado';

export interface PersonaNumeros {
  faturamento_mes: string; // ex.: "R$ 45 mil"
  ticket_medio: string; // ex.: "R$ 55"
  movimento: string; // ex.: "~80 pedidos/semana, sexta e sábado fortes"
  meta: string; // ex.: "chegar em 120 pedidos/semana"
}

export interface MemoriaR1 {
  dores_prioritarias: string[]; // na ordem de prioridade que o dono deu
  numeros_levantados: string;
  combinado: string; // o que ficou acertado no fim da R1
}

export interface Persona {
  slug: string | null; // null quando gerada dinamicamente
  nome: string; // nome do dono
  negocio: string;
  nicho: string;
  cidade: string;
  numeros: PersonaNumeros;
  dores: string[]; // 2-3, nas palavras do dono
  personalidade: Personalidade;
  orcamento_implicito: string; // faixa que ele revelaria sob pressão
  memoria_r1?: MemoriaR1; // presente nas fixas (usada no modo r2)
}

export interface Turn {
  papel: 'vendedor' | 'prospect';
  texto: string;
  ts: string; // ISO
}

export interface ScorecardEtapa {
  nome: string;
  nota: number; // 0-10
  comentario: string;
}

export interface ScorecardChecklistItem {
  item: string;
  ok: boolean;
  comentario: string;
}

export interface Scorecard {
  nota: number; // 0-10 geral
  desfecho: string | null; // r2: pedido|avanco|continuacao|nao_venda; cold_call: agendou|nao_agendou|desligou
  etapas: ScorecardEtapa[];
  checklist: ScorecardChecklistItem[];
  flags: string[]; // ex.: "escassez artificial detectada"
  perguntas_que_faltaram: string[]; // citando dados reais da conversa
  coaching: string;
}

export interface SessionSummary {
  id: string;
  vendedor: Vendedor;
  modo: Modo;
  dificuldade: Dificuldade;
  persona_nome: string;
  persona_negocio: string;
  nota: number | null;
  status: 'em_andamento' | 'finalizada' | 'abandonada';
  duracao_segundos: number | null;
  created_at: string;
}

export interface SessionDetail extends SessionSummary {
  persona: Persona;
  transcricao: Turn[];
  scorecard: Scorecard | null;
}

export interface CreateSessionRequest {
  vendedor: Vendedor;
  modo: Modo;
  dificuldade: Dificuldade;
  persona_slug?: string;
  nicho?: string; // quando gerar persona dinâmica
}

export interface CreateSessionResponse {
  id: string;
  persona: Persona;
  abertura: string | null; // fala inicial do prospect (cold_call)
}

// Limites por modo
export const LIMITES: Record<Modo, { maxTurnos: number; maxMinutos: number }> = {
  cold_call: { maxTurnos: 30, maxMinutos: 6 },
  r1: { maxTurnos: 80, maxMinutos: 25 },
  r2: { maxTurnos: 80, maxMinutos: 25 },
};

export const MARCADOR_DESLIGOU = '[DESLIGOU]';
