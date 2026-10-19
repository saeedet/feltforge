# Table artwork in consumer-owned layouts

FeltForge 0.4.0 adds `TableSurface`. It owns the artwork while the consumer owns the surrounding scene. Existing `PokerTable` usage remains compatible and needs no migration.

```tsx
import { TableSurface } from 'feltforge/table-surface';

function TableScene() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
      <TableSurface
        width={334}
        height={486}
        detailScale={0.57}
        theme="classic"
        decorative
        style={{ width: '100%', height: 'auto' }}
      />
      <button style={{ position: 'absolute', left: '50%', top: '8%' }}>
        Player
      </button>
      {/* Place your own game content using your existing coordinate system. */}
    </div>
  );
}
```

The numerical dimensions describe the outer rail. There are no hidden scene margins, seat anchors or positioning callbacks. The SVG's bounds run from 0,0 to width,height. Shadows extend outside them, so leave space in the parent. The table's geometry is recomputed when its numerical props change. CSS-only resizing scales it uniformly; it never changes the proportion automatically or requires DOM measurements inside the library.

## Dimensions and material sizing

`width` and `height` can describe any positive finite stadium. Rounded ends have radius `Math.min(width, height) / 2`, including a circular surface when both dimensions match. The same material recipe creates the rail, felt, betting line and other inset layers.

`detailScale` scales the captured material insets, stroke widths, stitch lengths, shadows, studs and decorative art together. It defaults to the shorter edge divided by 460, preserving the desktop material proportions. It can be set independently to reproduce a design's specified rail thickness. It must be finite, positive and no greater than the shorter edge divided by 280, which reserves space for the deepest betting line and the top/bottom ornaments. This check prevents collapsed inner shapes and crowded end ornaments; it does not limit consumers to particular dimensions or aspect ratios.

For example, Classic's felt is inset by `32 * detailScale` and its betting line by `82 * detailScale`. With 334 × 486 and scale 0.57, the felt is 297.52 × 449.52 and the betting line is 240.52 × 392.52. Intrinsic dimensions and material scale both scale through the SVG viewport when CSS changes its displayed size.

All six themes support every valid proportion. Gradients follow their layer bounds. Lighting keeps its top-to-bottom direction; the surface is recomputed rather than rotating a desktop image. Wordmarks, crowns, diamonds and chevrons anchor to the appropriate edge without stretching. SVG texture tiles keep regular cells. Royal Burgundy studs remain round and evenly spaced; extreme proportions use at most 512 studs. Color tokens and `--table-shadow` remain available. No font or image downloads are required.

## Handoff for AI-engineering-system/poker

The integration was inspected on branch `feat/220-mobile-landscape-gameplay`: `MobileTableSurface.tsx`, `PokerTable.tsx`, `mobile-shared.css`, both mobile stage styles, and the desktop/portrait/landscape layout utilities. The separate mobile component currently draws FeltForge-like materials with spans and CSS; desktop uses FeltForge's original full-scene renderer. FeltForge's old scene canvas could not express the mobile artwork's bounds, which led to the duplicated material implementation.

Keep the existing desktop `PokerTable` renderer and all authoritative scene scaling, seat/card/bet/marker anchors and gameplay code. Replace only the mobile artwork with:

```tsx
import { TableSurface } from 'feltforge/table';

const portraitArt = {
  width: 334,
  height: 486,
  detailScale: 0.57,
  left: 28,
  top: 106,
};
const landscapeArt = {
  width: 559.64,
  height: 262.66,
  detailScale: 0.571,
  left: 142.18,
  top: 50.67,
};

function MobileArtwork({ landscape }: { landscape: boolean }) {
  const art = landscape ? landscapeArt : portraitArt;
  return (
    <TableSurface
      width={art.width}
      height={art.height}
      detailScale={art.detailScale}
      theme="classic"
      decorative
      style={{ position: 'absolute', left: art.left, top: art.top }}
    />
  );
}
```

These example positions are in Poker's existing canonical mobile scenes. Continue applying the application's scene transform around the artwork and gameplay layers together. Do not apply the old desktop's 1000 × 600 canvas compensation to this tight surface.

After updating the consumer dependency to the released 0.4.0 version, remove its `MobileTableSurface` spans, material CSS, old rail background/shadows, and `--mobile-*` material variables. Retain placement rules and the surrounding canonical scene transforms, safe-area handling, HUDs, cards, bets, pots and controls. Do not leave the old background or box shadows on the new SVG, which would draw a second table beneath it. Replace materials with `--table-*` overrides only if the application intentionally customizes the theme.

This change does not modify the Poker repository. Until 0.4.0 is approved, merged and tagged, that npm version is unavailable; test the locally packed candidate if integrating before publication. The standard repository release pipeline publishes the version after approval.
