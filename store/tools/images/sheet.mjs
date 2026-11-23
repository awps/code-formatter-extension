import puppeteer from 'puppeteer'; import fs from 'node:fs';
const locs = ['en','de','fr','id','it','ja','pt_BR','ro','tr','uk','zh_CN'];
const img = process.argv[2]; const w = +process.argv[3] || 420;
const html = `<body style="margin:0;background:#666;display:grid;grid-template-columns:repeat(3,${w}px);gap:8px;padding:8px;font:14px sans-serif;color:#fff">${locs.map(l=>`<div>${l}<br><img src="out/${l}/${img}.jpg" style="width:${w}px;display:block"></div>`).join('')}</body>`;
fs.writeFileSync('sheet.html', html);
const b = await puppeteer.launch({headless:true}); const p = await b.newPage(); await p.setViewport({width: w*3+40, height: 800});
await p.goto('file://' + process.cwd() + '/sheet.html', {waitUntil:'load'}); await p.screenshot({path:`sheet-${img}.png`, fullPage:true}); await b.close();
