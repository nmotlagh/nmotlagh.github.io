# Bugbot — nmotlagh.github.io

Review for broken pages, accessibility, and content-schema mistakes. This is a public personal site.

## Flag as bugs

- Build, type-check, or content-collection schema failures (`src/content/config.ts`)
- Broken routes, missing legacy redirects (`/about`, `/experience`, `/publications`), or dropped `site` config
- Accessibility regressions: missing focus rings, `outline: none` without replacement, unlabeled icon buttons, navigation that is not a real link
- Contrast or theme-token breakage that would fail in light or dark mode
- Secrets, private emails beyond what is already public, or resume/PII dumped into PR comments
- A second deploy path that bypasses `.github/workflows/deploy.yml`

## Do not flag

- Copy-editing nits that do not change a fact or break layout
- Missing automated tests (this repo has none; `npm run build` is the check)
- Style-only formatting unless it hides a real failure

## Effort

Default for content-only MDX. High when layouts, theme tokens, or the GitHub Pages workflow change.
