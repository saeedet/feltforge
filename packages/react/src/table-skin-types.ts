import type { InlineAsset } from '@feltforge/assets/types';

export type TableGradient = {
  type: 'linear' | 'radial';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  stops: readonly { color: string; opacity: number; offset: number }[];
};
export type TablePaint = {
  color?: string;
  gradient?: TableGradient;
  opacity?: number;
};
export type TableStroke = {
  color: string;
  width: number;
  opacity?: number;
  inner?: boolean;
  dash?: string;
};
export type TableShadow = {
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
};
export type TableLayer = {
  placement?:
    | { kind: 'inset'; inset: number }
    | {
        kind: 'ornament';
        edge: 'left' | 'right' | 'top' | 'bottom';
        inset?: number;
      }
    | { kind: 'studs' }
    | { kind: 'hex' }
    | { kind: 'weave' };
  transform?: string;
  pattern?: 'hex' | 'weave';
  name: string;
  kind: 'rect' | 'ellipse' | 'path' | 'group' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  opacity?: number;
  d?: string;
  fill?: TablePaint;
  strokes?: readonly TableStroke[];
  shadows?: readonly TableShadow[];
  clip?: boolean;
  children?: readonly TableLayer[];
  wordmark?: InlineAsset;
};
