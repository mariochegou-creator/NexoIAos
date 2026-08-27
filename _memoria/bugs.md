# Registro de bugs — ferramentas internas

> Todo bug encontrado nas nossas ferramentas entra aqui ANTES de ser corrigido, e o registro
> é fechado quando a correção estiver validada. Isso é a memória que impede o mesmo bug de
> voltar sem histórico — e mostra padrões ("essa ferramenta quebra sempre no mesmo lugar").

**Como usar:** copiar o modelo abaixo, preencher na hora que encontrar o bug, completar ao fechar.
Bugs de cliente ficam na pasta do cliente; aqui é só ferramenta interna (dashboard, apps, scripts, skills, extensão).

---

## Modelo

```
### [ABERTO|FECHADO] AAAA-MM-DD — <ferramenta> — <resumo curto>
- Sintoma: o que acontece, passo a passo pra reproduzir
- Causa: (preencher quando descobrir — a causa real, não o palpite)
- Correção: o que foi mudado, em qual commit
- O que mais podia quebrar: quais outras partes usam o que mudei, e o que testei pra confirmar que continuam funcionando
- Lição: (opcional) regra permanente que isso gerou — e onde foi anotada
```

---

## Bugs

### [ABERTO] 2026-08-27 — 3 itens de segurança abertos (detalhes fora do repositório)
- Sintoma: a auditoria de 27/08 abriu três frentes de risco — (1) credenciais de integração e dados de produção em pasta versionada, (2) saída da dashboard sem sanitização, (3) políticas de acesso do banco sem distinção de papel.
- **Os detalhes NÃO ficam neste arquivo enquanto o repositório for público** — descrever passo a passo como explorar seria entregar o mapa. Estão no relatório privado da auditoria (artifact do Claude Code, 27/08/2026).
- Causa comum: nada disso foi verificado antes de o repositório virar público.
- Correção: (pendente — ação do usuário) revogar as credenciais expostas, tornar o repositório privado e só então limpar índice e histórico. Revogar é o passo que realmente fecha: apagar do repositório não adianta, o histórico do Git guarda tudo e clone antigo continua válido.
- O que mais podia quebrar: mudar as políticas de acesso afeta a dashboard, as skills /sync e /onboarding e as Edge Functions — testar todos os usos.
- Lição: auditoria de segurança roda ANTES de tornar um repositório público, não depois. E dado de produção nunca entra em pasta versionada — falta `.gitignore` para `_backups/*/data/`.

### [FECHADO] 2026-08-27 — corrigi o CDN no arquivo errado (deploy/ em vez do canônico)
- Sintoma: apliquei a correção do CDN, os smoke tests e a análise toda em `deploy/dashboard-nexo-ia.html`, que é uma cópia ANTIGA (3117 linhas, 2 commits, tabelas em inglês). O que está no ar em `dashboard.nexoialocal.com.br` é `saidas/dashboard-nexo-ia.html` (4472 linhas, 10 commits, tabelas em português).
- Causa: assumi que a pasta `deploy/` continha o que está em deploy. Não confirmei contra o domínio real antes de corrigir.
- Correção: guard do CDN portado para o canônico e validado (10 abas renderizam, zero erro de JS); `scripts/smoke-crm-ui.js` passou a apontar para o canônico por padrão; regra de confirmar produção adicionada no topo do `checklist-qualidade.md`.
- O que mais podia quebrar: as auditorias de bugs e UX rodaram sobre o `deploy/` — parte dos achados já está resolvida no canônico (ex: "Resultado do mês" somando o histórico inteiro já é filtrado por mês lá). Cada achado precisa ser reconferido no canônico antes de virar correção.
- Lição: **confirmar o que está em produção é o passo zero**, antes de reproduzir o bug. Nome de pasta não é fonte de verdade — `curl` no domínio é.

