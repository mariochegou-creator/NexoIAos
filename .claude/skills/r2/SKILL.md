---
name: r2
description: >
  Prepara e conduz a R2 — a segunda reunião, onde a Nexo apresenta a proposta e fecha. Segue a
  metodologia de closer em Pits: diagnóstico escrito em tempo real, checklist de objeções
  (dinheiro, decisor, urgência) sondado antes da apresentação, Pit 1 de autocomprometimento
  (escala 0-10 + "por que não menos"), extração de investimento sem revelar preço, Pit 2 de
  apresentação amarrada às dores específicas do cliente com tier único de preço, e fechamento
  tratado como consequência natural, não pressão. Depois da R2, também analisa a transcrição
  pra dizer se fechou e o que fazer no follow-up. Use quando o usuário disser "prepara a R2",
  "vou apresentar a proposta", "roteiro da R2", "como conduzo a segunda reunião", "analisa a
  R2", colar a transcrição da R2, ou /r2.
---

# /r2 — Apresentação da proposta e fechamento

Skill de fechamento da Nexo. A R1 levantou a dor, a APN virou proposta — a R2 é onde o dinheiro
entra. Funciona em dois modos: **preparar** a R2 (antes) e **analisar** a R2 (depois).

No SPIN, a R2 cobre as duas últimas etapas: demonstrar capacidade (ligar a solução às dores já
confirmadas) e obter compromisso (fechar com um próximo passo real).

## Dependências

- **APN:** a saída da skill `/apn` (a proposta personalizada).
- **Diagnóstico da R1:** a saída de `/r1` (dores, implicações, sinais de orçamento).
- **Contexto e tom:** `_memoria/empresa.md`, `_memoria/preferencias.md`.

---

## Regra de ouro do fechamento (SPIN)

1. **Need-payoff antes do preço.** Antes de falar valor, fazer o dono dizer em voz alta o que
   muda se a dor sumir. "Se a terça e a quarta enchessem, o que isso mudava pra você?" Quem
   verbaliza o ganho compra o preço sem susto. Apresentar preço antes disso é furar o próprio pé.
2. **Demonstrar capacidade, não despejar feature.** Cada item do plano se liga a uma dor que ele
   já confirmou. Não é "a gente faz isso, isso e isso" — é "pra resolver aquilo que você falou,
   a gente faz isso".
3. **Sair com um compromisso, nunca com um 'continuação'.** Rackham classifica o fim de toda
   reunião em quatro: pedido (fechou), avanço (próximo passo concreto e datado), continuação
   (um "vou pensar" vago, que é quase um não) e não-venda. A R2 tem que sair com pedido ou
   avanço. "Vou pensar e te falo" sem data é continuação — não aceitar isso como resultado.
