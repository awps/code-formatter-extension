import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: true }); const p = await b.newPage();
await p.setViewport({ width: 1280, height: 800 });
await p.goto('file://' + process.cwd() + '/readme-thumb.html', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: '../../images/readme-video.jpg', type: 'jpeg', quality: 88 }); await b.close();
