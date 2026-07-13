-- Campos preenchidos na tela de "completar cadastro" que aparece pro colaborador logo depois
-- que ele aceita o convite e define a senha (avatar, habilidades, telefone/WhatsApp).
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists habilidades text;
alter table public.profiles add column if not exists telefone text;

-- Bucket público de fotos de perfil (leitura pública, upload só autenticado).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_auth_write" on storage.objects;
create policy "avatars_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');

drop policy if exists "avatars_auth_update" on storage.objects;
create policy "avatars_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
