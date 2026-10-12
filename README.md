# FeltForge

Open-source UI primitives for playing cards and poker interfaces.

**Early development: workspace tooling only. No UI components or production artwork
are available yet. This project is not ready for npm publication.**

The planned library includes composable playing cards, Persian/Western/Eastern court
artwork, two Jokers, a Classic back, generated chips and stacks, markers, and tables.
Cards will be usable independently of poker. Game rules, hand evaluation, networking,
and real-money logic are outside the project's scope.

## Local development

Use Node 24 (see `.node-version`) and pnpm 11.24.0.

```sh
pnpm install
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm dev
```

`pnpm check` runs formatting, lint, typecheck, semantic input tests, and workspace
builds. `pnpm test:e2e` checks the development shell, not visual fidelity. If the browser
download is unavailable, an installed Google Chrome can be used with
`PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`.

## Workspace

| Path              | Responsibility                                  | Current state                             |
| ----------------- | ----------------------------------------------- | ----------------------------------------- |
| `packages/core`   | Framework-independent types, data, and geometry | Semantic vocabulary and input guards only |
| `packages/assets` | Original exports and optimized vectors          | 31-asset contract; no exports yet         |
| `packages/react`  | Accessible SVG React primitives                 | Reserved package, no components           |
| `apps/playground` | Interactive component examples                  | Development status shell                  |
| `docs`            | Architecture, provenance, implementation status | Initial decisions and source requirements |

Workspace package names are private internal names, not a claim to an npm scope.
The final public package names and exports will be reviewed before publication.

## Design source

The locked Penpot system is authoritative. Implementation is waiting for its MCP
connection and file reference. Do not substitute invented artwork or infer the final
pip layout, palette, shell, typography, or stack geometry from approximate values.

See [implementation status](docs/status.md), [architecture](docs/architecture.md),
and [asset provenance](docs/asset-provenance.md).

## License

Original repository code is MIT licensed. No third-party artwork or font files are
currently included. Their provenance and redistribution terms must be verified
before assets are committed or distributed.
