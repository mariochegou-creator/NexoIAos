#!/usr/bin/env bash
#
# Frappe CRM — deploy de produção da NEXO IA
#
# COMO USAR:
#   1. Aponte o DNS do subdomínio pro IP deste servidor (registro A)
#   2. Conecte via SSH:  ssh root@<IP-DO-VPS>
#   3. Envie este arquivo ou cole o conteúdo em ~/deploy-crm.sh
#   4. chmod +x deploy-crm.sh && ./deploy-crm.sh
#
# Roda em Ubuntu 22.04 / 24.04 LTS. Precisa de root.
#
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# CONFIGURAÇÃO — revise antes de rodar
# ─────────────────────────────────────────────────────────────
PROJECT="nexo_crm"                    # nome do projeto docker-compose
SITENAME="crm.nexoia.app"             # domínio do CRM (igual ao registro DNS)
EMAIL="contato@nexoia.com.br"         # e-mail do Let's Encrypt
VERSION="stable"                      # stable = branch main (v1.x)

# ─────────────────────────────────────────────────────────────

log()  { echo -e "\n\033[1;36m▶ $*\033[0m"; }
fail() { echo -e "\n\033[1;31m✗ $*\033[0m" >&2; exit 1; }
ok()   { echo -e "\033[1;32m✓ $*\033[0m"; }

[[ $EUID -eq 0 ]] || fail "Rode como root:  sudo ./deploy-crm.sh"

# ── Validação: o e-mail e o domínio foram trocados? ──────────
[[ "$EMAIL" == *"example.com"* ]] && fail "Troque a variável EMAIL por um e-mail real."

# ── Validação: DNS aponta pra este servidor? ─────────────────
log "Verificando DNS de $SITENAME"

command -v dig >/dev/null 2>&1 || apt-get install -y -qq dnsutils

SERVER_IP="$(curl -fsS --max-time 10 https://api.ipify.org || echo '')"
DNS_IP="$(dig +short "$SITENAME" A | tail -n1)"

[[ -n "$SERVER_IP" ]] || fail "Não consegui descobrir o IP público deste servidor."

if [[ -z "$DNS_IP" ]]; then
  fail "$SITENAME não resolve pra nenhum IP.
   Crie o registro A apontando pro IP $SERVER_IP e aguarde a propagação.
   O Let's Encrypt vai falhar se você seguir sem isso."
fi

if [[ "$DNS_IP" != "$SERVER_IP" ]]; then
  fail "$SITENAME aponta pra $DNS_IP, mas este servidor é $SERVER_IP.
   Corrija o registro A antes de continuar."
fi

ok "DNS confere: $SITENAME → $SERVER_IP"

# ── Validação: RAM suficiente? ───────────────────────────────
RAM_MB="$(free -m | awk '/^Mem:/{print $2}')"
if (( RAM_MB < 3500 )); then
  fail "Este servidor tem ${RAM_MB}MB de RAM. O Frappe CRM precisa de 4GB no mínimo.
   Faça upgrade do plano antes de continuar."
fi
ok "RAM: ${RAM_MB}MB"

# ── Validação: portas 80/443 livres? ─────────────────────────
if ss -tlnp 2>/dev/null | grep -qE ':(80|443)\s'; then
  fail "Já tem algo escutando na porta 80 ou 443 (nginx/apache?).
   Pare o serviço antes:  systemctl stop nginx apache2"
fi
ok "Portas 80 e 443 livres"

# ── Atualiza o sistema ───────────────────────────────────────
log "Atualizando pacotes do sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq python3 python3-pip wget curl
ok "Sistema atualizado"

# ── Baixa o instalador oficial ───────────────────────────────
log "Baixando easy-install.py"
cd /root
wget -q -O easy-install.py https://frappe.io/easy-install.py
ok "Instalador baixado"

# ── Deploy ───────────────────────────────────────────────────
log "Instalando Frappe CRM em $SITENAME — leva de 5 a 15 minutos"

python3 easy-install.py deploy \
  --project="$PROJECT" \
  --email="$EMAIL" \
  --image=ghcr.io/frappe/crm \
  --version="$VERSION" \
  --app=crm \
  --sitename "$SITENAME"

# ── Backup automático diário às 3h ───────────────────────────
log "Agendando backup diário"

CRON_LINE="0 3 * * * docker compose -p $PROJECT exec -T backend bench --site $SITENAME backup --with-files"
if ! crontab -l 2>/dev/null | grep -qF "bench --site $SITENAME backup"; then
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  ok "Backup diário agendado às 03:00"
else
  ok "Backup diário já estava agendado"
fi

# ── Resumo ───────────────────────────────────────────────────
cat <<EOF

╭─────────────────────────────────────────────────────────╮
│  Frappe CRM instalado                                   │
╰─────────────────────────────────────────────────────────╯

  URL       https://$SITENAME/crm
  Usuário   Administrator
  Senha     veja abaixo

  Credenciais completas:
    cat ~/${PROJECT}-passwords.txt

  ⚠  Copie a ADMIN_PASSWORD pro gerenciador de senhas AGORA.
     Esse arquivo se perde se o servidor for reconstruído.

  Comandos úteis:
    docker compose -p $PROJECT ps               # status
    docker compose -p $PROJECT logs -f backend  # logs
    docker compose -p $PROJECT restart          # reiniciar

  Se o HTTPS ainda não funcionar, aguarde 2 minutos —
  o Traefik está emitindo o certificado.

  Próximo passo: PRIMEIROS-PASSOS.md

EOF
