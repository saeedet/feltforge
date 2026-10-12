# Initial architecture decisions

The workspace separates framework-neutral semantics and geometry (`core`),
authoritative/optimized vector assets (`assets`), React composition (`react`),
and an independent Vite playground. Turborepo coordinates package builds.

All workspace packages are private while implementation and licensing remain
incomplete. These names do not require an npm organization. A single public
`feltforge` package with subpath exports is a candidate publishing structure;
availability, the final exports, and package contents have not been verified.
Public npm naming will be presented to the maintainer before any publication.

TypeScript 5.9.3 is pinned because the selected typescript-eslint release declares
support for TypeScript below 6.1.0; the registry's latest TypeScript is not compatible
with that constraint. Build and lint tooling are development dependencies only.
The installed pnpm version is pinned for reproducible local and CI use.

Future card composition should keep lightweight number cards independent of
court, Joker, and back artwork. Explicit per-style entry points or injected artwork
must be evaluated against real consumer bundle fixtures. No tree-shaking result
is claimed from an empty React package.

Use a discriminated card prop union and retain `style` for ordinary React CSS.
A `courtStyle` or explicit artwork selection can carry the visual style without
overloading CSS semantics. This remains a planned API, not an implemented export.

Table geometry will scale proportionally, while HTML overlays use normalized
anchors and independent/clamped sizing. Marker placement belongs in layout
utilities; the marker component renders only the puck.

No visual geometry has been implemented before source inspection. No poker engine
or speculative seat UI has been added. Code uses MIT; asset/font redistribution
requires separate provenance verification before inclusion.
