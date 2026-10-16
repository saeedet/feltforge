import type { TableLayout } from './index.js';

export type Point = Readonly<{ x: number; y: number }>;
export const TABLE_THEMES = [
  'classic',
  'midnight-racetrack',
  'royal-burgundy',
  'neon-night',
  'emerald-art-deco',
  'ocean-slate',
] as const;
export type TableTheme = (typeof TABLE_THEMES)[number];
export const TABLE_THEME_LABELS: Readonly<Record<TableTheme, string>> = {
  classic: 'Classic',
  'midnight-racetrack': 'Midnight Racetrack',
  'royal-burgundy': 'Royal Burgundy',
  'neon-night': 'Neon Night',
  'emerald-art-deco': 'Emerald Art Deco',
  'ocean-slate': 'Ocean Slate',
};
export type LateralSign = -1 | 1;
export const TABLE = {
  width: 1000,
  height: 600,
  center: { x: 500, y: 300 },
  seatEllipse: { rx: 410, ry: 250 },
  betEllipse: { rx: 290, ry: 145 },
  /** Legacy flat shadow geometry; current skins use layered SVG filters. */
  separation: {
    x: 80,
    y: 80,
    width: 840,
    height: 460,
    radius: 230,
    opacity: 0.22,
  },
  outerRail: {
    x: 80,
    y: 70,
    width: 840,
    height: 460,
    radius: 230,
    innerStrokeWidth: 1.5,
  },
  innerRail: { x: 100, y: 90, width: 800, height: 420, radius: 210 },
  felt: { x: 112, y: 102, width: 776, height: 396, radius: 198 },
  feltLine: {
    x: 162,
    y: 152,
    width: 676,
    height: 296,
    radius: 148,
    strokeWidth: 1.5,
  },
  community: {
    x: 270,
    y: 242,
    width: 460,
    height: 117.6,
    cardWidth: 84,
    gap: 10,
  },
  pot: { x: 500, y: 212 },
} as const;
export const TABLE_COLORS = {
  outerRail: '#211E1B',
  innerRail: '#5B3A22',
  felt: '#1D6B45',
  feltLine: '#5FB488',
  outline: '#4D4741',
  separation: '#000000',
} as const;
export const SEAT_ANGLES = {
  2: [90, 270],
  6: [90, 160, 200, 270, 340, 20],
  8: [90, 135, 180, 225, 270, 315, 0, 45],
  9: [90, 130, 170, 220, 250, 290, 320, 10, 50],
} as const;
export const MARKER_LATERAL_SIGNS = {
  2: [-1, -1],
  6: [-1, -1, 1, -1, -1, 1],
  8: [-1, -1, -1, 1, -1, -1, -1, 1],
  9: [-1, -1, -1, 1, 1, -1, -1, 1, 1],
} as const;
export const MARKER = {
  size: 64,
  outerR: 32,
  rimStroke: 2.5,
  ringR: 26,
  ringStroke: 2,
  fieldR: 25,
  font: { family: 'Inter Tight', weight: 800, dealer: 28, blind: 20 },
  colors: {
    background: '#F4F1EA',
    field: '#FAF8F3',
    border: '#22201E',
    label: '#22201E',
    accent: {
      dealer: '#22201E',
      'small-blind': '#2F6DB5',
      'big-blind': '#C27C0E',
    },
  },
  tableSize: 40,
  minSize: 32,
  placement: { inward: 125, lateral: 55 },
} as const;

function finitePoint(point: Point) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
    throw new RangeError('Coordinates must be finite');
}
export function normalizeTablePoint(point: Point): Point {
  finitePoint(point);
  return { x: point.x / TABLE.width, y: point.y / TABLE.height };
}
export function getMarkerPosition(
  seatPosition: Point,
  lateralSign: LateralSign,
): Point {
  finitePoint(seatPosition);
  if (lateralSign !== -1 && lateralSign !== 1)
    throw new RangeError('lateralSign must be -1 or 1');
  const dx = TABLE.center.x - seatPosition.x,
    dy = TABLE.center.y - seatPosition.y;
  const length = Math.hypot(dx, dy);
  if (length === 0)
    throw new RangeError('Seat cannot coincide with the table centre');
  const ix = dx / length,
    iy = dy / length;
  return {
    x: seatPosition.x + ix * 125 + iy * 55 * lateralSign,
    y: seatPosition.y + iy * 125 - ix * 55 * lateralSign,
  };
}
export function getTableLayout(layout: TableLayout) {
  if (![2, 6, 8, 9].includes(layout))
    throw new RangeError('Supported table layouts: 2, 6, 8, 9');
  const seats = SEAT_ANGLES[layout].map((angle, index) => {
    const theta = (angle * Math.PI) / 180;
    const seat = {
      x: 500 + 410 * Math.cos(theta),
      y: 300 + 250 * Math.sin(theta),
    };
    const bet = {
      x: 500 + 290 * Math.cos(theta),
      y: 300 + 145 * Math.sin(theta),
    };
    const lateralSign = MARKER_LATERAL_SIGNS[layout][index]!;
    const marker = getMarkerPosition(seat, lateralSign);
    return {
      index,
      angle,
      lateralSign,
      seat,
      bet,
      marker,
      normalized: {
        seat: normalizeTablePoint(seat),
        bet: normalizeTablePoint(bet),
        marker: normalizeTablePoint(marker),
      },
    };
  });
  return {
    seats,
    pot: { ...TABLE.pot },
    normalizedPot: normalizeTablePoint(TABLE.pot),
  };
}
