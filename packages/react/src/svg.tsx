'use client';
import { useId } from 'react';
import type { CSSProperties, SVGProps } from 'react';
import type { InlineAsset } from '@feltforge/assets/types';

export type ThemeStyle = CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};
export type VisualProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'dangerouslySetInnerHTML' | 'style' | 'viewBox' | 'role'
> & { decorative?: boolean; style?: ThemeStyle };
export function accessibility(label: string, decorative = false) {
  return decorative
    ? { 'aria-hidden': true as const, focusable: false as const }
    : { role: 'img' as const, 'aria-label': label, focusable: false as const };
}
export function dimensions(
  width: number | string | undefined,
  height: number | string | undefined,
  defaultWidth: number,
  ratio: number,
) {
  return {
    width:
      width ?? (typeof height === 'number' ? height * ratio : defaultWidth),
    height:
      height ??
      (typeof width === 'number' ? width / ratio : defaultWidth / ratio),
  };
}
export function InlineVector({
  asset,
  x = 0,
  y = 0,
  width,
  height,
  color,
}: {
  asset: InlineAsset;
  x?: number;
  y?: number;
  width: number;
  height: number;
  color?: string;
}) {
  const prefix = 'ff' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const body = !asset.body.includes('id="')
    ? asset.body
    : asset.body
        .replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
        .replace(/url\(#([^)]*)\)/g, `url(#${prefix}-$1)`)
        .replace(/((?:xlink:)?href)="#([^"]+)"/g, `$1="#${prefix}-$2"`);
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={asset.viewBox}
      overflow="visible"
      color={color}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
