#!/usr/bin/env python3
"""
Transcreve um curso inteiro (pastas com videos/audios) para arquivos .md.

Uso:
    python3 transcrever.py "/caminho/do/curso" --saida dados/curso-vendas

Preserva a estrutura de pastas do curso (modulo/aula) na saida.
E resumivel: aula ja transcrita e pulada, entao pode parar e continuar depois.

Backends (detectados nessa ordem):
    1. faster-whisper  (local, gratis)   -> pip install faster-whisper
    2. OpenAI API      (rapido, pago)    -> export OPENAI_API_KEY=...
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

EXTENSOES = {".mp4", ".mkv", ".mov", ".avi", ".webm", ".m4v",
             ".mp3", ".m4a", ".wav", ".aac", ".ogg", ".opus", ".flac"}

LIMITE_API_MB = 24  # a API da OpenAI corta em 25MB


def erro(msg):
    print(f"\n[erro] {msg}\n", file=sys.stderr)
    sys.exit(1)


def ordem_natural(caminho: Path):
    """Ordena 'aula 2' antes de 'aula 10'."""
    partes = re.split(r"(\d+)", str(caminho).lower())
    return [int(p) if p.isdigit() else p for p in partes]


def slug(texto: str) -> str:
    texto = re.sub(r"[^\w\s-]", "", texto, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_]+", "-", texto)[:70] or "aula"


def duracao(caminho: Path) -> str:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(caminho)],
            capture_output=True, text=True, check=True).stdout.strip()
        seg = int(float(out))
        return f"{seg // 60}min{seg % 60:02d}"
    except Exception:
        return "?"


def extrair_audio(origem: Path, destino: Path):
    """Audio mono 16kHz — o que o Whisper quer, e fica pequeno."""
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(origem),
         "-vn", "-ac", "1", "-ar", "16000", "-b:a", "48k", str(destino)],
        check=True)


# --------------------------------------------------------------- backends

def backend_local(modelo: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    print(f"[backend] faster-whisper local (modelo: {modelo})")
    wm = WhisperModel(modelo, device="auto", compute_type="int8")

    def transcrever(audio: Path) -> str:
        segmentos, _ = wm.transcribe(str(audio), language="pt", vad_filter=True)
        return " ".join(s.text.strip() for s in segmentos)

    return transcrever


def backend_api():
    chave = os.environ.get("OPENAI_API_KEY")
    if not chave:
        return None
    try:
        from openai import OpenAI
    except ImportError:
        return None
    print("[backend] OpenAI Whisper API")
    cliente = OpenAI(api_key=chave)

    def transcrever(audio: Path) -> str:
        mb = audio.stat().st_size / 1024 / 1024
        if mb > LIMITE_API_MB:
            return transcrever_em_pedacos(cliente, audio)
        with open(audio, "rb") as f:
            return cliente.audio.transcriptions.create(
                model="whisper-1", file=f, language="pt").text

    return transcrever


def transcrever_em_pedacos(cliente, audio: Path) -> str:
    """Aula longa: corta em blocos de 10 min e junta."""
    pedacos = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio),
             "-f", "segment", "-segment_time", "600", "-c", "copy",
             f"{tmp}/parte-%03d{audio.suffix}"], check=True)
        for parte in sorted(Path(tmp).glob("parte-*")):
            with open(parte, "rb") as f:
                pedacos.append(cliente.audio.transcriptions.create(
                    model="whisper-1", file=f, language="pt").text)
    return " ".join(pedacos)


# ------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser(description="Transcreve um curso inteiro pra .md")
    ap.add_argument("curso", help="pasta raiz do curso")
    ap.add_argument("--saida", default="dados/curso", help="pasta de saida")
    ap.add_argument("--modelo", default="small",
                    help="modelo do faster-whisper: tiny|base|small|medium|large-v3")
    args = ap.parse_args()

    raiz = Path(args.curso).expanduser().resolve()
    if not raiz.is_dir():
        erro(f"pasta nao encontrada: {raiz}")

    if not shutil.which("ffmpeg"):
        erro("ffmpeg nao instalado.\n"
             "  macOS:  brew install ffmpeg\n"
             "  Ubuntu: sudo apt install ffmpeg\n"
             "  Windows: winget install ffmpeg")

    transcrever = backend_local(args.modelo) or backend_api()
    if transcrever is None:
        erro("nenhum backend disponivel. Escolhe um:\n"
             "  pip install faster-whisper        (local, gratis, mais lento)\n"
             "  pip install openai + OPENAI_API_KEY=...   (na nuvem, pago, rapido)")

    aulas = sorted(
        (p for p in raiz.rglob("*") if p.suffix.lower() in EXTENSOES and p.is_file()),
        key=ordem_natural)
    if not aulas:
        erro(f"nenhum video/audio encontrado em {raiz}")

    saida = Path(args.saida).resolve()
    (saida / "transcricoes").mkdir(parents=True, exist_ok=True)
    print(f"[curso] {len(aulas)} aulas em {raiz}\n[saida] {saida}\n")

    feitas = []
    for i, aula in enumerate(aulas, 1):
        modulo = aula.parent.relative_to(raiz)
        pasta = saida / "transcricoes" / modulo
        pasta.mkdir(parents=True, exist_ok=True)
        destino = pasta / f"{i:02d}-{slug(aula.stem)}.md"

        rotulo = f"[{i}/{len(aulas)}] {modulo}/{aula.name}"
        if destino.exists() and destino.stat().st_size > 200:
            print(f"{rotulo} — ja transcrita, pulando")
            feitas.append((destino, modulo, aula))
            continue

        print(f"{rotulo} — transcrevendo...", flush=True)
        try:
            with tempfile.TemporaryDirectory() as tmp:
                audio = Path(tmp) / "audio.m4a"
                extrair_audio(aula, audio)
                texto = transcrever(audio)
        except KeyboardInterrupt:
            print("\n[parado] rode o mesmo comando pra continuar de onde parou")
            sys.exit(130)
        except Exception as e:
            print(f"  !! falhou: {e}", file=sys.stderr)
            continue

        destino.write_text(
            f"# {aula.stem}\n\n"
            f"- **Modulo:** {modulo}\n"
            f"- **Arquivo:** `{aula.name}`\n"
            f"- **Duracao:** {duracao(aula)}\n\n"
            f"---\n\n{texto.strip()}\n", encoding="utf-8")
        print(f"  -> {destino.relative_to(saida)}")
        feitas.append((destino, modulo, aula))

    indice = ["# Indice do curso\n", f"Origem: `{raiz}`\n", f"{len(feitas)} aulas transcritas.\n"]
    modulo_atual = None
    for destino, modulo, aula in feitas:
        if modulo != modulo_atual:
            indice.append(f"\n## {modulo}\n")
            modulo_atual = modulo
        rel = destino.relative_to(saida)
        indice.append(f"- [{aula.stem}]({rel}) — {duracao(aula)}")
    (saida / "_indice.md").write_text("\n".join(indice) + "\n", encoding="utf-8")

    print(f"\n[pronto] {len(feitas)} aulas em {saida}")
    print("Proximo passo: abre o Claude Code nessa pasta e diz /curso")


if __name__ == "__main__":
    main()
