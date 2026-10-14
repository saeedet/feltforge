import type { ThemeStyle } from './svg.js';

/** Penpot shadow option 4. Standard geometry uses a 100px reference width. */
export function cardAppearance(
  width: number | string | undefined,
  height: number | string | undefined,
  baseWidth: number,
  baseHeight: number,
  radius: number,
  shadowReferenceWidth: number,
  style?: ThemeStyle,
): ThemeStyle {
  const renderedWidth =
    typeof width === 'number'
      ? width
      : typeof height === 'number'
        ? (height * baseWidth) / baseHeight
        : baseWidth;
  const scale = renderedWidth / shadowReferenceWidth;
  return {
    maxWidth: '100%',
    height: height ?? 'auto',
    display: 'block',
    borderRadius: `${(radius / baseWidth) * 100}% / ${(radius / baseHeight) * 100}%`,
    boxShadow: `var(--card-shadow, 0 ${scale}px ${scale}px rgba(0,0,0,.25), 0 ${scale * 2}px ${scale * 8}px rgba(0,0,0,.25), inset 0 0 0 ${scale}px rgba(255,255,255,.1))`,
    ...style,
  };
}
