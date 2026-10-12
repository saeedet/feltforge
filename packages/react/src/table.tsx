'use client';
import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { getTableLayout, TABLE_COLORS } from '@feltforge/core';
import type { Point, TableLayout } from '@feltforge/core';
import type { ThemeStyle } from './svg.js';
export type SeatAnchor = ReturnType<typeof getTableLayout>['seats'][number];
export type TableAnchorProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  at: Point;
  style?: ThemeStyle;
};
/** Coordinates are normalized 0–1. The child keeps its own independent dimensions. */
export const TableAnchor = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  TableAnchorProps
>(function TableAnchor({ at, style, ...props }, ref) {
  if (!Number.isFinite(at.x) || !Number.isFinite(at.y))
    throw new RangeError('Anchor coordinates must be finite');
  return (
    <div
      {...props}
      ref={ref}
      style={{
        position: 'absolute',
        left: `${100 * at.x}%`,
        top: `${100 * at.y}%`,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    />
  );
});
export type PokerTableProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  layout: TableLayout;
  style?: ThemeStyle;
  renderSeat?: (seat: SeatAnchor) => ReactNode;
  renderBet?: (seat: SeatAnchor) => ReactNode;
  renderMarker?: (seat: SeatAnchor) => ReactNode;
  community?: ReactNode;
  pot?: ReactNode;
};
export const PokerTable = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  PokerTableProps
>(function PokerTable(
  {
    layout,
    renderSeat,
    renderBet,
    renderMarker,
    community,
    pot,
    children,
    style,
    'aria-label': label,
    ...props
  },
  ref,
) {
  const data = getTableLayout(layout),
    c = TABLE_COLORS;
  return (
    <div
      {...props}
      ref={ref}
      role="group"
      aria-label={label ?? `${layout}-seat poker table`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '5 / 3',
        containerType: 'inline-size',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 1000 600"
        width="100%"
        height="100%"
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <rect
          x="80"
          y="80"
          width="840"
          height="460"
          rx="230"
          fill="#000"
          opacity=".22"
        />
        <rect
          x="80"
          y="70"
          width="840"
          height="460"
          rx="230"
          fill={`var(--table-rail, ${c.outerRail})`}
        />
        <rect
          x="81"
          y="71"
          width="838"
          height="458"
          rx="229"
          fill="none"
          stroke={`var(--table-outline, ${c.outline})`}
          strokeWidth="2"
        />
        <rect
          x="100"
          y="90"
          width="800"
          height="420"
          rx="210"
          fill={`var(--table-inner-rail, ${c.innerRail})`}
        />
        <rect
          x="112"
          y="102"
          width="776"
          height="396"
          rx="198"
          fill={`var(--table-felt, ${c.felt})`}
        />
        <rect
          x="152"
          y="142"
          width="696"
          height="316"
          rx="158"
          fill="none"
          stroke={`var(--table-line, ${c.feltLine})`}
          strokeWidth="2"
        />
      </svg>
      {community && (
        <div
          style={{
            position: 'absolute',
            left: '27%',
            top: '40.333333%',
            width: '46%',
            display: 'flex',
            gap: '2.173913%',
          }}
        >
          {community}
        </div>
      )}
      {pot && <TableAnchor at={data.normalizedPot}>{pot}</TableAnchor>}
      {data.seats.map((seat) => (
        <div key={seat.index} data-seat-index={seat.index}>
          {renderSeat && (
            <TableAnchor at={seat.normalized.seat}>
              {renderSeat(seat)}
            </TableAnchor>
          )}
          {renderBet && (
            <TableAnchor at={seat.normalized.bet}>
              {renderBet(seat)}
            </TableAnchor>
          )}
          {renderMarker && (
            <TableAnchor at={seat.normalized.marker}>
              {renderMarker(seat)}
            </TableAnchor>
          )}
        </div>
      ))}
      {children}
    </div>
  );
});
