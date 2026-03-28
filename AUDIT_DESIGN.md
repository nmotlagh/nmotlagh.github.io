# Visual Design & UX Audit Report

**Site:** nmotlagh.github.io
**Date:** 2026-03-28
**Scope:** Read-only codebase analysis of visual design, accessibility, and UX patterns

---

## Executive Summary

The site has a solid foundation: a well-structured CSS custom property system, clean dual-mode theming, and good semantic HTML. However, the audit reveals several issues that undermine accessibility and maintainability:

- **3 critical** accessibility failures (contrast, missing mobile navigation, touch targets)
- **6 warnings** around code consistency, stale documentation, and minor a11y gaps
- **Multiple informational** notes on dead code and optimization opportunities

The most impactful fix would be restoring mobile navigation, which is completely absent below 960px.

---

## Severity Legend

| Tag | Meaning |
|-----|---------|
| **CRITICAL** | Accessibility failure or broken functionality |
| **WARNING** | Degraded UX or maintainability concern |
| **INFO** | Non-blocking observation or optimization opportunity |
| **GOOD** | Pattern worth preserving |

---

## 1. Visual Hierarchy

### GOOD: Section ordering is logical
The homepage (`src/pages/index.astro`) presents content in a sensible flow: Hero intro with tech badges and CTA buttons, then News, Research Highlights, Experience timeline, Skills, Publications, Artifacts, and About. The Research Highlights section uses a gradient callout background (`var(--color-callout-bg)`) that visually distinguishes it from standard card sections.

### GOOD: Fluid headline typography
The hero headline uses `clamp(2rem, 1.6rem + 1.5vw, 2.85rem)` for smooth scaling between mobile and desktop without abrupt breakpoint jumps.

### WARNING: About section is buried
For an academic portfolio, the researcher's bio is a primary piece of content. Currently it sits at position 8 of 8 sections on the homepage. Visitors scanning for "who is this person" must scroll past experience, skills, publications, and artifacts to find it.

**Recommendation:** Move the About section higher (after Experience or after Research Highlights) or add a brief 2-sentence bio callout near the hero.

### GOOD: Visual weight distribution
The two-column sidebar layout (`src/styles/theme.css:141-157`) with a sticky sidebar (`position: sticky; top: var(--space-2xl)`) keeps the researcher's identity visible while scrolling through content. The 300px/1fr split gives appropriate weight to the main content area.

---

## 2. Typography

### GOOD: Readable base typography
- Font: Inter (400/500/600/700) loaded from Google Fonts
- Body: `1.1875rem` (19px) / `line-height: 1.7` -- excellent for long-form reading
- Global paragraph measure: `p { max-width: 65ch }` (`theme.css:129`) -- prevents overly wide lines

### GOOD: Responsive headline scaling
The hero headline uses `clamp()` and the blog post h1 uses `clamp(1.5rem, 1.25rem + 1vw, 2rem)` -- both scale smoothly without breakpoint jumps.

### WARNING: Component/global style duplication with conflicting values
Three components define scoped `<style>` blocks that override their global `theme.css` counterparts with different font sizes:

| Selector | theme.css value | Component scoped value | Component |
|----------|----------------|----------------------|-----------|
| `.publication-card__eyebrow` | `0.9rem` | `1.0625rem` | `PublicationCard.astro` |
| `.publication-card__title` | `1.1875rem` | `1.0625rem` | `PublicationCard.astro` |
| `.publication-card__authors` | `1rem` | `1.0625rem` | `PublicationCard.astro` |
| `.publication-card__tldr` | `1rem` / `line-height: 1.65` | `1.0625rem` / `line-height: 1.6` | `PublicationCard.astro` |
| `.highlight-card__eyebrow` | `0.85rem` | `0.95rem` | `HighlightsRow.astro` |
| `.highlight-card__title` | `1.1875rem` | `1.125rem` | `HighlightsRow.astro` |
| `.news-strip` padding | `var(--space-md) var(--space-lg)` | `var(--space-lg)` | `NewsStrip.astro` |

The scoped styles win at runtime, making the global definitions dead code for these selectors. This creates confusion about which values are actually in effect.

**Recommendation:** Consolidate -- either remove the global definitions or remove the scoped overrides.

