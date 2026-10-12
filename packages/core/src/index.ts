/** Framework-independent card and poker visual primitives. */
export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const;
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const COURT_STYLES = ['persian', 'western', 'eastern'] as const;
export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];
export type CourtStyle = (typeof COURT_STYLES)[number];
export type CourtRank = Extract<Rank, 'J' | 'Q' | 'K'>;
export type JokerVariant = '1' | '2';
export type TableLayout = 2 | 6 | 8 | 9;
export type MarkerType = 'dealer' | 'small-blind' | 'big-blind';

export function isRank(value: unknown): value is Rank {
  return typeof value === 'string' && RANKS.some((rank) => rank === value);
}
export function isSuit(value: unknown): value is Suit {
  return typeof value === 'string' && SUITS.some((suit) => suit === value);
}

export * from './cards.js';
export * from './chips.js';
export * from './table.js';
