# Echo Core Documentation Site

This repository contains the documentation website for Echo Core, built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Project Structure

```
docs-site/
├── .crow/              # CI/CD workflow configurations
│   └── site.yaml       # Crow/Woodpecker CI configuration
├── site/               # Docusaurus documentation site
│   ├── docs/           # Documentation content
│   ├── src/            # Custom React components and pages
│   ├── static/         # Static assets
│   └── docusaurus.config.js  # Docusaurus configuration
└── README.md           # This file
```

## Prerequisites

- Node.js >= 20
- pnpm (enabled via corepack)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/echo-core/docs-site.git
   cd docs-site
   ```

2. Navigate to the site directory:
   ```bash
   cd site
   ```

3. Enable corepack (if not already enabled):
   ```bash
   corepack enable
   ```

4. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```

### Local Development

Start the development server (from the `site/` directory):
```bash
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Building

Generate static content for production (from the `site/` directory):
```bash
pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serving Built Site Locally

To test the production build locally (from the `site/` directory):
```bash
pnpm serve
```

## CI/CD Pipeline

This project uses Crow/Woodpecker CI for continuous integration and deployment. The workflow is defined in `.crow/site.yaml`.

### Workflow Overview

The CI/CD pipeline includes the following steps:

1. **Install Dependencies**: Installs npm packages using `pnpm install --frozen-lockfile`
2. **Build Site**: Builds the Docusaurus site using `pnpm build`
3. **Deploy Preview** (Pull Requests): Deploys preview builds to Surge for pull requests
4. **Deploy Production** (Main Branch): Deploys to GitHub Pages when changes are merged to main

### Preview Deployments

When you open a pull request, a preview deployment is automatically created and deployed to Surge. The preview URL follows the pattern:
```
https://echo-core-docs-site-pr-{PR_NUMBER}.surge.sh
```

The bot will comment on your pull request with the preview URL once the deployment is complete.

### Production Deployment

When changes are merged to the `main` branch, the site is automatically deployed to GitHub Pages.

### Required Secrets

The following secrets must be configured in your CI/CD environment:

- `SURGE_TOKEN`: Token for Surge deployments (preview deployments)
- `GITHUB_TOKEN_SURGE`: GitHub token for Surge bot comments
- `git_user`: GitHub username for deployment
- `git_pat_docs_site`: GitHub Personal Access Token for deployment

## Contributing

1. Create a new branch for your changes
2. Make your changes in the `site/` directory
3. Test locally using `pnpm start`
4. Build to verify no errors: `pnpm build`
5. Commit your changes and push to your branch
6. Open a pull request and review the preview deployment
7. Once approved, merge to main for production deployment

## Documentation

For more information about Docusaurus and how to customize this site, refer to:
- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Docusaurus Configuration](https://docusaurus.io/docs/configuration)
- [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features)

## License

This project is part of the Echo Core ecosystem.