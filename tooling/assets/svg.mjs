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

// Merge only adjacent, identical fill/stroke geometry with no per-path effects.
// Independent fill/stroke opacity is preserved; paths with transforms/effects that
// differ are deliberately left alone.
function mergeFillStroke() {
  const paint = new Set([
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-dasharray',
    'stroke-dashoffset',
  ]);
  return {
    name: 'feltforgeMergeFillStroke',
    fn: () => ({
      element: {
        exit(node) {
          for (let i = 0; i < node.children.length - 1; i++) {
            const a = node.children[i],
              b = node.children[i + 1];
            if (
              a.type !== 'element' ||
              b.type !== 'element' ||
              a.name !== 'path' ||
              b.name !== 'path'
            )
              continue;
            const x = a.attributes,
              y = b.attributes;
            if (
              !x.fill ||
              x.fill === 'none' ||
              (x.stroke && x.stroke !== 'none') ||
              y.fill !== 'none' ||
              !y.stroke ||
              y.stroke === 'none'
            )
              continue;
            if (
              [
                'opacity',
                'filter',
                'mask',
                'clip-path',
                'id',
                'style',
                'paint-order',
              ].some((k) => k in x || k in y)
            )
              continue;
            const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
            if ([...keys].some((k) => !paint.has(k) && x[k] !== y[k])) continue;
            for (const k of Object.keys(y))
              if (k.startsWith('stroke')) x[k] = y[k];
            node.children.splice(i + 1, 1);
          }
        },
      },
    }),
  };
}

export function prepareSvg(
  source,
  { width, height, monochrome = false, sourceViewBox, frameOrigin },
) {
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
          let [x, y, w, h] = box;
          if (sourceViewBox) {
            if (
              sourceViewBox.length !== 4 ||
              sourceViewBox.some((v, i) => Math.abs(v - box[i]) > 0.001)
            )
              throw new Error('Source viewBox differs from recorded export');
            if (
              !frameOrigin ||
              frameOrigin.length !== 2 ||
              frameOrigin.some((v) => !Number.isFinite(v))
            )
              throw new Error('Verified frame origin required');
            [x, y] = frameOrigin;
            if (
              x < box[0] ||
              y < box[1] ||
              x + width > box[0] + w ||
              y + height > box[1] + h
            )
              throw new Error('Crop lies outside source');
            w = width;
            h = height;
          }
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
      { name: 'removeAttrs', params: { attrs: 'class' } },
      'convertStyleToAttrs',
      'cleanupIds',
      'collapseGroups',
      mergeFillStroke(),
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