### WARNING: SectionHeading component is completely unstyled
`src/components/SectionHeading.astro` outputs BEM classes (`.section-heading`, `.section-heading__eyebrow`, `.section-heading__title`, `.section-heading__description`) but there is **zero CSS** matching these classes in `theme.css` or any scoped style block. The component renders with only browser defaults and the global body font. It is used on 4 pages: `/news/index.astro`, `/publications/index.astro`, `/artifacts/index.astro`, `/blog/index.astro`.

**Recommendation:** Add styles for `.section-heading__*` in `theme.css` or as a scoped `<style>` in the component.

### INFO: Hero.astro component has unmatched CSS classes
`src/components/Hero.astro` uses `.hero__heading`, `.hero__subheading`, etc., but the homepage uses `.hero-intro__headline`, `.hero-intro__description` (different naming). Hero.astro is not imported anywhere and its classes have no CSS definitions. This is dead code.

---

## 3. Color & Theming

### GOOD: Robust dual-mode theming
The entire color system is driven by CSS custom properties that swap between light and dark via `[data-theme]` on `<html>`. The inline theme script in `BaseLayout.astro` runs before paint, preventing flash of wrong theme (FOUC). The system gracefully falls back to `prefers-color-scheme` when no localStorage preference exists.

### GOOD: Near-zero hardcoded colors
Only `#fff` appears hardcoded (on `.button` at `theme.css:568` and `.skip-link` at `theme.css:136`) -- appropriate for white-on-accent buttons. All other colors use CSS custom properties.

### CRITICAL: `--color-text-soft` fails WCAG AA contrast

`--color-text-soft` is used for dates, meta information, timeline locations, and footer text across 8+ selectors (`theme.css` lines 398, 440, 467, 515, 634, 729, 755, 774).

| Mode | Text | Background | Contrast Ratio | WCAG AA (small text) |
|------|------|-----------|----------------|---------------------|
| Light | `#94a3b8` | `#f8fafb` (page) | ~3.5:1 | FAIL (need 4.5:1) |
| Light | `#94a3b8` | `#ffffff` (card surface) | ~3.7:1 | FAIL |
| Dark | `#64748b` | `#0f172a` (page) | ~4.0:1 | FAIL |
| Dark | `#64748b` | `#1e293b` (card surface) | ~3.0:1 | FAIL |

**Recommendation:**
- Light mode: change `--color-text-soft` from `#94a3b8` to `#64748b` (slate-500, ~5.5:1 on `#f8fafb`)
- Dark mode: change `--color-text-soft` from `#64748b` to `#94a3b8` (slate-400, ~5.5:1 on `#0f172a`)
- Effectively swap the two values between modes

### CRITICAL: Documentation claims OSU Scarlet is primary accent -- it does not exist

Both `CLAUDE.md` (line mentioning "Primary accent color: OSU Scarlet (`#BA0C2F`)") and the site's README reference `#BA0C2F` as the primary accent. However, **`#BA0C2F` does not appear anywhere in any `.css` or `.astro` file**. The actual accent colors are:
- Light: `#2563eb` (Tailwind blue-600) at `theme.css:18`
- Dark: `#60a5fa` (Tailwind blue-400) at `theme.css:72`

The entire palette is a cool slate + blue system with no red/scarlet whatsoever.

**Recommendation:** Update `CLAUDE.md` and `README.md` to reflect the actual blue accent palette, or intentionally reintroduce OSU Scarlet if that was the design intent.

