// Records each scene of the promo as its own clip (scenes/NN.webm).
// The real extension is used; a fake cursor and a caption are drawn on top.
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';

const W = 1280, H = 720, ZOOM = 1, DPR = 1.5;
const LOC = process.argv[2] || 'en'; const CHROME_LANG = LOC.replace('_', '-');
const only = process.argv[3]; // record a single scene while iterating
const OUT = `scenes/${LOC}`; fs.mkdirSync(OUT, { recursive: true });

const users = [
  { id: 1041, name: 'Maya Chen', email: 'maya@northwind.dev', role: 'admin', active: true, website: 'https://northwind.dev/team/maya', address: { city: 'Lisbon', country: 'PT', zip: '1100-148' }, tags: ['billing', 'api'], balance: 2450.75, created_at: '2026-03-14T09:26:53Z' },
  { id: 1042, name: 'Jonas Weber', email: 'jonas@northwind.dev', role: 'editor', active: true, website: 'https://northwind.dev/team/jonas', address: { city: 'Berlin', country: 'DE', zip: '10115' }, tags: ['content'], balance: 120.50, created_at: '2026-04-02T16:05:11Z' },
  { id: 1043, name: 'Ana Popescu', email: 'ana@northwind.dev', role: 'viewer', active: false, website: 'https://northwind.dev/team/ana', address: { city: 'Cluj-Napoca', country: 'RO', zip: '400001' }, tags: [], balance: 0, created_at: '2026-05-21T08:44:00Z' },
  { id: 1044, name: 'Tomás Rivera', email: 'tomas@northwind.dev', role: 'editor', active: true, website: 'https://northwind.dev/team/tomas', address: { city: 'Madrid', country: 'ES', zip: '28001' }, tags: ['design', 'content'], balance: 75.25, created_at: '2026-06-09T12:30:45Z' },
];
const json = JSON.stringify({ data: users, meta: { page: 1, per_page: 4, total: 128, next: 'https://api.northwind.dev/v2/users?page=2' } }).replace(/\//g, '\\/');
const css = fs.readFileSync('../images/capture.mjs', 'utf8').match(/const css = `([^`]*)`/)[1];
const js = `import{debounce as e}from"./utils.js";const t=document.querySelector("#search"),n=document.querySelector("#results");async function r(e){const t=await fetch("/api/search?q="+encodeURIComponent(e));if(!t.ok)throw new Error("Search failed: "+t.status);return(await t.json()).items}function o(e){n.innerHTML=e.map(e=>"<li>"+e.title+"</li>").join("")}t.addEventListener("input",e(async e=>{const t=e.target.value.trim();if(t.length<2)return void(n.innerHTML="");try{o(await r(t))}catch(e){console.error(e)}},250));export{r as search,o as render};`;
const raw = `<!doctype html><html><head><meta name="color-scheme" content="light dark"></head><body><div hidden></div><pre style="word-wrap: break-word; white-space: pre-wrap; font-size: 15px;">${json.replace(/</g, '&lt;')}</pre></body></html>`;

const server = http.createServer((q, s) => {
  if (q.url.startsWith('/raw/')) { s.writeHead(200, { 'content-type': 'text/html' }); s.end(raw); }
  else if (q.url.startsWith('/v2/users')) { s.writeHead(200, { 'content-type': 'application/json' }); s.end(json); }
  else if (q.url.endsWith('.css')) { s.writeHead(200, { 'content-type': 'text/css' }); s.end(css); }
  else if (q.url.endsWith('.js')) { s.writeHead(200, { 'content-type': 'text/javascript' }); s.end(js); }
  else if (q.url.startsWith('/popup.png')) { s.writeHead(200, { 'content-type': 'image/png' }); s.end(fs.readFileSync(`${OUT}/popup.png`)); }
  else if (q.url.startsWith('/i18n.json')) { s.writeHead(200, { 'content-type': 'application/json' }); s.end(fs.readFileSync('i18n.json')); }
  else if (q.url.startsWith('/card/')) { s.writeHead(200, { 'content-type': 'text/html' }); s.end(fs.readFileSync('cards.html')); }
  else { s.writeHead(404); s.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ headless: true, pipe: true, args: [`--lang=${CHROME_LANG}`, '-AppleLanguages', `(${CHROME_LANG})`], enableExtensions: [new URL('../../../src', import.meta.url).pathname] });
const swT = await browser.waitForTarget(t => t.type() === 'service_worker');
const extId = new URL(swT.url()).host;
const wait = ms => new Promise(r => setTimeout(r, ms));

// A 1px element that keeps changing, so still scenes still produce frames
const KEEPALIVE = `(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;z-index:2147483647;pointer-events:none;background:#000;animation:pvk .5s steps(2) infinite'; const st = document.createElement('style'); st.textContent = '@keyframes pvk{to{opacity:.02}}'; document.documentElement.append(st, d); })()`;
// Overlay: fake cursor + caption, positioned in viewport pixels
const OVERLAY = `(() => {
  if (document.getElementById('pv-cursor')) return;
  const st = document.createElement('style');
  st.textContent = \`
    #pv-cursor { position: fixed; left: 0; top: 0; width: 22px; height: 22px; z-index: 2147483647; pointer-events: none;
      transition: transform .7s cubic-bezier(.4,0,.2,1); transform: translate(var(--x, 760px), var(--y, 520px)); }
    #pv-cursor svg { width: 22px; height: 22px; filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); }
    #pv-cursor.click::after { content: ''; position: absolute; left: -12px; top: -12px; width: 24px; height: 24px; border-radius: 50%;
      border: 2px solid #89b4fa; animation: pv-ring .45s ease-out forwards; }
    @keyframes pv-ring { from { transform: scale(.4); opacity: 1 } to { transform: scale(1.8); opacity: 0 } }
  \`;
  document.documentElement.appendChild(st);
  const c = document.createElement('div'); c.id = 'pv-cursor';
  c.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 2l15 11.2-6.6.9 3.9 7.1-2.6 1.4-3.9-7.2L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.documentElement.appendChild(c);
})()`;

async function prepare(p) {
  await p.evaluate(OVERLAY);
}
async function zoom(p) { await wait(100); }
// Move the fake cursor to an element (selector or {x,y} in CSS px of the zoomed page) and click it
async function pointAt(p, target, { click = true, pause = 900 } = {}) {
  const pt = await p.evaluate((target, z) => {
    let x, y;
    if (typeof target === 'string') {
      const el = document.querySelector(target); const r = el.getBoundingClientRect();
      x = r.x + r.width / 2; y = r.y + r.height / 2;
    } else ({ x, y } = target);
    return { x, y, vx: x * z, vy: y * z };
  }, target, ZOOM);
  await p.evaluate(({ vx, vy }) => { const c = document.getElementById('pv-cursor'); c.style.setProperty('--x', vx + 'px'); c.style.setProperty('--y', vy + 'px'); }, pt);
  await wait(800);
  if (click) {
    await p.evaluate(() => { const c = document.getElementById('pv-cursor'); c.classList.remove('click'); void c.offsetWidth; c.classList.add('click'); });
    await p.mouse.click(pt.vx, pt.vy);
  }
  await wait(pause);
}
// Centre of a piece of text on a code line, in zoomed-page CSS px
async function textPoint(p, text, nth = 0) {
  return p.evaluate((text, nth) => {
    const line = [...document.querySelectorAll('.cm-line')].filter(l => l.textContent.includes(text))[nth];
    const full = line.textContent; const start = full.indexOf(text) + Math.floor(text.length / 2);
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT); let node, pos = 0;
    while ((node = walker.nextNode())) {
      if (pos + node.length > start) { const r = document.createRange(); r.setStart(node, start - pos); r.setEnd(node, start - pos + 1); const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
      pos += node.length;
    }
  }, text, nth);
}
async function foldPoint(p, text, nth = 0) {
  return p.evaluate((text, nth) => {
    const line = [...document.querySelectorAll('.cm-line')].filter(l => l.textContent.trim().startsWith(text))[nth];
    const top = line.getBoundingClientRect().top;
    const g = [...document.querySelectorAll('.cm-foldGutter .cm-gutterElement')].find(g => Math.abs(g.getBoundingClientRect().top - top) < 4);
    const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text, nth);
}

async function newPage(scheme = 'dark') {
  const p = await browser.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  return p;
}
async function openViewer(p, url) {
  await p.goto(url); await p.bringToFront(); await p.waitForSelector('.cm-editor');
  await p.addStyleTag({ content: '.cm-cf-status__sponsor{display:none!important}' });
  await zoom(p); await prepare(p); await wait(300);
}
async function record(name, fn) {
  if (only && only !== name) return;
  const p = await newPage(fn.scheme);
  if (fn.setup) await fn.setup(p);
  await p.addStyleTag({ content: '.cm-cf-status__sponsor{display:none!important}' }).catch(() => {});
  await p.evaluate(KEEPALIVE);
  const rec = await p.screencast({ path: `${OUT}/${name}.webm`, scale: DPR });
  await fn(p);
  await rec.stop(); await p.close();
  console.log('recorded', name);
}

// ---------------- Scenes ----------------
const S = {};
S['01-title'] = Object.assign(async p => { await wait(3200); }, {
  setup: async p => { await p.goto(`${base}/card/?c=title&l=${LOC}`); await p.bringToFront(); await p.evaluate(() => window.ready); await wait(200); },
});
S['02-raw'] = Object.assign(async p => { await wait(3600); }, {
  setup: async p => { await p.goto(`${base}/raw/users`); await p.bringToFront(); await zoom(p); },
});
S['03-formatted'] = Object.assign(async p => { await wait(3800); }, {
  setup: async p => { await openViewer(p, `${base}/v2/users?page=1`); },
});
S['04-fold'] = Object.assign(async p => {
  await wait(500);
  await pointAt(p, '.cm-cf-status__actions .cm-cf-status__icon:last-child', { pause: 1100 });
  await pointAt(p, await foldPoint(p, '"data"'), { pause: 1000 });
  await pointAt(p, await foldPoint(p, '{', 2), { pause: 1400 });
}, { setup: async p => { await openViewer(p, `${base}/v2/users?page=1`); } });
S['05-path'] = Object.assign(async p => {
  await wait(400);
  await pointAt(p, await textPoint(p, '"jonas@northwind.dev"'), { pause: 1300 });
  await pointAt(p, '.cm-cf-status__button--outline', { pause: 1800 });
}, { setup: async p => {
  await openViewer(p, `${base}/v2/users?page=1`);
  // same folded state the previous scene ended in
  const keys = async k => { await p.keyboard.down('Control'); await p.keyboard.down('Alt'); await p.keyboard.press(k); await p.keyboard.up('Alt'); await p.keyboard.up('Control'); };
  const t = await textPoint(p, '"data"'); await p.mouse.click(t.x * ZOOM, t.y * ZOOM); await keys('BracketLeft'); await wait(200);
  for (const [txt, n] of [['"data"', 0], ['{', 2]]) { const f = await foldPoint(p, txt, n); await p.mouse.click(f.x * ZOOM, f.y * ZOOM); await wait(150); }
} });
S['06-original'] = Object.assign(async p => {
  await wait(400);
  await pointAt(p, '[data-view="original"]', { pause: 1700 });
  await pointAt(p, '[data-view="formatted"]', { pause: 1400 });
}, { setup: async p => { await openViewer(p, `${base}/v2/users?page=1`); } });
S['07-theme'] = Object.assign(async p => {
  await wait(1400);
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await wait(2200);
}, { scheme: 'dark', setup: async p => { await openViewer(p, `${base}/v2/users?page=1`); } });
S['08-css'] = Object.assign(async p => { await wait(2400); }, {
  setup: async p => { await openViewer(p, `${base}/assets/card.css`); },
});
S['09-js'] = Object.assign(async p => { await wait(2400); }, {
  scheme: 'light', setup: async p => { await openViewer(p, `${base}/js/search.js`); },
});
S['10-private'] = Object.assign(async p => { await wait(3600); }, {
  setup: async p => { await p.goto(`${base}/card/?c=private&l=${LOC}`); await p.bringToFront(); await p.evaluate(() => window.ready); await wait(300); },
});
S['11-end'] = Object.assign(async p => { await wait(3600); }, {
  setup: async p => { await p.goto(`${base}/card/?c=end&l=${LOC}`); await p.bringToFront(); await p.evaluate(() => window.ready); await wait(200); },
});

// Popup screenshot used on the privacy card
if (!only || only === '10-private') {
  const pop = await newPage('dark');
  await pop.setViewport({ width: 320, height: 700, deviceScaleFactor: 3 });
  await pop.goto(`chrome-extension://${extId}/popup/index.html`);
  await pop.addStyleTag({ content: '.popup__sponsor{display:none!important}' }); await wait(500);
  const h = await pop.evaluate(() => document.body.scrollHeight);
  await pop.screenshot({ path: `${OUT}/popup.png`, clip: { x: 0, y: 0, width: 320, height: h } }); await pop.close();
}

for (const [name, fn] of Object.entries(S)) await record(name, fn);
await browser.close(); server.close();
