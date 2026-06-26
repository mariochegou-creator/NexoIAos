---
name: r1
description: >
  Analisa a transcrição da R1 (primeira reunião / call de diagnóstico) usando a metodologia
  SPIN Selling e devolve um mapa cirúrgico de problema → solução. Pra cada problema levantado
  pelo dono do negócio, entrega DUAS rotas: a enxuta (custo baixo ou zero, que já entrega
  resultado) e a robusta (com investimento, só quando for o caso), sempre calibrada pra
  cidade pequena e negócio com pouca verba pra ferramenta e tráfego pago. Fecha com uma
  camada de coaching da própria R1 e um resumo pronto pra virar proposta.
  Use quando o usuário disser "analisa a R1", "transcrição da reunião", "joguei a call",
  "diagnóstico da reunião", "analisa essa call de venda", colar uma transcrição de reunião,
  ou /r1.
---

# /r1 — Diagnóstico SPIN da primeira reunião

Skill central de vendas da Nexo IA. Pega a transcrição da R1 (reunião 1, a call de descoberta
com o lead) e transforma em um documento de trabalho: o que dói no negócio dele, quanto isso
custa, e exatamente o que a Nexo entrega pra resolver — em duas faixas de investimento.

O objetivo é sair da R1 com clareza total pra montar a proposta e pra conduzir o fechamento.

## Dependências

- **Contexto do negócio (Nexo IA):** `_memoria/empresa.md` — o que a Nexo oferece, pra mapear
  cada solução ao que a gente de fato entrega
- **Tom de voz:** `_memoria/preferencias.md`
- **Transcrição da R1:** colada pelo usuário ou em arquivo (.txt, .md, CSV de transcrição)

---

## Princípio que rege essa skill

A Nexo atua em **cidade pequena**, com negócios que **não têm capacidade de pagar caro por
ferramenta nem por tráfego pago**. Isso muda tudo:

1. **A rota enxuta vem primeiro, sempre.** Quase todo problema de negócio local tem uma
   solução de custo baixo ou zero que já move o ponteiro (Google Meu Negócio, WhatsApp
   Business, conteúdo orgânico, prova social). Tráfego pago e ferramenta cara são exceção,
   não o reflexo automático.
2. **Toda solução tem duas opções.** A enxuta (resultado com pouco ou nenhum gasto) e a
   robusta (com investimento). A robusta só entra quando o problema realmente não se resolve
   sem ela **e** quando a R1 mostrou que existe verba e disposição.
3. **Implicação é o coração.** A pesquisa de Rackham (35 mil calls) achou que vendedores de
   alta performance fazem 4x mais perguntas de implicação. Não basta listar o problema — tem
   que mostrar quanto ele custa. Toda solução aqui amarra o problema a dinheiro perdido,
   cliente que foi pro concorrente, ou tempo desperdiçado.

---

## O método SPIN (base da análise)

A transcrição é lida através das quatro lentes do SPIN:

- **S — Situação:** os fatos do negócio. O que ele tem hoje (canais, movimento, estrutura,
  como atende, como capta). Contexto, não problema.
- **P — Problema:** as dores explícitas. Reclamações, dificuldades, insatisfações que o dono
  verbalizou ("meu Instagram tá parado", "ligo e ninguém responde", "movimento caiu").
- **I — Implicação:** a consequência da dor. O que o problema causa em cascata — perda de
  faturamento, cliente que vai pro concorrente, sócio sobrecarregado. Aqui a dor vira urgência.
- **N — Necessidade explícita (need-payoff):** o momento em que o dono articula o valor de
  resolver ("se eu conseguisse encher as terças seria outro jogo"). É o sinal verde de venda.

Regra de ouro do SPIN: **não apresentar solução antes de ter desenvolvido implicação.** Se a
R1 pulou direto da dor pra "e aí, quanto custa?", a implicação ficou na mesa — e isso vira
ponto de coaching no fim.

---

## Workflow

### Passo 1 — Ler o contexto

Ler `_memoria/empresa.md` pra saber o que a Nexo entrega (criação de conteúdo, presença no
Google, atendimento, etc.) e `_memoria/preferencias.md` pro tom. Não confirmar a leitura, só
usar.

### Passo 2 — Mapear a transcrição no SPIN

