'use client';
import { forwardRef } from 'react';
import { CARD, CARD_COLORS, ACE_FRAMES, PIP_LAYOUTS } from '@feltforge/core';
import type { Suit, NumberRank, CourtRank } from '@feltforge/core';
import type { CourtArtwork, JokerArtwork } from '@feltforge/assets/types';
import * as symbols from '@feltforge/assets/symbols';
import { InlineVector, accessibility, dimensions } from './svg.js';
import type { VisualProps } from './svg.js';

export type CardProps = VisualProps &
  (
    | { rank: 'A' | NumberRank; suit: Suit; court?: never; artwork?: never }
    | { rank: CourtRank; suit: Suit; court: CourtArtwork; artwork?: never }
    | { rank: 'joker'; artwork: JokerArtwork; suit?: never; court?: never }
  );
const suits = {
  hearts: symbols.heart,
  diamonds: symbols.diamond,
  clubs: symbols.club,
  spades: symbols.spade,
};
const ranks = {
  A: symbols.ranka,
  '2': symbols.rank2,
  '3': symbols.rank3,
  '4': symbols.rank4,
  '5': symbols.rank5,
  '6': symbols.rank6,
  '7': symbols.rank7,
  '8': symbols.rank8,
  '9': symbols.rank9,
  '10': symbols.rank10,
  J: symbols.rankj,
  Q: symbols.rankq,
  K: symbols.rankk,
};
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
const token = (name: string, value: string) => `var(--card-${name}, ${value})`;
export const Card = /* @__PURE__ */ forwardRef<SVGSVGElement, CardProps>(
  function Card(props, ref) {
    const {
      rank,
      suit,
      court,
      artwork,
      width,
      height,
      decorative = false,
      style,
      'aria-label': ariaLabel,
      ...rest
    } = props;
    const color = token(
      suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
      suit === 'hearts' || suit === 'diamonds'
        ? CARD_COLORS.red
        : CARD_COLORS.black,
    );
    const corner =
      rank === 'joker' ? (
        <InlineVector asset={symbols.rankjoker} {...CARD.jokerIndex} />
      ) : (
        <>
          <InlineVector asset={ranks[rank]} {...CARD.rank} />
          <InlineVector asset={suits[suit!]} {...CARD.cornerSuit} />
        </>
      );
    const label =
      rank === 'joker'
        ? `Joker ${artwork!.variant}`
        : `${names[rank]} of ${suit![0]!.toUpperCase() + suit!.slice(1)}`;
    return (
      <svg
        {...rest}
        {...dimensions(width, height, 250, 5 / 7)}
        ref={ref}
        viewBox="0 0 250 350"
        preserveAspectRatio="xMidYMid meet"
        {...accessibility(ariaLabel ?? label, decorative)}
        style={{ maxWidth: '100%', height: height ?? 'auto', ...style }}
      >
        <rect
          width="250"
          height="350"
          rx="13"
          fill={token('background', CARD_COLORS.background)}
        />
        <rect
          x=".5"
          y=".5"
          width="249"
          height="349"
          rx="12.5"
          fill="none"
          stroke={token('border', CARD_COLORS.border)}
        />
        {rank !== 'joker' && (
          <rect
            x="60.6"
            y="64.6"
            width="128.8"
            height="220.8"
            rx="4"
            fill={token('panel', CARD_COLORS.panel)}
            stroke={token('panel-stroke', CARD_COLORS.panelStroke)}
            strokeWidth="1.2"
          />
        )}
        <g color={color}>
          {corner}
          <g transform="rotate(180 125 175)">{corner}</g>
          {rank === 'A' && (
            <InlineVector
              asset={suit === 'spades' ? symbols.aceSpade : suits[suit!]}
              {...ACE_FRAMES[suit!]}
            />
          )}
          {rank in PIP_LAYOUTS &&
            PIP_LAYOUTS[rank as NumberRank].map(([x, y, rotation], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rotation})`}>
                <InlineVector
                  asset={suits[suit!]}
                  x={-15}
                  y={-18.75}
                  width={30}
                  height={37.5}
                />
              </g>
            ))}
        </g>
        {court && (
          <>
            <InlineVector
              asset={court.cards[rank as CourtRank]}
              {...CARD.court}
            />
            <g color={color}>
              <InlineVector asset={suits[suit!]} {...CARD.courtSuit} />
              <g transform="rotate(180 125 175)">
                <InlineVector asset={suits[suit!]} {...CARD.courtSuit} />
              </g>
            </g>
          </>
        )}
        {rank === 'joker' && <InlineVector asset={artwork!} {...CARD.joker} />}
      </svg>
    );
  },
);
