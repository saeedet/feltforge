# Continuous chip rim

The current Poker / Chip master uses a separate Rim ellipse immediately above Edge Inserts and below Inner Ring. At 64 × 64 it has a 1px inner stroke, black at 28% opacity, with no fill. The base disc has no stroke. The same Rim appears on all canonical denominations and custom chips.

SVG represents the inner stroke as a centered stroke at radius 31.5 with width 1, keeping its entire painted area inside the 32-unit outer radius. `CHIP.rim` holds the shared width, color and opacity. The rim scales with the chip geometry and is independent of Contact shadows. The geometry remains procedural and the labels remain live text; no font files or static chip assets are imported.

The package already drew an equivalent continuous rim above the inserts. This update makes the layer and stroke width explicit, follows the master's paint order exactly, and adds raster coverage for all eight insert positions. It does not add a second border or make the rim thicker.

The inspected master, canonical instances and approved before/after board are recorded in [chip-rim-specification.json](./chip-rim-specification.json).
