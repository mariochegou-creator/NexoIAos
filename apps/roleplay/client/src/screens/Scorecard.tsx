import type { CreateSessionRequest, Scorecard as ScorecardType } from '../../../shared/types.ts';

function corNota(n: number): string {
  if (n >= 7) return 'boa';
  if (n >= 5) return 'media';
  return 'ruim';
}

const DESFECHO_LABEL: Record<string, string> = {
  agendou: '✅ Agendou a R1',
  nao_agendou: '➖ Não agendou',
  desligou: '📵 Prospect desligou',
  pedido: '✅ Fechou (pedido)',
  avanco: '👍 Avanço com data',
  continuacao: '⚠️ Continuação ("vou pensar")',
  nao_venda: '❌ Não-venda',
};

export default function Scorecard({
  scorecard,
  duracao,
  req,
  onNova,
  onHistorico,
}: {
  scorecard: ScorecardType;
  duracao: number;
  req: CreateSessionRequest;
  onNova: () => void;
  onHistorico: () => void;
}) {
  const s = scorecard;
  return (
    <div className="page">
      <header className="topo">
        <h1>Scorecard</h1>
        <div className="sub">
          {req.modo === 'cold_call' ? 'Cold Call' : req.modo.toUpperCase()} · {Math.round(duracao / 60)}
          min
        </div>
      </header>

      <section className="card notao">
        <div className={`nota-grande ${corNota(s.nota)}`}>{s.nota.toFixed(1)}</div>
        {s.desfecho && <div className="desfecho">{DESFECHO_LABEL[s.desfecho] ?? s.desfecho}</div>}
      </section>

      {s.flags.length > 0 && (
        <section className="card flags">
          {s.flags.map((f, i) => (
            <div key={i} className="banner erro">
              🚩 {f}
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>Por etapa</h2>
        {s.etapas.map((e, i) => (
          <div key={i} className="etapa">
            <div className="etapa-head">
              <b>{e.nome}</b>
              <span className={`badge ${corNota(e.nota)}`}>{e.nota.toFixed(1)}</span>
            </div>
            <div className="barra">
              <div className={`preenchido ${corNota(e.nota)}`} style={{ width: `${e.nota * 10}%` }} />
            </div>
            <p>{e.comentario}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Checklist</h2>
        {s.checklist.map((c, i) => (
          <div key={i} className="check-item">
            <span className={c.ok ? 'ok' : 'nok'}>{c.ok ? '✓' : '✗'}</span>
            <div>
              <b>{c.item}</b>
              <p>{c.comentario}</p>
            </div>
          </div>
        ))}
      </section>

      {s.perguntas_que_faltaram.length > 0 && (
        <section className="card">
          <h2>Perguntas que faltaram</h2>
          {s.perguntas_que_faltaram.map((p, i) => (
            <blockquote key={i}>"{p}"</blockquote>
          ))}
        </section>
      )}

      <section className="card coaching">
        <h2>Coaching</h2>
        <p>{s.coaching}</p>
      </section>

      <div className="acoes centro">
        <button className="btn ghost" onClick={onHistorico}>
          Histórico
        </button>
        <button className="btn primary grande" onClick={onNova}>
          Nova sessão
        </button>
      </div>
    </div>
  );
}
