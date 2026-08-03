import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic();

// Sonnet 5: qualidade quase-Opus em conversa por fração do custo (decisão do usuário).
// Falas do prospect podem descer pra claude-haiku-4-5 via env se quiser espremer mais.
export const PROSPECT_MODEL = process.env.PROSPECT_MODEL || 'claude-sonnet-5';
export const EVAL_MODEL = process.env.EVAL_MODEL || 'claude-sonnet-5';
