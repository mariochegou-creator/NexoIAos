import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Modo } from '../../../shared/types.ts';

const promptsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'prompts');

function load(nome: string): string {
  return readFileSync(join(promptsDir, nome), 'utf-8');
}

export const PROSPECT_BASE = load('prospect-base.md');

export const PROSPECT_MODO: Record<Modo, string> = {
  cold_call: load('modo-coldcall.md'),
  r1: load('modo-r1.md'),
  r2: load('modo-r2.md'),
  reuniao_unica: load('modo-reuniao-unica.md'),
};

export const AVALIADOR_BASE = load('avaliador-base.md');

export const AVALIADOR_MODO: Record<Modo, string> = {
  cold_call: load('avaliador-coldcall.md'),
  r1: load('avaliador-r1.md'),
  r2: load('avaliador-r2.md'),
  reuniao_unica: load('avaliador-reuniao-unica.md'),
};
