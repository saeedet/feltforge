# FeltForge

Composable, accessible React primitives for playing cards and poker interfaces. Three court collections, two Jokers, crisp chips and proportionally scaled tables, built from a locked Penpot design system.

**0.1.0 release candidate — not published to npm.** The repository is public; publication requires maintainer approval. No game rules, betting engine, network service or real-money logic are included.

## Run the playground

Requires Node 22.12+ and the pinned pnpm version (`pnpm@11.24.0`).

```sh
git clone https://github.com/saeedet/feltforge.git
cd feltforge
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

The playground lets you explore all 52 ordinary cards, court collections, Jokers, backs, custom chips, bounded stacks, markers and 2/6/8/9-seat layouts.

## Use the release candidate

```sh
pnpm check
pnpm package:check
pnpm package:pack
# In a consumer app, install the resulting dist/package/feltforge-0.1.0.tgz.
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

All card ranks are outlined SVG paths. There is **no runtime Hanuman font dependency**. Chips and markers retain live text, prefer Inter Tight 800 and fall back to Arial/sans-serif; applications can load Inter Tight themselves or set `--chip-font`.

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

See the [0.1.0 release-readiness report](https://github.com/saeedet/feltforge/blob/main/docs/release-readiness.md) for measurements, validation, known limits and the final package exports.

## License

MIT for code and approved artwork. The project owner confirmed compatible redistribution rights. Hanuman build inputs retain SIL OFL 1.1 notices; only derived outlines are included in the candidate package. See [provenance](https://github.com/saeedet/feltforge/blob/main/docs/design/asset-provenance.md).
