// Smoke test read-only do banco do CRM (Supabase).
// Confere que a API responde, que as tabelas principais existem e mostra a contagem de registros.
// Não escreve nada no banco.
//
// Uso:  NEXO_SB_SERVICE_KEY=<chave> node scripts/smoke-crm-db.js
// (no ambiente remoto do Claude Code a chave vem da variável de ambiente do Environment)

const KEY = (process.env.NEXO_SB_SERVICE_KEY || '').trim();
if (!KEY) {
  console.error('ERRO: variável NEXO_SB_SERVICE_KEY não definida. Nada foi testado.');
  process.exit(1);
}

const BASE = 'https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1';
const TABLES = ['leads', 'clientes', 'contratos', 'projetos', 'prospeccao', 'funil_etapas', 'processo_pendencias'];

(async () => {
  let falhas = 0;
  for (const t of TABLES) {
    try {
      const res = await fetch(`${BASE}/${t}?select=id&limit=1`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact' },
      });
      const range = res.headers.get('content-range') || '';
      const total = range.includes('/') ? range.split('/')[1] : '?';
      const ok = res.status === 200 || res.status === 206;
      if (!ok) falhas++;
      console.log(`${ok ? 'OK ' : 'FALHA'} ${t}: HTTP ${res.status} — registros: ${total}`);
    } catch (e) {
      falhas++;
      console.log(`FALHA ${t}: ${String(e).slice(0, 120)}`);
    }
  }
  console.log(falhas === 0 ? '\n✅ Banco do CRM respondendo em todas as tabelas.' : `\n⛔ ${falhas} tabela(s) com problema.`);
  process.exit(falhas === 0 ? 0 : 1);
})();
