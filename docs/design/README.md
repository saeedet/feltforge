# Captured design specification

`penpot-specification.json` is a read-only text capture from the locked Playing Cards
Penpot file `52a5041f-08a1-80f1-8008-c36ef29dd4bb`, inspected on 2026-10-12.
It includes source page and text-object IDs for traceability. Penpot remains authoritative;
this capture does not replace the vector source or visual references.

## Preparation commands

`pnpm generate:ranks` requires the exact checksum-pinned Hanuman 400/700 files and
verified baselines in `packages/assets/fonts.json`. It intentionally fails while these
are unknown. The pre-existing vector 10 is excluded from font generation.

`pnpm prepare:assets` requires all 31 source files and a complete provenance manifest.
It validates all files before writing production output, rejects external references,
images, text, filters, masks and scripts, normalizes the approved frame, and runs SVGO.
The report records per-asset source/optimized sizes and hashes. Original sources are
never overwritten. No path-simplification algorithm is used.

SVG preparation tests currently use synthetic fixtures to validate normalization and
rejection behavior. They do not constitute artwork fidelity checks. The pipeline remains
incomplete until actual exports, exact font baselines, licenses, PNG comparisons, and
deterministic regeneration have been verified.
