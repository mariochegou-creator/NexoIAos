# NEXO IA — MazyOS

> Operação da NEXO IA. Aqui ficam todos os clientes, propostas, conteúdo e entregas.

**Estrutura de pastas:**
- `_memoria/` — quem somos, como falamos, foco atual
- `identidade/` — marca da NEXO IA (aplicada nas peças internas)
- `clientes/` — uma subpasta por cliente, autossuficiente
- `briefings/` — briefings antes de virar cliente
- `propostas/` — propostas em andamento
- `marketing/` — conteúdo institucional da NEXO IA
- `saidas/` — documentos pontuais, análises
- `dados/` — arquivos a analisar (relatórios de cliente, exports)
- `tarefas.md` — pipeline da agência

## Sobre a NEXO IA

Aplicamos IA para mover o ponteiro de faturamento de negócios locais. Não vendemos tecnologia — entregamos resultado. Atendemos donos de negócio que sabem que precisam de IA mas não sabem por onde começar.

Nossa IA analisa o negócio do cliente e implementa o que vai gerar resultado. Sites, dashboards e automações são os meios — nunca o argumento de venda.

Time: 3 pessoas — Fernando e Lucas (operacional), Rian (financeiro).

## Clientes ativos

*(Atualizar conforme novos clientes entram — `/atualizar` mantém isso sincronizado)*

## O que mais produzimos aqui

- Propostas comerciais para novos clientes
- Automações e integrações para clientes
- Dashboards e relatórios

## Tom de voz

Profissional e direto, sem termos técnicos para o cliente final. Falamos como parceiro de confiança — competentes, acessíveis, sem papo de guru.

Evitar: jargão de guru de marketing, termos técnicos de IA para cliente final, frases motivacionais genéricas.

## Regras do sistema

- Cliente novo → criar pasta `clientes/<Nome>/` com briefing, estratégia e subpastas conforme as entregas contratadas
- Proposta nova → `propostas/<cliente>-<data>.html` antes de fechar
- Casos de sucesso ficam em `clientes/<Nome>/caso.md` (reuso em pitches)

## Ferramentas conectadas

- [ ] Notion
- [ ] Gmail
- [ ] Google Calendar
- [ ] Canva
- [ ] Meta Ads
- [ ] Google Ads

*(Marcar conforme for instalando os MCPs)*

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem e estiverem preenchidos):

1. `_memoria/empresa.md` — quem somos, o que fazemos, como funciona o negócio
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar `identidade/design-guide.md`.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe skill relevante em `.claude/skills/`. Se encontrar, seguir as instruções da skill. Se não encontrar, executar normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível, perguntar:
> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

---

## Aprender com correções

Quando o usuário corrigir algo ou der instrução permanente, perguntar:
> "Quer que eu salve isso pra não precisar repetir?"

Se sim, salvar em:
- **Sobre o negócio** → `_memoria/empresa.md`
- **Sobre preferências e estilo** → `_memoria/preferencias.md`
- **Sobre prioridades e foco** → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → `CLAUDE.md`

---

## Criação de skills

Quando o usuário pedir skill nova:

1. Verificar se existe template relevante em `templates/skills/`
2. Perguntar se é específica desse projeto ou útil em qualquer lugar:
   - Específica → `.claude/skills/nome-da-skill/SKILL.md`
   - Universal → `~/.claude/skills/nome-da-skill/SKILL.md`
3. Ler `_memoria/empresa.md` e `_memoria/preferencias.md` pra calibrar ao contexto da NEXO IA
