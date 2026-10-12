# Contributing

Use the Node and pnpm versions pinned in the repository. Run `pnpm install`, then
`pnpm check`. After building, install Chromium with `pnpm exec playwright install
chromium` and run `pnpm test:e2e`.

Keep the core free of React. Preserve separate original and generated assets.
Approved Penpot visuals must not be redesigned to accommodate implementation.
Record any discrepancy and its source reference before changing a visual decision.

Add meaningful tests for changed behavior and representative visual comparisons
when assets become available. Avoid generated full-front-card decks, game engines,
large global CSS dependencies, and eager imports of every artwork style.

Never commit tokens, local configuration, runtime rank fonts, or temporary exports.
Do not publish to npm without explicit maintainer approval.
