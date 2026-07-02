---
name: novo-projeto
description: >
  Cria uma pasta de projeto nova com `CLAUDE.md` dedicado, depois de uma entrevista curta sobre
  o projeto (cliente, objetivo, entregas previstas). Use quando o usuário disser "novo projeto",
  "novo cliente", "/novo-projeto", "começar projeto pra X" ou pedir pra estruturar um trabalho novo.
---

# /novo-projeto — Pasta de projeto novo com contexto dedicado

Quando o usuário começa um projeto novo (cliente, iniciativa, produto), cria uma pasta com `CLAUDE.md` próprio que herda contexto da raiz e adiciona o que é específico do projeto.

## Workflow

### Passo 1 — Entrevista (4 perguntas)

1. "Qual o nome do projeto ou cliente?"
2. "É um cliente novo, projeto interno ou iniciativa pessoal?"
3. "Qual o objetivo principal? (uma frase)"
4. "Que tipo de entrega vai ter? (ex: ads, site, conteúdo, automação, proposta — pode ser mais de uma)"

### Passo 2 — Decidir local

Baseado na resposta 2:

- **Cliente novo:** criar em `clientes/<Nome>/` (ou na pasta equivalente do perfil — ler `CLAUDE.md` da raiz pra confirmar a convenção)
- **Projeto interno:** criar em `projetos/<nome>/` (criar `projetos/` se não existir)
- **Iniciativa pessoal:** perguntar onde o usuário prefere

### Passo 3 — Estrutura básica

Criar a pasta com:

- `CLAUDE.md` do projeto (instruções herdadas + específicas)
- `briefing.md` (com o que foi coletado na entrevista)
- `roteiros/` — pasta sempre criada, independente das entregas (todo cliente pode ter um reel)
- Subpastas conforme as entregas mencionadas (ex: se mencionou "ads e conteúdo", criar `ads/` e `conteudo/`)

### Passo 4 — Conteúdo do `CLAUDE.md` do projeto

Template:

```markdown
# [Nome do projeto]

> Projeto criado em [data]. Pasta dedicada — instruções aqui sobrescrevem as da raiz quando relevantes.

## Sobre

[Objetivo da resposta 3]

## Tipo

[Cliente novo / Projeto interno / Iniciativa pessoal]

## Entregas previstas

- [entrega 1 da resposta 4]
- [entrega 2 da resposta 4]
- ...

## Onde salvar o que

- Briefings e contexto: nessa pasta na raiz
- Entregas: cada subpasta criada (ads/, conteudo/, site/, etc.)

## Contexto que herda da raiz

Esse projeto herda automaticamente o tom de voz, marca e contexto do negócio definidos em `_memoria/` e `identidade/` da raiz. Não duplicar essas informações aqui.

## Específico desse projeto

[Vazio — preencher com regras que valem só pra esse projeto, conforme for descobrindo]
```

### Passo 5 — Criar .nexo-status.md e registrar no dashboard

`/novo-projeto` sempre cria o registro em `leads` (funil pré-fechamento) — nunca em `clientes` diretamente, mesmo que a conversa já pareça bem encaminhada. A promoção pra cliente fechado é feita depois, pelo `/sync` (ou direto na dashboard, na aba Funil Comercial), nunca aqui.

Criar o arquivo `.nexo-status.md` dentro da pasta do projeto com os dados coletados na entrevista:

```markdown
---
lead_id: 
cliente_id: 
status: captacao
valor: 0
servicos: [entregas mencionadas na entrevista]
proximo_passo: Agendar R1
resp: Mario Brandao
obs: 
---
```

Em seguida, executar o registro na tabela `leads` via curl (credenciais em `_config/nexo-db.md`):

```bash
curl -s -X POST "https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1/leads" \
  -H "apikey: SB_SERVICE" \
  -H "Authorization: Bearer SB_SERVICE" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"nome\":\"NOME_DO_CLIENTE\",\"etapa_funil\":\"captacao\",\"valor_estimado\":0,\"obs\":\"SERVICOS\",\"responsavel\":\"Mario Brandao\"}"
```

Salvar o `id` retornado no campo `lead_id` do `.nexo-status.md` (não em `supabase_id` — esse nome ficou ambíguo desde que existe a distinção lead/cliente).

Se o curl falhar, criar o arquivo `.nexo-status.md` mesmo assim — o `/sync` conseguirá criar o registro depois.

Criar também a pasta `roteiros/` dentro da pasta do projeto (se ainda não existir), com um README mínimo:

```markdown
# Roteiros — [Nome do cliente]

Pasta para roteiros de Reels e vídeos de influencer.

Use `/roteiro` para criar um novo roteiro para esse cliente.
```

### Passo 6 — Resumo

Responder pro usuário:

```
Pasta criada: [caminho]
✓ CLAUDE.md do projeto
✓ briefing.md
✓ .nexo-status.md
✓ Subpastas: [lista]
✓ Cliente registrado no dashboard NEXO IA

Quando for trabalhar nesse projeto, abre o terminal já dentro da pasta.
Use /sync a qualquer momento para atualizar o dashboard com o estado atual.
```

## Regras

- Nome de pasta: usar o nome como o usuário falou, sem normalizar agressivamente (manter acentos, espaços viram hífen, mas o nome reconhecível)
- Não criar subpastas que não foram pedidas ("pra organizar melhor"). Só o que foi mencionado nas entregas
- Se o cliente/projeto já existe (pasta com mesmo nome), avisar e perguntar se é pra adicionar dentro ou criar com sufixo
