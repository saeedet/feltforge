import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
  rm,
} from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
const root = resolve(import.meta.dirname, '../..'),
  out = resolve(root, 'dist/package');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const internal = {
  '@feltforge/core': 'core/index.js',
  '@feltforge/assets/types': 'assets/types.js',
  '@feltforge/assets/symbols': 'assets/generated/symbols.js',
  '@feltforge/assets/classic': 'assets/generated/classic.js',
};
async function copyTree(source, target, rewrite = false) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const a = resolve(source, entry.name),
      b = resolve(target, entry.name);
    if (entry.isDirectory()) await copyTree(a, b, rewrite);
    else if (rewrite) {
      if (!/\.(?:js|d\.ts)$/.test(entry.name)) continue;
      let text = await readFile(a, 'utf8');
      for (const [name, path] of Object.entries(internal)) {
        let rel = relative(dirname(b), resolve(out, 'dist', path)).replaceAll(
          '\\',
          '/',
        );
        if (!rel.startsWith('.')) rel = './' + rel;
        text = text
          .replaceAll(`'${name}'`, JSON.stringify(rel))
          .replaceAll(`"${name}"`, JSON.stringify(rel));
      }
      text = text.replace(/^\/\/# sourceMappingURL=.*$/gm, '');
      if (text.includes('@feltforge/'))
        throw Error('Unresolved workspace import: ' + b);
      await writeFile(b, text);
    } else await copyFile(a, b);
  }
}
for (const name of ['core', 'assets', 'react'])
  await copyTree(
    resolve(root, 'packages', name, 'dist'),
    resolve(out, 'dist', name),
    true,
  );
await copyTree(
  resolve(root, 'packages/assets/generated'),
  resolve(out, 'assets'),
);
await rm(resolve(out, 'assets/README.md'), { force: true });
await copyFile(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));
await copyFile(resolve(root, 'README.md'), resolve(out, 'README.md'));
await copyFile(
  resolve(root, 'packages/assets/source/fonts/OFL.txt'),
  resolve(out, 'HANUMAN-OFL.txt'),
);
await writeFile(
  resolve(out, 'NOTICE'),
  'FeltForge code and approved artwork: MIT.\nRank and Joker-index outlines are derived from Hanuman (SIL OFL 1.1).\nNo font files are included. See HANUMAN-OFL.txt and repository provenance documentation.\n',
);
const entry = (path) => ({
  types: `./dist/${path}.d.ts`,
  import: `./dist/${path}.js`,
});
const exports = {
  '.': entry('react/index'),
  './react': entry('react/index'),
  './core': entry('core/index'),
  './cards': entry('react/cards'),
  './poker': entry('react/poker'),
  './card': entry('react/card'),
  './card-back': entry('react/card-back'),
  './chips': entry('react/chip'),
  './table': entry('react/table'),
  './marker': entry('react/marker'),
  './artwork': entry('assets/types'),
  './assets/*': './assets/*',
  './package.json': './package.json',
};
for (const style of ['persian', 'western', 'eastern'])
  exports['./courts/' + style] = entry('assets/generated/courts/' + style);
for (const variant of ['1', '2'])
  exports['./jokers/' + variant] = entry('assets/generated/jokers/' + variant);
for (const [name, names] of Object.entries({
  cards: ['card', 'card-back'],
  poker: ['chip', 'marker', 'table'],
}))
  for (const ext of ['js', 'd.ts'])
    await writeFile(
      resolve(out, 'dist/react', name + '.' + ext),
      names.map((n) => `export * from './${n}.js';`).join('\n') + '\n',
    );
await writeFile(
  resolve(out, 'package.json'),
  JSON.stringify(
    {
      name: 'feltforge',
      version: '0.1.0',
      private: true,
      description:
        'Open-source UI primitives for playing cards and poker interfaces.',
      type: 'module',
      license: 'MIT',
      sideEffects: false,
      exports,
      files: [
        'dist',
        'assets',
        'LICENSE',
        'NOTICE',
        'HANUMAN-OFL.txt',
        'README.md',
      ],
      peerDependencies: { react: '^18.2.0 || ^19.0.0' },
      peerDependenciesMeta: { react: { optional: true } },
      engines: { node: '>=18' },
      repository: {
        type: 'git',
        url: 'git+https://github.com/saeedet/feltforge.git',
      },
      homepage: 'https://github.com/saeedet/feltforge',
      bugs: { url: 'https://github.com/saeedet/feltforge/issues' },
      keywords: ['react', 'playing-cards', 'poker', 'svg', 'ui'],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Assembled private release candidate at dist/package; publishing requires explicit approval.',
);
