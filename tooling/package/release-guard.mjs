import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const { version, private: isPrivate } = JSON.parse(
  await readFile(resolve(root, 'package.json'), 'utf8'),
);
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))
  throw Error(`Invalid release version: ${version}`);
if (isPrivate !== true) throw Error('The workspace root must remain private.');
if (process.env.GITHUB_REF !== `refs/tags/v${version}`)
  throw Error(
    `Release tag must be v${version}; got ${process.env.GITHUB_REF ?? 'none'}.`,
  );

console.log(`Release tag matches feltforge@${version}.`);
