# Source documentation discrepancies

Inspection of the locked Playing Cards file found two stale labels:

- Export Specification still calls the custom Ace of Spades and stacked Joker index
  “proposed” / “pending approval”. The maintainer's final implementation brief explicitly
  approves both, so the production contract remains 31 assets.
- Foundations still labels the face-rank typography “TBD”. The export specification supplies the final rank treatment used by the build inputs.

These are documentation conflicts, not visual redesign requests. Penpot was not edited.
All source vectors have now been compared with optimized output. The composed Seven of Hearts also passes its independent Penpot PNG regression. Measured rendering differences are documented below.

## Marker coordinate transcription

The written nine-seat table gives seat 1 x=370.0 and seat 8 x=630.0. The locked ellipse, inward=125, tangent=55, and approved signs produce x=369.909804 and x=630.090196. The largest difference is 0.090196 canonical pixels. Production retains the exact approved formula; the prose table is treated as an approximate visual reference with a 0.1px tolerance. No Penpot geometry was changed.

## Export bounds and text rendering

The Classic back exports at 251 × 351 because its outer stroke extends 0.5px beyond the 250 × 350 board. Preparation explicitly crops to the locked board frame; the untouched source and recorded original viewBox are retained.

Some ranks extend outside their nominal 40 × 50 layout frame (notably A). Composition preserves this intentional overflow rather than clipping glyphs. Penpot uses ideographic baselines and a browser-rounded descent of 34px for 69px source text, and 17px for 34px bold source text. The outlines use the observed alphabetic baselines and exact exported horizontal positions/text lengths.

PNG comparison across renderers retains small anti-aliasing/hinting differences: mean alpha-channel errors on a 0–255 scale are 1.30 for A, 0.64 for 2, and 2.52 for the bold Joker index. Geometry comes directly from the exact pinned font. These are renderer differences, not a replacement font. Human visual review remains part of release sign-off.
