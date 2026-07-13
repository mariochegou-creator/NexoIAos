-- Guarda o id do evento correspondente no Google Calendar do responsável.
alter table public.tasks
  add column if not exists google_event_id text;
