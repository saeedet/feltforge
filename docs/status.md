# Implementation status

FeltForge 0.4.1 corrects table decoration alignment across all six themes. Visible suit rows, labels and crowns are centered; studs and texture patterns share symmetric placement rules at desktop and adaptive proportions. Emerald Club's three-diamond rows sit between the paired gold lines, and the playground's portrait player badges leave the ornaments visible. Original materials and gameplay geometry remain unchanged.

FeltForge 0.4.0 adds `TableSurface` for consumer-owned portrait, landscape and arbitrary-proportion layouts. It shares the six theme recipes with `PokerTable`, preserves the desktop artwork and overlay API, and includes a surface lab and [consumer handoff](table-surfaces.md). Table overlays keep seats above chips and cards, and the playground's dealer/blind markers shrink with the table.

FeltForge 0.3.0 includes six poker table themes. It includes standard and compact cards, three court collections, two Jokers, chip shadows and rims, framework-independent geometry, React primitives and the hosted playground.

The 0.3.0 release adds the refined Classic table and five new Penpot table themes, with outlined SVG lettering, unchanged overlay anchors, a playground theme picker/gallery and customization documentation. The README banner shows the refined Classic table.

The 0.4.1 release passed strict TypeScript contracts, 133 unit/SSR/rendering tests, exact unchanged-material pixel regressions across all six themes, independent Classic and Royal Burgundy Penpot image comparisons, deterministic asset and table regeneration, package exports and bundle checks, actual tarball React 18/Next.js consumers, and 32 browser checks. Coverage includes visible artwork centering and symmetry, portrait ornament placement and badge clearance, arbitrary proportions, responsive sizing, marker scaling and overlay stacking. CI retains review screenshots. The original 31-file standalone asset contract is unchanged.

The public repository is [saeedet/feltforge](https://github.com/saeedet/feltforge). See [npm](https://www.npmjs.com/package/feltforge), [the playground](https://saeedet.github.io/feltforge/) and [publishing](publishing.md). Default builds remain private; version tags run the trusted-publisher workflow after approval. Penpot is unchanged by the import.
