# API

## Cards

`Card` takes a discriminated union:

`variant="standard"` is the default. `variant="compact"` takes any ordinary `rank` and a `suit`, with optional `size="community" | "hero"`. Compact cards do not accept `court`, `artwork` or Joker ranks. `CompactCard` is an equivalent focused component that does not require the variant prop.

| Kind          | Required props                               | Excluded props     |
| ------------- | -------------------------------------------- | ------------------ |
| Number or Ace | `rank: 'A' \| '2'…'10'`, `suit`              | `court`, `artwork` |
| Court         | `rank: 'J' \| 'Q' \| 'K'`, `suit`, `court`   | `artwork`          |
| Joker         | `rank: 'joker'`, `artwork: joker1 \| joker2` | `suit`, `court`    |

Suits are `hearts`, `diamonds`, `clubs`, `spades`. Import `persian`, `western` or `eastern` from `feltforge/courts/<style>`. Import `joker1` or `joker2` from `feltforge/jokers/1` or `/2`.

`CardBack` accepts `backStyle?: 'classic'` and no rank or suit. Cards and backs accept SVG props, `width`, `height`, `className`, `style`, `aria-label`, `decorative`, and an SVG ref. Canonical dimensions are 250 × 350; default width is 250, recommended minimum 100. `preserveAspectRatio` keeps geometry proportional; avoid CSS that distorts the outer frame.

Inline artwork objects are trusted build-time constants, not a sanitization boundary for user-supplied SVG strings. Do not construct them from untrusted CMS or network data.

## Chips and stacks

`Chip`: required `value`, optional `label`, `color`, `insertColor`, `labelColor`, `size` (64), `shadow` (true), common SVG props. Values must be finite, non-negative safe numbers. Multiples of 1,000 format as `1K`, `5K`, etc. Labels stay live text and shrink to the 34px design limit after measurement. Server rendering uses a conservative width for labels longer than three characters. Inter Tight 800 is the reference font; provide it in your app for closest typographic fidelity. No font asset is bundled.

`ChipStack`: either `{ value, count }` or `{ chips: [{ value, count }, …] }`. Groups are ordered bottom to top. `maxVisible` accepts 1–8 (default 5) and preserves the topmost chips without allocating one element per real chip. `size` controls an individual chip; the stack's natural bounds expand by 3px right and 4px upward for each extra visible chip. Zero count draws no chip or shadow. `shadow` defaults to true and applies Contact to each visible chip. The accessible label reports actual count and total value, not the visible cap. Appearance overrides apply to all visible chips.

Contact consists of independent `0 1 blur 1 / 35%` and `0 2 blur 4 / 25%` black shadows at 64 units. Runtime SVG filters use Gaussian deviations of 0.5 and 2, matching Penpot. Both the geometry and shadows scale together. `shadow={false}` disables them; otherwise `style.filter` overrides `--chip-shadow`, which overrides the default. A direct `style.filter` applies to each chip, rather than filtering the combined stack. Custom filter lengths are in the 64-unit chip coordinate system. Use `none` or a CSS filter value such as `drop-shadow(0 2px 3px rgba(0,0,0,.3))`. The previous `CHIP.shadow` Subtle preset is deprecated; `CHIP.contactShadows` contains the current layers.

`CHIP.rim` defines the continuous inner border: width 1, color `#000000`, opacity 0.28 at 64 units. It paints after Edge Inserts and before Inner Ring on every chip, including stack layers. The SVG stroke uses radius 31.5 and width 1 to remain inside the 32-unit outer radius. It scales with the geometry and remains visible when shadows are disabled.

Colours are configurable defaults, not universal casino denominations.

## Markers

`PokerMarker`: `type: 'dealer' | 'small-blind' | 'big-blind'`, optional `size` (40), `accentColor` and SVG props. Labels are D, SB, BB. The canonical puck is 64 × 64, with a recommended minimum rendered size of 32. Placement is deliberately handled separately by the table/core geometry.

## Tables

### TableSurface

`TableSurface` renders only table artwork. It is exported from `feltforge`, `/react`, `/table`, `/poker`, and the focused `/table-surface` entry, with the `TableSurfaceProps` type.

| Prop          | Default                         | Meaning                                            |
| ------------- | ------------------------------- | -------------------------------------------------- |
| `width`       | `840`                           | Outer-rail width in numeric design units           |
| `height`      | `460`                           | Outer-rail height in numeric design units          |
| `detailScale` | `Math.min(width, height) / 460` | Uniform material, line, ornament and shadow sizing |
| `theme`       | `classic`                       | Any existing `TableTheme`                          |
| `decorative`  | `false`                         | Hide the surface from assistive technology         |

Dimensions and scale must be finite positive numbers that do not overflow geometry arithmetic, and `detailScale <= Math.min(width, height) / 280`. Invalid values or themes throw `RangeError`. This scale bound keeps the deepest inset and end ornaments apart. Default sizing satisfies it. The surface is a stadium: its outer radius is half the shorter edge, with each layer inset uniformly. It does not provide arbitrary corner-radius or custom-path controls.

