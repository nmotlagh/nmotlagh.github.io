# Content Audit Report -- nmotlagh.github.io

**Date:** 2026-03-28
**Scope:** All content collections, SEO/metadata, tone, completeness, freshness

---

## Executive Summary

The site is well-built with strong foundations: typed content collections, structured data, dual-theme support, and a clear personal brand. The writing voice is distinctive and effective. However, the audit uncovered **link/field misuse across publications**, **a date contradiction in news**, **an empty blog section**, **stale news items**, and **several SEO gaps** (no robots.txt, incomplete OG tags, RSS limited to news only). None are critical failures, but fixing them would meaningfully improve accuracy and discoverability.

---

## 1. Accuracy & Completeness

### 1.1 Publication Link Issues

| Publication | Field | Issue |
|---|---|---|
| **All 4 publications** | `pdf` | Points to landing pages (arXiv abstract, ACL Anthology entry, CVF proceedings), not direct PDF files. If rendered as a "PDF" button, users get an HTML page. |
| ISVC 2022 + MVA 2025 | `pdf` | Both point to the **same arXiv ID** (`2209.04944`). Users clicking "PDF" on two distinct cards land on the same page. The MVA journal version should link to the Springer full text or a revised arXiv version. |
| ICCV 2021 Workshop | `external` | Duplicates the `pdf` URL. Should point to the workshop proceedings landing page instead. |
| MVA 2025 | `arxiv` | **Not set**, despite the arXiv link existing (it was put in `pdf` instead). |
| All 4 publications | `doi` | **Not set on any publication**, despite Springer and ACL Anthology DOIs being available. |

**Recommended fixes:**
- Use direct PDF URLs in `pdf` fields (e.g., `https://arxiv.org/pdf/2209.04944`).
- Give MVA 2025 a distinct PDF link (Springer full text or updated arXiv revision).
- Populate `doi` for MVA 2025 (`10.1007/s00138-024-01620-5`), ISVC 2022 (`10.1007/978-3-031-20713-6_15`), and WMT 2024 (check ACL Anthology).
- Move arXiv links from `pdf` to `arxiv` where applicable.
- Change ICCV 2021 `external` to the workshop proceedings page.

### 1.2 Missing Highlight Flag

The **ISVC 2022 Best Paper** (`learning-when-to-say-i-dont-know`) does not have `highlight: true` set, so it is excluded from the HighlightsRow on the homepage. A Best Paper award winner should be showcased prominently.

### 1.3 News Date Contradiction

| File | Date | Title |
|---|---|---|
| `llm-reject-option.json` | 2025-05-15 | "**Completed** LLM reject-option training and evaluation work at DCS Corp / AFRL." |
| `dcs-role.json` | 2025-05-20 | "**Joined** DCS Corp (AFRL) as Technical Analyst II..." |

The "completed" entry is dated 5 days **before** the "joined" entry. Either `llm-reject-option.json` refers to earlier internship work (and should not reference "DCS Corp"), or the dates are swapped.

### 1.4 About & Experience

Both `about.mdx` (updated 2026-03-18) and `experience.mdx` (updated 2026-03-18) appear current and accurate. The about section clearly describes the research trajectory, dissertation timeline, and job market status. Experience covers 8 positions from 2018 to present with detailed bullets. No issues found.

### 1.5 Artifacts

All 3 artifacts (`learning-idk`, `Construction-Site-Satellite-Imagery`, `calibration`) have correct GitHub repo URLs and are properly tied to their publications. No issues found.

---

## 2. Tone & Voice

**Assessment: Strong and consistent.**

The writing strikes an effective balance -- technically credible but accessible to non-specialists. Key examples:

- **Homepage headline:** "I train AI systems to know when they don't know" -- memorable, clear thesis.
- **Meta description:** "...teaching AI systems to stop guessing and start admitting what they don't know" -- same voice, great for search snippets.
- **About section:** "The simplest way I can explain my work is this: I teach AI to stop making things up." -- inviting, no jargon wall.
- **404 page:** "That page wandered off." -- light touch, on-brand.
- **Artifact descriptions:** Written for recruiters ("Recruiters and collaborators often want to see reproducibility at a glance") -- audience-aware.

The tone is consistent across all pages and content types. The only slight unevenness is between the conversational homepage voice and the more formal publication TLDRs, but this is appropriate given the different audiences.

**One note:** The footer includes "U.S. citizen" in the copyright line. This is intentional for defense/clearance recruitment but is unconventional for a site footer -- could be moved to the about section or a dedicated "clearance" badge instead.

---

## 3. SEO & Discoverability

### 3.1 What's Working Well

- Meta descriptions set on **all pages** (including dynamic ones using `tldr`/`description` from content).
- JSON-LD structured data on homepage (`Person` + `ScholarlyArticle` array), publication detail pages (`ScholarlyArticle`), and blog posts (`BlogPosting`).
- Open Graph and Twitter Card tags on all pages via BaseLayout.
- Canonical URLs set when `Astro.site` is defined.
- RSS feed at `/rss.xml` linked from `<head>`.
- Sitemap auto-generated via `@astrojs/sitemap`.
- `lang="en"` on `<html>`, skip-to-content link, favicon set.

