# Metodologia de vendas

> Como a NEXO IA vende. O Claude lê este arquivo antes de qualquer coisa ligada a venda:
> `/roteiro-r1`, `/r1`, `/apn`, `/r2`, `/follow-up`, `/enriquecer-leads`.
>
> **Status:** esqueleto. As seções marcadas `[a preencher]` esperam a extração do curso
> (ver `ferramentas/transcrever-curso/README.md` e a skill `/curso`).

## O filtro — o que entra aqui e o que não entra

Curso tem 10 horas. Memória útil tem 2 páginas. A diferença é o filtro:

**Entra:**
- Regra que muda a decisão numa call ("não dá preço antes de X")
- Pergunta literal, na forma exata em que funciona
- Nome de um movimento que você quer conseguir reconhecer ao vivo ("isso aqui é o Pit 1")
- Erro específico e o custo dele

**Não entra:**
- Conceito que você já aplica sem pensar
- História, exemplo ou estudo de caso do professor
- Motivação, mentalidade, "postura de vencedor"
- Qualquer coisa que não muda o que você faz na terça-feira à tarde

Regra prática: se o Claude não consegue **agir diferente** por causa da linha, a linha é ruído.

---

## Princípios de fechamento

*(já em uso — vieram das skills `/r1` e `/r2`, consolidados aqui)*

1. **Need-payoff antes do preço.** O dono tem que dizer em voz alta o que muda se a dor
   sumir, antes de ouvir o valor. Quem verbaliza o ganho aceita o preço sem susto.
2. **Demonstrar capacidade, não despejar feature.** Cada item do plano se amarra a uma dor
   que ele já confirmou: "pra resolver aquilo que você falou, a gente faz isso."
3. **Sair com pedido ou avanço — nunca com continuação.** "Vou pensar e te falo" sem data
   é quase um não. Não aceitar isso como resultado de R2.
4. **Ticket alto não fecha com gatilho de B2C.** Escassez artificial ("só até amanhã",
   contador regressivo) queima credibilidade com dono de negócio. A urgência legítima vem
   do custo do problema já quantificado em R$.
5. **Diagnóstico escrito em tempo real.** Número, prazo, frase literal, quem mais decide —
   anotado durante a call. Registro incompleto é falha de execução.

---

## Repertório de closes

*(o pedaço mais importante da extração — um bloco por close)*

### Close por pergunta *(preferido do Mario — confirmar nome no curso)*

- **Como funciona:** em vez de afirmar a conclusão, faz a pergunta que leva o cliente a
  chegar nela sozinho.
- **Por que o Mario prefere:** afirmar sem contexto soa a vendedor empurrando — "você tá me
  dizendo isso, mas isso não faz contexto pra mim". A pergunta obriga o cliente a construir
  o contexto com as palavras dele. Aí a conclusão é dele, não sua.
- **Onde já vive no sistema:** é o need-payoff do SPIN, no Pit 1 da `/r2` (escala 0-10 +
  "por que não menos?").
- **Perguntas literais:** `[a preencher — pegar as formulações exatas do curso]`
- **Quando NÃO usar:** `[a preencher]`

### `[a preencher — demais closes do curso, um bloco cada]`

Para cada um, o mesmo formato: nome · como funciona · perguntas literais · quando usar ·
quando não usar.

---

## Objeções — resposta padrão

*(formato: objeção literal do cliente → o que ela quase sempre esconde → como responder)*

`[a preencher]` — priorizar as quatro que a Nexo mais ouve: preço, "vou pensar",
"preciso falar com meu sócio", "já tentei e não deu certo".

---

## Frases que funcionam

*(literais, na forma exata — paráfrase perde o efeito)*

`[a preencher]`

---

## Erros a não cometer

*(cada um com o custo — o custo é o que faz lembrar)*

`[a preencher]`

---

## Origem

| Curso | Aulas úteis | Extraído em |
|---|---|---|
| `[a preencher]` | | |

Transcrições completas ficam em `dados/curso-*/` — fora do Git, por serem material de
terceiro. Aqui fica só a destilação: o que virou o **nosso** jeito de trabalhar.
