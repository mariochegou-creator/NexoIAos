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

### [ABERTO] 2026-08-26 — dashboard CRM (deploy/dashboard-nexo-ia.html) — quebra sem mensagem quando os CDNs não carregam
- Sintoma: a página depende de 3 CDNs externos (supabase-js, chart.js, Google Fonts). Se o supabase-js não carregar (conexão lenta, CDN fora, rede corporativa bloqueando), o JS quebra com `TypeError: Cannot read properties of undefined (reading 'createClient')` — a tela de login aparece normal, mas o botão "Entrar" não funciona e o usuário não recebe NENHUM aviso. Reproduzido em smoke test com Chromium/Playwright bloqueando os CDNs.
- Causa: nenhuma verificação de que `supabase`/`Chart` existem antes de usar; sem fallback nem mensagem de erro visível.
- Correção: (pendente) checar se as libs carregaram ao iniciar; se não, mostrar aviso visível ("Sem conexão — recarregue a página") e desabilitar o Entrar em vez de falhar em silêncio.
- O que mais podia quebrar: (avaliar na correção) mesmo padrão pode existir nas outras páginas de deploy/ (crm-deskcomm, crm-frappe, index.html).
- Lição: teste de caminho infeliz "serviço externo fora do ar" pega bug que nunca aparece no teste feliz — a tela parece perfeita e está quebrada.

### [FECHADO] 2026-08-26 — CLAUDE.md (regras de qualidade) — regra de disparo do /conferir ambígua
- Sintoma: a regra dizia "antes de qualquer commit+push → acionar /conferir". Lida ao pé da letra, todo `/salvar` de conteúdo (proposta, post, texto) dispararia conferência de código sem necessidade — atrito em toda gravação de trabalho.
- Causa: redação genérica demais na primeira versão da regra; não distinguia push de código de push de conteúdo.
- Correção: regra reescrita pra "commit+push de código ou entrega ao cliente", com exceção explícita pro `/salvar` de conteúdo.
- O que mais podia quebrar: fluxo do `/salvar` (verificado: descrição da skill não conflita) e o "Quando NÃO rodar" do `/conferir` (já cobria tarefa de texto puro — as duas regras agora dizem a mesma coisa).
- Lição: encontrado pela própria conferência rodando sobre si mesma, na etapa "tentar quebrar" — regra nova também é código: testar a leitura ao pé da letra antes de subir.
