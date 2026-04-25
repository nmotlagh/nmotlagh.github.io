# Design System

## Visual Direction

This site is a research portfolio for an applied ML scientist. It should feel editorial, exact, and job-search ready: closer to a well-set lab notebook or conference profile than a SaaS landing page.

The mood is calm, technical, and quietly confident. Use a small number of strong visual decisions: generous reading rhythm, crisp borders, restrained surfaces, useful hierarchy, and one warm accent supported by a cool secondary tone.

Avoid generic AI styling. No glowing gradients, purple-blue SaaS palettes, decorative blobs, huge empty heroes, nested card stacks, or feature-marketing copy blocks.

## Color Roles

- Page background: warm paper. It supports long reading and should not fight the text.
- Primary text: ink. High contrast, nearly neutral, never pure novelty color.
- Muted text: warm graphite. Use for metadata, descriptions, dates, and secondary facts.
- Surface: clean paper-white. Use sparingly for repeated items, not every section.
- Border: tea-stained neutral. Use for structure and edges before shadows.
- Accent: oxide/copper. Use for active nav, primary buttons, small labels, and key links.
- Secondary: sage/green. Use only for availability and positive status cues.
- Dark mode: charcoal paper with warm text and the same semantic roles.

Color should clarify roles, not decorate. A page should not read as one hue repeated at different opacities.

## Typography

- Display font: Newsreader for major page titles and section headings.
- Sans font: Inter for body copy, navigation, cards, and UI.
- Mono font: IBM Plex Mono for dates, labels, metadata, and compact technical facts.
- Letter spacing is zero by default. Use positive tracking only for tiny uppercase labels.
- Use large type only for the homepage identity and page-level archive headings.
- Card and panel headings should be compact enough to scan.
- Body copy should stay between 60 and 70 characters when possible.
- Dates and metrics use tabular numerals where comparison matters.

## Spacing And Layout Rhythm

- Use a consistent vertical rhythm: section spacing should feel deliberate, not like separate landing-page blocks.
- Home sections should flow as a portfolio narrative: opening, current work, updates, projects, publications, experience, about, contact.
- Section headers sit close to their content.
- Prefer full-width sections with constrained inner content. Do not wrap every section in a heavy card.
- Repeated items may be cards. Cards use an 8px radius, subtle borders, and minimal shadow.
- Hero and CTA panels may use a slightly larger radius, but they should remain crisp.
- Avoid nested cards. If a panel contains smaller grouped content, make the parent unframed or the child groups flat.

## Components

### Navigation

- Header is compact and sticky on desktop.
- Mobile navigation stays on one horizontal row with scroll when needed; it should not wrap into a tall control cluster.
- Active nav uses a quiet filled state and clear text contrast.
- Focus states are visible and consistent.

### Buttons And Badges

- Primary buttons are solid accent, compact, and confident.
- Secondary buttons are outlined or transparent with the same dimensions.
- Badges are for metadata or low-emphasis links; they should not compete with primary actions.
- Hover states should increase clarity: stronger border, text, or background.
- Active states should feel pressed with a tiny transform only.

### Cards And Surfaces

- Cards are for repeated items, archive entries, and small standalone notes.
- Card radius is 8px.
- Use borders first, shadows second.
- Avoid deep shadow stacks.
- Long titles and repository names must wrap cleanly without overflow.

### Sections

- Section headings include a small mono eyebrow, a display heading, and optional description.
- Archive pages use the section heading as the visible h1.
- The homepage hero is the only place for identity-scale type.
- The contact section should feel like a practical recruiter handoff, not a second hero.

### Forms

- No forms currently exist. If added, use native labels, 16px minimum input text, clear inline errors, visible focus, and no blocked paste.

## Responsive Behavior

- Mobile is designed first enough to feel intentional, not squeezed.
- Keep controls at least 44px tall on touch devices.
- Avoid horizontal overflow at 390px.
- Hero status and availability content should wrap in a readable block, not a stretched pill.
- Repeated grids collapse to one column with steady gaps.
- Long headings use balance when supported and otherwise wrap naturally.

## Image And Media Treatment

- Use the headshot as a real credential signal: crisp, stable aspect ratio, no decorative frame overload.
- Images need explicit dimensions or aspect ratios to prevent layout shift.
- Avoid dark overlays or blurred media. The image should be inspectable.

## Do

- Use crisp borders, steady spacing, and readable hierarchy.
- Let the research content carry the page.
- Keep interaction states visible.
- Preserve routes, content meaning, and job-search intent.
- Prefer one strong component pattern over many small variations.

## Do Not

- Do not add visible text explaining the design system.
- Do not add decorative blobs, generic AI gradients, or random visual motifs.
- Do not create nested cards.
- Do not make cards overly rounded.
- Do not use negative letter spacing.
- Do not let mobile nav wrap into multiple awkward rows.
- Do not use color as the only status cue.
