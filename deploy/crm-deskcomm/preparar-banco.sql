-- ═══════════════════════════════════════════════════════════════════════
-- Preparar o banco ANTES do baseline.sql
--
-- ⚠️ NA INSTALAÇÃO LOCAL, NÃO PRECISA DESTE ARQUIVO. O
--    `aplicar-schema-nexo.mjs` já faz isto como primeiro passo — ver SETUP.md.
--    Este arquivo fica como referência e para o deploy em servidor via psql.
--
-- POR QUE ISSO EXISTE: o baseline.sql do Deskcomm depende de TRÊS recursos
-- do banco que num Supabase novo vêm desligados:
--
--   vector    busca por similaridade da IA
--   citext    texto que ignora maiúscula/minúscula (usado em `slug`)
--   pg_trgm   busca por texto parecido
--
-- Sem este passo o baseline morre na primeira que falta:
--   ERROR: 42704: type "public.vector" does not exist
--   ERROR: 42704: type "public.citext" does not exist
--
-- Ele para na PRIMEIRA, então você descobre uma por vez. Este arquivo liga
-- as três de uma vez.
--
-- O projeto lista essas extensões em `docs/deploy-selfhost/README.md`, mas
-- só no caminho via `psql` (linha de comando) — quem instala pelo SQL Editor
-- do Supabase não passa por ali. Não é erro seu.
--
-- Este arquivo faz o mesmo que o deles, e mais: corrige o caso da extensão
-- já existir em outro schema, e confere o resultado no final.
--
-- COMO RODAR: Supabase → SQL Editor → colar tudo → Run.
-- Pode rodar mais de uma vez sem problema.
-- ═══════════════════════════════════════════════════════════════════════

-- Liga as três extensões no schema `public`, que é onde o Deskcomm espera
-- encontrar. Se alguma já estiver ligada em outro lugar, move.
do $$
declare
  ext           text;
  schema_atual  text;
begin
  foreach ext in array array['vector', 'citext', 'pg_trgm']
  loop
    select n.nspname into schema_atual
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = ext;

    if schema_atual is null then
      execute format('create extension %I with schema public', ext);
      raise notice '% criada em public.', ext;
    elsif schema_atual <> 'public' then
      execute format('alter extension %I set schema public', ext);
      raise notice '% movida de % para public.', ext, schema_atual;
    else
      raise notice '% ja estava correta em public.', ext;
    end if;

    schema_atual := null;
  end loop;
end
$$;

-- O baseline também usa pgcrypto (criptografia), esta em `extensions`.
create extension if not exists pgcrypto with schema extensions;


-- ═══════════════════════════════════════════════════════════════════════
-- CONFERÊNCIA — o resultado tem que ser 4 linhas, todas `OK`:
--
--   extensao  |  schema      |  situacao
--   ----------+--------------+-----------
--   citext    |  public      |  OK
--   pg_trgm   |  public      |  OK
--   pgcrypto  |  extensions  |  OK
--   vector    |  public      |  OK
--
-- Se faltar alguma linha, ou alguma vier `CORRIGIR`, NÃO siga para o
-- baseline.sql — me chame.
-- ═══════════════════════════════════════════════════════════════════════

select
  e.extname                                        as extensao,
  n.nspname                                        as schema,
  case
    when e.extname = 'pgcrypto'                          then 'OK'
    when n.nspname = 'public'                            then 'OK'
    else 'CORRIGIR'
  end                                              as situacao
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname in ('vector', 'citext', 'pg_trgm', 'pgcrypto')
order by e.extname;
