-- Reorganização do funil comercial: separa lead (pré-fechamento) de cliente (pós-fechamento),
-- adiciona contratos/projetos/influenciadores/campanhas de indicação, e corrige tabelas que o
-- código já referenciava mas não existiam no banco (activity_log, finance_entries.tipo).
--
-- NÃO dropa `clients` aqui de propósito — ela fica intacta como rede de segurança até a
-- dashboard nova estar validada em produção. O drop é uma migration separada, posterior.

-- ═══════════════════════════════════════════════════════════
-- INFLUENCIADORES (precisa vir antes de leads/campanhas por causa da FK)
-- ═══════════════════════════════════════════════════════════
create table public.influenciadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nicho text,
  cidade text,
  plataforma text,
  status_formalizacao text not null default 'reativo'
    check (status_formalizacao in ('reativo','script_criado','followup_dedicado')),
  created_at timestamptz not null default now()
);

alter table public.influenciadores enable row level security;
create policy "authenticated_all_influenciadores" on public.influenciadores
  for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════
-- CLIENTES (substitui `clients`, só pós-fechamento)
-- ═══════════════════════════════════════════════════════════
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  segmento text,
  cidade text,
  status text not null default 'ativo'
    check (status in ('ativo','encerrado','suspenso')),
  responsavel text,
  data_entrada date,
  origem text,
  lead_id uuid, -- FK adicionada depois que `leads` existir
  servicos text,
  obs text,
  proximo_passo text,
  repo_url text,
  local_path text,
  handoff_summary text,
  handoff_next text,
  handoff_by text,
  handoff_at timestamptz,
  last_session jsonb,
  created_at timestamptz not null default now(),
  _old_client_id uuid -- temporária, usada só durante a migração de dados abaixo, removida no fim
);

create index idx_clientes_status on public.clientes(status);

alter table public.clientes enable row level security;
create policy "authenticated_all_clientes" on public.clientes
  for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════
-- LEADS (funil pré-fechamento)
-- ═══════════════════════════════════════════════════════════
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  segmento text,
  cidade text,
  origem text not null default 'prospeccao-ativa'
    check (origem in ('prospeccao-ativa','indicacao-influencer')),
  influenciador_id uuid references public.influenciadores(id) on delete set null,
  etapa_funil text not null default 'captacao'
    check (etapa_funil in ('captacao','r1_agendada','r1_feita','apn_enviada','r2_agendada','r2_feita','follow_up','fechado','perdido')),
  responsavel text,
  resultado_r2 text check (resultado_r2 in ('pedido','avanco','nao_venda')),
  objecao_aberta text,
  tentativas_followup int not null default 0,
  data_r1_prevista timestamptz,
  data_r2_prevista timestamptz,
  valor_estimado numeric,
  obs text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Reservado para a etapa de integrações (Todoist/Calendar) — sem lógica de sync ainda.
  todoist_task_id text,
  google_event_id text
);

create index idx_leads_etapa_funil on public.leads(etapa_funil);
create index idx_leads_influenciador_id on public.leads(influenciador_id);

alter table public.leads enable row level security;
create policy "authenticated_all_leads" on public.leads
  for all to authenticated using (true) with check (true);

-- Agora que `leads` existe, liga a FK reservada em `clientes`.
alter table public.clientes
  add constraint clientes_lead_id_fkey foreign key (lead_id) references public.leads(id) on delete set null;
create index idx_clientes_lead_id on public.clientes(lead_id);

-- ═══════════════════════════════════════════════════════════
-- PROJETOS e CONTRATOS (dependem de clientes)
-- ═══════════════════════════════════════════════════════════
create table public.projetos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo text,
  fase text,
  inicio date,
  go_live_previsto date,
  go_live_real date,
  responsavel text,
  todoist_task_id text, -- reservado
  created_at timestamptz not null default now()
);
create index idx_projetos_cliente_id on public.projetos(cliente_id);

alter table public.projetos enable row level security;
create policy "authenticated_all_projetos" on public.projetos
  for all to authenticated using (true) with check (true);

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  valor_mensal numeric,
  valor_implementacao numeric,
  inicio date,
  data_renovacao date,
  status text not null default 'ativo' check (status in ('ativo','suspenso','encerrado')),
  created_at timestamptz not null default now()
);
create index idx_contratos_cliente_id on public.contratos(cliente_id);

alter table public.contratos enable row level security;
create policy "authenticated_all_contratos" on public.contratos
  for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════
