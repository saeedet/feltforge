# 0.1.0 publication record

The owner approved the visual review and explicitly requested npm publication on 2026-10-13. The approved package is `feltforge@0.1.0`, a single ESM package with the entry points documented in [API](api.md). Internal workspaces remain private.

The implementation commit `41308c4` passed [Workspace CI](https://github.com/saeedet/feltforge/actions/runs/38410330384): 84 unit/SSR/visual tests, nine Chromium interaction tests, asset regeneration, strict type checking, build, npm dry run and actual-tarball React 18/Next.js consumers. The all-card effects and removal of card rings were included in that run.

`pnpm package:release` explicitly prepares the public manifest and local tarball while default builds retain their private guard. No automatic publication workflow is configured. The library excludes the playground's separately licensed React Bits component and Motion dependency.

Status: **published to npm on 2026-10-13** as [`feltforge@0.1.0`](https://www.npmjs.com/package/feltforge/v/0.1.0), public access, `latest` tag, under npm account `saeedet`. The registry integrity was verified against the exact prepared tarball.

Install with `npm install feltforge`.

Release preparation commit `c746c70` passed [Workspace CI](https://github.com/saeedet/feltforge/actions/runs/38411840690) before publication. npm account authentication was completed by the owner; no local browser control was used.

Prepared tarball: `feltforge-0.1.0.tgz` — 78 files, 4,791,677 packed bytes, 13,218,925 unpacked bytes. Registry integrity: `sha512-BA9Q77P8Qa6hVsZwo3AWxZKq7rmMCS7YkB9ZHldaQwehWLlOnTmZQpZ/39VEMv/PPWpbEJClDGc4vUe2RwaQEQ==`. Public-manifest tarball React 18 SSR/types and Next.js production/prerender checks passed.
