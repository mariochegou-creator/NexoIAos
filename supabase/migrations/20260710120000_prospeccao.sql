-- Tabela de prospecção: leads crus enriquecidos pela skill /enriquecer-leads (varredura de
-- Google Maps), antes de entrarem no funil comercial de verdade (tabela `leads`).
-- Ficam aqui até o usuário decidir, na aba "Prospecção" da dashboard, se envia pro pipeline
-- (cria registro em `leads` com etapa_funil='captacao') ou descarta.

create table public.prospeccao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  cidade text,
  endereco text,
  telefone text,
  telefone_tipo text,
  link_whatsapp text,
  nota numeric,
  reviews integer,
  site_url text,
  site_online boolean,
  https_ok boolean,
  mobile_friendly boolean,
  tem_whatsapp_site boolean,
  plataforma_generica text,
  instagram_link text,
  instagram_ultimo_post text,
  instagram_seguidores text,
  score integer not null default 0,
  dores text,
  entregaveis text,
  gancho_abertura text,
  status text not null default 'pendente'
    check (status in ('pendente','enviado_pipeline','descartado')),
  lead_id uuid references public.leads(id) on delete set null,
  origem_arquivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospeccao_status_idx on public.prospeccao(status);
create index prospeccao_score_idx on public.prospeccao(score desc);

alter table public.prospeccao enable row level security;
create policy "authenticated_all_prospeccao" on public.prospeccao
  for all to authenticated using (true) with check (true);
