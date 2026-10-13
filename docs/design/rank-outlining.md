# Reproducible rank preparation

Rank generation uses two font inputs: `tooling/assets/ranks.mjs` reads `packages/assets/fonts.json` and parses `packages/assets/source/fonts/hanuman-400.ttf` and `hanuman-700.ttf` with `opentype.js`. `pnpm generate:ranks` uses these files to reproduce the rank and stacked Joker-index vectors; CI runs this command and rejects generation drift.

These source font files retain their adjacent [license](../../packages/assets/source/fonts/OFL.txt) and are excluded from the npm package.

Pinned checksums, weight classes, offsets, text widths and baselines are recorded in `fonts.json`. The custom vector 10 bypasses this conversion. `pnpm prepare:assets` validates the 31-file contract, normalizes recorded frames and optimizes the vectors without contour simplification. Original sources remain separate from production output.
