# Conectar o WhatsApp (WAHA)

O que é preciso pra ligar o WhatsApp no CRM, o que custa, e o risco que vem junto.

---

## Antes de tudo: dois avisos

### 1. Não é API oficial

O WAHA conversa com o WhatsApp fazendo engenharia reversa do WhatsApp Web. Isso
**viola os termos da Meta**. O risco não é teórico: o número pode ser banido.

Num teste com número seu, o prejuízo é seu. **Num cliente, o prejuízo é do
cliente** — e ele perde o WhatsApp do negócio, que muitas vezes é o canal de venda
principal dele. Decida isso antes de vender, não depois.

Alternativa sem esse risco: a API oficial do WhatsApp Business (Meta Cloud API).
Custa por conversa, exige aprovação de modelos de mensagem e é mais burocrática —
mas não bane ninguém. O Deskcomm **não** suporta ela hoje.

### 2. Sem chave de IA, o robô não responde

Ligar o WAHA faz as mensagens **entrarem** no CRM. Para o agente **responder**,
é preciso também uma chave da Anthropic (paga, por uso).

Só WAHA = caixa de entrada unificada, resposta manual.
WAHA + chave de IA = atendimento automático.

---

## O que a máquina precisa

| Item | Situação nesta máquina |
|---|---|
| Docker Desktop | ❌ **não instalado** |
| WSL2 (Linux dentro do Windows) | ❌ **não instalado** |
| Número de WhatsApp para o teste | você decide |

O Docker Desktop no Windows exige WSL2, ocupa ~10 GB e **pede reinicialização**.
É a única barreira real — o resto é configuração.

---

## Quanto custa: nada

**Desde a versão 2026.6.1 o WAHA Plus deixou de existir como produto pago.** Tudo
que era exclusivo dele — sessões ilimitadas, mensagens com mídia, todos os
armazenamentos, segurança — foi incorporado ao Core, nas palavras da
documentação, *"100% free and open source, for everyone"*.

| | Antes | Hoje |
|---|---|---|
| Vários números | só no Plus (~US$ 30/mês) | **grátis** |
| Mensagens com mídia | só no Plus | **grátis** |
| Imagem Docker | portal privado com login | pública |

Existe um apoio voluntário de US$ 5/mês no Patreon, que a própria documentação
descreve como *"no perks, just a way to support the work"*. Não destrava nada.

**Multi-número é gratuito.** Isso muda a conta de revender: não há custo de
licença por cliente.

> ⚠️ **O runbook do projeto está desatualizado.** O
> `docs/runbooks/waha-hostgator.md` ainda diz *"Licença ativa WAHA Plus
> (~$30/mês)"* — ele é de **04/05/2026**, anterior à mudança. Ignore esse trecho.

### A imagem do compose está certa

O `docker-compose.yml` aponta para `devlikeapro/waha:noweb`. Conferi no Docker
Hub: essa tag está na **versão 2026.7.2, publicada em 29/07/2026** — mesmo dia e
mesma versão da `latest`. Ou seja, já traz tudo que era Plus.

**Não é preciso mexer no compose.**

---

## Passo 1 — Instalar o Docker Desktop

1. Baixe em https://www.docker.com/products/docker-desktop
2. Durante a instalação, deixe marcado **"Use WSL 2 instead of Hyper-V"**
3. **Reinicie o computador**
4. Abra o Docker Desktop e espere o ícone da baleia ficar verde

Confira no PowerShell:

```powershell
docker --version
```

---

## Passo 2 — As chaves (já feito)

As chaves foram geradas em 30/07/2026 e **já estão no `.env.local`**. Não precisa
criar nem colar nada.

O que resta é uma linha só: no arquivo
`C:\Users\mario\deskcomm-teste\.env.local`, procure o bloco marcado **`[APP]`** e
**tire o `#`** das três últimas linhas:

