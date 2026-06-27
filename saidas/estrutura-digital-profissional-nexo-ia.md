# Estrutura Digital Profissional — NEXO IA

> Passo a passo priorizado pra NEXO IA passar autoridade e converter cliente que olha o perfil/site. Construído sobre o que já existe (`saidas/site-nexo-ia-v2.html`, `saidas/instagram-lancamento.md`, `saidas/playbook-vendas-nexo-ia.md`), não do zero.

---

## ORDEM DE PRIORIDADE GERAL (do que trava tudo pro que refina)

| # | O que | Por quê é essa prioridade | Status |
|---|---|---|---|
| 1 | **Publicar o site que já existe** (domínio + hospedagem + preencher telefone/e-mail) | Hoje o site só existe como arquivo no seu computador. Sem isso, link na bio não leva a lugar nenhum. | 🔴 Falta fazer |
| 2 | **WhatsApp Business configurado** (nome, foto, catálogo, saudação automática, menu) | É onde o lead vira conversa. Sem isso, todo esforço de site/Instagram morre na primeira mensagem. | 🔴 Falta fazer |
| 3 | **Instagram — bio, destaques e 6 primeiros posts** | É a vitrine pública. Parte do conteúdo (bio, 3 posts, 4 carrosséis prontos) já existe — falta publicar e completar. | 🟡 Parcial |
| 4 | **Elementos de autoridade** (prova mesmo sem case, garantia, transparência de processo) | Resolve o "agência nova" — já tem boa parte na estrutura do site (`processo`, `investimento`), falta deixar visível e reforçar no Instagram. | 🟡 Parcial |
| 5 | **Seções novas no site** (Sobre/Quem somos + Prova social leve) | Refinamento — o site converte sem isso, mas fortalece confiança. | 🔴 Falta fazer |

