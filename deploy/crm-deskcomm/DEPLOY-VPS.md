# Subir o CRM na VPS

Plano completo para colocar o CRM no ar em `crm.nexoia.app`, com HTTPS e
WhatsApp funcionando 24 horas.

**Situação:** a VPS ainda não foi contratada. Este documento diz o que comprar,
por quê, e deixa o passo a passo pronto para quando existir.

---

## A decisão que vem antes de tudo

O instalador do projeto puxa uma **imagem pronta** do autor
(`ghcr.io/melgarafael/deskcommcrm:latest`). Ela não contém nada do que
construímos:

| O que perderíamos | Onde está |
|---|---|
| Identidade visual da NEXO IA | `app/globals.css`, `tokens.ts` |
| Modo demonstração | `app/app/demo-nexo/`, `lib/nexo-demo/` |
| Guarda `server-only` no client admin | `lib/supabase/admin.ts` |
| Rolagem do menu lateral | `components/shell/Sidebar.tsx` |

São **21 arquivos, 1.845 linhas**, hoje só no branch `nexo-ia` do seu disco.

Então o caminho é: **fork no GitHub + construir a imagem na VPS**. Sai um pouco
mais caro em RAM e leva 20 minutos a mais na primeira vez. É o preço de o
sistema ser seu.

---

## 1. Qual VPS comprar

### Especificação

| Recurso | Mínimo | Recomendado |
|---|---|---|
| RAM | **4 GB** | 8 GB |
| vCPU | 2 | 4 |
| Disco | 60 GB SSD | 80 GB SSD |
| Sistema | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |

Os 4 GB não são pelo uso normal — a stack roda com ~2 GB. São pela
**construção da imagem**, que precisa de 4 GB e leva de 15 a 25 minutos. Com
menos que isso, o build morre no meio.

### Onde contratar

| Provedor | Local | Preço aprox. | Observação |
|---|---|---|---|
| **Vultr** 4 GB | **São Paulo** | ~US$ 24 | Melhor latência para WhatsApp |
| **Hostinger** VPS | Brasil | ~R$ 60 | Painel em português, suporte BR |
| **Magalu Cloud** | Brasil | varia | Nota fiscal nacional |
| Hetzner CPX21 | Alemanha | ~€ 8 | Mais barato, ~200 ms do Brasil |

**Recomendo datacenter no Brasil** — e isso mudou em relação ao que eu disse
antes, quando o WhatsApp ainda não estava no páreo.

O runbook do próprio projeto explica: *"Latência <30ms pro Meta SP — relevante
pra anti-banimento e UX de QR"*. Servidor brasileiro conversando com servidor
brasileiro da Meta parece tráfego normal. Servidor alemão com número de celular
brasileiro é exatamente o padrão que sistemas antifraude marcam.

Com WhatsApp em jogo, economizar R$ 70/mês não compensa arriscar o número.

### Ao criar

- Sistema: **Ubuntu 24.04 LTS**
- Autenticação: **chave SSH** (não senha)
- Anote o **IP público**

---

## 2. Publicar o nosso código no GitHub

A VPS precisa baixar o código de algum lugar. Hoje ele está só no seu disco.

No PowerShell, na pasta do CRM:

```powershell
cd C:\Users\mario\deskcomm-teste
gh auth login
```

Escolha: **GitHub.com** → **HTTPS** → **autenticar pelo navegador**.

Depois, um comando só cria o fork e envia o nosso branch:

```powershell
gh repo fork melgarafael/DeskcommCRM --remote-name nexo --clone=false
git push nexo nexo-ia
```

Resultado: `https://github.com/mariochegou-creator/DeskcommCRM`, branch `nexo-ia`.

> **Fork público ou privado?** O fork nasce público, como o original (MIT
> permite). Nenhum segredo vai junto — o `.env.local` é ignorado pelo git,
> e eu confiro antes de enviar. Se preferir privado, dá para converter depois
> em *Settings → Change visibility*.

---

## 3. Apontar o domínio

No painel do `nexoia.app`, crie:

```
Tipo:  A
Nome:  crm
Valor: <IP-DA-VPS>
TTL:   3600
```

Confirme antes de seguir — no PowerShell:

```powershell
nslookup crm.nexoia.app
```

