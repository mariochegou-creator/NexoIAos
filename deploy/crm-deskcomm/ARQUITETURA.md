# DeskcommCRM — decisão de arquitetura

Onde o Deskcomm roda em relação ao que a NEXO IA já tem.
Revisão técnica que embasa este documento: [SEGURANCA.md](SEGURANCA.md).

---

## A stack bate com a nossa

| | NexoIAos hoje | DeskcommCRM |
|---|---|---|
| Banco | Supabase / PostgreSQL | **Supabase / PostgreSQL** |
| Auth | Supabase Auth | **Supabase Auth** |
| Backend | Edge Functions (Deno) | Next.js server actions + API routes |
| Frontend | HTML único, vanilla JS | Next.js 16 + React 19 + TS |
| Licença | — | MIT |

É a mesma fundação. Por isso o Deskcomm entra na conversa de um jeito que o
Frappe CRM nunca entraria — ver [../crm-frappe/ARQUITETURA.md](../crm-frappe/ARQUITETURA.md).

---

## Mesmo projeto Supabase ou separado?

Tecnicamente cabe: **zero colisão** entre as 11 tabelas nossas e as 94 dele
(detalhe em [SEGURANCA.md](SEGURANCA.md#colisão-com-o-supabase-da-nexo-ia)).
Mas caber não é motivo suficiente.

| | Projeto separado | Mesmo projeto |
|---|---|---|
| Fonte de verdade | Duas — precisa sincronizar | **Uma** |
| Raio de impacto de um bug | Contido no CRM | Atinge a operação inteira |
| Rollback | Descarta o projeto | Restore do banco de produção |
| Custo Supabase | Dois projetos | Um |
| Reverter a decisão | Fácil | Difícil |

### Recomendação

**Começar separado. Migrar pro mesmo projeto só depois da fase 3.**

O `baseline.sql` cria 94 tabelas, 115 policies, dezenas de funções `SECURITY
DEFINER` e triggers no schema `public` do projeto onde rodar. Rodar isso contra
o banco que hoje sustenta a operação comercial da NEXO IA — antes de qualquer
teste — troca um risco pequeno (dois projetos por algumas semanas) por um risco
grande (uma migration ruim no banco de produção).

Depois que o sistema provar que serve, unificar é uma decisão informada.

---

## Divisão de responsabilidade

Se a unificação acontecer, é assim que os dois se dividem:

| Domínio | Dono | Motivo |
|---|---|---|
| Conversas de WhatsApp | **Deskcomm** | Não temos nada equivalente |
| Agentes de IA e follow-up | **Deskcomm** | Idem |
| Funil comercial | **Deskcomm** | `crm_leads` + `crm_stages` substituem `leads` + `funil_etapas` |
| Prospecção (pré-lead) | Supabase / dashboard | Fluxo próprio, com análise por IA |
| Clientes ativos | Supabase / dashboard | Amarrado a projetos e contratos |
| Projetos e entregas | Supabase / dashboard | Sem equivalente no Deskcomm |
| Contratos e faturamento | Supabase / dashboard | Idem |
| Integrações Google/Todoist | Supabase / dashboard | 13 edge functions em produção |

O Deskcomm cobre *antes da venda*. O que já temos cobre *depois da venda*.

---

## O caminho até lá

| Fase | O quê | Critério pra passar |
|---|---|---|
| 1 | Fork + Supabase de teste | App sobe e loga |
| 2 | Corrigir `search_path` + `server-only` | Ver [SEGURANCA.md](SEGURANCA.md#os-dois-pontos-a-corrigir) |
| 3 | 2 semanas com dados falsos | A operação da NEXO IA cabe nele? |
| 4 | Auditar handlers do admin client | Todo handler filtra `organization_id` de fonte confiável |
| 5 | Migrar leads reais | — |
| 6 | Portar clientes/projetos/contratos | Aposenta [dashboard-nexo-ia.html](../dashboard-nexo-ia.html) |

A fase 3 é a que decide. As anteriores são preparação; as posteriores só fazem
sentido se ela passar.

---

## O que ainda não foi decidido

- **WhatsApp via WAHA** — API não-oficial, viola os termos da Meta. Número
  banido é o do cliente, não o nosso. Decisão de negócio, não técnica
- **Revender pros clientes** — o Deskcomm é multi-tenant e MIT, então dá.
  Mas assumir suporte de um sistema de 3 meses na operação de um cliente
  pagante é outro nível de compromisso
- **Aposentar o dashboard atual** — só faz sentido depois da fase 5
