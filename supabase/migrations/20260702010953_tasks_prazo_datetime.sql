-- Permite guardar horário junto com o prazo da tarefa (antes só data).
alter table public.tasks
  alter column prazo type timestamptz using prazo::timestamptz;
