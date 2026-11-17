# Open Source Showcase UI

The handwritten notebook frontend for `opensource-showcase`.

Developer GitHub details appear in a left column, with merged open source contributions in the main column. Cream and Classic themes share the same ruled paper, margins, handwriting, and ink colors. Profiles stack above contributions on smaller screens.

## Development

```sh
npm ci
npm run dev
```

Open `/notebook.html`. Preview data lives in `public/contributions.json`.

## Build verification

```sh
npm run build
```

The build emits `dist/showcase-ui.js`. The bundle contains its CSS and Patrick Hand font so generated GitHub Pages sites need no separate font setup. The font license is included at `dist/fonts/OFL.txt`.

The host page supplies a `root` element and either `window.__SHOWCASE_DATA__` or a sibling `contributions.json` file.

## Releases through GitHub Actions

Push changes to `main` to run `.github/workflows/publish.yml`, or select **Run workflow** in GitHub Actions. The workflow installs dependencies, builds, bumps the patch version when needed, publishes to npm, and purges the jsDelivr major-version URL. Do not publish local archives manually.

The CLI's generated pages use `opensource-showcase-ui@1`, so subsequent UI releases in version 1 reach those pages through the CDN without another CLI release. Previously generated pages pinned to an exact UI version need to be regenerated once to use this URL.

CLI changes are released by the `opensource-showcase` repository's own publish workflow. Each publishing job uses the protected `npm-production` environment and passes the `NPM_TOKEN` GitHub Actions secret to npm. The token must be valid, have write access to the corresponding package, and satisfy its npm publishing policy. A matching OIDC Trusted Publisher can also authorize publishing.
