---
name: r2
description: >
  Prepara e conduz a R2 — a segunda reunião, onde a Nexo apresenta a APN e fecha. Pega o
  diagnóstico da R1 e a APN e monta o roteiro da call: reconexão, confirmação da dor antes do
  preço, apresentação do plano, ancoragem do investimento, antecipação das objeções típicas de
  dono de negócio local (tá caro, preciso pensar, vou fazer eu mesmo) e fechamento que sai com
  um próximo passo concreto. Segue a lógica SPIN: demonstrar capacidade + obter compromisso.
  Depois da R2, também analisa a transcrição pra dizer se fechou e o que fazer no follow-up.
  Use quando o usuário disser "prepara a R2", "vou apresentar a proposta", "roteiro da R2",
  "como conduzo a segunda reunião", "analisa a R2", colar a transcrição da R2, ou /r2.
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

---

## MODO 1 — Preparar a R2

### Roteiro da call

**1. Reconexão (2 min)**
Rapport rápido + uma ponte com a R1: "Pensei bastante no que você me falou semana passada."
Mostra que a conversa anterior não caiu no vácuo.

**2. Recap da dor + need-payoff (o passo que mais importa)**
Devolver as dores da R1 nas palavras dele e fazê-lo confirmar e dimensionar:
- "Você me disse que perde umas 10 mensagens por dia sem responder. Isso ainda tá rolando?"
- "Se metade dessas virasse cliente, quanto seria no mês?"
Aqui ele se vende sozinho. Só seguir pro plano quando a dor estiver quente e dimensionada.

**3. Apresentar o plano (a APN)**
Item por item, cada solução amarrada a uma dor confirmada. Liderar com a rota enxuta. Não ler a
proposta inteira — conduzir, deixar ele reagir, perguntar "faz sentido?" a cada bloco.

**4. Apresentar o investimento**
Só agora. Ancorar contra o custo do problema que ele acabou de dimensionar: "o problema hoje tá
te custando ~R$ 2.000/mês; o começo enxuto é R$ 500." O preço vem depois do valor, sempre.

**5. Antecipar objeções**
Ver a seção abaixo. As objeções de dono de negócio local são previsíveis — chegar com elas
mapeadas a partir do que ele sinalizou na R1.

**6. Fechar**
Pedir o compromisso de forma direta e sem medo: "Topa começar?" Se sim, já alinhar o próximo
passo (primeiro entregável, prazo, como funciona o pagamento). Se travar, ver objeções — mas
sair com data marcada pra decisão. Nunca um "depois a gente vê".

### Objeções típicas (dono de negócio local) e como responder

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
