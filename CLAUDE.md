# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static multi-page website for **Dansco Engineering, LLC** — a structural engineering firm. No build tools, no framework, no package manager. Deployed via GitHub Pages from the `docs/` folder.

**Live site:** https://syrus555555.github.io/DANSCO-ENGINNERING/

## File structure

```
docs/           ← GitHub Pages root (this is what's served)
  index.html    ← Home (hero + services + testimonials + CTA)
  about.html    ← About Us (story + values + team + interactive US map)
  services.html ← Services (4 service blocks with sticky images)
  projects.html ← Projects (filterable gallery)
  contact.html  ← Contact (form + Google Maps embed)
  shared.css    ← Global design system (vars, nav, footer, animations, responsive)
  animations.js ← Scroll-reveal, count-up, magnetic buttons, page transitions
  us-map.js     ← US SVG map data (window.US_MAP_SVG) used only by about.html
  uploads/      ← Logo and image assets
project/        ← Source/working copy (keep in sync with docs/ manually)
```

`project/` and `docs/` are identical copies. Edit in `project/`, then copy changes to `docs/` before pushing.

## Deploying changes

```bash
cp -r project/. docs/
git add docs/ project/
git commit --no-gpg-sign -m "your message"
git push
```

GitHub Pages auto-deploys on push (1–2 min build time).

## Design system (shared.css)

CSS custom properties defined in `:root`:
- `--brand: #4a6478` — steel blue (primary)
- `--brand-dark: #344858`
- `--accent: oklch(0.72 0.13 55)` — warm amber (CTAs, section labels)
- `--bg: #f7f6f4`, `--bg-alt: #edecea`, `--white: #ffffff`
- `--nav-h: 76px` — used everywhere for sticky offset calculations
- Fonts: **Barlow Condensed** (headings/UI) + **Barlow** (body) — loaded from Google Fonts

Key layout classes: `.section` (88px/72px padding), `.section-sm`, `.page-header` (dark hero band at top of inner pages), `.cta-band` (amber strip), `.btn-primary`, `.btn-outline`, `.btn-white`.

## Animation system (animations.js)

Runs on every page. Auto-tags matching elements with `.reveal`, then uses `IntersectionObserver` to add `.in-view` when they scroll into view. Elements inside card containers animate as a unit (not their children individually). Sticky/fixed elements are excluded to prevent transform conflicts.

Page transitions: clicking internal links adds `.page-leaving` to `<body>` (opacity: 0), then navigates after 280ms.

Respects `prefers-reduced-motion` — shows everything immediately if set.

## Per-page patterns

**Each page** follows this shell:
1. `<nav>` — fixed, shared across all pages; hamburger toggle via inline JS (`#hamburgerBtn` / `#navLinks` / `.nav-open`)
2. `.page-header` — dark brand-colored banner (inner pages only; home has its own hero)
3. Page-specific sections with inline `<style>` block at top
4. `.cta-band` + `<footer>` — identical across all pages
5. `<script src="animations.js">` at end of body

**services.html** — 4 `.service-block` sections with `position: sticky` image panels. The body must not have a CSS `transform` applied or sticky breaks (was a known bug — solved by removing page-enter transform from body).

**about.html** — `us-map.js` injects `window.US_MAP_SVG`; inline script renders it into `#usMap`, applies `.hq` / `.licensed` classes to state paths, and wires hover sync between map paths and `.state-chip` elements.

## Cache busting

Shared assets use query-string version stamps: `shared.css?v1777554202983`, `animations.js?v1777554202983`. When making significant CSS/JS changes, update the version number consistently across all HTML files.
