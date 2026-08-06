#!/usr/bin/env python3
"""
Utilitários compartilhados entre porte.py e varredura.py (Nexo IA).

Nada aqui faz rede nem escreve arquivo — só leitura de CSV, normalização
de campo e estatística. Os dois scripts do fluxo importam daqui pra não
duplicar o mapeamento de colunas.
"""

import csv
import math
import re
import unicodedata

# Aliases de colunas mais comuns (gosom, Kaptar e exports manuais).
# A busca é insensível a acento e caixa — ver achar_coluna().
ALIASES = {
    "nome": ["title", "name", "nome", "empresa", "business_name", "place_name"],
    "telefone": ["phone", "telefone", "phone_number", "tel", "celular", "whatsapp"],
    "site": ["website", "web_site", "site", "url", "link"],
    "nota": ["review_rating", "rating", "nota", "stars", "avaliacao", "media"],
    "reviews": ["review_count", "reviews", "reviews_count", "qtd_reviews",
                "user_ratings_total", "avaliacoes", "no avaliacoes", "n avaliacoes",
                "num avaliacoes", "qtd avaliacoes"],
    "categoria": ["category", "categoria", "categories", "type", "tipo"],
    "endereco": ["address", "endereco", "complete_address", "full_address"],
    "cidade": ["city", "cidade", "municipality"],
    "tem_site": ["tem site", "has_website", "tem_site"],
    "instagram": ["instagram", "instagram_url", "perfil_instagram"],
    "tem_instagram": ["tem instagram", "has_instagram", "tem_instagram"],
    # O link do Maps viaja até o CRM: é por ele que o SDR confere o negócio
    # quando o telefone falha (número fora do WhatsApp, Maps desatualizado).
    "google_maps": ["google maps", "google_maps", "gmaps", "maps", "link do maps",
                    "url do maps", "google maps url", "place_url", "maps_url"],
}


def normalizar_texto(texto):
    """Minúscula, sem acento, sem espaço nas pontas. 'Nº avaliações' -> 'no avaliacoes'."""
    t = unicodedata.normalize("NFKD", str(texto or ""))
    t = t.encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", t).strip().lower()


def slugify(texto):
    t = unicodedata.normalize("NFKD", texto or "").encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "lead"


def achar_coluna(fieldnames, chave, override=None):
    """Acha a coluna do CSV pra uma chave lógica. Insensível a acento e caixa."""
    if override:
        return override if override in fieldnames else None
    mapa = {normalizar_texto(f): f for f in (fieldnames or [])}
    for alias in ALIASES.get(chave, []):
        alvo = normalizar_texto(alias)
        if alvo in mapa:
            return mapa[alvo]
    return None


def mapear_colunas(fieldnames, overrides=None):
    """Retorna {chave_logica: nome_da_coluna_ou_None} pra todas as chaves de ALIASES."""
    overrides = overrides or {}
    return {k: achar_coluna(fieldnames, k, overrides.get(k)) for k in ALIASES}


def ler_csv(caminho, delimitador=None):
    """Lê o CSV detectando o delimitador. Retorna (linhas, campos, delimitador)."""
    with open(caminho, newline="", encoding="utf-8-sig") as f:
        amostra = f.read(4096)
        f.seek(0)
        if delimitador:
            delim = delimitador
        elif amostra:
            try:
                delim = csv.Sniffer().sniff(amostra, delimiters=",;\t").delimiter
            except csv.Error:
                delim = ";" if amostra.count(";") > amostra.count(",") else ","
        else:
            delim = ","
        reader = csv.DictReader(f, delimiter=delim)
        return list(reader), (reader.fieldnames or []), delim


def limpar_telefone(raw):
    """Retorna (digitos, tipo, link_wa). Tipo: celular | fixo | desconhecido."""
    if not raw:
        return None, "desconhecido", None
    dig = re.sub(r"\D", "", str(raw))
    if dig.startswith("55") and len(dig) >= 12:
        dig_local = dig[2:]
    else:
        dig_local = dig
    tipo = "desconhecido"
    if len(dig_local) == 11 and dig_local[2] == "9":
        tipo = "celular"
    elif len(dig_local) == 10:
        tipo = "fixo"
    completo = dig if dig.startswith("55") else ("55" + dig_local if len(dig_local) in (10, 11) else dig)
    link = f"https://wa.me/{completo}" if tipo == "celular" else None
    return dig_local or None, tipo, link


def normalizar_url(url):
    if not url:
        return None
    url = url.strip()
    if not url or normalizar_texto(url) in ("n/a", "na", "-", "null", "none"):
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def para_int(valor):
    """'12' / '12,0' / '' -> 12 / 12 / None."""
    try:
        return int(float(str(valor).replace(",", ".").strip()))
    except (TypeError, ValueError):
        return None


def para_float(valor):
    try:
        return float(str(valor).replace(",", ".").strip())
    except (TypeError, ValueError):
        return None


def percentil(valores, p):
    """Percentil com interpolação linear (mesmo método do numpy.percentile)."""
    if not valores:
        return 0.0
    v = sorted(valores)
    if len(v) == 1:
        return float(v[0])
    k = (len(v) - 1) * p / 100.0
    baixo, alto = math.floor(k), math.ceil(k)
    if baixo == alto:
        return float(v[int(k)])
    return v[baixo] + (v[alto] - v[baixo]) * (k - baixo)
