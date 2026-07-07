# Processo comercial completo — NEXO IA

> Mapeamento de ponta a ponta: da captação do lead até contrato fechado e recorrência. Baseado nas skills e documentos que já existem no MazyOS — nada aqui foi inventado, cada etapa cita o arquivo que a sustenta.

---

## Mapa do funil

```
CAPTAÇÃO
  ├─ prospecção ativa (presencial + WhatsApp/DM)
  └─ indicação via influencer (dono vê vídeo de outro cliente e vai atrás)
   ↓
R1 — Diagnóstico (SPIN Selling)
   ↓
APN — Proposta personalizada
   ↓
R2 — Apresentação e fechamento
   ↓                    ↘
FECHOU                  NÃO FECHOU → Follow-up → volta pra R2 (ou encerra)
   ↓
Novo projeto (pasta do cliente)
   ↓
Onboarding — semana 1
   ↓
Entrega recorrente (conteúdo, GMN, WhatsApp, ads, site...)
   ↓
Relatório mensal
   ↓
Sync com o dashboard (contínuo, em qualquer etapa)
```

---

## 1. Captação

**Como funciona hoje:** prospecção ativa — a Nexo vai até o dono do negócio, não o contrário. Dois canais:

- **Presencial** — abordagem curta (2-3 min), sem mencionar "IA" (gera resistência). Objetivo único: marcar a R1.
- **WhatsApp / DM Instagram** — 3 variações de script (direta, com gancho de dor, tom colega) + follow-up se não responder em 3 dias.

**Onde está documentado:** `saidas/playbook-vendas-nexo-ia.md` e `saidas/scripts-prospeccao.md`

**Quem faz:** Fernando

**Um segundo canal, hoje orgânico:** quando um vídeo de influencer feito pra um cliente viraliza ou circula bem, outros donos de negócio veem, vão atrás dela e ela direciona pra Nexo. Ou seja, o trabalho de divulgação de um cliente (etapa 8, entrega recorrente) volta pro topo do funil e gera lead novo — mesmo sem ser um fluxo desenhado de propósito. Hoje isso é reativo (depende do vídeo viralizar e da influencer lembrar de indicar) e não tem script, follow-up ou registro formal como a prospecção ativa tem. Dá pra formalizar: por exemplo, pedir pra influencer sempre mencionar/marcar a Nexo no vídeo, ou ter uma resposta padrão pronta pra quando ela for indicar alguém.

---

## 2. R1 — Reunião de diagnóstico

**Skill:** `/r1` · **Arquivo:** `.claude/skills/r1/SKILL.md`

45-60 min, conduzida ao vivo, seguindo SPIN Selling: Situação → Problema → Implicação → Necessidade. A reunião não termina sem a R2 marcada.

Depois da call, cola a transcrição em `/r1` e a skill devolve:
- Diagnóstico SPIN estruturado
- Cada problema com **duas rotas**: enxuta (grátis/barata) e robusta (com investimento) — a enxuta sempre lidera
- Leitura de quanto o cliente sinalizou poder investir
- Coaching: perguntas de implicação que faltaram fazer
- Resumo pronto pra virar proposta

**Produz:** diagnóstico → alimenta a APN

---

## 3. APN — Proposta personalizada

**Skill:** `/apn` · **Arquivo:** `.claude/skills/apn/SKILL.md`

Pega o diagnóstico da R1 e monta uma proposta que devolve as palavras, números e cidade do próprio dono — nunca um modelo genérico. Estrutura fixa: o que ouvimos → diagnóstico com custo de cada dor → plano (rota enxuta primeiro) → resultados esperados → investimento (ancorado no custo do problema, não solto) → como começamos → sobre a Nexo (por último, curto).

**Produz:** proposta pronta pra R2 (texto; vira deck ou PDF só se pedido)

---

## 4. R2 — Apresentação e fechamento

**Skill:** `/r2` · **Arquivo:** `.claude/skills/r2/SKILL.md`

Regra de ouro: **need-payoff antes do preço**. Antes de mostrar valor, o dono precisa dizer em voz alta o que muda se a dor sumir — quem verbaliza o ganho compra o preço sem susto. Só depois disso o investimento é apresentado, ancorado no custo do problema que ele acabou de dimensionar.

A skill cobre também as 5 objeções mais comuns de dono de negócio local (preço, tempo, terceiro decide, ceticismo, "vou fazer eu mesmo") com resposta pronta pra cada uma.

Sai da call sempre com um de três resultados: **pedido** (fechou), **avanço** (próximo passo com data marcada) ou **não-venda** — nunca um "depois a gente vê" solto.

