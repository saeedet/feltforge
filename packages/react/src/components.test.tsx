import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup as render } from 'react-dom/server';
import {
  Card,
  CardBack,
  Chip,
  ChipStack,
  PokerMarker,
  PokerTable,
  TableAnchor,
} from './index.js';
import { RANKS, SUITS } from '@feltforge/core';
import type { CourtRank, NumberRank } from '@feltforge/core';
import { persian } from '@feltforge/assets/courts/persian';
import { western } from '@feltforge/assets/courts/western';
import { eastern } from '@feltforge/assets/courts/eastern';
import { joker1 } from '@feltforge/assets/jokers/1';
import { joker2 } from '@feltforge/assets/jokers/2';

describe('card composition and semantics', () => {
  it('renders all compact ranks and suits in both approved sizes without fonts or court artwork', () => {
    for (const size of ['community', 'hero'] as const)
      for (const suit of SUITS)
        for (const rank of RANKS) {
          const out = render(
            <Card variant="compact" size={size} rank={rank} suit={suit} />,
          );
          expect(out).toContain(
            size === 'community'
              ? 'viewBox="0 0 38 53"'
              : 'viewBox="0 0 50 70"',
          );
          expect(out).toContain('data-card-variant="compact"');
          expect(out).not.toMatch(/<text|font-family|<image|courts|card-panel/);
          expect(out).toContain('box-shadow:var(--card-shadow');
          expect(out).toContain('<path');
        }
  });
  it('lets applications remove or replace shadows on fronts, Jokers, compact cards and backs', () => {
    for (const card of [
      <Card rank="7" suit="hearts" style={{ boxShadow: 'none' }} />,
      <Card rank="joker" artwork={joker1} style={{ boxShadow: 'none' }} />,
      <Card
        variant="compact"
        rank="K"
        suit="spades"
        style={{ boxShadow: 'none' }}
      />,
      <CardBack style={{ boxShadow: 'none' }} />,
    ])
      expect(render(card)).toContain('box-shadow:none');
    expect(
      render(<CardBack style={{ '--card-shadow': '0 0 4px red' }} />),
    ).toContain('--card-shadow:0 0 4px red');
    expect(render(<Card rank="7" suit="clubs" />)).not.toContain(
      'var(--card-border',
    );
  });
  it('renders every ordinary rank/suit and all court collections without runtime fonts or embedded images', () => {
    for (const suit of SUITS)
      for (const rank of RANKS) {
        const outputs = ['J', 'Q', 'K'].includes(rank)
          ? [persian, western, eastern].map((court) =>
              render(
                <Card rank={rank as CourtRank} suit={suit} court={court} />,
              ),
            )
          : [render(<Card rank={rank as 'A' | NumberRank} suit={suit} />)];
        for (const out of outputs) {
          expect(out).toContain('viewBox="0 0 250 350"');
          expect(out).toContain('role="img"');
          expect(out).not.toMatch(
            /<image|<text|font-family|data:image|https?:\/\//,
          );
          expect(out).toContain('<path');
        }
      }
  });
  it('has useful default labels, overrides and decorative semantics', () => {
    expect(render(<Card rank="7" suit="clubs" />)).toContain(
      'aria-label="Seven of Clubs"',
    );
    expect(render(<Card rank="K" suit="hearts" court={western} />)).toContain(
      'aria-label="King of Hearts"',
    );
    expect(
      render(<Card rank="A" suit="spades" aria-label="Your card" />),
    ).toContain('aria-label="Your card"');
    const decorative = render(<Card rank="2" suit="hearts" decorative />);
    expect(decorative).not.toContain('role="img"');
    expect(decorative).not.toContain('aria-label');
    expect(decorative).toContain('aria-hidden="true"');
  });
  it('keeps Joker variants independent and card backs free of rank requirements', () => {
    const a = render(<Card rank="joker" artwork={joker1} />),
      b = render(<Card rank="joker" artwork={joker2} />);
    expect(a).not.toBe(b);
    expect(a).toContain('aria-label="Joker 1"');
    expect(b).toContain('aria-label="Joker 2"');
    expect(render(<CardBack />)).toContain('aria-label="Classic card back"');
  });
  it('uses distinct referenced IDs when multiple custom spade centres share a document', () => {
    const out = render(
      <>
        <Card rank="A" suit="spades" />
        <Card rank="A" suit="spades" />
      </>,
    );
    const ids = [...out.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const match of out.matchAll(/(?:href="#|url\(#)([^)" ]+)/g))
      expect(ids).toContain(match[1]);
  });
});
describe('poker primitives', () => {
  it('keeps a continuous inner rim visible over all eight inserts for every chip palette', () => {
    for (const value of [1, 5, 25, 100, 500, 1000, 5000, 250]) {
      const svg = render(
        <Chip value={value} size={256} shadow={false} />,
      ).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      const withoutRim = svg.replace(
        /<circle\b[^>]*data-chip-rim=""[^>]*(?:\/>|><\/circle>)/,
        '',
      );
      expect(withoutRim).not.toBe(svg);
      const options = { font: { loadSystemFonts: false } };
      const bordered = PNG.sync.read(new Resvg(svg, options).render().asPng());
      const flat = PNG.sync.read(
        new Resvg(withoutRim, options).render().asPng(),
      );
      for (let i = 0; i < 8; i++) {
        const angle = ((-90 + i * 45) * Math.PI) / 180;
        const x = Math.round(128 + 126 * Math.cos(angle));
        const y = Math.round(128 + 126 * Math.sin(angle));
        const offset = (y * bordered.width + x) * 4;
        const difference = Math.max(
          ...[0, 1, 2].map(
            (c) => flat.data[offset + c]! - bordered.data[offset + c]!,
          ),
        );
        expect(
          difference,
          `rim over insert ${i} on chip ${value}`,
        ).toBeGreaterThan(5);
      }
    }
  });
  it('applies independent Contact layers to chips and every visible stack layer', () => {
    const out = render(
      <>
        <Chip value={25} />
        <ChipStack value={100} count={50} maxVisible={3} size={28} />
      </>,
    );
    const ids = [...out.matchAll(/<filter id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(2);
    expect(out.match(/data-chip-face=""/g)).toHaveLength(4);
    expect(out.match(/data-chip-rim=""/g)).toHaveLength(4);
    expect(out.match(/in="SourceAlpha"/g)).toHaveLength(4);
    expect(out).toContain('stdDeviation="0.5"');
    expect(out).toContain('stdDeviation="2"');
    expect(out).toContain('flood-opacity="0.35"');
    expect(out).toContain('flood-opacity="0.25"');
    expect(out).toContain('width="30.625"');
  });
  it('supports chip shadow removal, custom filters and inherited overrides without changing live labels', () => {
    for (const props of [
      { shadow: false, style: { filter: 'drop-shadow(0 3px 2px red)' } },
      { style: { filter: 'none' } },
      { style: { '--chip-shadow': 'none' } },
    ]) {
      for (const component of [
        <Chip value={25} {...props} />,
        <ChipStack value={25} count={3} {...props} />,
      ]) {
        const out = render(component);
        expect(out).toContain('<text');
        if ('shadow' in props) {
          expect(out).not.toContain('<filter');
          expect(out).not.toContain('drop-shadow');
          expect(out).toContain('filter:none');
        } else if (props.style.filter === 'none')
          expect(out).toContain('filter:none');
        else expect(out).toContain('--chip-shadow:none');
      }
    }
    const custom = render(
      <ChipStack
        value={25}
        count={3}
        style={{ filter: 'drop-shadow(0 3px 2px red)' }}
      />,
    );
    expect(custom.match(/filter:drop-shadow\(0 3px 2px red\)/g)).toHaveLength(
      3,
    );
  });
  it('preserves custom chip labels as escaped live text and exposes colours', () => {
    const out = render(
      <Chip
        value={250}
        label="<bonus>"
        color="#123456"
        insertColor="#abcdef"
      />,
    );
    expect(out).toContain('&lt;bonus&gt;');
    expect(out).toContain('<text');
    expect(out).toContain('#123456');
    expect(out).toContain('#abcdef');
    expect(out).toContain('textLength="34"');
  });
  it('caps large stacks while describing their actual total', () => {
    const out = render(
      <ChipStack
        chips={[
          { value: 25, count: 500 },
          { value: 100, count: 500 },
        ]}
        maxVisible={5}
      />,
    );
    expect(out).toContain('aria-label="1000 chips, total 62500"');
    expect(out.match(/<text/g)).toHaveLength(5);
    expect(out).toContain('viewBox="0 0 76 80"');
  });
  it('represents an empty stack without drawing a phantom chip', () => {
    const out = render(<ChipStack value={100} count={0} />);
    expect(out).not.toContain('<circle');
    expect(out).toContain('0 chips, total 0');
  });
  it.each([0, -1, NaN, Infinity])('rejects invalid chip size %s', (size) =>
    expect(() => render(<Chip value={25} size={size} />)).toThrow(),
  );
  it.each([
    ['dealer', 'Dealer button', 'D'],
    ['small-blind', 'Small blind', 'SB'],
    ['big-blind', 'Big blind', 'BB'],
  ] as const)('renders the %s marker', (type, label, text) => {
    const out = render(<PokerMarker type={type} />);
    expect(out).toContain(`aria-label="${label}"`);
    expect(out).toContain(`>${text}</text>`);
  });
  it.each([2, 6, 8, 9] as const)(
    'keeps interactive overlays accessible for %i seats',
    (layout) => {
      const out = render(
        <PokerTable
          layout={layout}
          renderSeat={(s) => <button>Seat {s.index}</button>}
          pot={<strong>Pot</strong>}
        />,
      );
      expect(out.match(/<button/g)).toHaveLength(layout);
      expect(out).toContain('role="group"');
      expect(out).toContain('left:50%;top:91.66666666666666%');
      expect(out).toContain('aspect-ratio:5 / 3');
    },
  );
  it('positions overlays independently of their dimensions', () => {
    const out = render(
      <TableAnchor at={{ x: 0.2, y: 0.8 }} style={{ width: 120 }}>
        Seat
      </TableAnchor>,
    );
    expect(out).toContain('left:20%;top:80%');
    expect(out).toContain('width:120px');
    expect(() => render(<TableAnchor at={{ x: NaN, y: 0 }} />)).toThrow();
  });
});

it('preserves standard face artwork from the independent Penpot PNG', () => {
  const svg = render(<Card rank="7" suit="hearts" />)
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/var\(--[^,]+,\s*([^)]*)\)/g, '$1');
  const image = new Resvg(svg).render();
  const pixels = image.pixels;
  const reference = PNG.sync.read(
    readFileSync(
      new URL(
        '../../../tooling/assets/reference/hearts-7.png',
        import.meta.url,
      ),
    ),
  );
  expect([image.width, image.height]).toEqual([
    reference.width,
    reference.height,
  ]);
  // The archived image has the retired outer border. Compare the interior;
  // the new CSS shadow is checked in the browser, where it is rendered.
  let error = 0,
    count = 0;
  for (let y = 14; y < image.height - 14; y++)
    for (let x = 14; x < image.width - 14; x++)
      for (let channel = 0; channel < 4; channel++) {
        const i = (y * image.width + x) * 4 + channel;
        error += Math.abs(pixels[i]! - reference.data[i]!);
        count++;
      }
  expect(error / count).toBeLessThan(0.5);
});
