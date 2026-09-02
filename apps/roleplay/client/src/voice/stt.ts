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

export function recorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
}

// Gravador pro STT do servidor (Whisper): grava webm/opus enquanto o botão está
// pressionado; stop() devolve o áudio pra transcrever no backend.
// O stream do microfone fica ABERTO entre os turnos (menos delay ao apertar o
// botão); dispose() libera de vez ao sair da sessão.
export class RecorderSTT {
  private mr: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    if (!this.stream || !this.stream.active) {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
    this.chunks = [];
    this.mr = mime ? new MediaRecorder(this.stream, { mimeType: mime }) : new MediaRecorder(this.stream);
    this.mr.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mr.start();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const mr = this.mr;
      if (!mr) return resolve(new Blob([]));
      mr.onstop = () => {
        const blob = new Blob(this.chunks, { type: mr.mimeType || 'audio/webm' });
        this.mr = null;
        this.chunks = [];
        resolve(blob);
      };
      mr.stop();
    });
  }

  cancel(): void {
    try {
      this.mr?.stop();
    } catch {
      /* já parado */
    }
    this.mr = null;
    this.chunks = [];
  }

  /** Libera o microfone de vez (sair da sessão). */
  dispose(): void {
    this.cancel();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}

export class PushToTalk {
  private rec: SpeechRecognitionLike | null = null;
  private finalText = '';
  private interimText = '';
  private resolveStop: ((texto: string) => void) | null = null;

  constructor(
    private onInterim: (texto: string) => void,
    private onError?: (mensagem: string) => void,
  ) {}

  private static readonly ERROS: Record<string, string> = {
    'not-allowed':
      'O navegador bloqueou o microfone. Clique no cadeado 🔒 na barra de endereço → Microfone → Permitir, e recarregue a página.',
    'service-not-allowed':
      'O navegador bloqueou o serviço de voz. Use o Google Chrome e permita o microfone no cadeado 🔒 da barra de endereço.',
    'audio-capture':
      'Nenhum microfone encontrado. Confira nas configurações do Windows qual é o microfone padrão.',
    network: 'O reconhecimento de voz precisa de internet e ela falhou agora. Tente de novo.',
    aborted: '',
    'no-speech': '',
  };

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
    rec.onerror = (ev) => {
      const msg = PushToTalk.ERROS[ev.error] ?? `Erro do microfone: ${ev.error}`;
      if (msg) this.onError?.(msg);
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
