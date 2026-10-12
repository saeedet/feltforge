'use client';
import { forwardRef, useEffect, useRef } from 'react';
import {
  CHIP,
  chipInsertPath,
  formatChipValue,
  getChipPalette,
  getVisibleStack,
} from '@feltforge/core';
import type { ChipGroup } from '@feltforge/core';
import { accessibility } from './svg.js';
import type { VisualProps } from './svg.js';
export interface ChipAppearance {
  label?: string;
  color?: string;
  insertColor?: string;
  labelColor?: string;
}
export type ChipProps = VisualProps &
  ChipAppearance & { value: number; size?: number };
const inserts = Array.from({ length: 8 }, (_, i) => chipInsertPath(i));
export function ChipGeometry({
  value,
  label,
  color,
  insertColor,
  labelColor,
}: ChipAppearance & { value: number }) {
  const text = label ?? formatChipValue(value),
    palette = getChipPalette(value),
    ref = useRef<SVGTextElement>(null);
  useEffect(() => {
    let active = true;
    const fit = () => {
      const el = ref.current;
      if (!active || !el) return;
      el.removeAttribute('textLength');
      if (el.getComputedTextLength() > CHIP.maxLabelWidth)
        el.setAttribute('textLength', String(CHIP.maxLabelWidth));
    };
    fit();
    void document.fonts?.ready.then(fit);
    document.fonts?.addEventListener('loadingdone', fit);
    return () => {
      active = false;
      document.fonts?.removeEventListener('loadingdone', fit);
    };
  }, [text]);
  const base = color ?? palette.base,
    insert = insertColor ?? palette.insert;
  return (
    <>
      <circle cx="32" cy="32" r="32" fill={base} />
      {inserts.map((d, i) => (
        <path key={i} d={d} fill={insert} />
      ))}
      <circle cx="32" cy="32" r="22.5" fill={insert} />
      <circle cx="32" cy="32" r="20.5" fill={base} />
      <circle
        cx="32"
        cy="32"
        r="31.5"
        fill="none"
        stroke="#000"
        strokeOpacity=".28"
      />
      <text
        ref={ref}
        x="32"
        y="32"
        dy=".35em"
        textAnchor="middle"
        fontFamily="var(--chip-font, 'Inter Tight', Arial, sans-serif)"
        fontWeight="800"
        fontSize="16"
        fill={labelColor ?? palette.label}
        textLength={text.length > 3 ? 34 : undefined}
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>
    </>
  );
}
export const Chip = /* @__PURE__ */ forwardRef<SVGSVGElement, ChipProps>(
  function Chip(
    {
      value,
      label,
      color,
      insertColor,
      labelColor,
      size = 64,
      width,
      height,
      decorative = false,
      'aria-label': ariaLabel,
      style,
      ...rest
    },
    ref,
  ) {
    if (!Number.isFinite(size) || size <= 0)
      throw new RangeError('Chip size must be positive');
    return (
      <svg
        {...rest}
        width={width ?? size}
        height={height ?? size}
        ref={ref}
        viewBox="0 0 64 64"
        {...accessibility(
          ariaLabel ?? `${label ?? formatChipValue(value)} chip`,
          decorative,
        )}
        style={style}
      >
        <ChipGeometry
          value={value}
          {...(label !== undefined ? { label } : {})}
          {...(color ? { color } : {})}
          {...(insertColor ? { insertColor } : {})}
          {...(labelColor ? { labelColor } : {})}
        />
      </svg>
    );
  },
);
export type ChipStackProps = VisualProps &
  ChipAppearance & { size?: number; maxVisible?: number; shadow?: boolean } & (
    | { value: number; count: number; chips?: never }
    | { chips: readonly ChipGroup[]; value?: never; count?: never }
  );
export const ChipStack = /* @__PURE__ */ forwardRef<
  SVGSVGElement,
  ChipStackProps
>(function ChipStack(
  {
    value,
    count,
    chips,
    size = 64,
    maxVisible = 5,
    shadow = false,
    decorative = false,
    width,
    height,
    label,
    color,
    insertColor,
    labelColor,
    'aria-label': ariaLabel,
    style,
    ...rest
  },
  ref,
) {
  const stack = getVisibleStack(
    chips ?? [{ value: value!, count: count! }],
    maxVisible,
  );
  if (!Number.isFinite(size) || size <= 0)
    throw new RangeError('Chip size must be positive');
  const appearance = {
    ...(label !== undefined ? { label } : {}),
    ...(color ? { color } : {}),
    ...(insertColor ? { insertColor } : {}),
    ...(labelColor ? { labelColor } : {}),
  };
  return (
    <svg
      {...rest}
      ref={ref}
      width={width ?? ((stack.width || 64) * size) / 64}
      height={height ?? ((stack.height || 64) * size) / 64}
      viewBox={`0 0 ${stack.width || 64} ${stack.height || 64}`}
      overflow="visible"
      {...accessibility(
        ariaLabel ?? `${stack.count} chips, total ${stack.totalValue}`,
        decorative,
      )}
      style={{
        filter: shadow
          ? 'drop-shadow(0px 2px 2.5px rgb(0 0 0 / 18%))'
          : undefined,
        ...style,
      }}
    >
      {stack.visible.map((c, i) => (
        <g
          key={i}
          transform={`translate(${3 * i} ${4 * (stack.visible.length - i - 1)})`}
        >
          <ChipGeometry value={c.value} {...appearance} />
        </g>
      ))}
    </svg>
  );
});
