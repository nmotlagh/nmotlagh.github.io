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

There is no blog collection. Structured page copy that isn't a content
collection lives in `src/data/editorial.ts` (homepage editorial content) and
`src/data/site.ts` (site metadata, FAQ, recruiter facts).

All frontmatter is validated against Zod schemas at build time. When adding content, match the existing schema structure.

### Routing & Pages

- **`src/pages/index.astro`** - Homepage, ordered for hiring: hero (01) and the short-version/skills panels (1.1, 1.2), selected work (2.1), live demo (2.2), publications (03), experience (04), contact (05)
- **`src/pages/about/`, `/publications/`, `/publications/[slug]`, `/artifacts/`, `/experience/`, `/news/`, `/faq/`** - Full pages with their own content (not redirects)
- **`src/pages/404.astro`** - Custom 404 page
- **`src/pages/rss.xml.js`** - RSS feed generation
- **`src/pages/{citations.bib,llms.txt,llms-full.txt,profile.json}.ts`** - Machine-readable endpoints

### Layout & Components

- **`BaseLayout.astro`** - Global shell: header with numbered nav tabs matching the homepage chapters (About 01, Work 02 → `/#work`, Research 03, Experience 04), Resume CTA, theme toggle, and a menu panel below 1000px; footer; metadata and structured data. Props: `noindex` for error pages, `overlayHeader` to float a transparent header over a full-bleed hero (homepage only)
- **`components/editorial/EditorialHero.astro`** - Homepage hero over `MeadowScene`: copy starts just below the scene's horizon line, plus the terminal line, FIG.0 caption, and the recruiter strip (availability, roles, locations, citizenship from `src/data/site.ts`; copy from `src/data/editorial.ts`)
- **`components/editorial/ShortVersion.astro`** - Recruiter panels under the hero: 1.1 the short version (status, roles, locations, work authorization, education, contact) and 1.2 skills with evidence links (`skillGroups` in `src/data/editorial.ts`)
- **`components/editorial/SelectedWork.astro`** - Case studies (`caseStudies`, `moreWork` in `src/data/editorial.ts`) with problem, what was built, stack, status and links; figures FIG.1–3 from `WorkFigure.astro`
- **`components/editorial/MeadowScene.astro`** - Generative meadow background (WebGL with 2D and static CSS fallbacks; logic in `src/lib/meadow*.ts`). Its horizon is the threshold line; if the horizon moves, update `--hero-hz` in `EditorialHero.astro`
- **`components/editorial/WorkFigure.astro`** - Line-art figures for the case studies (paired outcomes, the 2026 backbone re-test with real numbers, image swap)
- **`components/editorial/AbstainDemo.astro`** - Live selective-prediction demo (FIG.4; `index` and `fig` props); logic in `src/lib/abstain.ts` and `src/lib/abstain-plot.ts`, data in `src/data/abstain-demo.json`
- **`components/editorial/ContactRail.astro`** - Contact section with portrait (FIG.5), availability, profiles, and contact facts
- **`PublicationCard.astro`** - Publication card for the archive page
- **`CiteBlock.astro`** - BibTeX block with copy and download
- **`SectionHeading.astro`** - Section header: optional `index` (chapter number such as `2.3`), eyebrow, title, and a gray `dim` clause
- **`ThemeToggle.astro`** - Light/dark switcher with localStorage persistence

Styles: `src/styles/theme.css` (tokens, header, footer, buttons, labels) + `src/styles/editorial.css` (page layouts); component styles are scoped.

### Theming System

The site uses a dual-mode theme system implemented via CSS custom properties in `src/styles/theme.css`:

- Theme state is stored in `data-theme` attribute on `<html>` element (`"light"` or `"dark"`)
- Initial theme derived from `localStorage` or system preference (`prefers-color-scheme`)
- Script in `BaseLayout.astro` sets theme before first paint to prevent flash
- Two palettes: "night meadow" (dark: near-black green `#0a0d0b`, accent acid lime `#d4f25a`) and "dawn meadow" (light: pale sage `#eef1ea`, accent moss `#3b6516`)
- Lime is used sparingly: focus rings, the demo threshold, the terminal prompt, active-tab bars, and the Best Paper block (`--color-lime*` tokens, dark ink on lime in both themes)
- Type: Geist (`--font-sans`, also `--font-display`) and Geist Mono (`--font-mono`) from Google Fonts; mono uppercase labels (`.label`, `.eyebrow`, `.fig-label`)
- Surfaces are hairline panels with square corners (`.surface`, `.fig-panel`, `--hairline`)
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
- **Components/Layouts**: PascalCase (e.g., `EditorialHero.astro`, `BaseLayout.astro`)
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
