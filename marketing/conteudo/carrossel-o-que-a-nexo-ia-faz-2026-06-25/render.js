const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, 'instagram');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1350 });

  const file = 'file:///' + __dirname.replace(/\\/g, '/') + '/carrossel.html';
  await page.goto(file, { waitUntil: 'networkidle' });

  const slides = await page.$$('.slide');
  console.log(`Encontrei ${slides.length} slides. Renderizando...`);

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const outPath = path.join(outDir, `slide-${num}.png`);
    await slides[i].screenshot({ path: outPath });
    console.log(`✓ slide-${num}.png`);
  }

  await browser.close();
  console.log(`\nPronto! ${slides.length} PNGs salvos em /instagram`);
})();
