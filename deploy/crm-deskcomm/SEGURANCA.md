# DeskcommCRM — Revisão de segurança (RLS e credenciais)

**Data:** 29/07/2026 · **Commit analisado:** `main` (push de 29/07/2026)
**Repositório:** https://github.com/melgarafael/DeskcommCRM · MIT
**Escopo:** `supabase/baseline.sql` (360 KB, 94 tabelas), `lib/`, `app/`, variáveis de ambiente

---

## Veredito

**Aprovado para a fase de testes.** Com duas correções antes de qualquer dado
real de cliente entrar no sistema.

O isolamento multi-tenant está bem construído e aplicado de forma consistente.
Não encontrei tabela exposta nem credencial vazando pro browser. O que sobra
são lacunas de *hardening*, não falhas abertas.

---

## O que está certo

| Item | Resultado |
|---|---|
| Tabelas com RLS | **93 de 94** |
| Única sem RLS | `private.app_secrets` — schema privado, `revoke all ... from public` |
| Policies criadas | 115 |
| `REVOKE ... FROM anon` explícitos | 18 |
| Segredo em variável `NEXT_PUBLIC_*` | **nenhum** |
| Service role key no bundle do browser | **não** |
| Arquivos de teste | 137 |

### Isolamento multi-tenant

Todas as policies seguem o mesmo padrão, via uma função única:

```sql
create policy tenant_isolation_<tabela>_all on public.<tabela> for all
  using (organization_id in (select * from public.fn_user_org_ids()))
  with check (organization_id in (select * from public.fn_user_org_ids()));
```

Consistência é o ponto forte aqui — um padrão só, aplicado em loop, é muito mais
auditável que 90 policies escritas à mão.

Detalhe bem pensado: em tabelas onde `organization_id` é nullable (dados de
plataforma), a mesma policy serve — `null in (...)` nunca é verdadeiro, então
essas linhas ficam visíveis apenas ao service role, que faz bypass de RLS.

### Tabelas sem `organization_id`

`watchdog_cursors` tem RLS habilitada **sem nenhuma policy**. Isso não é
esquecimento: RLS sem policy nega tudo, e só o service role acessa. Correto
para infraestrutura de plataforma.

### Service role key

