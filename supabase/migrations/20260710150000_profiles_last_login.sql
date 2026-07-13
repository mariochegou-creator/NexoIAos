-- Guarda o login anterior de cada colaborador, pra saber quais tarefas são "novas desde a
-- última vez que ele entrou" e mostrar o aviso de boas-vindas ("O Mario atribuiu uma nova
-- tarefa pra você...").
alter table public.profiles add column if not exists last_login_at timestamptz;
