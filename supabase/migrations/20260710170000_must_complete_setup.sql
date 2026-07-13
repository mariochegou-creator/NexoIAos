-- Substitui o fluxo de convite por e-mail (limite de envio do Supabase é baixo demais pra um
-- time pequeno convidando gente de vez em quando). Agora a conta já nasce com senha temporária
-- e esse flag decide se o próximo login cai na tela de completar cadastro.
alter table public.profiles add column if not exists must_complete_setup boolean not null default true;

-- Colaboradores que já existem não precisam passar pela tela de setup.
update public.profiles set must_complete_setup = false where must_complete_setup is distinct from false;
