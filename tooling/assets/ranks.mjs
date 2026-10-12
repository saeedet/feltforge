import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import opentype from 'opentype.js';
import { prepareSvg } from './svg.mjs';

/** Baselines must be measured from the actual Penpot text export, never guessed. */
export function outlineGlyphs(
  font,
  { glyphs, width, height, fontSize, baselines, offsets, advances },
) {
  if (
    !glyphs.length ||
    glyphs.length !== baselines.length ||
    baselines.some((y) => !Number.isFinite(y))
  )
    throw new Error('Verified baseline required for every glyph');
  const paths = glyphs
    .map((glyph, i) => {
      if (font.charToGlyphIndex(glyph) === 0)
        throw new Error(`Missing font glyph: ${glyph}`);
      const advance = font.getAdvanceWidth(glyph, fontSize, { kerning: false });
      const path = font.getPath(glyph, 0, baselines[i], fontSize);
      const x = offsets?.[i] ?? (width - advance) / 2;
      const scaleX = (advances?.[i] ?? advance) / advance;
      for (const command of path.commands) {
        for (const key of ['x', 'x1', 'x2'])
          if (key in command) command[key] = x + command[key] * scaleX;
      }
      return path.toSVG(5);
    })
    .join('');
  return prepareSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${paths}</svg>`,
    { width, height, monochrome: true },
  );
}

export async function generateRanks(projectRoot) {
  const root = resolve(projectRoot, 'packages/assets');
  const config = JSON.parse(
    await readFile(resolve(root, 'fonts.json'), 'utf8'),
  );
  const outputs = [];
  for (const face of config.faces) {
    if (
      !face.sha256 ||
      !face.sourceUrl ||
      !face.file ||
      !face.verifiedAgainstPenpot
    )
      throw new Error(
        `Exact ${face.family} ${face.weight} font is not verified against Penpot`,
      );
    const data = await readFile(resolve(root, 'source/fonts', face.file));
    if (createHash('sha256').update(data).digest('hex') !== face.sha256)
      throw new Error('Font checksum mismatch');
    const font = opentype.parse(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    );
    if (font.tables.os2.usWeightClass !== face.weight)
      throw new Error('Font weight mismatch; provide a pinned static instance');
    for (const item of config.ranks.filter((r) => r.weight === face.weight)) {
      outputs.push({
        path: resolve(root, 'outlined/ranks', item.name + '.svg'),
        svg: outlineGlyphs(font, item),
      });
    }
  }
  for (const output of outputs) {
    await mkdir(dirname(output.path), { recursive: true });
    await writeFile(output.path, output.svg);
  }
  return outputs.length;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(
      `Outlined ${await generateRanks(resolve(fileURLToPath(new URL('../../', import.meta.url))))} rank/index assets.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
