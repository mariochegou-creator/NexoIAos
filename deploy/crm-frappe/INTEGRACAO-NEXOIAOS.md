# Integração Frappe CRM ↔ NexoIAos

Plano de conexão. **Nada disso está implementado** — é o desenho do que
precisa ser feito depois que o CRM estiver no ar e a equipe usando.

Contexto da divisão de responsabilidade: [ARQUITETURA.md](ARQUITETURA.md).

---

## O problema que isso resolve

Sem sincronização, um deal marcado como **Fechado** no Frappe CRM não vira
cliente no dashboard. Alguém cadastra à mão, esquece, e as duas bases divergem.

O objetivo é **um** fluxo automático, na direção que importa:

```
Frappe CRM                              Supabase / Dashboard
──────────                              ────────────────────
Deal → status "Fechado"  ──webhook──▶   cria public.clientes
                                        cria public.projetos (rascunho)
                                        registra em activity_log
```

Sincronização bidirecional **não** está no escopo. Duas fontes de verdade
escrevendo uma na outra gera conflito e é caro de manter.

---

## Como funciona

### 1. Webhook no Frappe

*Settings → Integrations → Webhooks → New*

| Campo | Valor |
|---|---|
| DocType | `CRM Deal` |
| Trigger | On Update |
| Condition | `doc.status == "Fechado"` |
| Request URL | `https://<PROJETO>.supabase.co/functions/v1/crm-deal-fechado` |
| Request Method | POST |
| Request Structure | Form URL-Encoded → **JSON** |

**Header de autenticação:**

```
x-crm-webhook-secret: <segredo gerado>
```

Gere o segredo com:

```bash
openssl rand -hex 32
```

Guarde nos secrets do Supabase:

```bash
supabase secrets set CRM_WEBHOOK_SECRET=<o-segredo>
supabase secrets set FRAPPE_API_URL=https://crm.nexoia.app
supabase secrets set FRAPPE_API_KEY=<api-key>
supabase secrets set FRAPPE_API_SECRET=<api-secret>
```

> As chaves de API do Frappe saem em *Settings → Users → [usuário] →
> API Access → Generate Keys*. Crie um usuário de serviço dedicado
> (`integracao@nexoia.com.br`, papel `Sales Manager`) — não use a sua conta.

### 2. Edge function no Supabase

Nova função em `supabase/functions/crm-deal-fechado/index.ts`, seguindo o
padrão das 13 já existentes ([`_shared/cors.ts`](../../supabase/functions/_shared/cors.ts),
[`_shared/supabaseAdmin.ts`](../../supabase/functions/_shared/supabaseAdmin.ts)):

```ts
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  // Webhook do Frappe não manda JWT do Supabase — autentica por segredo compartilhado.
  const secret = req.headers.get("x-crm-webhook-secret");
  if (!secret || secret !== Deno.env.get("CRM_WEBHOOK_SECRET")) {
    return jsonResponse({ error: "Não autorizado." }, 401);
  }

  const deal = await req.json().catch(() => null);
  if (!deal?.name) return jsonResponse({ error: "Payload inválido." }, 400);

  // Idempotência: o Frappe pode reenviar o mesmo evento.
  const { data: existente } = await supabaseAdmin
    .from("clientes")
    .select("id")
    .eq("frappe_deal_id", deal.name)
    .maybeSingle();

  if (existente) return jsonResponse({ criado: false, cliente_id: existente.id });

  const { data: cliente, error } = await supabaseAdmin
    .from("clientes")
    .insert({
      nome: deal.organization,
      frappe_deal_id: deal.name,
      // demais campos conforme o schema de public.clientes
    })
    .select("id")
    .single();

  if (error) {
    console.error("crm-deal-fechado error:", error);
    return jsonResponse({ error: "Falha ao criar cliente." }, 500);
  }

  await supabaseAdmin.from("activity_log").insert({
    entidade: "clientes",
    entidade_id: cliente.id,
    acao: "criado_via_crm",
    detalhe: `Deal ${deal.name} fechado no Frappe CRM`,
  });

  return jsonResponse({ criado: true, cliente_id: cliente.id });
});
```

> Os nomes das colunas em `insert` são ilustrativos — confira o schema real em
> [`20260702044949_leads_clientes_reorg.sql`](../../supabase/migrations/20260702044949_leads_clientes_reorg.sql)
> na hora de implementar.

### 3. Migration de apoio

Precisa de uma coluna pra amarrar os dois lados e garantir idempotência:

```sql
-- supabase/migrations/<timestamp>_clientes_frappe_deal_id.sql
alter table public.clientes add column frappe_deal_id text;
create unique index clientes_frappe_deal_id_idx
  on public.clientes(frappe_deal_id)
  where frappe_deal_id is not null;
```

O índice é **parcial** — permite vários clientes sem `frappe_deal_id`
(os que já existiam) e impede duplicata dos que vêm do CRM.

---

## Leitura do CRM pelo dashboard

Pro dashboard mostrar KPIs do funil sem duplicar dados, ele lê a API do Frappe
via edge function (nunca direto do browser — a API key não pode vazar).

```
GET https://crm.nexoia.app/api/method/frappe.client.get_list
    ?doctype=CRM Deal
    &fields=["name","organization","status","annual_revenue"]
    &limit_page_length=0

Authorization: token <API_KEY>:<API_SECRET>
```

Sugestão: edge function `crm-funil-resumo` que agrega por status e devolve os
números prontos pro Chart.js do dashboard. Cache de 5 minutos evita bater no
CRM a cada refresh.

---

## Ordem de implementação

| # | Etapa | Depende de |
|---|---|---|
| 1 | CRM no ar e equipe usando por ~2 semanas | [README.md](README.md) |
| 2 | Migration `frappe_deal_id` | — |
| 3 | Usuário de serviço + API keys no Frappe | 1 |
| 4 | Edge function `crm-deal-fechado` | 2, 3 |
| 5 | Webhook no Frappe apontando pra ela | 4 |
| 6 | Teste com deal de mentira ponta a ponta | 5 |
| 7 | Edge function `crm-funil-resumo` (leitura) | 3 |
| 8 | Card de funil no dashboard consumindo o resumo | 7 |

> **Não pule a etapa 1.** Só depois de a equipe usar de verdade dá pra saber
> quais campos importam. Automatizar antes disso é reescrever depois.

---

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Webhook falha silenciosamente | O Frappe registra tentativas em *Webhook Request Log*. Revisar semanalmente |
| Deal reaberto depois de fechado | A função é idempotente por `frappe_deal_id` — não duplica. Reversão é manual |
| API key vazada | Nunca no HTML do dashboard. Só em secrets do Supabase, lida server-side |
| CRM fora do ar | O dashboard perde os KPIs do funil, mas continua funcionando. Trate o fetch com fallback |
| Divergência de nomes de cliente | Deal usa `organization`, Supabase usa `nome`. Padronizar na função, não no banco |
