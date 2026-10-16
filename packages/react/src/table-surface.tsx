'use client';
import { useId } from 'react';
import type { SVGProps } from 'react';
import type { TableTheme } from '@feltforge/core';
import { InlineVector } from './svg.js';
import { TABLE_SKINS } from './table-skins.generated.js';
import type {
  TableGradient,
  TableLayer,
  TableShadow,
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
}: {
  id: string;
  layers: readonly TableShadow[];
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
          stdDeviation={s.blur / 2}
          result={`blur${i}`}
        />
      ))}
      {layers.map((s, i) => (
        <feOffset
          key={`offset${i}`}
          in={`blur${i}`}
          dx={s.x}
          dy={s.y}
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
export function TableSurface({ theme }: { theme: TableTheme }) {
  const prefix = 'fftable' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!Object.hasOwn(TABLE_SKINS, theme))
    throw new RangeError('Unsupported table theme');
  const layers = TABLE_SKINS[theme];
  // Shared brass-stud gradients and shadows need only one definition per table.
  const gradients = new Map<string, TableGradient>();
  const shadows = new Map<string, readonly TableShadow[]>();
  function collect(nodes: readonly TableLayer[]) {
    for (const node of nodes) {
      if (node.fill?.gradient)
        gradients.set(JSON.stringify(node.fill.gradient), node.fill.gradient);
      if (node.shadows?.length)
        shadows.set(JSON.stringify(node.shadows), node.shadows);
      if (node.children) collect(node.children);
    }
  }
  collect(layers);
  const gradientId = (g: TableGradient) =>
    `${prefix}-gradient${[...gradients.keys()].indexOf(JSON.stringify(g))}`;
  const shadowId = (s: readonly TableShadow[]) =>
    `${prefix}-shadow${[...shadows.keys()].indexOf(JSON.stringify(s))}`;
  function draw(node: TableLayer, index: string) {
    const clipId = `${prefix}-clip${index}`;
    const needsClip = node.clip || node.strokes?.some((s) => s.inner);
    return (
      <g key={index} data-table-layer={node.name} opacity={node.opacity}>
        {needsClip && (
          <defs>
            <clipPath id={clipId}>
              <Geometry layer={node} />
            </clipPath>
          </defs>
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
                node.fill?.gradient
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
            {node.strokes &&
              [...node.strokes]
                .reverse()
                .map((s, i) => (
                  <Geometry
                    key={i}
                    layer={node}
                    fill="none"
                    stroke={paint(s.color, paintToken(node, true))}
                    strokeWidth={s.width * (s.inner ? 2 : 1)}
                    strokeOpacity={s.opacity}
                    strokeDasharray={s.dash}
                    clipPath={s.inner ? `url(#${clipId})` : undefined}
                  />
                ))}
          </g>
        )}
      </g>
    );
  }
  return (
    <svg
      viewBox="0 0 1000 600"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        {[...gradients.values()].map((g) => (
          <Gradient key={gradientId(g)} id={gradientId(g)} value={g} />
        ))}
        {[...shadows.values()].map((s) => (
          <Shadows key={shadowId(s)} id={shadowId(s)} layers={s} />
        ))}
      </defs>
      {layers.map((layer, i) => draw(layer, String(i)))}
    </svg>
  );
}