Tem que devolver o IP da VPS.

> **Não pule.** O certificado HTTPS é emitido durante a instalação e valida o
> domínio. Se o DNS ainda não propagou, a emissão falha e o site fica
> inacessível por HTTPS. A propagação leva de 5 minutos a 2 horas.

---

## 4. Instalar

Conecte:

```powershell
ssh root@<IP-DA-VPS>
```

Prepare a máquina:

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y git
```

Baixe o nosso fork e rode o instalador **apontando para ele**:

```bash
git clone -b nexo-ia https://github.com/mariochegou-creator/DeskcommCRM.git
cd DeskcommCRM

REPO_URL=https://github.com/mariochegou-creator/DeskcommCRM.git \
APP_IMAGE=deskcomm-nexo:local \
bash hostgator-setup-kit/install.sh
```

> As duas variáveis são o que faz a diferença. Sem elas, o instalador clona o
> repositório do autor e baixa a imagem dele — e todo o nosso trabalho fica de
> fora, sem nenhum aviso.

O instalador vai perguntar o que falta. Respostas:

| Pergunta | Resposta |
|---|---|
| Domínio | `crm.nexoia.app` |
| E-mail do SSL | o seu, real (recebe aviso de expiração) |
| Supabase URL | `https://pdtbrtccausjlrzzsiqe.supabase.co` |
| Chave pública | a `sb_publishable_...` do `.env.local` |
| Chave secreta | a `sb_secret_...` do `.env.local` |
| Imagem do app | `deskcomm-nexo:local` |

Depois construa a imagem com o nosso código:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.build.yml build
docker compose -f docker-compose.prod.yml up -d
```

**A construção leva de 15 a 25 minutos.** É uma vez só; nas atualizações
seguintes o Docker reaproveita o que não mudou.

---

## 5. Antes de considerar pronto

### Desligar a telemetria

O sistema manda relatório de erro para o Sentry do autor do projeto por padrão.
Em teste com dado falso, tudo bem. Em produção com conversa de cliente, não —
e sob LGPD quem responde é quem opera.

No `.env` da VPS:

```
SENTRY_DSN=off
```

### Reconectar o WhatsApp

O número conectado na sua máquina **não vem junto**. A sessão vive no volume do
Docker local. Na VPS é escanear o QR de novo, agora em
`https://crm.nexoia.app` → **Conexões**.

Bom: a partir daí ele fica no ar 24 horas, sem depender do seu computador
ligado.

### Trocar a senha do banco

A senha do Supabase apareceu em conversa durante a configuração. Gere outra em
*Settings → Database → Reset password* e atualize o `.env` da VPS.

### Backup

O Supabase gratuito guarda backup de 7 dias. Se o CRM virar operação de
verdade, isso é pouco — vale subir para o plano pago ou agendar export próprio.

---

## O que vai custar por mês

| Item | Valor |
|---|---|
| VPS (Vultr São Paulo 4 GB) | ~R$ 130 |
| Domínio | já temos |
| SSL | R$ 0 |
| WAHA | R$ 0 |
| Supabase | R$ 0 no gratuito |
| **Total** | **~R$ 130** |

Uma VPS atende **vários clientes** — o sistema é multi-empresa, com os dados
isolados no banco. O custo não multiplica por cliente.

---

## Riscos que continuam de pé

| Risco | Situação |
|---|---|
| WhatsApp não-oficial | O número pode ser banido. Datacenter no Brasil reduz, não elimina |
| Sistema com 3 meses | Você assume o suporte. Não há SLA de ninguém |
| Rotas com chave-mestra | Não auditei uma a uma — ver [SEGURANCA.md](SEGURANCA.md) |
| Supabase gratuito | Pausa por inatividade e tem limite de banda |

Nenhum é impeditivo para uso interno da NEXO IA. Para cliente pagante, o
primeiro e o terceiro pedem decisão consciente antes.

---

## Ordem de execução

1. Contratar a VPS (Brasil, 4 GB, Ubuntu 24.04)
2. `gh auth login` + fork + push — **eu faço, precisa só do seu login**
3. Criar o registro DNS
4. Me passar o IP → eu conduzo a instalação
5. Reconectar o WhatsApp e testar ponta a ponta