### INFO: Dark mode button contrast is marginal
The primary `.button` uses `color: #fff` on `background: var(--color-accent)`. In dark mode, the accent is `#60a5fa` (a medium-light blue), giving `#fff` on `#60a5fa` approximately 3:1 contrast. This passes WCAG AA for large text (the button text is 1rem/600 weight, which at 16px computed doesn't qualify as "large"). However, the button's min-height and weight may provide sufficient perceptual clarity.

---

## 4. Responsive Design

### CRITICAL: No navigation on mobile
At `max-width: 960px`, the sidebar navigation is completely hidden:

```css
/* theme.css:248 */
@media (max-width: 960px) { .sidebar__nav { display: none; } }
```

There is no hamburger menu, drawer, bottom nav, or any alternative navigation mechanism. Mobile users cannot navigate between sections (Experience, Publications, etc.) without scrolling the entire page. On subpages like `/publications/`, `/blog/`, etc., there is no way to navigate to other sections at all.

**Recommendation:** Implement a mobile navigation pattern -- either a hamburger/drawer menu or a sticky bottom nav bar with key section links.

### WARNING: ThemeToggle touch target is undersized
The theme toggle button is `38px x 38px` (`theme.css:678`), below the 44px WCAG 2.5.5 recommendation for touch targets.

**Recommendation:** Increase to `width: 44px; height: 44px` or add transparent padding to expand the touch area.

### WARNING: Card action links lack adequate touch targets
Links like "Paper", "arXiv", "Code" in `PublicationCard.astro` and `HighlightsRow.astro` are inline text links with minimal padding. On mobile, these are difficult to tap accurately. No `min-height` or touch-target sizing is applied.

**Recommendation:** Add `min-height: 44px; display: inline-flex; align-items: center;` to `.card__link` and `.highlight-card__link` on mobile, or increase padding to `0.75rem 1rem`.

### GOOD: Fluid grid system
Publication and artifact grids use `auto-fill` with `minmax()`:
- `.grid--2`: `repeat(auto-fill, minmax(300px, 1fr))` (`theme.css`)
- `.grid--3`: `repeat(auto-fill, minmax(260px, 1fr))` (`theme.css`)

These adapt gracefully to any viewport width without explicit breakpoints.

### GOOD: Buttons meet touch target requirements
`.button` has `min-height: 44px` (`theme.css:564`), meeting WCAG 2.5.5.

### INFO: Breakpoint inconsistency
HighlightsRow scoped styles use 640px/900px breakpoints, while global `theme.css` highlights rules use 768px/1024px. These target different class names and don't conflict, but the inconsistency makes the responsive system harder to reason about.

**Recommendation:** Standardize on a shared breakpoint scale (e.g., 640/768/960/1024/1280) as CSS custom properties or at least document the convention.

---

## 5. Animations & Performance

### GOOD: Hover animations are compositor-friendly
- Card hover: `transform: translateY(-2px)` and `translateY(-3px)` -- GPU-composited
- Button hover: `transform: translateY(-1px)` -- GPU-composited
- Theme toggle icons: `opacity` + `transform: scale()` transitions -- GPU-composited

### GOOD: `prefers-reduced-motion` is respected
```css
/* theme.css:113-120 */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
This is a thorough implementation that covers all animations and transitions.

### WARNING: `transition: all` used in 8 places
The project's own `CLAUDE.md` states "No `transition: all` - list properties explicitly", but `theme.css` uses `transition: all var(--transition-fast)` at lines 222, 255, 288, 450, 489, 572, 683, and 745. `transition: all` can cause unintended animations on properties like `width`, `height`, or `padding` during layout changes, and prevents the browser from optimizing compositor-only transitions.

**Recommendation:** Replace each `transition: all` with explicit property lists. For example:
- `.card:hover` likely only needs `transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)`
- `.theme-toggle` (`line 683`) likely only needs `transition: border-color var(--transition-fast), background var(--transition-fast)`

### INFO: Theme transition triggers paint
`body` has `transition: background var(--transition-medium), color var(--transition-medium)` (`theme.css:110`). Background color transitions trigger repaint on every frame. This is acceptable as a deliberate UX choice (smooth theme switch) and only fires on toggle, not continuously.

### INFO: No interactive water/canvas background exists
The `CLAUDE.md` mentions "animated interactive water background (Canvas-based)" for `Hero.astro`, but:
- `Hero.astro` is not imported by any page
- The homepage hero (`.hero-intro` in `index.astro`) is purely static HTML
- No `<canvas>` element exists anywhere in the codebase

The documentation is outdated. The current hero is clean and lightweight, which is a performance positive.

---

## 6. Component Consistency

### GOOD: Consistent card pattern
All cards (publication, artifact, highlight, skill, timeline) follow the same visual recipe:
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Radius: `var(--radius-lg)` (16px)
- Shadow: `var(--shadow-card)`
- Hover: border-color to accent, shadow to `var(--shadow-card-hover)`, lift via `translateY`

### GOOD: Consistent use of design tokens
Almost all styling uses CSS custom properties. Colors, spacing, shadows, radii, and transitions are all tokenized, making global changes straightforward.

### WARNING: Missing focus-visible styles on several interactive elements
Explicit `:focus-visible` styles exist for: `.sidebar__link`, `.card`, `.card--clickable`, `.button`, `.timeline-item` (`theme.css:229-236`).

**Missing** `:focus-visible` styles for:
- `.theme-toggle` (button) -- critical, as it's a standalone interactive control
- `.card__link` (publication action links)
- `.highlight-card__link` (highlight action links)
- `.highlight-card__title a` (highlight title links)
- `.news-strip a` (news item links)

These fall back to the browser default focus ring, which may be invisible or inconsistent across browsers.

**Recommendation:** Add `:focus-visible` styles to all interactive elements, at minimum the theme toggle button.

### WARNING: Dead components
- `Hero.astro`: exists in `src/components/` but is not imported anywhere. Its `.hero__*` CSS classes have no definitions.
- `SectionHeading.astro`: imported and used on 4 pages, but its BEM classes have no CSS.

**Recommendation:** Either style and integrate these components or remove them to reduce confusion.

### GOOD: Accessible markup patterns
- Skip link to `#page-content`
- `<nav aria-label="Primary navigation">`
- `<section aria-label="...">` on NewsStrip and HighlightsRow
- `aria-pressed` on theme toggle, updated via MutationObserver
- `<time datetime="...">` on dates
- `aria-hidden="true"` on decorative icons and separators
- `role="list"` where `list-style: none` strips semantics (Safari bug)
- External links consistently use `target="_blank" rel="noopener noreferrer"`

