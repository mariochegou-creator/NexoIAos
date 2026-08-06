#!/usr/bin/env python3
"""
Renderização com trava — Etapa 4 da prospecção (Nexo IA).

Junta a varredura automática (leads_enriquecidos.json) com o diagnóstico
escrito pelo Claude (diagnostico.json) e só então gera os arquivos.

A trava existe porque o erro clássico desta skill é acelerar: varrer 40
leads, olhar os 5 primeiros com atenção e completar o resto no automático.
Aqui isso não passa — o script recusa a renderização se algum lead ficou
sem decisão, sem dor, com gancho genérico, com gancho que fala de preço,
ou com gancho apoiado num sinal que não existe nos dados daquele lead.

Uso:
    python render_saida.py leads_enriquecidos.json diagnostico.json -o saida/
    python render_saida.py leads_enriquecidos.json diagnostico.json --so-validar
"""

import argparse
import csv
import datetime as dt
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# O console do Windows abre em cp1252 e engasga com acento e emoji.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except (AttributeError, OSError):
    pass

DECISOES = {"prospectar", "reter", "descartar"}

ENTREGAVEIS_VALIDOS = {
    "Site profissional",
    "Agente WhatsApp com IA",
    "Dashboard",
    "Social media / rebranding",
    "Pacote completo",
}

# Primeiro contato não fala de dinheiro. Nenhuma dessas palavras passa no gancho.
PALAVRAS_PROIBIDAS = [
    "preço", "preco", "valor", "valores", "proposta", "pacote", "orçamento",
    "orcamento", "plano", "planos", "desconto", "investimento", "mensalidade",
    "contrato", "reais", "promoção", "promocao", "grátis", "gratis", "gratuito",
]
# Casadas sem fronteira de palavra (o \b não funciona com '$').
PROIBIDAS_LITERAIS = ["r$"]

# Sinais que o gancho pode declarar em `gancho_sinal`, e o teste que prova
# que aquele sinal existe MESMO nos dados daquele lead.
SINAIS = {
    "sem_site":
        lambda l: not l["site_check"].get("url"),
    "site_off":
        lambda l: bool(l["site_check"].get("url")) and not l["site_check"].get("online"),
    "plataforma_generica":
        lambda l: bool(l["site_check"].get("plataforma_generica")),
    "sem_botao_whatsapp":
        lambda l: l["site_check"].get("online") and l["site_check"].get("tem_whatsapp") is False,
    "site_lento":
        lambda l: (l["site_check"].get("tempo_resposta_s") or 0) >= 3,
    "nao_mobile":
        lambda l: l["site_check"].get("mobile_friendly") is False,
    "sem_https":
        lambda l: l["site_check"].get("https_ok") is False,
    "so_telefone_fixo":
        lambda l: l.get("telefone_tipo") == "fixo",
    "nota_baixa":
        lambda l: l.get("nota") is not None and l["nota"] < 4.0 and (l.get("reviews") or 0) >= 10,
    "nota_alta":
        lambda l: l.get("nota") is not None and l["nota"] >= 4.5 and (l.get("reviews") or 0) >= 5,
    "muitos_reviews":
        lambda l: (l.get("reviews") or 0) >= 50,
    "sem_avaliacoes":
        lambda l: not (l.get("reviews") or 0),
    "sem_instagram":
        lambda l: not l.get("instagram_link"),
    "instagram_parado":
        lambda l: bool(re.search(r"\b(m[êe]s|meses|ano|anos)\b",
                                 str(l.get("instagram_ultimo_post") or ""), re.I)),
}

