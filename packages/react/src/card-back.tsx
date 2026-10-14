'use client';
import { forwardRef } from 'react';
import { classic } from '@feltforge/assets/classic';
import { InlineVector, accessibility, dimensions } from './svg.js';
import type { VisualProps } from './svg.js';
import { cardAppearance } from './card-appearance.js';
export type CardBackProps = VisualProps & { backStyle?: 'classic' };
export const CardBack = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  CardBackProps
>(function CardBack(
  {
    backStyle = 'classic',
    width,
    height,
    decorative = false,
    style,
    'aria-label': label = 'Classic card back',
    ...props
  },
  ref,
) {
  return (
    <svg
      {...props}
      {...dimensions(width, height, 250, 5 / 7)}
      ref={ref}
      viewBox="0 0 250 350"
      preserveAspectRatio="xMidYMid meet"
      data-back-style={backStyle}
      {...accessibility(label, decorative)}
      style={cardAppearance(width, height, 250, 350, 13, 100, style)}
    >
      <InlineVector asset={classic} width={250} height={350} />
    </svg>
  );
});
