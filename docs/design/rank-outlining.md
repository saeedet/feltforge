# Reproducible Hanuman outlines

Penpot exported Hanuman v24 Latin WOFF2 URLs for static weights 400 and 700. We downloaded those exact files, preserved their SHA-256 hashes, and losslessly decoded them to TrueType using fontTools 4.60.1 (`TTFont(..., recalcTimestamp=False)`, `flavor=None`). The small pinned TrueType subsets and OFL license are build inputs only. Neither fonts nor a runtime font loader belong in the published package.

`pnpm generate:ranks` verifies file hashes and weight classes, obtains glyph contours with opentype.js, and reproduces Penpot's horizontal offsets, text lengths and alphabetic baselines from `fonts.json`. The custom vector 10 bypasses outlining. Source checksums make accidental outline drift fail asset preparation.

`pnpm prepare:assets` validates the exact 31-file contract, source hashes and provenance, normalizes coordinates, removes editor wrappers, merges only identical adjacent fill/stroke paths without per-path effects, and runs SVGO at five-decimal precision. No path simplification tool is used. All original exports remain under source/. See the optimization and visual reports for measured results.
