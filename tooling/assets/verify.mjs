import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const work = repo + '/tooling/assets';
const manifest = JSON.parse(
  fs.readFileSync(repo + '/packages/assets/manifest.json'),
);
const report = [];
function compare(a, b, alpha = false) {
  const x = a.pixels ?? a.data,
    y = b.pixels ?? b.data;
  let sum = 0,
    max = 0,
    changed = 0,
    count = 0;
  if (x.length !== y.length) throw Error('Image sizes differ');
  for (let i = 0; i < x.length; i++) {
    if (alpha && i % 4 !== 3) continue;
    const d = Math.abs(x[i] - y[i]);
    sum += d;
    max = Math.max(max, d);
    changed += d > 16 ? 1 : 0;
    count++;
  }
  return {
    meanAbsoluteChannelError: sum / count,
    maxChannelError: max,
    fractionOver16: changed / count,
  };
}
for (const item of manifest.assets.filter((x) => x.kind === 'penpot')) {
  let s = fs.readFileSync(
    repo + '/packages/assets/source/' + item.path,
    'utf8',
  );
  if (item.frameOrigin)
    s = s
      .replace(
        /viewBox="[^"]+"/,
        `viewBox="${item.frameOrigin.join(' ')} ${item.width} ${item.height}"`,
      )
      .replace(/width="[^"]+"/, `width="${item.width}"`)
      .replace(/height="[^"]+"/, `height="${item.height}"`);
  const g = fs.readFileSync(
    repo + '/packages/assets/generated/' + item.path,
    'utf8',
  );
  const a = new Resvg(s, {
    fitTo: { mode: 'width', value: Math.round(item.width * 2) },
  }).render();
  const b = new Resvg(g, {
    fitTo: { mode: 'width', value: Math.round(item.width * 2) },
  }).render();
  const result = { path: item.path, ...compare(a, b, item.monochrome) };
  report.push(result);
  console.log(result);
}
for (const name of ['a', '2', 'joker']) {
  const source = fs.readFileSync(
    repo + '/packages/assets/source/text/' + name + '.svg',
    'utf8',
  );
  const viewBox = source.match(/viewBox="([^"]+)"/)[1];
  let s = fs
    .readFileSync(
      repo + '/packages/assets/generated/ranks/' + name + '.svg',
      'utf8',
    )
    .replace(/viewBox="[^"]+"/, `viewBox="${viewBox}"`);
  const a = PNG.sync.read(
    fs.readFileSync(work + '/reference/rank-' + name + '.png'),
  );
  const b = new Resvg(s, { fitTo: { mode: 'width', value: a.width } }).render();
  const result = { path: 'rank-png/' + name, ...compare(a, b, true) };
  report.push(result);
  console.log(result);
}

if (
  report.some((r) =>
    r.path.startsWith('rank-png/')
      ? r.meanAbsoluteChannelError > 3 || r.fractionOver16 > 0.06
      : r.meanAbsoluteChannelError > 0.02 || r.fractionOver16 > 0.001,
  )
)
  process.exitCode = 1;
