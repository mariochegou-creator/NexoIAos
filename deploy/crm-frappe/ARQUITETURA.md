# Arquitetura — por que o CRM roda separado

Documento de decisão. Leia antes de assumir que o Frappe CRM "substitui" ou
"entra dentro" do dashboard atual.

---

## As duas pilhas

| | Dashboard NEXO IA | Frappe CRM |
|---|---|---|
| **Frontend** | HTML único, vanilla JS + Chart.js | Vue 3 + Frappe UI (SPA compilada) |
| **Backend** | Supabase Edge Functions (Deno/TS) | Python + Frappe Framework |
| **Banco** | PostgreSQL (Supabase) | **MariaDB** |
| **Cache/fila** | — | Redis |
| **Auth** | Supabase Auth (JWT) | Frappe Users + sessão própria |
| **Hospedagem** | Arquivo estático | Servidor de aplicação (Docker) |
| **Onde vive** | [deploy/dashboard-nexo-ia.html](../dashboard-nexo-ia.html) | VPS em `crm.nexoia.app` |

Não há ponto de fusão. Bancos diferentes, linguagens diferentes, modelos de
autenticação diferentes. Qualquer tentativa de "copiar pra dentro" quebra os
dois. A convivência acontece **por API**, não por código compartilhado.

---

## O que roda onde

```
                    ┌──────────────────────────┐
                    │   crm.nexoia.app         │
                    │   Frappe CRM (VPS)       │
   Equipe de  ─────▶│                          │
   vendas           │  Leads · Deals · Kanban  │
                    │  Chamadas · WhatsApp     │
                    │  MariaDB + Redis         │
                    └───────────┬──────────────┘
                                │
                          REST API (token)
                                │
                    ┌───────────▼──────────────┐
                    │   Supabase               │
                    │   PostgreSQL             │
   Dashboard  ─────▶│                          │
   NEXO IA          │  clientes · projetos     │
                    │  contratos · prospeccao  │
                    │  activity_log            │
                    └──────────────────────────┘
```

### Divisão de responsabilidade proposta

| Domínio | Sistema dono | Motivo |
|---|---|---|
| Leads e funil comercial | **Frappe CRM** | Kanban, views customizadas, telefonia e WhatsApp nativos |
| Clientes ativos | **Supabase** | Já amarrado a projetos, contratos e ao dashboard |
| Projetos e entregas | **Supabase** | Não existe equivalente no Frappe CRM |
| Contratos e faturamento | **Supabase** | Idem |
| Prospecção (pré-lead) | **Supabase** | Fluxo próprio da NEXO IA, com análise por IA |
| Integrações Google/Todoist | **Supabase** | 13 edge functions já em produção |

**Regra prática:** o Frappe CRM cuida do *antes da venda*. O Supabase cuida do
*depois da venda*. O ponto de contato é o momento do fechamento.

---

## O que já temos no Supabase

Migrations em [supabase/migrations/](../../supabase/migrations/):

| Tabela | Papel hoje | Vai pro Frappe? |
|---|---|---|
| `leads` | Funil comercial completo — 9 etapas | **Sim** — vira `CRM Lead` / `CRM Deal` |
| `funil_etapas` | Etapas configuráveis do funil | **Sim** — vira status do Deal |
| `prospeccao` | Pré-lead com análise e gancho de abertura | Não — fluxo próprio |
| `clientes` | Base de clientes ativos | Não — fica no Supabase |
| `projetos` | Entregas por cliente | Não |
| `contratos` | Valor mensal, renovação | Não |
| `influenciadores` | Origem de indicação | Não |
| `campanhas_indicacao` | Campanhas por influenciador | Não |
| `activity_log` | Histórico de ações | Não |
| `processo_pendencias` | Pendências de processo | Não |
| `integration_tokens` | Tokens Google/Todoist | Não |

---

## O funil atual vs. o do Frappe

O dashboard usa 9 etapas fixas na tabela `funil_etapas`. O Frappe CRM permite
status customizados no Deal — a migração é direta:

| Etapa NEXO IA (`id`) | Rótulo | Status no Frappe CRM |
|---|---|---|
| `captacao` | Captação | Qualification |
| `r1_agendada` | R1 agendada | *criar* — R1 Agendada |
| `r1_feita` | R1 feita | *criar* — R1 Feita |
| `apn_enviada` | APN enviada | Proposal / Quotation |
| `r2_agendada` | R2 agendada | *criar* — R2 Agendada |
| `r2_feita` | R2 feita | Negotiation |
| `follow_up` | Follow-up | *criar* — Follow-up |
| `fechado` | Fechado | Won |
| `perdido` | Perdido | Lost |

Campos que precisam ser criados como custom fields no Frappe:
`resultado_r2`, `objecao_aberta`, `tentativas_followup`, `origem`,
`influenciador_id`, `segmento`, `cidade`.

Ver [PRIMEIROS-PASSOS.md](PRIMEIROS-PASSOS.md) para a configuração.

---

## Custo de manter os dois

| Item | Valor/mês |
|---|---|
| VPS do Frappe CRM | ~R$ 50 |
| Supabase (plano atual) | inalterado |
| Manutenção — updates, backup, SSL | ~1h/mês |

O custo real não é o servidor: é ter **duas fontes de verdade**. Enquanto a
sincronização de [INTEGRACAO-NEXOIAOS.md](INTEGRACAO-NEXOIAOS.md) não estiver
no ar, um lead fechado no Frappe **não** aparece como cliente no dashboard.
Alguém vai ter que digitar duas vezes.

Vale a pena se o ganho for real: Kanban drag-and-drop, telefonia integrada,
WhatsApp no CRM, usuários ilimitados. Se o objetivo era só o Kanban, portar
essa feature pro dashboard atual sai mais barato que manter um segundo sistema.

---

## Alternativas descartadas (e por quê)

| Alternativa | Por que não |
|---|---|
| Copiar o código do Frappe pro repo | Precisa de MariaDB + Redis + Python rodando. O código sozinho não faz nada |
| Frappe apontando pro Postgres do Supabase | O Frappe v15 suporta Postgres experimentalmente, mas o app CRM assume MariaDB. Risco alto, sem suporte |
| Usar só o frontend Vue do Frappe CRM | O frontend fala exclusivamente com a API do Frappe. Reescrever o backend = reescrever o produto |
| Rodar Frappe local na máquina do Mario | Windows sem Docker/WSL. E CRM em máquina pessoal não serve pra equipe |
