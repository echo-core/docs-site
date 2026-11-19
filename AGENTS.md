# Repository guide

Echols Home is a Docusaurus wiki. Work from a task branch and follow the local commands in [README.md](README.md).

## Where to work

- Put guides and category metadata in `site/docs/`. The sidebar in `site/sidebars.js` is generated from those folders.
- The homepage is `site/src/pages/index.js`. Its topic links come from the loaded docs and sidebar via `site/plugins/homepage-topics.js`.
- Shared styling lives in `site/src/css/custom.css`. Site navigation and footer links are configured in `site/docusaurus.config.js`.
- Keep existing route casing, published URLs, and heading anchors when editing the wiki. Check both color modes for theme changes.

## Verify changes

From `site/`, run `pnpm install --frozen-lockfile` and `pnpm build`. Use `pnpm serve` to check the built site. For visible changes, exercise the homepage and affected guide navigation on desktop and mobile.

Review the diff with `git diff --check`. The repository's hooks check formatting and Conventional Commits. For dependency changes, update `site/package.json` and `site/pnpm-lock.yaml` together.

Get explicit authorization before committing, pushing, or publishing. Crow configuration is in `.crow/site.yaml`. Running `pnpm deploy` publishes to GitHub Pages.
