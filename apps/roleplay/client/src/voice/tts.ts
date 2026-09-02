// TTS plugável. V1: speechSynthesis do navegador (voz Google pt-BR no Chrome).
// Upgrade futuro (ElevenLabs/OpenAI): nova classe implementando TTSProvider,
// com proxy de áudio no backend — zero mudança nas telas.

export interface TTSProvider {
  speak(sentence: string): void;
  /** resolve quando tudo que foi enfileirado terminou de falar */
  waitIdle(): Promise<void>;
  cancel(): void;
}

export class BrowserTTS implements TTSProvider {
  private pending = 0;
  private idleResolvers: (() => void)[] = [];
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      this.voice =
        voices.find((v) => v.name.includes('Google') && v.lang === 'pt-BR') ??
        voices.find((v) => v.lang === 'pt-BR') ??
        voices.find((v) => v.lang.startsWith('pt')) ??
        null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  }

  speak(sentence: string): void {
    const texto = sentence.trim();
    if (!texto) return;
    const u = new SpeechSynthesisUtterance(texto);
    if (this.voice) u.voice = this.voice;
    u.lang = 'pt-BR';
    u.rate = 1.06;
    this.pending++;
    const done = () => {
      this.pending--;
      if (this.pending <= 0) {
        this.pending = 0;
        this.idleResolvers.forEach((r) => r());
        this.idleResolvers = [];
      }
    };
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
  }

  waitIdle(): Promise<void> {
    if (this.pending <= 0 && !speechSynthesis.speaking && !speechSynthesis.pending) {
      return Promise.resolve();
    }
    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }

  cancel(): void {
    speechSynthesis.cancel();
    this.pending = 0;
    this.idleResolvers.forEach((r) => r());
    this.idleResolvers = [];
  }
}

// Voz natural via backend (/api/tts → OpenAI). Busca o áudio de cada frase em
// paralelo, mas toca em ordem — a primeira frase começa a tocar enquanto o resto
// da resposta ainda está chegando.
export class BackendTTS implements TTSProvider {
  private fila: Promise<void> = Promise.resolve();
  private pendentes = 0;
  private geracao = 0;
  private audioAtual: HTMLAudioElement | null = null;
  private idleResolvers: (() => void)[] = [];

  // Aceleração aplicada NA REPRODUÇÃO — vale pra toda voz, mesmo as que ignoram
  // o parâmetro de velocidade da API (o navegador preserva o tom, não vira desenho).
  constructor(
    private fetchAudio: (texto: string) => Promise<Blob>,
    private velocidade = 1.18,
  ) {}

  speak(sentence: string): void {
    const texto = sentence.trim();
    if (!texto) return;
    const g = this.geracao;
    const audioPromise = this.fetchAudio(texto).catch(() => null);
    this.pendentes++;
    this.fila = this.fila.then(async () => {
      if (g !== this.geracao) return this.terminou();
      const blob = await audioPromise;
      if (!blob || g !== this.geracao) return this.terminou();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = this.velocidade;
      this.audioAtual = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      URL.revokeObjectURL(url);
      this.audioAtual = null;
      this.terminou();
    });
  }

  private terminou(): void {
    this.pendentes--;
    if (this.pendentes <= 0) {
      this.pendentes = 0;
      this.idleResolvers.forEach((r) => r());
      this.idleResolvers = [];
    }
  }

  waitIdle(): Promise<void> {
    if (this.pendentes <= 0) return Promise.resolve();
    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }

  cancel(): void {
    this.geracao++;
    this.audioAtual?.pause();
    this.audioAtual = null;
    this.pendentes = 0;
    this.idleResolvers.forEach((r) => r());
    this.idleResolvers = [];
    this.fila = Promise.resolve();
  }
}

/** Corta frases completas de um buffer de streaming; retorna [frases, resto]. */
export function extractSentences(buffer: string): [string[], string] {
  const sentences: string[] = [];
  let rest = buffer;
  for (;;) {
    const m = rest.match(/^([\s\S]*?[.!?…]+)(\s|$)/);
    if (!m || m[1].trim().length < 2) break;
    sentences.push(m[1].trim());
    rest = rest.slice(m[0].length);
  }
  return [sentences, rest];
}
