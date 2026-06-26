---
name: roteiro-viral
description: >
  Busca vídeos e músicas em alta de QUALQUER nicho (barbershop, delivery, salão, loja,
  restaurante, consultório, etc.) e gera um pacote completo pronto pra mandar pra modelo:
  roteiro do vídeo + legendas + guia de filmagem + guia de edição, tudo com a música sugerida
  e calibrado pro negócio específico. A skill é agnóstica de nicho — adapta a busca ao segmento
  que o usuário passar. Use quando o usuário disser "gera roteiro viral", "preciso de vídeo pra
  [negócio]", "modelo de vídeo", "busca conteúdo em alta", "roteiro pra modelo", ou /roteiro-viral.
---

# /roteiro-viral — Conteúdo em alta + roteiro pronto pra modelo

Skill que faz o trabalho completo: descobre o que tá performando no nicho, acha a música que
casa, e entrega tudo mastigado pra modelo gravar sem se perder. Serve pra qualquer segmento —
o usuário fala o nicho, a skill adapta.

## Dependências

- **Contexto da Nexo:** `_memoria/empresa.md`.
- **Tom de voz:** `_memoria/preferencias.md`.
- **Web search:** pra buscar vídeos e áudios reportados em alta.

---

## Como a skill descobre o que tá "bombando" (ler com atenção)

A skill **não acessa as métricas internas** do TikTok/Reels/Shorts (views, saves, retenção em
tempo real). Ela trabalha com o que dá pra achar via web search, e é honesta sobre isso. Três
caminhos:

1. **Tendências reportadas:** matérias, listas e contas de marketing que publicam "o que tá em
   alta" semana a semana — formatos e áudios. Informação datada e real, mas de segunda mão.
2. **Padrões recorrentes:** quando vários vídeos do nicho repetem a mesma estrutura (hook nos
   primeiros 2s, transição no beat, texto na tela), dá pra inferir o que o algoritmo tá
   premiando, mesmo sem o número exato.
3. **Áudios em alta:** fontes que rastreiam trending sounds por período.

**Regras de honestidade (a skill NUNCA quebra):**
- Nunca inventar número de views ou métrica. Se não tem o dado, não cita o dado.
- Nunca garantir que algo "vai viralizar". Fala em "tendência" e "padrão", não em promessa.
- Rotular cada referência pela origem: **[reportado em alta]** (saiu numa fonte) ou
  **[padrão observado]** (recorrência entre vários vídeos). Assim o usuário sabe o peso de cada uma.

---

## Workflow

### Passo 1 — Entrevista rápida (uma pergunta por vez)

Conversando, não como formulário:

1. **Qual o nicho?** (barbershop, delivery, salão, loja de roupa, restaurante, consultório…)
2. **Qual o negócio e o diferencial?** (nome + o que oferece + o que destaca — ex: "Barbearia Corte Fino, degradê é a especialidade")
3. **Quem é a modelo?** (nome, tamanho/estilo — ex: "Amanda, ~150k no Reels, bem-humorada")
4. **Objetivo do vídeo?** (atrair cliente novo, mostrar serviço, humor, prova social, educar)

### Passo 2 — Buscar vídeos em alta do nicho

Web search adaptando ao nicho (5 a 10 buscas pra cobertura). Montar as queries derivando o tipo
de conteúdo que aquele nicho costuma postar:

- Identificar o "formato-mãe" do nicho — ex: barbershop → transição/antes-depois/humor de
  cadeira; delivery → preparo/unboxing/reação; salão → transformação; loja → provador/looks;
  restaurante → prato sendo montado/bastidor.
- Buscar termos como: "[nicho] viral TikTok Reels [mês/ano atual]", "[nicho] trend vídeo",
  "[formato-mãe] trend [ano]". Usar o ano e mês reais.
- Fazer web_fetch nas 2–3 melhores fontes pra extrair detalhe (estrutura, duração, hook).

