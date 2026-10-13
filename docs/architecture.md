# Architecture decisions

The pnpm/Turborepo workspace has four concerns: framework-neutral types and geometry in `packages/core`; source, optimized vectors and generated modules in `packages/assets`; React composition in `packages/react`; and an independent Vite playground in `apps/playground`.

## One public package

Internal package names remain private and do not require an npm organization. `pnpm build` assembles one `feltforge` release candidate in `dist/package`, with explicit subpath exports. Relative imports replace internal workspace package names. Runtime code has no dependency other than React as an optional peer (needed for React entries, unnecessary for core).

Default builds stay `private: true`. After explicit maintainer approval, `pnpm package:release` prepares a separate public manifest and validated tarball. It does not publish; publication remains an explicit npm action. Internal workspace packages always remain private. No publish automation is configured.

## Explicit artwork selection

The global string-style suggestion was refined to `court={western}` and explicit Joker artwork imports. A default heavy court collection would make ordinary card imports include unwanted art. The standalone Card component therefore requires a collection for J/Q/K. The playground defaults to Persian and dynamically imports each collection. This preserves all styles, avoids a provider or global registration system, and keeps `style` available for normal React CSS.

Production cards are composed from one shell, reusable glyph/suit paths and geometry data. Artwork is inline vector geometry, with local SVG IDs scoped per instance. No full-deck assets, runtime font conversion or runtime SVG parsing library is shipped. Small inline fragments are generated and verified at build time. Detailed court artwork is intentionally not aggressively simplified.

## Geometry and overlays

Table geometry remains a 5:3 SVG. Seat, bet, marker, community and pot UI remains HTML anchored in normalized coordinates, with independent dimensions. `PokerMarker` renders only the puck. Core computes marker positions from the approved formula and stored signs. No game state or rules are inferred by the library.

## Build and verification

Pinned font subsets and their original WOFF2 hashes make rank extraction repeatable. Sources, generated SVGs and independently importable modules are committed. Source hashes and the exact 31-file contract fail closed on drift. CI regenerates outputs and compares the tracked result.

Vitest checks semantics, geometry, bounded stack behaviour and server rendering. Separate TypeScript fixtures reject impossible component props. Raster comparisons check original versus optimized SVGs and exported Penpot glyph references without controlling a browser. Playwright checks the actual playground in CI and captures review screenshots. Package checks inspect exports, excluded source/font material and real bundled consumer fixtures.

TypeScript 5.9.3 is pinned to the supported range of the chosen typescript-eslint version. SVG, font, rendering and bundling tools are development dependencies only. Assets have owner-confirmed MIT-compatible rights; font software retains its OFL notices.
