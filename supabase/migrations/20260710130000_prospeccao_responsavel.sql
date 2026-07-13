-- Permite atribuir um lead de prospecção a um colaborador (Mario Brandao / Rian Martins),
-- pra filtrar "meus leads" na aba Prospecção do dashboard.
alter table public.prospeccao add column responsavel text;
create index prospeccao_responsavel_idx on public.prospeccao(responsavel);