A regra de ouro: **nada disso converte se o WhatsApp (#2) não responder bem.** É o gargalo real — o cliente vai cair lá de qualquer jeito (site, bio, anúncio), e é lá que se perde ou se fecha.

---

## 1. SITE INSTITUCIONAL

### O que já está pronto (não refazer)

`saidas/site-nexo-ia-v2.html` já tem, com copy boa e visual dark/ciano alinhado ao design-guide:

- **Hero** — "IA que move o seu faturamento." + badge "IA para negócios locais"
- **Problema** — 3 cards de dor (mensagem sem resposta, negócio no escuro, presença digital fraca)
- **Produto** — site profissional como base + lista de features
- **Dashboard** — demonstração visual do produto
- **Processo** — 4 etapas (Descoberta → Diagnóstico → Implementação → Suporte contínuo)
- **Investimento** — card de preço (R$700 implementação + R$300/mês, conforme `playbook-vendas-nexo-ia.md`)
- **CTA final** — WhatsApp + e-mail

Isso já é uma estrutura de conversão completa e bem pensada. **Não recrie — publique.**

### O que falta (prioridade #1 — sem isso o site não existe pro mundo)

1. **Preencher os placeholders:**
   - `wa.me/55SEUNUMERO` → número real do WhatsApp Business (aparece 4x no arquivo)
   - `mailto:[seu email]` → e-mail real de contato
2. **Registrar domínio** — sugestão: `nexoia.com.br` ou `nexoia.com` (checar disponibilidade)
3. **Hospedar** — caminho mais rápido pra um HTML estático: **Netlify** ou **Vercel** (ambos têm plano grátis, deploy em minutos arrastando a pasta ou conectando o GitHub). Como o projeto já está no GitHub (`mazyos`), o ideal é conectar o repositório direto — todo `git push` futuro atualiza o site sozinho.
4. **Conferir mobile** — abrir o HTML no celular antes de divulgar. Boa parte do tráfego de Instagram entra por ali.

### O que adicionar (prioridade #5 — fortalece, mas não bloqueia)

**Seção "Quem somos"** (entre `processo` e `investimento`, ou depois do `cta`):

```
// quem toca isso aqui
Gente, não departamento.

A NEXO IA é Fernando e Lucas tocando a operação, com Rian no
financeiro. Sem call center, sem terceirizar pra quem não conhece
seu negócio. Quem te atende é quem entrega.

Isso significa resposta rápida, decisão sem burocracia, e alguém
de verdade do outro lado quando você precisar.
```

**Seção "Prova social leve" (sem ter case ainda)** — quando você não tem cliente publicado ainda, a prova vem de **transparência de processo + garantia**, não de depoimento forjado:

```
// por que confiar numa agência nova
Não vamos fingir que temos 50 clientes. Temos um processo sério
e a gente assume o risco com você:

✔ Diagnóstico gratuito antes de qualquer proposta — você só paga
  se decidir seguir.
✔ Implementação em até 15 dias, ou a gente devolve seu tempo
  (replaneja sem custo extra).
✔ Você acompanha tudo pelo WhatsApp, etapa por etapa — sem caixa preta.
```

*(Assim que tiver o primeiro cliente fechado, troca essa seção por um case real — formato: "Antes/Depois" com 1 número concreto.)*

### Layout/referência visual

Já está certo no v2: fundo navy `#050e1f`, cards com borda ciano translúcida, tipografia Inter ExtraBold pra título + JetBrains Mono pra detalhes técnicos. Pra "passar autoridade", a referência é **dashboard de produto de tecnologia americano** (Linear, Stripe, Vercel) — clean, escuro, sem clichê de agência de marketing (sem foto de gente apertando a mão, sem ícone 3D genérico). O v2 já segue essa linha — manter.

---

## 2. INSTAGRAM

### O que já existe (`saidas/instagram-lancamento.md`)

- Bio já escrita, username `@nexo.iabr` escolhido
- 3 legendas de post já redigidas (quem somos / o que resolvemos / prova e resultado)
- 4 carrosséis prontos em `marketing/conteudo/` (institucional, site, automação WhatsApp, anúncios)

### Bio — ajuste final (combinando o que já existe com a oferta atual)

```
NEXO IA | IA que gera resultado

Não vendemos tecnologia. Entregamos resultado. 📈
💡 Site, automação e anúncio pro seu negócio local
🚨 Seu concorrente já está usando
👇 Chama no WhatsApp
```

Link na bio: `wa.me/55SEUNUMERO?text=Vi%20o%20perfil%20da%20NEXO%20IA%20e%20quero%20saber%20mais` (mesmo número do site, com mensagem pré-preenchida — facilita o lead e já cai qualificado no fluxo do WhatsApp, seção 3).

### Destaques essenciais (5, não 4 — adicionando "Investimento")

| Destaque | Conteúdo |
|---|---|
| **O que fazemos** | Resumo das 4 entregas (site, Instagram, anúncio, automação WhatsApp) — usar os slides 2 dos carrosséis já prontos |
| **Como funciona** | As 4 etapas do site (Descoberta → Diagnóstico → Implementação → Suporte) em formato de story |
| **Investimento** | Print do card de preço do site, ou texto direto: "R$700 implementação + R$300/mês" |
| **Resultados** | Vazio até ter o 1º case — por enquanto, pode usar "bastidores" (prints do dashboard, do processo) pra não ficar destaque morto |
| **Contato** | Botão de WhatsApp fixado + horário de atendimento |

### Os 6 primeiros posts (priorizados, misturando o que já existe)

| Ordem | Post | Status | Fonte |
|---|---|---|---|
| 1 | Carrossel "O que a NEXO IA faz" (institucional) | ✅ Pronto | `marketing/conteudo/carrossel-o-que-a-nexo-ia-faz-2026-06-25/` |
| 2 | Post "Quem somos" (legenda já escrita) | ✅ Legenda pronta, falta arte | `saidas/instagram-lancamento.md` |
| 3 | Carrossel "Site que vende" | ✅ Pronto | `marketing/conteudo/carrossel-site-que-vende-2026-06-25/` |
| 4 | Carrossel "Automação de WhatsApp" | ✅ Pronto | `marketing/conteudo/carrossel-automacao-whatsapp-2026-06-25/` |
| 5 | Carrossel "Anúncios que trazem cliente" | ✅ Pronto | `marketing/conteudo/carrossel-anuncios-trafego-pago-2026-06-25/` |
| 6 | Post "Prova e resultado" (preço + prazo, legenda já escrita) | ✅ Legenda pronta, falta arte | `saidas/instagram-lancamento.md` |

**Ou seja: você já tem material pra 6 posts. Falta só publicar.** Cadência sugerida (já em `instagram-lancamento.md`): 2 posts/semana nas primeiras 2 semanas.

---

## 3. WHATSAPP DE SUPORTE

Esse é o ponto que **não existe ainda** e é o mais crítico — todo CTA do site e do Instagram aponta pra cá.

### Configuração do WhatsApp Business

1. Nome do perfil: **NEXO IA**
2. Foto: logo (ciano sobre fundo navy, ou fundo branco se o ciano não ficar legível em miniatura)
3. Categoria: Consultoria / Marketing
4. Descrição: "Aplicamos IA pra mover o faturamento de negócios locais. Site, automação e anúncio — sem enrolação."
5. Horário de atendimento: definir e deixar visível (ex: Seg–Sex, 9h–18h)
6. Catálogo: cadastrar os 2 produtos/pacotes (Implementação + Mensalidade) com o preço do site

### Mensagem de saudação automática

```
Oi! 👋 Aqui é da NEXO IA.

A gente ajuda donos de negócio local a vender mais usando
tecnologia — site, automação de atendimento e anúncio que
funciona.

Me conta rapidinho: qual o seu negócio e o que mais te incomoda
hoje (perder cliente, não ter site, não saber se o anúncio
funciona)? Eu te respondo em poucos minutos. 🙂
```

*(Evitar menu numerado robótico na primeira mensagem — fricciona. Deixar a saudação abrir conversa natural; o menu entra se o lead não souber o que responder.)*

### Menu de atendimento (mensagem de apoio, se o lead não responder objetivamente)

```
Pra eu te ajudar melhor, escolhe uma opção:

1️⃣ Não tenho site e quero ter
2️⃣ Já tenho Instagram mas não sei se funciona
3️⃣ Perco cliente porque não respondo rápido no WhatsApp
4️⃣ Já invisto em anúncio e não sei se vale a pena
5️⃣ Outra coisa — me conta o que você precisa
```

### Fluxo de qualificação de lead (baseado no `playbook-vendas-nexo-ia.md`)

```
Lead chega → Saudação automática
   ↓
Lead responde com a dor → IDENTIFICAR:
   - É dono/decisor? (se não for, pedir contato do dono)
   - Tem negócio físico ativo? (descartar curioso/concorrente)
   ↓
Se qualificado → Resposta humana (Fernando/Lucas):
   "Faz sentido. Pra eu te mostrar algo certeiro pro seu caso
   (não um pacote genérico), bora marcar uns 30-40min essa
   semana — pode ser por aqui mesmo ou presencial. Qual fica
   melhor pra você?"
   ↓
Agenda R1 (Diagnóstico) → segue o playbook de vendas já existente
```

Regra do playbook que vale repetir aqui: **não explicar "o que é IA" na primeira resposta** — isso gera resistência. O objetivo da conversa no WhatsApp é só uma coisa: agendar a conversa de diagnóstico (R1).

---

## 4. ELEMENTOS DE AUTORIDADE (agência nova, mas que parece sólida)

O que faz um comerciante olhar e pensar "esses caras são bons", mesmo sem casos publicados ainda:

| Elemento | Onde aplicar | Já existe? |
|---|---|---|
| **Visual consistente e sóbrio** (não parece "freelancer fazendo bico") | Site + Instagram + carrosséis — paleta navy/ciano única em tudo | ✅ Já existe (design-guide) |
| **Processo visível, numerado, com prazo** ("em até 15 dias") | Site (seção `processo`) | ✅ Já existe |
| **Preço transparente** (agência que não esconde valor parece mais confiável, não menos) | Site (seção `investimento`) + destaque do Instagram | ✅ Já existe |
| **Garantia / risco assumido pela agência** ("você só paga se decidir seguir") | Adicionar na seção "Prova social leve" do site (item 1) | 🔴 Falta escrever |
| **Resposta rápida de verdade** (responder em minutos no WhatsApp logo nos primeiros contatos) | Operação — compromisso interno do time | 🔴 Depende de disciplina, não de ferramenta |
| **Linguagem sem jargão** (cliente entende sem se sentir burro) | Já é regra em `_memoria/preferencias.md` | ✅ Já existe |
| **Mostrar o time de verdade** (nome, rosto, não esconder atrás da marca) | Seção "Quem somos" do site (item 1) | 🔴 Falta escrever/publicar |
| **Usar o próprio negócio como prova** ("nosso site e Instagram são feitos com o mesmo sistema que aplicamos pra você") | Mencionar no discurso de vendas e talvez 1 post do Instagram | 🔴 Ideia nova — considerar |

O ponto mais forte aqui pra uma agência nova: **vocês não precisam fingir ter casos. Precisam parecer organizados, transparentes e rápidos.** Isso já está 70% construído na estrutura que existe — falta publicar e preencher os 30% que ainda são placeholder.

---

## Checklist final — ordem de execução

- [ ] 1. Comprar domínio + conectar Netlify/Vercel ao repositório `mazyos`
- [ ] 2. Configurar WhatsApp Business (nome, foto, catálogo, saudação automática)
- [ ] 3. Preencher número de WhatsApp e e-mail real no `site-nexo-ia-v2.html` (substituir os 5 placeholders)
- [ ] 4. Publicar o site
- [ ] 5. Atualizar bio do Instagram com o link de WhatsApp com mensagem pré-preenchida
- [ ] 6. Postar os 4 carrosséis já prontos + os 2 posts com legenda já escrita (6 posts, 2 semanas)
- [ ] 7. Montar os 5 destaques do Instagram
- [ ] 8. Escrever e publicar a seção "Quem somos" + "Por que confiar" no site
- [ ] 9. Testar o fluxo do WhatsApp simulando ser um lead (mandar mensagem pro próprio número)
