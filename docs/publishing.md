# Publishing FeltForge

The [playground](https://saeedet.github.io/feltforge/) deploys to GitHub Pages after the checks on `main` pass. Pull requests run the checks without deploying. The playground is separate from the npm package.

The npm release workflow is based on Drift Rail's tagged release workflow. A pushed `vX.Y.Z` tag now starts it automatically; it can also be run manually against a tag. It checks that the tag matches the version in the root `package.json`, regenerates and verifies the assets, runs the workspace, visual, consumer and browser checks, assembles the public package, and publishes it to npm. A push to `main` alone never publishes a package.

Before the first automated release, configure npm trusted publishing for package `feltforge` with GitHub owner `saeedet`, repository `feltforge`, workflow file `publish.yml`, environment `npm`, and permission to run `npm publish`. The workflow uses GitHub's short-lived OIDC identity, so it does not need an npm token in GitHub secrets. npm requires the first successful trusted publish within two days of adding the publisher; if that window passes, renew the configuration before releasing. The GitHub `npm` environment must also exist.

For each release:

1. Update the root `package.json` version, `CHANGELOG.md`, and any version-specific public documentation. Keep the root workspace private; the release builder makes only `dist/package` public.
2. Commit and push the changes to `main`, then wait for CI and the playground deployment to pass.
3. Create and push the matching annotated tag, for example `git tag -a v0.1.1 -m "FeltForge 0.1.1"` and `git push origin v0.1.1`. This starts **Publish** automatically.
4. Check the Publish workflow, the npm version and dist-tag, and the package provenance. Add GitHub release notes for the tag.

The published version cannot be overwritten. If a release fails after publication, fix the cause and publish a new version. To rerun before publication, use **Run workflow** against the same tag. The original `v0.1.0` was published locally and remains unchanged.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for the current registry requirements.