Varrer a transcrição e separar:

- **Situação:** 3 a 5 fatos do negócio (não inventar — só o que está na call).
- **Problemas:** lista numerada, de preferência nas palavras do próprio dono (paráfrase curta
  ou trecho real entre aspas).
- **Implicações desenvolvidas:** quais dores tiveram a consequência explorada na call, e
  **quais ficaram sem desenvolver** (essas viram coaching no Passo 4).
- **Necessidade explícita:** os momentos em que o dono demonstrou querer a solução.

Se a transcrição estiver confusa ou faltando partes, sinalizar o que dá e o que não dá pra
extrair — sem preencher buraco com suposição.

### Passo 3 — Montar o bloco cirúrgico de cada problema

Pra **cada** problema levantado, montar um bloco com esta estrutura exata:

- **O que ele disse** — trecho ou paráfrase curta.
- **Custo real (implicação)** — o que esse problema tira do negócio. Sempre tentar amarrar a
  dinheiro, cliente perdido ou tempo. Se a implicação não saiu na call, estimar de forma
  honesta ("provável que esteja custando X, mas não foi medido na R1").
- **Solução enxuta** — o que fazer com custo baixo ou zero, qual ferramenta, e o que a Nexo
  entrega nisso. É a rota padrão.
- **Solução com investimento** *(só se fizer sentido)* — o que é, **quando vale a pena**,
  faixa de custo estimada e o retorno esperado. Se o problema se resolve 100% na rota enxuta,
  dizer explicitamente "não precisa investir nisso agora".
- **Recomendação pra esse cliente** — qual das duas puxar, lendo os sinais de orçamento da
  própria R1. Não empurrar a robusta por empurrar.

Consultar a **Biblioteca de soluções** (abaixo) como base, adaptando ao caso.

### Passo 4 — Coaching da R1

Seção curta avaliando a própria conduta da reunião:

- Quais etapas do SPIN ficaram fortes e quais ficaram fracas.
- 2 a 3 **perguntas de implicação ou need-payoff específicas** que faltaram — prontas pra usar
  no follow-up ou na próxima call. Específicas ao negócio dele, não genéricas.

Exemplo de pergunta de implicação bem feita (não genérica): em vez de "isso te atrapalha?",
algo como "você falou que perde umas 10 mensagens por dia sem responder — se metade dessas
fechasse, quanto seria no mês?".

### Passo 5 — Resumo pronto pra proposta

Fechar com 3 a 5 linhas que sintetizam o caso e já servem de base pra `/apn`:
o problema central, a rota recomendada, e o resultado prometido. Direto, sem enrolação.

---

## Biblioteca de soluções (negócio local, cidade pequena)

Mapa de referência. Cada dor comum tem rota enxuta (padrão) e robusta (se for o caso).

**"Ninguém me acha no Google / não apareço na busca"**
- Enxuta (R$ 0): otimizar e completar o Google Meu Negócio (Perfil da Empresa) — horário,
  fotos, categoria certa, link do WhatsApp — e disparar uma campanha de avaliações com os
  clientes atuais. É o melhor custo-benefício que existe pra negócio local.
- Robusta (com investimento): SEO local + Google Ads segmentado por bairro/cidade. Só quando
  o GMN já está redondo e ainda falta volume.

**"Instagram parado / não sei o que postar"**
- Enxuta (R$ 0 a baixo): calendário de conteúdo + artes no Canva (versão grátis resolve 90%) +
  agendamento no Meta Business Suite. A Nexo entrega o conteúdo recorrente.
- Robusta: produção com foto/vídeo profissional + impulsionamento pago no Meta. Só com verba
  e quando o orgânico já provou que o conteúdo converte.

**"Recebo mensagem mas não fecho / atendimento bagunçado"**
- Enxuta (R$ 0): WhatsApp Business configurado de verdade — catálogo, respostas rápidas,
  etiquetas (novo / orçamento / fechado), mensagem de ausência. Resolve a maior parte da
  bagunça sem custo.
- Robusta: CRM + automação de WhatsApp pra não perder lead. Só quando o volume de mensagens
  já estoura a capacidade manual.

