---
name: follow-up
description: >
  Gera a mensagem de follow-up certa para cada situação após uma reunião (R1 ou R2) que não
  fechou no momento. Calibra o tom e o conteúdo pelo tipo de objeção que ficou na mesa: preço,
  tempo, decisão com terceiro, ceticismo, ou simplesmente sumiu. Nunca é pressão — é reacender
  a implicação que o próprio cliente confirmou. Entrega a mensagem pronta pra WhatsApp ou
  e-mail, com sugestão de prazo de envio.
  Use quando o usuário disser "manda follow-up pra [cliente]", "não fechou, o que faço",
  "sumiu depois da R2", "como retomo contato", "mensagem de follow-up", ou /follow-up.
---

# /follow-up — Mensagem de retomada pós-reunião

Skill que transforma "ficou no ar" em próximo passo concreto. A R1 ou a R2 aconteceu, mas o
cliente não fechou — essa skill monta a mensagem certa pra cada situação, no tom da Nexo.

O princípio é simples: **não pressionar, reacender**. A mensagem lembra o problema que ele
mesmo descreveu, não o produto que a Nexo quer vender.

## Dependências

- **Tom de voz:** `_memoria/preferencias.md`
- **Diagnóstico da R1 e/ou APN:** se existirem, usar os dados reais do cliente
- **Contexto da reunião:** o usuário informa o que ficou na mesa

---

## Workflow

### Passo 1 — Entender a situação (perguntar se não estiver claro)

1. Qual reunião aconteceu — R1 ou R2?
2. Qual foi o desfecho — objeção específica, ficou de pensar, sumiu, ou outro?
3. Quanto tempo faz desde a reunião?
4. Tem algum dado do cliente (problema central, número que ele citou)?

### Passo 2 — Identificar o tipo de situação

- **Objeção de preço:** disse que estava caro ou sem verba agora
- **Objeção de tempo:** disse que não tem tempo pra tocar isso agora
- **Objeção de terceiro:** precisa falar com sócio, esposa, ou "ver com alguém"
- **Ceticismo:** já tentou antes e não deu certo / não acredita que vai funcionar
- **Sumiu:** respondeu, mostrou interesse, e parou de responder

### Passo 3 — Montar a mensagem

Seguir o modelo do tipo identificado (ver abaixo). Personalizar com os dados reais do cliente.
Entregar pronto pra copiar e colar.

---

## Modelos por tipo de situação

### Preço / sem verba agora
```
Oi [Nome], tudo bem?

Fiquei pensando na nossa conversa. Você falou que [problema que ele citou] — e isso ainda
deve estar pesando.

O começo que propus cobre exatamente isso, por [valor enxuto]. É menos do que [referência
do custo do problema que ele mesmo disse].

Se quiser, a gente pode começar só com [a parte mais urgente] e ampliar depois. Fica a ideia.

Quando faz sentido a gente retomar?
```
*Prazo sugerido pra enviar: 3 a 5 dias após a reunião.*

---

### Tempo / não dá conta agora
```
Oi [Nome],

Entendo que a agenda tá cheia — você mesmo falou que [tarefa que ele citou] já toma muito
tempo.

Por isso o que proponho é diferente: da sua parte é só [X mínimo]. O resto fica com a gente.

Se quiser, posso mandar um resumo de como funciona a primeira semana — pra você ver o quanto
(ou pouco) envolve.
```
*Prazo sugerido: 4 a 7 dias após a reunião.*

---

### Terceiro (sócio, esposa, etc.)
```
Oi [Nome],

Fica tranquilo, faz sentido alinhar com [sócio/esposa/outro].

Se ajudar, posso mandar um resumo por escrito do que ficou combinado — mais fácil pra
explicar. Ou se preferirem, a gente faz uma call rápida de 15 minutos com quem precisar.

O que funciona melhor pra vocês?
```
*Prazo sugerido: 2 a 3 dias após a reunião.*

---

### Ceticismo / "já tentei antes"
```
Oi [Nome],

Pensei no que você falou — que [tentativa anterior] não deu o resultado esperado.

Faz sentido o ceticismo. O que proponho é diferente porque não começa com [o que não
funcionou antes]. Começa com [rota enxuta, sem o risco que ele teve].

Se quiser, a gente testa uma coisa pequena primeiro e você vê na prática antes de qualquer
compromisso maior.
```
*Prazo sugerido: 3 a 5 dias após a reunião.*

---

### Sumiu (sem resposta)
```
Oi [Nome], tudo certo?

Só passando pra ver se ficou alguma dúvida da nossa conversa. Fico à disposição pra responder
por aqui mesmo, sem cerimônia.

[Se tiver um dado novo ou gatilho] — [mencionar de forma natural, ex: "vi que [concorrente] 
tá abrindo na região, o que você falou faz ainda mais sentido agora"].
```
*Prazo sugerido: 5 a 7 dias sem resposta. Se sumir de novo, uma última mensagem em 14 dias.*

---

## Regras de tom

- Nunca parecer desesperado ou em pressão de meta.
- Nunca repetir o pitch da proposta inteira. Uma linha, um gancho.
- Sempre fechar com uma pergunta aberta ou proposta de próximo passo — nunca com "fico no
  aguardo" ou "qualquer coisa estou aqui".
- Adaptar o nível de formalidade ao que o cliente usou na reunião.
- Seguir `_memoria/preferencias.md` pro tom da Nexo.

## O que evitar

- Mensagem genérica de "dando um follow-up" sem conteúdo real.
- Repetir o preço sem reancorá-lo no problema.
- Mandar mais de 3 tentativas sem resposta — depois disso, encerrar o ciclo com elegância.
- Tom de cobrança ou pressão de tempo artificial ("última chance", "promoção acaba hoje").
