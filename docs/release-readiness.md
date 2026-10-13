# FeltForge 0.1.0 release-readiness report

Prepared 2026-10-13. Historical readiness snapshot; see the [publication record](release-0.1.0.md) for subsequent owner approval and current release status. Public repository: [saeedet/feltforge](https://github.com/saeedet/feltforge). Local checkout: `/Users/et/Projects/feltforge`. This is an unpublished release candidate; no npm publication has occurred.

## 1. Repository architecture

The pnpm/Turborepo monorepo separates framework-independent geometry (`packages/core`), original and prepared vectors (`packages/assets`), accessible React composition (`packages/react`), and a Vite playground (`apps/playground`). `tooling/assets` owns deterministic preparation and visual comparisons; `tooling/package` assembles and verifies the public package. `docs/design` retains the read-only Penpot inspection, provenance and discrepancies.

TypeScript is strict. SVGs, rank outlines and geometry are separate from React. No game rules, hand evaluator, networking, authentication or server engine is included. Milestone commits preserve the implementation history.

## 2. Packages and entry points

Internal workspaces are private: `@feltforge/core`, `@feltforge/assets`, `@feltforge/react`, and `@feltforge/playground`. The publishing proposal is one ESM package, **`feltforge@0.1.0`**, with declarations, `sideEffects: false`, and optional React peer `^18.2.0 || ^19.0.0`. Core does not require React.

| Entry                                                            | Purpose                                       |
| ---------------------------------------------------------------- | --------------------------------------------- |
| `feltforge`, `feltforge/react`                                   | All React primitives                          |
| `feltforge/cards`, `/card`, `/card-back`                         | Card composition                              |
| `feltforge/poker`, `/chips`, `/marker`, `/table`                 | Poker visual primitives                       |
| `feltforge/core`                                                 | Types, constants, geometry and layout helpers |
| `feltforge/artwork`                                              | Artwork types                                 |
| `feltforge/courts/persian`, `/courts/western`, `/courts/eastern` | Independently imported court collections      |
| `feltforge/jokers/1`, `/jokers/2`                                | Independently imported Jokers                 |
| `feltforge/assets/*`                                             | The 31 standalone optimized SVGs              |
| `feltforge/package.json`                                         | Package metadata                              |

The assembled candidate in `dist/package` remains `private: true`. There is no publish workflow. CommonJS is not provided.

## 3. Public API and final architecture review

```tsx
import {
  Card,
  CardBack,
  Chip,
  ChipStack,
  PokerMarker,
  PokerTable,
} from 'feltforge';
import { western } from 'feltforge/courts/western';
import { joker1 } from 'feltforge/jokers/1';

<Card rank="7" suit="clubs" width={125} />;
<Card rank="K" suit="hearts" court={western} />;
<Card rank="joker" artwork={joker1} />;
<CardBack backStyle="classic" />;
<Chip value={250} label="250" color="#0C7A7C" />;
<ChipStack value={100} count={25} maxVisible={5} shadow={false} />;
<PokerMarker type="dealer" />;
<PokerTable
  layout={6}
  renderSeat={({ index }) => <button>Player {index + 1}</button>}
/>;
```

`TableAnchor` and `getTableLayout` support custom overlays. Mixed chip groups, custom colours, optional subtle stack shadow, refs, CSS variables, SVG/HTML props, accessible labels and decorative visuals are supported. Default visible stack cap is five, with a supported range of one to eight; the accessible label describes the real count and value.

The conceptual string-style API was deliberately refined to explicit artwork imports. `court={western}` avoids eagerly including a default court collection in every number-card consumer and preserves `style` for normal React CSS. J/Q/K require a court collection; Jokers require one of the two imported artworks and forbid suits. Number cards reject court props. Type fixtures verify these invalid states are rejected.

Final review found no need for providers, global registration, runtime SVG parsing, full-deck exports or game-state abstractions. Cards work independently of poker. Table geometry scales at 5:3 while HTML overlays retain independent sizes and normalized anchors. Next.js client boundaries are preserved; render callbacks belong in client components. Artwork objects are trusted build outputs, not a sanitizer for arbitrary SVG input. Full details: [API](api.md), [architecture](architecture.md).

## 4. Penpot assets exported

All **31** production standalone assets are present: four suits, thirteen ordinary ranks, nine court illustrations, two Joker illustrations, one Classic back, one custom Ace of Spades centrepiece, and one stacked Joker index. Eighteen come from original vector exports; twelve ordinary ranks plus the Joker index are generated from the exact approved font.

The locked Playing Cards file was inspected through Penpot. Source IDs, bounds and hashes are recorded. No Penpot edits were made. Chips, stacks, markers, tables, shells and full card fronts are generated in code; none are additional standalone assets.

## 5. Asset optimization results

The inputs total **26,713,321 bytes** and the optimized standalone vectors total **6,523,196 bytes**, a **75.58% reduction**. Normalization preserves intended frames, safely merges redundant paths, removes editor metadata and unnecessary wrappers, converts suitable colours to tokens/currentColor, and runs SVGO at five-decimal precision. No aggressive contour simplification is used.

The exact asset contract rejects unexpected files and raster/external content. Original exports remain separate and unchanged. See `packages/assets/optimization-report.json` for individual sizes and hashes. The owner confirmed MIT-compatible artwork redistribution rights on 2026-10-12; font inputs retain their OFL notices.

## 6. Rank-outline implementation

The exact Penpot Hanuman v24 Latin subsets for weights 400 and 700 are pinned with checksums. Their WOFF2 data was losslessly decoded to TrueType with fontTools 4.60.1. `opentype.js` extracts glyph contours at the approved coordinates, widths and baselines; the existing vector 10 bypasses font outlining. Repeated generation produces the same output and CI rejects drift.

The outlines retain intentional glyph overflow and the stacked bold Joker treatment. No font binary, runtime conversion or Hanuman loading is included in the distribution. See [rank outlining](design/rank-outlining.md).

## 7. Visual discrepancies versus Penpot

- The written nine-seat marker table differs from the locked formula by at most **0.090196 canonical pixels**. Implementation retains the approved 125px inward / 55px tangent formula and per-seat signs.
- Classic back exports have a 251 × 351 stroke-inclusive bound. Preparation crops to the approved 250 × 350 board while retaining the source.
- Outlined glyphs and Penpot PNGs have minor cross-renderer hinting/antialiasing differences. Mean alpha errors on a 0–255 scale are A **1.30**, 2 **0.64**, Joker index **2.52**. The exact font contours are used.
- The composed Seven of Hearts differs from its independent Penpot PNG by mean RGBA error **0.2671/255**, within the 0.5 regression threshold.
- Chip/marker live text uses Inter Tight 800 when supplied by the application and Arial/sans-serif otherwise. Fallback typography can differ from Penpot.

Stale Penpot text calling the approved additional assets “pending” and the face font “TBD” is documented without modifying the design. See [discrepancies](design/discrepancies.md).

## 8. Consumer bundle sizes

Minified ESM consumer fixtures, React external, measured by Vite:

| Fixture                  | Raw bytes | Gzip bytes |
| ------------------------ | --------: | ---------: |
| Number card              |    26,526 |      8,686 |
| Chip                     |     3,994 |      1,698 |
| Core table layout        |     2,357 |        998 |
| Western court collection | 1,894,368 |    722,657 |

Number-card and chip consumers exclude the large court, Joker and back modules. Detailed illustrations remain the dominant optional cost. Standalone SVGs and importable artwork modules are both included in the tarball to support both consumption modes. See [bundle measurements](bundle-report.json).

The playground later gained a [React Bits flip/drag preview](playground-motion.md). Its separately licensed application code and Motion dependency are excluded from the npm library; consumer bundle sizes above are unchanged. Four additional remote interaction tests cover this follow-up.

## 9. Test results

- Formatting, ESLint, strict typecheck and production builds pass.
- **84 Vitest tests pass**, covering geometry, invalid inputs, bounded stacks, SSR, semantics, SVG preparation and the composed-card PNG regression.
- TypeScript contract fixtures reject impossible card and stack combinations.
- **18** original-vector comparisons at 2× scale and **three** independent Penpot glyph PNG comparisons pass.
- **Four Chromium tests pass** in remote GitHub Actions: card selection and all court styles/52 cards, long chip-label fitting and caps, all four table layouts, mobile width and keyboard activation.
- Real tarball installation passes **React 18.3.1 SSR and declarations**, and **Next.js 16.4.0 / React 19.3.0 App Router production build and prerender**, including client callbacks and server-side core use. Each invocation installs into fresh generated fixtures to avoid stale tarball reuse.

Local browser control was not used after the owner revoked it. Screenshots produced by remote CI were reviewed as image files. Compatibility results are in [consumer measurements](consumer-report.json). This is not an exhaustive browser or assistive-technology certification.

## 10. CI status

The implementation passed [Workspace CI run 38323146528](https://github.com/saeedet/feltforge/actions/runs/38323146528) at commit `7903c56`, including all four browser checks. The final release-preparation commit also adds actual-tarball consumer validation to CI and pins official Node 24 actions. Consult [current workflow runs](https://github.com/saeedet/feltforge/actions/workflows/ci.yml) for the final commit's result.

CI verifies frozen dependency installation, deterministic asset regeneration, formatting/lint/types/tests/build, source visual comparisons, package and tree-shaking checks, actual-tarball consumers, Chromium interactions and screenshot upload. No publish action runs.

## 11. npm pack dry run

`pnpm package:check` succeeds. The candidate contains **78 files**, including exactly 31 standalone SVGs. The current packed and unpacked sizes are recorded below after the final build. The file audit excludes source exports, fonts, source maps, dependency folders and local credentials. `pnpm package:pack` creates a local `feltforge-0.1.0.tgz`; it does not publish.

Packed: **4,791,610 bytes**. Unpacked: **13,218,725 bytes**. Filename: `feltforge-0.1.0.tgz`. Both dry run and actual local packing succeeded.

## 12. Remaining warnings and limits

Detailed court collections are intentionally large. Vite reports their large chunks; the playground loads collections separately and ordinary card consumers do not include them. Vite also notes that `use client` directives are ignored in the browser-only playground bundle; they remain in the library and were verified with Next.js.

A complete table interface is recommended at **800px or wider**. At 500px the table remains recognizable but independently sized overlays can overlap; consumer applications should adapt or scroll their overlays. The library does not implement game rules or dictate that responsive product decision. ESM-only distribution and the trusted-artwork boundary are intentional.

No implementation blocker remains after the listed checks. npm name availability is not reserved. Actual publication still requires maintainer approval and deliberate removal of the private guard.

## 13. Visual review requested

Before approving npm publication, review Hanuman outlines (especially A and stacked Joker), all three detailed court collections, both Jokers, the Classic back, and live chip/marker typography with your application's font. Review table overlays at your supported widths; the 500px example is intentionally a stress case. Automated comparisons and inspected screenshots passed, but the owner has not yet supplied final visual sign-off.

## 14. Exact local commands

Use Node 22.12+ and pnpm 11.24.0. Run:

```sh
cd /Users/et/Projects/feltforge
pnpm install --frozen-lockfile
pnpm generate:ranks
pnpm prepare:assets
pnpm check
pnpm test:visual
pnpm package:check
pnpm package:pack
pnpm test:consumers
pnpm dev
```

`pnpm dev` starts the playground. Install `dist/package/feltforge-0.1.0.tgz` into a separate app to try the unpublished library. Consumer tests require registry access. Browser tests already run remotely in CI; no local browser use is required for the commands above. If you independently choose to run them locally, install Chromium with `pnpm exec playwright install chromium`, then run `pnpm test:e2e`.

## 15. Publication recommendation

**0.1.0 is an engineering-ready release candidate once the final commit's CI is green.** Build, tests, typecheck, visual regressions, consumer compatibility and npm dry run have passed. Recommended next step is owner visual sign-off and explicit approval of the single-package naming/exports above. npm publication is intentionally not performed or implicitly authorized by this report.
