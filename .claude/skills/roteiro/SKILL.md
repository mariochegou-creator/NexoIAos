---
name: roteiro
description: >
  Cria roteiro de Reel ou vídeo para job de influencer. O cliente é um dono de negócio que
  contratou a NEXO IA para divulgar o estabelecimento dele via influencer. A skill pergunta o
  negócio, busca contexto do cliente se já estiver cadastrado, pesquisa vídeos virais do nicho,
  manda links para análise, e gera dois arquivos: cenas (para gravar) e fala (para a influencer).
  Use quando disser "/roteiro", "criar roteiro", "fazer roteiro pra [cliente]", "reel pra [negócio]".
---

# /roteiro — Roteiro de Reel para job de influencer

O cliente pagou para a influencer divulgar o negócio dele.
A skill cria o roteiro desse vídeo — calibrado para o nicho, com pesquisa de referências antes de escrever.

Sempre entrega dois arquivos:
- `roteiros/[slug]-cenas.md` — o que filmar e como editar (para quem vai a campo)
- `roteiros/[slug]-fala.md` — as falas da influencer, cena por cena (para ela estudar)

---

## PASSO 1 — Identificar o negócio

Perguntar em uma linha só:

> "Qual o nome do estabelecimento e o que eles fazem?"
> (ex: Clínica São Lucas — clínica médica / Restaurante Bella Vista — restaurante italiano)

---

## PASSO 2 — Buscar contexto do cliente

Verificar se o cliente já está cadastrado:
- Listar pastas em `clientes/` — tem uma com esse nome?
- Se sim: ler `.nexo-status.md` e `CLAUDE.md` da pasta
- Verificar quais serviços a NEXO IA já entregou ou está entregando para eles

Se encontrar contexto, usar no roteiro:
- Serviços contratados (ex: site, automação WhatsApp, dashboard)
- Qualquer resultado já alcançado
- Tom do relacionamento

Se não encontrar, seguir com o que o usuário informou.

---

## PASSO 3 — Pesquisar vídeos virais do nicho

Antes de escrever uma linha do roteiro, fazer pesquisa real de referências virais — **sempre TikTok e Instagram separadamente**, priorizando conteúdo recente.

### Etapa 3.1 — Buscar no TikTok

Fazer **WebSearch** com query focada no TikTok:

```
site:tiktok.com [tipo de negócio] brasil viral 2026
```

Também tentar variação com nicho específico:
```
site:tiktok.com [palavra-chave do nicho] [cidade ou "brasil"] reel 2025 OR 2026
```

### Etapa 3.2 — Buscar no Instagram

Fazer **WebSearch** com query focada no Instagram:

```
site:instagram.com/reel [tipo de negócio] brasil viral 2026
```

Variação alternativa:
```
site:instagram.com [nicho] reel viral brasil 2025 OR 2026 views
```

### Etapa 3.3 — Verificar engajamento de cada vídeo encontrado

Para **cada link promissor** nas buscas acima, usar **WebFetch** para acessar a página e coletar:

- Views, likes, comentários, compartilhamentos — o que estiver visível na página
- Data de publicação (para saber se é das últimas 24h ou 48h)
- Legenda/descrição do vídeo (contexto do hook e proposta)

Anotar internamente: **publicado há menos de 48h?** Se sim, priorizar esses.

### Etapa 3.4 — Selecionar os 3 melhores e analisar

Escolher os **3 vídeos** que melhor combinam: mesmo nicho + mesma proposta + maior engajamento/recência.

Para cada um, analisar **por que viralizou** com base no que está visível (hook inicial, estrutura, legenda, métricas):

- **Técnica de hook:** o que interrompeu o scroll nos primeiros 1–3 segundos? (pergunta, revelação, movimento, texto na tela, elemento de surpresa)
- **Estrutura:** como o vídeo foi construído? (problema → solução, lista, transformação, revelação progressiva)
- **Gatilho emocional:** o que fez as pessoas salvar, comentar ou compartilhar? (identidade, humor, surpresa, utilidade, inveja positiva)
- **Elemento viral:** o que diferencia esse vídeo dos outros cem no mesmo nicho?

### Formato de entrega ao usuário

