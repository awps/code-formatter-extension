// Builds out/<loc>/code-formatter-promo.mp4 (+ no-captions version) for one locale:
// recorded scenes + ElevenLabs voice lines + background music ducked under the voice.
// Usage: node compose-l10n.mjs <loc>
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const LOC = process.argv[2] || 'en';
const T = JSON.parse(fs.readFileSync('i18n.json', 'utf8'))[LOC];
const CLIPS = [['01-title'], ['02-raw'], ['03-formatted'], ['04-fold'], ['05-path'], ['06-original'], ['07-theme'], ['08-css', '09-js'], ['10-private'], ['11-end']];
const FONT = { ja: 'Hiragino Sans', zh_CN: 'PingFang SC' }[LOC] || 'Helvetica Neue';
// SHORT=1: build the vertical YouTube Shorts version from scenes-short/
const SHORT = process.env.SHORT === '1';
const SCENES = SHORT ? 'scenes-short' : 'scenes';
const W = `${SHORT ? 'work-short' : 'work'}/${LOC}`, OUT = `${SHORT ? 'out-short' : 'out'}/${LOC}`;
fs.mkdirSync(W, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });

const run = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const dur = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

const LEAD = 0.35, TAIL = 0.55;
let t = 0; const cues = [];
for (const [i, clips] of CLIPS.entries()) {
  const id = String(i).padStart(2, '0');
  const voice = `../../audio/${LOC}/${id}.mp3`;
  run(['-i', voice, '-ar', '48000', '-ac', '2', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', `${W}/a${id}.wav`]);
  const inputs = clips.flatMap(c => ['-i', `${SCENES}/${LOC}/${c}.webm`]);
  const concat = clips.map((_, k) => `[${k}:v]fps=30,setpts=PTS-STARTPTS,format=yuv420p[v${k}]`).join(';') +
    ';' + clips.map((_, k) => `[v${k}]`).join('') + `concat=n=${clips.length}:v=1:a=0[cat]`;
  run([...inputs, '-filter_complex', concat, '-map', '[cat]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', `${W}/v${id}.mp4`]);
  const vd = dur(`${W}/v${id}.mp4`), ad = dur(`${W}/a${id}.wav`);
  const d = Math.max(vd, LEAD + ad + TAIL);
  run(['-i', `${W}/v${id}.mp4`, '-i', `${W}/a${id}.wav`, '-filter_complex',
    `[0:v]tpad=stop_mode=clone:stop_duration=${(d - vd + 0.1).toFixed(2)},trim=duration=${d.toFixed(3)}[v];` +
    `[1:a]adelay=${Math.round(LEAD * 1000)}|${Math.round(LEAD * 1000)},apad,atrim=duration=${d.toFixed(3)}[a]`,
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-c:a', 'pcm_s16le', `${W}/s${id}.mov`]);
  cues.push({ start: t + LEAD, end: t + LEAD + ad + 0.15, text: T.vo[i] });
  t += d;
}

fs.writeFileSync(`${W}/list.txt`, CLIPS.map((_, i) => `file 's${String(i).padStart(2, '0')}.mov'`).join('\n'));
run(['-f', 'concat', '-safe', '0', '-i', `${W}/list.txt`, '-c', 'copy', `${W}/joined.mov`]);
const total = dur(`${W}/joined.mov`);

// Music: quiet bed, ducked further whenever the voice speaks, faded in and out
run(['-i', `${W}/joined.mov`, '-i', '../../audio/music/music.mp3', '-filter_complex',
  `[1:a]aresample=48000,volume=-21dB,atrim=duration=${total.toFixed(3)},afade=t=in:d=1.2,afade=t=out:st=${(total - 2.5).toFixed(2)}:d=2.5[m];` +
  `[0:a]asplit=2[v][key];` +
  `[m][key]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350[duck];` +
  `[v][duck]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', `${W}/mixed.mp4`]);

// libass only wraps at spaces: break long CJK captions at the punctuation nearest the middle
function capText(text) {
  if (!['ja', 'zh_CN'].includes(LOC)) return text;
  let t = text.replace(/ /g, '\\h');
  if ([...text].length <= (SHORT ? 14 : 26)) return t;
  const marks = [...text.matchAll(/[、。，；]/g)].map(m => m.index + 1).filter(i => i < text.length - 2);
  if (!marks.length) return t;
  const mid = text.length / 2;
  const cut = marks.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a);
  return (text.slice(0, cut) + '\\N' + text.slice(cut)).replace(/ /g, '\\h');
}
const ts = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${sec}`; };
fs.writeFileSync(`${W}/captions.ass`, `[Script Info]
ScriptType: v4.00+
PlayResX: ${SHORT ? 1080 : 1920}
PlayResY: ${SHORT ? 1920 : 1080}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,${FONT},${SHORT ? 58 : 46},&H00FFFFFF,&H00FFFFFF,&H1A2A1412,&H1A2A1412,1,0,0,0,100,100,0,0,3,20,0,2,${SHORT ? '90,90,560' : '200,200,96'},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${cues.map(c => `Dialogue: 0,${ts(c.start)},${ts(c.end)},Cap,,0,0,0,,${capText(c.text)}`).join('\n')}
`);
run(['-i', `${W}/mixed.mp4`, '-vf', `subtitles=${W}/captions.ass`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', `${OUT}/code-formatter-promo.mp4`]);
run(['-i', `${W}/mixed.mp4`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', `${OUT}/code-formatter-promo-no-captions.mp4`]);
console.log(LOC, dur(`${OUT}/code-formatter-promo.mp4`).toFixed(1) + 's');
