# Performance & Code Quality Audit

**Date:** 2026-03-28
**Site:** nmotlagh.github.io
**Framework:** Astro 5.16.0 (static output)

---

## Executive Summary

The site is **exceptionally lean** for a personal academic portfolio. Total build output is **412 KB** across 22 files, with only **2.2 KB of client JS** (gzipped: 1.01 KB) plus the Plausible analytics external script. Zero framework hydration. Build completes in **1.16 seconds** with no errors and one benign Vite warning.

The main areas for improvement are: a suboptimal font loading waterfall, dead CSS/code that should be cleaned up, and a few broken inline scripts.

---

## 1. Bundle Size & Client-Side JS

### Build Output

| Asset | Size | Gzipped |
|-------|------|---------|
| `page.B1D-nYk3.js` | 2.2 KB | 1.01 KB |
| `index.DGgZ5vOq.css` | 19 KB | ~4 KB |
| `headshot.BfbPjs-V.jpg` | 91 KB | n/a |
| `headshot.BfbPjs-V_147pXy.webp` | 1.6 KB | n/a |
| HTML pages (12 total) | ~170 KB total | — |
| `resume.pdf` | 121 KB | n/a |
| **Total `dist/`** | **412 KB** | — |

**Verdict: Excellent.** The single JS file (`page.B1D-nYk3.js`) is Astro's prefetch module, injected by `prefetch: { prefetchAll: true }` in config. No React, Vue, or other framework JS is shipped.

### Inline Scripts (~2.4 KB total, unminified)

| Script | Location | Purpose | Necessary? |
|--------|----------|---------|------------|
| Theme init IIFE | `BaseLayout.astro:82-141` (~60 lines) | Prevents theme FOUC | Yes, must be synchronous |
| ThemeToggle handler | `ThemeToggle.astro:21-57` (~37 lines) | Click toggle + MutationObserver | Yes |
| Analytics event wiring | `BaseLayout.astro:225-233` (~9 lines) | Plausible custom events | Yes |
| Redirect scripts | `about/index.astro:24-26`, `experience/index.astro:24-26` | JS redirect | **Broken** (see Finding 1) |

### External Scripts

- **Plausible** (`plausible.io/js/script.js`): loaded `defer`, ~1 KB. Reasonable for analytics.

---

## 2. Images

### Inventory

| File | Format | Size | Max Render Size | Assessment |
|------|--------|------|-----------------|------------|
| `src/assets/headshot.jpg` | JPEG | 91 KB | 360px (Hero), 140px (sidebar) | Source is 1200x1176 -- oversized by 3x |
| `src/assets/background.svg` | SVG | 1.5 KB | — | **Unused** -- not imported anywhere |
| `src/assets/astro.svg` | SVG | 2.9 KB | — | **Unused** -- not imported anywhere |
| `public/favicon.svg` | SVG | 749 B | — | Fine |

### Image Optimization

- Astro's `<Image>` component is used correctly in both places (sidebar and hero). No raw `<img>` tags.
- Hero uses responsive `widths={[220, 280, 360]}` with `sizes` attribute.
- Astro generates a WebP variant (1.6 KB) at build time.

**Recommendation:** Downsize `headshot.jpg` source to ~500px wide. The current 1200px source is only needed to generate 360px variants -- a smaller source would reduce build-time processing and the fallback JPG size (91 KB in `dist/`).

---

## 3. Astro Best Practices

### Client Directives

**Zero `client:load`, `client:idle`, `client:visible`, or `client:only` directives found.** This is ideal -- the site is fully static with no hydrated components.

### Prefetching

`astro.config.mjs` enables `prefetch: { prefetchAll: true }`. This adds the 2.2 KB prefetch module that eagerly prefetches all internal links on hover/viewport. Appropriate for a small site with few pages.

### Content Collections

Collections are well-structured with Zod validation. Minor issues:

- **Dates as strings:** `news.date` and `blog.date` use `z.string()` instead of `z.coerce.date()`. This skips build-time date validation and requires manual `new Date()` conversions in 5 places (`NewsStrip.astro`, `news/index.astro`, `rss.xml.js`, `blog/index.astro`, `blog/[slug].astro`).
- **Missing explicit `type` declarations:** `publications` and `pages` collections don't specify `type: 'content'` explicitly (Astro infers it), while `news` and `artifacts` do specify `type: 'data'`.

---

## 4. CSS Efficiency

### Overview

- **Single global stylesheet:** `theme.css` (~850 lines) -> bundled to 19 KB (`index.DGgZ5vOq.css`)
- **5 scoped `<style>` blocks** in components (PublicationCard, NewsStrip, HighlightsRow, blog/index, blog/[slug])

