/** Values transcribed from Penpot Export Specification; see docs/design. */
export const DEFAULT_COURT_STYLE = 'persian' as const;
export const DEFAULT_JOKER_VARIANT = '1' as const;
export const CARD = {
  width: 250,
  height: 350,
  minWidth: 100,
  minHeight: 140,
  shell: { x: 0, y: 0, width: 250, height: 350, radius: 13 },
  border: {
    x: 0.5,
    y: 0.5,
    width: 249,
    height: 349,
    radius: 12.5,
    strokeWidth: 1,
  },
  panel: {
    x: 60.6,
    y: 64.6,
    width: 128.8,
    height: 220.8,
    radius: 4,
    strokeWidth: 1.2,
  },
  rank: { x: 12.3115, y: 15, width: 40, height: 50 },
  cornerSuit: { x: 14.7115, y: 75.0664, width: 35.2, height: 44 },
  pip: { width: 30, height: 37.5 },
  court: { x: 55, y: 70, width: 140, height: 210 },
  courtSuit: { x: 67.2, y: 71.2, width: 21.12, height: 26.4 },
  joker: { x: 65, y: 76, width: 120, height: 198 },
  jokerIndex: { x: 12.3115, y: 17, width: 40, height: 157 },
} as const;
export const ACE_FRAMES = {
  hearts: { x: 99, y: 142.5, width: 52, height: 65 },
  diamonds: { x: 95.8, y: 138.5, width: 58.4, height: 73 },
  clubs: { x: 92.6, y: 134.5, width: 64.8, height: 81 },
  spades: { x: 78.17, y: 115.5625, width: 93.66, height: 117.075 },
} as const;
export const CARD_COLORS = {
  red: '#E0001B',
  black: '#3B3C39',
  background: '#F2F2F2',
  border: '#D2D5D9',
  panel: '#F2EDC4',
  panelStroke: '#3B3C39',
  aceSpadeInline: '#FFFFFF',
  backClassicField: '#1F2A44',
  backClassicGold: '#B8955A',
  backClassicIvory: '#F2EDC4',
} as const;
export type NumberRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
/** Pip centre x/y and rotation; never interpret these as top-left positions. */
export type Pip = readonly [x: number, y: number, rotation: 0 | 180];
export const PIP_LAYOUTS = {
  '2': [
    [125.0, 91.75, 0.0],
    [125.0, 258.25, 180.0],
  ],
  '3': [
    [125.0, 91.75, 0.0],
    [125.0, 175.0, 0.0],
    [125.0, 258.25, 180.0],
  ],
  '4': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '5': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [125.0, 175.0, 0.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '6': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [84.0, 175.0, 0.0],
    [166.0, 175.0, 0.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '7': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [125.0, 133.375, 0.0],
    [84.0, 175.0, 0.0],
    [166.0, 175.0, 0.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '8': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [125.0, 133.375, 0.0],
    [84.0, 175.0, 0.0],
    [166.0, 175.0, 0.0],
    [125.0, 216.625, 180.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '9': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [84.0, 147.25, 0.0],
    [166.0, 147.25, 0.0],
    [125.0, 175.0, 0.0],
    [84.0, 202.75, 180.0],
    [166.0, 202.75, 180.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
  '10': [
    [84.0, 91.75, 0.0],
    [166.0, 91.75, 0.0],
    [125.0, 119.5, 0.0],
    [84.0, 147.25, 0.0],
    [166.0, 147.25, 0.0],
    [84.0, 202.75, 180.0],
    [166.0, 202.75, 180.0],
    [125.0, 230.5, 180.0],
    [84.0, 258.25, 180.0],
    [166.0, 258.25, 180.0],
  ],
} as const satisfies Record<NumberRank, readonly Pip[]>;
