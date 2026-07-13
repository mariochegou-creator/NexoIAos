-- A tabela `leads` tinha um `check (etapa_funil in (...9 valores fixos...))` de quando as
-- etapas do funil eram hardcoded no dashboard. Depois que as etapas passaram a ser
-- gerenciáveis (tabela `funil_etapas` — ver 20260713150000_funil_etapas.sql), esse check
-- passou a rejeitar silenciosamente qualquer lead movido pra uma etapa customizada: o
-- dashboard chamava `sb.from('leads').update({etapa_funil})`, o Postgres recusava a
-- violação de check, e a tela voltava pro estado antigo no próximo render (parecia que o
-- drag-and-drop "não colava" na etapa nova).
--
-- Troca o check fixo por uma foreign key pra `funil_etapas(id)`: valida contra as etapas
-- que existem de fato, sem precisar editar essa constraint toda vez que alguém cria uma
-- etapa nova pela dashboard.

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.leads'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%etapa_funil%'
  loop
    execute format('alter table public.leads drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.leads
  add constraint leads_etapa_funil_fkey
  foreign key (etapa_funil) references public.funil_etapas(id)
  on update cascade on delete restrict;
