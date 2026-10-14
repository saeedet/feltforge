import { Fragment, useId } from 'react';
import { CHIP } from '@feltforge/core';
import type { ThemeStyle } from './svg.js';

export function useChipShadow(
  enabled: boolean,
  style?: ThemeStyle,
): {
  id: string;
  outerStyle: ThemeStyle;
  filter: string;
} {
  const id = 'ff-chip-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { filter, ...outerStyle } = style ?? {};
  return {
    id,
    outerStyle,
    filter: enabled ? (filter ?? `var(--chip-shadow, url(#${id}))`) : 'none',
  };
}

/** Two independent Penpot shadows; SVG units scale with the chip geometry. */
export function ChipShadow({ id }: { id: string }) {
  return (
    <defs>
      <filter
        id={id}
        x="-25%"
        y="-25%"
        width="150%"
        height="150%"
        colorInterpolationFilters="sRGB"
      >
        {CHIP.contactShadows.map((layer, i) => (
          <Fragment key={i}>
            <feOffset
              in="SourceAlpha"
              dx={layer.x}
              dy={layer.y}
              result={`offset-${i}`}
            />
            <feGaussianBlur
              in={`offset-${i}`}
              stdDeviation={layer.blur / 2}
              result={`blur-${i}`}
            />
            <feFlood
              floodColor="#000000"
              floodOpacity={layer.opacity}
              result={`color-${i}`}
            />
            <feComposite
              in={`color-${i}`}
              in2={`blur-${i}`}
              operator="in"
              result={`shadow-${i}`}
            />
          </Fragment>
        ))}
        <feMerge>
          <feMergeNode in="shadow-1" />
          <feMergeNode in="shadow-0" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
