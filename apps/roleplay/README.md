# Nexo Treino — Roleplay de vendas por voz

App web onde o Claude interpreta um prospect (dono de negócio local de cidade pequena) e o vendedor da Nexo treina **por voz** três situações:

| Modo | O que treina | Fonte da metodologia |
|---|---|---|
| **Cold Call** | Ganhar 30s, gerar curiosidade, agendar a R1 | rubrica própria |
| **R1** | Diagnóstico SPIN com critérios objetivos | `.claude/skills/r1/SKILL.md` |
| **R2** | Fechamento com Pits (escala 0-10, extração de investimento, tier único) | `.claude/skills/r2/SKILL.md` |

Ao encerrar, um avaliador gera o **scorecard** (nota por etapa, checklist, perguntas que faltaram citando dados reais da conversa, coaching). Tudo fica salvo no Supabase pra acompanhar evolução.

> O `saidas/playbook-vendas-nexo-ia.md` antigo **não** é fonte deste app — ele ensina ancoragem de preço e prazo de validade, que a `/r2` proíbe. Fica pendente atualizar aquele playbook.

## Requisitos

- **Chrome ou Edge** (o reconhecimento de fala usa a Web Speech API)
- Microfone; em produção precisa de **HTTPS** (o navegador só libera o mic em secure context)

## Rodar local

```powershell
cd apps/roleplay
npm install
copy .env.example .env   # preencher ANTHROPIC_API_KEY (Supabase é opcional em dev)
npm run build            # builda o client + typecheck
npm run dev              # servidor em http://localhost:8787
```

Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` o app roda em modo memória (funciona, mas não persiste histórico).

## Banco

Migração: `supabase/migrations/20260803120000_roleplay_sessoes.sql` — aplicar **no projeto dashboard/MazyOS (`norgsipmgxbakfmkqcnl`)**, nunca no DeskcommCRM (`pdtbrtccausjlrzzsiqe`). O servidor confere o `ref` do JWT no boot e se recusa a subir com chave do projeto errado.

Aplicar via SQL Editor do Supabase (colar o arquivo) ou `supabase db push` se o CLI estiver linkado.

## Deploy na VPS (treino.nexoia.app)

A VPS já roda o `nexo_crm` (easy-install do Frappe) com **Traefik + Let's Encrypt** em 80/443. Este app entra como um container que se **anexa** à rede do Traefik via labels — sem tocar na config do CRM.

**Passo 0 — inspecionar o Traefik (uma vez):**

```bash
ssh root@<IP-DA-VPS>
docker network ls                                   # achar a rede do traefik (ex.: nexo_crm_default)
docker ps                                           # achar o container frontend do CRM
docker inspect <container-frontend> | grep -i traefik   # achar o certresolver nos labels
```

Preencher `<CONFIRMAR-REDE>` e `<CONFIRMAR-RESOLVER>` no `docker-compose.yml`.

**Passo 1 — DNS:** registro A `treino` → IP da VPS (mesmo painel usado pro `crm`).

**Passo 2 — subir:**

```bash
cd /opt && git clone <repo-NexoIAos> nexoiaos   # ou git pull se já existir
cd nexoiaos/apps/roleplay
cp .env.example .env && nano .env               # chaves reais, só na VPS
docker compose -p nexo_treino up -d --build
docker compose -p nexo_treino logs -f           # conferir "Supabase conectado"
```

**Passo 3 — validar:** abrir `https://treino.nexoia.app`, permitir o microfone, fazer uma cold call. Conferir que `https://crm.nexoia.app` segue no ar.

**Plano B** (se o Traefik do easy-install estiver com provider restrito): expor porta alta com TLS próprio via Caddy no mesmo compose — URL vira `https://treino.nexoia.app:8443`. Só usar se o passo 0 mostrar que anexar não é seguro.

**Atualizar:** `git pull && docker compose -p nexo_treino up -d --build`.

## Custo

`claude-sonnet-5` com prompt caching: ~US$ 0,05–0,15 por sessão (~R$ 0,30–0,80). Pra espremer mais, `PROSPECT_MODEL=claude-haiku-4-5` no `.env` (o scorecard continua no Sonnet).

## Arquitetura (resumo)

- **1 container**: Fastify (TS via tsx) servindo a API + o React buildado. Porta 8787.
- **Voz**: half-duplex com push-to-talk. STT = Web Speech API (pt-BR); resposta do prospect chega por SSE e o TTS (`speechSynthesis`) fala **por sentença** — latência percebida ~1-2s. Interfaces `TTSProvider`/STT plugáveis pra upgrade (ElevenLabs/Whisper) sem mexer nas telas.
- **Prompts**: `server/src/prompts/` — bloco base + bloco do modo (cacheados com `cache_control`) + card da persona (dinâmico). Avaliador com `effort: high` e saída em JSON schema.
- **Personas fixas**: `server/src/personas/fixas.ts` (nichos reais: pizzaria, academias, stand, hamburgueria — com memória de R1 embutida pro modo R2). Geração dinâmica por nicho na tela inicial.
- **Sessões**: estado em memória com autosave no Supabase a cada turno; limite de turnos/tempo por modo; prospect pode desligar (`[DESLIGOU]`).
