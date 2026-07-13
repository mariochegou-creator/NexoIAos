const DASHBOARD_ORIGIN = 'https://dashboard.nexoialocal.com.br';

const btn = document.getElementById('btn');
const statusEl = document.getElementById('status');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  statusEl.textContent = 'Limpando cache...';
  try {
    // Só limpa cache/service worker/cache storage do dashboard — não mexe em
    // localStorage/indexedDB, então o login (sessão do Supabase) continua valendo.
    await chrome.browsingData.remove(
      { origins: [DASHBOARD_ORIGIN] },
      { cache: true, cacheStorage: true, serviceWorkers: true }
    );

    const tabs = await chrome.tabs.query({ url: DASHBOARD_ORIGIN + '/*' });
    if (tabs.length) {
      await Promise.all(tabs.map(t => chrome.tabs.reload(t.id, { bypassCache: true })));
    } else {
      await chrome.tabs.create({ url: DASHBOARD_ORIGIN + '/' });
    }

    statusEl.textContent = 'Pronto! Dashboard atualizado.';
  } catch (err) {
    statusEl.textContent = 'Erro: ' + err.message;
  } finally {
    btn.disabled = false;
  }
});
