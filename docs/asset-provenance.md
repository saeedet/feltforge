# Asset source and preparation requirements

The locked Penpot file is the visual source of truth. The implementation needs
read access to Overview, Foundations, Components, Scale Tests, Style Gallery,
Card Backs, Jokers, Export Specification, Poker Chips, Poker Table, and Imports.
Identify pages by title rather than relying on page numbers.

`packages/assets/contract.json` records the 31 required standalone assets:
4 suits, 13 ordinary ranks, 9 courts, 2 Joker artworks, the Classic back,
the custom Ace of Spades centrepiece, and the stacked JOKER index.

Before implementing the pipeline, record:

- Source file/page/component IDs and revision, export bounds, and reference images.
- Exact pip rows, shell/corner geometry, palette, and approved top-down stack offsets.
- Exact Hanuman face/weight, glyph text positioning, and stacked JOKER layout.
- Font provenance, checksum, and license; original artwork redistribution rights.

Keep authoritative exports in `packages/assets/source/`. Normalize and optimize
copies into `generated/`, preserving intentional bounds, clipping, fills, and strokes.
Require vector-only output with no external references, raster images, scripts,
or embedded fonts. Use currentColor for single-color suit/rank artwork where safe.
Avoid destructive path simplification. Measure byte sizes before and after optimization.

Outline the approved live Hanuman glyphs at preparation time. Preserve the approved
vector 10 unchanged in appearance. No runtime Hanuman dependency is allowed.
The stacked JOKER treatment must come from the source; it must not be inferred from
an ordinary horizontal word. Add deterministic hashes and visual comparisons.

Locked corrections from the brief:

- Chip and marker text uses Inter Tight, weight 800, as its design reference.
  Chip denomination text remains live runtime text.
- Chips, top-down stacks, tables, and markers are generated in code, not exported assets.
- Marker placement uses 125 inward and 55 tangent offset, with the explicit approved
  per-layout lateral sign arrays. The older 85/50 rule is rejected.
- Persian is the default court style unless the locked source documents otherwise.
- Joker variants 1 and 2 are shared across court styles and have no suit.

These are implementation requirements, not a claim that source exports, outlining,
optimization, licensing review, or Penpot visual comparisons have been completed.