### [ABERTO] 2026-08-27 — remove-collaborator escreve coluna que não existe: tarefas não são reatribuídas
- Sintoma: `supabase/functions/remove-collaborator/index.ts:51` faz `update({ resp, updated_at })` em `tasks`. Confirmado por consulta ao banco: **`tasks.updated_at` não existe** (erro 42703). O retorno não é checado, então falha em silêncio e o usuário é deletado logo depois.
- Impacto: ao desligar alguém do time, as tarefas dele ficam com `resp` apontando pra quem não existe mais. Leads, clientes e prospecção são reatribuídos certo (essas tabelas têm `updated_at`) — parece que funcionou.
- Correção: (pendente) remover `updated_at` do update de `tasks` ou criar a coluna; e checar o erro antes de deletar o usuário.

### [ABERTO] 2026-08-27 — 2 de cada 3 tarefas não chegam no Google Calendar nem no Todoist
- Sintoma: confirmado no banco — **6 das 9 tarefas estão sem `assigned_user_id`**. `_shared/googleCalendar.ts:66` faz `if (!task.assigned_user_id) return;`, então essas tarefas nunca sincronizam.
- Causa: a skill `/sync` insere tarefas com `{title, status, client_name, resp}` e não preenche `assigned_user_id` (só o nome em texto). A dashboard preenche os dois.
- Correção: (pendente) `/sync` resolver o nome para o id do profile antes de inserir. Cuidado: o Passo 6 do /sync também apaga tarefas por `client_name` sem chamar `task-delete-cleanup`, deixando evento órfão no Calendar e no Todoist.

### [ABERTO] 2026-08-27 — migration do roleplay nunca foi aplicada: apps/roleplay não tem tabela
- Sintoma: `supabase/migrations/20260803120000_roleplay_sessoes.sql` cria `roleplay_sessoes`, mas a tabela **não existe no banco** (PGRST205). O app `apps/roleplay` grava nela.
- Causa maior: não há baseline de migrations — 6 tabelas em uso (`clients`, `profiles`, `tasks`, `marketing`, `finance_entries`, `settings`) não têm migration nenhuma, então `supabase db reset` não recria o banco e não existe ambiente de teste. Toda mudança de schema vai direto na produção.
- Correção: (pendente) aplicar a migration pendente e criar uma migration de baseline com as 6 tabelas órfãs.

### [ABERTO] 2026-08-27 — duplicação de cliente entre `clients` e `clientes`
- Sintoma: confirmado no banco — "NEXO IA — MazyOS" existe nas duas tabelas. `clients` (1 registro) é o schema antigo; `clientes` (2 registros) é o novo, usado pela dashboard publicada e pelas skills.
- Causa: a migration `20260702044949` copiou de `clients` para `clientes`/`leads` sem dropar a origem ("rede de segurança até validar"), e a migration de drop nunca veio.
- Correção: (pendente) conferir se há linha em `clients` alterada depois de 02/07 que não exista em `clientes` (seria trabalho real a perder) e então dropar `clients`. A tabela `projetos` está vazia e sem leitor/escritor — avaliar dropar junto.

### [ABERTO] 2026-08-27 — dashboard CRM — aba Influencer aponta pra tabelas que não existem
- Sintoma: a dashboard consulta `influencers` e `influencer_jobs`, e as duas devolvem 404 no banco. A aba cai no aviso "Ative o modo DEMO" — funciona, mas nunca mostra dado real.
- Causa: inconsistência de nomenclatura. O migration `20260702044949_leads_clientes_reorg.sql` criou `influenciadores` (português); a dashboard usa nomes em inglês. `influencer_jobs` não existe em migration nenhum.
- Correção: (pendente — decisão de produto) ou criar as tabelas com os nomes que a dashboard espera, ou apontar a dashboard pra `influenciadores` e criar a de jobs. Não corrigido junto com o CDN pra não misturar escopo.
- O que mais podia quebrar: mexer nisso afeta a aba Influencer e a skill /roteiro (usa dados de influencer). Mapear antes.
- Lição: a dashboard trata a ausência com elegância, então o problema ficou invisível por meses — falha tratada não é o mesmo que funcionalidade entregue.

