'use client';
import { forwardRef } from 'react';
import { MARKER } from '@feltforge/core';
import type { MarkerType } from '@feltforge/core';
import { accessibility } from './svg.js';
import type { VisualProps } from './svg.js';
export type PokerMarkerProps = VisualProps & {
  type: MarkerType;
  size?: number;
  accentColor?: string;
};
const labels = { dealer: 'D', 'small-blind': 'SB', 'big-blind': 'BB' };
export const PokerMarker = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  PokerMarkerProps
>(function PokerMarker(
  {
    type,
    size = 40,
    accentColor,
    width,
    height,
    decorative = false,
    'aria-label': label,
    ...props
  },
  ref,
) {
  if (!Number.isFinite(size) || size <= 0)
    throw new RangeError('Marker size must be positive');
  const c = MARKER.colors;
  return (
    <svg
      {...props}
      ref={ref}
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 64 64"
      {...accessibility(
        label ??
          (type === 'dealer'
            ? 'Dealer button'
            : type === 'small-blind'
              ? 'Small blind'
              : 'Big blind'),
        decorative,
      )}
    >
      <circle cx="32" cy="32" r="32" fill={c.background} />
      <circle
        cx="32"
        cy="32"
        r="30.75"
        fill="none"
        stroke={c.border}
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke={accentColor ?? c.accent[type]}
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="25" fill={c.field} />
      <text
        x="32"
        y="32"
        dy=".35em"
        textAnchor="middle"
        fontFamily="var(--chip-font, 'Inter Tight', Arial, sans-serif)"
        fontWeight="800"
        fontSize={type === 'dealer' ? 28 : 20}
        fill={c.label}
      >
        {labels[type]}
      </text>
    </svg>
  );
});
