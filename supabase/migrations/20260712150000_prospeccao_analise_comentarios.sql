-- Síntese da análise de comentários de clientes no Google Maps (feita pela skill
-- /enriquecer-leads a partir dos reviews em texto do CSV, quando disponíveis).
alter table public.prospeccao
  add column ponto_forte text,
  add column maior_objecao text;