**"Movimento caiu / poucos clientes novos"**
- Enxuta: diagnosticar o canal (não é falta de anúncio, é falta de base). GMN + conteúdo +
  oferta/promoção divulgada nos canais que ele já tem (lista de transmissão, status).
- Robusta: tráfego pago local segmentado. Só depois que a base orgânica estiver de pé — senão
  é jogar dinheiro fora.

**"Gasto com anúncio e não vejo retorno"**
- Enxuta: **pausar** e arrumar a base antes (GMN, página de destino, oferta clara). Muitas
  vezes a correção é gratuita e o problema não era o anúncio.
- Robusta: reestruturar a campanha com acompanhamento semanal (a skill /relatorio-ads cobre).

**"Não tenho controle de quem é cliente / não tem recompra"**
- Enxuta (R$ 0): planilha de clientes + lista de transmissão no WhatsApp ou e-mail no Brevo
  (plano grátis: ~300 e-mails/dia) pra reativar quem já comprou.
- Robusta: CRM (HubSpot grátis pra começar) + automação de fidelização.

**"Não tenho site / meu site é velho"**
- Enxuta: por enquanto, GMN + Linktree + Instagram como vitrine já seguram. Nem todo negócio
  local precisa de site.
- Robusta: site institucional ou landing + SEO. Só quando ele tem oferta que justifica.

**"Concorrente tá na minha frente"**
- Enxuta: diferenciação + prova social (avaliações, depoimentos, antes/depois). Quase sempre
  o concorrente só está mais presente, não é melhor.
- Robusta: campanha de posicionamento + ads. Se for briga de mercado mais disputada.

> A biblioteca é ponto de partida. Sempre adaptar ao que o dono falou e ao que a Nexo entrega.
> Se aparecer um problema fora da lista, montar o bloco do zero seguindo a mesma lógica:
> implicação amarrada a dinheiro → rota enxuta → rota robusta se for o caso.

---

## Regras de calibração de preço

- **Default é gratuito ou barato.** Só sugerir gasto quando a rota enxuta comprovadamente não
  resolve.
- **Tráfego pago não é resposta-padrão.** Pra negócio local em cidade pequena, presença
  orgânica bem feita (GMN + conteúdo + atendimento) costuma render mais que verba de anúncio
  pequena e mal gerida.
- **Toda recomendação de investimento vem com o "porquê vale".** Nunca um número solto —
  sempre o retorno esperado em cima do problema.
- **Ler o orçamento na própria R1.** Se o dono sinalizou aperto, puxar a enxuta e deixar a
  robusta como "passo 2, quando der resultado". Se sinalizou que pode investir, apresentar as
  duas com a robusta em destaque.

---

## Formato de saída

```
## R1 — [Nome do negócio] | [data]

### Diagnóstico SPIN
- Situação: [3-5 fatos do negócio]
- Problemas levantados:
  1. [nas palavras do dono]
  2. ...
- Implicações desenvolvidas: [quais doeram na call]
- Ficou na mesa: [dores cuja consequência não foi explorada]
- Sinais de necessidade explícita: [momentos de "eu queria resolver isso"]

### Soluções por problema

**Problema 1 — [nome curto]**
- O que ele disse: "[trecho/paráfrase]"
- Custo real: [o que tira de faturamento/tempo]
- Solução enxuta (R$ baixo/zero): [o quê + ferramenta + o que a Nexo entrega]
- Com investimento (se for o caso): [o quê + quando vale + faixa de custo + retorno]
- Recomendação pra esse cliente: [enxuta ou robusta + porquê]

[repetir por problema]

### Leitura de orçamento
[o que a R1 sinalizou sobre quanto ele pode/quer investir]

### Onde a R1 podia ter ido mais fundo
[2-3 perguntas de implicação/need-payoff que faltaram]

### Resumo pra proposta
[3-5 linhas — problema central, rota recomendada, resultado prometido]
```

---

## O que evitar

- Apresentar solução cara sem ter a rota enxuta antes.
- Recomendar tráfego pago como reflexo automático.
- Inventar problema ou implicação que não saiu na transcrição.
- Número de investimento solto, sem o retorno esperado.
- Análise genérica que serviria pra qualquer negócio — a graça é ser cirúrgico no caso dele.
- Tom corporativo. Segue o tom da Nexo definido em `_memoria/preferencias.md`.
