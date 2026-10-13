# Changelog

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
