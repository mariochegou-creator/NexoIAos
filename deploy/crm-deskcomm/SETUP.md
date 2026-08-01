# Ambiente de teste do CRM — o que falta você fazer

O sistema já está instalado no seu PC, em `C:\Users\mario\deskcomm-teste`.

Falta uma coisa só: **criar o banco de dados**. São 3 valores que só você
consegue pegar, porque precisa entrar com a sua conta.

Tempo: **20 minutos**. Custo: **R$ 0**.

> Não precisa saber programar. É copiar e colar.

---

## Passo 1 — Criar o banco (5 min)

1. Abra https://supabase.com e entre com o Google (`mariochegou@gmail.com`)
2. Clique em **New project**
3. Preencha:

   | Campo | O que colocar |
   |---|---|
   | Name | `nexo-crm-teste` |
   | Database Password | Clique em **Generate a password** e **guarde** |
   | Region | `South America (São Paulo)` |
   | Plan | **Free** |

4. **New project** e espere ~2 minutos

> ⚠️ Crie um projeto **NOVO**. Não use o da dashboard da NEXO IA.
> Este é ambiente de teste — se der errado, a gente joga fora sem medo.
> O da dashboard tem os dados reais da operação.

---

## Passo 2 — Pegar os 3 valores (3 min)

> A Supabase muda o nome e o lugar dessas coisas de tempos em tempos.
> Se a tela não bater com o que está aqui, use o **jeito à prova de falha**
> logo abaixo.

### O endereço do banco (Project URL)

**Jeito à prova de falha:** olhe a barra de endereço do navegador com o
projeto aberto:

```
supabase.com/dashboard/project/abcdefghijklmnop
                               └────────────────┘
                                 copie este pedaço
```

Monte o endereço assim: `https://abcdefghijklmnop.supabase.co`

**Pela tela:** botão **Connect**, no topo da página — abre tudo junto.

### As duas chaves

⚙️ **Project Settings** → **API Keys**

| Para que serve | Nome atual | Nome antigo |
|---|---|---|
| Chave pública | **Publishable key** (`sb_publishable_…`) | `anon` / `public` (`eyJ…`) |
| Chave-mestra | **Secret key** (`sb_secret_…`) | `service_role` (`eyJ…`) |

Os dois formatos funcionam. A chave-mestra fica escondida — clique em
**Reveal** pra ver.

### Colar no arquivo

Abra `C:\Users\mario\deskcomm-teste\.env.local` no Bloco de Notas e cole
cada valor **depois do `=`**. Os nomes à esquerda não mudam — são do
Deskcomm, não da Supabase.

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_a_publishable_aqui
SUPABASE_SERVICE_ROLE_KEY=cole_a_secret_aqui
```

Salve e feche.

> 🔒 A `service_role` é a chave-mestra do banco. Não mande por WhatsApp,
> não coloque em print, não suba pro GitHub. Se vazar, é só gerar outra
> nessa mesma tela.

---

## Passo 3 — Montar o banco (5 min)

> ⚠️ **NÃO cole o `baseline.sql` no SQL Editor da Supabase.** Eu tinha
> mandado fazer isso e estava errado — o arquivo não foi feito pra isso.
> Ele tem 360 KB e blocos de código aninhados; o editor web divide o texto
> em comandos por conta própria e quebra funções no meio, gerando erros
> que não têm nada a ver com você:
>
> ```
> ERROR: 42P01: relation "v_agent" does not exist
> ERROR: 42704: type "public.citext" does not exist
> ```
>
> A documentação do projeto aplica por linha de comando. É o que o script
> abaixo faz — ele manda o arquivo inteiro pro banco e deixa o **Postgres**
> interpretar, que é o certo.

### 3.1 — Pegar o endereço de conexão

1. No Supabase, botão **Connect** (no topo da página)
2. Aba **Connection string** → copie a **URI**
3. Use a opção **Session pooler** (porta **5432**)

> A opção **Transaction pooler** (porta 6543) **não serve** — ela não
> permite criar tabelas.

4. Na URL copiada, troque `[YOUR-PASSWORD]` pela senha do banco que você
   guardou no passo 1
5. Cole no `.env.local`, na linha `SUPABASE_DB_URL=`:

```
SUPABASE_DB_URL=postgresql://postgres.xxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 3.2 — Rodar

