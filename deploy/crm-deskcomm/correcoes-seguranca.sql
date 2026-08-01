-- ═══════════════════════════════════════════════════════════════════════
-- Correção de segurança do DeskcommCRM
--
-- ⚠️ NA INSTALAÇÃO LOCAL, NÃO PRECISA DESTE ARQUIVO. O
--    `aplicar-schema-nexo.mjs` já faz isto como último passo — ver SETUP.md.
--    Este arquivo fica como referência e para o deploy em servidor via psql.
--
-- O QUE FAZ: trava o "caminho de busca" das funções internas que rodam com
-- privilégio elevado. Sem isso, em teoria alguém poderia enganar o banco pra
-- executar código próprio no lugar do código legítimo.
--
-- A mais importante é `fn_user_org_ids` — é ela que garante que um cliente
-- não enxergue os dados de outro. Toda regra de isolamento chama ela.
--
-- QUANDO RODAR: DEPOIS do baseline.sql, e antes de qualquer dado real de
-- cliente entrar no sistema.
--
-- COMO RODAR: Supabase → SQL Editor → colar tudo → Run.
--
-- É SEGURO? Sim. Não cria, altera nem apaga dado nenhum — só ajusta a
-- configuração das funções. Pode rodar quantas vezes quiser.
--
-- Contexto completo: SEGURANCA.md
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare
  fn record;
  total int := 0;
begin
  -- Percorre toda função do schema `public` que roda com privilégio elevado
  -- (SECURITY DEFINER) e ainda não tem caminho de busca travado.
  --
  -- Identifica cada uma pelo OID interno do Postgres, não pelo nome + tipos
  -- dos argumentos. Assim funciona mesmo que o projeto renomeie funções,
  -- mude assinaturas ou adicione novas numa versão futura.
  for fn in
    select p.oid::regprocedure as assinatura
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and not exists (
        select 1
        from unnest(coalesce(p.proconfig, '{}')) as cfg
        where cfg like 'search\_path=%'
      )
    order by 1
  loop
    execute format(
      'alter function %s set search_path = public, extensions, pg_temp',
      fn.assinatura
    );
    total := total + 1;
    raise notice 'protegida: %', fn.assinatura;
  end loop;

  if total = 0 then
    raise notice 'Nada a fazer — todas as funcoes ja estavam protegidas.';
  else
    raise notice '% funcao(oes) protegida(s).', total;
  end if;
end
$$;


-- ═══════════════════════════════════════════════════════════════════════
-- CONFERÊNCIA
--
-- Rode e confira o resultado:
--
--   funcoes_desprotegidas  |  situacao
--   -----------------------+-----------
--                        0 |  OK
--
-- `0` e `OK` = protegido. Qualquer outro número, me chame.
--
-- Se `total_com_privilegio` vier 0 também, o baseline.sql não chegou a
-- rodar — volte para o passo 3.
-- ═══════════════════════════════════════════════════════════════════════

select
  count(*) filter (
    where not exists (
      select 1 from unnest(coalesce(p.proconfig, '{}')) as cfg
      where cfg like 'search\_path=%'
    )
  )                                                as funcoes_desprotegidas,
  count(*)                                         as total_com_privilegio,
  case
    when count(*) = 0 then 'BASELINE NAO RODOU — volte ao passo 3'
    when count(*) filter (
      where not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}')) as cfg
        where cfg like 'search\_path=%'
      )
    ) = 0 then 'OK'
    else 'CORRIGIR — rode o bloco acima de novo'
  end                                              as situacao
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef;
