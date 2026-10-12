import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const dry = !process.argv.includes('--pack');
const report = JSON.parse(
  execFileSync(
    'npm',
    ['pack', ...(dry ? ['--dry-run'] : []), '--json', '--ignore-scripts'],
    { cwd: resolve(root, 'dist/package'), encoding: 'utf8' },
  ),
);
const item = report[0];
if (
  item.files.some((f) =>
    /\.env|\.(ttf|otf|woff2?)$|source\/|node_modules/.test(f.path),
  )
)
  throw Error('Unexpected package content');
if (item.files.filter((f) => /^assets\/.*\.svg$/.test(f.path)).length !== 31)
  throw Error('Standalone asset contract missing');
await writeFile(
  resolve(
    root,
    'dist',
    dry ? 'npm-pack-report.json' : 'npm-tarball-report.json',
  ),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      dryRun: dry,
      name: item.name,
      version: item.version,
      files: item.entryCount,
      packedBytes: item.size,
      unpackedBytes: item.unpackedSize,
      filename: item.filename,
    },
    null,
    2,
  ),
);