```
🔍 Referências virais — nicho [tipo de negócio]

📌 TikTok
1. [link]
   📊 [views/likes visíveis] | publicado [data ou "menos de 48h / X dias atrás"]
   🔥 POR QUE VIRALIZOU:
   — Hook: [o que fez parar o scroll]
   — Estrutura: [como foi construído]
   — Gatilho: [o que fez engajar/compartilhar]

📌 Instagram
2. [link]
   📊 [engajamento visível] | publicado [data]
   🔥 POR QUE VIRALIZOU:
   — Hook: [...]
   — Estrutura: [...]
   — Gatilho: [...]

📌 [TikTok ou Instagram — o de maior engajamento dos dois]
3. [link]
   📊 [...] | publicado [...]
   🔥 POR QUE VIRALIZOU:
   — Hook: [...]
   — Estrutura: [...]
   — Gatilho: [...]

→ Algum desses serve como referência? Ou prefere criar do zero?
```

Se nenhum link estiver acessível via WebFetch, descrever o **padrão encontrado** nos resultados de busca (estrutura de título, thumbnails, tipo de hook descrito nas legendas) e perguntar se quer criar do zero com base nesses padrões.

---

## PASSO 4 — Perguntas essenciais

Após o usuário responder sobre as referências, fazer tudo em **uma mensagem só**:

```
Três perguntas rápidas antes de escrever:

1. OBJETIVO do vídeo:
   A) Viralizar — alcançar o máximo de pessoas, entreter, gerar curiosidade sobre o negócio
   B) Vender — gerar clientes novos com CTA direto (WhatsApp, visita, promoção)

2. O QUE MOSTRAR — Qual é o diferencial ou resultado que o negócio tem pra oferecer?
   (pode ser uma promoção, um ambiente, um serviço especial, um antes/depois)
   → Tem algum número real? (ex: "já atendemos 500 famílias", "promoção de R$ 149,99")

3. O QUE TEMOS PRA FILMAR:
   A) Ambiente do negócio (loja, consultório, cozinha, etc.)
   B) Produto ou serviço sendo demonstrado
   C) Frase ou depoimento do dono
   D) Só a influencer apresentando, sem acesso ao local
```

---

## PASSO 5 — Definir estrutura

### OBJETIVO A — VIRALIZAR

```
HOOK (0–3s)       → para o scroll — surpresa, pergunta, visual impactante
DESENVOLVIMENTO   → mostra algo genuinamente interessante sobre o negócio
REVEAL            → o "não acreditei" — número, transformação, detalhe inesperado
CTA SUAVE (fim)   → "salva esse", "manda pra alguém que precisa", "comenta o que achou"
```

Ritmo: rápido no hook, constrói ao longo, resolve no final. Cortes na batida da música.

### OBJETIVO B — VENDER

```
HOOK (0–5s)              → identifica a dor ou desejo do público do negócio
PROBLEMA/SITUAÇÃO (5–15s) → amplifica antes de resolver (gera tensão)
SOLUÇÃO/OFERTA (15–40s)   → mostra o negócio como resposta — visual, concreto
PROVA/RESULTADO (40–55s)  → número, depoimento, antes/depois, movimento real
CTA DIRETO (55s+)         → WhatsApp, endereço, promoção com prazo
```

Ritmo: começa marcado, acelera na solução, fecha com energia e urgência.

---

## PASSO 6 — Criar os arquivos

### Onde salvar

Se o cliente está em `clientes/[nome]/`:
```
clientes/[nome]/roteiros/[slug]-cenas.md
clientes/[nome]/roteiros/[slug]-fala.md
```

Se ainda não tem pasta:
```
briefings/[nome]/roteiros/[slug]-cenas.md
briefings/[nome]/roteiros/[slug]-fala.md
```

Criar as pastas se não existirem.

**Slug:** nome do negócio em lowercase com hifens.
- `clinica-sao-lucas-cenas.md`
- `restaurante-bella-vista-fala.md`

---

### Arquivo 1 — `[slug]-cenas.md`

