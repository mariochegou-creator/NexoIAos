// Smoke test read-only do banco do CRM (Supabase).
// Confere que a API responde e que as tabelas realmente usadas existem e são legíveis.
// Não escreve nada no banco.
//
// Uso:  NEXO_SB_SERVICE_KEY=<chave> node scripts/smoke-crm-db.js
// (no ambiente remoto do Claude Code a chave vem da variável de ambiente do Environment)
//
// IMPORTANTE: a lista abaixo tem que refletir o que o código REALMENTE consulta.
// Fonte: `grep -o "\.from('[a-z_]*'" deploy/dashboard-nexo-ia.html` e as skills /sync e /enriquecer-leads.
// Se a dashboard passar a usar outra tabela, atualizar aqui — senão o teste passa sem testar nada.

const KEY = (process.env.NEXO_SB_SERVICE_KEY || '').trim();
if (!KEY) {
  console.error('ERRO: variável NEXO_SB_SERVICE_KEY não definida. Nada foi testado.');
  process.exit(1);
}

const BASE = 'https://norgsipmgxbakfmkqcnl.supabase.co/rest/v1';
const TIMEOUT_MS = 15000;

const TABELAS = {
  // usadas pela dashboard CANÔNICA (saidas/dashboard-nexo-ia.html — a publicada)
  dashboard: ['clientes', 'contratos', 'leads', 'funil_etapas', 'prospeccao', 'influenciadores',
              'campanhas_indicacao', 'processo_pendencias', 'profiles', 'tasks', 'marketing',
              'finance_entries', 'settings', 'activity_log'],
  // schema antigo, ainda consultado por deploy/dashboard-nexo-ia.html (cópia legada)
  legado: ['clients'],
};

// Tabelas que a dashboard consulta mas cuja ausência ela já trata (cai no modo DEMO).
// Não reprovam o smoke test — só avisam. Ver pendência em _memoria/bugs.md.
const OPCIONAIS = ['influencers', 'influencer_jobs'];

// Consultas com colunas explícitas que a dashboard faz. Pegam coluna renomeada/removida,
// coisa que um `select=*` nunca detecta. Fonte: grep "\.from('x')\.select('y')" na dashboard.
const CONSULTAS_COLUNAS = [
  ['clientes', 'nome,status'],
  ['contratos', 'valor_mensal,status'],
  ['leads', 'nome,etapa_funil,responsavel'],
  ['profiles', 'id,name'],
  ['settings', 'value'],
];

async function checa(tabela, select = '*') {
  try {
    const res = await fetch(`${BASE}/${tabela}?select=${encodeURIComponent(select)}&limit=1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const range = res.headers.get('content-range') || '';
    const total = range.includes('/') ? range.split('/')[1] : '?';
    const ok = res.status === 200 || res.status === 206;
    return { tabela, ok, status: res.status, total };
  } catch (e) {
    const msg = /timeout|abort/i.test(String(e)) ? `sem resposta em ${TIMEOUT_MS / 1000}s` : String(e).slice(0, 90);
    return { tabela, ok: false, status: '—', total: '?', erro: msg };
  }
}

(async () => {
  const resultados = [];
  for (const [grupo, lista] of Object.entries(TABELAS)) {
    console.log(`\n[${grupo}]`);
    for (const t of lista) {
      const r = await checa(t);
      resultados.push(r);
      console.log(`  ${r.ok ? 'OK   ' : 'FALHA'} ${t}: HTTP ${r.status} — registros: ${r.total}${r.erro ? ` (${r.erro})` : ''}`);
    }
  }

  console.log('\n[colunas usadas pela dashboard]');
  for (const [t, sel] of CONSULTAS_COLUNAS) {
    const r = await checa(t, sel);
    resultados.push(r);
    console.log(`  ${r.ok ? 'OK   ' : 'FALHA'} ${t}.select('${sel}'): HTTP ${r.status}${r.erro ? ` (${r.erro})` : ''}`);
  }

  console.log('\n[opcionais — ausência é tratada pela dashboard (modo DEMO)]');
  for (const t of OPCIONAIS) {
    const r = await checa(t);
    console.log(`  ${r.ok ? 'OK   ' : 'AVISO'} ${t}: HTTP ${r.status} — registros: ${r.total}${r.ok ? '' : ' (aba Influencer segue em DEMO)'}`);
  }

  const falhas = resultados.filter(r => !r.ok);
  // Uma chave sem permissão (ex: a publishable, barrada pelo RLS) devolve 200 com zero linhas
  // em tudo — o teste "passaria" sem ler nada. Trata isso como suspeita, não como sucesso.
  const todasVazias = falhas.length === 0 && resultados.every(r => r.total === '0');

  console.log('');
  if (falhas.length) {
    console.log(`⛔ ${falhas.length} tabela(s) com problema: ${falhas.map(f => f.tabela).join(', ')}`);
    process.exit(1);
  }
  if (todasVazias) {
    console.log('⚠️  Todas as tabelas responderam com 0 registros — provável chave sem permissão (RLS).');
    console.log('   Use a service_role em NEXO_SB_SERVICE_KEY; a publishable não lê os dados.');
    process.exit(1);
  }
  console.log('✅ Banco do CRM respondendo em todas as tabelas usadas pela dashboard e pelas skills.');
})();
