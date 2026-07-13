-- Segundo gancho de abertura: mensagem alternativa baseada na análise de
-- comentários de clientes (ponto_forte/maior_objecao), pro SDR escolher qual
-- dos dois enviar no primeiro contato (gancho_abertura = sinal técnico original).
alter table public.prospeccao
  add column gancho_abertura_2 text;