```markdown
# [Nome do Negócio] — Cenas & Edição

**Objetivo:** [Viralizar / Vender]
**Influencer:** [Nome]
**Duração alvo:** [30s / 60s / 90s]
**Tom:** [energético e comercial / emocional / educativo / surpresa]
**Referência:** [link usado ou "criado do zero"]

---

## Decupagem de cenas

### CENA 1 — HOOK [0:00–0:0X]
**Onde filmar:** [ambiente, posição da câmera, distância]
**O que fazer:** [ação — movimento, expressão, gesto específico]
**Fala nesta cena:** "[o que dizer, se houver]"
**💡 Edição:** [corte, efeito, texto na tela, como entra a música]

### CENA 2 — [NOME DO BLOCO] [0:0X–0:XX]
**Onde filmar:** [...]
**O que fazer:** [...]
**Fala:** "[...]"
**💡 Edição:** [...]

[repetir para cada cena — em geral 4 a 6]

### CENA FINAL — CTA [0:XX–fim]
**Onde filmar:** [...]
**O que fazer:** [gesto final, expressão, como sai de cena]
**Fala:** "[CTA completo]"
**💡 Edição:** [logo ou texto de contato na tela, fade ou corte seco]

---

## Checklist de gravação
- [ ] [item prático 1]
- [ ] [item prático 2]
- [ ] [item prático 3]
- [ ] Gravar 2 takes de cada cena
- [ ] [item específico desse job]

## Guia de edição
**Música:** [estilo e mood — ex: forró eletrônico / trap suave / beat animado]
**Ritmo de corte:** [ex: 1 corte/segundo no hook, mais lento nas demonstrações]
**Textos na tela:** [quais frases, em qual cena, em qual estilo visual]
**Efeitos:** [zoom, corte no movimento, slow motion, efeito REC, espelho/reverso]
**Transições de bloco:** [tela preta com logo, fade, corte seco]
**Filtro/cor:** [ex: tons quentes e vibrantes / azul frio / naturalista]
```

---

### Arquivo 2 — `[slug]-fala.md`

```markdown
# [Nome do Negócio] — Fala da Influencer

**Influencer:** [Nome]
**Tom:** [tom do vídeo]
**Duração estimada:** [Xs]

> Leia uma vez do começo ao fim antes de gravar.
> Fale de forma natural — esse é o guia, não um script decorado.
> O que não muda: o hook, os números, e o CTA.

---

### HOOK [0:00–0:0X]
*[instrução de entrega — ex: andando em direção à câmera, tom de revelação, sem hesitar]*

"[frase exata]"

---

### [BLOCO 2] [0:0X–0:XX]
*[instrução — ex: mostrando o ambiente, apontando, energia crescente]*

"[fala do bloco]"

---

### [BLOCO 3] [0:XX–0:XX]
*[instrução]*

"[fala]"

---

### CTA [0:XX–fim]
*[instrução — ex: olhando direto na câmera, tom caloroso, sorri no final]*

"[CTA completo]"

---

## Dicas de entrega
**Hook:** [ex: sobrancelha levantada, sem hesitar na primeira palavra]
**Números:** [ex: pausa de 0.5s antes do número — deixa respirar]
**Gestos:** [ex: aponta pro produto/tela quando citar o resultado]
**CTA:** [ex: aponta pra baixo (link na bio) no último segundo]
**Geral:** [postura, ritmo, nível de energia — calibrado para esse tom específico]
```

---

## ESTILO CALIBRADO — padrão dos jobs da NEXO IA

Com base nos jobs realizados, a influencer usa esse padrão:

**Ritmo:** Edição dinâmica, cortes na batida. Zoom rápido, corte seco no movimento, efeito espelho/reverso entre takes.

**Energia:** Alta. Muito expressiva com as mãos — aponta, sinaliza OK, gesticula valor. Fala direto pra câmera como quem descobriu algo e está contando pra amiga.

**Linguagem:** "Gente!", "Olha só!", "Não perde!", "Eu preciso mostrar isso pra vocês!" Naturalmente animada, não parece script. Fechamento caloroso ("eu tô te esperando!").

**Estrutura visual:** Tela preta com logo entre blocos. Efeito REC de câmera. Exterior (entrada, rua) + interior (ambiente do negócio). Etiquetas de preço/resultado aparecem na tela quando citadas.

---

## REGRAS

- Pesquisar vídeos virais **sempre** antes de escrever — trazer links para o usuário validar
- O roteiro é sobre o negócio do cliente — não sobre a NEXO IA
- Falas em português brasileiro natural — nada que soe corporativo ou roteirizado demais
- O arquivo de cenas é para quem segura a câmera — deve funcionar sem explicação adicional
- O arquivo de fala é para a influencer estudar sozinha — testar mentalmente lendo em voz alta
- Ao terminar, perguntar: "Quer ajustar alguma cena ou trecho antes de fechar?"
