'use client';
import { forwardRef } from 'react';
import { COMPACT_CARD, COMPACT_PIP_BOUNDS, CARD_COLORS } from '@feltforge/core';
import type { Rank, Suit, CompactCardSize } from '@feltforge/core';
import { compactRanks } from '@feltforge/assets/compact-ranks';
import { heart, diamond, club, spade } from '@feltforge/assets/symbols';
import { InlineVector, accessibility, dimensions } from './svg.js';
import type { VisualProps } from './svg.js';
import { cardAppearance } from './card-appearance.js';

export type CompactCardProps = VisualProps & {
  rank: Rank;
  suit: Suit;
  size?: CompactCardSize;
};
const suits = { hearts: heart, diamonds: diamond, clubs: club, spades: spade };
const names = {
  A: 'Ace',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
};
export const CompactCard = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  CompactCardProps
>(function CompactCard(
  {
    rank,
    suit,
    size = 'community',
    width,
    height,
    decorative = false,
    style,
    'aria-label': label,
    ...rest
  },
  ref,
) {
  const c = COMPACT_CARD[size];
  const bounds = COMPACT_PIP_BOUNDS[suit];
  const pip = { ...suits[suit], viewBox: bounds.join(' ') };
  const smallWidth = (c.smallHeight * bounds[2]) / bounds[3];
  const largeWidth = (c.largeHeight * bounds[2]) / bounds[3];
  const color = `var(--card-${suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'}, ${suit === 'hearts' || suit === 'diamonds' ? CARD_COLORS.red : CARD_COLORS.black})`;
  const tenHeight = 0.73 * c.fontSize;
  return (
    <svg
      {...rest}
      {...dimensions(width, height, c.width, c.width / c.height)}
      ref={ref}
      viewBox={`0 0 ${c.width} ${c.height}`}
      preserveAspectRatio="xMidYMid meet"
      data-card-variant="compact"
      data-card-size={size}
      {...accessibility(
        label ?? `${names[rank]} of ${suit[0]!.toUpperCase() + suit.slice(1)}`,
        decorative,
      )}
      style={cardAppearance(
        width,
        height,
        c.width,
        c.height,
        c.radius,
        c.width,
        style,
      )}
    >
      <rect
        width={c.width}
        height={c.height}
        rx={c.radius}
        fill={`var(--card-background, ${CARD_COLORS.background})`}
      />
      <g color={color}>
        {rank === '10' ? (
          <InlineVector
            asset={compactRanks['10']!}
            x={c.rankX}
            y={c.rankY + 0.02 * c.fontSize}
            width={(11.44348 * tenHeight) / 14.6}
            height={tenHeight}
          />
        ) : (
          <InlineVector
            asset={compactRanks[rank]!}
            x={c.rankX}
            y={c.rankY + c.baseline - c.fontSize}
            width={c.fontSize}
            height={c.fontSize}
          />
        )}
        <InlineVector
          asset={pip}
          x={c.smallX}
          y={c.smallY}
          width={smallWidth}
          height={c.smallHeight}
        />
        <InlineVector
          asset={pip}
          x={c.width - 3 - largeWidth}
          y={c.height - 3 - c.largeHeight}
          width={largeWidth}
          height={c.largeHeight}
        />
      </g>
    </svg>
  );
});
