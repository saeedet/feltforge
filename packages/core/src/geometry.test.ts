import { describe, expect, it } from 'vitest';
import {
  CARD,
  PIP_LAYOUTS,
  DEFAULT_COURT_STYLE,
  DEFAULT_JOKER_VARIANT,
  getTableLayout,
  getMarkerPosition,
  normalizeTablePoint,
  getVisibleStack,
  formatChipValue,
  getChipPalette,
  chipInsertPath,
  type TableLayout,
} from './index.js';
describe('canonical card data', () => {
  it('maintains 5:7 and approved defaults', () => {
    expect(CARD.width / CARD.height).toBe(5 / 7);
    expect(DEFAULT_COURT_STYLE).toBe('persian');
    expect(DEFAULT_JOKER_VARIANT).toBe('1');
  });
  it.each(Object.entries(PIP_LAYOUTS))(
    'rank %s has the right pip count, bounds and orientation',
    (rank, pips) => {
      expect(pips).toHaveLength(Number(rank));
      for (const [x, y, rotation] of pips) {
        expect(x).toBeGreaterThanOrEqual(84);
        expect(x).toBeLessThanOrEqual(166);
        expect(y).toBeGreaterThanOrEqual(91.75);
        expect(y).toBeLessThanOrEqual(258.25);
        expect(rotation).toBe(y > 175 ? 180 : 0);
      }
    },
  );
  it('uses final centre-column bonus rows, not pip top-left positions', () => {
    expect(PIP_LAYOUTS['7']).toContainEqual([125, 133.375, 0]);
    expect(PIP_LAYOUTS['8']).toContainEqual([125, 216.625, 180]);
    expect(PIP_LAYOUTS['10']).toContainEqual([125, 119.5, 0]);
    expect(PIP_LAYOUTS['10']).toContainEqual([125, 230.5, 180]);
  });
});
describe('approved table and marker positions', () => {
  it.each([2, 6, 8, 9] as const)(
    'layout %i preserves seat 0 and normalized anchors',
    (layout) => {
      const data = getTableLayout(layout);
      expect(data.seats).toHaveLength(layout);
      expect(data.seats[0]?.seat).toEqual({ x: 500, y: 550 });
      expect(data.seats[0]?.bet).toEqual({ x: 500, y: 445 });
      expect(data.seats[0]?.marker).toEqual({ x: 555, y: 425 });
      for (const s of data.seats) {
        expect(s.normalized.seat.x).toBe(s.seat.x / 1000);
        expect(s.normalized.seat.y).toBe(s.seat.y / 600);
        expect(s.normalized.marker.x).toBeGreaterThan(0);
        expect(s.normalized.marker.x).toBeLessThan(1);
      }
    },
  );
  it('stays within 0.1px of the approximate documented marker table', () => {
    const reference = [
      [555, 425],
      [370, 462.5],
      [226.4, 384.7],
      [322.2, 147.3],
      [471.1, 144.2],
      [528.9, 144.2],
      [677.8, 147.3],
      [773.6, 384.7],
      [630, 462.5],
    ];
    getTableLayout(9).seats.forEach((seat, i) => {
      expect(Math.abs(seat.marker.x - reference[i]![0]!)).toBeLessThan(0.1);
      expect(Math.abs(seat.marker.y - reference[i]![1]!)).toBeLessThan(0.1);
    });
  });
  it('rejects undefined geometric states', () => {
    expect(() => getTableLayout(3 as TableLayout)).toThrow();
    expect(() => getMarkerPosition({ x: 500, y: 300 }, 1)).toThrow();
    expect(() => normalizeTablePoint({ x: NaN, y: 0 })).toThrow();
  });
});
describe('chip data and bounded stack representation', () => {
  it('formats approved denominations and preserves custom values', () => {
    expect(formatChipValue(1000)).toBe('1K');
    expect(formatChipValue(5000)).toBe('5K');
    expect(formatChipValue(250)).toBe('250');
    expect(formatChipValue(0.5)).toBe('0.5');
    expect(() => formatChipValue(Infinity)).toThrow();
    expect(() => formatChipValue(-5)).toThrow();
  });
  it('keeps theme overrides isolated from defaults', () => {
    const p = getChipPalette(25);
    expect(p.base).toBe('#2E7D32');
    expect(getChipPalette(250).base).toBe('#0C7A7C');
    expect(getChipPalette(25)).not.toBe(p);
  });
  it('matches the approved 5-chip top-down footprint and mixed total', () => {
    const stack = getVisibleStack([
      { value: 100, count: 3 },
      { value: 500, count: 2 },
    ]);
    expect(stack).toMatchObject({
      count: 5,
      totalValue: 1300,
      width: 76,
      height: 80,
    });
    expect(stack.visible.map((c) => c.value)).toEqual([
      100, 100, 100, 500, 500,
    ]);
  });
  it('caps huge counts while preserving topmost groups', () => {
    const stack = getVisibleStack(
      [
        { value: 100, count: 1000000 },
        { value: 500, count: 2 },
      ],
      5,
    );
    expect(stack.count).toBe(1000002);
    expect(stack.visible.map((c) => c.value)).toEqual([
      100, 100, 100, 500, 500,
    ]);
  });
  it('handles empty stacks and rejects fractional/negative counts', () => {
    expect(getVisibleStack([])).toMatchObject({
      width: 0,
      height: 0,
      visible: [],
    });
    expect(() => getVisibleStack([{ value: 25, count: -1 }])).toThrow();
    expect(() => getVisibleStack([{ value: 25, count: 1.5 }])).toThrow();
    expect(() => getVisibleStack([], 0)).toThrow();
  });
  it('generates eight distinct annular inserts', () => {
    const paths = Array.from({ length: 8 }, (_, i) => chipInsertPath(i));
    expect(new Set(paths).size).toBe(8);
    paths.forEach((p) => {
      expect(p).toContain('A32 32');
      expect(p).toContain('A24.5 24.5');
      expect(p).not.toMatch(/NaN|Infinity/);
    });
    expect(() => chipInsertPath(8)).toThrow();
  });
});