### 3.2 Issues Found

| Priority | Issue | Details |
|---|---|---|
| **High** | No `robots.txt` | No crawl directives, sitemap not advertised to bots. Add `public/robots.txt` with `Sitemap: https://nmotlagh.github.io/sitemap-index.xml`. |
| **High** | RSS feed excludes blog posts | `rss.xml.js` only pulls from the `news` collection. When blog posts are published, they won't appear in the feed. |
| **Medium** | Redirect pages lack `noindex` | `/about/` and `/experience/` are meta-refresh redirects with descriptions like "Redirecting to the About section." -- should have `<meta name="robots" content="noindex">`. |
| **Medium** | `og:type` is always `"website"` | Blog posts should use `"article"` with `article:published_time`. Publication detail pages could also benefit from `"article"`. |
| **Medium** | No `WebSite` or `BreadcrumbList` schema | Homepage should have a `WebSite` schema. Detail pages (publications, blog) would benefit from `BreadcrumbList` for SERP navigation. |
| **Low** | `BlogPosting` schema incomplete | Missing `mainEntityOfPage`, `dateModified`, `image`. Google recommends these for rich results. |
| **Low** | OG image fallback is headshot | A portrait photo may not display well at `summary_large_image` 2:1 aspect ratio. A dedicated 1200x630 OG image would be better. |
| **Low** | Missing `og:image:width`, `og:image:height`, `og:locale` | Minor but helps platforms render previews faster. |
| **Low** | Redirect page JS fallback broken | `/about/index.astro` and `/experience/index.astro` reference an Astro variable `target` inside `is:inline` script, which is undefined at runtime. The meta-refresh works, but the JS fallback silently fails. |

---

## 4. Missing Content

### 4.1 Blog: Scaffolded but Empty

The blog infrastructure is **fully built** -- collection schema, index page (with empty state), detail page with `BlogPosting` structured data, tag display, and styled prose. However:

- Only **1 post** exists: `why-llms-need-reject-options.mdx`
- It has `draft: true` and its **entire body is TODO comments** -- no rendered content
- Dated 2026-02-08, it has been a skeleton for ~7 weeks
- The "Blog" link in navigation leads to an empty page displaying "No posts yet. Check back soon."

**Recommendation:** Either publish the draft post (or a simpler first post) to make the blog feel alive, or remove "Blog" from navigation until content is ready. An empty section can undermine credibility.

### 4.2 Stale News Item

`emnlp-2026-submission.json` (dated 2026-02-01) says "**Preparing** EMNLP 2026 submission on typed abstention for LLM agents." Nearly two months later, this should be updated to reflect current status -- submitted, under review, or withdrawn.

### 4.3 Potential Missing Publications

The site lists **4 publications** (2021-2025). For a PhD candidate defending in 2026, this is reasonable but worth checking:

- Is the EMNLP 2026 submission mentioned in news reflected anywhere once submitted?
- Are there any workshop papers, preprints, or technical reports not listed?
- The GRPO/IDK training work mentioned in the about section and CLAUDE.md doesn't have a corresponding publication entry yet.

### 4.4 Unused Hero Component

`Hero.astro` is a full-featured component (stats overlay, profile image, links bar, action buttons) that is **not used anywhere** in the codebase. The homepage builds its intro section with inline HTML instead. This is dead code that could either be integrated or removed.

### 4.5 Navigation Gap

Skills and Education are homepage anchor sections only (`#skills`, `#education`) -- they have no standalone pages. This is fine for a portfolio site, but means direct links to these sections from external sources would load the entire homepage. Not necessarily a problem, just worth noting.

---

## 5. Prioritized Recommendations

### Must Fix (accuracy/correctness)
1. **Fix PDF links** -- use direct PDF URLs, not landing pages, in `pdf` fields
2. **Give MVA 2025 a distinct PDF** -- it currently shares the same link as ISVC 2022
3. **Resolve news date contradiction** -- `llm-reject-option.json` vs `dcs-role.json`
4. **Update EMNLP 2026 news item** -- change "Preparing" to current status
5. **Add `highlight: true`** to ISVC 2022 Best Paper

### Should Fix (SEO/discoverability)
6. **Add `public/robots.txt`** with sitemap reference
7. **Add `noindex` to redirect pages** (`/about/`, `/experience/`)
8. **Populate `doi` fields** on publications where DOIs exist
9. **Move arXiv links to `arxiv` field** instead of `pdf`
10. **Fix ICCV 2021 `external` field** -- should not duplicate `pdf`

### Nice to Have (polish)
11. **Publish or hide the blog** -- empty section hurts more than no section
12. **Add blog posts to RSS feed** when published
13. **Make `og:type` dynamic** -- `"article"` for blog/publication pages
14. **Add `WebSite` structured data** to homepage
15. **Create a dedicated OG image** (1200x630) instead of headshot fallback
16. **Remove or integrate `Hero.astro`** -- currently dead code
17. **Fix redirect page JS fallback** -- `target` variable undefined at runtime

---

*This audit is read-only. No code or content changes were made.*
