/* Renders brand art (HTML/SVG) to exact-size PNGs with Chromium. Usage: node render.js <out.png> <width> <height> <htmlFile> [transparent] */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [out, w, h, file, transparent] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.setContent(fs.readFileSync(file, 'utf8'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, omitBackground: !!transparent, clip: { x: 0, y: 0, width: +w, height: +h } });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
