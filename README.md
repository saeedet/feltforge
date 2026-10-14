# FeltForge

![FeltForge playground showing a six-seat poker table with community cards, chips, and markers](https://raw.githubusercontent.com/saeedet/feltforge/main/docs/images/feltforge-playground-table.png)

Composable, accessible React primitives for playing cards and poker interfaces. Standard and compact mobile cards, three court collections, two Jokers, customizable card shadows, crisp chips and proportionally scaled tables, built from a Penpot design system.

**[Try the playground](https://saeedet.github.io/feltforge/)** · [Source and release notes](https://github.com/saeedet/feltforge). No game rules, betting engine, network service or real-money logic are included.

## Install

```sh
npm install feltforge
```

Import only the artwork collections you need; number cards, chips and core geometry work independently.

## Run the playground

Requires Node 22.12+ and the pinned pnpm version (`pnpm@11.24.0`).

```sh
git clone https://github.com/saeedet/feltforge.git
cd feltforge
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

The playground lets you explore all 52 ordinary cards, court collections, Jokers, backs, custom chips, bounded stacks, markers and 2/6/8/9-seat layouts. In the Cards tab, the “Give it a spin” preview supports click flips, drag/flick rotation, hover tilt and keyboard controls, with reduced-motion support.

The [hosted playground](https://saeedet.github.io/feltforge/) is deployed from `main` after CI passes. Its source stays in `apps/playground` and is not included in the npm package.

## Build a package locally

```sh
pnpm check
pnpm package:check
pnpm package:pack
# In a consumer app, install the resulting dist/package/feltforge-<version>.tgz.
```

React 18.2+ or 19 is a peer dependency. The framework-independent `feltforge/core` entry can be used without React. The package is ESM, includes TypeScript declarations and requires no CSS framework.

```tsx
import { Card, CardBack, Chip, ChipStack, PokerMarker } from 'feltforge';
import { western } from 'feltforge/courts/western';
import { joker1 } from 'feltforge/jokers/1';

<Card rank="7" suit="clubs" width={125} />;
<Card rank="K" suit="hearts" court={western} width={125} />;
<Card rank="joker" artwork={joker1} width={125} />;
<CardBack width={125} />;
<Chip value={25} />;
<Chip value={250} label="250" color="#0C7A7C" />;
<ChipStack value={100} count={25} maxVisible={5} />;
<PokerMarker type="dealer" />;
```

Court artwork is **explicitly imported**. Number cards and Aces do not pull any court, Joker or back artwork into their bundle. `court={persian}`, `court={western}` and `court={eastern}` select the corresponding collection; Persian is the playground's default. The explicit object replaces a global default style to keep artwork loading predictable. `style` remains ordinary React CSS. Jokers have no suit; number cards reject court props at compile time.

Card ranks are vector artwork. Chips and markers use live text; applications can set `--chip-font` to match their interface.

## Compact cards

Use compact cards for mobile tables and small boards. They show a bold rank, a small suit below it, and a large suit at the bottom right. All 52 ordinary cards are supported, including J, Q and K without a court collection import. Ranks and suits are vector paths; no font files or runtime font dependency are included.

```tsx
import { Card } from 'feltforge';

<Card variant="compact" rank="10" suit="clubs" />;
<Card variant="compact" size="hero" rank="K" suit="spades" />;
```

| Size                  | Dimensions | Use                                                           |
| --------------------- | ---------- | ------------------------------------------------------------- |
| `community` (default) | 38 × 53    | Community cards; use a 7px gap                                |
| `hero`                | 50 × 70    | Player hands; pairs use a 13px overlap and −7° / +3° rotation |

These are two distinct layouts. Numeric `width` or `height` scales the selected layout proportionally. Compact cards have no pip layouts, court illustrations, decorative Ace or bottom index. Jokers and the Classic back retain their standard design. The focused `feltforge/compact-card` entry exports `CompactCard` with the same rank, suit and size props.

## Card shadows

Standard cards, compact cards, Jokers and card backs use a box shadow instead of the old outer border. The shadow combines two soft black layers with a subtle white inset edge. At a 100px standard card width, or either compact preset's natural size, the default is:

```css
box-shadow:
  0 1px 1px rgba(0, 0, 0, 0.25),
  0 2px 8px rgba(0, 0, 0, 0.25),
  inset 0 0 0 1px rgba(255, 255, 255, 0.1);
```

Shadow lengths scale with numeric `width` or `height` props. Override a single card with `style`, or set the inherited `--card-shadow` property for a group. The override replaces the complete shadow, including the inset edge.

```tsx
<Card rank="7" suit="hearts" style={{ boxShadow: 'none' }} />;
<CardBack style={{ '--card-shadow': '0 4px 12px rgba(0, 0, 0, .2)' }} />;
<Card
  variant="compact"
  rank="Q"
  suit="hearts"
  style={{ '--card-shadow': 'none' }}
/>;
```

```css
.my-table {
  --card-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
```

For sizing driven entirely by application CSS, use a shadow value suited to that layout. The standard card's inner panel and the back's decorative frame retain their design strokes. The retired `--card-border` token no longer controls the outer edge.

## Tables and overlays

```tsx
import { PokerTable, ChipStack, PokerMarker } from 'feltforge';

<PokerTable
  layout={6}
  renderSeat={({ index }) => <button>Player {index + 1}</button>}
  renderBet={() => <ChipStack value={25} count={3} size={40} />}
  renderMarker={({ index }) =>
    index === 0 ? <PokerMarker type="dealer" /> : null
  }
  pot={<strong>Pot: 750</strong>}
/>;
```

The table retains a 5:3 aspect ratio. Seat, bet, marker and pot overlays use normalized anchors and retain their own dimensions. `TableAnchor` supports custom overlays; `getTableLayout()` exposes the same geometry independently of React. Seat 0 is bottom centre, then clockwise. Markers use the approved 125px inward / 55px tangent formula and stored signs.

800px or wider is recommended for a complete table interface. Narrow applications should adapt or scroll their overlays; the library does not shrink an entire interface as one SVG scene.

## Accessibility and theming

Visuals have meaningful default accessible labels, accept `aria-label` overrides, and support `decorative`. Interactive examples use native buttons around cards so keyboard activation and focus work naturally. Table overlays remain accessible HTML.

```tsx
<button type="button" aria-label="Choose seven of hearts">
  <Card rank="7" suit="hearts" decorative width={100} />
</button>;

<Card
  rank="A"
  suit="spades"
  style={{ '--card-background': '#ffffff', '--card-black': '#17251d' }}
/>;
```

See [API and theme tokens](https://github.com/saeedet/feltforge/blob/main/docs/api.md), [architecture](https://github.com/saeedet/feltforge/blob/main/docs/architecture.md), and [design discrepancies](https://github.com/saeedet/feltforge/blob/main/docs/design/discrepancies.md).

## Development and validation

```sh
pnpm generate:ranks       # Check pinned fonts and reproduce outline paths
pnpm prepare:assets      # Validate, normalize, optimize and generate modules
pnpm check               # Format, lint, type contracts, unit tests and build
pnpm test:visual         # Compare SVG assets with authoritative sources
pnpm package:check       # Inspect exports, consumer bundles and npm dry run
pnpm package:pack        # Create a local tarball; does not publish
pnpm test:consumers      # Install tarball into fresh React 18 / Next.js fixtures
pnpm test:e2e            # Playwright interaction checks; install Chromium first
```

CI runs the workspace and browser checks and retains screenshots. Asset references and checksums are committed; generated output is reproducible. The 31-file standalone asset contract excludes full-deck exports, static chips and static tables. Large court illustrations remain detailed vector artwork: import only the collections you need.

For releases, see [publishing](https://github.com/saeedet/feltforge/blob/main/docs/publishing.md). A matching `vX.Y.Z` tag runs the release checks and publishes that version to npm through a trusted GitHub Actions publisher.

See the [0.1.0 release-readiness report](https://github.com/saeedet/feltforge/blob/main/docs/release-readiness.md) for measurements, validation, known limits and the final package exports.

## License

MIT for FeltForge library code and artwork.

The court, Joker, and card-back artwork included in FeltForge is original artwork created for this project and is distributed under the MIT License.

The playground's adapted React Bits FlipCard retains its separate [MIT + Commons Clause notice](https://github.com/saeedet/feltforge/blob/main/apps/playground/src/components/react-bits/LICENSE.md); it and Motion are excluded from the npm library.
