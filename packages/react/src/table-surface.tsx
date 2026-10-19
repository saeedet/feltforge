'use client';
import { forwardRef } from 'react';
import { TABLE_THEME_LABELS } from '@feltforge/core';
import type { TableTheme } from '@feltforge/core';
import { accessibility } from './svg.js';
import type { VisualProps } from './svg.js';
import { TableArtwork } from './table-artwork.js';
import { resolveSurfaceGeometry } from './table-geometry.js';

export type TableSurfaceProps = Omit<
  VisualProps,
  'width' | 'height' | 'preserveAspectRatio'
> & {
  /** Outer-rail dimensions in design units, without scene margins. */
  width?: number;
  height?: number;
  theme?: TableTheme;
  /** Material thickness, stitching, ornaments and shadows. Default: shorter edge / 460. */
  detailScale?: number;
};
/** Artwork only. Consumers position their own seats, cards and controls. */
export const TableSurface = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  TableSurfaceProps
>(function TableSurface(
  {
    width = 840,
    height = 460,
    theme = 'classic',
    detailScale,
    decorative = false,
    style,
    'aria-label': label,
    ...props
  },
  ref,
) {
  const geometry = resolveSurfaceGeometry(width, height, detailScale);
  return (
    <svg
      {...props}
      {...accessibility(
        label ?? `${TABLE_THEME_LABELS[theme]} poker table surface`,
        decorative,
      )}
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <g transform="translate(-80 -70)">
        <TableArtwork theme={theme} {...geometry} />
      </g>
    </svg>
  );
});
