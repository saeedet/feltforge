import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { prepareSvg } from './svg.mjs';

export const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex');

export function safeAssetPath(root, name) {
  if (!/^[a-z0-9/-]+\.svg$/.test(name))
    throw new Error(`Invalid asset path: ${name}`);
  const path = resolve(root, name);
  const rel = relative(root, path);
  if (rel.startsWith(`..${sep}`) || rel === '..')
    throw new Error('Asset path escapes root');
  return path;
}

export async function buildAssets(projectRoot) {
  const assetRoot = resolve(projectRoot, 'packages/assets');
  const manifest = JSON.parse(
    await readFile(resolve(assetRoot, 'manifest.json'), 'utf8'),
  );
  const contract = JSON.parse(
    await readFile(resolve(assetRoot, 'contract.json'), 'utf8'),
  );
  const expected = new Set(contract.assets);
  if (
    manifest.assets.length !== 31 ||
    expected.size !== 31 ||
    manifest.assets.some((a) => !expected.delete(a.path)) ||
    expected.size
  )
    throw new Error('Asset manifest must match the exact 31-asset contract');
  const pending = manifest.assets.filter(
    (a) => !a.sha256 || !a.sourceId || !a.license,
  );
  if (pending.length)
    throw new Error(
      `Authoritative source/provenance pending: ${pending.map((a) => a.path).join(', ')}`,
    );
  const outputs = [];
  for (const asset of manifest.assets) {
    const sourceRoot = resolve(
      assetRoot,
      asset.kind === 'outline' ? 'outlined' : 'source',
    );
    const source = await readFile(
      safeAssetPath(sourceRoot, asset.path),
      'utf8',
    );
    if (sha256(source) !== asset.sha256)
      throw new Error(`Source checksum changed: ${asset.path}`);
    const svg = prepareSvg(source, asset);
    outputs.push({
      asset,
      svg,
      stats: {
        path: asset.path,
        sourceBytes: Buffer.byteLength(source),
        bytes: Buffer.byteLength(svg),
        sha256: sha256(svg),
      },
    });
  }
  // Validate every source before writing any production file.
  for (const { asset, svg } of outputs) {
    const output = safeAssetPath(resolve(assetRoot, 'generated'), asset.path);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, svg);
  }
  const report = {
    fileId: manifest.fileId,
    assets: outputs.map((x) => x.stats),
  };
  await writeFile(
    resolve(assetRoot, 'optimization-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  return report;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const report = await buildAssets(
      resolve(fileURLToPath(new URL('../../', import.meta.url))),
    );
    console.log(`Prepared ${report.assets.length} production assets.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
