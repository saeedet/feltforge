import { describe, expect, it } from 'vitest';
import { prepareSvg } from './svg.mjs';
import { safeAssetPath } from './build.mjs';
const frame = { width: 30, height: 37.5 };
const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 37.5">${body}</svg>`;
describe('production SVG preparation', () => {
  it('normalizes a page-coordinate viewBox without changing the intended frame', () => {
    const svg = prepareSvg(
      '<svg width="30" height="37.5" viewBox="100 200 30 37.5"><path fill="#E0001B" d="M100 200h30v37.5h-30z"/></svg>',
      { ...frame, monochrome: true },
    );
    expect(svg).toContain('viewBox="0 0 30 37.5"');
    expect(svg).toContain('currentColor');
    expect(svg).not.toMatch(/<svg[^>]+\b(?:width|height)=/);
    expect(svg).not.toContain('100 200');
  });
  it('preserves separate fill and seam stroke instead of discarding artwork detail', () => {
    const svg = prepareSvg(
      wrap(
        '<path fill="#aabbcc" stroke="#aabbcc" stroke-width="0.5" d="M1 1h20v20z"/>',
      ),
      frame,
    );
    expect(svg).toContain('stroke-width=".5"');
    expect(svg).toContain('#abc');
  });
  it('is deterministic and retains the approved viewBox', () => {
    const source = wrap(
      '<metadata>editor</metadata><g><path fill="#123456" d="M1 1h20v20z"/></g>',
    );
    const first = prepareSvg(source, frame);
    expect(prepareSvg(source, frame)).toBe(first);
    expect(first).not.toContain('metadata');
    expect(first).toContain('viewBox="0 0 30 37.5"');
  });
  it.each([
    '<text>2</text>',
    '<image href="data:image/png;base64,AA=="/>',
    '<script/>',
    '<foreignObject/>',
    '<filter/>',
    '<mask/>',
    '<style/>',
    '<path onclick="evil()"/>',
    '<use href="other.svg#x"/>',
    '<path style="fill:url(https://example.com/x)"/>',
  ])(
    'rejects unsupported content %s before it can disappear during optimization',
    (body) => {
      expect(() => prepareSvg(wrap(body), frame)).toThrow();
    },
  );
  it('rejects dimension mismatch and malformed input', () => {
    expect(() => prepareSvg(wrap(''), { width: 40, height: 50 })).toThrow(
      /differs/,
    );
    expect(() => prepareSvg('not SVG', frame)).toThrow();
    expect(() => prepareSvg('<!DOCTYPE svg>' + wrap(''), frame)).toThrow(
      /entities/,
    );
  });
  it('prevents source paths from escaping the asset directory', () => {
    expect(() => safeAssetPath('/assets', '../secret.svg')).toThrow();
    expect(() => safeAssetPath('/assets', '/secret.svg')).toThrow();
    expect(safeAssetPath('/assets', 'courts/persian/king.svg')).toBe(
      '/assets/courts/persian/king.svg',
    );
  });
});