It accepts common SVG props, `className`, `style`, `aria-label` and an SVG ref. Its default accessible label is the theme name followed by “poker table surface”. It has no `layout`, render callbacks or children. Compose independently positioned HTML siblings in your application's own scene. The intrinsic SVG is exactly the outer-rail size, without the desktop scene's margins; shadows and glow overflow these bounds by default. The fixed `preserveAspectRatio="xMidYMid meet"` prevents nonuniform stretching. CSS `width: 100%; height: auto` scales it responsively without changing its shape; update numeric dimensions to change the proportions.

All six themes reuse the existing paint, gradients, shadows and outlined assets. Insets, stitching and bevels follow the new stadium; textures tile with constant-size cells, round studs redistribute around the perimeter, and ornaments remain upright and uniformly sized. Stud count is capped at 512 for extreme aspect ratios. Material colors and `--table-shadow` use the same tokens as `PokerTable`; custom filter lengths are explicit surface design units and are not multiplied by `detailScale`. The default shadows scale with the materials. There are no built-in mobile breakpoints, seat anchors or game state.

See [surface integration](table-surfaces.md) for practical examples, scaling details and migration guidance.

### PokerTable and TableAnchor

`PokerTable`: `layout: 2 | 6 | 8 | 9`, optional `theme: TableTheme` (default `classic`), `renderSeat`, `renderBet`, `renderMarker`, `community`, `pot`, HTML children/props, style and div ref.

Themes are `classic`, `midnight-racetrack`, `royal-burgundy`, `neon-night`, `emerald-art-deco` and `ocean-slate`. Classic uses the updated Penpot master. Every theme shares the same 1000 × 600 canvas and overlay geometry; `theme` never changes seats, bets, markers, community cards or the pot. Decorative lettering and symbols are outlined SVG paths, with no runtime fonts, images or external requests.

`TABLE_THEMES`, `TABLE_THEME_LABELS` and `TableTheme` are available from the root React entry, `/table`, `/poker` and `/core`. Invalid theme values throw a `RangeError` at runtime.

Material tokens replace the theme's default rail, inner rail, outline, felt or betting-line paint. `--table-shadow` overrides each shadowed layer's SVG filter, including Neon Night glow and Royal Burgundy stud shadows. Use `none` to remove these effects, or a CSS filter such as `drop-shadow(0 3px 6px rgba(0,0,0,.3))`. Lengths use table coordinate units and scale with the SVG. The token affects decorative artwork only; overlay card and chip shadows remain independently configurable.

Each render callback receives `{ index, angle, lateralSign, seat, bet, marker, normalized }`. Canonical points use the 1000 × 600 coordinate system; normalized points are in 0–1 space. The table is a labelled group, with its decorative SVG hidden from assistive technology. HTML controls in overlays remain interactive.

`community` occupies x=27%, y=40.3333%, width=46%, with proportional gaps. Five card children can each use width `18.26087%` of that region. `pot` uses the approved 500,212 anchor.

`TableAnchor` accepts `at: {x,y}` in normalized coordinates and ordinary div props. It centres its independently sized child at that point.

Framework-neutral exports include `RANKS`, `SUITS`, `COURT_STYLES`, `PIP_LAYOUTS`, `CARD`, `ACE_FRAMES`, `CHIP`, `MARKER`, `TABLE`, colour defaults, `getTableLayout`, `getMarkerPosition`, `normalizeTablePoint`, `formatChipValue`, `getChipPalette`, `chipInsertPath`, `getVisibleStack`, and associated types.

## Theme tokens

All card fronts, Jokers and backs have a CSS box shadow by default. `--card-shadow` replaces the complete shadow; use `none` to remove it. A direct `style.boxShadow` override takes precedence. Standard shadows use a 100px reference width; compact shadows use the selected preset's natural width. Numeric sizing props scale their offsets, blur and inset edge. For CSS-only sizing, choose an explicit shadow value. See the README for examples.

| Family       | CSS custom properties                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Card         | `--card-red`, `--card-black`, `--card-background`, `--card-shadow`, `--card-panel`, `--card-panel-stroke`, `--card-ace-spade-inline` |
| Classic back | `--back-classic-field`, `--back-classic-gold`, `--back-classic-ivory` (plus card background/shadow)                                  |
| Text         | `--chip-font` (chips and markers)                                                                                                    |
| Chips        | `--chip-shadow` (CSS filter value; applies independently to each chip)                                                               |
| Table        | `--table-rail`, `--table-inner-rail`, `--table-outline`, `--table-felt`, `--table-line`, `--table-shadow`                            |

CSS variables inherit through the document. All components accept `className`; no stylesheet is required by the library.

## Entry points

`feltforge` / `feltforge/react` expose all React components. Smaller entries are `feltforge/card`, `/compact-card`, `/card-back`, `/cards`, `/chips`, `/marker`, `/table`, `/poker`. `/core` has no React dependency and includes `COMPACT_CARD`, `COMPACT_PIP_BOUNDS` and `COMPACT_HERO_PAIR`. `/artwork` exports artwork types. `/courts/persian`, `/courts/western`, `/courts/eastern`, `/jokers/1`, `/jokers/2` expose independent artwork constants. `/assets/*` exposes the 31 optimized standalone SVG files. Compact cards compose shared suit geometry and outlined rank modules; they add no standalone full-card exports.

The output is ESM with declarations and preserved `use client` boundaries. In Next.js App Router, pass render callbacks from a client component; functions cannot cross a server/client serialization boundary. Core geometry can run in server code. Component and artwork props passed from server code must remain serializable.
