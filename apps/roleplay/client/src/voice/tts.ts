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
