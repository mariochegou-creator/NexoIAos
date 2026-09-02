import { useEffect, useMemo, useRef, useState } from 'react';
import type { CreateSessionRequest, Persona, Scorecard, Turn } from '../../../shared/types.ts';
import { LIMITES, MARCADOR_DESLIGOU, MODO_LABEL } from '../../../shared/types.ts';
import { api, streamTurn } from '../api.ts';
import { PushToTalk, RecorderSTT, recorderSupported, sttSupported } from '../voice/stt.ts';
import { BackendTTS, BrowserTTS, extractSentences, type TTSProvider } from '../voice/tts.ts';

type Estado = 'idle' | 'listening' | 'thinking' | 'speaking' | 'avaliando';

export default function Session({
  sessionId,
  persona,
  abertura,
  req,
  vozApi,
  onFinish,
  onAbandon,
}: {
  sessionId: string;
  persona: Persona;
  abertura: string | null;
  req: CreateSessionRequest;
  vozApi: boolean;
  onFinish: (scorecard: Scorecard, duracao: number) => void;
  onAbandon: () => void;
}) {
  const [estado, setEstado] = useState<Estado>('idle');
  const [turns, setTurns] = useState<Turn[]>(
    abertura ? [{ papel: 'prospect', texto: abertura, ts: new Date().toISOString() }] : [],
  );
  const [interim, setInterim] = useState('');
  const [parcial, setParcial] = useState(''); // fala do prospect em streaming
  const [desligou, setDesligou] = useState(false);
  const [erro, setErro] = useState('');
  const [segundos, setSegundos] = useState(0);
  const [chamando, setChamando] = useState(Boolean(abertura));

  // Voz do servidor (OpenAI) quando disponível; senão, a do navegador
  const usaGravador = vozApi && recorderSupported();
  const tts = useMemo<TTSProvider>(
    () => (vozApi ? new BackendTTS((t) => api.tts(t, persona.voz)) : new BrowserTTS()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const ptt = useMemo(() => new PushToTalk(setInterim, setErro), []);
  const recorder = useMemo(() => new RecorderSTT(), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  const limite = LIMITES[req.modo];

  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => {
      clearInterval(t);
      tts.cancel();
      ptt.cancel();
      recorder.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cold call: toca o "tuuu... tuuu" visual antes do prospect atender
  useEffect(() => {
    if (!abertura) return;
    const t1 = setTimeout(() => tts.speak(abertura), 1400);
    const t2 = setTimeout(() => setChamando(false), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, parcial, interim]);

  // Push-to-talk via barra de espaço
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && estadoRef.current === 'idle' && !desligou) {
        e.preventDefault();
        comecarFala();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && estadoRef.current === 'listening') {
        e.preventDefault();
        terminarFala();
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desligou]);

  async function comecarFala() {
    if (estadoRef.current !== 'idle' || desligou) return;
    setErro('');
    tts.cancel(); // half-duplex: mic abre, prospect cala
    try {
      if (usaGravador) {
        setEstado('listening');
        await recorder.start();
      } else {
        ptt.start();
        setEstado('listening');
      }
    } catch (e) {
      setEstado('idle');
      setErro(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'O navegador bloqueou o microfone. Clique no cadeado 🔒 na barra de endereço → Microfone → Permitir.'
          : e instanceof Error
            ? e.message
            : 'erro no microfone',
      );
    }
  }

  async function terminarFala() {
    if (estadoRef.current !== 'listening') return;
    setEstado('thinking');
    let texto = '';
    try {
      if (usaGravador) {
        const audio = await recorder.stop();
        if (audio.size < 1000) {
          setEstado('idle');
          return;
        }
        texto = await api.stt(audio);
      } else {
        texto = await ptt.stop();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'não consegui entender — tente de novo');
      setEstado('idle');
      return;
    }
    setInterim('');
    if (!texto.trim()) {
      setEstado('idle');
      return;
    }
    setTurns((t) => [...t, { papel: 'vendedor', texto, ts: new Date().toISOString() }]);

    let buffer = '';
    let mostrado = '';
    let comecouFalar = false;
    try {
      const completo = await streamTurn(sessionId, texto, (delta) => {
        buffer += delta;
        // pra primeira fala sair mais cedo, corta também na primeira vírgula
        if (!comecouFalar) {
          const clausula = buffer.match(/^([^,.!?…]{18,}?,)\s/);
          if (clausula) {
            const limpa = clausula[1].replaceAll(MARCADOR_DESLIGOU, '').trim();
            tts.speak(limpa);
            comecouFalar = true;
            mostrado += limpa;
            buffer = buffer.slice(clausula[0].length);
            setEstado('speaking');
          }
        }
        // corta frases completas e já manda pro TTS (latência percebida cai)
        const [frases, resto] = extractSentences(buffer);
        for (const f of frases) {
          const limpa = f.replaceAll(MARCADOR_DESLIGOU, '').trim();
          if (limpa) {
            tts.speak(limpa);
            comecouFalar = true;
          }
          mostrado += (mostrado ? ' ' : '') + limpa;
        }
        buffer = resto;
        if (comecouFalar) setEstado('speaking');
        setParcial((mostrado + ' ' + buffer.replaceAll(MARCADOR_DESLIGOU, '')).trim());
      });
      // resto que não terminou em pontuação
      const restoLimpo = buffer.replaceAll(MARCADOR_DESLIGOU, '').trim();
      if (restoLimpo) tts.speak(restoLimpo);

      const encerrou = completo.includes(MARCADOR_DESLIGOU);
      const textoLimpo = completo.replaceAll(MARCADOR_DESLIGOU, '').trim();
      setParcial('');
      setTurns((t) => [...t, { papel: 'prospect', texto: textoLimpo, ts: new Date().toISOString() }]);
      setEstado('speaking');
      await tts.waitIdle();
      if (encerrou) setDesligou(true);
      setEstado('idle');
    } catch (e) {
      setParcial('');
      setErro(e instanceof Error ? e.message : 'erro na resposta do prospect');
      setEstado('idle');
    }
  }

  async function encerrar(abandonar: boolean) {
    tts.cancel();
    ptt.cancel();
    recorder.dispose();
    if (abandonar) {
      await api.finishSession(sessionId, true).catch(() => undefined);
      onAbandon();
      return;
    }
    setEstado('avaliando');
    try {
      const res = await api.finishSession(sessionId, false);
      if (res.scorecard) onFinish(res.scorecard, res.duracao_segundos ?? segundos);
      else onAbandon(); // sessão curta demais → abandonada
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro na avaliação');
      setEstado('idle');
    }
  }

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');
  const estourouTempo = segundos > limite.maxMinutos * 60;

  const rotuloEstado: Record<Estado, string> = {
    idle: desligou ? 'Ligação encerrada' : 'Segure pra falar',
    listening: '🎙️ Ouvindo você…',
    thinking: '● ● ●',
    speaking: `${persona.nome} falando`,
    avaliando: 'Avaliando a sessão…',
  };

  if (chamando) {
    return (
      <div className="page sessao chamando-tela">
        <div className="chamando-box">
          <div className="chamando-icone">📞</div>
          <h2>Chamando {persona.nome}…</h2>
          <div className="sub">
            {persona.negocio} · {persona.cidade}
          </div>
          <div className="chamando-pontos">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page sessao">
      <header className="topo chamada">
        <div>
          <b>{persona.nome}</b> · {persona.negocio}
          <div className="sub">
            {persona.cidade} · {MODO_LABEL[req.modo] ?? req.modo} · {req.dificuldade}
          </div>
        </div>
        <div className={`timer ${estourouTempo ? 'estourou' : ''}`}>
          {mm}:{ss}
          {estourouTempo && <span className="sub"> passou do alvo ({limite.maxMinutos}min)</span>}
        </div>
      </header>

      {req.modo === 'reuniao_unica' && persona.varredura && (
        <details className="card varredura">
          <summary>📋 Sua pesquisa antes da call — pra narrar o teste ao vivo</summary>
          <div className="sub">
            Termo: <b>{persona.varredura.termo_busca}</b> · Posição: <b>{persona.varredura.posicao}</b>
          </div>
          <ul>
            {persona.varredura.concorrentes_na_frente.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div className="sub">
            Site próprio: {persona.varredura.tem_site ? 'sim' : 'não'} · Instagram:{' '}
            {persona.varredura.tem_instagram ? 'sim' : 'não'} · Nota Google: {persona.varredura.nota_google}
          </div>
        </details>
      )}

      <div className="transcricao" ref={scrollRef}>
        {turns.map((t, i) => (
          <div key={i} className={`fala ${t.papel}`}>
            <span className="quem">{t.papel === 'vendedor' ? 'Você' : persona.nome}</span>
            {t.texto}
          </div>
        ))}
        {parcial && (
          <div className="fala prospect parcial">
            <span className="quem">{persona.nome}</span>
            {parcial}
          </div>
        )}
        {estado === 'listening' && (
          <div className="fala vendedor parcial">
            <span className="quem">Você</span>
            {interim || (usaGravador ? '🎙️ gravando…' : '…')}
          </div>
        )}
      </div>

      {erro && <div className="banner erro">{erro}</div>}
      {desligou && (
        <div className="banner aviso">O prospect encerrou a ligação. Encerre pra ver seu scorecard.</div>
      )}

      <div className="controles">
        <button
          className={`ptt ${estado}`}
          disabled={desligou || estado === 'thinking' || estado === 'avaliando'}
          onMouseDown={comecarFala}
          onMouseUp={terminarFala}
          onMouseLeave={() => estado === 'listening' && terminarFala()}
          onTouchStart={(e) => {
            e.preventDefault();
            comecarFala();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            terminarFala();
          }}
        >
          {rotuloEstado[estado]}
        </button>
        <div className="acoes">
          <button className="btn ghost" onClick={() => encerrar(true)} disabled={estado === 'avaliando'}>
            Abandonar
          </button>
          <button className="btn primary" onClick={() => encerrar(false)} disabled={estado === 'avaliando'}>
            {estado === 'avaliando' ? 'Avaliando…' : 'Encerrar e avaliar'}
          </button>
        </div>
        {sttSupported() && <div className="dica">segure o botão (ou a barra de espaço) enquanto fala</div>}
      </div>
    </div>
  );
}
