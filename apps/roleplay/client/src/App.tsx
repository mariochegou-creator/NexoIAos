import { useEffect, useState } from 'react';
import type { Scorecard as ScorecardType, Persona, CreateSessionRequest } from '../../shared/types.ts';
import { api, UnauthorizedError } from './api.ts';
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
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState('');
  const [vozApi, setVozApi] = useState(false);

  useEffect(() => {
    api
      .personas()
      .then(() => setAutorizado(true))
      .catch((e) => setAutorizado(!(e instanceof UnauthorizedError)));
    api
      .health()
      .then((h) => setVozApi(h.voz))
      .catch(() => setVozApi(false));
  }, []);

  if (autorizado === null) return <div className="center-page">Carregando…</div>;

  if (!autorizado) {
    return (
      <div className="center-page">
        <div className="card gate">
          <h1>Nexo Treino</h1>
          <p>Entre com seu e-mail e senha do CRM:</p>
          <input
            type="email"
            placeholder="e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && entrar()}
          />
          {erroLogin && <p className="erro">{erroLogin}</p>}
          <button className="btn primary" onClick={entrar} disabled={entrando}>
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    );

    async function entrar() {
      setErroLogin('');
      setEntrando(true);
      try {
        await api.login(email.trim(), senha);
        await api.personas();
        setAutorizado(true);
      } catch (e) {
        setErroLogin(e instanceof Error ? e.message : 'não consegui entrar');
      } finally {
        setEntrando(false);
      }
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
          vozApi={vozApi}
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
