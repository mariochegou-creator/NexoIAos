---
name: curso
description: >
  Transforma um curso baixado (aulas em vídeo/áudio) na metodologia de trabalho da Nexo. Guia a
  transcrição local das aulas, lê as transcrições, destila só o que muda comportamento numa call
  — closes, perguntas literais, objeções, erros — e propõe item por item o que entra em
  `_memoria/metodologia-vendas.md` e o que vira ajuste nas skills `/r1`, `/r2`, `/apn` e
  `/follow-up`. Nada é gravado sem aprovação. Use quando o usuário disser "transcreve esse
  curso", "quero trabalhar do jeito que eles ensinam", "extrai a metodologia dessas aulas",
  "peguei um curso de vendas", "assimila esse treinamento", ou /curso.
---

# /curso — do curso baixado pro jeito de trabalhar

Curso assistido não muda nada. Curso **destilado na memória** muda toda call daqui pra frente.
Esta skill faz a ponte: aula em vídeo → transcrição → metodologia acionável → skills atualizadas.

## Antes de tudo: onde o curso está?

O Claude Code na web roda num container na nuvem e **não enxerga o `Downloads` do Mario**.
Só existe transcrição se ela for gerada na máquina dele. Duas rotas:

| Rota | Quando usar |
|---|---|
| **A — Claude Code local** | Instalar o Claude Code na máquina, abrir na pasta do MazyOS e rodar `/curso` de lá. Aí ele lê `~/Downloads` direto. **É a rota boa.** |
| **B — transcrever e trazer** | Rodar o script na máquina, subir só os `.md` de transcrição. Serve quando ele está no telemóvel ou na web. |

Nas duas, o motor é o mesmo:

```bash
python3 ferramentas/transcrever-curso/transcrever.py ~/Downloads/"Nome Do Curso" \
  --saida dados/curso-vendas
```

Instalação e opções: `ferramentas/transcrever-curso/README.md`.
Curso de 10h no motor local leva algumas horas — o script é resumível, avisar isso.

---

## Passo 1 — mapear antes de ler tudo

Ler `dados/curso-*/_indice.md` e os **títulos** de todas as aulas primeiro. Devolver ao Mario um
mapa curto: quantas aulas, quantos módulos, e quais 6-10 aulas parecem carregar a metodologia
(fechamento, objeção, diagnóstico, estrutura de call) contra as que são intro, bônus e recheio.

**Confirmar com ele antes de processar.** Ele conhece o curso; pode dizer "a de fechamento é a
7, essa aí não presta". Isso poupa tempo e melhora a extração.

## Passo 2 — extrair aula por aula

Para cada aula aprovada, ler a transcrição inteira e produzir só isto:

- **Movimentos nomeados** — nome que o professor dá + o que a pessoa faz na prática
- **Perguntas literais** — copiadas na forma exata em que ele diz. Nunca parafrasear:
  a formulação *é* a técnica
- **Objeções tratadas** — a objeção, o que ela esconde, a resposta
- **Erros nomeados** — e o custo de cada um
- **Sequência** — se o professor define ordem obrigatória (etapa X só depois de Y), registrar

Aplicar o **filtro** do topo de `_memoria/metodologia-vendas.md`: se o Claude não consegue agir
diferente por causa da linha, a linha não entra. Motivação, história de bastidor e estudo de
caso ficam de fora.

Whisper erra jargão ("close" → "clós", "rapport" → "raport"). Corrigir na extração, mas não
inventar: se uma frase ficou ambígua, marcar `[trecho confuso — conferir na aula NN]` em vez
de chutar o que o professor quis dizer.

## Passo 3 — cruzar com o que já existe

Antes de propor qualquer linha nova, ler `.claude/skills/r1/SKILL.md`, `r2`, `apn` e
`follow-up`. A Nexo **já opera** com SPIN Selling e com a lógica de Pits. Cada achado do curso
cai num de quatro baldes — e o balde decide o destino:

| Balde | Destino |
|---|---|
| **Já temos, com outro nome** | Não duplicar. No máximo, acrescentar o nome do curso como apelido |
| **Novo e acionável** | Entra em `_memoria/metodologia-vendas.md` |
| **Contradiz o que a Nexo faz** | **Levar ao Mario, nunca decidir sozinho.** Ex.: curso que manda usar escassez bate de frente com o princípio 4 do fechamento |
| **Interessante mas inerte** | Fica só na transcrição |

## Passo 4 — propor, não gravar

Apresentar em blocos pequenos, cada um com: o que entra, em que arquivo, e a aula de origem.
Aprovação item por item — "aprova tudo" também vale, mas ele tem que dizer.

Depois de aprovado:
1. Escrever em `_memoria/metodologia-vendas.md`, preenchendo as seções `[a preencher]`
2. Se um achado muda a condução de uma call, editar **também** a skill correspondente —
   memória sem skill atualizada não muda o roteiro que ele leva pra reunião
3. Preencher a tabela **Origem** com curso, aulas e data
4. Oferecer `/salvar` pra commitar

## Passo 5 — o teste que fecha

Não dar por concluído sem isto: pegar um lead real de `clientes/` e rodar `/roteiro-r1` com a
memória nova. Mostrar ao Mario o antes e o depois do roteiro.

Se o roteiro não mudou, a extração falhou — voltar ao Passo 2 com o filtro mais apertado.
É o que separa "assimilei o curso" de "tenho um resumo bonito do curso".

---

## Regras

- **Nunca subir transcrição pro Git.** `dados/` está no `.gitignore` de propósito: material de
  curso pago é de terceiro. O que se versiona é a destilação — o jeito de trabalhar da Nexo.
- **Preservar a voz dele.** As frases entram na memória como o professor diz, mas o tom com o
  cliente continua sendo o de `_memoria/preferencias.md`: direto, sem papo de guru. Se o curso
  for agressivo, adaptar — e avisar que adaptou.
- **Contradição vai pra mesa, não pro arquivo.** Curso não sobrescreve princípio da casa.
