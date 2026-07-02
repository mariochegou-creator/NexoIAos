---
name: r1
description: >
  Analisa a transcrição da R1 (primeira reunião / call de diagnóstico) usando SPIN Selling com
  critérios objetivos de execução por etapa — não só conceito. Situação tem teto de tempo e
  corte no indispensável; Problema usa formato comparativo (dado × meta) em vez de pergunta
  genérica; Implicação exige quantificação em R$ (gap × ticket médio × meses), critério de
  urgência e checkpoint de autoridade antes de implicar; Necessidade contrasta cenário atual x
  ideal em vez de listar benefícios. Pra cada problema levantado, entrega DUAS rotas: a enxuta
  (custo baixo ou zero, que já entrega resultado) e a robusta (com investimento, só quando for
  o caso), calibrada pra cidade pequena e negócio com pouca verba pra ferramenta e tráfego
  pago. Fecha com coaching objetivo da própria R1 e um resumo pronto pra virar proposta (a
  ordem de prioridade que o cliente deu aos problemas alimenta direto o /apn).
  Use quando o usuário disser "analisa a R1", "transcrição da reunião", "joguei a call",
  "diagnóstico da reunião", "analisa essa call de venda", colar uma transcrição de reunião,
  ou /r1.
---

# /r1 — Diagnóstico SPIN da primeira reunião

Skill central de vendas da Nexo IA. Pega a transcrição da R1 (reunião 1, a call de descoberta
com o lead) e transforma em documento de trabalho: o que dói no negócio dele, quanto isso
custa, e exatamente o que a Nexo entrega pra resolver — em duas faixas de investimento.

O objetivo é sair da R1 com clareza total pra montar a proposta (`/apn`) e conduzir o
fechamento (`/r2`).

## Dependências

- **Contexto do negócio (Nexo IA):** `_memoria/empresa.md` — o que a Nexo oferece, pra mapear
  cada solução ao que a gente de fato entrega.
- **Tom de voz:** `_memoria/preferencias.md`.
- **Transcrição da R1:** colada pelo usuário ou em arquivo (.txt, .md, CSV de transcrição).

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

## O método SPIN — critérios objetivos por etapa

A transcrição é lida através das quatro lentes do SPIN. **O fluxo S→P→I→N não é roteiro fixo
nem checklist decorado** — cada pergunta boa nasce da resposta anterior do cliente. Se, ao
montar as perguntas-modelo do coaching (Passo 4), só der pra generalizar porque o dado real do
cliente não apareceu na transcrição, isso é lacuna a apontar — não a preencher com template.

Regra de ouro do SPIN: **não apresentar solução antes de ter desenvolvido implicação.** Se a
R1 pulou direto da dor pra "e aí, quanto custa?", a implicação ficou na mesa — vira ponto de
coaching no fim.

### S — Situação

Os fatos do negócio: o que ele tem hoje (canais, movimento, estrutura, como atende, como
capta). Contexto, não problema.

- **Regra de tempo:** máximo 10 minutos da call. Sem como medir tempo pela transcrição, usar
  como proxy no máximo 5-6 perguntas de situação. Se a R1 passou disso, sinalizar
  explicitamente no Passo 4 com aviso do tipo "⚠️ Situação se estendeu além do necessário —
  N perguntas, quando M já abriam o Problema."
- **Critério de corte:** só é indispensável o que abre o Problema — um número mensurável
  (movimento, ticket médio, taxa de conversão, o que for) e a meta que ele tem em mente. Dado
  de curiosidade (história da empresa, quantos funcionários tem, etc.) não conta como situação
  útil, a menos que abra um problema direto.
- **Perguntas-modelo:**
  - "Hoje quantos [clientes/mensagens/agendamentos] vocês fecham por [semana/mês]?"
  - "Qual é a meta que vocês tinham em mente quando decidiram procurar isso?"
  - "Como funciona hoje o caminho do cliente até fechar com vocês?"