-- CAMPANHAS DE INDICAÇÃO (topo de funil via influenciador)
-- ═══════════════════════════════════════════════════════════
create table public.campanhas_indicacao (
  id uuid primary key default gen_random_uuid(),
  influenciador_id uuid not null references public.influenciadores(id) on delete cascade,
  cliente_origem_id uuid references public.clientes(id) on delete set null,
  data date not null default current_date,
  leads_gerados int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_campanhas_influenciador_id on public.campanhas_indicacao(influenciador_id);

alter table public.campanhas_indicacao enable row level security;
create policy "authenticated_all_campanhas_indicacao" on public.campanhas_indicacao
  for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════
-- ACTIVITY_LOG (corrige quebra: /sync e a aba Atividade já esperavam essa tabela)
-- ═══════════════════════════════════════════════════════════
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  user_name text,
  description text,
  created_at timestamptz not null default now()
);
create index idx_activity_log_created_at on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;
create policy "authenticated_all_activity_log" on public.activity_log
  for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════
-- PROCESSO_PENDENCIAS (seção "Processo em aberto" em Configurações)
-- ═══════════════════════════════════════════════════════════
create table public.processo_pendencias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  status text not null default 'aberto' check (status in ('aberto','em_definicao','resolvido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.processo_pendencias enable row level security;
create policy "authenticated_all_processo_pendencias" on public.processo_pendencias
  for all to authenticated using (true) with check (true);

insert into public.processo_pendencias (titulo, descricao) values
  ('Follow-up sem resposta após 3 tentativas', 'O que fazer depois da 3ª tentativa de follow-up sem resposta — hoje o fluxo simplesmente para.'),
  ('SLA de resposta no WhatsApp', 'Sem tempo fixo definido — hoje é só "rápido".'),
  ('Prazo entre R1 e R2', 'Sem SLA formal — hoje é "semana que vem" combinado na hora.'),
  ('Consolidação do tarefas.md', 'Citado no CLAUDE.md da raiz como "pipeline da agência" mas o arquivo não existe — o pipeline real vive no dashboard/Supabase.');

-- ═══════════════════════════════════════════════════════════
-- FINANCE_ENTRIES: adiciona a coluna `tipo` que o JS já espera (tabela está vazia hoje)
-- ═══════════════════════════════════════════════════════════
alter table public.finance_entries
  add column tipo text not null default 'entrada'
  check (tipo in ('entrada','implementacao','despesa'));

-- ═══════════════════════════════════════════════════════════
-- MIGRAÇÃO DE DADOS: clients → leads / clientes + contratos
-- ═══════════════════════════════════════════════════════════

-- prospect/proposta/negociando → leads (perde granularidade de etapa; mapeamento documentado)
insert into public.leads (nome, etapa_funil, responsavel, valor_estimado, obs, created_at, updated_at)
select
  nome,
  case status
    when 'prospect'   then 'captacao'
    when 'proposta'   then 'apn_enviada'
    when 'negociando' then 'follow_up'
  end,
  resp,
  valor,
  obs,
  created_at,
  created_at
from public.clients
where status in ('prospect','proposta','negociando');

-- ativo/encerrado → clientes (guarda o id antigo em _old_client_id só pra ligar o insert de contratos)
insert into public.clientes (
  _old_client_id, nome, status, responsavel, servicos, obs, proximo_passo,
  repo_url, local_path, handoff_summary, handoff_next, handoff_by, handoff_at,
  last_session, created_at
)
select
  id, nome, status, resp, servicos, obs, proximo_passo,
  repo_url, local_path, handoff_summary, handoff_next, handoff_by, handoff_at,
  last_session, created_at
from public.clients
where status in ('ativo','encerrado');

-- valor do cliente ativo vira o contrato mensal
insert into public.contratos (cliente_id, valor_mensal, status)
select cl.id, c.valor, 'ativo'
from public.clients c
join public.clientes cl on cl._old_client_id = c.id
where c.status = 'ativo' and c.valor is not null and c.valor > 0;

alter table public.clientes drop column _old_client_id;

-- ═══════════════════════════════════════════════════════════
-- Tabelas legadas quebradas (nunca tiveram dados reais — só eram referenciadas pelo
-- código, que falhava silenciosamente). DROP IF EXISTS por segurança.
-- ═══════════════════════════════════════════════════════════
drop table if exists public.influencer_jobs;
drop table if exists public.influencers;
