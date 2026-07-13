# Corrigir integração Todoist (token 401 Unauthorized)

## Diagnóstico
O token OAuth é emitido pelo Todoist mas rejeitado nas chamadas de API (401).
Causa mais provável: app não publicado/verificado no Todoist, autenticando
uma conta que não é a do desenvolvedor nem está na lista de test users.

## Passo a passo

1. **Acessar o App Console**
   - https://developer.todoist.com/appconsole.html
   - Logar com a conta Todoist que criou o app da NEXO IA.

2. **Localizar o app**
   - Deve aparecer um app chamado algo como "NEXO IA" (criado por volta de 02/07).
   - Se não aparecer nenhum app → o app foi apagado e o Client ID/Secret salvos
     no Supabase são órfãos. Nesse caso, criar um novo app (passo 6) e
     atualizar os secrets no Supabase (passo 7) — pule os passos 3-5.

3. **Conferir o status do app**
   - Veja se existe um indicador "Test"/"Draft" vs "Published"/"Live".
   - Se estiver em modo de teste, normalmente só a conta dona do app (ou
     e-mails explicitamente adicionados) consegue gerar tokens válidos.

4. **Adicionar a conta que vai usar a integração**
   - Procure por um campo "Test users" ou "Beta testers" na página do app.
   - Adicionar o e-mail da conta Todoist do Mario/Fernando que vai conectar
     pelo dashboard.
   - Salvar.

5. **Ou publicar o app** (alternativa ao passo 4, remove a restrição de vez)
   - Procurar botão "Submit for review" / "Publish".
   - Pode exigir preencher nome, ícone e descrição do app antes de publicar.
   - Aprovação do Todoist pode levar alguns dias — pra resolver hoje, prefira
     o passo 4 (test user).

6. **Conferir Client ID e Client Secret**
   - Na página do app, copiar o **Client ID** e o **Client Secret** atuais.
   - Comparar (mentalmente, não precisa colar em lugar nenhum) se batem com
     o que está no Supabase. Se o secret já foi regenerado alguma vez depois
     de 02/07, o valor salvo no Supabase ficou desatualizado — nesse caso,
     ir direto pro passo 7.

7. **Atualizar os secrets no Supabase (só se o secret mudou)**
   ```
   npx supabase secrets set TODOIST_CLIENT_SECRET=<valor-novo> --project-ref norgsipmgxbakfmkqcnl
   npx supabase secrets set TODOIST_CLIENT_ID=<valor-novo> --project-ref norgsipmgxbakfmkqcnl
   ```
   (rodar no terminal, dentro da pasta `MazyOS`)

8. **Testar de novo**
   - No dashboard: Minha conta → Desconectar Todoist → Conectar Todoist de novo.
   - Avisar aqui assim que reconectar — eu confirmo via API se o token novo
     autentica, e reenvio a tarefa "apresentar APN la pizza" pro Todoist.
