import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { PokerTable, TableSurface, TABLE_THEMES } from './index.js';
import { resolveSurfaceGeometry, adaptTableLayers } from './table-geometry.js';
import { TABLE_SKINS } from './table-skins.generated.js';
import type { TableLayer } from './table-skin-types.js';
import { withoutTableDecorations } from '../../../tooling/assets/table-materials.mjs';

function flatten(nodes: readonly TableLayer[]): TableLayer[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}
const sizes = [
  [334, 486, 0.57],
  [334, 486, 334 / 460],
  [559.64, 262.66, 0.571],
  [460, 460, 1],
  [725, 355, 0.7],
  [315, 700, 0.6],
  [640, 380, 0.8],
] as const;
describe('adaptive table surfaces', () => {
  it.each(TABLE_THEMES)(
    'preserves every %s desktop material pixel from 0.4.0 outside the realigned artwork',
    (theme) => {
      const svg = render(<PokerTable layout={6} theme={theme} />)
        .replace(/^<div[^>]*>/, '')
        .replace(/<\/div>$/, '')
        .replace(
          '<svg ',
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ',
        )
        .replace('width="100%" height="100%"', 'width="1000" height="600"')
        .replace(/var\(--[\w-]+,\s*(url\([^)]+\)|[^)]+)\)/g, '$1');
      const image = new Resvg(withoutTableDecorations(svg)).render(),
        pixels = PNG.sync.read(image.asPng()).data;
      const reference = PNG.sync.read(
        readFileSync(
          new URL(
            `../../../tooling/assets/reference/tables/materials-v0.4.0-${theme}.png`,
            import.meta.url,
          ),
        ),
      );
      expect([image.width, image.height]).toEqual([1000, 600]);
      expect(Buffer.compare(pixels, reference.data)).toBe(0);
    },
  );
  it('uses outer-rail bounds rather than the desktop scene canvas', () => {
    const out = render(
      <TableSurface
        width={334}
        height={486}
        detailScale={0.57}
        data-testid="surface"
      />,
    );
    expect(out).toContain('viewBox="0 0 334 486"');
    expect(out).toContain('width="334" height="486"');
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="Classic poker table surface"');
    expect(out).not.toMatch(/data-seat-index|container-type|<button/);
    expect(out).toContain('preserveAspectRatio="xMidYMid meet"');
    expect(render(<TableSurface decorative />)).toContain('aria-hidden="true"');
  });
  it.each(TABLE_THEMES)(
    'recomputes %s insets, radii, materials and ornaments at arbitrary proportions',
    (theme) => {
      for (const [width, height, detailScale] of sizes) {
        const g = resolveSurfaceGeometry(width, height, detailScale),
          nodes = flatten(adaptTableLayers(TABLE_SKINS[theme], g));
        const rail = nodes.find((n) => n.name === 'Outer Rail')!;
        expect([rail.x, rail.y, rail.width, rail.height, rail.radius]).toEqual([
          80,
          70,
          width,
          height,
          Math.min(width, height) / 2,
        ]);
        const insetNodes = nodes.filter((n) => n.placement?.kind === 'inset');
        for (const node of insetNodes) {
          if (node.placement?.kind !== 'inset') throw Error('Unreachable');
          const inset = node.placement.inset * detailScale;
          expect(node.x - 80).toBeCloseTo(inset);
          expect(node.y - 70).toBeCloseTo(inset);
          expect(node.width).toBeCloseTo(width - 2 * inset);
          expect(node.height).toBeCloseTo(height - 2 * inset);
          expect(node.radius).toBeCloseTo(Math.min(width, height) / 2 - inset);
          expect(node.width).toBeGreaterThan(0);
          expect(node.height).toBeGreaterThan(0);
          expect(node.x + node.width / 2).toBeCloseTo(80 + width / 2);
          expect(node.y + node.height / 2).toBeCloseTo(70 + height / 2);
        }
        const out = render(
          <TableSurface
            theme={theme}
            width={width}
            height={height}
            detailScale={detailScale}
          />,
        );
        expect(out).toContain('<linearGradient');
        expect(out).toContain('<radialGradient');
        expect(out).toContain('var(--table-felt, url(');
        expect(out).toContain('var(--table-shadow, url(');
        expect(out).not.toMatch(
          /<text\b|<image\b|NaN|Infinity|scale\([^ )]+[ ,]+[^ )]+\)/,
        );
        for (const n of nodes.filter((n) => n.wordmark)) {
          const original = TABLE_SKINS[theme].find(
            (v) => v.wordmark === n.wordmark,
          )!;
          expect(n.width / original.width).toBeCloseTo(detailScale);
          expect(n.height / original.height).toBeCloseTo(detailScale);
        }
      }
    },
  );
  it('keeps the portrait Classic felt and betting line at their actual material insets', () => {
    const nodes = adaptTableLayers(
      TABLE_SKINS.classic,
      resolveSurfaceGeometry(334, 486, 0.57),
    );
    const felt = nodes.find((n) => n.name === 'Felt')!,
      line = nodes.find((n) => n.name === 'Betting Line')!;
    expect(felt.x).toBeCloseTo(98.24);
    expect(felt.width).toBeCloseTo(297.52);
    expect(felt.radius).toBeCloseTo(148.76);
    expect(line.x).toBeCloseTo(126.74);
    expect(line.width).toBeCloseTo(240.52);
    expect(line.radius).toBeCloseTo(120.26);
    const out = render(
      <TableSurface width={334} height={486} detailScale={0.57} />,
    );
    expect(Number(out.match(/stdDeviation="([^"]+)"/)![1])).toBeCloseTo(8.55);
    expect(
      out
        .match(/stroke-dasharray="([^"]+)"/)![1]!
        .split(' ')
        .map(Number),
    ).toEqual([0.57 * 10, 0.57 * 10]);
  });
  it('places round brass studs on the actual stadium perimeter and bounds their count', () => {
    for (const [width, height, s] of [
      [840, 460, 1] as const,
      ...sizes,
      [1000000, 460, 1] as const,
    ]) {
      const nodes = flatten(
        adaptTableLayers(
          TABLE_SKINS['royal-burgundy'],
          resolveSurfaceGeometry(width, height, s),
        ),
      );
      const studs = nodes.filter((n) => n.kind === 'ellipse');
      expect(studs.length).toBeLessThanOrEqual(512);
      expect(studs.length).toBeGreaterThan(8);
      expect(studs.length % 4).toBe(0);
      for (const node of studs) {
        expect(node.width).toBeCloseTo(6 * s);
        expect(node.height).toBeCloseTo(node.width);
        const x = node.x + node.width / 2,
          y = node.y + node.height / 2,
          r = Math.min(width, height) / 2;
        const cx =
          width >= height
            ? Math.min(80 + width - r, Math.max(80 + r, x))
            : 80 + width / 2;
        const cy =
          height >= width
            ? Math.min(70 + height - r, Math.max(70 + r, y))
            : 70 + height / 2;
        expect(Math.hypot(x - cx, y - cy)).toBeCloseTo(r - 9 * s, 6);
        for (const [mx, my] of [
          [160 + width - x, y],
          [x, 140 + height - y],
        ])
          expect(
            studs.some(
              (other) =>
                Math.abs(other.x + other.width / 2 - mx!) < 1e-6 &&
                Math.abs(other.y + other.height / 2 - my!) < 1e-6,
            ),
          ).toBe(true);
      }
    }
  });
  it.each(TABLE_THEMES)(
    'centers the visible %s suit symbols, lettering and crowns at every proportion',
    (theme) => {
      for (const [width, height, s] of [[840, 460, 1] as const, ...sizes]) {
        const nodes = flatten(
          adaptTableLayers(
            TABLE_SKINS[theme],
            resolveSurfaceGeometry(width, height, s),
          ),
        );
        for (const n of nodes.filter((n) => n.wordmark)) {
          const asset = n.wordmark!;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width + 160}" height="${height + 140}"><svg x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" viewBox="${asset.viewBox}">${asset.body}</svg></svg>`;
          const bounds = new Resvg(svg, {
            font: { loadSystemFonts: false },
          }).getBBox()!;
          expect(bounds.x + bounds.width / 2).toBeCloseTo(80 + width / 2, 3);
        }
      }
    },
  );
  it('keeps Art Deco chevrons and diamonds mirrored on both table axes', () => {
    for (const [width, height, s] of [[840, 460, 1] as const, ...sizes]) {
      const nodes = adaptTableLayers(
        TABLE_SKINS['emerald-art-deco'],
        resolveSurfaceGeometry(width, height, s),
      );
      const center = (node: TableLayer) => {
        const [, tx, ty] = node.transform!.match(
          /translate\(([^ ]+) ([^)]+)\)/,
        )!;
        return [
          Number(tx) + (node.x + node.width / 2) * s,
          Number(ty) + (node.y + node.height / 2) * s,
        ];
      };
      for (const edge of ['top', 'bottom']) {
        const row = nodes.filter(
          (n) =>
            n.name.startsWith('Deco Diamond') &&
            n.placement?.kind === 'ornament' &&
            n.placement.edge === edge,
        );
        const diamonds = row
          .map((node) => center(node)[0]!)
          .sort((a, b) => a - b);
        expect(diamonds).toHaveLength(3);
        expect(diamonds[1]).toBeCloseTo(80 + width / 2, 6);
        expect((diamonds[0]! + diamonds[2]!) / 2).toBeCloseTo(
          80 + width / 2,
          6,
        );
        expect(diamonds[1]! - diamonds[0]!).toBeCloseTo(16 * s, 6);
        expect(diamonds[2]! - diamonds[1]!).toBeCloseTo(16 * s, 6);
        for (const node of row)
          expect(center(node)[1]).toBeCloseTo(
            edge === 'top' ? 70 + 84 * s : 70 + height - 84 * s,
            6,
          );
      }
      for (const ornament of nodes.filter((n) => n.kind === 'path')) {
        const [x, y] = center(ornament);
        const verticalPair = ornament.name.startsWith('Deco Diamond');
        expect(
          nodes.some((other) => {
            if (
              other.name !== ornament.name ||
              other.width !== ornament.width ||
              other.height !== ornament.height
            )
              return false;
            const [ox, oy] = center(other);
            return (
              Math.abs(ox! - (verticalPair ? x! : 160 + width - x!)) < 1e-6 &&
              Math.abs(oy! - (verticalPair ? 140 + height - y! : y!)) < 1e-6
            );
          }),
        ).toBe(true);
      }
    }
  });
  it.each(TABLE_THEMES)(
    'keeps %s lettering inside the curved betting field without distortion',
    (theme) => {
      for (const [width, height, s] of [
        ...sizes,
        [334, 334, 334 / 280] as const,
        [300, 800, 300 / 280] as const,
      ]) {
        const source = TABLE_SKINS[theme];
        const inset =
          (Math.max(
            ...source.map((n) =>
              n.placement?.kind === 'inset' ? n.placement.inset : 0,
            ),
          ) +
            4) *
          s;
        const r = Math.min(width, height) / 2 - inset;
        const nodes = flatten(
          adaptTableLayers(source, resolveSurfaceGeometry(width, height, s)),
        );
        for (const n of nodes.filter((n) => n.wordmark)) {
          const original = source.find((v) => v.wordmark === n.wordmark)!;
          expect(n.width / n.height).toBeCloseTo(
            original.width / original.height,
            6,
          );
          expect(n.width / original.width).toBeGreaterThan(0);
          expect(n.width / original.width).toBeLessThanOrEqual(s + 1e-10);
          for (const x of [n.x, n.x + n.width])
            for (const y of [n.y, n.y + n.height]) {
              const cx =
                width >= height
                  ? Math.min(
                      80 + width - Math.min(width, height) / 2,
                      Math.max(80 + Math.min(width, height) / 2, x),
                    )
                  : 80 + width / 2;
              const cy =
                height >= width
                  ? Math.min(
                      70 + height - Math.min(width, height) / 2,
                      Math.max(70 + Math.min(width, height) / 2, y),
                    )
                  : 70 + height / 2;
              expect(Math.hypot(x - cx, y - cy)).toBeLessThanOrEqual(r + 1e-8);
            }
        }
      }
    },
  );
  it('tiles textures with stable dimensions and instance-local references', () => {
    const out = render(
      <>
        {TABLE_THEMES.map((theme) => (
          <TableSurface key={theme} theme={theme} width={334} height={486} />
        ))}
        <TableSurface theme="neon-night" width={720} height={300} />
      </>,
    );
    expect(out.match(/<pattern/g)).toHaveLength(3);
    const ids = [...out.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of out.matchAll(/(?:url\(#|href="#)([^)" ]+)/g))
      expect(ids).toContain(m[1]);
  });
  it.each(['neon-night', 'ocean-slate'] as const)(
    'centers %s texture motifs and preserves their proportions',
    (theme) => {
      for (const [width, height, detailScale] of [
        [840, 460, 1] as const,
        ...sizes,
      ]) {
        const output = render(
          <TableSurface
            theme={theme}
            width={width}
            height={height}
            detailScale={detailScale}
          />,
        );
        const pattern = output.match(/<pattern\b[^>]*>[\s\S]*?<\/pattern>/)![0];
        const attribute = (name: string) =>
          Number(pattern.match(new RegExp(` ${name}="([^"]+)"`))![1]);
        const viewBox = pattern
          .match(/viewBox="([^"]+)"/)![1]!
          .split(' ')
          .map(Number);
        expect(attribute('width') / viewBox[2]!).toBeCloseTo(detailScale, 6);
        expect(attribute('height') / viewBox[3]!).toBeCloseTo(detailScale, 6);
        expect(attribute('x') + attribute('width') / 2).toBeCloseTo(
          80 + width / 2,
          6,
        );
        expect(
          attribute('y') +
            attribute('height') * (theme === 'neon-night' ? 1 / 3 : 1 / 2),
        ).toBeCloseTo(70 + height / 2, 6);
      }
    },
  );
  it('defaults details to the short edge, leaves source geometry immutable and validates dimensions', () => {
    expect(resolveSurfaceGeometry(334, 486).detailScale).toBeCloseTo(334 / 460);
    const before = JSON.stringify(TABLE_SKINS);
    for (const theme of TABLE_THEMES)
      adaptTableLayers(TABLE_SKINS[theme], resolveSurfaceGeometry());
    expect(JSON.stringify(TABLE_SKINS)).toBe(before);
    for (const value of [0, -1, NaN, Infinity]) {
      expect(() => render(<TableSurface width={value} />)).toThrow(RangeError);
      expect(() => render(<TableSurface height={value} />)).toThrow(RangeError);
      expect(() => render(<TableSurface detailScale={value} />)).toThrow(
        RangeError,
      );
    }
    expect(() =>
      render(<TableSurface width={334} height={486} detailScale={2} />),
    ).toThrow(RangeError);
    expect(() =>
      render(
        <TableSurface width={Number.MAX_VALUE} height={Number.MAX_VALUE} />,
      ),
    ).toThrow(RangeError);
  });
});
