/* Composes the store screenshots and the Play feature graphic from the raw app captures (store/raw). */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const RAW = ROOT + '/store/raw/';
const SHOTS = [
  ['home', 'Your square for', 'media buying.', 'Tools, school and community. One Voo ID.'],
  ['academy', 'Learn media buying.', 'Free.', '347 lessons, from your first ad to running a team.'],
  ['lesson', 'Lessons that', 'talk you through it.', 'Voice, captions and animated slides.'],
  ['verticals', 'Go deep in', 'your vertical.', 'Trading, iGaming, finance, nutra and sweeps.'],
  ['card', 'Earn your', 'certificates.', 'A student card, exams and a certificate for every school.'],
  ['community', 'Talk shop with', 'real buyers.', 'Rooms for creatives, tracking, geos and scaling.'],
  ['apps', 'Every tool in', 'one square.', 'Open each tool with the Voo ID you already have.'],
];
const LOGO = `<svg viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12C784"/><stop offset="1" stop-color="#00774B"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(#g)"/><rect x="112" y="112" width="128" height="128" rx="36" fill="#fff"/><rect x="272" y="112" width="128" height="128" rx="36" fill="#fff" opacity=".75"/><rect x="112" y="272" width="128" height="128" rx="36" fill="#fff" opacity=".75"/><rect x="272" y="272" width="128" height="128" rx="36" fill="#C9F65B"/></svg>`;
const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com"><style>@font-face{font-family:J;src:local('Plus Jakarta Sans')}</style>`;
const { execSync } = require('child_process');
const topColor = (img) => execSync(`python3 -c "from PIL import Image;im=Image.open('${img}').convert('RGB');print('#%02x%02x%02x'%im.getpixel((im.width//2,6)))"`).toString().trim();
const STATUS = (fg) => `<div class="sb" style="color:${fg}"><b>9:41</b><span class="ic"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .7 10.4 10.4 0 0 0 .8 3.6L2 4.9a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 0 0 8 4.3a6.6 6.6 0 0 0-4.6 1.8l1.2 1.3A4.9 4.9 0 0 1 8 6.1Zm0 3.5a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z"/></svg><svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="20" height="9" rx="2"/><rect x="24.5" y="4.5" width="1.5" height="4" rx=".7" opacity=".45"/></svg></span></div>`;
function page(W, H, img, l1, l2, sub) {
  const bg = topColor(img); const dark = parseInt(bg.slice(1, 3), 16) < 90;
  const s = W / 1320; // design at 1320 wide
  const phoneW = Math.round((H / W > 2 ? 1000 : 780) * s), phoneH = Math.round(phoneW * 932 / 430);
  return `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>
  *{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
  body{background:radial-gradient(90% 55% at 50% 100%,rgba(18,199,132,.32),transparent 70%),radial-gradient(70% 40% at 15% 0%,rgba(201,246,91,.10),transparent 70%),#08130E;
    font-family:"Plus Jakarta Sans",Inter,-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff;display:flex;flex-direction:column;align-items:center}
  .top{padding:${Math.round(150 * s)}px ${Math.round(90 * s)}px 0;text-align:center}
  .brand{display:inline-flex;align-items:center;gap:${Math.round(16 * s)}px;font-weight:800;font-size:${Math.round(40 * s)}px;letter-spacing:-.01em;color:#DDEFE4;margin-bottom:${Math.round(44 * s)}px}
  .brand svg{width:${Math.round(64 * s)}px;height:${Math.round(64 * s)}px}
  h1{margin:0;font-size:${Math.round(108 * s)}px;line-height:1.02;letter-spacing:-.035em;font-weight:800}
  h1 em{font-style:normal;color:#C9F65B;display:block}
  p{margin:${Math.round(30 * s)}px auto 0;font-size:${Math.round(44 * s)}px;line-height:1.3;color:#A9C2B4;max-width:${Math.round(1050 * s)}px}
  .phone{position:absolute;left:50%;top:${Math.round((H / W > 2 ? 960 : 900) * s)}px;transform:translateX(-50%);width:${phoneW}px;height:${phoneH}px;border-radius:${Math.round(110 * s)}px;padding:${Math.round(22 * s)}px;
    background:linear-gradient(160deg,#2A3A33,#0F1915);box-shadow:0 0 0 ${Math.round(3 * s)}px rgba(201,246,91,.18),0 ${Math.round(60 * s)}px ${Math.round(140 * s)}px rgba(0,0,0,.6)}
  .scr{width:100%;height:100%;border-radius:${Math.round(90 * s)}px;overflow:hidden;background:${bg};display:flex;flex-direction:column}
  .scr img{width:100%;flex:1;min-height:0;object-fit:cover;object-position:top;display:block}
  .sb{height:${Math.round(phoneH * 0.062)}px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:${Math.round(14 * s)}px ${Math.round(70 * s)}px 0 ${Math.round(84 * s)}px;font:600 ${Math.round(40 * s)}px/1 -apple-system,"Plus Jakarta Sans",sans-serif}
  .sb .ic{display:flex;gap:${Math.round(12 * s)}px;align-items:center}.sb svg{height:${Math.round(30 * s)}px;fill:currentColor}.sb svg:nth-child(2){height:${Math.round(32 * s)}px}.sb svg:last-child{height:${Math.round(34 * s)}px}
  .island{position:absolute;top:${Math.round(52 * s)}px;left:50%;transform:translateX(-50%);width:${Math.round(250 * s)}px;height:${Math.round(72 * s)}px;border-radius:99px;background:#000}
  </style></head><body><div class="top"><div class="brand">${LOGO}VooSquare</div><h1>${l1}<em>${l2}</em></h1><p>${sub}</p></div>
  <div class="phone"><div class="scr">${STATUS(dark ? '#fff' : '#0A1611')}<img src="file://${img}"></div><div class="island"></div></div></body></html>`;
}
function feature() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>*{box-sizing:border-box}html,body{margin:0;width:1024px;height:500px;overflow:hidden}
  body{background:radial-gradient(70% 90% at 85% 50%,rgba(18,199,132,.35),transparent 70%),radial-gradient(50% 60% at 0% 0%,rgba(201,246,91,.12),transparent 70%),#08130E;font-family:"Plus Jakarta Sans",Inter,-apple-system,Roboto,sans-serif;color:#fff;position:relative}
  .l{position:absolute;left:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:480px}
  .brand{display:flex;align-items:center;gap:16px;font-weight:800;font-size:44px;letter-spacing:-.02em;margin-bottom:26px}.brand svg{width:72px;height:72px}
  h1{margin:0;font-size:46px;line-height:1.06;letter-spacing:-.035em;font-weight:800}h1 em{font-style:normal;color:#C9F65B}
  p{margin:16px 0 0;font-size:20px;color:#A9C2B4;line-height:1.35}
  .ph{position:absolute;width:250px;height:542px;border-radius:40px;padding:9px;background:linear-gradient(160deg,#2A3A33,#0F1915);box-shadow:0 0 0 2px rgba(201,246,91,.2),0 30px 70px rgba(0,0,0,.6)}
  .ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:32px}
  .a{right:170px;top:78px;transform:rotate(-8deg)}.b{right:-40px;top:44px;transform:rotate(7deg)}</style></head><body>
  <div class="ph b"><img src="file://${RAW}lesson.png"></div><div class="ph a"><img src="file://${RAW}home.png"></div>
  <div class="l"><div class="brand">${LOGO}VooSquare</div><h1>Learn, build and grow as a <em>media buyer.</em></h1><p>Free school, tools and community.<br>One Voo ID.</p></div></body></html>`;
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const render = async (html, W, H, out) => {
    const f = path.join('/tmp', 'vsq-shot-' + process.pid + '.html'); fs.writeFileSync(f, html);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await p.goto('file://' + f, { waitUntil: 'load' }); await p.waitForTimeout(300);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } }); await p.close(); console.log('made', path.relative(ROOT, out));
  };
  let i = 0;
  for (const [n, l1, l2, sub] of SHOTS) {
    i++;
    await render(page(1320, 2868, RAW + n + '.png', l1, l2, sub), 1320, 2868, `${ROOT}/store/apple/iphone-6.9-${i}-${n}.png`);
    await render(page(1080, 1920, RAW + n + '.png', l1, l2, sub), 1080, 1920, `${ROOT}/store/google/phone-${i}-${n}.png`);
  }
  await render(feature(), 1024, 500, `${ROOT}/store/google/feature-graphic.png`);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
