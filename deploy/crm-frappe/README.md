# Frappe CRM — Deploy de produção

CRM open source da NEXO IA. Roda em servidor próprio, separado do dashboard.

> **Leia primeiro:** o Frappe CRM **não** roda junto com o dashboard atual.
> São duas pilhas distintas — veja [ARQUITETURA.md](ARQUITETURA.md).
> Este guia sobe o CRM como sistema independente em `crm.nexoia.app`.

---

## Antes de começar

Você precisa de três coisas. Sem as três, o deploy falha na metade.

| # | Item | Como conseguir |
|---|---|---|
| 1 | VPS Linux | Ver [Escolhendo o servidor](#1-escolhendo-o-servidor) |
| 2 | Domínio com acesso ao DNS | Já temos `nexoia.app` |
| 3 | E-mail válido | Usado pelo Let's Encrypt pra emitir o SSL |

---

## 1. Escolhendo o servidor

### Specs mínimas

| Recurso | Mínimo | Recomendado |
|---|---|---|
| RAM | 4 GB | 8 GB |
| vCPU | 2 | 4 |
| Disco | 40 GB SSD | 80 GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

Abaixo de 4 GB o MariaDB + Redis + Python não cabem e o container reinicia sozinho.

### Onde contratar

| Provedor | Preço/mês | Local | Observação |
|---|---|---|---|
| **Hetzner** CPX21 | ~€8 (~R$ 50) | Alemanha / EUA | Melhor custo. Latência ~200ms do Brasil — aceitável pra CRM |
| **Vultr** 4GB | ~US$ 24 (~R$ 130) | **São Paulo** | Melhor latência. Escolha se a equipe reclamar de lentidão |
| **Contabo** VPS S | ~€7 (~R$ 45) | Alemanha / EUA | Mais barato, suporte mais lento |
| **DigitalOcean** 4GB | ~US$ 24 (~R$ 130) | EUA | Documentação excelente, painel simples |

**Recomendação:** comece na Hetzner CPX21. Se a equipe sentir lentidão, migre pra Vultr São Paulo — o Frappe tem backup/restore nativo, a migração é tranquila.

### Ao criar o servidor

- Sistema: **Ubuntu 24.04 LTS**
- Adicione sua **chave SSH** (não use senha)
- Anote o **IP público** — você vai precisar dele no passo 2

---

## 2. Apontando o DNS

No painel do domínio `nexoia.app`, crie um registro:

```
Tipo:  A
Nome:  crm
Valor: <IP-DO-SEU-VPS>
TTL:   3600
```

Resultado: `crm.nexoia.app` → seu servidor.

### Confirme antes de seguir

Rode no seu PC (PowerShell) e espere aparecer o IP do VPS:

```powershell
nslookup crm.nexoia.app
```

> **Não pule esta etapa.** O Let's Encrypt valida o domínio durante a
> instalação. Se o DNS ainda não propagou, o SSL falha e o site fica
> inacessível por HTTPS. A propagação leva de 5 minutos a 2 horas.

---

## 3. Conectando no servidor

No PowerShell, com o IP do VPS:

```powershell
ssh root@<IP-DO-SEU-VPS>
```

Aceite a fingerprint na primeira conexão (`yes`).

---

## 4. Rodando o deploy

Já dentro do servidor, cole o conteúdo de [`deploy-crm.sh`](deploy-crm.sh) ou rode direto:

```bash
# Atualiza o sistema
apt update && apt upgrade -y

# Baixa o instalador oficial do Frappe
wget https://frappe.io/easy-install.py

# Executa o deploy
python3 easy-install.py deploy \
    --project=nexo_crm \
    --email=contato@nexoia.com.br \
    --image=ghcr.io/frappe/crm \
    --version=stable \
    --app=crm \
    --sitename crm.nexoia.app
```

**Troque antes de rodar:**
- `contato@nexoia.com.br` → e-mail real (recebe avisos de expiração do SSL)
- `crm.nexoia.app` → o subdomínio que você apontou no passo 2

O script instala Docker, sobe MariaDB, Redis, o backend Python, o frontend Vue e configura o Traefik com SSL automático. **Leva de 5 a 15 minutos.**

---

## 5. Guardando a senha do admin

Ao terminar, o script grava as credenciais em:

```bash
cat ~/nexo_crm-passwords.txt
```

Copie o valor de `ADMIN_PASSWORD` **agora** e guarde no gerenciador de senhas da NEXO IA. Esse arquivo pode ser perdido num rebuild do servidor.

---

## 6. Primeiro acesso

Abra: **https://crm.nexoia.app/crm**

```
Usuário: Administrator
Senha:   <ADMIN_PASSWORD do passo 5>
```

Se der erro de certificado, aguarde 2 minutos — o Traefik ainda está emitindo o SSL.

Depois do login, siga o [PRIMEIROS-PASSOS.md](PRIMEIROS-PASSOS.md) pra configurar o funil da NEXO IA e criar os usuários.

---

## Operação do dia a dia

Todos os comandos rodam via SSH no servidor.

### Ver status dos containers

```bash
docker compose -p nexo_crm ps
```

### Ver logs (diagnóstico)

```bash
docker compose -p nexo_crm logs -f backend
```

`Ctrl+C` pra sair.

### Reiniciar

```bash
docker compose -p nexo_crm restart
```

### Atualizar o CRM

```bash
cd ~
python3 easy-install.py update --project nexo_crm
```

Faça backup antes (abaixo).

---

## Backup

### Backup manual

```bash
docker compose -p nexo_crm exec backend bench --site crm.nexoia.app backup --with-files
```

Os arquivos ficam em `sites/crm.nexoia.app/private/backups/` dentro do container.

### Backup automático diário

Rode uma vez no servidor pra agendar às 3h da manhã:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * docker compose -p nexo_crm exec -T backend bench --site crm.nexoia.app backup --with-files") | crontab -
```

> **Backup no servidor não é backup.** Se o VPS morrer, o backup morre junto.
> Configure envio pra um bucket externo (S3/Backblaze) em
> *Settings → System Settings → Backups* dentro do CRM.

---

## Custo mensal estimado

| Item | Valor |
|---|---|
| VPS Hetzner CPX21 | ~R$ 50 |
| Domínio (já temos) | R$ 0 |
| SSL Let's Encrypt | R$ 0 |
| **Total** | **~R$ 50/mês** |

Usuários ilimitados — o Frappe CRM não cobra por assento.

---

## Quando algo dá errado

| Sintoma | Causa provável | Solução |
|---|---|---|
| SSL não emite / "conexão não segura" | DNS não propagou antes do deploy | Confirme `nslookup`, depois `docker compose -p nexo_crm restart` |
| Site não abre, containers reiniciando | RAM insuficiente | `free -h` — se estiver no limite, faça upgrade pra 8 GB |
| "Site does not exist" | Sitename diferente do domínio | O `--sitename` tem que ser **idêntico** ao registro DNS |
| Esqueci a senha do admin | — | `docker compose -p nexo_crm exec backend bench --site crm.nexoia.app set-admin-password NOVASENHA` |
| Porta 80/443 bloqueada | Firewall do provedor | Libere 80 e 443 no painel do VPS |

---

## Próximos documentos

- [ARQUITETURA.md](ARQUITETURA.md) — por que o CRM roda separado e como os dois sistemas convivem
- [PRIMEIROS-PASSOS.md](PRIMEIROS-PASSOS.md) — configuração do funil, usuários e integrações
- [INTEGRACAO-NEXOIAOS.md](INTEGRACAO-NEXOIAOS.md) — plano de conexão com o dashboard e o Supabase
