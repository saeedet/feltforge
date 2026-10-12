import { optimize } from 'svgo';

const forbidden = new Set([
  'script',
  'foreignObject',
  'image',
  'text',
  'tspan',
  'style',
  'filter',
  'mask',
  'linearGradient',
  'radialGradient',
  'animate',
  'animateTransform',
  'set',
]);

/** Fail before optimization so hidden unsafe content cannot disappear unnoticed. */
function vectorGuard() {
  return {
    name: 'feltforgeVectorGuard',
    fn: () => ({
      element: {
        enter(node) {
          if (forbidden.has(node.name))
            throw new Error(`Unsupported production SVG element: ${node.name}`);
          for (const [key, value] of Object.entries(node.attributes)) {
            if (
              /^on/i.test(key) ||
              (/font-family|@import|data:|https?:|javascript:/i.test(value) &&
                !key.startsWith('xmlns'))
            ) {
              throw new Error(`Unsupported SVG attribute: ${key}`);
            }
            if (
              (key === 'href' || key === 'xlink:href') &&
              !value.startsWith('#')
            )
              throw new Error('External SVG reference');
            for (const match of value.matchAll(/url\(\s*['"]?([^)'"\s]+)/gi)) {
              if (!match[1].startsWith('#'))
                throw new Error('External SVG URL');
            }
          }
        },
      },
    }),
  };
}

export function prepareSvg(source, { width, height, monochrome = false }) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    throw new Error('Invalid asset frame');
  if (/<!DOCTYPE|<!ENTITY/i.test(source))
    throw new Error('SVG document entities are not allowed');
  let foundRoot = false;
  const normalize = {
    name: 'feltforgeNormalizeFrame',
    fn: () => ({
      element: {
        enter(node, parent) {
          if (node.name !== 'svg' || parent.type !== 'root') return;
          foundRoot = true;
          const box = node.attributes.viewBox
            ?.trim()
            .split(/[\s,]+/)
            .map(Number);
          if (!box || box.length !== 4 || box.some((v) => !Number.isFinite(v)))
            throw new Error('A finite source viewBox is required');
          const [x, y, w, h] = box;
          if (Math.abs(w - width) > 0.01 || Math.abs(h - height) > 0.01)
            throw new Error(
              `Source frame ${w}×${h} differs from approved ${width}×${height}`,
            );
          node.attributes.viewBox = `0 0 ${width} ${height}`;
          delete node.attributes.width;
          delete node.attributes.height;
          delete node.attributes.id;
          if (x !== 0 || y !== 0)
            node.children = [
              {
                type: 'element',
                name: 'g',
                attributes: { transform: `translate(${-x} ${-y})` },
                children: node.children,
              },
            ];
        },
      },
    }),
  };
  const colorize = {
    name: 'feltforgeMonochrome',
    fn: () => ({
      element: {
        enter(node) {
          if (!monochrome) return;
          for (const key of ['fill', 'stroke']) {
            const value = node.attributes[key];
            if (
              value &&
              value !== 'none' &&
              value !== 'currentColor' &&
              value !== 'inherit'
            ) {
              if (value.includes('url('))
                throw new Error('Monochrome assets cannot use paint servers');
              node.attributes[key] = 'currentColor';
            }
          }
          if (node.name === 'svg' && !node.attributes.fill)
            node.attributes.fill = 'currentColor';
        },
      },
    }),
  };
  const result = optimize(source, {
    multipass: false,
    floatPrecision: 5,
    plugins: [
      vectorGuard(),
      normalize,
      {
        name: 'preset-default',
        params: {
          overrides: {
            convertPathData: { floatPrecision: 5 },
            cleanupNumericValues: { floatPrecision: 5 },
          },
        },
      },
      'removeDimensions',
      colorize,
    ],
    js2svg: { pretty: false },
  });
  if (!foundRoot) throw new Error('Missing SVG root');
  optimize(result.data, { plugins: [vectorGuard()] });
  return result.data + '\n';
}
