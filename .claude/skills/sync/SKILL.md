---
name: sync
description: >
  Sincroniza o cliente atual com o dashboard da NEXO IA. Lê .nexo-status.md da pasta do cliente,
  faz upsert no Supabase (em `leads` ou `clientes`+`contratos`, dependendo do estágio) e confirma.
  Use quando disser "sync", "/sync", "atualizar dashboard", "sincronizar", "manda pro dash".
---

# /sync — Sincronizar cliente com o dashboard NEXO IA

## Credenciais (não alterar)

```
SB_URL=https://norgsipmgxbakfmkqcnl.supabase.co
SB_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcmdzaXBtZ3hiYWtmbWtxY25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk5NjE5MywiZXhwIjoyMDk3NTcyMTkzfQ.UswVzMm_b1WrYloUxvieB-PSjM56znqv3-2gJay0mA0
```

## Modelo de dados

Desde a reorganização do schema, o funil comercial vive em duas tabelas:
- **`leads`** — do primeiro contato até o fechamento (ou perda). Estágios: `captacao`, `r1_agendada`, `r1_feita`, `apn_enviada`, `r2_agendada`, `r2_feita`, `follow_up`, `fechado`, `perdido`.
- **`clientes`** + **`contratos`** — só depois de fechado. Estágios: `ativo`, `encerrado`, `suspenso`.

O `.nexo-status.md` continua sendo a fonte da verdade local, mas agora guarda **dois** IDs possíveis (`lead_id` e `cliente_id`) em vez de um `supabase_id` genérico.

## Workflow

### Passo 1 — Detectar o cliente

Ler o `CLAUDE.md` da pasta atual para identificar o nome do projeto/cliente.
Se não encontrar, usar o nome da pasta em que a conversa está ocorrendo.

### Passo 2 — Ler ou criar .nexo-status.md

Verificar se existe `.nexo-status.md` na pasta do cliente.

**Se não existir**, criar com este template e preencher o que for possível inferir do contexto:

```markdown
---
lead_id: 
cliente_id: 
status: captacao
valor: 0
servicos: 
proximo_passo: 
resp: Mario Brandao
obs: 
repo_url: 
local_path: 
---
```

**Se existir**, ler os campos do frontmatter.

### Passo 3 — Perguntar observações e atualizar campos

**Sempre** perguntar antes de sincronizar:

> "Quer atualizar as observações desse projeto? (aparecem na dashboard ao clicar no cliente)
> Observação atual: [valor de obs ou 'vazia']"

Aguardar a resposta. Se o usuário digitar algo, substituir o campo `obs` no `.nexo-status.md`. Se responder "não" ou "pular", manter o valor atual.

Depois, se o usuário tiver descrito mudanças no contexto da conversa (ex: "marcou a R1 pra quinta", "fechamos o contrato por R$ 3.000", "virou cliente ativo"), atualizar os campos correspondentes também.

Campos disponíveis:
- `status`: um dos 9 estágios de funil (`captacao`, `r1_agendada`, `r1_feita`, `apn_enviada`, `r2_agendada`, `r2_feita`, `follow_up`, `fechado`, `perdido`) **ou** um dos 3 estágios de cliente fechado (`ativo`, `encerrado`, `suspenso`)
- `valor`: número sem R$ ou formatação — valor estimado (se ainda é lead) ou valor mensal do contrato (se já é cliente)
- `servicos`: texto livre
- `proximo_passo`: texto livre
- `resp`: nome completo do responsável (Mario Brandao / Lucas Warner / Rian Martins)
- `obs`: texto livre
- `repo_url`: URL do repositório GitHub do projeto deste cliente
- `local_path`: caminho local da pasta no computador (ex: c:/Users/Fernando/Documents/projeto)

### Passo 4 — Decidir tabela de destino e executar o upsert

**Se `status` é um dos 9 estágios de funil** → o registro vive em `leads`.

- Se `lead_id` está vazio (primeira vez): `POST /rest/v1/leads` com `nome`, `etapa_funil: STATUS`, `valor_estimado: VALOR`, `responsavel: RESP`, `obs: OBS`. Salvar o `id` retornado em `lead_id`.
- Se `lead_id` já existe: `PATCH /rest/v1/leads?id=eq.LEAD_ID` com os mesmos campos (mais `updated_at` = agora).

**Se `status` é `ativo`, `encerrado` ou `suspenso` e `cliente_id` está vazio** → é uma **promoção** de lead pra cliente. Isso só deve acontecer uma vez por negócio.

Antes de promover, **confirmar explicitamente com o usuário**:
> "Esse lead vai virar cliente [ativo/encerrado] agora — confirma? (isso cria o registro de contrato no Supabase)"

