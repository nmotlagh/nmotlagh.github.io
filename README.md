# nmotlagh.github.io

Modern Astro rebuild of my personal site with a hero-first homepage, dual-mode theming, and typed content collections.

## Getting started

```bash
npm install
npm run dev
```

- Dev server: `http://localhost:4321/`
- Static build: `npm run build`
- Preview the production build locally: `npm run preview`

## Project structure

- `src/pages/` – Astro page routes (homepage, legacy redirects, 404)
- `src/layouts/BaseLayout.astro` – Global chrome, theme toggle, and metadata
- `src/components/` – UI pieces (`Hero`, `SectionHeading`, `ThemeToggle`)
- `src/content/` – Zod-typed collections for long-form copy and publications
- `public/` – Static assets shipped verbatim (`resume.pdf`, `.nojekyll`, favicon)
- `.github/workflows/deploy.yml` – GitHub Pages workflow using `withastro/action`

## Content updates

- **About / Experience**: edit the MDX files in `src/content/pages/`
- **Publications**: add MDX files to `src/content/publications/` (frontmatter is validated)
- **Hero copy**: tweak props in `src/pages/index.astro`
- **Resume**: replace `public/resume.pdf`

## Deployment

Push to `main` and GitHub Actions will:

1. Install dependencies and run the Astro build (`withastro/action@v5`)
2. Publish the static `dist/` output to GitHub Pages via `actions/deploy-pages@v4`

GitHub Pages serves the `dist/` bundle. The repo includes:

- `public/.nojekyll` to keep the `_astro/` assets untouched
- `astro.config.mjs` with `site` configured for `https://nmotlagh.github.io`
- Redirect stubs (`/about`, `/experience`, `/publications`) so legacy links continue to work

## Tooling

- Astro 5 with MDX and sitemap integrations
- Prefetch enabled for snappy navigation
- Dual-mode theme tokens using OSU Scarlet (`#BA0C2F`) as the primary accent
