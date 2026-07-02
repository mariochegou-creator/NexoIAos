-- Integrações Google Calendar + Todoist: tokens por usuário e mapeamento de tarefas

create table if not exists public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'todoist')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  provider_user_id text,
  todoist_project_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.integration_tokens enable row level security;

-- Nenhum acesso via anon/authenticated: só as Edge Functions (service_role) leem/escrevem tokens.
-- Sem policies = deny-all por padrão com RLS habilitado.

alter table public.tasks
  add column if not exists assigned_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists todoist_task_id text;

create index if not exists idx_tasks_assigned_user_id on public.tasks(assigned_user_id);
create index if not exists idx_integration_tokens_user_id on public.integration_tokens(user_id);
