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

`Chip`: required `value`, optional `label`, `color`, `insertColor`, `labelColor`, `size` (64), common SVG props. Values must be finite, non-negative safe numbers. Multiples of 1,000 format as `1K`, `5K`, etc. Labels stay live text and shrink to the 34px design limit after measurement. Server rendering uses a conservative width for labels longer than three characters. Inter Tight 800 is the reference font; provide it in your app for closest typographic fidelity.

`ChipStack`: either `{ value, count }` or `{ chips: [{ value, count }, …] }`. Groups are ordered bottom to top. `maxVisible` accepts 1–8 (default 5) and preserves the topmost chips without allocating one element per real chip. `size` controls an individual chip; the stack's natural bounds expand by 3px right and 4px upward for each extra visible chip. Zero count draws no chip. `shadow` is optional and defaults to false. The accessible label reports actual count and total value, not the visible cap. Appearance overrides apply to all visible chips.

Colours are configurable defaults, not universal casino denominations.

## Markers

`PokerMarker`: `type: 'dealer' | 'small-blind' | 'big-blind'`, optional `size` (40), `accentColor` and SVG props. Labels are D, SB, BB. The canonical puck is 64 × 64, with a recommended minimum rendered size of 32. Placement is deliberately handled separately by the table/core geometry.

## Tables

`PokerTable`: `layout: 2 | 6 | 8 | 9`, optional `renderSeat`, `renderBet`, `renderMarker`, `community`, `pot`, HTML children/props, style and div ref.

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
| Table        | `--table-rail`, `--table-inner-rail`, `--table-outline`, `--table-felt`, `--table-line`                                              |

CSS variables inherit through the document. All components accept `className`; no stylesheet is required by the library.

## Entry points

`feltforge` / `feltforge/react` expose all React components. Smaller entries are `feltforge/card`, `/compact-card`, `/card-back`, `/cards`, `/chips`, `/marker`, `/table`, `/poker`. `/core` has no React dependency and includes `COMPACT_CARD`, `COMPACT_PIP_BOUNDS` and `COMPACT_HERO_PAIR`. `/artwork` exports artwork types. `/courts/persian`, `/courts/western`, `/courts/eastern`, `/jokers/1`, `/jokers/2` expose independent artwork constants. `/assets/*` exposes the 31 optimized standalone SVG files. Compact cards compose shared suit geometry and outlined rank modules; they add no standalone full-card exports.

The output is ESM with declarations and preserved `use client` boundaries. In Next.js App Router, pass render callbacks from a client component; functions cannot cross a server/client serialization boundary. Core geometry can run in server code. Component and artwork props passed from server code must remain serializable.
