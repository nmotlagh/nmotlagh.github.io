# nmotlagh.github.io

Personal research and engineering website built with Astro, MDX, and typed content collections.

## Development and validation

Use Node 24 (Astro 7 needs 22.12 or newer) and the checked-in lockfile:

```bash
npm ci
npm run dev
```

The development server runs at `http://localhost:4321/`. Before publishing:

```bash
npx astro check
npm audit --audit-level=critical
npm run build
npm run preview
```

Inspect the production preview on mobile and desktop, in light and dark themes. Check navigation, keyboard focus, the theme toggle, publication links, and the resume download.

## Content map

- `src/data/site.ts`: shared identity, role interests, location preferences, profile links, and FAQ. Update the review date when reviewing this copy.
- `src/data/editorial.ts`: homepage introduction, concise research summaries, and toolkit.
- `src/content/pages/`: biography, experience, education, and service.
- `src/content/publications/`: paper metadata and detail pages. Unpublished work uses `citation.type: unpublished` and is kept separate from peer-reviewed publications.
- `src/content/artifacts/`: public code and data links.
- `src/content/news/`: dated historical updates, available through the news archive and RSS.
- `src/layouts/BaseLayout.astro`: navigation, footer, and shared metadata.
- `src/styles/`: responsive layout and light/dark theme tokens.

The profile JSON, JSON-LD, text summaries, publication Markdown, BibTeX, RSS, and sitemap are generated from these sources. Their routes remain available without adding technical links to the main navigation.

## Public assets

`public/resume.pdf` is the selected public one-page resume. Application variants are maintained separately in the private job-search workspace. The September 2026 website refresh retained the current public variant, updated the DCS title, moved current employment first, and removed unverified audit/result claims. It did not change the private application variants. Review those sources before replacing the public PDF; an older generated resume can reintroduce stale copy.

`src/assets/social-card.svg` is the editable source for the social preview. After changing it, regenerate the static PNG with the Sharp installation supplied by Astro:

```bash
node --input-type=module -e 'import sharp from "sharp"; await sharp("src/assets/social-card.svg").png().toFile("public/og-card.png");'
```

Keep public research descriptions tied to published evidence. Describe unpublished work as unpublished; add preprint links and detailed results when an appropriate public source is available. Application plans, interview details, private audits, and employer-specific research details do not belong in this repository.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies, runs the type check and security audit, builds `dist/`, and deploys it to GitHub Pages. Local builds and previews do not publish the site.

The canonical URL is `https://nmotlagh.github.io`. Keep this GitHub Pages deployment path.