O arquivo [`lib/supabase/admin.ts`](https://github.com/melgarafael/DeskcommCRM/blob/main/lib/supabase/admin.ts)
documenta a regra no topo:

> REGRA CRÍTICA: handlers que usam este client DEVEM filtrar `organization_id`
> manualmente, resolvido de fonte confiável (cookie, JWT validado, webhook
> secret, path token) — **NUNCA do request body**.

A chave só aparece em código server-side: rotas de API, server actions, workers.
Nenhuma variável `NEXT_PUBLIC_*` carrega segredo — só `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `APP_URL` e `ADMIN_URL`.

---

## Os três pontos a corrigir

### 1. `SECURITY DEFINER` sem `search_path` fixo — 16 funções

**Severidade: média.** Corrigir antes de dado de cliente.

Funções `SECURITY DEFINER` rodam com os privilégios de quem as criou. Sem
`SET search_path` fixo, elas resolvem nomes de objeto usando o `search_path` de
quem chama — o que permite sequestro de resolução se algum papel conseguir criar
objetos num schema que venha antes na busca.

As 16 funções afetadas:

```
activate_kb_version          fn_publish_ai_agent_version
emit_event                   fn_role_at_least
fn_audit_log_row             fn_update_budget_consumption
fn_decrypt_oauth             fn_user_org_ids          ← crítica
fn_encrypt_oauth             fn_user_role_in
fn_is_platform_admin         fn_user_role_in_org
fn_lgpd_cascade_redact_contact   retrieve_top_k_chunks
fn_log_event                 rls_auto_enable
```

`fn_user_org_ids` é **a** primitiva de isolamento — toda policy de tenant chama
ela. Se um dia for sequestrável, a fronteira entre clientes cai inteira.
`fn_decrypt_oauth` e `fn_encrypt_oauth` manipulam credenciais de integração.

**Exploitabilidade hoje: baixa.** Projetos Supabase em PostgreSQL 15+ já não
deixam papéis comuns criarem objetos no schema `public`. O baseline não
revoga isso explicitamente, então a proteção vem do padrão da plataforma, não
do código — e padrão de plataforma muda.

**Correção** — uma linha por função:

```sql
alter function public.fn_user_org_ids() set search_path = public, pg_temp;
-- repetir para as outras 15
```

É o mesmo aviso que o linter oficial do Supabase emite como
`function_search_path_mutable`.

### 2. Telemetria de erro ligada de fábrica, para terceiro

**Severidade: baixa em teste, média com dado de cliente.**

Ao subir a aplicação, ela anuncia:

```
[telemetria] Relatórios de erro anonimizados ATIVOS (Sentry da comunidade).
Desligue com SENTRY_DSN=off, ou envie pro seu com SENTRY_DSN=<seu-dsn>.
```

Relatórios de erro vão para o Sentry mantido pelo autor do projeto, sem
configuração nenhuma. Eles são anonimizados, mas relatório de erro carrega
contexto de execução — e o padrão é enviar, não perguntar.

Não é falha de código, é escolha de padrão. Mas sob LGPD quem responde pelo
tratamento é quem opera o sistema, não quem o escreveu.

**Correção** — uma linha no `.env.local`:

```
SENTRY_DSN=off
```

Fazer isso **antes** de qualquer conversa real de cliente entrar. Em teste com
dado falso pode ficar ligado.

### 3. Sem guarda `server-only` — 0 arquivos

**Severidade: baixa.** Defesa em profundidade.

A separação entre código de servidor e de cliente é mantida por convenção e
comentário, não pelo compilador. Nenhum arquivo importa o pacote `server-only`.

Na prática o Next.js não injeta variáveis sem prefixo `NEXT_PUBLIC_` no bundle
do browser, então a chave em si não vazaria — o código apenas quebraria. Mas
uma linha em [`lib/supabase/admin.ts`](https://github.com/melgarafael/DeskcommCRM/blob/main/lib/supabase/admin.ts)
transforma "quebra em runtime" em "erro de build":

```ts
import "server-only";
```

---

## Verificado e descartado

| Suspeita | Resultado |
|---|---|
| Policies `using (true)` | 2, ambas em `ai_models` e `ai_pricing` — catálogo de modelos e preços, só SELECT. Sem PII |
| `GRANT ... TO anon` | 2 ocorrências, ambas dentro de comentários. Nenhum grant real |
| Tabelas sem RLS | Falso alarme inicial. 30 tabelas recebem RLS dentro de blocos `DO ... foreach`, invisíveis a busca textual simples |
| `with check (true)` | Nenhuma |
| Segredo em `NEXT_PUBLIC_*` | Nenhum |

> Registro do erro para quem repetir a auditoria: buscar
> `alter table ... enable row level security` no texto encontra 58 de 93.
> As outras 35 são aplicadas em loop dinâmico. Uma auditoria só por grep
> reporta 36 tabelas expostas que não existem.

---

## Colisão com o Supabase da NEXO IA

**Nenhuma.** Comparação dos nomes de tabela entre os dois projetos:

| | Tabelas | Exemplos |
|---|---|---|
| NexoIAos | 11 | `leads`, `clientes`, `projetos`, `contratos`, `prospeccao`, `funil_etapas`, `activity_log` |
| Deskcomm | 94 | `crm_leads`, `crm_lead_activities`, `contacts`, `conversations`, `ai_agents` |
| **Interseção** | **0** | — |

`profiles` e `tasks` (usadas pelas nossas edge functions) também não existem no
Deskcomm.

Tecnicamente os dois cabem no mesmo projeto Supabase. **Isso não significa que
devam** — ver [ARQUITETURA.md](ARQUITETURA.md).

---

## O que esta revisão não cobre

Auditoria de schema e credenciais. Ficou de fora:

- **Lógica das rotas de API** — se cada handler que usa o admin client filtra
  `organization_id` de fonte confiável, como a própria regra manda. São dezenas
  de rotas; uma que esqueça o filtro fura o isolamento inteiro
- **Teste de penetração real** — nada foi executado, só leitura de código
- **WAHA** — API não-oficial do WhatsApp, fora do escopo. Risco de negócio, não
  de código: viola os termos da Meta e o número banido é o do cliente
- **Dependências** — sem `pnpm audit` rodado

---

## Recomendação

| Antes de | Fazer |
|---|---|
| Subir em Supabase de teste | Nada. Pode subir como está |
| **Entrar dado real de cliente** | `SENTRY_DSN=off` + os 16 `search_path` + `server-only` |
| Apontar pro Supabase de produção | Auditar os handlers que usam admin client |
| Colocar número de cliente no WhatsApp | Decisão de negócio sobre o risco do WAHA |

As duas correções são de meia hora. Valem como PR de volta pro projeto — é MIT,
e melhora a base pra todo mundo que self-hosta.
