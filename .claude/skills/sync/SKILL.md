---
name: sync
description: >
  Sincroniza o cliente atual com o dashboard da NEXO IA. Lê .nexo-status.md da pasta do cliente,
  faz upsert no Supabase e confirma. Use quando disser "sync", "/sync", "atualizar dashboard",
  "sincronizar", "manda pro dash".
---

# /sync — Sincronizar cliente com o dashboard NEXO IA

## Credenciais (não alterar)

```
SB_URL=https://norgsipmgxbakfmkqcnl.supabase.co
SB_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcmdzaXBtZ3hiYWtmbWtxY25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk5NjE5MywiZXhwIjoyMDk3NTcyMTkzfQ.UswVzMm_b1WrYloUxvieB-PSjM56znqv3-2gJay0mA0
```

## Workflow

### Passo 1 — Detectar o cliente

Ler o `CLAUDE.md` da pasta atual para identificar o nome do projeto/cliente.
Se não encontrar, usar o nome da pasta em que a conversa está ocorrendo.

### Passo 2 — Ler ou criar .nexo-status.md

Verificar se existe `.nexo-status.md` na pasta do cliente.

**Se não existir**, criar com este template e preencher o que for possível inferir do contexto:

```markdown
---
supabase_id: 
status: prospect
valor: 0
servicos: 
proximo_passo: 
resp: Mario Brandao
obs: 
---
```

**Se existir**, ler os campos do frontmatter.

### Passo 3 — Atualizar campos se necessário

Se o usuário acabou de descrever mudanças (ex: "fechamos o contrato por R$ 3.000", "mudou pra ativo"), atualizar os campos correspondentes no `.nexo-status.md` ANTES de sincronizar.

Campos disponíveis:
- `status`: prospect | proposta | negociando | ativo | encerrado
- `valor`: número sem R$ ou formatação
- `servicos`: texto livre
- `proximo_passo`: texto livre
- `resp`: nome completo do responsável (Mario Brandao / Lucas Warner / Rian Martins)
- `obs`: texto livre

### Passo 4 — Executar o upsert via curl

**Se `supabase_id` está vazio (primeira vez):**

Executar via Bash:
```bash
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/clients" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"nome\":\"NOME\",\"status\":\"STATUS\",\"valor\":VALOR,\"servicos\":\"SERVICOS\",\"resp\":\"RESP\",\"proximo_passo\":\"PASSO\",\"obs\":\"OBS\"}"
```

Pegar o campo `id` do JSON retornado e salvar em `supabase_id` no `.nexo-status.md`.

**Se `supabase_id` já existe:**

Executar via Bash:
```bash
curl -s -X PATCH "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/clients?id=eq.SUPABASE_ID" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"STATUS\",\"valor\":VALOR,\"servicos\":\"SERVICOS\",\"resp\":\"RESP\",\"proximo_passo\":\"PASSO\",\"obs\":\"OBS\"}"
```

### Passo 5 — Registrar handoff

Perguntar ao usuário (ou inferir do contexto da conversa):
1. **O que foi feito nessa sessão?** (resumo em 1-3 frases)
2. **Qual o próximo passo?** (o que quem continuar deve fazer)

Salvar no registro do cliente via PATCH:

```bash
curl -s -X PATCH "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/clients?id=eq.SUPABASE_ID" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"handoff_summary\":\"RESUMO\",\"handoff_next\":\"PROXIMO_PASSO\",\"handoff_by\":\"NOME_DO_RESPONSAVEL\",\"handoff_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
```

### Passo 5b — Registrar no feed de atividade

```bash
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/activity_log" \
  -H "apikey: SB_KEY" \
  -H "Authorization: Bearer SB_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"client_name\":\"NOME\",\"user_name\":\"NOME_DO_RESPONSAVEL\",\"description\":\"RESUMO\"}"
```

### Passo 6 — Sincronizar tarefas (se existirem)

Se a pasta tiver um arquivo de tarefas (`tarefas.md` ou similar), extrair as tarefas com título, responsável e status, e fazer upsert:

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

### Passo 6 — Confirmar

Responder em formato curto:

```
✓ Dashboard atualizado — [Nome do cliente]
  Status: [status]  |  Valor: R$ [valor]
  Próximo passo: [proximo_passo]
```

## Regras

- Sempre salvar o `supabase_id` retornado no `.nexo-status.md` após o primeiro POST
- Nunca apagar o `.nexo-status.md` — ele é o vínculo entre a pasta e o Supabase
- Se o curl retornar erro, mostrar o erro e sugerir verificar a conexão
- `valor` deve ser enviado como número puro (ex: 2500, não "R$ 2.500")
- Substituir todos os placeholders (NOME, STATUS, VALOR etc.) antes de executar o curl