Depois, colando a transcrição da R2 de volta em `/r2`, a skill diz se fechou, o que ficou de objeção e o que fazer a seguir.

---

## 5. Não fechou → Follow-up

**Skill:** `/follow-up` · **Arquivo:** `.claude/skills/follow-up/SKILL.md`

Calibra a mensagem pelo tipo de objeção que ficou (preço, tempo, terceiro, ceticismo, sumiu) — sempre reacendendo a dor que o próprio dono confirmou, nunca pressão. Prazos sugeridos de 2 a 7 dias conforme o caso, com no máximo 3 tentativas sem resposta.

**Em aberto:** não há uma etapa documentada pro que fazer depois da 3ª tentativa sem resposta (ver seção final).

---

## 6. Fechou → Novo projeto

**Skill:** `/novo-projeto` · **Arquivo:** `.claude/skills/novo-projeto/SKILL.md`

Entrevista rápida (nome, tipo, objetivo, entregas) e cria a pasta `clientes/<Nome>/` com `CLAUDE.md` próprio, `briefing.md`, `.nexo-status.md` (status inicial, valor, serviços, próximo passo) e as subpastas conforme o que foi contratado. Já registra o cliente no dashboard (Supabase) nesse momento.

---

## 7. Onboarding — semana 1

**Skill:** `/onboarding` · **Arquivo:** `.claude/skills/onboarding/SKILL.md`

Objetivo da semana 1 é **confiança**, não faturamento. Regra fixa: entregável visível até o dia 3 (GMN otimizado + WhatsApp Business configurado, no mínimo). Estrutura:

- **Dia 1:** kickoff — coleta de acessos e materiais
- **Dia 2:** diagnóstico da presença digital atual
- **Dia 3:** primeiro entregável visível + relatório de diagnóstico
- **Dia 4-5:** calendário de conteúdo do primeiro mês
- **Dia 7:** primeiro conteúdo publicado + relatório da semana + feedback

O checklist também aparece direto no modal do cliente na dashboard.

---

## 8. Entrega recorrente

Conforme o que foi contratado — conteúdo (`/carrossel`), Google Meu Negócio, WhatsApp Business, anúncios (`/anuncio-google`, `/relatorio-ads`), site. Se o cliente contratar divulgação com influencer, entram `/roteiro` (roteiro de Reel pontual) ou `/roteiro-viral` (pacote completo: roteiro + legenda + guia de filmagem + guia de edição, com pesquisa de tendência do nicho).

---

## 9. Relatório mensal

**Skill:** `/relatorio-cliente` · **Arquivo:** `.claude/skills/relatorio-cliente/SKILL.md`

Três perguntas que o cliente quer ver respondidas, sem jargão: o que foi feito, o que mudou (resultado observável, mesmo que pequeno), o que vem no mês seguinte. Serve pra justificar a recorrência e preparar terreno pra expansão.

---

## 10. Sync com o dashboard

**Skill:** `/sync` · **Arquivo:** `.claude/skills/sync/SKILL.md`

Roda a qualquer momento, em qualquer etapa — lê o `.nexo-status.md` da pasta do cliente e atualiza o Supabase (status, valor, serviços, próximo passo, handoff, tarefas). É o que mantém a dashboard (`saidas/dashboard-nexo-ia.html`, hoje também publicada em `dashboard.nexoialocal.com.br`) refletindo o estado real de cada cliente pra toda a equipe.

---

## Onde cada coisa fica salva

```
clientes/<Nome>/
├── CLAUDE.md            → instruções específicas do projeto
├── .nexo-status.md      → vínculo com o Supabase (status, valor, próximo passo)
├── briefing.md          → contexto coletado no /novo-projeto
├── roteiros/            → sempre criada (saída do /roteiro e /roteiro-viral)
├── conteudo/ ads/ site/  → conforme o que foi contratado
└── relatorios/          → saída mensal do /relatorio-cliente
```

---

## Em aberto

Pontos que a varredura não encontrou documentados — não é erro, é o que ainda falta desenhar se fizer sentido pra operação:

- **Formalizar a captação via influencer** — hoje existe (dono vê o vídeo de outro cliente, procura a influencer, ela indica a Nexo) mas é reativa, sem script de indicação, sem follow-up dedicado e sem registro separado da prospecção ativa
- **O que fazer depois da 3ª tentativa de follow-up sem resposta** — hoje o fluxo simplesmente para
- **`tarefas.md`** é citado no `CLAUDE.md` da raiz como "pipeline da agência" mas o arquivo não existe — o pipeline real está vivo no dashboard/Supabase
- **SLA de resposta no WhatsApp** e **prazo entre R1 e R2** — mencionados como "rápido"/"semana que vem" mas sem número fixo