---

## 7. Hero Section

### INFO: Current hero is static, not interactive
The homepage hero (`src/pages/index.astro`, `.hero-intro` section) consists of:
1. Tech badges (flex-wrapped pills)
2. Greeting text
3. `<h1>` headline with fluid `clamp()` sizing
4. Description paragraph (max-width 60ch)
5. Status callout with accent highlight
6. Two CTA buttons (View Resume + Discuss Opportunities)

There is no canvas, WebGL, or animated background. The hero is clean, fast-loading, and accessible. The `Hero.astro` component (which has props for images, stats, and actions) exists but is unused.

### INFO: Hero could benefit from visual distinction
The hero section has no background differentiation from the rest of the page. It flows directly into the news strip and highlights sections with only spacing as separation. A subtle background treatment (gradient, texture, or the callout-style border) could help establish it as the primary landing area.

**Recommendation (optional):** Consider adding a subtle gradient background or a border-bottom to visually separate the hero from the content below. This is a design preference, not an accessibility requirement.

---

## Prioritized Recommendations

| Priority | Category | Issue | Effort |
|----------|----------|-------|--------|
| **P0** | Responsive | Add mobile navigation (hamburger/drawer or bottom nav) | Medium |
| **P0** | Color | Fix `--color-text-soft` contrast in both modes | Trivial |
| **P0** | Docs | Update CLAUDE.md/README.md re: OSU Scarlet vs actual blue accent | Trivial |
| **P1** | A11y | Add `:focus-visible` styles to theme toggle, card links, news links | Small |
| **P1** | Responsive | Increase theme toggle to 44px touch target | Trivial |
| **P1** | Responsive | Add touch-target sizing to card action links on mobile | Small |
| **P1** | Animation | Replace 8 `transition: all` with explicit property lists | Small |
| **P2** | Typography | Resolve component/global CSS duplication (consolidate one direction) | Medium |
| **P2** | Components | Style `SectionHeading.astro` or remove unstyled BEM classes | Small |
| **P2** | Components | Remove or integrate unused `Hero.astro` | Small |
| **P2** | Hierarchy | Move About section higher on homepage | Trivial |
| **P3** | Responsive | Standardize breakpoint scale across components | Small |
| **P3** | Docs | Remove "interactive water background" reference from CLAUDE.md | Trivial |
| **P3** | Hero | Add subtle background treatment for visual distinction | Small |

---

*Audit performed via static code analysis. Contrast ratios are approximate and should be verified with a tool like the APCA calculator or Chrome DevTools. No runtime testing or screenshot capture was performed.*
