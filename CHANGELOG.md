# Changelog

## 0.2.0 — Unreleased

- Add vector-only compact cards in distinct 38 × 53 community and 50 × 70 hero layouts, with all 52 ordinary ranks and suits.
- Replace the outer border on standard cards, Jokers and backs with the approved box shadow and white inset edge; support complete shadow overrides and removal.
- Add compact cards, actual-size hands, magnified comparisons and shadow controls to the playground.
- Keep the three large hero cards static and equally sized on mobile.
- Add compact API, sizing, independent import and shadow override documentation.

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
