#!/usr/bin/env python3
"""
Transcreve um curso inteiro (pastas com videos/audios) para arquivos .md.

Uso:
    python3 transcrever.py "/caminho/do/curso" --saida dados/curso-vendas
    python3 transcrever.py "https://drive.google.com/drive/folders/ID" --saida dados/curso

Aceita uma pasta local OU um link de pasta publica do Google Drive (link com
"qualquer pessoa com o link"). No caso do Drive, baixa uma aula de cada vez e
apaga o video depois de extrair o audio — nao acumula GB em disco.

Preserva a estrutura de pastas do curso (modulo/aula) na saida.
E resumivel: aula ja transcrita e pulada, entao pode parar e continuar depois.

Backends (detectados nessa ordem):
    1. faster-whisper  (local, gratis)   -> pip install faster-whisper
    2. OpenAI API      (rapido, pago)    -> export OPENAI_API_KEY=...
"""

import argparse
import codecs
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
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


# ------------------------------------------------------------------ drive

RE_DRIVE = re.compile(r"drive\.google\.com/drive/folders/([A-Za-z0-9_-]+)")


def _pagina_drive(fid: str) -> str:
    for tentativa in range(4):
        r = subprocess.run(
            ["curl", "-sSL", "--max-time", "120",
             f"https://drive.google.com/drive/folders/{fid}"],
            capture_output=True, text=True)
        if r.returncode == 0 and len(r.stdout) > 5000:
            return r.stdout
        time.sleep(2 ** (tentativa + 1))
    return ""


def _listar_drive(fid: str):
    """Le a listagem que o Drive embute na propria pagina (window['_DRIVE_ivd'])."""
    html = _pagina_drive(fid)
    m = re.search(r"_DRIVE_ivd'\]\s*=\s*'(.*?)';", html, re.S)
    if not m:
        return []
    bruto = codecs.decode(m.group(1), "unicode_escape")
    texto = bruto.encode("latin1", "replace").decode("utf-8", "replace")
    try:
        entradas = json.loads(texto)[0] or []
    except Exception:
        return []
    itens = []
    for e in entradas:
        tam = e[13] if len(e) > 13 else None
        itens.append({"id": e[0], "nome": e[2], "mime": e[3],
                      "bytes": int(tam) if str(tam or "").isdigit() else None})
    return sorted(itens, key=lambda x: ordem_natural(Path(x["nome"])))


def catalogar_drive(fid: str, caminho: str = ""):
    """Desce recursivamente na pasta e devolve so os arquivos de midia."""
    achados = []
    for item in _listar_drive(fid):
        sub = f"{caminho}/{item['nome']}".lstrip("/")
        if item["mime"] == "application/vnd.google-apps.folder":
            achados += catalogar_drive(item["id"], sub)
        elif item["mime"].split("/")[0] in ("video", "audio"):
            achados.append({**item, "caminho": sub})
    return achados


def baixar_drive(fid: str, destino: Path) -> bool:
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"
    for tentativa in range(4):
        r = subprocess.run(["curl", "-sSL", "--max-time", "1800", url, "-o", str(destino)],
                           capture_output=True)
        if r.returncode == 0 and destino.exists() and destino.stat().st_size > 100_000:
            return True
        time.sleep(2 ** (tentativa + 1))
    return False


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

    fonte_drive = RE_DRIVE.search(args.curso)
    raiz = None
    if fonte_drive:
        print(f"[fonte] pasta do Google Drive {fonte_drive.group(1)}")
    else:
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

    # Cada aula vira (modulo, nome, funcao-que-poe-o-arquivo-em-disco).
    aulas = []
    if fonte_drive:
        catalogo = catalogar_drive(fonte_drive.group(1))
        if not catalogo:
            erro("nenhum video/audio na pasta do Drive.\n"
                 "A pasta precisa estar como 'qualquer pessoa com o link'.")
        for item in sorted(catalogo, key=lambda c: ordem_natural(Path(c["caminho"]))):
            partes = item["caminho"].split("/")
            modulo = "/".join(partes[:-1])
            aulas.append((modulo, Path(partes[-1]).stem,
                          (lambda i: lambda d: baixar_drive(i["id"], d))(item)))
    else:
        for arq in sorted((p for p in raiz.rglob("*")
                           if p.suffix.lower() in EXTENSOES and p.is_file()),
                          key=ordem_natural):
            modulo = str(arq.parent.relative_to(raiz)).replace(".", "")
            aulas.append((modulo, arq.stem,
                          (lambda a: lambda d: (shutil.copy(a, d), True)[1])(arq)))

    if not aulas:
        erro(f"nenhum video/audio encontrado em {args.curso}")

    saida = Path(args.saida).resolve()
    (saida / "transcricoes").mkdir(parents=True, exist_ok=True)
    print(f"[curso] {len(aulas)} aulas\n[saida] {saida}\n")

    feitas = []
    for i, (modulo, nome, obter) in enumerate(aulas, 1):
        pasta = saida / "transcricoes" / modulo
        pasta.mkdir(parents=True, exist_ok=True)
        destino = pasta / f"{i:02d}-{slug(nome)}.md"

        rotulo = f"[{i}/{len(aulas)}] {modulo}/{nome}"
        if destino.exists() and destino.stat().st_size > 400:
            print(f"{rotulo} — ja transcrita, pulando")
            feitas.append((destino, modulo, nome, "?"))
            continue

        print(f"{rotulo} — processando...", flush=True)
        try:
            with tempfile.TemporaryDirectory() as tmp:
                midia = Path(tmp) / "midia.bin"
                if not obter(midia):
                    print("  !! nao consegui obter o arquivo", file=sys.stderr)
                    continue
                dur = duracao(midia)
                audio = Path(tmp) / "audio.m4a"
                extrair_audio(midia, audio)
                midia.unlink(missing_ok=True)   # o video some antes de transcrever
                texto = transcrever(audio)
        except KeyboardInterrupt:
            print("\n[parado] rode o mesmo comando pra continuar de onde parou")
            sys.exit(130)
        except Exception as e:
            print(f"  !! falhou: {e}", file=sys.stderr)
            continue

        destino.write_text(
            f"# {nome}\n\n- **Modulo:** {modulo}\n- **Duracao:** {dur}\n\n"
            f"---\n\n{texto.strip()}\n", encoding="utf-8")
        print(f"  -> {destino.relative_to(saida)}  ({dur})")
        feitas.append((destino, modulo, nome, dur))

    indice = ["# Indice do curso\n", f"Origem: `{args.curso}`\n", f"{len(feitas)} aulas transcritas.\n"]
    modulo_atual = None
    for destino, modulo, nome, dur in feitas:
        if modulo != modulo_atual:
            indice.append(f"\n## {modulo}\n")
            modulo_atual = modulo
        indice.append(f"- [{nome}]({destino.relative_to(saida)}) — {dur}")
    (saida / "_indice.md").write_text("\n".join(indice) + "\n", encoding="utf-8")

    print(f"\n[pronto] {len(feitas)} aulas em {saida}")
    print("Proximo passo: abre o Claude Code nessa pasta e diz /curso")


if __name__ == "__main__":
    main()