### Dead/Duplicate CSS

**Duplicated between `theme.css` and scoped component styles:**

| Selector | In `theme.css` | In Component | Winner |
|----------|----------------|--------------|--------|
| `.publication-card` + children | Lines 614-640 | `PublicationCard.astro` (55 lines) | Component (scoped wins) |
| `.news-strip` + children | Lines 700-731 | `NewsStrip.astro` (72 lines) | Component (scoped wins) |
| `.highlight-card` + children | Lines 740-766 | `HighlightsRow.astro` (132 lines) | Component (scoped wins) |

The `theme.css` definitions for these selectors are dead code (~100 lines).

**Unused CSS classes in `theme.css`:**

The `.hero`, `.hero__content`, `.hero__heading`, `.hero__subheading`, `.hero__actions`, `.hero__links`, `.hero__link`, `.hero__meta`, `.hero__profile`, `.hero__media`, `.hero__image-frame`, `.hero__image`, `.hero__stats`, `.hero__stat` classes (~30 lines) correspond to the unused `Hero.astro` component. Dead code.

**Missing CSS class definitions:**

Several classes are used in HTML but have no corresponding CSS definitions anywhere:

- `surface`, `surface--muted` (used in `404.astro`)
- `stack` (used in `404.astro`, `about/index.astro`, `experience/index.astro`, `Hero.astro`)
- `section-heading`, `section-heading__eyebrow`, `section-heading__title`, `section-heading__description` (used in `SectionHeading.astro`)
- `publication-grid` (used in `publications/index.astro`)
- `news-archive` (used in `news/index.astro`)
- `artifact-grid`, `artifact-card`, `artifact-card__header`, `artifact-card__ties` (used in `artifacts/index.astro`)
- `publication-detail` and children (used in `publications/[slug].astro`)

These elements rely solely on inherited/browser-default styles.

### `transition: all` Violations

CLAUDE.md states: "No `transition: all` - list properties explicitly." Found **9 instances** violating this:

- `theme.css` lines: 222, 255, 288, 450, 489, 572, 683, 745
- `HighlightsRow.astro` line 114

### Font Loading

The Google Fonts `@import` in `theme.css` line 1 creates a render-blocking waterfall:

```
HTML download -> CSS download -> @import discovered -> Font CSS download -> Font file download
```

The `<link rel="preconnect">` tags in the `<head>` are partially wasted because the connection is already initiated by the CSS file download. Moving the font to a `<link rel="stylesheet">` in `<head>` (or self-hosting Inter) would eliminate one round trip.

---

## 5. Build Output

### Build Results

```
Build time: 1.16s
Pages: 12
Images: 1 (optimized, cache reused)
Errors: 0
Warnings: 1 (benign Vite tree-shaking warning about @astrojs/internal-helpers)
```

### Warning Detail

```
[WARN] [vite] "matchHostname", "matchPathname", "matchPort" and "matchProtocol" are imported
from external module "@astrojs/internal-helpers/remote" but never used
```

This is an upstream Astro issue -- not actionable. Harmless.

---

## 6. Dependency Health

### Current State

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| `astro` | 5.16.0 | 6.1.1 | **Major version behind** |
| `@astrojs/mdx` | 4.3.12 | 5.0.3 | **Major version behind** |
| `@astrojs/rss` | 4.0.14 | 4.0.18 | Patch behind |
| `@astrojs/sitemap` | 3.6.0 | 3.7.2 | Minor behind |
| `@astrojs/check` | 0.9.6 | 0.9.8 | Patch behind |
| `typescript` | 5.9.3 | 6.0.2 | **Major version behind** |

**Astro 6 and MDX 5** are major upgrades that may require migration work. Not urgent, but worth planning.

### Dependency Count

**4 runtime + 3 dev = 7 total dependencies.** This is outstanding for a personal site. No unnecessary packages.

### Overrides

```json
"js-yaml": "^4.1.1"
```

Security fix for a transitive dependency. Should be periodically checked for whether the upstream has resolved the issue.

---

## 7. Caching & Headers

### Hashed Assets

Astro generates content-hashed filenames for all assets in `_astro/`:

```
page.B1D-nYk3.js
index.DGgZ5vOq.css
headshot.BfbPjs-V.jpg
headshot.BfbPjs-V_147pXy.webp
```

These are safe for immutable caching (`Cache-Control: max-age=31536000, immutable`).

### GitHub Pages Limitations

GitHub Pages serves all files with `Cache-Control: max-age=600` (10 minutes) regardless of path. There is **no way to set custom cache headers on GitHub Pages**. The hashed filenames still ensure cache-busting on deploys, but browsers will re-validate every 10 minutes instead of caching immutably.