4. **Ticket alto não fecha no gatilho de B2C.** Escassez artificial ("só até amanhã", "última
   vaga", contador regressivo, desconto-relâmpago) é ferramenta de venda de impulso, pra
   decisão de segundos. Negociação de ticket alto com dono de negócio é decisão racional,
   ponderada, muitas vezes com terceiro envolvido — o gatilho de urgência artificial soa
   amador e queima a credibilidade construída até ali. **Isso é regra, não sugestão**: é o erro
   mais comum nas calls de ticket mais alto — reforçar antes de qualquer fechamento. A urgência
   certa aqui vem do custo do problema (implicação já quantificada), nunca de prazo inventado.

---

## MODO 1 — Preparar a R2

A R2 segue a lógica de **Pits** (metodologia de closer): diagnóstico escrito → autocomprometimento
→ extração de investimento → apresentação amarrada → fechamento como consequência. Cada Pit só
começa quando o anterior foi completado de verdade — pular etapa pra "ganhar tempo" é o jeito
mais comum de perder a venda.

### Regra transversal — diagnóstico escrito

Da reconexão até a apresentação, **registrar por escrito, em tempo real, cada resposta relevante
do cliente** — número, prazo, frase literal, quem mais decide. Não confiar em retenção verbal.
Manter esse registro num doc/notas visível e compartilhável durante a call (bloco de notas,
doc simultâneo) — ele é matéria-prima direta pro Pit 2 (amarrar solução à dor, com a ordem de
prioridade que o cliente deu) e pra extração de investimento. Registro incompleto é falha de
execução — sinalizar no MODO 2 se a transcrição mostrar que isso não rolou.

### Roteiro da call

**1. Reconexão (2 min)**
Rapport rápido + uma ponte com a R1: "Pensei bastante no que você me falou semana passada."
Mostra que a conversa anterior não caiu no vácuo.

**2. Diagnóstico ao vivo + checklist de objeções**
Devolver as dores da R1 nas palavras dele e fazê-lo confirmar e dimensionar — igual antes:
- "Você me disse que perde umas 10 mensagens por dia sem responder. Isso ainda tá rolando?"
- "Se metade dessas virasse cliente, quanto seria no mês?"

No mesmo bloco, **sondar agora as objeções que normalmente só aparecem no fim** — antecipar,
não esperar:
- **Dinheiro/forma de pagamento:** "Se fizer sentido pra você, como prefere que funcione o
  pagamento — à vista, parcelado, mensal?"
- **Decisor(es) envolvido(s):** "Além de você, mais alguém participa dessa decisão? Sócio,
  esposa/marido?" — se sim, avaliar se dá pra incluir na call ou já preparar material pra ele
  levar.
- **Urgência real vs "vou pensar":** "Isso é algo que você quer resolver agora ou é mais uma
  ideia pra frente?" — a resposta aqui já entrega se um "vou pensar" mais tarde vai ser
  objeção real ou cortina de fumaça.

Registrar cada resposta (diagnóstico escrito). Só seguir pro Pit 1 quando a dor estiver quente,
dimensionada, e as três objeções acima já tiverem sido tocadas.

**3. Pit 1 — Autocomprometimento antes do preço (obrigatória, não pular)**
Antes de qualquer apresentação de solução ou preço:
- "De 0 a 10, o quanto você quer resolver isso?"
- **Sempre em seguida, sem exceção:** "Por que [número que ele disse] e não menos?"

A segunda pergunta é o que importa — força o cliente a justificar o próprio compromisso com as
próprias palavras. Um "8" sem justificativa não vale nada; um "8 porque isso já me custou dois
clientes esse mês" é o cliente se vendendo pra ele mesmo. Registrar a resposta literal. Não
seguir em frente sem ela — se ele patinar, reformular a pergunta, mas não abrir mão dela.

**4. Extração de investimento (sem revelar preço)**
Nunca perguntar do ponto de vista do cliente ("quanto custa", "qual o valor"). Sempre do ponto
de vista do investimento dele: **"quanto você se programou pra investir nisso?"**

Se ele desviar ou não responder direto, insistir com educação — até 2-3 tentativas com ângulos
diferentes antes de desistir:
1. "Quanto você se programou pra investir nisso?"
2. Se desviar: "Entendo, mas me ajuda a não te trazer uma proposta fora da sua realidade —
   pensando num investimento mensal, isso ficaria mais perto de quanto?"
3. Se ainda desviar: "Sem problema te dar um número exato — mas me dá uma faixa? Abaixo de X,
   entre X e Y, ou acima de Y?"

O objetivo é sair com um número real ou uma faixa — não seguir pro Pit 2 sem isso. **Esse valor
decide qual proposta é apresentada.** Nunca mostrar múltiplas opções de preço pro cliente
escolher — apresentar só a compatível com o que ele revelou (ver `/apn`, tier único por
orçamento revelado).

**5. Pit 2 — Apresentação amarrada ao diagnóstico**
**Proibido apresentar lista genérica de entregáveis/funcionalidades.** A instrução é:
reapresentar as dores específicas que ele verbalizou — nas palavras dele, puxando do registro
escrito — **na mesma ordem de prioridade que ele mesmo deu**, e conectar cada parte da solução
a uma dor específica já dita por ele. Não é "a gente faz isso, isso e isso" — é "pra resolver
aquilo que você falou, a gente faz isso". Não ler a proposta inteira — conduzir, deixar ele
reagir, perguntar "faz sentido?" a cada bloco. O preço entra aqui como **tier único** (o valor
extraído no passo 4), ancorado contra o custo do problema: "o problema hoje tá te custando
~R$ 2.000/mês; o investimento é R$ [valor compatível com o que ele revelou]."

**6. Fechamento como consequência, não pressão**
Se o diagnóstico, o Pit 1 e a extração foram bem executados, o cliente já se comprometeu com a
própria voz antes de ver preço — o fechamento aqui é etapa leve, quase natural, não um momento
de pressão. Pedir o compromisso de forma direta: "Topa começar?" Se sim, alinhar o próximo
passo (primeiro entregável, prazo, pagamento). **Se travar, o problema normalmente está lá
atrás** — Pit 1 sem justificativa forte ou extração de investimento incompleta — não compensar
isso com gatilho de pressão no fechamento. Sempre sair com data marcada pra decisão. Nunca um
"depois a gente vê".

### Objeções típicas (dono de negócio local) e como responder

> Usar esta seção pra objeções que aparecerem **fora** do checklist do passo 2 (ali já se
> antecipa dinheiro, decisor e urgência) ou que voltarem com mais força no Pit 2/fechamento.
> Responder sempre re-acendendo a implicação que ele mesmo confirmou — não com pressão.

**"Tá caro / não tenho esse dinheiro agora"**
Voltar pro custo do problema e oferecer a rota enxuta como entrada: "Entendo. Por isso o começo
é enxuto, R$ [x] — e o problema hoje já tá te custando mais que isso parado. Dá pra começar
pequeno e crescer quando der resultado."

**"Preciso pensar / falar com meu sócio (ou esposa)"**
Legítimo, mas não deixar virar continuação: "Faz sentido. O que especificamente você quer
pensar — o investimento ou se vai funcionar pro seu caso?" Resolver a dúvida real ali, e marcar
data: "Te ligo quinta pra fechar?"

**"Vou tentar fazer eu mesmo"**
Sem desmerecer: "Dá pra fazer. A pergunta é se você tem o tempo — você mesmo me disse que já
não dá conta de [tarefa que ele citou]. O que a Nexo entrega é isso sair da sua cabeça."

**"Já tentei marketing antes e não deu certo"**
Separar a Nexo do que ele tentou: "O que você tentou antes? [ouvir] Faz sentido não ter dado —
[motivo]. O começo que tô propondo é diferente porque [rota enxuta, mensurável, sem queimar
verba em tráfego]."

**"Não tenho tempo pra isso agora"**
"Justamente — o plano é pra tirar trabalho de você, não adicionar. Da sua parte é [X mínimo], o
resto é com a gente."

---

## MODO 2 — Analisar a R2 (depois da call)

Quando o usuário colar a transcrição da R2:

1. **Resultado:** fechou (pedido), avançou (próximo passo datado), ficou em continuação (vago),
   ou foi não-venda? Dizer com clareza, sem dourar.
2. **Objeções que apareceram:** listar e avaliar como foram (ou não) tratadas.
3. **Sinais de compra que passaram batido:** momentos em que ele demonstrou interesse e a Nexo
   não avançou pro fechamento.
4. **Próximo passo:** se fechou, o que alinhar pra começar. Se não, a ação concreta de
   follow-up — com a mensagem pronta, se for o caso (chamar a skill de e-mail/mensagem).
5. **Gatilho de B2C em ticket alto:** checar se apareceu escassez artificial (prazo inventado,
   desconto-relâmpago, "só até amanhã") em vez de urgência real ancorada no custo do problema.
   Se apareceu, marcar como ponto de coaching — é o erro mais comum nesse tipo de negociação.

### Checklist de execução dos Pits (Igor Melo)

Passar a transcrição por este checklist objetivo antes de dar o veredito de coaching:

- **Diagnóstico escrito:** dá pra perceber, pelas perguntas feitas depois, que o vendedor
  guardou dados específicos da conversa (números, nomes, prazos)? Se as perguntas do Pit 2
  soaram genéricas, é sinal de que o registro não rolou.
- **Checklist de objeções no diagnóstico:** dinheiro/pagamento, decisor(es) e urgência real
  foram sondados **antes** do Pit 2, ou só surgiram como objeção reativa no fechamento?
- **Pit 1 aconteceu?** A pergunta de escala (0-10) apareceu? E o "por que [número] e não
  menos?" veio **logo em seguida**, sem pular? Se a escala apareceu sem o "por quê", marcar
  como Pit 1 incompleto — a pergunta que importa é a segunda.
- **Extração de investimento:** o vendedor perguntou "quanto você se programou pra investir"
  (não "quanto custa" do ponto de vista do cliente)? Se o cliente desviou, teve insistência
  educada (2-3 tentativas) ou o vendedor desistiu na primeira?
- **Tier único:** foi apresentado só um valor de investimento, compatível com o que foi
  extraído? Ou o vendedor despejou um cardápio de opções de preço?
- **Pit 2 amarrado:** a apresentação reapresentou as dores específicas do cliente na ordem que
  ele priorizou, ou foi lista genérica de entregáveis?
- **Fechamento como consequência:** o fechamento saiu natural (resultado de Pit 1 + extração
  bem feitos) ou dependeu de pressão porque as etapas anteriores ficaram fracas?

---

## O que evitar

- Falar preço antes do need-payoff.
- Despejar a APN inteira sem deixar ele reagir.
- Dar desconto no reflexo do primeiro "tá caro" — primeiro re-ancorar no custo do problema.
- Aceitar "vou pensar" sem data de retorno.
- Liderar com a rota cara.
- Sair da R2 sem pedido nem avanço.
- Tom de vendedor insistente. O fechamento da Nexo é consultivo: a dor dele faz a venda, não a
  pressão.
- Usar gatilho de escassez artificial (contador, "última vaga", desconto-relâmpago) em
  negociação de ticket alto — soa amador e queima credibilidade. Urgência vem do custo do
  problema, não de prazo inventado.
- Pular o Pit 1 (escala 0-10 + "por que não menos") e ir direto pra apresentação.
- Perguntar "quanto custa" do ponto de vista do cliente em vez de "quanto você se programou pra
  investir".
- Desistir da extração de investimento na primeira resposta evasiva, sem insistir com ângulos
  diferentes.
- Apresentar mais de um valor de investimento pro cliente escolher — tier único, sempre.
- Apresentação genérica de entregáveis no Pit 2, sem amarrar a uma dor específica que o cliente
  disse, na ordem que ele priorizou.
- Depender de gatilho de pressão no fechamento pra compensar diagnóstico ou Pit 1 malfeitos.
- Conduzir a call sem registrar por escrito as respostas do cliente em tempo real.
