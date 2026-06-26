---
name: relatorio-cliente
description: >
  Gera o relatório mensal para um cliente ativo da Nexo: o que foi feito no mês, o que moveu
  (resultados observáveis), o que vem no próximo mês, e os próximos passos. Calibrado para
  cliente de negócio local — linguagem simples, sem jargão técnico. O objetivo é justificar
  a recorrência e manter o cliente engajado com o que a Nexo está entregando.
  Use quando o usuário disser "relatório do [cliente]", "monta o relatório mensal",
  "o que envio pro cliente esse mês", "fechamento do mês com [cliente]", ou /relatorio-cliente.
---

# /relatorio-cliente — Relatório mensal para cliente ativo

Skill que transforma o que foi feito no mês em um documento que o cliente consegue ler,
entender e usar pra justificar o contrato internamente (pro sócio, pra si mesmo).

O relatório mensal tem dois objetivos: **mostrar que a Nexo está trabalhando** e **preparar
o terreno pro próximo mês**. Sem isso, o cliente paga, não vê, e cancela.

## Dependências

- **Contexto da Nexo:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **O que foi entregue no mês:** o usuário informa ou há registros na pasta do cliente
- **O contrato:** o que foi acordado na APN (pra comparar prometido vs entregue)

---

## Princípio do relatório

O cliente de negócio local não quer planilha de métricas. Quer saber três coisas:

1. **O que vocês fizeram?** — lista clara do que foi executado
2. **Funcionou?** — o que mudou que ele pode ver ou sentir (mais mensagens, mais avaliações,
   mais movimento, primeiro conteúdo publicado)
3. **O que vem agora?** — pra saber que o trabalho continua

Tudo em linguagem humana. Se tiver número, é número que ele reconhece (avaliações no Google,
posts publicados, mensagens respondidas) — não CTR, não impressões, não CAC.

---

## Workflow

### Passo 1 — Coletar o que foi feito

Perguntar ao usuário ou puxar da pasta do cliente:
- Quais serviços são do contrato?
- O que foi efetivamente entregue no mês?
- Tem algum resultado observável? (Ex: avaliações no Google subiram, publicou X posts,
  o cliente relatou mais mensagens, GMN foi otimizado)
- Teve algum imprevisto ou atraso que precisa ser explicado?

### Passo 2 — Montar o relatório

Seguir a estrutura abaixo. Linguagem direta, sem jargão.

### Passo 3 — Entregar e oferecer formato

Entregar em texto. Se o usuário quiser enviar como PDF ou doc formatado, chamar a skill `/pdf`
ou `/docx`. Não formatar sem ele pedir.

---

## Estrutura do relatório

```
## Relatório Nexo IA — [Nome do cliente] | [Mês/Ano]

### O que fizemos esse mês
[lista clara do que foi executado, uma linha por item]
- [entregável 1]
- [entregável 2]
- ...

### O que mudou
[o que foi observável — em linguagem do cliente, não de agência]
- [resultado 1 — ex: "seu Google Meu Negócio agora aparece com fotos atualizadas e horário correto"]
- [resultado 2 — ex: "publicamos X posts no Instagram, com média de [reação] de engajamento"]
- [se não houver resultado mensurável ainda: "ainda é cedo pra medir, mas [o que foi estruturado]
   está pronto pra começar a render no próximo mês"]

### O que vem no próximo mês
[3 a 5 itens concretos do que está planejado — não promessa, plano]
- [ação 1]
- [ação 2]
- ...

### Observações
[só se houver: algo que ficou pra trás e por quê, algo que precisou de ajuste, algo que
o cliente precisa fazer da parte dele (aprovar, fornecer material, etc.)]

---
Alguma dúvida ou algo que queira ajustar? Pode chamar aqui mesmo.
```

---

## Calibração por tipo de serviço

**Conteúdo (Instagram/posts):**
Mostrar: quantos posts publicados, qual formato (carrossel, reels, foto), se houve aumento de
seguidores ou engajamento observável. Se tiver print de alcance, mencionar.

**Google Meu Negócio:**
Mostrar: o que foi ajustado (fotos, horário, categoria, avaliações respondidas), quantas
avaliações novas foram geradas (se houve campanha).

**WhatsApp Business:**
Mostrar: configurações implementadas (catálogo, respostas rápidas, etiquetas, ausência).
Se possível, comparar fluxo antes e depois.

**Relatório de ads:**
Remeter ao `/relatorio-ads` pra detalhamento. No relatório de cliente, resumir o resultado
principal em uma frase.

**Site ou landing page:**
Mostrar: o que foi entregue, se está no ar, visitas se tiver acesso ao Analytics.

---

## Tom

- Direto e humano. O cliente é dono de negócio, não gestor de marketing.
- Celebrar o que foi feito, sem exagero. Um "você já tem o Google funcionando do jeito certo"
  vale mais que "atingimos 100% dos OKRs de presença digital".
- Se algo não saiu como planejado, explicar com honestidade e dizer o que será feito.
- Fechar sempre com um convite pro próximo passo — nunca com "qualquer coisa estou aqui".

## O que evitar

- Jargão técnico (CTR, impressões, funil, conversão) sem explicar o que significa.
- Relatório genérico que serviria pra qualquer cliente. Cada relatório tem o nome dele.
- Prometer resultado que ainda não aconteceu como se tivesse acontecido.
- Relatório que só lista o que foi feito sem falar o que mudou — parece lista de tarefas, não
  resultado.
- Enviar sem perguntar se o cliente tem dúvidas ou quer ajustar algo no próximo mês.
