---
name: conferir
description: >
  Roda a conferência de qualidade completa antes de dar qualquer coisa por pronta: checklist de
  `_memoria/checklist-qualidade.md`, registro/fechamento de bug em `_memoria/bugs.md`, mapeamento
  de dependências (anti-regressão), smoke test da ferramenta afetada e revisão adversarial via
  /code-review. Vale pra entregas de cliente E ferramentas internas (dashboard, apps, scripts, skills).
  DISPARO AUTOMÁTICO — acionar SEMPRE, sem o usuário pedir, quando: (1) uma correção de bug ou
  implementação em código/ferramenta for concluída nesta conversa; (2) o usuário disser "terminei",
  "pronto", "corrigi", "consertei", "resolvi o bug", "vou entregar", "vou subir", "pode publicar",
  "manda pro cliente"; (3) antes de qualquer commit+push de mudança em código de ferramenta interna
  ou entrega de cliente. Acionar também quando o usuário pedir "conferir", "confere aí",
  "revisa isso", "testa tudo", "tenta quebrar", ou /conferir.
---

# /conferir — Conferência de qualidade (tentar quebrar antes de entregar)

Orquestra o processo de qualidade da NEXO IA. A regra que motiva tudo: **bug que a gente acha é
manutenção; bug que o cliente (ou o Mario amanhã) acha é crise.** E a segunda: consertar uma coisa
não pode quebrar outra.

## Quando NÃO rodar

- Tarefa puramente de texto/conteúdo sem código (post, email, proposta) → conferir só contra o
  briefing, sem smoke test.
- Mudança que ainda está no meio (usuário vai continuar mexendo) → anotar e rodar no fim.

## Passos

### 1. Identificar o alvo

Descobrir pelo contexto da conversa O QUE está sendo conferido:
- **Entrega de cliente** → qual cliente, qual entrega (site, automação, dashboard)
- **Ferramenta interna** → qual (dashboard/Supabase, `apps/roleplay`,
  `ferramentas/extensao-corrigir-dashboard`, `scripts/`, skill em `.claude/skills/`)

Se não der pra deduzir, perguntar em uma linha — nunca conferir "no geral".

### 2. Memória primeiro

- Ler `_memoria/checklist-qualidade.md` (a fonte da verdade do processo).
- Se é correção de bug interno: conferir se o bug está registrado em `_memoria/bugs.md`.
  Não está? Registrar AGORA (retroativo é melhor que nunca).
- Se é entrega de cliente: ler `clientes/<Nome>/briefing.md` e `pendencias.md` se existirem.

### 3. Anti-regressão (o "consertei uma coisa e quebrei outra")

- Listar o que foi alterado (`git diff` / `git status`).
- Pra cada arquivo/função/tabela alterada, buscar no projeto quem mais usa (grep) e listar as
  dependências encontradas.
- Mudou tabela/coluna do Supabase → conferir dashboard, `/sync`, `/onboarding` e scripts que a usam.
- Mudou skill que outra skill chama → testar a cadeia inteira.

### 4. Tentar quebrar

- Caminho infeliz: dado vazio, inválido, gigante, duplicado; clique duplo; serviço externo fora do ar.
- Interface → conferir responsivo/mobile.
- Dashboard/relatório → zero dados, poucos dados, muitos dados.
- Rodar o **smoke test da ferramenta afetada** (lista no fim de `_memoria/checklist-qualidade.md`)
  de ponta a ponta — a ferramenta INTEIRA, não só a parte corrigida.

### 5. Revisão adversarial

- Acionar a skill `/code-review` sobre o diff atual.
- Tratar cada achado: corrigir ou justificar por escrito por que não se aplica.

### 6. Fechar a memória

- Bug interno → completar o registro em `_memoria/bugs.md`: causa real, correção (commit),
  **"o que mais podia quebrar"** com o que foi testado, e lição (se gerou regra permanente).
- Entrega de cliente → conferir contra o `briefing.md` item por item; atualizar `pendencias.md`.
- Surgiu "depois eu ajusto" durante a conferência → anotar no lugar certo antes de encerrar.

### 7. Veredito

Terminar SEMPRE com um veredito claro, nesse formato:

```
✅ PRONTO PRA SUBIR — ou — ⛔ NÃO SUBIR AINDA
- O que foi testado: ...
- O que quebrou e foi corrigido: ...
- Dependências verificadas: ...
- Pendências anotadas: ...
```

Só depois do ✅ é que commit+push (ou entrega ao cliente) acontece. Se o veredito for ⛔,
listar exatamente o que falta e resolver antes de encerrar.
