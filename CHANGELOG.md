# Changelog

## Unreleased — 0.4.0

- Add `TableSurface`, an artwork-only SVG component with configurable outer-rail dimensions and material scale, available from the root, table, poker and focused table-surface entries.
- Adapt all six themes to portrait, landscape, circular and intermediate proportions through shared stadium geometry, edge-anchored SVG ornaments, regular textures and round perimeter studs.
- Preserve the existing PokerTable API, 1000 × 600 desktop canvas, overlay anchors and default rendering across all themes.
- Add an interactive surface-proportion lab, desktop pixel regressions, geometry/browser coverage and consumer integration guidance.

## 0.3.0 — 2026-10-17

- Add five Penpot table themes: Midnight Racetrack, Royal Burgundy, Neon Night, Emerald Art Deco and Ocean Slate, alongside the refined Classic design.
- Add `PokerTable.theme`, theme names and labels while preserving all 2/6/8/9-seat overlay anchors and the Classic default.
- Preserve gradients, stitching, brass studs, felt patterns, lighting and glow. Convert decorative lettering to SVG paths with no runtime font dependency.
- Add a theme picker and six-design gallery to the playground, plus theme, color and shadow customization documentation.
- Refresh the README banner with the updated Classic table, card shadows and chip rims.

## 0.2.2 — 2026-10-15

- Align the separate chip rim with the updated Penpot master: a continuous 1px inner border above every edge insert, using shared design constants on single chips and stack layers.
- Add magnified chip-border previews and document the rim's sizing and paint order.
- Verify that the rim remains visible over all eight inserts across every denomination and custom chips.

## 0.2.1 — 2026-10-15

- Add the approved two-layer Contact shadow to single chips and each visible chip in a stack, enabled by default and scaled with the chip geometry.
- Support removing or replacing chip shadows through `shadow`, `--chip-shadow`, or `style.filter`; document the defaults and overrides.
- Add chip shadow controls, size comparisons and felt/navy previews to the playground.
- Fix clipped playground card shadows on mobile and prevent hidden SVG artwork from showing through the flip effect; add mobile WebKit coverage.

## 0.2.0 — 2026-10-14

- Add vector-only compact cards in distinct 38 × 53 community and 50 × 70 hero layouts, with all 52 ordinary ranks and suits.
- Replace the outer border on standard cards, Jokers and backs with the approved box shadow and white inset edge; support complete shadow overrides and removal.
- Add compact cards, actual-size hands, magnified comparisons and shadow controls to the playground.
- Keep the three large hero cards static and equally sized on mobile.
- Add compact API, sizing, independent import and shadow override documentation.
- Fix responsive card backs to fill their wrappers as the playground table resizes.

## 0.1.1 — 2026-10-13

- Publish the playground on GitHub Pages and link it from the repository and package.
- Add a playground screenshot to the top of the README.
- Restore the three decorative hero cards to their static presentation while keeping the gallery and table cards interactive.
- Add checked, tag-triggered npm releases through a trusted GitHub Actions publisher.
- Simplify the package's artwork provenance and licensing notes. Library behavior and exports are unchanged.

## 0.1.0 — 2026-10-13

- Extend flip/drag/tilt to every playground card, including Jokers, backs, hero and community cards; remove card focus and selection rings.

- Add a React Bits flip/drag preview to the playground, including keyboard and reduced-motion support; keep the effect outside the npm library.

- Add all 31 approved vector assets, rank and Joker-index vectors and deterministic preparation.
- Add accessible, typed Card, CardBack, Chip, ChipStack, PokerMarker, PokerTable and TableAnchor components.
- Add Persian, Western and Eastern court collections and two independently imported Jokers.
- Add framework-independent card/pip data, chip palettes/stacks and approved 2/6/8/9-seat geometry.
- Add the responsive component playground and source/optimized visual comparisons.
- Add type contracts, SSR checks, CI interaction tests, package-content and consumer-bundle checks.
- Verify the actual tarball with React 18 and Next.js App Router consumers.
- Prepare one ESM `feltforge` package with subpath exports; retain the publication guard.
