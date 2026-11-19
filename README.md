# Echols Home

[![Build status](https://ci.echols.co/api/v1/badges/4/status.svg)](https://ci.echols.co/repos/4)

[Echols Home](https://www.echols.co/) is a personal wiki for Linux, self-hosting, and home networking, built with [Docusaurus](https://docusaurus.io/).

## Run locally

Use Node.js 20 or later and pnpm. If you use Corepack, run `corepack enable` first.

```sh
git clone https://github.com/echo-core/docs-site.git
cd docs-site/site
pnpm install --frozen-lockfile
pnpm start
```

The development server prints its local URL and rebuilds as you edit. To check the production output, run these commands from `site/`.

```sh
pnpm build
pnpm serve
```

The production build is written to `site/build/`.

## Work on the site

| Path | What to edit |
| --- | --- |
| [`site/docs/`](site/docs/) | Wiki guides and category metadata |
| [`site/src/pages/`](site/src/pages/) | Homepage and standalone pages |
| [`site/src/css/custom.css`](site/src/css/custom.css) | Shared light and dark theme |
| [`site/docusaurus.config.js`](site/docusaurus.config.js) | Site settings and navigation |
| [`site/static/`](site/static/) | Public assets and the GitHub Pages domain |

Add guides as Markdown or MDX in the relevant docs folder. Docusaurus generates the sidebar, and the homepage cards pick up listed guides from their categories at build time.

Work on a branch, run the production build, and open a pull request. Check changed pages and navigation in the preview before merging. See [AGENTS.md](AGENTS.md) for verification and route conventions.

## CI and deployment

[Crow](.crow/site.yaml) checks and builds changes under `site/` or to the workflow. Pull requests with those changes use a Surge preview. The CI bot posts the preview URL when deployment succeeds.

```text
https://echo-core-docs-site-pr-{PR_NUMBER}.surge.sh
```

Pushes to `main` publish the production site to GitHub Pages. A manual CI run on `main` can also publish. The deployment uses the following CI secret names.

| Secret | Purpose |
| --- | --- |
| `SURGE_TOKEN` | Publish Surge previews |
| `GITHUB_TOKEN_SURGE` | Post preview links to GitHub |
| `git_user` | GitHub Pages deployment user |
| `git_pat_docs_site` | GitHub Pages deployment token |

## Docusaurus reference

- [Configuration](https://docusaurus.io/docs/configuration)
- [Markdown and MDX features](https://docusaurus.io/docs/markdown-features)
