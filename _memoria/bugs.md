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
