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

# ---------------------------------------------------------------------------
# O crivo (Cofre de Abordagens) — os 5 pontos que separam abordagem de disparo
# ---------------------------------------------------------------------------
# O dono compra o RESULTADO e o tempo devolvido. Como a gente produz (IA
# inclusive) é assunto nosso: citar a ferramenta no primeiro contato entrega o
# jogo e convida a objeção "então eu faço sozinho com IA".
PALAVRAS_FERRAMENTA = [
    "ia", "inteligência artificial", "inteligencia artificial", "automação",
    "automacao", "automatizar", "automatizado", "chatbot", "bot", "robô", "robo",
    "sistema", "plataforma", "software", "ferramenta", "tecnologia", "algoritmo",
    "crm", "dashboard", "integração", "integracao", "api",
]

# "Adorei seu perfil" é a digital do disparo em massa: elogio que serve pra
# qualquer negócio prova que ninguém olhou aquele negócio. Observação
# verificável é a única personalização que ninguém confunde com robô.
ELOGIOS_GENERICOS = [
    "adorei o perfil", "adorei seu perfil", "amei o perfil", "amei seu perfil",
    "adorei o trabalho", "amei o trabalho", "adorei o feed", "amei o feed",
    "trabalho incrivel", "trabalho incrível", "trabalho maravilhoso",
    "trabalho sensacional", "trabalho excelente", "parabens pelo trabalho",
    "parabéns pelo trabalho", "parabens pelo perfil", "parabéns pelo perfil",
    "que trabalho lindo", "conteudo incrivel", "conteúdo incrível",
    "muito top o trabalho", "seu trabalho e incrivel", "seu trabalho é incrível",
]

# Balão grande é "vendedor chato" antes da primeira palavra. As peças do Cofre
# ficam entre 90 e 250 caracteres; 320 é o teto com folga pra nome comprido.
GANCHO_MAX_CHARS = 320

# Travessão, meia-risca e bullet são assinatura de texto gerado. Ninguém digita
# travessão no WhatsApp — digita vírgula, ou dois pontos, ou quebra a frase.
CARACTERES_DE_IA = {
    "—": "travessão (—)",
    "–": "meia-risca (–)",
    "•": "bullet (•)",
    "…": "reticências em caractere único (…)",
    ";": "ponto e vírgula",
}

# Emoji e símbolos decorativos, por faixa Unicode.
RE_EMOJI = re.compile(
    "[" "\U0001F300-\U0001FAFF" "\U00002600-\U000027BF" "\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF" "\U00002B00-\U00002BFF" "️" "]"
)

# ---------------------------------------------------------------------------
# Arquétipos de abertura (Cofre de Abordagens)
# ---------------------------------------------------------------------------
# A trava de sobreposição mede PALAVRAS repetidas, e palavra diferente com a
# mesma forma continua sendo a mesma mensagem: 40 leads recebendo "reparei que
# [X], isso faz o cliente [Y], já tinham percebido?" é disparo em massa mesmo
# com [X] e [Y] trocados. O arquétipo mede a FORMA — é o que a sobreposição
# não enxerga.
#
# Cada entrada: (o que a mensagem faz, sinais em que ela se apoia bem).
ARQUETIPOS = {
    "pergunta_canal": (
        "Pergunta por onde chega cliente novo, sem afirmar nada sobre o negócio",
        {"so_telefone_fixo", "sem_site", "sem_instagram", "nota_alta", "muitos_reviews"},
    ),
    "teste_do_google": (
        "Conta o que aconteceu quando procurou o negócio no Google",
        {"sem_site", "site_off", "plataforma_generica", "sem_https", "sem_instagram"},
    ),
    "reparei_uma_coisa": (
        "Nomeia UMA observação verificável e pergunta se já tinham percebido",
        {"plataforma_generica", "sem_botao_whatsapp", "nao_mobile", "sem_https",
         "so_telefone_fixo", "site_lento"},
    ),
    "quase_desisti": (
        "Conta a jornada de quem tentou virar cliente e travou no caminho",
        {"site_off", "site_lento", "nao_mobile", "sem_botao_whatsapp", "sem_https"},
    ),
    "elogio_e_gap": (
        "Elogia um ponto forte REAL e pergunta o motivo do buraco ao lado dele",
        {"nota_alta", "muitos_reviews", "sem_site", "plataforma_generica",
         "instagram_parado", "sem_instagram"},
    ),
    "perfil_parado": (
        "Aponta o tempo parado e aposta que o problema é tempo, não vontade",
        {"instagram_parado"},
    ),
    "pergunta_honesta_sem_site": (
        "Diz que procurou o site e não achou, e pergunta se é isso mesmo",
        {"sem_site", "site_off"},
    ),
    "volume_sem_canal": (
        "Parte do movimento visível e pergunta como dão conta do atendimento",
        {"muitos_reviews", "nota_alta", "so_telefone_fixo", "nota_baixa"},
    ),
}

