#!/usr/bin/env python3
"""
Varredura de leads do Google Maps (Nexo IA).

Lê um CSV (gosom ou similar), checa a presença digital de cada lead
e gera um JSON enriquecido pronto pro diagnóstico do Claude.

Uso:
    python varredura.py leads.csv -o leads_enriquecidos.json
    python varredura.py leads.csv --col-nome empresa --col-site url
"""

import argparse
import json
import os
import re
import sys
import time
from urllib.parse import quote_plus

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# O console do Windows abre em cp1252 e engasga com acento.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except (AttributeError, OSError):
    pass

from comum import (  # noqa: E402
    ALIASES, ler_csv, mapear_colunas, limpar_telefone, normalizar_url,
    para_float, para_int, slugify,
)

try:
    import requests
except ImportError:
    sys.exit("Faltam dependências. Rode: pip install requests --break-system-packages")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
}
TIMEOUT = 12

# Plataformas que indicam presença "improvisada"
PLATAFORMAS_GENERICAS = {
    "wix.com": "Wix",
    "wixsite.com": "Wix",
    "linktr.ee": "Linktree",
    "linktree": "Linktree",
    "canva.site": "Canva",
    "my.canva.site": "Canva",
    "instagram.com": "Só Instagram",
    "facebook.com": "Só Facebook",
    "negocio.site": "Google Sites",
    "sites.google.com": "Google Sites",
    "wordpress.com": "WordPress.com gratuito",
    "blogspot": "Blogspot",
}

# ALIASES, slugify, achar_coluna, limpar_telefone e normalizar_url vivem em
# comum.py — o porte.py usa os mesmos. Não duplicar aqui.


def detectar_plataforma(url_final, html):
    alvo = (url_final or "").lower()
    for chave, nome in PLATAFORMAS_GENERICAS.items():
        if chave in alvo:
            return nome
    baixo = (html or "").lower()
    if "wix.com" in baixo and "wix-code" in baixo or "static.wixstatic" in baixo:
        return "Wix"
    if "cdn.shopify" in baixo:
        return None  # Shopify é loja de verdade, não conta como genérico
    return None


def extrair_instagram(html, base_url):
    for m in re.finditer(r'https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?', html or ""):
        user = m.group(1).lower()
        if user in ("p", "reel", "explore", "accounts", "stories", "sharer"):
            continue
        return f"https://www.instagram.com/{m.group(1)}"
    return None


def checar_site(url):
    res = {
        "url": url,
        "online": False,
        "https_ok": None,
        "mobile_friendly": None,
        "tem_whatsapp": None,
        "plataforma_generica": None,
        "tempo_resposta_s": None,
        "instagram_no_site": None,
        "erro": None,
    }
    if not url:
        return res
    try:
        t0 = time.time()
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        res["tempo_resposta_s"] = round(time.time() - t0, 2)
        res["online"] = r.status_code < 400
        res["https_ok"] = r.url.startswith("https://")
        html = r.text[:500_000]
        baixo = html.lower()
        res["mobile_friendly"] = 'name="viewport"' in baixo or "name='viewport'" in baixo
        res["tem_whatsapp"] = bool(re.search(r"wa\.me/|api\.whatsapp\.com|whatsapp://", baixo))
        res["plataforma_generica"] = detectar_plataforma(r.url, html)
        res["instagram_no_site"] = extrair_instagram(html, r.url)
    except requests.exceptions.SSLError:
        res["erro"] = "erro de SSL (certificado)"
        # tenta http
        try:
            r = requests.get(url.replace("https://", "http://", 1), headers=HEADERS, timeout=TIMEOUT)
            res["online"] = r.status_code < 400
            res["https_ok"] = False
        except Exception:
            pass
    except requests.exceptions.RequestException as e:
        res["erro"] = type(e).__name__
    return res


def calcular_score(lead):
    """0-100. Buracos na presença digital + sinais de negócio vivo = oportunidade."""
    s = 0
    site = lead["site_check"]
    # Buracos (o que a Nexo resolve)
    if not site["url"] or not site["online"]:
        s += 30
    else:
        if site["plataforma_generica"]:
            s += 20
        if site["tem_whatsapp"] is False:
            s += 10
        if site["mobile_friendly"] is False:
            s += 10
        if site["https_ok"] is False:
            s += 5
    if lead["telefone_tipo"] == "fixo":
        s += 10
    # Negócio vivo (vale a pena prospectar)
    nota = lead.get("nota")
    reviews = lead.get("reviews") or 0
    if reviews >= 50:
        s += 15
    elif reviews >= 15:
        s += 10
    elif reviews >= 5:
        s += 5
    if nota is not None:
        if nota >= 4.5:
            s += 10
        elif nota >= 4.0:
            s += 5
        elif nota < 4.0 and reviews >= 10:
            s += 10  # nota baixa com volume = dor de atendimento, ótimo gancho
    return min(s, 100)


