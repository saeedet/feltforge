import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { PokerTable, TABLE_THEMES, TABLE_THEME_LABELS } from './table.js';
import type { TableTheme } from './table.js';
import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

describe('Penpot table themes', () => {
  it('uses the refreshed Classic design by default', () => {
    const output = render(<PokerTable layout={6} />);
    expect(output).toContain('data-table-theme="classic"');
    expect(output).toContain('data-table-layer="Rail Stitching"');
    expect(output).toContain('data-table-layer="Overhead Light"');
    expect(output).toContain('stroke-dasharray="10 10"');
  });
  it.each(TABLE_THEMES)(
    'renders %s as self-contained decorative vectors in every layout',
    (theme) => {
      for (const layout of [2, 6, 8, 9] as const) {
        const output = render(
          <PokerTable
            layout={layout}
            theme={theme}
            renderSeat={(s) => <button>Seat {s.index + 1}</button>}
            pot={<strong>Pot: 100</strong>}
          />,
        );
        expect(TABLE_THEME_LABELS[theme]).toBeTruthy();
        expect(output).toContain(`data-table-theme="${theme}"`);
        expect(output.match(/<button/g)).toHaveLength(layout);
        expect(output).toContain('left:50%;top:35.333333333333336%');
        expect(output).toContain('left:50%;top:91.66666666666666%');
        expect(output).toContain('<linearGradient');
        expect(output).toContain('<radialGradient');
        expect(output).toContain('aria-hidden="true"');
        expect(output).not.toMatch(
          /<text\b|<image\b|font-family|@font-face|https?:/,
        );
        expect(output).not.toContain('Community Area');
        expect(output).not.toContain('Anchor Guides');
      }
    },
  );
  it('scopes all clip, gradient, shadow and glyph references to each instance', () => {
    const output = render(
      <>
        {TABLE_THEMES.map((theme) => (
          <PokerTable key={theme} theme={theme} layout={6} />
        ))}
        <PokerTable theme="royal-burgundy" layout={9} />
      </>,
    );
    const ids = [...output.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const references = [...output.matchAll(/(?:url\(#|href="#)([^)" ]+)/g)].map(
      (m) => m[1],
    );
    for (const id of references) expect(ids).toContain(id);
  });
  it('exposes material and shadow overrides without affecting HTML overlays', () => {
    const output = render(
      <PokerTable
        theme="neon-night"
        layout={2}
        style={{ '--table-felt': '#123456', '--table-shadow': 'none' }}
        community={<button>Community</button>}
      />,
    );
    expect(output).toContain('--table-felt:#123456;--table-shadow:none');
    expect(output).toContain('var(--table-felt, url(');
    expect(output).toContain('var(--table-line, #ff3dd8)');
    expect(output).toContain('var(--table-shadow, url(');
    expect(output).toContain('<button>Community</button>');
  });
  it('rejects unsupported runtime themes', () => {
    expect(() =>
      render(<PokerTable layout={6} theme={'missing' as TableTheme} />),
    ).toThrow(RangeError);
  });
  it.each(['classic', 'royal-burgundy'] as const)(
    'matches the %s master independently exported from Penpot',
    (theme) => {
      const svg = render(<PokerTable layout={6} theme={theme} />)
        .replace(/^<div[^>]*>/, '')
        .replace(/<\/div>$/, '')
        .replace(
          '<svg ',
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ',
        )
        .replace('viewBox="0 0 1000 600"', 'viewBox="-25 -35 1050 718"')
        .replace('width="100%" height="100%"', 'width="1050" height="718"')
        .replace(/var\(--[\w-]+,\s*(url\([^)]+\)|[^)]+)\)/g, '$1');
      const image = new Resvg(svg).render();
      const pixels = image.pixels;
      const reference = PNG.sync.read(
        readFileSync(
          new URL(
            `../../../tooling/assets/reference/tables/${theme}.png`,
            import.meta.url,
          ),
        ),
      );
      expect([image.width, image.height]).toEqual([
        reference.width,
        reference.height,
      ]);
      let error = 0,
        count = 0;
      // Compare the table interior; shadow tails vary between rasterizers.
      for (let y = 105; y < 565; y++)
        for (let x = 105; x < 945; x++)
          for (let channel = 0; channel < 4; channel++) {
            const i = (y * image.width + x) * 4 + channel;
            error += Math.abs(pixels[i]! - reference.data[i]!);
            count++;
          }
      expect(error / count).toBeLessThan(1);
    },
  );
});