# Nenhum arquétipo pode dominar a leva: forma repetida em massa é o mesmo
# problema que a trava de palavras já barra, uma camada acima.
ARQUETIPO_TETO = 0.40

# Saudação não é pergunta: "tudo bem?" não pede nada e não conta contra o
# limite de UMA pergunta. O crivo mira a pergunta que o dono tem que PARAR pra
# responder, e as peças do próprio Cofre abrem com cortesia antes dela.
RE_SAUDACAO = re.compile(
    r"\b(tudo (bem|certo|bom|tranquilo|joia|jóia)|como vai|como (voce|você) (esta|está)|"
    r"beleza|blz|e a(i|í)|td bem)\s*\?",
    re.I,
)

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


def passar_no_crivo(gancho):
    """Os 5 pontos do Cofre, aplicados na mensagem. Devolve lista de problemas.

    Cada ponto existe porque falha nele é o que faz o dono ler a mensagem como
    disparo em massa e não responder — ou pior, denunciar o número.
    """
    problemas = []
    baixo = normalizar(gancho)

    # 1. Dinheiro no primeiro contato (regra antiga, mantida).
    achadas = [p for p in PALAVRAS_PROIBIDAS
               if re.search(r"\b" + re.escape(normalizar(p)) + r"\b", baixo)]
    achadas += [p for p in PROIBIDAS_LITERAIS if p in baixo]
    if achadas:
        problemas.append(f"gancho fala de dinheiro no 1º contato "
                         f"({', '.join(sorted(set(achadas)))})")

    # 2. Cabe numa tela. Balão que rola é "vendedor chato" antes da 1ª palavra.
    if len(gancho) > GANCHO_MAX_CHARS:
        problemas.append(f"gancho com {len(gancho)} caracteres, o teto é "
                         f"{GANCHO_MAX_CHARS} — corta até caber numa tela de celular")

    # 3. Uma pergunta só. Mensagem que pede duas coisas não recebe nenhuma.
    #    Saudação ("tudo bem?") sai da conta: não pede nada de ninguém.
    perguntas = RE_SAUDACAO.sub("", gancho).count("?")
    if gancho.count("?") == 0:
        problemas.append("gancho não termina em pergunta aberta")
    elif perguntas == 0:
        problemas.append("o único '?' do gancho é saudação ('tudo bem?') — falta a pergunta "
                         "de verdade, a que o dono responde de cabeça")
    elif perguntas > 1:
        problemas.append(f"gancho tem {perguntas} perguntas (fora a saudação) — deixe UMA, "
                         f"a que o dono responde de cabeça")

    # 4. Zero cara de IA: emoji, travessão, bullet, ponto e vírgula.
    if RE_EMOJI.search(gancho):
        problemas.append("gancho tem emoji — no 1º contato frio, emoji é assinatura de disparo")
    achados_ia = sorted({rotulo for c, rotulo in CARACTERES_DE_IA.items() if c in gancho})
    if achados_ia:
        problemas.append(f"gancho tem {', '.join(achados_ia)} — ninguém digita isso no "
                         f"WhatsApp, é a assinatura de texto gerado")
    if "\n" in gancho.strip():
        problemas.append("gancho tem quebra de linha — no 1º contato vai UM balão corrido, "
                         "sem lista e sem parágrafo")

    # 5. Fala do negócio DELE, não da nossa ferramenta.
    ferramentas = [p for p in PALAVRAS_FERRAMENTA
                   if re.search(r"\b" + re.escape(normalizar(p)) + r"\b", baixo)]
    if ferramentas:
        problemas.append(f"gancho cita a ferramenta ({', '.join(sorted(set(ferramentas)))}) "
                         f"— o dono compra o resultado, não como a gente produz")

    # 6. Observação real, não elogio genérico.
    gerais = [e for e in ELOGIOS_GENERICOS if normalizar(e) in baixo]
    if gerais:
        problemas.append(f"gancho usa elogio genérico ('{gerais[0]}') — elogio que serve pra "
                         f"qualquer negócio prova que ninguém olhou este aqui")

    return problemas


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

    ganchos = {}     # slug -> gancho, só dos prospectar
    arquetipos = {}  # slug -> arquétipo, pra medir variedade de FORMA na leva

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
            erros.extend(f"{nome}: {p}" for p in passar_no_crivo(gancho))

        sinal = (d.get("gancho_sinal") or "").strip()
        if not sinal:
            erros.append(f"{nome}: falta 'gancho_sinal'")
        elif sinal not in SINAIS:
            erros.append(f"{nome}: gancho_sinal '{sinal}' desconhecido. "
                         f"Válidos: {', '.join(sorted(SINAIS))}")
        elif not _seguro(SINAIS[sinal], lead):
            erros.append(f"{nome}: gancho_sinal '{sinal}' NÃO existe nos dados deste lead "
                         f"(sinais reais: {', '.join(sinais_do_lead(lead)) or 'nenhum'})")

        # Segundo toque (D5 da cadência anti-vácuo). Opcional: a cadência roda
        # sem ele, com o agente improvisando o ângulo. Mas improviso em lead
        # frio soa a robô insistindo, então a ausência é sempre reportada.
        angulo2 = (d.get("gancho_angulo_2") or "").strip()
        if not angulo2:
            avisos.append(f"{nome}: sem 'gancho_angulo_2' — o 2º toque da cadência vai sair "
                          f"improvisado pelo agente, sem ângulo novo preparado")
        else:
            erros.extend(f"{nome} (2º toque): {p}" for p in passar_no_crivo(angulo2))
            if gancho and sobreposicao(gancho, angulo2) >= 0.45:
                erros.append(f"{nome}: o 2º toque repete o 1º "
                             f"({sobreposicao(gancho, angulo2):.0%} de sobreposição) — o segundo "
                             f"toque existe pra trazer ÂNGULO NOVO, não pra insistir no mesmo")

        arquetipo = (d.get("gancho_arquetipo") or "").strip()
        if not arquetipo:
            erros.append(f"{nome}: falta 'gancho_arquetipo'. "
                         f"Válidos: {', '.join(sorted(ARQUETIPOS))}")
        elif arquetipo not in ARQUETIPOS:
            erros.append(f"{nome}: gancho_arquetipo '{arquetipo}' desconhecido. "
                         f"Válidos: {', '.join(sorted(ARQUETIPOS))}")
        else:
            arquetipos[slug] = arquetipo
            # Combinação estranha não bloqueia: o sinal manda no ASSUNTO, o
            # arquétipo manda na FORMA, e às vezes a forma "errada" é a certa
            # pra aquele dono. Mas fica registrado pra quem revisa.
            _, sinais_bons = ARQUETIPOS[arquetipo]
            if sinal and sinal in SINAIS and sinal not in sinais_bons:
                avisos.append(f"{nome}: arquétipo '{arquetipo}' com sinal '{sinal}' é combinação "
                              f"incomum (esse arquétipo costuma se apoiar em: "
                              f"{', '.join(sorted(sinais_bons))})")

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

    # --- FORMA repetida em massa: o que a conta de palavras não enxerga ---
    # A partir de 5 leads a proporção começa a significar alguma coisa; abaixo
    # disso, 2 de 3 no mesmo arquétipo é coincidência, não padrão.
    if len(arquetipos) >= 5:
        contagem = {}
        for a in arquetipos.values():
            contagem[a] = contagem.get(a, 0) + 1
        for arquetipo, n in sorted(contagem.items(), key=lambda kv: (-kv[1], kv[0])):
            fatia = n / len(arquetipos)
            if fatia > ARQUETIPO_TETO:
                erros.append(
                    f"arquétipo '{arquetipo}' em {n} de {len(arquetipos)} leads ({fatia:.0%}) "
                    f"— o teto é {ARQUETIPO_TETO:.0%}. Mesma forma em série é disparo em massa "
                    f"mesmo com as palavras trocadas; reescreva parte deles em outro arquétipo")

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
        f"_Apoiado no sinal:_ `{d['gancho_sinal']}` · "
        f"_forma:_ `{d.get('gancho_arquetipo', '—')}` · "
        f"{len(d['gancho'])} caracteres",
        "",
        "### Segundo toque (D5, se der vácuo)",
        "",
        (f"> {d['gancho_angulo_2']}" if (d.get("gancho_angulo_2") or "").strip()
         else "_Não preparado — o agente vai improvisar o ângulo no D5._"),
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
    # "Gancho segundo toque" alimenta o D5 da cadência anti-vácuo: o segundo
    # toque tem que chegar com ÂNGULO NOVO, nunca repetindo o primeiro. Sem
    # isto o agente improvisa o ângulo, e improviso em lead frio soa a robô
    # insistindo. Casa com GANCHO_KEY_RE, então o CRM guarda sozinho.
    # "Google Maps" dá ao SDR o caminho de volta pro anúncio original quando o
    # telefone falha (número fora do WhatsApp, Maps desatualizado) — pedido do
    # Mario em 06/08/2026 depois de dois leads seguidos sem WhatsApp.
    campos = ["Título", "Valor", "Etapa", "Empresa", "Contato",
              "Gancho de abertura", "Gancho segundo toque", "Google Maps",
              "Status", "Data Prevista", "Criado em"]

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
            "Gancho segundo toque": (d.get("gancho_angulo_2") or "").strip(),
            "Google Maps": (l.get("google_maps") or "").strip(),
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
