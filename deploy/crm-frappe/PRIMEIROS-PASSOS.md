# Primeiros passos no Frappe CRM

Depois que o [README.md](README.md) terminar e você conseguir logar em
`https://crm.nexoia.app/crm`, siga esta ordem.

---

## 1. Trocar a senha do Administrator

O `Administrator` é a conta de emergência. Ninguém usa no dia a dia.

*Avatar (canto superior direito) → Settings → Change Password*

Guarde a nova senha no gerenciador da NEXO IA. Depois disso, crie sua conta
pessoal (passo 3) e use ela.

---

## 2. Configurar o e-mail de saída

Sem isso o CRM não envia convite pros usuários nem e-mail pra lead.

*Settings → Email Accounts → New*

Para Gmail/Google Workspace:

| Campo | Valor |
|---|---|
| Email Address | contato@nexoia.com.br |
| Service | GMail |
| Password | **senha de app**, não a senha da conta |

> Gere a senha de app em https://myaccount.google.com/apppasswords
> (exige verificação em duas etapas ativa).

Depois clique em **Send Test Email** antes de seguir.

---

## 3. Criar os usuários

*Settings → Users → Add User*

| Nome | E-mail | Papel |
|---|---|---|
| Mario Brandao | — | System Manager (admin) |
| Rian | — | Sales User |

**Papéis disponíveis:**
- `System Manager` — acesso total, incluindo configurações
- `Sales Manager` — vê todos os leads e deals, gerencia o time
- `Sales User` — vê só o que está atribuído a ele

Cada usuário recebe um e-mail pra definir a senha. Se não chegar, revise o passo 2.

---

## 4. Configurar o funil da NEXO IA

O Frappe vem com status genéricos. Substitua pelos nossos.

*Settings → Deal Statuses*

Crie/renomeie nesta ordem (veja o mapeamento completo em [ARQUITETURA.md](ARQUITETURA.md)):

| Ordem | Status | Cor |
|---|---|---|
| 1 | Captação | `#7b5ccc` |
| 2 | R1 agendada | `#a78bfa` |
| 3 | R1 feita | `#8b5cf6` |
| 4 | APN enviada | `#f97316` |
| 5 | R2 agendada | `#f59e0b` |
| 6 | R2 feita | `#eab308` |
| 7 | Follow-up | `#06b6d4` |
| 8 | Fechado | `#22c55e` |
| 9 | Perdido | `#3f5070` |

As cores são as mesmas do dashboard atual (`funil_etapas`) — mantém a leitura
visual consistente entre os dois sistemas.

---

## 5. Criar os campos customizados

O funil da NEXO IA usa campos que o Frappe não tem por padrão.

*Settings → Customize → CRM Deal → Add Field*

| Campo | Tipo | Opções |
|---|---|---|
| Segmento | Data | — |
| Cidade | Data | — |
| Origem | Select | `Prospecção ativa`, `Indicação influencer` |
| Resultado R2 | Select | `Pedido`, `Avanço`, `Não venda` |
| Objeção aberta | Small Text | — |
| Tentativas follow-up | Int | — |
| Valor estimado | Currency | — |

Esses campos espelham as colunas de `public.leads`. Manter os nomes alinhados
facilita muito a sincronização descrita em [INTEGRACAO-NEXOIAOS.md](INTEGRACAO-NEXOIAOS.md).

---

## 6. Importar os leads existentes

### Exportar do Supabase

No SQL Editor do Supabase:

```sql
select
  nome                as "Organization",
  segmento            as "Segmento",
  cidade              as "Cidade",
  responsavel         as "Deal Owner",
  valor_estimado      as "Valor estimado",
  etapa_funil         as "Status",
  objecao_aberta      as "Objeção aberta",
  tentativas_followup as "Tentativas follow-up",
  obs                 as "Notes",
  created_at          as "Created On"
from public.leads
where etapa_funil not in ('fechado', 'perdido')
order by created_at;
```

Baixe como CSV.

> Só migre o funil **ativo**. Leads fechados e perdidos ficam no histórico do
> Supabase — não poluem o CRM novo.

### Importar no Frappe

*Settings → Data Import → New → Document Type: CRM Deal*

1. Suba o CSV
2. Mapeie as colunas (os nomes acima já batem com os campos do passo 5)
3. Rode em **Dry Run** primeiro — confira os erros
4. Só então clique em **Start Import**

O `Status` vem com os `id` do Supabase (`captacao`, `r1_agendada`...). Troque
pelos rótulos do passo 4 no CSV antes de importar, ou o Frappe rejeita as linhas.

---

## 7. Ativar as integrações

Configure só o que a equipe for usar de fato. Cada integração ativa é mais uma
coisa pra manter.

### WhatsApp

Precisa do app [Frappe WhatsApp](https://github.com/shridarpatil/frappe_whatsapp)
instalado no servidor, além de conta no WhatsApp Business API (Meta).

```bash
docker compose -p nexo_crm exec backend bench get-app frappe_whatsapp
docker compose -p nexo_crm exec backend bench --site crm.nexoia.app install-app frappe_whatsapp
docker compose -p nexo_crm restart
```

### Twilio (chamadas pelo CRM)

*Settings → Twilio* — precisa de Account SID, Auth Token e um número comprado.
Nativo, não exige instalação extra.

### Exotel (chamadas pelo celular do vendedor)

*Settings → Exotel* — alternativa ao Twilio. Também nativo.

---

## 8. Backup pra fora do servidor

O cron do `deploy-crm.sh` já faz backup diário **dentro** do servidor. Isso não
protege contra perda do VPS.

*Settings → System Settings → Backups*

Configure destino S3 ou Backblaze B2. Backblaze sai por ~R$ 3/mês pro volume
que a NEXO IA vai gerar.

---

## Checklist final

Antes de liberar pra equipe:

- [ ] Senha do `Administrator` trocada e guardada
- [ ] E-mail de saída testado (Send Test Email passou)
- [ ] Mario e Rian com acesso e senha definida
- [ ] 9 status do funil criados com as cores certas
- [ ] 7 campos customizados criados no CRM Deal
- [ ] Leads ativos importados e conferidos
- [ ] Backup externo configurado e com um restore testado
- [ ] Equipe avisada: **lead novo entra no CRM, não no dashboard**

O último item é o que mais falha na prática. Enquanto a sincronização não
existir, todo mundo precisa saber qual sistema é dono de quê —
ver [ARQUITETURA.md](ARQUITETURA.md).
