# Backup — pré reorganização da dashboard (schema + abas)

Criado em 2026-07-02, antes de começar a reorganização de schema/abas descrita no prompt "Etapa 1 de 2 — Backend/Schema da Dashboard Nexo IA".

## O que tem aqui

- `dashboard-nexo-ia.html` — cópia do arquivo canônico (`MazyOS/saidas/dashboard-nexo-ia.html`) no estado atual
- `deploy/` — cópias do que estava publicado (`deploy/dashboard-nexo-ia.html`, `index.html`, `guia-comandos-nexo-ia.html`)
- `supabase/` — cópia completa da pasta local (`migrations/`, `functions/`, `config.toml`) como estava antes desta etapa
- `schema-columns.json` — todas as tabelas/colunas/tipos do schema `public` no Supabase, no momento do backup
- `data/*.json` — dump completo (todas as linhas) de cada tabela: `clients`, `finance_entries`, `integration_tokens`, `marketing`, `profiles`, `settings`, `tasks`

## Como restaurar se algo der errado

**Front-end (HTML):** copiar `dashboard-nexo-ia.html` de volta pra `MazyOS/saidas/` e `deploy/`, redeployar com `npx wrangler pages deploy`.

**Dados de uma tabela:** os JSONs em `data/` podem ser reinseridos via REST API do Supabase (`POST /rest/v1/<tabela>` com o array do JSON, usando a service role key) — não é um `pg_dump` binário, é dado tabular simples.

**Schema:** `schema-columns.json` é referência de leitura (nomes/tipos), não um script de restauração automática — serve pra comparar "como era antes" caso uma migration precise ser revertida manualmente.

**Edge Functions/migrations:** a pasta `supabase/` aqui é um espelho completo; em caso de necessidade, copiar de volta por cima de `MazyOS/supabase/` e rodar `npx supabase functions deploy` novamente.
