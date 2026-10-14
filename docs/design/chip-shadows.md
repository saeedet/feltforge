# Chip Contact shadow

The chosen A — Contact option on Penpot's Poker Chips page and the current Poker / Chip master use two independent black shadows at the 64 × 64 design size: `0 1 blur 1 / 35%` and `0 2 blur 4 / 25%`. The Contact stack master applies these layers to each chip, rather than to the combined stack. The None variant removes both layers.

The implementation keeps the existing procedural geometry, palettes, live labels and stack offsets. Runtime SVG filter primitives reproduce the independent layers, with Gaussian deviations of 0.5 and 2. The SVG coordinate system scales the shadows with the artwork, including 28px chip previews. No design font file or static chip export is imported.

The component masters resolve an outdated sentence in the stack decision note that says the base Chip has no shadow: the updated Poker / Chip master and canonical denomination instances all carry Contact. The approved option is A; B, C and D are alternatives.

The inspected values and reference node identifiers are recorded in [chip-shadow-specification.json](./chip-shadow-specification.json). Public usage and overrides are documented in the README and API reference.
