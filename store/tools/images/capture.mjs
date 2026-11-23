import puppeteer from 'puppeteer';
import http from 'node:http';
const users = [
  { id: 1041, name: 'Maya Chen', email: 'maya@northwind.dev', role: 'admin', active: true, website: 'https://northwind.dev/team/maya', address: { city: 'Lisbon', country: 'PT', zip: '1100-148' }, tags: ['billing', 'api'], balance: 2450.75, created_at: '2026-03-14T09:26:53Z' },
  { id: 1042, name: 'Jonas Weber', email: 'jonas@northwind.dev', role: 'editor', active: true, website: 'https://northwind.dev/team/jonas', address: { city: 'Berlin', country: 'DE', zip: '10115' }, tags: ['content'], balance: 120.50, created_at: '2026-04-02T16:05:11Z' },
  { id: 1043, name: 'Ana Popescu', email: 'ana@northwind.dev', role: 'viewer', active: false, website: 'https://northwind.dev/team/ana', address: { city: 'Cluj-Napoca', country: 'RO', zip: '400001' }, tags: [], balance: 0, created_at: '2026-05-21T08:44:00Z' },
  { id: 1044, name: 'Tomás Rivera', email: 'tomas@northwind.dev', role: 'editor', active: true, website: 'https://northwind.dev/team/tomas', address: { city: 'Madrid', country: 'ES', zip: '28001' }, tags: ['design', 'content'], balance: 75.25, created_at: '2026-06-09T12:30:45Z' },
];
const json = JSON.stringify({ data: users, meta: { page: 1, per_page: 4, total: 128, next: 'https://api.northwind.dev/v2/users?page=2' } }).replace(/\//g, '\\/');
const css = `:root{--brand:#4f46e5;--radius:12px}.card{display:grid;grid-template-columns:auto 1fr;gap:16px;padding:24px;border-radius:var(--radius);background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.08),0 8px 24px rgba(15,23,42,.06)}.card__title{margin:0;font:600 1.125rem/1.4 Inter,system-ui,sans-serif;color:#0f172a}.card__meta{color:#64748b;font-size:.875rem}.card:hover{transform:translateY(-2px);transition:transform .2s ease}@media (max-width:640px){.card{grid-template-columns:1fr;padding:16px}.card__meta{display:none}}.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:0;border-radius:999px;background:var(--brand);color:#fff;cursor:pointer}.btn:focus-visible{outline:2px solid var(--brand);outline-offset:2px}`;
const js = `import{debounce as e}from"./utils.js";const t=document.querySelector("#search"),n=document.querySelector("#results");async function r(e){const t=await fetch("/api/search?q="+encodeURIComponent(e));if(!t.ok)throw new Error("Search failed: "+t.status);return(await t.json()).items}function o(e){n.innerHTML=e.map(e=>\`<li class="result"><a href="\${e.url}">\${e.title}</a><span>\${e.type}</span></li>\`).join("")}t.addEventListener("input",e(async e=>{const t=e.target.value.trim();if(t.length<2)return void(n.innerHTML="");try{o(await r(t))}catch(e){console.error(e),n.innerHTML='<li class="error">Something went wrong</li>'}},250));export{r as search,o as render};`;
const server = http.createServer((q, s) => {
  if (q.url.startsWith('/v2/users')) { s.writeHead(200, { 'content-type': 'application/json' }); s.end(json); }
  else if (q.url.endsWith('.css')) { s.writeHead(200, { 'content-type': 'text/css' }); s.end(css); }
  else if (q.url.endsWith('.js')) { s.writeHead(200, { 'content-type': 'text/javascript' }); s.end(js); }
  else { s.writeHead(404); s.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const LOC = process.argv[2] || 'en'; const CHROME_LANG = LOC.replace('_', '-');
import fsx from 'node:fs'; fsx.mkdirSync(`shots/${LOC}`, { recursive: true });
const browser = await puppeteer.launch({ headless: true, pipe: true, args: [`--lang=${CHROME_LANG}`, '-AppleLanguages', `(${CHROME_LANG})`], enableExtensions: [new URL('../../../src', import.meta.url).pathname] });
const swT = await browser.waitForTarget(t => t.type() === 'service_worker');
const sw = await swT.worker(); const id = new URL(swT.url()).host;
const wait = ms => new Promise(r => setTimeout(r, ms));
// raw text of the JSON for the "before" strip
await import('node:fs').then(fs => fs.writeFileSync('shots/raw.json.txt', json));

async function shot(url, name, { scheme = 'dark', w = 760, h = 480, prep } = {}) {
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  console.log('shot', name); await p.goto(url); await p.bringToFront(); await p.waitForSelector('.cm-editor', { timeout: 8000 }).catch(async () => { console.log('NO EDITOR', name, (await p.evaluate(() => document.body.innerText.slice(0, 120)))); }); await wait(500);
  await p.addStyleTag({ content: '.cm-cf-status__sponsor{display:none!important}' });
  if (prep) await prep(p);
  await wait(300);
  await p.screenshot({ path: `shots/${LOC}/${name}.png` });
  await p.close();
}
// click in the middle of the first occurrence of `text` (nth line containing it)
async function clickText(p, text, nth = 0) {
  const pt = await p.evaluate((text, nth) => {
    const lines = [...document.querySelectorAll('.cm-line')].filter(l => l.textContent.includes(text));
    const line = lines[nth]; if (!line) return null;
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT); let node, acc = '';
    const full = line.textContent; const start = full.indexOf(text) + Math.floor(text.length / 2);
    let pos = 0;
    while ((node = walker.nextNode())) {
      if (pos + node.length > start) { const r = document.createRange(); r.setStart(node, start - pos); r.setEnd(node, start - pos + 1); const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
      pos += node.length;
    }
    return null;
  }, text, nth);
  if (!pt) throw new Error('text not found: ' + text);
  await p.mouse.click(pt.x, pt.y); await wait(200);
}
// toggle the fold arrow on the nth line whose trimmed text starts with `text`
async function toggleFold(p, text, nth = 0) {
  const pt = await p.evaluate((text, nth) => {
    const line = [...document.querySelectorAll('.cm-line')].filter(l => l.textContent.trim().startsWith(text))[nth]; if (!line) return null;
    const top = line.getBoundingClientRect().top;
    const g = [...document.querySelectorAll('.cm-foldGutter .cm-gutterElement')].find(g => Math.abs(g.getBoundingClientRect().top - top) < 4);
    if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text, nth);
  if (!pt) throw new Error('fold line not found: ' + text);
  await p.mouse.click(pt.x, pt.y); await wait(200);
}
async function collapseAll(p) {
  await clickText(p, '"data"');
  await p.keyboard.down('Control'); await p.keyboard.down('Alt'); await p.keyboard.press('BracketLeft'); await p.keyboard.up('Alt'); await p.keyboard.up('Control'); await wait(300);
}

// JSON: every object folded, one open, path shown
await shot(`${base}/v2/users?page=1`, 'json-dark', { prep: async p => {
  await collapseAll(p);
  await toggleFold(p, '"data"');
  await toggleFold(p, '{', 2); // root is 0, then objects 1..4 -> open the 2nd object
  await clickText(p, '"jonas@northwind.dev"');
}});
await shot(`${base}/v2/users?page=1`, 'json-wide', { w: 1000, h: 520, prep: async p => {
  await collapseAll(p);
  await toggleFold(p, '"data"');
  await toggleFold(p, '{', 2);
  await clickText(p, '"jonas@northwind.dev"');
  // where the annotated controls are, in screenshot CSS pixels
  const boxes = await p.evaluate(() => {
    const r = el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const fold = (text) => { const l = [...document.querySelectorAll('.cm-line')].filter(l => l.textContent.trim() === text)[0]; return r(l); };
    return {
      view: r(document.querySelector('[data-view="formatted"]').parentElement),
      copy: r(document.querySelector('.cm-cf-status__button--outline')),
      folds: r(document.querySelector('.cm-cf-status__actions')),
      folded: r([...document.querySelectorAll('.cm-line')].filter(l => l.textContent.trim().startsWith('{') && l.textContent.includes('…'))[1]),
    };
  });
  fsx.writeFileSync(`shots/${LOC}/boxes.json`, JSON.stringify(boxes));
}});
await shot(`${base}/v2/users?page=1`, 'json-open', { prep: async p => { await clickText(p, '"Lisbon"'); } });
await shot(`${base}/v2/users?page=1`, 'json-light', { scheme: 'light', prep: async p => { await clickText(p, '"Lisbon"'); } });
await shot(`${base}/assets/card.css`, 'css-dark');
await shot(`${base}/assets/search.js`, 'js-light', { scheme: 'light' });
// settings menu open
await shot(`${base}/v2/users?page=1`, 'menu-dark', { prep: async p => { await p.click('#settings-dropdown-trigger'); } });
// popup
for (const scheme of ['dark', 'light']) {
  const pop = await browser.newPage(); await pop.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await pop.setViewport({ width: 320, height: 700, deviceScaleFactor: 2 });
  await pop.goto(`chrome-extension://${id}/popup/index.html`); await pop.addStyleTag({ content: '.popup__sponsor{display:none!important}' }); await wait(500);
  const h = await pop.evaluate(() => document.body.scrollHeight);
  await pop.screenshot({ path: `shots/${LOC}/popup-${scheme}.png`, clip: { x: 0, y: 0, width: 320, height: h } });
}
await browser.close(); server.close();
console.log('done');