def main():
    ap = argparse.ArgumentParser(description="Varredura de leads do Google Maps (Nexo IA)")
    ap.add_argument("csv", help="CSV de entrada (gosom ou similar)")
    ap.add_argument("-o", "--out", default="leads_enriquecidos.json")
    ap.add_argument("--delimitador", default=None, help="Força o delimitador do CSV (padrão: detecta)")
    for chave in ALIASES:
        ap.add_argument(f"--col-{chave}", default=None, help=f"Nome da coluna de {chave}")
    args = ap.parse_args()

    linhas, campos, _ = ler_csv(args.csv, args.delimitador)
    cols = mapear_colunas(campos, {k: getattr(args, f"col_{k}") for k in ALIASES})

    if not cols["nome"]:
        print("Não achei a coluna de nome. Colunas disponíveis no CSV:")
        for c in campos:
            print(f"  - {c}")
        sys.exit("Use --col-nome <coluna> (e os outros --col-* se precisar).")

    print(f"Colunas mapeadas: { {k: v for k, v in cols.items() if v} }")
    print(f"{len(linhas)} leads. Iniciando varredura...\n")

    leads = []
    for i, row in enumerate(linhas, 1):
        nome = (row.get(cols["nome"]) or "").strip()
        if not nome:
            continue
        cidade = (row.get(cols["cidade"]) or "").strip() if cols["cidade"] else ""
        endereco = (row.get(cols["endereco"]) or "").strip() if cols["endereco"] else ""
        tel_raw = row.get(cols["telefone"]) if cols["telefone"] else None
        tel, tel_tipo, wa = limpar_telefone(tel_raw)

        nota = para_float(row.get(cols["nota"])) if cols["nota"] else None
        reviews = para_int(row.get(cols["reviews"])) if cols["reviews"] else None

        url = normalizar_url(row.get(cols["site"]) if cols["site"] else None)
        print(f"[{i}/{len(linhas)}] {nome} ... ", end="", flush=True)
        site_check = checar_site(url)
        print("ok" if site_check["online"] else ("sem site" if not url else f"offline ({site_check['erro'] or 'sem resposta'})"))

        cidade_busca = cidade or endereco.split(",")[-2].strip() if endereco.count(",") >= 1 else cidade
        insta = site_check["instagram_no_site"]
        insta_busca = f"https://www.google.com/search?q={quote_plus(f'\"{nome}\" {cidade_busca} instagram'.strip())}"

        lead = {
            "nome": nome,
            "slug": slugify(nome),
            "categoria": (row.get(cols["categoria"]) or "").strip() if cols["categoria"] else "",
            "endereco": endereco,
            "cidade": cidade_busca,
            "telefone": tel,
            "telefone_tipo": tel_tipo,
            "link_whatsapp": wa,
            "nota": nota,
            "reviews": reviews,
            "site_check": site_check,
            "instagram_link": insta,                # direto, se achou no site
            "instagram_busca_manual": insta_busca,  # fallback pra abrir na mão
            "instagram_ultimo_post": None,          # preencher manualmente (etapa 2)
            "instagram_seguidores": None,           # preencher manualmente (etapa 2)
            # Segue até o CSV do CRM — é o caminho de volta pro anúncio original.
            "google_maps": (row.get(cols["google_maps"]) or "").strip() if cols.get("google_maps") else "",
        }
        lead["score_oportunidade"] = calcular_score(lead)
        leads.append(lead)
        time.sleep(0.5)  # educação com os servidores

    leads.sort(key=lambda x: x["score_oportunidade"], reverse=True)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"Varredura completa: {len(leads)} leads -> {args.out}")
    print(f"{'Score':>5}  {'Nome':<35} Site / Sinais")
    for l in leads[:20]:
        sc = l["site_check"]
        sinais = []
        if not sc["url"]:
            sinais.append("SEM SITE")
        elif not sc["online"]:
            sinais.append("SITE OFF")
        else:
            if sc["plataforma_generica"]:
                sinais.append(sc["plataforma_generica"])
            if sc["tem_whatsapp"] is False:
                sinais.append("sem botão whats")
        if l["telefone_tipo"] == "fixo":
            sinais.append("só fixo")
        if l["nota"] and l["nota"] < 4.0:
            sinais.append(f"nota {l['nota']}")
        print(f"{l['score_oportunidade']:>5}  {l['nome'][:35]:<35} {', '.join(sinais) or 'presença ok'}")


if __name__ == "__main__":
    main()
