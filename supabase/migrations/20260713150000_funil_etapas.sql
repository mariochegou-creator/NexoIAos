-- Etapas do Funil Comercial, antes fixas no código do dashboard. Agora ficam nessa tabela
-- pra permitir adicionar, renomear, reordenar e excluir etapas direto pela dashboard
-- (botão "Gerenciar etapas" na aba Funil Comercial).
--
-- Etapas is_core=true têm lógica especial amarrada ao `id` (agendamento de R1/R2 no card,
-- promoção automática pra cliente ao fechar, exclusão do funil ativo nos KPIs) e por isso
-- não podem ser excluídas nem ter o `id` alterado — só o rótulo (`label`) e a `ordem`.

create table public.funil_etapas (
  id text primary key,
  label text not null,
  ordem integer not null,
  cor text not null default '#00c8e8',
  is_core boolean not null default false,
  created_at timestamptz not null default now()
);

create index funil_etapas_ordem_idx on public.funil_etapas(ordem);

insert into public.funil_etapas (id, label, ordem, cor, is_core) values
  ('captacao',    'Captação',     1, '#7b5ccc', true),
  ('r1_agendada', 'R1 agendada',  2, '#a78bfa', true),
  ('r1_feita',    'R1 feita',     3, '#8b5cf6', false),
  ('apn_enviada', 'APN enviada',  4, '#f97316', false),
  ('r2_agendada', 'R2 agendada',  5, '#f59e0b', true),
  ('r2_feita',    'R2 feita',     6, '#eab308', false),
  ('follow_up',   'Follow-up',    7, '#06b6d4', false),
  ('fechado',     'Fechado',      8, '#22c55e', true),
  ('perdido',     'Perdido',      9, '#3f5070', true)
on conflict (id) do nothing;

alter table public.funil_etapas enable row level security;
create policy "authenticated_all_funil_etapas" on public.funil_etapas
  for all to authenticated using (true) with check (true);