# Palavras que aparecem em qualquer mensagem de WhatsApp em português. Se
# entrassem na conta de sobreposição, dois ganchos totalmente diferentes
# pareceriam iguais e a trava viraria ruído.
STOPWORDS = {
    "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "pra", "para", "com", "sem", "que", "quem",
    "e", "ou", "mas", "se", "ja", "nao", "sim", "aqui", "ali", "la", "ai", "voce", "vc",
    "eu", "meu", "minha", "seu", "sua", "ele", "ela", "isso", "esse", "essa", "este",
    "esta", "isto", "aquele", "ao", "aos", "as", "num", "numa", "tem", "ter", "tá",
    "ta", "e", "é", "foi", "ser", "sao", "esta", "estao", "vi", "oi", "ola", "olá",
    "mais", "menos", "muito", "so", "só", "quando", "como", "onde", "qual", "quais",
    "ate", "até", "entao", "então", "agora", "hoje", "cara", "gente", "boa", "bom",
    "achei", "vc", "voces", "tudo", "coisa", "fazer", "faz", "ver", "vai", "vou",
}


# ---------------------------------------------------------------------------
# utilidades
# ---------------------------------------------------------------------------

def normalizar(texto):
    t = unicodedata.normalize("NFKD", str(texto or "").lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return t


def tokens(texto):
    """Palavras relevantes de um gancho, pra medir sobreposição entre leads."""
    brutos = re.findall(r"[a-z0-9]+", normalizar(texto))
    return {p for p in brutos if p not in STOPWORDS and len(p) > 2}


def sobreposicao(a, b):
    """Jaccard entre os conjuntos de palavras relevantes. 0.0 = nada em comum."""
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def sinais_do_lead(lead):
    return [nome for nome, teste in SINAIS.items() if _seguro(teste, lead)]


def _seguro(teste, lead):
    try:
        return bool(teste(lead))
    except (KeyError, TypeError):
        return False


def sinal_principal(lead):
    """O sinal mais vendável do lead, pro ranking da fila."""
    ordem = [
        ("sem_site", "sem site"),
        ("site_off", "site fora do ar"),
        ("plataforma_generica", None),        # usa o nome da plataforma
        ("nota_baixa", None),                 # usa a nota
        ("sem_botao_whatsapp", "site sem botão de WhatsApp"),
        ("nao_mobile", "site não abre bem no celular"),
        ("site_lento", "site lento"),
        ("so_telefone_fixo", "só telefone fixo"),
        ("sem_https", "site sem HTTPS"),
        ("instagram_parado", "Instagram parado"),
        ("sem_instagram", "sem Instagram"),
    ]
    presentes = set(sinais_do_lead(lead))
    for chave, rotulo in ordem:
        if chave in presentes:
            if chave == "plataforma_generica":
                return f"site em {lead['site_check']['plataforma_generica']}"
            if chave == "nota_baixa":
                return f"nota {lead['nota']} com {lead['reviews']} avaliações"
            return rotulo
    return "presença ok — entrar pelo volume"


def marca(valor):
    if valor is True:
        return "✅"
    if valor is False:
        return "❌"
    return "—"


# ---------------------------------------------------------------------------
# a trava
# ---------------------------------------------------------------------------

def validar(leads, diag):
    """Retorna (erros, avisos). Erro bloqueia a renderização; aviso não."""
    erros, avisos = [], []

    por_slug = {l["slug"]: l for l in leads}
    diag_slugs = [d.get("slug", "") for d in diag]

    repetidos = {s for s in diag_slugs if diag_slugs.count(s) > 1}
    for s in sorted(repetidos):
        erros.append(f"slug repetido no diagnóstico: '{s}'")

    orfaos = [s for s in diag_slugs if s and s not in por_slug]
    for s in orfaos:
        erros.append(f"diagnóstico do slug '{s}' não existe na varredura")

    faltando = [l["slug"] for l in leads if l["slug"] not in set(diag_slugs)]
    for s in faltando[:40]:
        erros.append(f"lead sem decisão no diagnóstico: '{s}' ({por_slug[s]['nome']})")
    if len(faltando) > 40:
        erros.append(f"... e mais {len(faltando)-40} leads sem decisão")

    ganchos = {}   # slug -> gancho, só dos prospectar

    for d in diag:
        slug = d.get("slug", "")
        lead = por_slug.get(slug)
        if not lead:
            continue
        nome = lead["nome"]
        decisao = (d.get("decisao") or "").strip().lower()

        if decisao not in DECISOES:
            erros.append(f"{nome}: decisão '{d.get('decisao')}' inválida "
                         f"(use prospectar, reter ou descartar)")
            continue

        if decisao in ("reter", "descartar") and not (d.get("motivo") or "").strip():
            erros.append(f"{nome}: decisão '{decisao}' exige o campo 'motivo'")
            continue

        if decisao != "prospectar":
            continue

        # --- daqui pra baixo, só quem vai virar contato ---
        dores = d.get("dores") or []
        if len(dores) < 2:
            erros.append(f"{nome}: só {len(dores)} dor(es) — o mínimo é 2")
        for i, dor in enumerate(dores, 1):
            for campo in ("dor", "evidencia", "consequencia"):
                if not (dor.get(campo) or "").strip():
                    erros.append(f"{nome}: dor {i} sem '{campo}'")

        entregaveis = d.get("entregaveis") or []
        if not entregaveis:
            erros.append(f"{nome}: nenhum entregável")
        for e in entregaveis:
            if e not in ENTREGAVEIS_VALIDOS:
                erros.append(f"{nome}: entregável '{e}' não existe. "
                             f"Válidos: {', '.join(sorted(ENTREGAVEIS_VALIDOS))}")

        gancho = (d.get("gancho") or "").strip()
        if not gancho:
            erros.append(f"{nome}: sem gancho de abertura")
        else:
            ganchos[slug] = gancho
            baixo = normalizar(gancho)
            achadas = [p for p in PALAVRAS_PROIBIDAS
                       if re.search(r"\b" + re.escape(normalizar(p)) + r"\b", baixo)]
            achadas += [p for p in PROIBIDAS_LITERAIS if p in baixo]
            if achadas:
                erros.append(f"{nome}: gancho fala de dinheiro no 1º contato "
                             f"({', '.join(sorted(set(achadas)))})")
            if "?" not in gancho:
                erros.append(f"{nome}: gancho não termina em pergunta aberta")
            if len(gancho) > 600:
                avisos.append(f"{nome}: gancho com {len(gancho)} caracteres — longo pra WhatsApp")

        sinal = (d.get("gancho_sinal") or "").strip()
        if not sinal:
            erros.append(f"{nome}: falta 'gancho_sinal'")
        elif sinal not in SINAIS:
            erros.append(f"{nome}: gancho_sinal '{sinal}' desconhecido. "
                         f"Válidos: {', '.join(sorted(SINAIS))}")
        elif not _seguro(SINAIS[sinal], lead):
            erros.append(f"{nome}: gancho_sinal '{sinal}' NÃO existe nos dados deste lead "
                         f"(sinais reais: {', '.join(sinais_do_lead(lead)) or 'nenhum'})")

    # --- mensagem repetida em massa = número banido ---
    itens = sorted(ganchos.items())
    for i in range(len(itens)):
        for j in range(i + 1, len(itens)):
            s = sobreposicao(itens[i][1], itens[j][1])
            if s >= 0.55:
                erros.append(
                    f"ganchos parecidos demais ({s:.0%}): "
                    f"'{por_slug[itens[i][0]]['nome']}' x '{por_slug[itens[j][0]]['nome']}' "
                    f"— reescreva um dos dois com outra estrutura")

    return erros, avisos


# ---------------------------------------------------------------------------
# renderização
# ---------------------------------------------------------------------------

def render_card(lead, d):
    sc = lead["site_check"]
    nota = lead.get("nota")
    reviews = lead.get("reviews")

    if lead.get("link_whatsapp"):
        contato = f"[{lead['telefone']}]({lead['link_whatsapp']})"
    elif lead.get("telefone"):
        contato = f"{lead['telefone']} — telefone fixo, confirmar se atende WhatsApp"
    else:
        contato = "não verificado"

    if lead.get("instagram_link"):
        insta = lead["instagram_link"]
    else:
        insta = f"🔍 [buscar à mão]({lead['instagram_busca_manual']})"

    site_txt = sc["url"] or "não tem"
    if sc["url"] and not sc["online"]:
        site_txt = f"{sc['url']} — **não respondeu na varredura** ({sc.get('erro') or 'sem resposta'})"

    ultimo = d.get("instagram_ultimo_post") or "não verificado"
    seguidores = d.get("instagram_seguidores") or "não verificado"

    linhas = [
        "---",
        "tipo: lead",
        "status: novo",
        f"score: {lead['score_oportunidade']}",
        f"categoria: {lead['categoria'] or 'não informada'}",
        f"decisao: {d['decisao']}",
        "tags: [nexo, prospeccao]",
        "---",
        "",
        f"# 🎯 {lead['nome']}",
        "",
        f"**Score de oportunidade:** {lead['score_oportunidade']}/100",
        f"**Categoria:** {lead['categoria'] or '—'} · "
        f"**Nota Google:** {nota if nota is not None else '—'} ⭐ "
        f"({reviews if reviews is not None else '—'} avaliações)",
        f"**Endereço:** {lead['endereco'] or lead['cidade'] or '—'}",
        f"**Sinal principal:** {sinal_principal(lead)}",
        "",
        "## 📱 Contato",
        "",
        f"- **WhatsApp:** {contato}",
        f"- **Instagram:** {insta}",
        f"- **Site:** {site_txt}",
        "",
        "## 🔍 Presença digital (varredura)",
        "",
        "| Item | Status |",
        "|---|---|",
        f"| Site online | {marca(sc['online']) if sc['url'] else '❌ não tem site'} |",
        f"| HTTPS | {marca(sc['https_ok'])} |",
        f"| Mobile-friendly | {marca(sc['mobile_friendly'])} |",
        f"| Botão de WhatsApp no site | {marca(sc['tem_whatsapp'])} |",
        f"| Tempo de resposta | {str(sc['tempo_resposta_s']) + 's' if sc['tempo_resposta_s'] else '—'} |",
        f"| Plataforma | {sc['plataforma_generica'] or ('própria' if sc['online'] else '—')} |",
        f"| Último post no Instagram | {ultimo} |",
        f"| Seguidores | {seguidores} |",
        "",
        "## 💊 Dores prováveis",
        "",
    ]

    for i, dor in enumerate(d.get("dores", []), 1):
        linhas += [
            f"{i}. **{dor['dor']}**",
            f"   - _Evidência:_ {dor['evidencia']}",
            f"   - _Custa:_ {dor['consequencia']}",
        ]

    linhas += [
        "",
        "## 📦 Entregáveis Nexo IA sugeridos",
        "",
    ]
    linhas += [f"- {e}" for e in d.get("entregaveis", [])]

    linhas += [
        "",
        "## 💬 Gancho de abertura (WhatsApp)",
        "",
        f"> {d['gancho']}",
        "",
        f"_Apoiado no sinal:_ `{d['gancho_sinal']}`",
        "",
        "## 📝 Notas da R1",
        "",
        "_(preencher depois do contato)_",
        "",
    ]
    return "\n".join(linhas)


def render_fila(leads, por_slug_diag, arquivo_origem):
    hoje = dt.date.today().strftime("%d/%m/%Y")
    prospectar, reter, descartar = [], [], []
    for l in leads:
        d = por_slug_diag[l["slug"]]
        {"prospectar": prospectar, "reter": reter, "descartar": descartar}[d["decisao"]].append((l, d))

    prospectar.sort(key=lambda t: t[0]["score_oportunidade"], reverse=True)

    out = [
        "# 📞 Fila de prospecção — Nexo IA",
        "",
        f"Gerada em {hoje} · origem: `{os.path.basename(arquivo_origem)}`",
        "",
        f"- **Prospectar agora:** {len(prospectar)}",
        f"- **Reter (voltar depois):** {len(reter)}",
        f"- **Descartar:** {len(descartar)}",
        "",
        "> Aquecer o número antes de escalar: comece devagar, varie a mensagem, "
        "suba o volume aos poucos. Os dados são um retrato do momento da varredura.",
        "",
        "## 🎯 Prospectar",
        "",
        "| # | Score | Nome | Cidade | Sinal principal | WhatsApp |",
        "|---|---|---|---|---|---|",
    ]
    for i, (l, d) in enumerate(prospectar, 1):
        wa = f"[chamar]({l['link_whatsapp']})" if l.get("link_whatsapp") else (
            f"{l['telefone']} (fixo)" if l.get("telefone") else "—")
        out.append(f"| {i} | {l['score_oportunidade']} | [[lead-{l['slug']}\\|{l['nome']}]] | "
                   f"{l['cidade'] or '—'} | {sinal_principal(l)} | {wa} |")

    if reter:
        out += ["", "## 🧊 Reter — voltar depois", "",
                "| Nome | Score | Motivo |", "|---|---|---|"]
        for l, d in sorted(reter, key=lambda t: t[0]["score_oportunidade"], reverse=True):
            out.append(f"| {l['nome']} | {l['score_oportunidade']} | {d['motivo']} |")

    if descartar:
        out += ["", "## 🗑 Descartados", "",
                "| Nome | Motivo |", "|---|---|"]
        for l, d in descartar:
            out.append(f"| {l['nome']} | {d['motivo']} |")

    # o que ficou por verificar — a skill exige que isso apareça
    sem_tel = [l["nome"] for l, _ in prospectar if not l.get("telefone")]
    so_fixo = [l["nome"] for l, _ in prospectar if l.get("telefone_tipo") == "fixo"]
    sem_insta = [l["nome"] for l, d in prospectar
                 if not d.get("instagram_ultimo_post")]
    site_off = [l["nome"] for l, _ in prospectar
                if l["site_check"].get("url") and not l["site_check"].get("online")]

    out += ["", "## ⚠️ Não verificado / conferir antes de mandar", ""]
    for rotulo, lista in [
        ("sem telefone no export — buscar no Maps", sem_tel),
        ("só telefone fixo — confirmar se atende WhatsApp", so_fixo),
        ("Instagram não verificado (último post / seguidores)", sem_insta),
        ("site não respondeu na varredura — pode ser instabilidade, reabrir antes de citar", site_off),
    ]:
        if lista:
            out.append(f"- **{rotulo}** ({len(lista)}): {', '.join(lista[:25])}"
                       + (f" … +{len(lista)-25}" if len(lista) > 25 else ""))
    if not any([sem_tel, so_fixo, sem_insta, site_off]):
        out.append("- nada pendente")

    out.append("")
    return "\n".join(out)


def render_csv_crm(caminho, leads, por_slug_diag, etapa, status, valor, dias, com_ddi):
    hoje = dt.date.today()
    prevista = hoje + dt.timedelta(days=dias)
    # "Gancho de abertura" viaja no CSV desde 05/08/2026: o importador do CRM
    # guarda colunas com "gancho" no nome e mostra pra quem atende (dossiê do
    # lead, painel do inbox e nota na conversa). Antes o gancho ficava só no
    # card e a leva subia pro CRM muda.
    campos = ["Título", "Valor", "Etapa", "Empresa", "Contato",
              "Gancho de abertura", "Status", "Data Prevista", "Criado em"]

    linhas = []
    for l in leads:
        d = por_slug_diag[l["slug"]]
        if d["decisao"] != "prospectar":
            continue
        tel = l.get("telefone") or ""
        if tel and com_ddi:
            tel = "55" + tel
        principal = (d.get("entregaveis") or ["Prospecção"])[0]
        linhas.append({
            "Título": f"{principal} — {l['nome']}",
            "Valor": valor,
            "Etapa": etapa,
            "Empresa": l["nome"],
            "Contato": tel,               # número puro, sem link e sem formatação
            "Gancho de abertura": (d.get("gancho") or "").strip(),
            "Status": status,
            "Data Prevista": prevista.strftime("%d/%m/%Y"),
            "Criado em": hoje.strftime("%d/%m/%Y"),
        })

    with open(caminho, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, delimiter=",")
        w.writeheader()
        w.writerows(linhas)
    return len(linhas)


# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Renderiza cards + fila + CSV do CRM (Nexo IA)")
    ap.add_argument("varredura", help="leads_enriquecidos.json")
    ap.add_argument("diagnostico", help="diagnostico.json")
    ap.add_argument("-o", "--out", default="saida/")
    ap.add_argument("--etapa", default="Novo", help="Etapa do funil no CRM")
    ap.add_argument("--status", default="Novo", help="Status do negócio no CRM")
    ap.add_argument("--valor", default="0", help="Valor do negócio")
    ap.add_argument("--dias-previstos", type=int, default=14,
                    help="Dias até a data prevista de fechamento")
    ap.add_argument("--com-ddi", action="store_true",
                    help="Põe o 55 na frente do telefone no CSV do CRM")
    ap.add_argument("--so-validar", action="store_true", help="Checa e não escreve nada")
    args = ap.parse_args()

    with open(args.varredura, encoding="utf-8") as f:
        leads = json.load(f)
    with open(args.diagnostico, encoding="utf-8") as f:
        diag = json.load(f)
    if isinstance(diag, dict):
        diag = diag.get("leads", [])

    erros, avisos = validar(leads, diag)

    if erros:
        print(f"\n🚫 TRAVADO — {len(erros)} problema(s) no diagnóstico:\n")
        for e in erros:
            print(f"  • {e}")
        print("\nCorrija o diagnostico.json e rode de novo. "
              "Não escreva os cards na mão.")
        sys.exit(1)

    for a in avisos:
        print(f"  ⚠ {a}")

    por_slug_diag = {d["slug"]: {**d, "decisao": d["decisao"].strip().lower()} for d in diag}

    if args.so_validar:
        n = sum(1 for d in por_slug_diag.values() if d["decisao"] == "prospectar")
        print(f"\n✅ Diagnóstico válido: {len(leads)} leads, {n} pra prospectar. "
              f"(--so-validar: nada escrito)")
        return

    os.makedirs(os.path.join(args.out, "cards"), exist_ok=True)

    gerados = 0
    for l in leads:
        d = por_slug_diag[l["slug"]]
        if d["decisao"] != "prospectar":
            continue
        caminho = os.path.join(args.out, "cards", f"lead-{l['slug']}.md")
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(render_card(l, d))
        gerados += 1

    fila = os.path.join(args.out, "00-fila-prospeccao.md")
    with open(fila, "w", encoding="utf-8") as f:
        f.write(render_fila(leads, por_slug_diag, args.varredura))

    csv_path = os.path.join(args.out, "pipeline-import.csv")
    n_csv = render_csv_crm(csv_path, leads, por_slug_diag, args.etapa, args.status,
                           args.valor, args.dias_previstos, args.com_ddi)

    print(f"\n✅ Renderizado")
    print(f"  {gerados} cards      -> {os.path.join(args.out, 'cards')}/")
    print(f"  fila               -> {fila}")
    print(f"  {n_csv} linhas no CSV -> {csv_path}")
    if gerados != n_csv:
        print(f"  ⚠ cards ({gerados}) != linhas do CSV ({n_csv}) — investigar")


if __name__ == "__main__":
    main()