**If caching matters:** Consider Cloudflare Pages or Netlify, which allow custom cache headers for `_astro/*` assets.

### Missing Optimizations

- No `_headers` file (GitHub Pages ignores them anyway)
- No `Content-Security-Policy` meta tag
- The `.nojekyll` file correctly tells GitHub Pages to preserve `_astro/` directories

---

## 8. Code Organization

### Duplicated Logic

| Pattern | Locations | Recommendation |
|---------|-----------|----------------|
| Badge array construction | `PublicationCard.astro:13-19`, `HighlightsRow.astro:20-24`, `publications/[slug].astro:17-23` | Extract to `src/lib/badges.ts` |
| Artifact-map building | `index.astro:21-29`, `publications/index.astro:9-18` | Extract to `src/lib/collections.ts` |
| Publication lookup map | `index.astro:92`, `artifacts/index.astro:10` | Same utility file |
| Link constants (resume, scholar, GitHub, LinkedIn, email) | `BaseLayout.astro:24-29`, `index.astro:34-38` | Extract to `src/lib/constants.ts` |

### Dead Code

| Item | Location | Notes |
|------|----------|-------|
| `Hero.astro` | `src/components/Hero.astro` | Not imported anywhere. Homepage uses inline `.hero-intro` section |
| `background.svg` | `src/assets/background.svg` | Not referenced anywhere |
| `astro.svg` | `src/assets/astro.svg` | Not referenced anywhere |
| Hero CSS in `theme.css` | Lines ~540-610 | Styles for unused `Hero.astro` |
| Duplicate component CSS in `theme.css` | Lines ~614-766 | Overridden by scoped component styles |

### Draft Blog Post

`src/content/blog/why-llms-need-reject-options.mdx` is `draft: true` with zero content (only TODO comments). Properly filtered from the live site. Not an issue, just noted.

---

## 9. Bugs Found

### Finding 1: Broken Redirect Scripts (High)

**Files:** `src/pages/about/index.astro:24-26`, `src/pages/experience/index.astro:24-26`

```html
<script is:inline>
  window.requestAnimationFrame(() => window.location.replace(target));
</script>
```

`target` is an Astro frontmatter variable (server-side), but `is:inline` scripts run client-side where `target` is undefined. This throws a `ReferenceError` in the browser console on every visit to `/about/` or `/experience/`. The `<meta http-equiv="refresh">` fallback handles the redirect, so functionality is not broken, but the console error is sloppy.

**Fix:** Either inline the URL string directly, or remove the script since `<meta refresh>` already works.

### Finding 2: Stale CLAUDE.md (Low)

- Line 41 references "animated interactive water background (Canvas-based)" in `Hero.astro` -- no canvas or animation exists.
- Line 55 states accent color is "OSU Scarlet (#BA0C2F)" -- actual accent is blue (`#2563eb` light, `#60a5fa` dark).
- References `src/pages/_index.astro.full` which doesn't exist.

---

## 10. RSS Feed

- Only includes `news` items, not blog posts or publications
- Items without links all share the same fallback URL (`/news/`), which may cause deduplication in RSS readers
- Items lack `description` field, reducing usefulness

---

## Recommendations Summary

### Quick Wins (Low Effort, High Impact)

1. **Fix font loading:** Move Google Fonts `@import` from `theme.css` to a `<link>` in `BaseLayout.astro` `<head>` -- eliminates one network round trip
2. **Fix redirect scripts:** Replace `target` variable with the actual URL string, or remove the `<script>` entirely
3. **Delete unused assets:** Remove `src/assets/background.svg` and `src/assets/astro.svg`

### Medium Effort

4. **Clean up `theme.css`:** Remove ~130 lines of dead CSS (duplicate component styles, unused Hero styles)
5. **Fix `transition: all`:** Replace 9 instances with explicit property lists per project guidelines
6. **Add missing CSS:** Define styles for `SectionHeading`, `publication-grid`, `artifact-card`, etc. -- or remove the classes if they're intentionally unstyled
7. **Extract shared utilities:** Badge construction, artifact maps, link constants

### Low Priority

8. **Update dependencies:** Plan Astro 5->6 and TypeScript 5->6 migration
9. **Downsize headshot source:** 1200px -> 500px to reduce build artifact size
10. **Enhance RSS feed:** Add blog posts, descriptions, unique item links
11. **Update CLAUDE.md:** Fix stale references to water animation, accent color, archived files
12. **Consider removing `Hero.astro`:** Dead component adding to maintenance surface

---

*Audit generated by Claude Code. No changes were made to the codebase.*