Abra o PowerShell (busca do Windows → `PowerShell`) e cole:

```powershell
cd C:\Users\mario\deskcomm-teste
node aplicar-schema-nexo.mjs
```

**Se você já tentou pelo SQL Editor antes**, o banco ficou pela metade.
Use assim, que apaga e refaz do zero:

```powershell
node aplicar-schema-nexo.mjs --limpar
```

### 3.3 — O que tem que aparecer

```
╭──────────────────────────────────────────────╮
│  Banco pronto                                │
╰──────────────────────────────────────────────╯

  tabelas criadas          94
  regras de acesso (RLS)   115
  funções desprotegidas    0  OK
```

**`0` e `OK` na última linha** = as correções de segurança entraram. O
script faz os três passos de uma vez: liga as extensões que faltam, cria as
94 tabelas, e aplica as correções.

Se falhar, **nada foi gravado** — o banco desfaz tudo quando um comando
quebra. Me mande a mensagem de erro.

---

## Passo 4 — Ligar (1 min)

No mesmo PowerShell, cole:

```powershell
cd C:\Users\mario\deskcomm-teste
pnpm dev
```

Espere aparecer `Ready`. Abra no navegador:

**http://localhost:3000**

Crie sua conta na tela de cadastro e comece a mexer.

Pra desligar: volte no PowerShell e aperte `Ctrl+C`.
Pra ligar de novo depois: mesmos dois comandos acima.

---

## O que dá pra testar — e o que não dá

| Recurso | Funciona? |
|---|---|
| Funil / Kanban | ✅ |
| Cadastro de leads e contatos | ✅ |
| Histórico de tudo que acontece | ✅ |
| Pontuação de lead com justificativa | ✅ |
| Montar fluxo de follow-up | ✅ (monta, não dispara) |
| Vários usuários | ✅ |
| **Agente de IA respondendo** | ⚠️ precisa de chave paga da Anthropic |
| **WhatsApp conectado** | ❌ precisa de Docker + servidor |

As duas últimas ficam pra quando a gente subir num servidor de verdade. Pro
que interessa agora — **decidir se dá pra vender isso** — o que está de pé já
responde.

---

## As duas semanas

Use como se fosse seu cliente. Não fique só olhando tela:

- Cadastre 10 leads de mentira e mova pelo funil
- Tente encaixar o funil da NEXO IA (Captação → R1 → APN → R2 → Follow-up)
- Monte um fluxo de follow-up como você faria pra uma pizzaria
- Convide o Rian e veja se ele entende sozinho, sem você explicar

E anote, em qualquer lugar, três coisas:

1. **O que te irritou** — se irrita você, irrita o cliente
2. **O que faltou** — o que você faria diferente
3. **O que você venderia** — a tela que faria um dono de negócio pagar

Isso responde a pergunta melhor que qualquer análise minha.

---

## Se travar

| Aconteceu | Faça |
|---|---|
| `pnpm: não é reconhecido` | Feche e reabra o PowerShell |
| `SUPABASE_DB_URL está vazia` | Falta o passo 3.1 — pegar a URI em **Connect** |
| `password authentication failed` | A senha na `SUPABASE_DB_URL` está errada. Dá pra gerar outra em Settings → Database → Reset password |
| `[YOUR-PASSWORD]` na mensagem | Você colou a URL sem trocar pela senha real |
| `already exists` / `does not exist` | Banco pela metade. Rode com `--limpar` |
| Erro de variável faltando | Confira se colou os 3 valores do passo 2 e salvou o `.env.local` |
| Porta 3000 ocupada | Use `pnpm dev -- -p 3001` e acesse `localhost:3001` |
| Tela branca / erro no banco | O passo 3 não terminou. Rode com `--limpar` |
| Qualquer outra coisa | Me chame e cole a mensagem de erro |

> Erros do tipo `relation "v_agent" does not exist` só acontecem colando no
> SQL Editor. Se apareceu, você está no caminho antigo — use o script do
> passo 3.

---

## Depois

Documentos relacionados:

- [SEGURANCA.md](SEGURANCA.md) — o que eu auditei e o que ficou de fora
- [ARQUITETURA.md](ARQUITETURA.md) — as fases até valer a pena unificar com o dashboard