### [FECHADO] 2026-08-27 — dashboard CRM (deploy/dashboard-nexo-ia.html) — quebra sem mensagem quando os CDNs não carregam
- Sintoma: a página depende de 3 CDNs externos (supabase-js, chart.js, Google Fonts). Se o supabase-js não carregar (conexão lenta, CDN fora, rede corporativa bloqueando), o JS quebra com `TypeError: Cannot read properties of undefined (reading 'createClient')` — a tela de login aparece normal, mas o botão "Entrar" não funciona e o usuário não recebe NENHUM aviso. Reproduzido em smoke test com Chromium/Playwright bloqueando os CDNs.
- Causa: nenhuma verificação de que `supabase`/`Chart` existem antes de usar; sem fallback nem mensagem de erro visível.
- Correção: guard antes do `createClient` — se a lib não carregou, mostra tela de aviso ("Não foi possível carregar o painel") com botão Recarregar, na identidade da marca, e interrompe. Chart.js ganhou degradação suave (`chartIndisponivel`): se faltar, cada gráfico mostra "Gráfico indisponível — sem conexão" e o resto do painel continua funcionando.
- O que mais podia quebrar: verificado que só `deploy/dashboard-nexo-ia.html` usa esse padrão — as outras páginas de deploy/ não carregam CDN. Testados 3 cenários no Chromium: (1) Supabase fora → aviso aparece; (2) tudo carregando → login normal, zero erro de JS; (3) só Chart.js fora → painel vivo. Os três passaram.
- Lição: teste de caminho infeliz "serviço externo fora do ar" pega bug que nunca aparece no teste feliz — a tela parece perfeita e está quebrada.

### [FECHADO] 2026-08-27 — scripts/smoke-crm-db.js — o próprio smoke test dava falso positivo
- Sintoma: primeira versão do script testava `leads`/`clientes`/`contratos` e declarava "✅ banco respondendo" — mas a dashboard consulta `clients`, `tasks`, `finance_entries`, `profiles`, `settings`. O teste passaria com a dashboard inteira quebrada.
- Causa: assumi os nomes das tabelas pelo que as skills usam, sem conferir o que a dashboard realmente consulta (`grep "\.from('"`).
- Correção: lista refeita a partir do código real, separada em dashboard/skills/opcionais; adicionado timeout de 15s (antes travaria pra sempre com host inacessível) e alerta quando tudo volta com 0 registros (chave sem permissão de RLS passaria como sucesso).
- O que mais podia quebrar: nada além do próprio script (é read-only e novo). Validado nos dois caminhos: chave boa → exit 0; chave inválida → 14 falhas e exit 1.
- Lição: achado pelo /code-review, não por mim. Teste que não falha nunca não está protegendo nada — a lista de tabelas tem que sair do código, não da memória.

### [FECHADO] 2026-08-26 — CLAUDE.md (regras de qualidade) — regra de disparo do /conferir ambígua
- Sintoma: a regra dizia "antes de qualquer commit+push → acionar /conferir". Lida ao pé da letra, todo `/salvar` de conteúdo (proposta, post, texto) dispararia conferência de código sem necessidade — atrito em toda gravação de trabalho.
- Causa: redação genérica demais na primeira versão da regra; não distinguia push de código de push de conteúdo.
- Correção: regra reescrita pra "commit+push de código ou entrega ao cliente", com exceção explícita pro `/salvar` de conteúdo.
- O que mais podia quebrar: fluxo do `/salvar` (verificado: descrição da skill não conflita) e o "Quando NÃO rodar" do `/conferir` (já cobria tarefa de texto puro — as duas regras agora dizem a mesma coisa).
- Lição: encontrado pela própria conferência rodando sobre si mesma, na etapa "tentar quebrar" — regra nova também é código: testar a leitura ao pé da letra antes de subir.
