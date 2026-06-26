---
name: sync-mazyos
description: >
  Verifica se o repositório MazyOS original recebeu atualizações e mostra o que mudou de forma
  organizada por categoria (novas skills, configs, templates, etc.) antes de qualquer merge.
  O usuário decide o que absorver. Só faz merge e push quando autorizado explicitamente.
  Use quando o usuário disser "tem atualização do mazyos?", "o que saiu no mazyos",
  "sincronizar com mazyos", "update do mazyos", "novidades do mazyos", ou /sync-mazyos.
---

# /sync-mazyos — Verificar e absorver atualizações do MazyOS

Skill que mantém o NexoIAos atualizado com o repositório original sem perder as suas
customizações. O princípio é: **você vê antes, você decide depois**.

Nunca faz merge automático. Toda atualização passa pelo seu filtro primeiro.

---

## Workflow

### Passo 1 — Buscar atualizações

Rodar o fetch sem modificar nada:

```bash
git fetch upstream
```

### Passo 2 — Verificar se há novidades

```bash
git log HEAD..upstream/main --oneline
```

Se não retornar nada: informar que o NexoIAos já está na versão mais recente do MazyOS e encerrar.

Se retornar commits: seguir para o Passo 3.

### Passo 3 — Mapear o que mudou por categoria

Rodar para ver os arquivos alterados:

```bash
git diff HEAD upstream/main --name-only
```

Organizar os arquivos por categoria e apresentar assim:

```
## Atualizações disponíveis do MazyOS
[X] commits novos desde a última sincronização

### Novas skills
- .claude/skills/[nome]/ → nova skill /[nome]

### Skills atualizadas
- .claude/skills/[nome]/SKILL.md → mudanças na skill existente

### CLAUDE.md
- mudanças no arquivo principal de contexto

### Templates
- templates/[arquivo] → novo template ou atualização

### Outros arquivos
- [arquivo] → descrição breve
```

Para cada skill nova, rodar:
```bash
git show upstream/main:.claude/skills/[nome]/SKILL.md | head -10
```
E mostrar o `name` e `description` do frontmatter pra o usuário saber do que se trata.

### Passo 4 — Perguntar o que fazer

Apresentar as opções:

```
O que você quer fazer?

1. Absorver tudo — merge completo com upstream/main
2. Escolher por item — cherry-pick dos commits que quiser
3. Só registrar — não fazer nada agora, só anotar o que tem disponível
```

Aguardar a escolha antes de qualquer ação.

### Passo 5a — Se escolher absorver tudo

Avisar antes:
> "Isso vai trazer TODAS as mudanças do MazyOS para o NexoIAos. Se você tiver
> alterações nos mesmos arquivos, pode gerar conflito. Confirma?"

Se confirmar:
```bash
git merge upstream/main
git push origin main
```

Se houver conflito, informar quais arquivos conflitaram e orientar a resolver antes do push.

### Passo 5b — Se escolher por item

Listar os commits com hash e descrição:
```bash
git log HEAD..upstream/main --oneline
```

Pedir quais hashes quer trazer. Para cada um:
```bash
git cherry-pick [hash]
```

Após todos os cherry-picks aprovados:
```bash
git push origin main
```

### Passo 5c — Se escolher só registrar

Salvar um resumo em `saidas/sync-mazyos-[data].md` com:
- Data da verificação
- Commits disponíveis
- O que cada um adiciona
- Status: "pendente de revisão"

---

## Regras de segurança

- **Nunca rodar `git merge` sem confirmação explícita do usuário.**
- **Nunca rodar `git push --force`.** Se der conflito, resolver via merge manual.
- Se o merge gerar conflito: listar os arquivos em conflito, explicar o que cada lado tem,
  e aguardar instrução. Não tentar resolver conflito automaticamente.
- Antes de qualquer merge, verificar se há mudanças não commitadas:
  ```bash
  git status
  ```
  Se houver, avisar e sugerir commitar ou fazer stash antes de prosseguir.

---

## Dica de uso

Rodar `/sync-mazyos` regularmente — uma vez por semana já é suficiente pra não acumular
muita diferença. Quanto mais commits acumulados, maior o risco de conflito no merge.

Para saber quando foi a última sincronização:
```bash
git log --oneline | grep -i "merge\|upstream" | head -3
```
