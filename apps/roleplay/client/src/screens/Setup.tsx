import { useEffect, useState } from 'react';
import type {
  CreateSessionRequest,
  Dificuldade,
  Modo,
  Persona,
  Vendedor,
} from '../../../shared/types.ts';
import { api, clearToken } from '../api.ts';
import { sttSupported } from '../voice/stt.ts';

const MODOS: { valor: Modo; titulo: string; desc: string }[] = [
  { valor: 'cold_call', titulo: 'Cold Call', desc: 'Ligação fria: ganhar 30s, gerar curiosidade, agendar a R1' },
  { valor: 'r1', titulo: 'R1 — Diagnóstico', desc: 'SPIN: situação, problema, implicação em R$, necessidade' },
  { valor: 'r2', titulo: 'R2 — Fechamento', desc: 'Pits: escala 0-10, extração de investimento, tier único' },
  {
    valor: 'reuniao_unica',
    titulo: 'Reunião Única',
    desc: '~55-60 min: diagnóstico + teste ao vivo no Google + os 3 cards, terminando em "fechamos?"',
  },
];

export default function Setup({
  onStart,
  onHistorico,
}: {
  onStart: (id: string, persona: Persona, abertura: string | null, req: CreateSessionRequest) => void;
  onHistorico: () => void;
}) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [vendedor, setVendedor] = useState<Vendedor>('david');
  const [modo, setModo] = useState<Modo>('cold_call');
  const [dificuldade, setDificuldade] = useState<Dificuldade>('media');
  const [personaSlug, setPersonaSlug] = useState<string | 'gerar'>('');
  const [nicho, setNicho] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.personas().then((p) => {
      setPersonas(p);
      if (p.length) setPersonaSlug(p[0].slug!);
    });
  }, []);

  async function iniciar() {
    setErro('');
    const req: CreateSessionRequest = { vendedor, modo, dificuldade };
    if (personaSlug === 'gerar') {
      if (!nicho.trim()) return setErro('Informe o nicho pra gerar a persona.');
      req.nicho = nicho.trim();
    } else {
      req.persona_slug = personaSlug;
    }
    setCarregando(true);
    try {
      const res = await api.createSession(req);
      onStart(res.id, res.persona, res.abertura, req);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro ao criar sessão');
      setCarregando(false);
    }
  }

  return (
    <div className="page">
      <header className="topo">
        <h1>Nexo Treino</h1>
        <div className="opcoes">
          <button className="btn ghost" onClick={onHistorico}>
            Histórico
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              clearToken();
              location.reload();
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {!sttSupported() && (
        <div className="banner aviso">
          Seu navegador não tem reconhecimento de fala — use <b>Chrome</b> ou <b>Edge</b>.
        </div>
      )}

      <section className="card">
        <h2>Quem tá treinando?</h2>
        <div className="opcoes">
          {(['david', 'mario'] as Vendedor[]).map((v) => (
            <button
              key={v}
              className={`chip ${vendedor === v ? 'ativo' : ''}`}
              onClick={() => setVendedor(v)}
            >
              {v === 'david' ? 'David' : 'Mario'}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Modo</h2>
        <div className="modos">
          {MODOS.map((m) => (
            <button
              key={m.valor}
              className={`modo-card ${modo === m.valor ? 'ativo' : ''}`}
              onClick={() => setModo(m.valor)}
            >
              <b>{m.titulo}</b>
              <span>{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Prospect</h2>
        <div className="opcoes wrap">
          {personas.map((p) => (
            <button
              key={p.slug}
              className={`chip ${personaSlug === p.slug ? 'ativo' : ''}`}
              onClick={() => setPersonaSlug(p.slug!)}
              title={p.dores.join(' • ')}
            >
              {p.nome} · {p.nicho}
            </button>
          ))}
          <button
            className={`chip ${personaSlug === 'gerar' ? 'ativo' : ''}`}
            onClick={() => setPersonaSlug('gerar')}
          >
            ✨ Gerar por nicho…
          </button>
        </div>
        {personaSlug === 'gerar' && (
          <input
            className="campo"
            placeholder="Nicho (ex.: barbearia, clínica odontológica, pet shop…)"
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
          />
        )}
      </section>

      <section className="card">
        <h2>Dificuldade</h2>
        <div className="opcoes">
          {(['facil', 'media', 'dificil'] as Dificuldade[]).map((d) => (
            <button
              key={d}
              className={`chip ${dificuldade === d ? 'ativo' : ''}`}
              onClick={() => setDificuldade(d)}
            >
              {d === 'facil' ? 'Fácil' : d === 'media' ? 'Média' : 'Difícil'}
            </button>
          ))}
        </div>
      </section>

      {erro && <div className="banner erro">{erro}</div>}

      <button className="btn primary grande" onClick={iniciar} disabled={carregando}>
        {carregando
          ? personaSlug === 'gerar'
            ? 'Criando persona…'
            : 'Iniciando…'
          : modo === 'cold_call'
            ? '📞 Ligar'
            : '🎙️ Entrar na reunião'}
      </button>
    </div>
  );
}
