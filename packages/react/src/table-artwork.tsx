'use client';
import { memo, useId, useMemo } from 'react';
import type { SVGProps } from 'react';
import type { TableTheme } from '@feltforge/core';
import { InlineVector } from './svg.js';
import { TABLE_SKINS } from './table-skins.generated.js';
import { adaptTableLayers } from './table-geometry.js';
import type {
  TableGradient,
  TableLayer,
  TableShadow,
  TableStroke,
} from './table-skin-types.js';

// Existing table tokens replace the corresponding theme paint. Other details
// retain the captured materials, lighting and ornaments.
function paintToken(layer: TableLayer, stroke = false) {
  if (layer.name === 'Outer Rail')
    return stroke ? '--table-outline' : '--table-rail';
  if (
    !stroke &&
    /^(Inner Rail|Racetrack \(walnut\)|Gold Trim|Lacquer Trim)/.test(layer.name)
  )
    return '--table-inner-rail';
  if (!stroke && layer.name === 'Felt') return '--table-felt';
  if (
    stroke &&
    /^(Betting Line|Neon Betting Line|Pinstripe|Deco Line)/.test(layer.name)
  )
    return '--table-line';
  return undefined;
}
function paint(value: string, token?: string) {
  return token ? `var(${token}, ${value})` : value;
}
function Geometry({
  layer,
  ...props
}: { layer: TableLayer } & Omit<SVGProps<SVGElement>, 'ref'>) {
  if (layer.kind === 'path') return <path d={layer.d} {...props} />;
  if (layer.kind === 'ellipse')
    return (
      <ellipse
        cx={layer.x + layer.width / 2}
        cy={layer.y + layer.height / 2}
        rx={layer.width / 2}
        ry={layer.height / 2}
        {...props}
      />
    );
  return (
    <rect
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rx={layer.radius ?? 0}
      {...props}
    />
  );
}
function Gradient({ id, value: g }: { id: string; value: TableGradient }) {
  const stops = g.stops.map((stop, i) => (
    <stop
      key={i}
      offset={stop.offset}
      stopColor={stop.color}
      stopOpacity={stop.opacity}
    />
  ));
  if (g.type === 'linear')
    return (
      <linearGradient
        id={id}
        x1={g.startX}
        y1={g.startY}
        x2={g.endX}
        y2={g.endY}
      >
        {stops}
      </linearGradient>
    );
  // Penpot stores radial radii in the shape's normalized bounding box.
  return (
    <radialGradient
      id={id}
      cx={g.startX}
      cy={g.startY}
      r={Math.hypot(g.endX - g.startX, g.endY - g.startY)}
    >
      {stops}
    </radialGradient>
  );
}
function Shadows({
  id,
  layers,
  scale,
}: {
  id: string;
  layers: readonly TableShadow[];
  scale: number;
}) {
  return (
    <filter
      id={id}
      x="-50%"
      y="-100%"
      width="200%"
      height="300%"
      colorInterpolationFilters="sRGB"
    >
      {layers.map((s, i) => (
        <feGaussianBlur
          key={`blur${i}`}
          in="SourceAlpha"
          stdDeviation={(s.blur * scale) / 2}
          result={`blur${i}`}
        />
      ))}
      {layers.map((s, i) => (
        <feOffset
          key={`offset${i}`}
          in={`blur${i}`}
          dx={s.x * scale}
          dy={s.y * scale}
          result={`offset${i}`}
        />
      ))}
      {layers.map((s, i) => (
        <feFlood
          key={`color${i}`}
          floodColor={s.color}
          floodOpacity={s.opacity}
          result={`color${i}`}
        />
      ))}
      {layers.map((_, i) => (
        <feComposite
          key={`shadow${i}`}
          in={`color${i}`}
          in2={`offset${i}`}
          operator="in"
          result={`shadow${i}`}
        />
      ))}
      <feMerge>
        {[...layers.keys()].reverse().map((i) => (
          <feMergeNode key={i} in={`shadow${i}`} />
        ))}
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}
function Texture({
  id,
  kind,
  scale,
  stroke,
}: {
  id: string;
  kind: 'hex' | 'weave';
  scale: number;
  stroke: TableStroke;
}) {
  const w = kind === 'hex' ? Math.sqrt(3) * 22 : 26,
    h = kind === 'hex' ? 66 : 26;
  const d =
    kind === 'hex'
      ? `M${w / 2} 0L${w} 11V33L${w / 2} 44L0 33V11ZM0 33L${-w / 2} 44V66L0 77L${w / 2} 66V44M${w} 33L${w / 2} 44V66L${w} 77L${w * 1.5} 66V44Z`
      : 'M0 0L26 26M26 0L0 26';
  return (
    <defs>
      <pattern
        id={id}
        width={w * scale}
        height={h * scale}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={d}
          transform={`scale(${scale})`}
          fill="none"
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeOpacity={stroke.opacity}
        />
      </pattern>
    </defs>
  );
}

// Compile immutable material definitions once, rather than serializing on every render.
function compileMaterials() {
  return new Map(
    Object.entries(TABLE_SKINS).map(([theme, layers]) => {
      const gradients: TableGradient[] = [],
        shadows: (readonly TableShadow[])[] = [];
      const gradientIndices = new Map<TableGradient, number>(),
        shadowIndices = new Map<readonly TableShadow[], number>();
      const gradientKeys = new Map<string, number>(),
        shadowKeys = new Map<string, number>();
      function collect(nodes: readonly TableLayer[]) {
        for (const node of nodes) {
          const gradient = node.fill?.gradient;
          if (gradient) {
            const key = JSON.stringify(gradient);
            let i = gradientKeys.get(key);
            if (i === undefined) {
              i = gradients.length;
              gradientKeys.set(key, i);
              gradients.push(gradient);
            }
            gradientIndices.set(gradient, i);
          }
          if (node.shadows?.length) {
            const key = JSON.stringify(node.shadows);
            let i = shadowKeys.get(key);
            if (i === undefined) {
              i = shadows.length;
              shadowKeys.set(key, i);
              shadows.push(node.shadows);
            }
            shadowIndices.set(node.shadows, i);
          }
          if (node.children) collect(node.children);
        }
      }
      collect(layers);
      return [
        theme,
        { gradients, shadows, gradientIndices, shadowIndices },
      ] as const;
    }),
  );
}
const materials = /* @__PURE__ */ compileMaterials();
export const TableArtwork = /* @__PURE__ */ memo(function TableArtwork({
  theme,
  width = 840,
  height = 460,
  detailScale = 1,
}: {
  theme: TableTheme;
  width?: number;
  height?: number;
  detailScale?: number;
}) {
  const prefix = 'fftable' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const material = materials.get(theme);
  if (!material) throw new RangeError('Unsupported table theme');
  const layers = useMemo(
    () => adaptTableLayers(TABLE_SKINS[theme], { width, height, detailScale }),
    [theme, width, height, detailScale],
  );
  const gradientId = (g: TableGradient) =>
    `${prefix}-gradient${material.gradientIndices.get(g)}`;
  const shadowId = (s: readonly TableShadow[]) =>
    `${prefix}-shadow${material.shadowIndices.get(s)}`;
  function draw(node: TableLayer, index: string) {
    const clipId = `${prefix}-clip${index}`;
    const needsClip = node.clip || node.strokes?.some((s) => s.inner);
    const strokeScale = node.transform ? 1 : detailScale;
    const patternId = `${prefix}-pattern${index}`;
    return (
      <g
        key={index}
        data-table-layer={node.name}
        opacity={node.opacity}
        transform={node.transform}
      >
        {needsClip && (
          <defs>
            <clipPath id={clipId}>
              <Geometry layer={node} />
            </clipPath>
          </defs>
        )}
        {node.pattern && (
          <Texture
            id={patternId}
            kind={node.pattern}
            scale={detailScale}
            stroke={node.strokes![0]!}
          />
        )}
        {node.wordmark ? (
          <InlineVector
            asset={node.wordmark}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
          />
        ) : (
          <g
            filter={
              node.shadows?.length
                ? `var(--table-shadow, url(#${shadowId(node.shadows)}))`
                : undefined
            }
          >
            <Geometry
              layer={node}
              fill={paint(
                node.pattern
                  ? `url(#${patternId})`
                  : node.fill?.gradient
                    ? `url(#${gradientId(node.fill.gradient)})`
                    : (node.fill?.color ?? 'none'),
                paintToken(node),
              )}
              fillOpacity={node.fill?.opacity}
            />
            {node.children && (
              <g clipPath={node.clip ? `url(#${clipId})` : undefined}>
                {node.children.map((child, i) => draw(child, `${index}-${i}`))}
              </g>
            )}
            {!node.pattern &&
              node.strokes &&
              [...node.strokes].reverse().map((s, i) => (
                <Geometry
                  key={i}
                  layer={node}
                  fill="none"
                  stroke={paint(s.color, paintToken(node, true))}
                  strokeWidth={s.width * strokeScale * (s.inner ? 2 : 1)}
                  strokeOpacity={s.opacity}
                  strokeDasharray={s.dash
                    ?.split(' ')
                    .map((n) => Number(n) * strokeScale)
                    .join(' ')}
                  clipPath={s.inner ? `url(#${clipId})` : undefined}
                />
              ))}
          </g>
        )}
      </g>
    );
  }
  return (
    <>
      <defs>
        {material.gradients.map((g) => (
          <Gradient key={gradientId(g)} id={gradientId(g)} value={g} />
        ))}
        {material.shadows.map((s) => (
          <Shadows
            key={shadowId(s)}
            id={shadowId(s)}
            layers={s}
            scale={detailScale}
          />
        ))}
      </defs>
      {layers.map((layer, i) => draw(layer, String(i)))}
    </>
  );
});
