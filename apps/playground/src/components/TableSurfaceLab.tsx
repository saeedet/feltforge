import { useState } from 'react';
import { Card, Chip, TableSurface } from '@feltforge/react';
import type { TableTheme } from '@feltforge/core';

const examples: Record<string, [number, number, number?]> = {
  desktop: [840, 460],
  portrait: [334, 486, 0.57],
  landscape: [559.64, 262.66, 0.571],
  square: [460, 460],
};

export function TableSurfaceLab({ theme }: { theme: TableTheme }) {
  const [width, setWidth] = useState(840),
    [height, setHeight] = useState(460),
    [custom, setCustom] = useState(false),
    [scale, setScale] = useState(0.57),
    [selected, setSelected] = useState(false);
  const detailScale = custom
    ? Math.min(scale, Math.min(width, height) / 280)
    : undefined;
  const example =
    Object.entries(examples).find(
      ([, size]) => size[0] === width && size[1] === height,
    )?.[0] ?? 'custom';
  return (
    <section className="surface-lab" aria-label="Table surface proportions">
      <h3>One surface. Any proportion.</h3>
      <p className="note">
        Change the outer-rail dimensions without stretching the artwork. The
        players and cards below are positioned independently.
      </p>
      <div className="toolbar">
        <label>
          Example
          <select
            aria-label="Surface example"
            value={example}
            onChange={(e) => {
              const value = e.target.value;
              const [w, h, s] = examples[value]!;
              setWidth(w);
              setHeight(h);
              setCustom(s !== undefined);
              if (s !== undefined) setScale(s);
            }}
          >
            <option value="desktop">Desktop</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="square">Square</option>
            <option value="custom" disabled>
              Custom dimensions
            </option>
          </select>
        </label>
        <label>
          Outer width <span className="control-value">{width}</span>
          <input
            aria-label="Surface width"
            type="range"
            min="240"
            max="1200"
            step="0.01"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>
        <label>
          Outer height <span className="control-value">{height}</span>
          <input
            aria-label="Surface height"
            type="range"
            min="240"
            max="900"
            step="0.01"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </label>
        <label>
          Rail and detail sizing
          <select
            aria-label="Surface detail sizing"
            value={custom ? 'custom' : 'auto'}
            onChange={(e) => setCustom(e.target.value === 'custom')}
          >
            <option value="auto">Automatic</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {custom && (
          <label>
            Detail scale{' '}
            <span className="control-value">{detailScale?.toFixed(3)}</span>
            <input
              aria-label="Surface detail scale"
              type="range"
              min="0.1"
              max={Math.min(width, height) / 280}
              step="0.001"
              value={detailScale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
          </label>
        )}
      </div>
      <div className="surface-preview-frame">
        <div
          className="surface-stage"
          style={{
            width: Math.min(width, 620),
            maxWidth: '100%',
            aspectRatio: `${width} / ${height}`,
          }}
        >
          <TableSurface
            theme={theme}
            width={width}
            height={height}
            {...(detailScale !== undefined ? { detailScale } : {})}
            decorative
            className="surface-underlay"
            style={{ width: '100%', height: '100%' }}
          />
          <button
            className="surface-player surface-player-top"
            type="button"
            onClick={() => setSelected(!selected)}
            aria-pressed={selected}
          >
            Player 1
          </button>
          <div className="surface-community">
            {(['A', '7', '10'] as const).map((rank, i) => (
              <Card
                key={rank}
                variant="compact"
                rank={rank}
                suit={(['spades', 'hearts', 'diamonds'] as const)[i]!}
                decorative
              />
            ))}
            <Chip value={25} size={32} decorative />
          </div>
          <span className="surface-player surface-player-bottom">You</span>
        </div>
      </div>
      <pre>
        <code>{`<div style={{ position: 'relative' }}>\n  <TableSurface\n    theme="${theme}"\n    width={${width}}\n    height={${height}}${detailScale === undefined ? '' : `\n    detailScale={${Number(detailScale.toFixed(4))}}`}\n    decorative\n    style={{ width: '100%', height: 'auto' }}\n  />\n  {/* Position your own players, cards and controls here. */}\n</div>`}</code>
      </pre>
    </section>
  );
}
