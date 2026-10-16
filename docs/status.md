# Implementation status

The latest published package is `feltforge@0.2.2`. It includes standard and compact cards, three court collections, two Jokers, chip shadows and rims, framework-independent geometry, React primitives and the hosted playground.

The 0.3.0 review candidate adds the refined Classic table and five new Penpot table themes, with outlined SVG lettering, unchanged overlay anchors, a playground theme picker/gallery and customization documentation. It awaits maintainer approval before merging and release.

Validation covers strict TypeScript contracts, 101 unit/SSR/visual tests, independent Classic and Royal Burgundy Penpot image comparisons, deterministic asset and table regeneration, package exports and bundle checks, and actual tarball React 18/Next.js consumers. Browser interaction checks run in GitHub Actions and retain review screenshots. The original 31-file standalone asset contract is unchanged.

The public repository is [saeedet/feltforge](https://github.com/saeedet/feltforge). See [npm](https://www.npmjs.com/package/feltforge), [the playground](https://saeedet.github.io/feltforge/) and [publishing](publishing.md). Default builds remain private; version tags run the trusted-publisher workflow after approval. Penpot is unchanged by the import.