```
# WAHA_API_BASE_URL=http://localhost:3030      ←  tirar o #
# WAHA_API_KEY=nexo_be97...                    ←  tirar o #
# WAHA_WEBHOOK_BASE_URL=http://host.docker...  ←  tirar o #
```

Estão comentadas de propósito: com elas ativas e sem WAHA no ar, a tela de
**Conexões** fica tentando falar com um serviço que não existe.

As outras três (as que o contêiner lê) já estão ativas — o app Next não as lê,
então não atrapalham nada enquanto isso.

### Por que a mesma chave aparece em dois formatos

O contêiner guarda o **resumo** (`SHA512`), nunca a chave original. O CRM envia a
chave; o WAHA calcula o resumo e compara. Quem invadir o contêiner não sai com
nada reutilizável.

### O detalhe que quebra em silêncio

`WAHA_HOOK_BASE_URL` diz ao WAHA para onde entregar as mensagens. O padrão do
`docker-compose.yml` é a porta **3003**; nosso CRM roda na **3000**. Sem essa
variável, mensagem chega no WAHA e **nunca aparece no CRM** — sem erro, sem aviso,
com o número aparecendo como conectado. Já está corrigida no `.env.local`.

---

## Passo 3 — Subir só o WAHA

O `docker-compose.yml` do projeto sobe vários serviços. Para o teste, só o WAHA
interessa — o CRM continua rodando com `pnpm dev`, fora do Docker:

```powershell
cd C:\Users\mario\deskcomm-teste
docker compose --env-file .env.local up -d waha
```

> ⚠️ **A parte `--env-file .env.local` não é opcional.** O Docker Compose lê um
> arquivo chamado `.env` por padrão, e esse arquivo **não existe** neste projeto.
> Sem a flag, as três variáveis do contêiner chegam vazias e o resultado é:
>
> - **WAHA sem chave de API** — qualquer coisa rodando na máquina controla o
>   WhatsApp conectado
> - **webhook na porta 3003** — o padrão do compose, que não é a nossa
>
> Nada disso dá erro na tela. Simplesmente não funciona, ou funciona inseguro.

Confira:

```powershell
docker compose ps
docker compose logs -f waha
```

---

## Passo 4 — Ler o QR Code

1. Abra **http://localhost:3030/dashboard/**
2. Autentique com a `WAHA_API_KEY` (a original, não o resumo)
3. Crie uma sessão e leia o QR Code com o WhatsApp do celular
   (Configurações → Aparelhos conectados → Conectar aparelho)

Depois, no CRM: **Conexões** → o número deve aparecer como `WORKING`.

---

## Passo 5 — Testar

Peça para alguém mandar mensagem no número conectado. Ela tem que aparecer no
**Inbox** do CRM em segundos.

Se não aparecer, é quase sempre o webhook: reveja o `WAHA_HOOK_BASE_URL` do
passo 2 e rode `docker compose logs waha` procurando por erro de conexão.

---

## Se der errado

| Sintoma | Causa provável |
|---|---|
| `docker: command not found` | Docker Desktop não instalado ou não iniciado |
| Container reinicia sozinho | Falta memória. Feche outros programas |
| QR não aparece | Veja `docker compose logs waha` — engine pode ter falhado ao subir |
| Sessão conecta mas nada chega no CRM | Webhook. É o `WAHA_HOOK_BASE_URL` na porta errada |
| `401` no painel do WAHA | Você usou o `SHA512` em vez da chave original |
| Número desconectou sozinho | O WhatsApp derruba sessão de aparelho inativo. Releia o QR |

---

## Desligar

```powershell
docker compose stop waha
```

Para apagar tudo, inclusive a sessão conectada:

```powershell
docker compose down -v
```

---

## Antes de fazer isso num cliente

- Ler [SEGURANCA.md](SEGURANCA.md) — os três pontos pendentes
- Decidir sobre o risco de banimento (o começo deste documento)
- Colocar num servidor: WhatsApp em máquina que desliga à noite não atende ninguém

Custo de licença não entra mais nessa lista — o WAHA é gratuito por inteiro.