### Passo 3 — Buscar músicas/áudios em alta

Buscar trending sounds do período + os que combinam com o formato do nicho. Pra cada música
sugerida, dar **contexto**: por que ela casa (energia, beat pra transição, clima, se é mais pra
humor ou pra estético). Lembrar: áudio em alta muda rápido e é interno da plataforma — então
rotular como **[reportado em alta]** e orientar o usuário a confirmar dentro do app na hora de gravar.

### Passo 4 — Analisar os padrões

Do que foi achado, extrair:
- **Hook:** como prendem nos primeiros 2–3s.
- **Estrutura:** sequência de cenas.
- **Duração:** faixa que tá performando (geralmente 7–20s pra esse tipo de conteúdo local).
- **CTA:** como chamam pra ação.
- **Edição:** cortes, texto na tela, sincronismo com o beat.

### Passo 5 — Gerar os entregáveis

Montar os 4 blocos abaixo, calibrados pro negócio e pro estilo da modelo. Tudo pronto pra
copiar e mandar no WhatsApp dela.

---

## Os 4 entregáveis

### 1. Roteiro do vídeo
```
🎬 ROTEIRO — [Negócio] | [objetivo]
Duração alvo: [Xs] · Formato: vertical 9:16
Música sugerida: [nome] — [por que casa] [reportado em alta]

0–3s (HOOK): [o que acontece — tem que prender na hora]
3–[X]s (DESENVOLVIMENTO): [cena 1 — cena 2…]
[transição no beat]: [o momento de virada / o "uau"]
Final (CTA): [chamada — ex: "agenda no link da bio"]
```

### 2. Legendas / caption
```
✍️ LEGENDA
[1ª linha = fisga, o hook do texto]
[corpo curto, no tom da modelo]
[CTA]
[#hashtags do nicho + #cidade pra busca local]
```

### 3. Guia de filmagem
```
📹 COMO FILMAR (celular já resolve)
Takes essenciais (não podem faltar):
- [take 1 — ex: close do antes]
- [take 2 — ex: processo]
- [take 3 — ex: revelação do depois]
Ângulos: [enquadramento por cena]
Luz: [natural perto da janela ou ring light simples]
Dicas: grava o HOOK umas 3x (é o take mais importante) · celular firme · vertical sempre
```

### 4. Guia de edição + briefing pra modelo
```
✂️ EDIÇÃO (CapCut, grátis)
- Cortes: [onde cortar rápido]
- Texto na tela: [o que escrever + em que segundo aparece]
- Transição: sincroniza com o beat da música em [momento]
- Legenda automática: ativa pra quem vê sem som
- Duração final: [Xs]

📌 PRA MODELO ENTENDER O PORQUÊ
O que tá funcionando no nicho agora: [resumo do padrão] [padrão observado]
Referências (pra ela ver o estilo, não pra copiar igual):
- [vídeo/fonte 1] [reportado em alta / padrão observado]
- [vídeo/fonte 2] [...]
O que ela precisa entregar: [1 frase clara]
```

---

## Calibração (contexto Nexo)

- **Assumir gravação com celular.** Negócio local não tem produtora. Setup simples: celular, luz
  natural ou ring light. Nada que dependa de equipamento caro.
- **Adaptar ao estilo da modelo.** Se ela é bem-humorada, o roteiro puxa humor; se é mais
  estética, puxa transformação visual. Não engessar.
- **Modelar, não copiar.** As referências servem de inspiração de formato — o vídeo final é do
  negócio do cliente, com o diferencial dele. Nunca orientar a refazer um vídeo idêntico.

## O que evitar

- Inventar número de views ou qualquer métrica que não veio de uma fonte.
- Prometer viralização. A skill entrega referência e estrutura, não garantia.
- Áudio sem contexto — sempre explicar por que a música casa.
- Roteiro genérico que serviria pra qualquer negócio. Tem que ter o diferencial do cliente.
- Ignorar o estilo da modelo.
