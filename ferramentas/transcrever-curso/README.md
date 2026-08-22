# Transcrever curso

Pega uma pasta de curso baixado (vídeos separados por módulo) e devolve uma transcrição
`.md` por aula, preservando a estrutura de pastas.

## Por que existe

O Claude Code na web roda num container na nuvem — ele **não enxerga** o seu `Downloads`.
Este script roda na **sua máquina**, onde o curso está, e produz texto. O texto é que vai
pro Claude.

## Instalar (uma vez)

```bash
# 1. ffmpeg — extrai o áudio do vídeo
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/WSL
winget install ffmpeg        # Windows

# 2. escolher UM motor de transcrição:

# opção A — local, de graça, mais lento (recomendado pra curso grande)
pip install faster-whisper

# opção B — API da OpenAI, rápido, ~US$0,006/min (~US$3,60 por 10h de curso)
pip install openai
export OPENAI_API_KEY=sk-...
```

## Rodar

Curso numa pasta local:

```bash
python3 ferramentas/transcrever-curso/transcrever.py \
  ~/Downloads/"Nome Do Curso" \
  --saida dados/curso-vendas
```

Curso numa pasta do Google Drive (link "qualquer pessoa com o link"):

```bash
python3 ferramentas/transcrever-curso/transcrever.py \
  "https://drive.google.com/drive/folders/SEU_ID_AQUI" \
  --saida dados/curso-vendas
```

A rota do Drive é a que resolve o problema de o Claude Code na web não enxergar o teu
disco: se o curso está no Drive com link público, ele roda direto na sessão da nuvem, sem
precisares instalar nada. Baixa uma aula de cada vez e apaga o vídeo assim que extrai o
áudio — não acumula GB.

Opções:

| flag | o que faz |
|---|---|
| `--saida` | pasta de destino (padrão `dados/curso`) |
| `--modelo` | `tiny`\|`base`\|`small`\|`medium`\|`large-v3` — só no motor local. `small` é o melhor custo/benefício em PT-BR; `medium` se o áudio for ruim |

## Detalhes que importam

- **É resumível.** Aula já transcrita é pulada. Pode fechar o terminal no meio e rodar o
  mesmo comando depois. Curso de 10h leva horas no motor local — conte com isso.
- **A saída cai em `dados/`, que está no `.gitignore`.** De propósito: transcrição de curso
  pago é material de terceiro, não sobe pro GitHub. O que sobe é a metodologia destilada em
  `_memoria/metodologia-vendas.md` — que é o seu jeito de trabalhar, não o material deles.
- **Nada de vídeo fica no repositório.** Só o `.md` da transcrição.
- **Whisper erra nome próprio e jargão.** "close" vira "clós", "rapport" vira "raport". Não
  atrapalha a extração da metodologia, mas não trate a transcrição como citação literal.

## Depois de transcrever

Abre o Claude Code na pasta do MazyOS e diz `/curso`. Ele lê as transcrições, extrai a
metodologia e propõe o que entra na memória — você aprova item por item.
