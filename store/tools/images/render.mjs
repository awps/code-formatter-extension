import puppeteer from 'puppeteer';
import fs from 'node:fs';
const raw = fs.readFileSync('shots/raw.json.txt', 'utf8');
fs.writeFileSync('slides.built.html', fs.readFileSync('slides.html', 'utf8').replace('__RAW__', JSON.stringify(raw)).replace('__STRINGS__', fs.readFileSync('strings.json', 'utf8')).replace('__BOXES__', JSON.stringify(Object.fromEntries(fs.readdirSync('shots').filter(d => fs.existsSync(`shots/${d}/boxes.json`)).map(d => [d, JSON.parse(fs.readFileSync(`shots/${d}/boxes.json`, 'utf8'))])))));
const LOC = process.argv[3] || 'en';
const out = process.argv[2] || 'out'; fs.mkdirSync(out, { recursive: true });
const sizes = { shot1: [1280, 800], shot2: [1280, 800], shot3: [1280, 800], shot4: [1280, 800], shot5: [1280, 800], small: [440, 280], marquee: [1400, 560] };
const names = { shot1: '1-formats-itself', shot2: '2-fold-and-path', shot3: '3-light-dark', shot4: '4-languages', shot5: '5-private', small: 'small-promo-440x280', marquee: 'marquee-1400x560' };
const b = await puppeteer.launch({ headless: true });
for (const [k, [w, h]] of Object.entries(sizes)) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.goto('file://' + process.cwd() + '/slides.built.html?l=' + LOC + '&s=' + k, { waitUntil: 'networkidle0' });
  await p.evaluate(() => window.fitDone);
  await p.screenshot({ path: `${out}/${names[k]}.jpg`, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
}
await b.close(); console.log('rendered');
