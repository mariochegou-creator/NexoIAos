-- Agendamento de R1/R2 direto no card do funil: e-mail do cliente + link do Meet gerado
-- pela edge function lead-meeting-sync. google_event_stage marca pra qual etapa (r1_agendada
-- ou r2_agendada) o google_event_id/google_meet_link atuais pertencem, pra saber se um novo
-- agendamento deve atualizar o evento existente (PATCH) ou criar um novo (POST).
alter table public.leads
  add column email text,
  add column google_meet_link text,
  add column google_event_stage text;
