# Publicar o redesign em crm.nexoialocal.com.br

Runbook para levar o commit `63853ec` (redesign da interface) do GitHub para a
VPS, **passando por homologação antes da produção**.

- **Servidor:** `145.223.94.63`
- **Código:** branch `nexo-ia` de `github.com/mariochegou-creator/DeskcommCRM`
- **Stack:** `docker-compose.prod.yml` + Caddy (HTTPS automático)

> **Leia o PASSO 1 antes de qualquer outra coisa.** Os passos seguintes mudam
> conforme o que ele responder — em especial se a VPS **constrói** a imagem ou
> **puxa** a do autor original.

---

## PASSO 1 — Diagnóstico (não muda nada)

Entre na VPS:

```bash
ssh root@145.223.94.63
```

E rode o bloco inteiro de uma vez:

```bash
echo "=== containers no ar ==="
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

echo; echo "=== onde mora o compose ==="
find / -name "docker-compose.prod.yml" -not -path "*/node_modules/*" 2>/dev/null | head -5

echo; echo "=== é um clone do git? qual branch/commit? ==="
for d in /opt/deskcomm /root/deskcomm* /opt/*crm* /root/*crm*; do
  [ -d "$d/.git" ] && echo "--- $d" && git -C "$d" remote -v | head -2 && git -C "$d" log --oneline -1
done

echo; echo "=== qual imagem o .env manda usar ==="
for d in /opt/deskcomm /root/deskcomm* /opt/*crm* /root/*crm*; do
  [ -f "$d/.env" ] && echo "--- $d/.env" && grep -E "^(APP_IMAGE|APP_PULL_POLICY|DOMAIN)=" "$d/.env"
done

echo; echo "=== redes docker ==="
docker network ls | grep -v bridge_default

echo; echo "=== RAM e disco (o build precisa de ~4GB) ==="
free -h | head -2; df -h / | tail -1
```

**Me mande a saída desse bloco.** Com ela eu fecho os comandos exatos dos passos
3 a 7 — nome do diretório, nome da rede e nome do projeto compose saem daí.

### O que a saída vai decidir

| Se a coluna `IMAGE` do container `app` mostrar… | Significa |
|---|---|
| `ghcr.io/melgarafael/deskcommcrm:*` | A VPS roda a **imagem genérica do autor original**. Ela não tem nada do seu redesign — nem a identidade visual, nem o modo demonstração. É preciso **construir a sua imagem** (passo 4). |
| `deskcomm-app:*` ou algo com `mariochegou` | Já constrói localmente. O caminho fica bem mais curto. |

---

## PASSO 2 — Ponto de retorno (faça sempre)

Antes de trocar qualquer coisa, registre o que está no ar hoje:

```bash
cd <DIR-DO-COMPOSE>            # sai do passo 1

# Anote a imagem exata rodando agora — é o seu botão de desfazer.
docker inspect --format '{{.Config.Image}}' $(docker compose ps -q app) | tee ~/ROLLBACK-imagem.txt
docker images --no-trunc --format '{{.Repository}}:{{.Tag}} {{.ID}}' | grep -i deskcomm | tee -a ~/ROLLBACK-imagem.txt

cp .env ~/ROLLBACK-env-$(date +%F).bak
```

Isto **não** faz backup do banco — os dados estão no Supabase, não na VPS. O
redesign só troca interface e não roda migração nenhuma, então o banco não é
tocado. Ainda assim, se quiser um dump antes, é pelo painel do Supabase.

---

## PASSO 3 — Trazer o código novo

Se o passo 1 mostrou um clone do git:

```bash
cd <DIR-DO-COMPOSE>
git remote -v                                   # confira que aponta pro SEU fork
git fetch nexo nexo-ia || git fetch origin nexo-ia
git checkout nexo-ia
git pull
git log --oneline -1                            # tem que mostrar 63853ec
```

Se **não** houver clone (a VPS só tinha a imagem pronta):

```bash
cd /opt
git clone -b nexo-ia https://github.com/mariochegou-creator/DeskcommCRM.git deskcomm-nexo
cd deskcomm-nexo
cp <DIR-DO-COMPOSE>/.env .                      # reaproveita os segredos que já funcionam
```

---

## PASSO 4 — Construir a sua imagem

> Precisa de ~4 GB de RAM e leva de 15 a 25 minutos. Se o passo 1 mostrou menos
> que isso, crie swap antes:
> `fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

```bash
cd <DIR-DO-CODIGO>
APP_IMAGE=deskcomm-nexo:redesign \
  docker compose -f docker-compose.prod.yml -f docker-compose.build.yml build app
