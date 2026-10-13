# Asset provenance and preparation

The locked Penpot Playing Cards file is the visual source of truth. The source capture, object IDs, bounds and SHA-256 hashes are recorded in `packages/assets/manifest.json` and `docs/design/penpot-specification.json`.

All 31 standalone assets are captured and prepared: four suits, thirteen ordinary ranks, nine courts, two Jokers, the Classic back, the custom Ace of Spades centrepiece and the stacked Joker index. Raw vector sources remain separate from optimized output. The exact Penpot Hanuman 400/700 font subsets are pinned build inputs; no font binary is included in the distribution.

The project owner confirmed on 2026-10-12 that the approved court, Joker and back artwork has MIT-compatible redistribution rights. See [owner confirmation](design/asset-provenance.md), [rank conversion](design/rank-outlining.md), [visual differences](design/discrepancies.md) and the optimization report under `packages/assets`.

`pnpm generate:ranks`, `pnpm prepare:assets` and `pnpm test:visual` reproduce and verify the assets. No full-front deck, chip, stack, marker or table SVG is distributed. Those primitives are generated through composition and geometry.
