# Contributing

Use the Node and pnpm versions pinned in the repository. Run `pnpm install`, then
`pnpm check`. After building, install browsers with `pnpm exec playwright install
chromium webkit` and run `pnpm test:e2e`.

Keep the core free of React. Preserve separate original and generated assets.
Approved Penpot visuals must not be redesigned to accommodate implementation.
Record any discrepancy and its source reference before changing a visual decision.

Add meaningful tests for changed behavior and representative visual comparisons
for changed visuals. Avoid generated full-front-card decks, game engines,
large global CSS dependencies, and eager imports of every artwork style.

Never commit tokens, local configuration, runtime rank fonts, or temporary exports.
Do not publish to npm without explicit maintainer approval.

After asset changes, run `pnpm generate:ranks`, `pnpm prepare:assets`, and `pnpm test:visual`. Generated modules are committed; CI detects regeneration drift. Run `pnpm package:check` after a successful build. `pnpm package:pack && pnpm test:consumers` installs the actual tarball into isolated React 18 and Next.js build fixtures (requires network access).

After table design changes, capture the current component masters and outline decorative lettering before updating the sources. Run `pnpm generate:tables` to reproduce the typed skins. Keep font files and live text out of table artwork, preserve overlay anchors and verify all six themes. See [table preparation](docs/design/table-themes.md).

Default builds remain private. Only after explicit maintainer approval, `pnpm package:release` prepares a public manifest and validated tarball. Publication is a separate action and is never part of `build`, `check`, `package:pack` or `package:release`.
