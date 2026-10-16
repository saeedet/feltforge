# Captured design specification

The refreshed Classic and five additional poker table masters are captured separately in [table themes](table-themes.md), with reproducible font-free SVG lettering and themed React geometry.

`penpot-specification.json` is a read-only capture of the locked Playing Cards Penpot file `52a5041f-08a1-80f1-8008-c36ef29dd4bb`, inspected on 2026-10-12. It preserves source page and text-object IDs. Penpot remains authoritative.

All required vector exports, exact font subsets, layout metadata and checksums are captured. `pnpm generate:ranks` reproduces thirteen text-derived assets; the existing vector 10 is preserved. `pnpm prepare:assets` validates all thirty-one sources before generating output, removes editor wrappers, normalizes/crops only recorded frames, safely merges duplicated fill/stroke geometry and optimizes at five-decimal precision.

`pnpm test:visual` compares every original vector asset with its optimized copy at 2× resolution, plus independent Penpot PNG references for the regular and bold glyph treatment. Unit tests also compare the composed seven of hearts to its exported reference. Small cross-renderer font differences and the 0.0902px marker-table discrepancy are documented, not silently corrected in the design.

The captured specification preserves original Penpot text, including historical font references. It is design evidence, not the project’s licensing statement. See [asset provenance](asset-provenance.md) for artwork licensing and [rank preparation](rank-outlining.md) for actual build dependencies.
