import { useEffect, useState } from 'react';
import type { SessionDetail, SessionSummary } from '../../../shared/types.ts';
import { MODO_LABEL } from '../../../shared/types.ts';
import { api } from '../api.ts';

function corNota(n: number): string {
  if (n >= 7) return 'boa';
  if (n >= 5) return 'media';
  return 'ruim';
}

export default function History({ onVoltar }: { onVoltar: () => void }) {
  const [vendedor, setVendedor] = useState('');
  const [modo, setModo] = useState('');
  const [sessoes, setSessoes] = useState<SessionSummary[]>([]);
  const [detalhe, setDetalhe] = useState<SessionDetail | null>(null);

  useEffect(() => {
    api
      .listSessions({ vendedor: vendedor || undefined, modo: modo || undefined })
      .then(setSessoes)
      .catch(() => setSessoes([]));
  }, [vendedor, modo]);

  const finalizadas = sessoes.filter((s) => s.nota !== null);
  const media =
    finalizadas.length > 0
      ? finalizadas.reduce((acc, s) => acc + (s.nota ?? 0), 0) / finalizadas.length
      : null;
  // evolução: da mais antiga pra mais recente
  const evolucao = [...finalizadas].reverse();

  if (detalhe) {
    return (
      <div className="page">
        <header className="topo">
          <h1>
            {detalhe.persona_nome} · {MODO_LABEL[detalhe.modo]}
          </h1>
          <button className="btn ghost" onClick={() => setDetalhe(null)}>
            Voltar
          </button>
        </header>
        {detalhe.scorecard && (
          <section className="card notao">
            <div className={`nota-grande ${corNota(detalhe.scorecard.nota)}`}>
              {detalhe.scorecard.nota.toFixed(1)}
            </div>
            <p>{detalhe.scorecard.coaching}</p>
          </section>
        )}
        <section className="card">
          <h2>Transcrição</h2>
          <div className="transcricao estatica">
            {detalhe.transcricao.map((t, i) => (
              <div key={i} className={`fala ${t.papel}`}>
                <span className="quem">{t.papel === 'vendedor' ? 'Vendedor' : detalhe.persona_nome}</span>
                {t.texto}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topo">
        <h1>Histórico</h1>
        <button className="btn ghost" onClick={onVoltar}>
          Voltar
        </button>
      </header>

      <section className="card">
        <div className="opcoes">
          <select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
            <option value="">Todos</option>
            <option value="david">David</option>
            <option value="mario">Mario</option>
          </select>
          <select value={modo} onChange={(e) => setModo(e.target.value)}>
            <option value="">Todos os modos</option>
            <option value="cold_call">Cold Call</option>
            <option value="r1">R1</option>
            <option value="r2">R2</option>
            <option value="reuniao_unica">Reunião Única</option>
          </select>
          {media !== null && (
            <span className={`badge ${corNota(media)}`}>média {media.toFixed(1)}</span>
          )}
        </div>
        {evolucao.length > 1 && (
          <div className="evolucao">
            {evolucao.map((s) => (
              <div
                key={s.id}
                className={`ev-barra ${corNota(s.nota ?? 0)}`}
                style={{ height: `${Math.max(8, (s.nota ?? 0) * 10)}%` }}
                title={`${s.nota?.toFixed(1)} — ${new Date(s.created_at).toLocaleDateString('pt-BR')}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        {sessoes.length === 0 && <p className="sub">Nenhuma sessão ainda.</p>}
        {sessoes.map((s) => (
          <button key={s.id} className="linha-sessao" onClick={() => api.getSession(s.id).then(setDetalhe)}>
            <div>
              <b>
                {s.persona_nome} · {s.persona_negocio}
              </b>
              <div className="sub">
                {MODO_LABEL[s.modo]} · {s.vendedor === 'david' ? 'David' : 'Mario'} ·{' '}
                {new Date(s.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {s.duracao_segundos ? ` · ${Math.round(s.duracao_segundos / 60)}min` : ''}
              </div>
            </div>
            {s.nota !== null ? (
              <span className={`badge ${corNota(s.nota)}`}>{s.nota.toFixed(1)}</span>
            ) : (
              <span className="badge cinza">{s.status === 'em_andamento' ? 'ativa' : s.status}</span>
            )}
          </button>
        ))}
      </section>
    </div>
  );
}
