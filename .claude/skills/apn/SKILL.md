---
name: apn
description: >
  Gera a APN — a apresentação de proposta personalizada que a Nexo leva pra R2. Puxa tudo
  que foi levantado do negócio na R1 (diagnóstico, dores nas palavras do dono, números,
  concorrentes, cidade) e monta uma proposta que parece feita exclusivamente pra aquele
  negócio, não um modelo genérico de agência. O plano é empilhado na ordem de prioridade que o
  próprio cliente deu aos problemas — nunca na ordem padrão de pacote da Nexo. O investimento é
  sempre um tier único, compatível com o valor que o cliente revelou no Pit de extração da R2 —
  nunca um cardápio de faixas de preço. Mantém a lógica de cidade pequena e orçamento enxuto:
  recomenda a rota que entrega resultado com o menor investimento possível e só sobe pra rota
  paga quando faz sentido.
  Use quando o usuário disser "monta a APN", "cria a proposta", "gera a apresentação de
  proposta", "faz a proposta do [negócio]", "prepara a APN pra R2", ou /apn.
---

# /apn — Apresentação de Proposta personalizada

Skill que transforma o diagnóstico da R1 numa proposta sob medida. O cliente precisa abrir a
APN e sentir: "isso foi feito pra mim". Esse é o trabalho inteiro dessa skill.

A APN é o que a Nexo apresenta na R2. Quanto mais ela soar exclusiva, mais fácil o fechamento.

## Dependências

- **Diagnóstico da R1:** a saída da skill `/r1` (problemas, implicações, rota
  recomendada). Se não existir, pedir a transcrição da R1 ou os pontos principais antes de
  montar.
- **Diagnóstico/extração da R2, se já rodou:** ordem de prioridade que o cliente deu aos
  problemas e o valor que ele revelou estar disposto a investir (saída do MODO 1/2 de `/r2`).
  Quando disponível, define a ordem do plano e o tier único de preço.
- **Contexto do negócio (Nexo IA):** `_memoria/empresa.md` — o que a Nexo entrega.
- **Tom de voz:** `_memoria/preferencias.md`.
- **Identidade visual:** `identidade/design-guide.md` — pra APN sair na cara da marca caso
  vire deck ou PDF.

---

## A regra que rege essa skill: exclusividade

Uma proposta genérica mata a venda. Uma proposta que devolve as palavras do próprio dono
fecha. O que faz a APN parecer exclusiva:

1. **As palavras dele.** Citar o que o dono falou na R1, literal. "Você me disse que o
   movimento de terça e quarta tá fraco" vale mais que qualquer frase bonita de agência.
2. **Os números dele.** Se ele falou "faço uns 30 cortes por dia" ou "perco umas 10 mensagens
   sem responder", usar esses números na proposta e na conta do retorno.
3. **A realidade dele.** O nome do negócio, a cidade, os concorrentes que ele citou, o canal
   que ele já usa. Nada de exemplo de outro mercado.
4. **Teste de exclusividade:** se uma frase da APN caberia igualzinha na proposta de qualquer
   outro negócio, reescreve ou corta. Toda linha tem que ser daquele cliente.

---

## Princípio de ordenação: empilhamento por prioridade, não por pacote

