import type { TableLayer } from './table-skin-types.js';

export type SurfaceGeometry = Readonly<{
  width: number;
  height: number;
  detailScale: number;
}>;

export function resolveSurfaceGeometry(
  width = 840,
  height = 460,
  detailScale = Math.min(width, height) / 460,
): SurfaceGeometry {
  if (
    ![width, height, detailScale].every((n) => Number.isFinite(n) && n > 0) ||
    !Number.isFinite(width / height) ||
    !Number.isFinite(height / width) ||
    !Number.isFinite(2 * (width + height))
  )
    throw new RangeError(
      'Table dimensions and detailScale must be positive and yield finite geometry',
    );
  // Leave room for the deepest betting line and both end ornaments.
  if (detailScale > Math.min(width, height) / 280)
    throw new RangeError(
      'detailScale must not exceed the shorter table dimension / 280',
    );
  return { width, height, detailScale };
}

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};
function insetRect(g: SurfaceGeometry, inset: number): Rect {
  const d = inset * g.detailScale;
  return {
    x: 80 + d,
    y: 70 + d,
    width: g.width - 2 * d,
    height: g.height - 2 * d,
    radius: Math.min(g.width, g.height) / 2 - d,
  };
}

/** Equal distance along a rounded rectangle, clockwise from its top-left tangent. */
function perimeterPoint(rect: Rect, distance: number) {
  const { x, y, width: w, height: h, radius: r } = rect;
  const horizontal = w - 2 * r,
    vertical = h - 2 * r,
    quarter = (Math.PI * r) / 2;
  const segments = [
    horizontal,
    quarter,
    vertical,
    quarter,
    horizontal,
    quarter,
    vertical,
    quarter,
  ];
  let d = distance;
  for (let i = 0; i < segments.length; i++) {
    const length = segments[i]!;
    if (d > length && i < 7) {
      d -= length;
      continue;
    }
    if (i === 0) return { x: x + r + d, y };
    if (i === 2) return { x: x + w, y: y + r + d };
    if (i === 4) return { x: x + w - r - d, y: y + h };
    if (i === 6) return { x, y: y + h - r - d };
    const angle = [-Math.PI / 2, 0, Math.PI / 2, Math.PI][(i - 1) / 2]! + d / r;
    const cx = i === 1 || i === 3 ? x + w - r : x + r,
      cy = i === 1 || i === 7 ? y + r : y + h - r;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }
  throw new Error('Invalid stadium perimeter');
}

/** Reflow the captured layers; paints and SVG assets are shared with desktop. */
export function adaptTableLayers(
  layers: readonly TableLayer[],
  g: SurfaceGeometry,
): readonly TableLayer[] {
  const { width, height, detailScale: s } = g;
  if (width === 840 && height === 460 && s === 1) return layers;
  function adapt(node: TableLayer): TableLayer {
    const placement = node.placement;
    if (!placement)
      throw new Error('Missing table layer placement: ' + node.name);
    if (placement.kind === 'inset') {
      const { radius, ...rect } = insetRect(g, placement.inset);
      return {
        ...node,
        ...rect,
        ...(node.radius ? { radius } : {}),
        ...(node.children ? { children: node.children.map(adapt) } : {}),
      };
    }
    if (placement.kind === 'studs') {
      const rect = insetRect(g, 9);
      const perimeter =
        2 * (rect.width + rect.height - 4 * rect.radius) +
        2 * Math.PI * rect.radius;
      // Keep density proportional to the source while bounding DOM cost at extreme ratios.
      const count = Math.min(
        512,
        Math.max(8, Math.round(perimeter / (33.5716242638546 * s))),
      );
      const template = node.children![0]!;
      const children = Array.from({ length: count }, (_, i) => {
        const p = perimeterPoint(rect, (i * perimeter) / count);
        return {
          ...template,
          x: p.x - (template.width * s) / 2,
          y: p.y - (template.height * s) / 2,
          width: template.width * s,
          height: template.height * s,
        };
      });
      return { ...node, x: 80, y: 70, width, height, children };
    }
    if (placement.kind === 'hex' || placement.kind === 'weave') {
      const inset = placement.kind === 'hex' ? 32 : 20;
      const { children: sourceChildren, ...rest } = node;
      const strokes = node.strokes ?? sourceChildren?.[0]?.strokes;
      return {
        ...rest,
        kind: 'rect',
        ...insetRect(g, inset),
        radius: 0,
        pattern: placement.kind,
        ...(strokes ? { strokes } : {}),
      };
    }
    const cx = node.x + node.width / 2,
      cy = node.y + node.height / 2;
    let x = 80 + width / 2 + (cx - 500) * s,
      y = 70 + height / 2 + (cy - 300) * s;
    if (placement.edge === 'left') x = 80 + (cx - 80) * s;
    if (placement.edge === 'right') x = 80 + width - (920 - cx) * s;
    if (placement.edge === 'top') y = 70 + (cy - 70) * s;
    if (placement.edge === 'bottom') y = 70 + height - (530 - cy) * s;
    if (node.kind === 'path')
      return {
        ...node,
        transform: `translate(${x - cx * s} ${y - cy * s}) scale(${s})`,
      };
    return {
      ...node,
      x: x - (node.width * s) / 2,
      y: y - (node.height * s) / 2,
      width: node.width * s,
      height: node.height * s,
    };
  }
  return layers.map(adapt);
}
