-- Sessões do app de roleplay de vendas (apps/roleplay — treino.nexoia.app).
-- Cada linha é uma sessão de treino por voz: o vendedor (David/Mario) conversa com o
-- Claude interpretando um prospect (dono de negócio local). Transcrição e scorecard
-- ficam em jsonb; `nota` é denormalizada pro gráfico de evolução do histórico.
--
-- ATENÇÃO: aplicar no projeto Supabase do DASHBOARD/MazyOS (ref norgsipmgxbakfmkqcnl).
-- NÃO aplicar no projeto do DeskcommCRM (ref pdtbrtccausjlrzzsiqe) — são projetos
-- distintos e a variável de chave é uma só; conferir o `ref` do JWT antes de aplicar.

create table public.roleplay_sessoes (
  id uuid primary key default gen_random_uuid(),
  vendedor text not null check (vendedor in ('david','mario')),
  modo text not null check (modo in ('cold_call','r1','r2')),
  dificuldade text not null default 'media'
    check (dificuldade in ('facil','media','dificil')),
  persona_slug text,               -- slug da persona fixa; null quando gerada por nicho
  persona jsonb not null,          -- card completo usado na sessão
  transcricao jsonb not null default '[]'::jsonb,
    -- [{papel:'vendedor'|'prospect', texto:text, ts:timestamptz}]
  scorecard jsonb,                 -- notas por etapa, checklist, coaching
  nota numeric,                    -- nota geral 0-10
  duracao_segundos integer,
  status text not null default 'em_andamento'
    check (status in ('em_andamento','finalizada','abandonada')),
  created_at timestamptz not null default now(),
  finalizada_em timestamptz
);

create index roleplay_sessoes_vendedor_modo_idx
  on public.roleplay_sessoes(vendedor, modo, created_at desc);

alter table public.roleplay_sessoes enable row level security;
create policy "authenticated_all_roleplay_sessoes" on public.roleplay_sessoes
  for all to authenticated using (true) with check (true);
