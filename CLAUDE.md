# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:4321/
npm run build            # Build production site to dist/
npm run preview          # Serve production build locally
```

## Architecture Overview

This is an Astro 5 static site for a personal academic portfolio deployed to GitHub Pages.

### Content Collections System

The site uses Astro's typed content collections defined in `src/content/config.ts`:

- **`pages/`** - MDX files for About and Experience sections with structured frontmatter for timeline items
- **`publications/`** - Research papers with rich metadata (authors, venue, year, DOI, links to PDF/arXiv/code/data)
- **`news/`** - Data-only collection for recent updates (title, date, optional link)
- **`artifacts/`** - Data-only collection for code repositories with reproduction steps

All frontmatter is validated against Zod schemas at build time. When adding content, match the existing schema structure.

### Routing & Pages

- **`src/pages/index.astro`** - Homepage with hero, publications, news, and artifacts sections
- **`src/pages/about/`, `/experience/`, `/publications/`, etc.** - Legacy redirect stubs to preserve old URLs
- **`src/pages/404.astro`** - Custom 404 page
- **`src/pages/rss.xml.js`** - RSS feed generation
- **`src/pages/_index.astro.full`** - Archived full homepage variant

### Layout & Components

- **`BaseLayout.astro`** - Global shell with theme toggle, metadata, structured data, and CSS custom properties for theming
- **`Hero.astro`** - Homepage hero with animated interactive water background (Canvas-based)
- **`PublicationCard.astro`** - Displays publication with links, highlights, and optional image
- **`NewsStrip.astro`** - Renders news items chronologically
- **`HighlightsRow.astro`** - Grid of highlighted publications
- **`SectionHeading.astro`** - Consistent section headers
- **`ThemeToggle.astro`** - Light/dark mode switcher with localStorage persistence and theme transition

### Theming System

The site uses a dual-mode theme system implemented via CSS custom properties in `src/styles/theme.css`:

- Theme state is stored in `data-theme` attribute on `<html>` element (`"light"` or `"dark"`)
- Initial theme derived from `localStorage` or system preference (`prefers-color-scheme`)
- Script in `BaseLayout.astro` sets theme before first paint to prevent flash
- Primary accent color: OSU Scarlet (`#BA0C2F`)
- All theme-dependent colors defined as CSS custom properties that update based on `data-theme`

When adding new UI elements, use existing CSS custom property tokens rather than hardcoded colors.

### Static Assets

Files in `public/` are served as-is:

- `resume.pdf` - CV linked from nav and structured data
- `favicon.svg` - Site icon
- `.nojekyll` - Tells GitHub Pages to preserve `_astro/` build directory

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`:

1. `npm ci` installs dependencies
2. `npm run build` generates static `dist/`
3. `actions/upload-pages-artifact` and `actions/deploy-pages` publish to GitHub Pages

The site is configured for `https://nmotlagh.github.io` in `astro.config.mjs`.

## Code Style

- **Indentation**: 2 spaces
- **Components/Layouts**: PascalCase (e.g., `Hero.astro`, `BaseLayout.astro`)
- **Content files**: kebab-case slugs (e.g., `learning-when-to-say-i-dont-know.mdx`)
- **Commit messages**: Short, lowercase (e.g., `add interactive water landing`, `refresh palette and layout`)

## UI Implementation Guidelines

When modifying or creating UI components, follow the principles from `AGENTS.md`:

- Full keyboard navigation and visible focus states (`:focus-visible`)
- Touch targets ≥24px (≥44px on mobile)
- Animate only `transform` and `opacity` (compositor-friendly)
- Honor `prefers-reduced-motion`
- Use semantic HTML before ARIA
- Ensure text handles long content with `truncate` or `line-clamp-*`
- Accessible color contrast (prefer APCA over WCAG 2)
- Mobile inputs ≥16px font size to prevent iOS zoom
- Ellipsis character `…` not `...`
- Locale-aware formatting with `Intl` APIs
- No `transition: all` - list properties explicitly