### P — Problema

As dores explícitas. A pergunta que puxa o problema **não pode ser genérica** ("quais desafios
vocês têm?", "o que anda incomodando?"). Ela precisa usar o número coletado na Situação e
forçar o dono a comparar ele mesmo o atual vs a meta — o gap tem que sair da boca dele.

- **Formato obrigatório:** "Com [dado da situação], dá pra você chegar em [meta declarada]?"
- **Exemplo:** situação = "fecho 15 clientes/mês", meta = "25/mês" → "Com esses 15 fechando do
  jeito que tá hoje, dá pra você chegar nos 25 que você quer?"
- **Critério de validação:** se a pergunta de problema não referenciar nenhum dado numérico da
  Situação, ela conta como genérica — mesmo que tenha gerado uma resposta boa (a resposta saiu
  por sorte, não por técnica; vira ponto de coaching).

### I — Implicação (a etapa mais importante — historicamente a mais fraca nas R1s da Nexo)

A consequência da dor. O que o problema causa em cascata — perda de faturamento, cliente que
vai pro concorrente, sócio sobrecarregado. Aqui a dor vira urgência. Tratar com rigor, não como
formalidade antes do preço.

1. **Quantificação obrigatória.** Todo problema confirmado precisa ser traduzido em R$:

   ```
   gap (meta − atual) × ticket médio × meses que o problema já dura
   = quanto já foi perdido / quanto tá perdendo por mês
   ```

   Se a call não trouxe ticket médio ou há quanto tempo o problema existe, isso é lacuna a
   apontar no Passo 4 — nunca inventar o número pra fechar a conta.

2. **Critério de urgência.** A pergunta de implicação precisa tirar o problema do "desconforto
   distante" e colocar no "custo presente". Não pode ficar abstrata ("isso te incomoda?") —
   tem que chegar em "isso já custou X" ou "isso tá custando X por mês".

3. **Não pode ser pergunta decorada.** Sempre referencia literalmente uma resposta anterior do
   próprio cliente — o número, o prazo, a frase que ele usou — nunca um template solto. No
   coaching (Passo 4), toda pergunta de implicação sugerida cita um dado real da conversa. Sem
   dado real pra citar, o problema não está pronto pra virar pergunta de implicação — falta
   desenvolver Situação/Problema antes.

4. **Checkpoint de autoridade.** Implicação só funciona depois que autoridade/confiança já foi
   estabelecida (rapport, alguma prova de que a Nexo entende do assunto). Se a R1 tentou
   implicar cedo demais, sem credibilidade mostrada antes, o coaching não sugere "faça essa
   pergunta" — sugere "volte e reforce rapport/prova social antes de implicar".

- **Perguntas-modelo (formato — sempre adaptar ao dado real da conversa):**
  - "Você disse que perde [X] por [período] — se isso continuar até o fim do ano, quanto isso
    já vai ter custado?"
  - "Isso [problema, nas palavras dele] já te fez perder algum cliente pro concorrente? Lembra
    quem foi?"
  - "Faz [tempo que ele mencionou] que isso tá rolando. Sem resolver, esse número só cresce,
    certo?"

### N — Necessidade explícita (need-payoff)

Não é lista de benefícios racionais ("você vai ter mais clientes", "vai ficar mais
organizado"). É **contraste de dois cenários**:

- **(a) O que acontece se nada mudar** — puxa direto a implicação negativa já confirmada.
- **(b) Uma projeção vívida do resultado ideal** — visual, específica, a cena que ele imagina
  vivendo, não uma lista de vantagens.

- **Perguntas-modelo:**
  - "Se isso continuar do jeito que tá, onde você acha que seu negócio vai estar daqui 6
    meses?" (cenário a)
  - "E se a terça e a quarta enchessem igual o sábado — como seria seu dia? O que você faria
    com esse tempo/dinheiro a mais?" (cenário b, vívido)

O momento em que o dono articula esse valor com a própria voz ("se eu conseguisse encher as
terças seria outro jogo") é o sinal verde de venda.

---

## Workflow

### Passo 1 — Ler o contexto

Ler `_memoria/empresa.md` pra saber o que a Nexo entrega (criação de conteúdo, presença no
Google, atendimento, etc.) e `_memoria/preferencias.md` pro tom. Não confirmar a leitura, só
usar.

### Passo 2 — Mapear a transcrição no SPIN

Varrer a transcrição e separar:

- **Situação:** o(s) número(s) mensurável(is) e a meta declarada (o mínimo indispensável pra
  abrir o Problema), mais 2-3 fatos de contexto se relevantes. Contar quantas perguntas de
  situação foram feitas — se passou de 5-6, ou o tempo nitidamente estourou 10 minutos, marcar
  pra sinalizar no Passo 4.
- **Problemas:** lista numerada **na ordem de prioridade do dono, não na ordem cronológica da
  call** — se ele disse explicitamente qual dói mais ("o que mais pesa é..."), usar essa
  ordem; sem isso, usar como proxy o problema que ele repetiu mais vezes ou trouxe com mais
  carga/urgência na fala. Essa ordem alimenta direto o `/apn` (empilhamento) e o Pit 2 do
  `/r2`. De preferência nas palavras do próprio dono (paráfrase curta ou trecho real entre
  aspas). Marcar quais perguntas de problema usaram o formato comparativo (dado → meta) e
  quais foram genéricas.
- **Implicações desenvolvidas:** quais dores tiveram a consequência **quantificada em R$**
  (gap × ticket médio × meses), quais tiveram implicação levantada mas sem quantificar, e
  quais ficaram sem desenvolver (tudo isso vira coaching no Passo 4).
- **Necessidade explícita:** os momentos em que o dono projetou o cenário ideal com a própria
  voz — não apenas confirmou interesse.

Se a transcrição estiver confusa ou faltando partes, sinalizar o que dá e o que não dá pra
extrair — sem preencher buraco com suposição.

### Passo 3 — Montar o bloco cirúrgico de cada problema

Pra **cada** problema levantado (na ordem de prioridade do Passo 2), montar um bloco com esta
estrutura exata:

- **O que ele disse** — trecho ou paráfrase curta.
- **Custo real (implicação)** — aplicar a fórmula `gap × ticket médio × meses do problema` e
  mostrar o número em R$. Se algum componente não saiu na call (ticket médio, tempo do
  problema), dizer explicitamente qual falta — não estimar o resultado final como se fosse
  medido ("provável que esteja custando X, mas ticket médio não foi levantado na R1" é o
  formato certo; nunca inventar o R$ final). Se a implicação nem foi tocada, marcar como "não
  desenvolvida" e checar o checkpoint de autoridade.
- **Solução enxuta** — o que fazer com custo baixo ou zero, qual ferramenta, e o que a Nexo
  entrega nisso. É a rota padrão.
- **Solução com investimento** *(só se fizer sentido)* — o que é, **quando vale a pena**,
  faixa de custo estimada e o retorno esperado. Se o problema se resolve 100% na rota enxuta,
  dizer explicitamente "não precisa investir nisso agora".
- **Recomendação pra esse cliente** — qual das duas puxar, lendo os sinais de orçamento da
  própria R1. Não empurrar a robusta por empurrar.

Consultar a **Biblioteca de soluções** (abaixo) como base, adaptando ao caso.

### Passo 4 — Coaching da R1

Avaliar a própria conduta da reunião contra os critérios objetivos de cada etapa — não é
opinião solta, é checklist:

- **Situação:** estourou o tempo/número de perguntas? Se sim, ⚠️ explícito com a contagem.
  Teve dado de curiosidade que não abriu problema nenhum?
- **Problema:** as perguntas usaram o formato comparativo (dado → meta) ou foram genéricas?
  Apontar quais e como reformular.
- **Implicação:** cada problema foi quantificado em R$? Faltou algum componente da fórmula?
  A implicação ficou abstrata em vez de virar custo presente? Rodar o checkpoint de
  autoridade: se foi tentada sem rapport/prova estabelecidos antes, a recomendação não é
  "pergunte X", é "reforce credibilidade antes de implicar".
- **Necessidade:** apareceu o contraste dos dois cenários (se nada mudar vs. projeção vívida
  do ideal) ou ficou em lista de benefícios genéricos?

Fechar com **2 a 3 perguntas de implicação ou need-payoff específicas** que faltaram — prontas
pra usar no follow-up ou na próxima call, **cada uma referenciando literalmente um dado real
dito pelo cliente na transcrição** (nunca um template genérico solto).

Exemplo de pergunta de implicação bem feita (não genérica): em vez de "isso te atrapalha?",
algo como "você falou que perde umas 10 mensagens por dia sem responder — se metade dessas
fechasse, quanto seria no mês?".

### Passo 5 — Resumo pronto pra proposta

Fechar com 3 a 5 linhas que sintetizam o caso e já servem de base pra `/apn`: o problema
central (o de maior prioridade), a rota recomendada, e o resultado prometido. Direto, sem
enrolação.

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

> Isto é a leitura interna da R1 (as duas rotas ficam registradas aqui pra referência de
> trabalho). O que é mostrado ao cliente na proposta segue lógica diferente — ver `/apn`
> (empilhamento por prioridade, tier único de preço) e `/r2` (extração de investimento antes
> de revelar qualquer valor).

---

## Formato de saída

```
## R1 — [Nome do negócio] | [data]

### Diagnóstico SPIN
- Situação: [número(s) mensurável(is) + meta declarada + contexto essencial]
  ⚠️ [se estourou tempo/número de perguntas de situação, avisar aqui — senão, omitir a linha]
- Problemas levantados (em ordem de prioridade do dono, explícita ou por proxy):
  1. [o mais prioritário, nas palavras do dono] — pergunta comparativa usada? [sim/não, e qual]
  2. ...
- Implicações desenvolvidas: [quais foram quantificadas em R$, com a conta]
- Implicação incompleta: [problema com implicação levantada mas sem quantificar — o que falta]
- Ficou na mesa: [dores cuja consequência não foi explorada — checar checkpoint de autoridade]
- Contraste de necessidade: [cenário "se nada mudar" x projeção vívida do ideal, quando saiu]

### Soluções por problema

**Problema 1 — [nome curto]**
- O que ele disse: "[trecho/paráfrase]"
- Custo real (R$): [gap × ticket médio × meses — ou o que falta pra calcular]
- Solução enxuta (R$ baixo/zero): [o quê + ferramenta + o que a Nexo entrega]
- Com investimento (se for o caso): [o quê + quando vale + faixa de custo + retorno]
- Recomendação pra esse cliente: [enxuta ou robusta + porquê]

[repetir por problema]

### Leitura de orçamento
[o que a R1 sinalizou sobre quanto ele pode/quer investir]

### Onde a R1 podia ter ido mais fundo
[2-3 perguntas de implicação/need-payoff — cada uma citando um dado real da conversa]

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
- Perguntas de situação além do indispensável (dado de curiosidade que não abre problema).
- Pergunta de problema genérica que não usa o dado numérico da situação.
- Implicação sem quantificar em R$, ou pergunta de implicação decorada/genérica em vez de
  referenciar dado real da conversa.
- Tentar implicação sem checkpoint de autoridade (rapport/prova) estabelecido antes.
- Necessidade apresentada como lista de benefícios em vez de contraste de dois cenários.
- Tratar S→P→I→N como roteiro fixo — cada pergunta nasce da resposta anterior do cliente.
- Listar os problemas na ordem cronológica da call em vez da ordem de prioridade do dono.
