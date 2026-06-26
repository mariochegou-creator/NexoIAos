---
name: apn
description: >
  Gera a APN — a apresentação de proposta personalizada que a Nexo leva pra R2. Puxa tudo
  que foi levantado do negócio na R1 (diagnóstico, dores nas palavras do dono, números,
  concorrentes, cidade) e monta uma proposta que parece feita exclusivamente pra aquele
  negócio, não um modelo genérico de agência. Mantém a lógica de cidade pequena e orçamento
  enxuto: recomenda a rota que entrega resultado com o menor investimento possível e só sobe
  pra rota paga quando faz sentido.
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

## Princípio de investimento (igual à R1)

A Nexo atua em cidade pequena, com negócio de pouca verba. Então:

- A APN **lidera com a rota enxuta** (custo baixo ou zero) que já entrega resultado.
- A rota com investimento aparece como **opção**, com o "porquê vale" e o retorno esperado —
  nunca empurrada.
- O preço da Nexo é sempre ancorado **contra o custo do problema**. Se a dor custa R$ 2.000/mês
  em cliente perdido, um serviço de R$ 500 parece barato. A conta tem que estar na proposta.

---

## Workflow

### Passo 1 — Reunir os insumos

Puxar o diagnóstico da R1. Conferir se tem: problemas levantados, implicações (custo de cada
um), números que o dono citou, e a rota recomendada (enxuta/robusta). Se faltar peça crítica,
perguntar antes de montar — proposta com buraco fica genérica.

### Passo 2 — Montar a APN

Seguir a estrutura abaixo. A ordem importa: a dor dele primeiro, a solução depois, o preço só
no fim, já ancorado.

### Passo 3 — Calibrar preço e retorno

Pra cada item de investimento, amarrar ao número do dono. Sem número solto. Se ele não deu
número na R1, usar uma estimativa honesta e sinalizada ("estimando pelo que você falou").

### Passo 4 — Entregar e oferecer formato

Entregar a APN em texto estruturado. Oferecer renderizar como **deck** (skill pptx) ou **PDF**
(skill pdf) na identidade da marca, se ele for apresentar na tela. Não renderizar sem ele pedir.

---

## Estrutura da APN

**1. Abertura**
Capa com o nome do negócio e uma linha que resume a virada proposta. Ex: "Plano Nexo pra
[Barbearia X] encher as terças e parar de perder cliente no WhatsApp." Específica, não slogan.

**2. O que ouvimos de você**
O recap do diagnóstico nas palavras dele. É a seção mais importante — é o que cria o "isso é
sobre mim". Listar as dores que ele mesmo trouxe na R1, de preferência com trecho real.

**3. O diagnóstico**
Cada dor com sua implicação — o que ela custa em faturamento, cliente ou tempo. Aqui a
proposta mostra que a Nexo entendeu o tamanho do problema, não só a superfície.

**4. O plano**
A solução mapeada problema a problema. Pra cada dor, o que a Nexo faz. Concreto: "configurar e
otimizar seu Google Meu Negócio + campanha de avaliações com seus clientes atuais", não
"melhorar sua presença digital". Liderar com a rota enxuta; marcar onde existe a opção robusta.

**5. Resultados esperados**
O que muda, amarrado à realidade dele e aos números que ele deu. Honesto — sem prometer
milagre. "Mais buscas no Google e mensagens organizadas" é melhor que "triplique seu
faturamento".

**6. Investimento**
O preço, ancorado contra o custo do problema (da seção 3). Apresentar a rota enxuta como
entrada e a robusta como opção, cada uma com o que entrega. Deixar claro o que dá pra começar
com pouco.

**7. Como começamos**
O próximo passo concreto: o que acontece se ele topar hoje, prazo do primeiro entregável, como
funciona. Tira a fricção do "e agora?".

**8. Sobre a Nexo**
Curto, no fim. Prova, não pitch — a Nexo presta serviço pra negócio local, de conteúdo até
aumento de faturamento. Uma ou duas linhas. O foco da APN é ele, não a gente.

---

## Formato de saída

```
# APN — [Nome do negócio]

## [linha de abertura específica do caso]

### O que ouvimos de você
- "[dor 1 nas palavras do dono]"
- "[dor 2 nas palavras do dono]"
- ...

### Diagnóstico
- [Dor 1] — custa [implicação em R$/cliente/tempo]
- [Dor 2] — custa [...]

### O plano
- Pra [dor 1]: [o que a Nexo faz — rota enxuta] · (opção: [rota robusta, se houver])
- Pra [dor 2]: [...]

### Resultados esperados
[o que muda, com os números dele]

### Investimento
- Começo enxuto: R$ [x] — [o que entrega]
- Opção com investimento (se quiser acelerar): R$ [y] — [o que entrega + porquê vale]
- Pra referência: o problema hoje custa ~R$ [z]/mês

### Como começamos
[próximo passo concreto + prazo do primeiro entregável]

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
