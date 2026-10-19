import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..'),
  { version } = JSON.parse(
    await readFile(resolve(root, 'package.json'), 'utf8'),
  ),
  tarball = resolve(root, `dist/package/feltforge-${version}.tgz`);
// A fresh install prevents npm from reusing a previous same-version local tarball.
const consumerRoot = await mkdtemp(resolve(root, 'dist/installed-consumers-'));
const reports = [];
async function write(dir, name, body) {
  await mkdir(resolve(dir, name, '..'), { recursive: true });
  await writeFile(resolve(dir, name), body);
}
function run(dir, command, args) {
  return execFileSync(command, args, {
    cwd: dir,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
}
for (const mode of ['react18', 'next']) {
  const dir = resolve(consumerRoot, mode);
  await mkdir(dir, { recursive: true });
  const dependencies = {
    feltforge: `file:${tarball}`,
    react: mode === 'react18' ? '18.3.1' : '19.3.0',
    'react-dom': mode === 'react18' ? '18.3.1' : '19.3.0',
    typescript: '5.9.3',
    '@types/react': mode === 'react18' ? '18.3.24' : '19.3.0',
    '@types/react-dom': mode === 'react18' ? '18.3.7' : '19.3.0',
    ...(mode === 'next' ? { next: '16.4.0' } : {}),
  };
  await write(
    dir,
    'package.json',
    JSON.stringify(
      {
        name: `feltforge-${mode}-consumer`,
        private: true,
        type: 'module',
        dependencies,
      },
      null,
      2,
    ),
  );
  console.log(`Installing isolated ${mode} consumer from the actual tarball…`);
  run(dir, 'npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
  if (mode === 'react18') {
    await write(
      dir,
      'check.mjs',
      `import React from 'react';import {renderToString} from 'react-dom/server';import {Card,ChipStack,PokerTable} from 'feltforge';import {TableSurface} from 'feltforge/table-surface';import {western} from 'feltforge/courts/western';import {getTableLayout,TABLE_THEMES} from 'feltforge/core';import assert from 'node:assert/strict';const compact=renderToString(React.createElement(Card,{variant:'compact',rank:'K',suit:'spades'}));assert.match(compact,/viewBox="0 0 38 53"/);assert.doesNotMatch(compact,/<text|font-family/);const card=renderToString(React.createElement(Card,{rank:'Q',suit:'hearts',court:western}));assert.match(card,/Queen of Hearts/);assert.match(card,/<path/);const stack=renderToString(React.createElement(ChipStack,{value:25,count:1000}));assert.match(stack,/1000 chips, total 25000/);assert.equal((stack.match(/<text/g)||[]).length,5);assert.equal(TABLE_THEMES.length,6);for(const theme of TABLE_THEMES){const surface=renderToString(React.createElement(TableSurface,{width:334,height:486,detailScale:0.57,theme}));assert.match(surface,/viewBox="0 0 334 486"/);assert.doesNotMatch(surface,/<text|<image|font-family|NaN/);}for(const theme of TABLE_THEMES){const skin=renderToString(React.createElement(PokerTable,{layout:6,theme}));assert.match(skin,new RegExp('data-table-theme="'+theme+'"'));assert.doesNotMatch(skin,/<text|<image|font-family/);}const table=renderToString(React.createElement(PokerTable,{layout:9,renderSeat:s=>React.createElement('button',{},s.index)}));assert.equal((table.match(/<button/g)||[]).length,9);assert.equal(getTableLayout(9).seats.length,9);console.log('React '+React.version+' SSR passed');`,
    );
    await write(
      dir,
      'consumer.tsx',
      `import {Card,ChipStack,PokerTable} from 'feltforge';import {CompactCard} from 'feltforge/compact-card';import {TableSurface} from 'feltforge/table';import {western} from 'feltforge/courts/western';export const Example=()=> <><CompactCard rank="K" suit="spades" size="hero"/><Card variant="compact" rank="10" suit="clubs"/><Card rank="K" suit="hearts" court={western}/><ChipStack value={25} count={5}/><PokerTable layout={9} theme="neon-night"/><TableSurface width={334} height={486} detailScale={0.57}/></>;\n// @ts-expect-error Jokers cannot have suits\nconst wrong=<Card rank="joker" suit="hearts"/>;void wrong;`,
    );
    await write(
      dir,
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
        },
        include: ['consumer.tsx'],
      }),
    );
    const log = run(dir, 'node', ['check.mjs']);
    run(dir, resolve(dir, 'node_modules/.bin/tsc'), ['--noEmit']);
    console.log(log.trim());
    reports.push({ consumer: mode, react: '18.3.1', ssr: true, types: true });
  } else {
    await write(
      dir,
      'next.config.mjs',
      `export default {outputFileTracingRoot:process.cwd(),experimental:{cpus:2}};`,
    );
    await write(
      dir,
      'app/layout.tsx',
      `import type {ReactNode} from 'react';export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>}`,
    );
    await write(
      dir,
      'app/page.tsx',
      `import {Card,CardBack} from 'feltforge';import {TableSurface} from 'feltforge/table-surface';import {western} from 'feltforge/courts/western';import {getTableLayout,TABLE_THEMES} from 'feltforge/core';import Demo from './demo';export default function Page(){return <main><h1>FeltForge consumer</h1><Card rank="7" suit="hearts"/><Card rank="K" suit="clubs" court={western}/><CardBack/><p>{getTableLayout(6).seats.length} seats</p><Demo/></main>}`,
    );
    await write(
      dir,
      'app/demo.tsx',
      `'use client';import {useState} from 'react';import {ChipStack,PokerTable,TableSurface} from 'feltforge';export default function Demo(){const [count,setCount]=useState(5);return <><button onClick={()=>setCount(count+1)}>Add chip</button><ChipStack value={25} count={count}/><TableSurface width={559.64} height={262.66} detailScale={0.571}/><PokerTable layout={6} theme="royal-burgundy" renderSeat={s=><button>Seat {s.index}</button>}/></>}`,
    );
    console.log('Building Next.js App Router server/client consumer…');
    const log = run(dir, resolve(dir, 'node_modules/.bin/next'), [
      'build',
      '--webpack',
    ]);
    await write(dir, 'build.log', log);
    const html = await readFile(
      resolve(dir, '.next/server/app/index.html'),
      'utf8',
    );
    if (!html.includes('Seven of Hearts') || !html.includes('King of Clubs'))
      throw Error('Next prerender omitted cards');
    reports.push({
      consumer: mode,
      next: '16.4.0',
      react: '19.3.0',
      build: true,
      prerender: true,
    });
    console.log('Next.js production build and prerender passed.');
  }
}
await writeFile(
  resolve(root, 'dist/consumer-report.json'),
  JSON.stringify(reports, null, 2) + '\n',
);
