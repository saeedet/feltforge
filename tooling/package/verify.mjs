import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
const root = resolve(import.meta.dirname, '../..'),
  pkg = resolve(root, 'dist/package');
const manifest = JSON.parse(
  await readFile(resolve(pkg, 'package.json'), 'utf8'),
);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk(pkg);
if (files.some((f) => /\.(ttf|otf|woff2?|map)$|\/source\/|\.env/.test(f)))
  throw Error('Unexpected development material in package');
for (const target of Object.values(manifest.exports)) {
  for (const p of typeof target === 'string' ? [target] : Object.values(target))
    if (!p.includes('*')) await stat(resolve(pkg, p));
}
for (const file of files.filter((x) => /\.(js|d\.ts)$/.test(x))) {
  const text = await readFile(file, 'utf8');
  if (text.includes('@feltforge/')) throw Error('Workspace import leaked');
  for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g))
    await stat(resolve(dirname(file), match[1]));
}
const fixtures = {
  number: `import {createElement} from 'react';import {Card} from '${pkg}/dist/react/index.js';export const Example=()=>createElement(Card,{rank:'7',suit:'hearts'});`,
  chips: `import {Chip} from '${pkg}/dist/react/index.js';export {Chip};`,
  core: `export {getTableLayout} from '${pkg}/dist/core/index.js';`,
  western: `export {western} from '${pkg}/dist/assets/generated/courts/western.js';`,
};
const reports = [];
for (const [name, source] of Object.entries(fixtures)) {
  const work = resolve(root, 'dist/consumer-checks', name);
  await mkdir(work, { recursive: true });
  await writeFile(resolve(work, 'entry.js'), source);
  const output = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: true,
      lib: { entry: resolve(work, 'entry.js'), formats: ['es'] },
      rolldownOptions: { external: ['react', 'react/jsx-runtime'] },
    },
  });
  const chunks = (Array.isArray(output) ? output : [output])
    .flatMap((o) => o.output)
    .filter((x) => x.type === 'chunk');
  const code = chunks.map((c) => c.code).join('');
  if (['number', 'chips', 'core'].includes(name) && code.length > 50000)
    throw Error(name + ' pulled unexpected artwork into its bundle');
  if (name === 'core' && /from["']react/.test(code))
    throw Error('Core coupled to React');
  if (
    name === 'number' &&
    /Classic card back|back-classic-field|courts|joker-1/.test(code)
  )
    throw Error('Number cards pulled unrelated artwork');
  reports.push({
    fixture: name,
    bytes: Buffer.byteLength(code),
    gzipBytes: gzipSync(code).length,
  });
}
await writeFile(
  resolve(root, 'dist/bundle-report.json'),
  JSON.stringify(reports, null, 2) + '\n',
);
console.log(
  JSON.stringify({ packageFiles: files.length, bundles: reports }, null, 2),
);
