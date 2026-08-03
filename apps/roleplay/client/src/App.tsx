import { useEffect, useState } from 'react';
import type { Scorecard as ScorecardType, Persona, CreateSessionRequest } from '../../shared/types.ts';
import { api, getAccessCode, setAccessCode, UnauthorizedError } from './api.ts';
import Setup from './screens/Setup.tsx';
import Session from './screens/Session.tsx';
import Scorecard from './screens/Scorecard.tsx';
import History from './screens/History.tsx';

type Tela =
  | { nome: 'setup' }
  | { nome: 'sessao'; sessionId: string; persona: Persona; abertura: string | null; req: CreateSessionRequest }
  | { nome: 'scorecard'; scorecard: ScorecardType; duracao: number; req: CreateSessionRequest }
  | { nome: 'historico' };

export default function App() {
  const [tela, setTela] = useState<Tela>({ nome: 'setup' });
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [codigo, setCodigo] = useState(getAccessCode());
  const [erroCodigo, setErroCodigo] = useState('');

  useEffect(() => {
    api
      .personas()
      .then(() => setAutorizado(true))
      .catch((e) => setAutorizado(!(e instanceof UnauthorizedError)));
  }, []);

  if (autorizado === null) return <div className="center-page">Carregando…</div>;

  if (!autorizado) {
    return (
      <div className="center-page">
        <div className="card gate">
          <h1>Nexo Treino</h1>
          <p>Digite o código de acesso:</p>
          <input
            type="password"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tentar()}
          />
          {erroCodigo && <p className="erro">{erroCodigo}</p>}
          <button className="btn primary" onClick={tentar}>
            Entrar
          </button>
        </div>
      </div>
    );

    function tentar() {
      setAccessCode(codigo);
      api
        .personas()
        .then(() => setAutorizado(true))
        .catch(() => setErroCodigo('Código inválido.'));
    }
  }

  switch (tela.nome) {
    case 'setup':
      return (
        <Setup
          onStart={(sessionId, persona, abertura, req) =>
            setTela({ nome: 'sessao', sessionId, persona, abertura, req })
          }
          onHistorico={() => setTela({ nome: 'historico' })}
        />
      );
    case 'sessao':
      return (
        <Session
          sessionId={tela.sessionId}
          persona={tela.persona}
          abertura={tela.abertura}
          req={tela.req}
          onFinish={(scorecard, duracao) => setTela({ nome: 'scorecard', scorecard, duracao, req: tela.req })}
          onAbandon={() => setTela({ nome: 'setup' })}
        />
      );
    case 'scorecard':
      return (
        <Scorecard
          scorecard={tela.scorecard}
          duracao={tela.duracao}
          req={tela.req}
          onNova={() => setTela({ nome: 'setup' })}
          onHistorico={() => setTela({ nome: 'historico' })}
        />
      );
    case 'historico':
      return <History onVoltar={() => setTela({ nome: 'setup' })} />;
  }
}
