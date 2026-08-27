// Smoke test da INTERFACE do CRM: abre a dashboard num navegador de verdade,
// entra em modo DEMO e renderiza todas as abas, capturando erros de JavaScript.
// Não faz login e não escreve nada no banco — o modo DEMO usa dados locais.
//
// Pré-requisitos (uma vez):
//   npm install playwright @supabase/supabase-js chart.js
// Uso:
//   node scripts/smoke-crm-ui.js
//
// As bibliotecas que a dashboard busca em CDN são servidas a partir do node_modules,
// então o teste roda mesmo sem acesso externo — e testa a página como ela é em produção.

const fs = require('fs');
const path = require('path');

// Procura as dependências no diretório de onde o comando foi rodado, na pasta do script
// e na raiz do repositório — assim funciona seja qual for o cwd.
const BUSCA = [process.cwd(), __dirname, path.resolve(__dirname, '..')];
const AJUDA = 'Rode: npm install playwright @supabase/supabase-js chart.js';

let chromium;
try { ({ chromium } = require(require.resolve('playwright', { paths: BUSCA }))); }
catch { console.error(`ERRO: playwright não encontrado. ${AJUDA}`); process.exit(1); }

// Por padrão testa o arquivo CANÔNICO (saidas/), que é o publicado em
// dashboard.nexoialocal.com.br. deploy/ é uma cópia antiga — passe o caminho como
// argumento pra testar outro arquivo: node scripts/smoke-crm-ui.js deploy/dashboard-nexo-ia.html
const ALVO = process.argv[2] || path.resolve(__dirname, '..', 'saidas', 'dashboard-nexo-ia.html');
const PAGE = 'file://' + path.resolve(ALVO);
const ABAS = ['overview', 'pipeline', 'clients', 'finance', 'influencer', 'marketing', 'tasks', 'handoff', 'team', 'settings'];
const EXE = process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium';

function lib(rel) {
  for (const base of BUSCA) {
    const p = path.join(base, 'node_modules', rel);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  console.error(`ERRO: não encontrei node_modules/${rel}. ${AJUDA}`);
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch(fs.existsSync(EXE) ? { executablePath: EXE } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  page.on('pageerror', e => erros.push(String(e).slice(0, 160)));

  await page.route('**/supabase-js@2**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: lib('@supabase/supabase-js/dist/umd/supabase.js') }));
  await page.route('**/chart.umd.min.js**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: lib('chart.js/dist/chart.umd.js') }));

  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  let falhas = 0;
  const semAviso = !(await page.evaluate(() => document.body.innerText.includes('Não foi possível carregar o painel')));
  console.log(`${semAviso ? 'OK   ' : 'FALHA'} bibliotecas carregam e o painel inicia`);
  if (!semAviso) falhas++;

  // Entra no app sem autenticar, só pra exercitar a renderização, e liga o modo DEMO.
  // `currentUser` é let no escopo do script da página — por isso a atribuição é sem `window.`
  const entrou = await page.evaluate(() => {
    try {
      currentUser = { id: 'smoke-test', email: 'teste@nexo', name: 'Teste', role: 'admin', color: '#00c8e8' };
      startApp();
      if (!demoMode) toggleDemo();
      return true;
    } catch (e) { return String(e).slice(0, 140); }
  });
  console.log(`${entrou === true ? 'OK   ' : 'FALHA'} app inicializa e ativa o modo DEMO${entrou === true ? '' : ' — ' + entrou}`);
  if (entrou !== true) falhas++;
  await page.waitForTimeout(1200);

  for (const aba of ABAS) {
    const antes = erros.length;
    const r = await page.evaluate(a => { try { switchTab(a, null); return true; } catch (e) { return String(e).slice(0, 140); } }, aba);
    await page.waitForTimeout(700);
    const chars = await page.evaluate(a => {
      const el = document.getElementById('tab-' + a);
      return el ? el.innerText.replace(/\s+/g, ' ').trim().length : -1;
    }, aba);
    const novos = erros.length - antes;
    const ok = r === true && chars > 20 && novos === 0;
    if (!ok) falhas++;
    console.log(`${ok ? 'OK   ' : 'FALHA'} aba ${aba}: ${chars} chars${novos ? `, ${novos} erro(s) de JS` : ''}${r === true ? '' : ' — ' + r}`);
  }

  await browser.close();
  if (erros.length) { console.log('\nErros de JS capturados:'); erros.slice(0, 8).forEach(e => console.log('  -', e)); }
  console.log(falhas === 0 ? '\n✅ Interface do CRM: todas as abas renderizam sem erro.' : `\n⛔ ${falhas} verificação(ões) falharam.`);
  process.exit(falhas === 0 ? 0 : 1);
})();
