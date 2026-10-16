'use client';
import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { getTableLayout } from '@feltforge/core';
import type { Point, TableLayout, TableTheme } from '@feltforge/core';
import type { ThemeStyle } from './svg.js';
import { TableSurface } from './table-surface.js';
export { TABLE_THEMES, TABLE_THEME_LABELS } from '@feltforge/core';
export type { TableTheme } from '@feltforge/core';
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
  theme?: TableTheme;
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
    theme = 'classic',
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
  const data = getTableLayout(layout);
  return (
    <div
      {...props}
      ref={ref}
      role="group"
      data-table-theme={theme}
      aria-label={label ?? `${layout}-seat poker table`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '5 / 3',
        containerType: 'inline-size',
        ...style,
      }}
    >
      <TableSurface theme={theme} />
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
      {(renderSeat || renderBet || renderMarker) &&
        data.seats.map((seat) => (
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
