# Checklist de qualidade — NEXO IA

> Regra de ouro: **cabeça é pra pensar, arquivo é pra lembrar.**
> Este checklist vale pros DOIS usos: entrega pra cliente e manutenção das nossas próprias ferramentas
> (dashboard/Supabase, apps/roleplay, ferramentas/, scripts/, skills em `.claude/skills/`).

---

## 1. Antes de começar (qualquer tarefa — nova ou correção)

- [ ] Reler o briefing/pendências do que estou mexendo ANTES de tocar em qualquer coisa
  - Cliente → `clientes/<Nome>/briefing.md` e `clientes/<Nome>/pendencias.md`
  - Ferramenta interna → `_memoria/bugs.md` (o histórico daquela ferramenta) e o README dela
- [ ] Se é correção de bug: **reproduzir o erro antes de corrigir.** Se não consigo fazer o erro acontecer, ainda não sei qual é o problema.
- [ ] Registrar o bug em `_memoria/bugs.md` ANTES de corrigir (data, ferramenta, sintoma). Bug não anotado é bug que volta sem histórico.

## 2. Antes de mexer no código (anti-regressão — o "consertei uma coisa e quebrei outra")

- [ ] **Mapear quem depende do que vou mudar.** Buscar no projeto onde a função/arquivo/tabela é usada (grep) e listar. Mudança em coisa compartilhada = testar TODOS os usos, não só o que motivou a mudança.
- [ ] Mudança no Supabase (tabela, coluna, RLS)? → conferir tudo que lê/escreve nela: dashboard, skill /sync, skill /onboarding, scripts.
- [ ] Mudança em skill que outra skill chama (ex: /carrossel é usada por /publicar-tema)? → testar a cadeia inteira.
- [ ] Commitar o estado atual ANTES de começar a mexer. Commit pequeno e frequente = sempre dá pra voltar atrás quando a correção piorar as coisas.

## 3. Durante o trabalho

- [ ] Surgiu um "depois eu ajusto"? → anotar em `pendencias.md` (cliente) ou `_memoria/bugs.md` (interno) **agora**, antes de continuar.
- [ ] Tomei decisão de escopo/técnica? → uma linha no `decisoes.md` do projeto com o porquê.
- [ ] Instrução repetida pela segunda vez (minha ou de cliente)? → vira regra permanente no `CLAUDE.md` ou `_memoria/`.

## 4. Antes de dar por pronto (tentar quebrar)

- [ ] Testar o caminho infeliz: dado vazio, dado inválido, dado gigante, clique duplo, conexão lenta, API do outro lado fora do ar.
- [ ] Site/interface: abrir no celular de verdade e no navegador que o usuário final usa.
- [ ] Dashboard/relatório: testar com zero dados, poucos dados e muitos dados.
- [ ] Rodar revisão adversarial da IA: "revise como se quisesse provar que está quebrado" (`/code-review`).
- [ ] **Smoke test da ferramenta inteira**, não só da parte corrigida: rodar o fluxo principal de ponta a ponta uma vez. É isso que pega a regressão antes de mim.
- [ ] Cada bug corrigido ganhou um teste (ou pelo menos um passo no smoke test) que impede ele de voltar.
- [ ] Conferir a entrega contra o `briefing.md` item por item — não contra a lembrança.
- [ ] Fechar o registro do bug em `_memoria/bugs.md`: causa encontrada + o que foi feito + o que mais podia ter quebrado.

## 5. Depois de entregar / subir

- [ ] Commit + push (o trabalho só existe de verdade quando está salvo).
- [ ] "Dia 3": voltar em três dias e verificar rodando em produção, antes que alguém reclame.
- [ ] O que aprendi (erro novo, dependência descoberta, preferência) foi anotado no lugar certo.

---

## Smoke tests por ferramenta interna

*(Manter atualizado conforme as ferramentas mudam. Rodar o da ferramenta afetada sempre que mexer nela.)*

### Dashboard / Supabase
1. Banco: `node scripts/smoke-crm-db.js` (precisa de `NEXO_SB_SERVICE_KEY`) — confere API, tabelas e as colunas que a dashboard consulta. Só leitura.
2. Interface: `node scripts/smoke-crm-ui.js` — abre a dashboard num navegador real e renderiza todas as abas em modo DEMO, capturando erros de JS. Não toca no banco. Precisa de `npm install playwright @supabase/supabase-js chart.js`.
3. Login real no navegador com um usuário de verdade (esse passo é manual — os scripts não autenticam).
4. `/sync` de um cliente de teste faz upsert sem erro e o dado aparece na dashboard.
5. Modal do cliente abre e o checklist de onboarding carrega.

### apps/roleplay
1. `docker-compose up` (ou o start do client/server) sobe sem erro.
2. Fluxo principal do app roda de ponta a ponta uma vez.

### ferramentas/extensao-corrigir-dashboard
1. Extensão carrega no navegador sem erro no console.
2. A ação principal dela funciona na dashboard de verdade.

### Skills críticas
1. `/publicar-tema` num tema de teste gera artigo + carrossel + legendas.
2. `/carrossel` renderiza os PNGs 1080x1350.
3. `/sync` e `/salvar` completam sem erro.
