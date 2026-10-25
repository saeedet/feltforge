import { optimize } from 'svgo';

// Compare the unchanged materials separately from intentionally realigned art.
export function withoutTableDecorations(svg) {
  return optimize(svg, {
    plugins: [
      {
        name: 'table-materials-only',
        fn(root) {
          function visit(node) {
            if (!node.children) return;
            node.children = node.children.filter((child) => {
              const name = child.attributes?.['data-table-layer'] ?? '';
              return !/^(Text|Brass Studs|Hex Grid.*|Diamond Weave.*|Deco Diamond.*)$/.test(
                name,
              );
            });
            node.children.forEach(visit);
          }
          visit(root);
        },
      },
    ],
  }).data;
}
