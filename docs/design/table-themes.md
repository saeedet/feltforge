# Table themes

The six 1000 × 600 component masters on **02 — Components** in **Playing Cards** are the source of the table skins. [The captured specification](table-theme-specification.json) records their IDs, geometry, materials, paint order and clipping. Community and anchor guides are excluded from decorative artwork.

Classic is the updated default. Midnight Racetrack, Royal Burgundy, Neon Night, Emerald Art Deco and Ocean Slate are selected through `PokerTable.theme`. All themes preserve the existing seat, bet, marker, pot and community anchors and support all four seat layouts.

Decorative lettering was exported directly from Penpot as PDF, then converted to SVG outlines with Poppler. The committed SVG sources contain paths and local references only; no font files or runtime text are added. `pnpm generate:tables` optimizes these sources and reproduces `table-skins.generated.ts`. It does not connect to Penpot or fetch fonts.

The renderer preserves the captured gradients, inside strokes, stitching, studs, clipped hex/diamond patterns and layered shadows. Shadow blur maps to Gaussian deviation at half the Penpot blur value. Shadow branches use the original source alpha independently. Material CSS tokens and `--table-shadow` remain app-controlled; see [the API](../api.md#tables) for overrides.

The captured JSON and SVG outlines remain unchanged as design records. The 0.4.1 alignment correction centers the visible suit rows, wordmarks and crown rather than their padded export frames. Generation measures horizontal outline bounds without changing path shapes, scale or vertical placement. Emerald Club's top and bottom three-diamond rows sit midway between the paired gold lines, with equal spacing around the horizontal centerline. Runtime geometry distributes studs in mirrored quartets from the top center and anchors texture cells to the table center. These rules apply to both canonical and adaptive tables; directional lighting and shadows retain their original design.

The standalone 31-asset export contract is unchanged. Table skins are composable React SVG geometry and do not add static full-table exports. Browser checks cover switching every theme and layout with interactive overlays, multiple tables on one page, color/shadow overrides and review screenshots.