```

A imagem é **genérica**: os `NEXT_PUBLIC_*` viram placeholder no build e os
valores reais entram em runtime pelo `.env`. Não passe segredo em `--build-arg`.

Confirme que existe:

```bash
docker images | grep deskcomm-nexo
```

---

## PASSO 5 — Homologação num subdomínio

### 5a. DNS

No painel onde mora o domínio `nexoialocal.com.br`, crie:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| A | `homolog` | `145.223.94.63` | 300 |

Espere propagar (`nslookup homolog.nexoialocal.com.br` tem que devolver o IP).

### 5b. Subir o container de homologação

Um container **extra**, na mesma rede interna, sem mexer no `app` de produção:

```bash
cd <DIR-DO-CODIGO>
docker run -d --name app-homolog \
  --network <NOME-DA-REDE-INTERNA> \
  --env-file .env \
  -e NEXT_PUBLIC_APP_URL=https://homolog.nexoialocal.com.br \
  --restart unless-stopped \
  deskcomm-nexo:redesign
```

Ele aponta para o **mesmo Supabase** da produção. Isso é de propósito — é o que
te deixa ver o redesign com os seus dados reais. Mas significa que **o que você
editar na homologação altera a produção**. Navegue à vontade; edite com cuidado.

### 5c. Publicar o subdomínio no Caddy

Acrescente ao final do `Caddyfile` (no diretório do compose de produção):

```
homolog.nexoialocal.com.br {
	encode gzip
	reverse_proxy app-homolog:3000
}
```

E recarregue sem derrubar nada:

```bash
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 5d. Conferir

Abra **https://homolog.nexoialocal.com.br** e verifique:

- [ ] O rail lateral tem 72px, só ícones, com o item ativo num quadrado ciano
- [ ] `/app` abre no **Painel** novo, com o card de destaque ciano
- [ ] `/app/leads` mostra os 4 cards de funil e a tabela de linhas altas
- [ ] O pill de etapa abre o menu e troca a etapa
- [ ] Os labels `// pipeline` aparecem em mono ciano
- [ ] Janela abaixo de 768px: o menu vira barra inferior

---

## PASSO 6 — Promover para produção

Só depois de aprovar a homologação:

```bash
cd <DIR-DO-COMPOSE>

# Fixa a sua imagem e desliga o pull automático (senão o compose volta a
# baixar a do autor original por cima e desfaz tudo).
grep -q '^APP_IMAGE=' .env \
  && sed -i 's|^APP_IMAGE=.*|APP_IMAGE=deskcomm-nexo:redesign|' .env \
  || echo 'APP_IMAGE=deskcomm-nexo:redesign' >> .env

grep -q '^APP_PULL_POLICY=' .env \
  && sed -i 's|^APP_PULL_POLICY=.*|APP_PULL_POLICY=never|' .env \
  || echo 'APP_PULL_POLICY=never' >> .env

grep -E '^(APP_IMAGE|APP_PULL_POLICY)=' .env      # confira antes de aplicar

docker compose -f docker-compose.prod.yml --env-file .env up -d app
docker compose -f docker-compose.prod.yml logs -f app     # Ctrl+C quando estabilizar
```

O `APP_PULL_POLICY=never` é o detalhe que mais dá dor de cabeça: o padrão do
compose é `always`, e com ele o próximo `up -d` baixaria de novo
`ghcr.io/melgarafael/deskcommcrm:latest` e apagaria o redesign sem avisar.

Confira em **https://crm.nexoialocal.com.br**.

---

## PASSO 7 — Limpar a homologação

Quando não precisar mais:

```bash
docker rm -f app-homolog
# remova o bloco homolog.nexoialocal.com.br do Caddyfile
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Pode deixar o registro DNS — ele não custa nada e serve para a próxima vez.

---

## Rollback

Se algo quebrar em produção:

```bash
cd <DIR-DO-COMPOSE>
cat ~/ROLLBACK-imagem.txt                 # a imagem que rodava antes

sed -i 's|^APP_IMAGE=.*|APP_IMAGE=<IMAGEM-ANTIGA>|' .env
docker compose -f docker-compose.prod.yml --env-file .env up -d app
```

Volta em segundos: a imagem antiga continua no disco (não rode `docker image
prune` até estar seguro do redesign).

---

## Depois: fazer isso virar automático

Hoje o `.github/workflows/publish-image.yml` só constrói imagem em push para
`main` ou tag `v*` — o branch `nexo-ia` não dispara nada, e por isso este
runbook é manual.

Quando o redesign estiver estável, dá para trocar o build de 20 minutos na VPS
por um `docker compose pull` de 30 segundos: o GitHub Actions constrói a imagem
e publica em `ghcr.io/mariochegou-creator/deskcommcrm`. É meia hora de ajuste no
workflow — peça quando quiser.
