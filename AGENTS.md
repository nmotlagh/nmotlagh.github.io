# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` defines route entries, including nested routes and dynamic pages.
- `src/layouts/` and `src/components/` hold shared UI building blocks.
- `src/content/` stores content collections: `pages/`, `publications/`, `news/`, and `artifacts/`; schemas live in `src/content/config.ts`.
- `src/styles/` contains global theme styles; `src/assets/` holds images and SVGs.
- `public/` ships static files as-is (for example, `resume.pdf`, `favicon.svg`).
- `.github/workflows/deploy.yml` runs the GitHub Pages build and deploy.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the local dev server at `http://localhost:4321/`.
- `npm run build` generates the production `dist/` output.
- `npm run preview` serves the built site locally for final checks.

## Coding Style & Naming Conventions
- Use 2-space indentation and follow the existing formatting in `.astro`, `.ts`, and `.css` files.
- Component and layout files are PascalCase (for example, `Hero.astro`, `BaseLayout.astro`).
- Content filenames are kebab-case slugs (for example, `learning-when-to-say-i-dont-know.mdx`).
- Keep frontmatter aligned with collection schemas in `src/content/config.ts`.

## Testing Guidelines
- No automated test suite is configured.
- Validate changes by running `npm run build` and spot-checking pages with `npm run preview`.

## Commit & Pull Request Guidelines
- Commit messages are short and lowercase (for example, `updated resume`, `fixed`).
- PRs should include a concise summary, list content or visual changes, and add screenshots for UI updates.
- Link related issues when applicable and mention whether `npm run build` was run.

## Content & Deployment Notes
- Update the About and Experience content in `src/content/pages/`.
- Publications belong in `src/content/publications/` with validated frontmatter.
- Pushing to `main` triggers the GitHub Pages workflow and publishes `dist/`.