Se confirmado:
1. `POST /rest/v1/clientes` com `nome`, `status: STATUS`, `responsavel: RESP`, `obs: OBS`, `repo_url: REPO_URL`, `local_path: LOCAL_PATH`, e `lead_id: LEAD_ID` (preserva o rastro de origem — **não apagar** `lead_id` do `.nexo-status.md`).
2. Salvar o `id` retornado em `cliente_id`.
3. Se `valor > 0`: `POST /rest/v1/contratos` com `cliente_id: CLIENTE_ID`, `valor_mensal: VALOR`, `status: 'ativo'`.

**Se `status` é `ativo`/`encerrado`/`suspenso` e `cliente_id` já existe** → fluxo normal, sem promoção:
- `PATCH /rest/v1/clientes?id=eq.CLIENTE_ID` com `status`, `servicos`, `resp`→`responsavel`, `proximo_passo`, `repo_url`, `local_path`, `obs`.
- Se `valor` mudou: atualizar o contrato ativo desse cliente (`PATCH /rest/v1/contratos?cliente_id=eq.CLIENTE_ID&status=eq.ativo` com `valor_mensal: VALOR`), ou criar um novo se não existir nenhum ainda.

Exemplo de curl (ajustar tabela/campos conforme o caso acima):
```bash
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/TABELA" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{...campos...}"
```

### Passo 4b — Coletar últimos commits do projeto

Se a pasta do cliente for um repositório git, rodar:
```bash
git log --oneline -10 2>/dev/null
```

Se retornar commits, armazenar como array de strings para usar no Passo 5.
Se não for um repo git, `commits` fica como array vazio `[]`.

### Passo 5 — Registrar handoff (só faz sentido pra cliente, não pra lead)

Handoff (sessão de trabalho, commits) só existe depois que o projeto tem código — ou seja, só depois da promoção pra `clientes`. Se ainda é `lead`, pular este passo.

Perguntar ao usuário (ou inferir do contexto da conversa):
1. **O que foi feito nessa sessão?** (resumo em 1-3 frases)
2. **Qual o próximo passo?** (o que quem continuar deve fazer)

Salvar no registro do cliente via PATCH:

```bash
curl -s -X PATCH "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/clientes?id=eq.CLIENTE_ID" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"handoff_summary\":\"RESUMO\",\"handoff_next\":\"PROXIMO_PASSO\",\"handoff_by\":\"NOME_DO_RESPONSAVEL\",\"handoff_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"last_session\":{\"synced_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"synced_by\":\"NOME_DO_RESPONSAVEL\",\"commits\":[COMMITS_JSON]}}"
```

Onde `COMMITS_JSON` é o resultado do `git log --oneline -10` convertido para array JSON de strings. Exemplo: `\"abc1234 Adiciona configurações\",\"def5678 Fix cores\"`

Se não houver commits, usar `[]`.

### Passo 5b — Registrar no feed de atividade

Sempre executar, seja lead ou cliente (usa o nome, não o id):

```bash
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/activity_log" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"client_name\":\"NOME\",\"user_name\":\"NOME_DO_RESPONSAVEL\",\"description\":\"RESUMO\"}"
```

### Passo 6 — Sincronizar tarefas (se existirem)

Se a pasta tiver um arquivo de tarefas (`tarefas.md` ou similar), extrair as tarefas com título, responsável e status, e fazer upsert (sem mudança — `tasks.client_name` continua sendo texto livre, funciona igual para lead ou cliente):

```bash
# Primeiro apagar as tarefas antigas desse cliente
curl -s -X DELETE "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/tasks?client_name=eq.NOME" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY"

# Depois inserir as atuais
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/tasks" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "[{\"title\":\"TITULO\",\"status\":\"STATUS\",\"client_name\":\"NOME\",\"resp\":\"RESP\"}]"
```

Se não tiver arquivo de tarefas, pular este passo.

### Passo 7 — Confirmar

Responder em formato curto:

```
✓ Dashboard atualizado — [Nome do cliente]
  [Lead: etapa STATUS | Cliente: status STATUS]  |  Valor: R$ [valor]
  Próximo passo: [proximo_passo]
```

## Regras

- Sempre salvar o `lead_id` retornado no `.nexo-status.md` após o primeiro `POST` em `leads`, e o `cliente_id` após a promoção
- Nunca apagar o `.nexo-status.md` — ele é o vínculo entre a pasta e o Supabase
- Nunca apagar `lead_id` depois que o cliente for promovido — é o rastro de origem (útil pra saber se veio de prospecção ativa ou indicação de influencer)
- Promoção lead→cliente **sempre pede confirmação explícita** antes de criar `clientes`+`contratos` — evita duplicar se `/sync` rodar duas vezes seguidas com `status: ativo`
- Se o curl retornar erro, mostrar o erro e sugerir verificar a conexão
- `valor` deve ser enviado como número puro (ex: 2500, não "R$ 2.500")
- Substituir todos os placeholders (NOME, STATUS, VALOR etc.) antes de executar o curl