A APN **não segue a ordem padrão de serviço da Nexo** (ex.: "sempre GMN primeiro, depois
Instagram, depois WhatsApp"). Ela segue a ordem que o próprio cliente estabeleceu — o problema
que ele mais enfatizou, repetiu ou tratou como mais urgente vem primeiro no plano, não o que é
mais fácil de vender pra Nexo.

- **Fonte da prioridade:** o diagnóstico da R1 (`/r1`) e, se já disponível, o registro escrito
  do diagnóstico da R2 (`/r2`) — que captura em tempo real a ordem de importância que o cliente
  deu aos problemas.
- **Sem prioridade explícita:** usar como proxy o problema que voltou mais vezes na conversa ou
  veio com mais carga/urgência na fala dele — nunca a ordem "lógica" de pacote de agência.
- **Teste:** se a ordem do plano faz mais sentido pra Nexo vender do que pro cliente resolver,
  reordenar.

---

## Princípio de investimento: rota enxuta primeiro, tier único na entrega

A Nexo atua em cidade pequena, com negócio de pouca verba. Então:

- A APN **lidera com a rota enxuta** (custo baixo ou zero) que já entrega resultado.
- A rota com investimento aparece como **opção interna**, com o "porquê vale" e o retorno
  esperado — nunca empurrada.
- O preço da Nexo é sempre ancorado **contra o custo do problema**. Se a dor custa R$ 2.000/mês
  em cliente perdido, um serviço de R$ 500 parece barato. A conta tem que estar na proposta.

**Tier único por orçamento revelado.** A APN pode calcular internamente mais de uma faixa de
investimento (enxuta/robusta) como referência de trabalho — mas **o que é mostrado ao cliente
na R2 é sempre uma faixa só**, a compatível com o valor que ele revelou no Pit de extração de
investimento (skill `/r2`). Nunca apresentar um cardápio de preços pro cliente escolher.

- Se o valor revelado (via `/r2`) já está disponível quando a APN é montada: montar a seção de
  Investimento com **um único número**, compatível com esse valor.
- Se a APN é montada antes da extração de investimento acontecer (fluxo comum — APN pronta
  antes da R2): montar os tiers internos normalmente, mas marcar explicitamente na saída que
  são referência interna e que a R2 revela só um, na hora, conforme o Pit de investimento.

---

## Workflow

### Passo 1 — Reunir os insumos

Puxar o diagnóstico da R1 (e da R2, se o diagnóstico/extração já rodou). Conferir se tem:
problemas levantados **na ordem de prioridade que o cliente deu**, implicações (custo de cada
um), números que o dono citou, a rota recomendada (enxuta/robusta) e, se disponível, o valor
que ele revelou estar disposto a investir. Se faltar peça crítica, perguntar antes de montar —
proposta com buraco fica genérica.

### Passo 2 — Montar a APN

Seguir a estrutura abaixo. A ordem importa: a dor dele primeiro **na prioridade que ele deu**,
a solução depois na mesma ordem, o preço só no fim — como tier único se o valor já foi
revelado, como tiers internos sinalizados se ainda não.

### Passo 3 — Calibrar preço e retorno

Pra cada item de investimento, amarrar ao número do dono. Sem número solto. Se ele não deu
número na R1, usar uma estimativa honesta e sinalizada ("estimando pelo que você falou").

### Passo 4 — Checklist final (obrigatório antes de entregar)

Nenhuma APN sai sem os quatro itens abaixo. Conferir um a um antes de considerar a proposta
pronta:

1. **Objetivo explícito.** Logo após a abertura/hero, uma frase clara resumindo o que a
   proposta resolve e o resultado esperado — nunca deixar isso implícito só no diagnóstico.
2. **Validade da proposta.** Próximo à seção de Investimento, com **data específica** (nunca
   "por tempo limitado" ou prazo vago). Se calcular a data (ex: 7 dias a partir de hoje),
   assumir a data de hoje como base. Se houver condição especial (desconto, bônus grátis, item
   incluso sem custo), deixar explícito o que muda depois que o prazo vencer.
3. **CTA final de ação.** Última seção de conteúdo antes do rodapé ("Sobre a Nexo"). Instrução
   direta e de baixo atrito (ex: "responde essa mensagem confirmando"/"me chama no WhatsApp pra
   fechar") — nunca terminar só no cronograma sem um gatilho de ação imediato.
4. **Datas concretas no cronograma**, sempre que a informação existir (ex: se a APN é montada
   sabendo a data de início, usar "até dia X" em vez de "até 7 dias"). Prazo relativo só quando
   não há data de início conhecida.

Se qualquer um dos quatro estiver faltando, completar antes do Passo 5 — não entregar com
buraco.

### Passo 5 — Entregar e oferecer formato

Entregar a APN em texto estruturado. Oferecer renderizar como **deck** (skill pptx) ou **PDF**
(skill pdf) na identidade da marca, se ele for apresentar na tela. Não renderizar sem ele pedir.

---

## Estrutura da APN

**1. Abertura**
Capa com o nome do negócio e uma linha que resume a virada proposta. Ex: "Plano Nexo pra
[Barbearia X] encher as terças e parar de perder cliente no WhatsApp." Específica, não slogan.

**2. Objetivo explícito**
Logo após a abertura, uma frase clara — separada, não escondida no meio do diagnóstico —
resumindo o que a proposta resolve e o resultado esperado. É o "isso aqui existe pra X"
declarado, antes de qualquer detalhe.

**3. O que ouvimos de você**
O recap do diagnóstico nas palavras dele. É a seção mais importante — é o que cria o "isso é
sobre mim". Listar as dores que ele mesmo trouxe na R1, de preferência com trecho real.

**4. O diagnóstico**
Cada dor com sua implicação — o que ela custa em faturamento, cliente ou tempo. Aqui a
proposta mostra que a Nexo entendeu o tamanho do problema, não só a superfície.

**5. O plano**
A solução mapeada problema a problema, **na mesma ordem de prioridade que o cliente
estabeleceu** — nunca na ordem padrão de pacote de serviço da Nexo. Pra cada dor, o que a Nexo
faz. Concreto: "configurar e otimizar seu Google Meu Negócio + campanha de avaliações com seus
clientes atuais", não "melhorar sua presença digital". Liderar com a rota enxuta; marcar onde
existe a opção robusta.

**6. Resultados esperados**
O que muda, amarrado à realidade dele e aos números que ele deu. Honesto — sem prometer
milagre. "Mais buscas no Google e mensagens organizadas" é melhor que "triplique seu
faturamento".

**7. Investimento**
O preço, ancorado contra o custo do problema (da seção 4). Se o valor revelado no Pit de
extração (`/r2`) já está disponível: **um preço só**, compatível com o que ele indicou.
Se ainda não foi extraído: montar os tiers internos (enxuto/robusto) sinalizados como
referência de trabalho — a R2 revela um só, na hora, conforme o que o cliente disser no Pit
de investimento. Nunca entregar ao cliente uma lista de opções de preço pra ele escolher.
Logo abaixo do preço, incluir a **validade da proposta com data específica** (nunca "por tempo
limitado") — e, se houver bônus grátis ou desconto condicionado ao prazo, dizer explicitamente
o que muda depois que a data passar.

**8. Como começamos**
O próximo passo concreto: o que acontece se ele topar hoje, prazo do primeiro entregável, como
funciona. Tira a fricção do "e agora?". Usar **data concreta** ("até dia X") sempre que a data
de início for conhecida — prazo relativo ("até 7 dias") só quando não der pra cravar a data.

**9. Chamada pra ação**
Última seção de conteúdo antes do rodapé. Uma instrução direta e de baixo atrito pro cliente
agir agora — "responde confirmando", "me chama no WhatsApp pra fechar". Nunca terminar a
proposta só no cronograma, sem esse gatilho explícito.

**10. Sobre a Nexo**
Curto, no fim. Prova, não pitch — a Nexo presta serviço pra negócio local, de conteúdo até
aumento de faturamento. Uma ou duas linhas. O foco da APN é ele, não a gente.

---

## Formato de saída

```
# APN — [Nome do negócio]

## [linha de abertura específica do caso]

### Objetivo
[frase clara e separada — o que essa proposta resolve e o resultado esperado]

### O que ouvimos de você
[ordem de prioridade dada pelo cliente, não a ordem cronológica da call]
- "[dor 1, a mais prioritária, nas palavras do dono]"
- "[dor 2, nas palavras do dono]"
- ...

### Diagnóstico
- [Dor 1] — custa [implicação em R$/cliente/tempo]
- [Dor 2] — custa [...]

### O plano
[mesma ordem de prioridade da seção anterior — nunca a ordem padrão de pacote]
- Pra [dor 1]: [o que a Nexo faz — rota enxuta] · (opção: [rota robusta, se houver])
- Pra [dor 2]: [...]

### Resultados esperados
[o que muda, com os números dele]

### Investimento
[SE o valor revelado no Pit de investimento (/r2) já está disponível:]
- Investimento: R$ [x] — [o que entrega, ancorado no custo do problema ~R$ [z]/mês]

[SE ainda não foi extraído — tiers de referência interna, NÃO entregar como cardápio ao cliente:]
⚠️ Tiers internos (uso da Nexo — na R2, revelar só o compatível com o valor extraído no Pit de
investimento; não mostrar esta lista ao cliente):
- Enxuto: R$ [x] — [o que entrega]
- Robusto: R$ [y] — [o que entrega + porquê vale]
- Pra referência: o problema hoje custa ~R$ [z]/mês

**Validade da proposta:** até [data específica, ex: 09 de julho de 2026]. [Se houver bônus/
desconto condicionado: "Depois dessa data, [o que muda — ex: o item X volta a ter custo de
R$ y]."]

### Como começamos
[próximo passo concreto, com data concreta quando souber a data de início — ex: "até dia X" —
prazo relativo só quando a data de início não é conhecida]

### Chamada pra ação
[instrução direta e de baixo atrito pro cliente agir agora — ex: "responde confirmando" ou
"chama no WhatsApp pra fechar"]

### Sobre a Nexo
[1-2 linhas — prova, não pitch]
```

---

## O que evitar

- Qualquer frase que caberia na proposta de outro negócio (falha no teste de exclusividade).
- Jargão de agência ("soluções 360", "ecossistema digital", "presença omnichannel").
- Preço sem âncora no custo do problema.
- Liderar com a rota cara.
- Prometer resultado que a Nexo não controla.
- Encher a APN de "sobre nós". O cliente quer ver ele, não o portfólio.
- Ordenar o plano pela sequência padrão de pacote da Nexo em vez da prioridade que o cliente
  deu aos próprios problemas.
- Entregar ao cliente uma lista de faixas de preço pra ele escolher — tier único, sempre, o
  compatível com o valor revelado no Pit de investimento (`/r2`).
- Deixar o objetivo da proposta implícito, só dedutível pelo diagnóstico — precisa estar
  declarado logo após a abertura.
- Validade vaga ("por tempo limitado") em vez de data específica, ou esconder o que muda depois
  que o prazo passa quando há bônus/desconto condicionado.
- Terminar a proposta no cronograma/próximos passos sem um CTA de ação imediata antes do
  rodapé.
- Prazo relativo no cronograma ("até 7 dias") quando já dá pra cravar a data concreta.
