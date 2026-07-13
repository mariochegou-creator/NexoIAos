-- Marca quando um colaborador viu a tela de boas-vindas pela primeira vez.
-- Enquanto for null, o próximo login mostra a tela de onboarding em vez da saudação diária.
alter table public.profiles add column if not exists onboarded_at timestamptz;
