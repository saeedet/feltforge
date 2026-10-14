# Compact cards and shadow update

The approved designs are on Penpot page `17 — Compact Cards`, sections 6–8 and 10. Earlier v1 explorations are superseded. Exact inspected master geometry and source exports are retained in `compact-shadow-specification.json`; `compact-ten.svg` records the approved closed custom numeral path.

Community cards are 38 × 53 with a 3px radius. Hero cards are 50 × 70 with a 4px radius. Their rank, suit and spacing values are distinct presets in `COMPACT_CARD`, rather than a shared scaled layout. Community hands use a 7px gap; hero pairs use a 13px overlap and −7° / +3° rotations.

`pnpm generate:ranks` creates the compact rank outlines from the existing pinned bold source. The measured alphabetic baselines within the rank text box are 14.5px for community and 20.5px for hero. Custom 10 retains its closed paths and approved stroke, with visible height 0.73 × the rank size. Runtime components contain only paths; they do not load fonts. Suit geometry is reused from the existing assets with the inspected ink bounds.

Standard fronts, both Jokers and the Classic back have retired the grey outer border. Shadow option 4 consists of `0 1px 1px rgba(0,0,0,.25)`, `0 2px 8px rgba(0,0,0,.25)` and a 1px white 10% inset edge at the reference size. Standard shadows scale from a 100px reference width; compact shadows scale from their preset width. `--card-shadow` or `style.boxShadow` replaces all layers.

The Classic back source retains its background and decorative artwork. Its exterior appearance is supplied by the same component shadow as other cards. The standalone asset contract remains 31 SVGs: compact cards add no full-card exports. Code and original project artwork remain under the MIT License.
