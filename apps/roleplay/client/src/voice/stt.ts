// STT via Web Speech API (Chrome/Edge). Push-to-talk: start() abre o mic, stop()
// fecha e resolve com o texto final. Interface plugável pra upgrade futuro (Whisper).

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function sttSupported(): boolean {
  return getCtor() !== null;
}

export class PushToTalk {
  private rec: SpeechRecognitionLike | null = null;
  private finalText = '';
  private interimText = '';
  private resolveStop: ((texto: string) => void) | null = null;

  constructor(private onInterim: (texto: string) => void) {}

  start(): void {
    const Ctor = getCtor();
    if (!Ctor) throw new Error('Reconhecimento de fala não suportado — use Chrome ou Edge.');
    this.finalText = '';
    this.interimText = '';
    const rec = new Ctor();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) this.finalText += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      this.interimText = interim;
      this.onInterim((this.finalText + interim).trim());
    };
    rec.onerror = () => {
      /* 'no-speech' e afins: o stop resolve com o que tiver */
    };
    rec.onend = () => {
      const texto = (this.finalText + this.interimText).trim();
      this.resolveStop?.(texto);
      this.resolveStop = null;
      this.rec = null;
    };
    this.rec = rec;
    rec.start();
  }

  stop(): Promise<string> {
    if (!this.rec) return Promise.resolve('');
    return new Promise((resolve) => {
      this.resolveStop = resolve;
      this.rec?.stop();
    });
  }

  cancel(): void {
    this.resolveStop = null;
    this.rec?.abort();
    this.rec = null;
  }
}
