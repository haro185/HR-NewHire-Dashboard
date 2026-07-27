# Coding Guidelines — HR New Hire Analytics Dashboard

Standards for HTML, CSS, and JavaScript in this repository. All contributors must follow these rules to keep the codebase scalable as it grows into a full HR Analytics Platform.

---

## General Principles

1. **Vanilla first** — No frameworks unless the project plan is formally amended.
2. **Small modules** — One file, one responsibility; prefer composition over monoliths.
3. **Data-driven UI** — Never hardcode metrics; derive from store/selectors.
4. **Progressive enhancement** — Core content readable without JavaScript where feasible.
5. **Accessibility by default** — Not a Phase 6 afterthought.

---

## Naming Conventions

### Files and folders

| Type | Convention | Example |
|------|------------|---------|
| Folders | kebab-case | `js/components/` |
| JS modules | kebab-case | `data-loader.js` |
| CSS files | kebab-case | `kpi-card.css` |
| JSON data | kebab-case | `sample-new-hires.json` |
| Images | kebab-case | `empty-state-chart.svg` |

### JavaScript

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `filteredRecords` |
| Constants | UPPER_SNAKE_CASE | `MAX_IMPORT_ROWS` |
| Functions | camelCase, verb prefix | `loadNewHires()`, `renderKpiCard()` |
| Classes | PascalCase | `DataStore` |
| Private module scope | `_leadingUnderscore` | `_normalizeRecord()` |
| DOM data attributes | kebab-case | `data-department-id` |
| Custom events | kebab-case | `records-updated` |

### CSS classes

BEM-inspired: `.block__element--modifier`

```css
.chart-panel { }
.chart-panel__title { }
.chart-panel__canvas { }
.chart-panel--loading { }
```

### HTML

- `id` — only when required for accessibility (`aria-labelledby`) or in-page anchors; prefer classes
- `class` — semantic component names, not presentational (`red-text` forbidden)

---

## Folder Conventions

| Rule | Detail |
|------|--------|
| Depth | Max 3 levels under `js/` unless justified in an ADR |
| Colocation | Chart config lives in `js/charts/`, not inside components |
| No barrel files | Avoid `index.js` re-export chains until bundle step exists |
| Vendor isolation | Third-party code only in `assets/vendor/`; never edit minified files |
| Tests (future) | Mirror `js/` under `tests/` when test runner is added |

---

## Comment Conventions

### When to comment

- **Do:** Non-obvious business rules (e.g., how time-to-hire is calculated)
- **Do:** Public module exports — JSDoc with `@param`, `@returns`
- **Do:** Workarounds with ticket/issue reference
- **Don't:** Restate obvious code (`// increment counter`)

### JSDoc example

```javascript
/**
 * Computes median time-to-hire in days for the given records.
 * Uses offerDate → hireDate; skips records missing either date.
 * @param {import('../types').NewHireRecord[]} records
 * @returns {number | null} Median days, or null if insufficient data
 */
export function medianTimeToHire(records) {
  // ...
}
```

### File headers

Optional one-line description at top of non-trivial modules:

```javascript
/** Central pub/sub store for application state. */
```

### TODO format

```javascript
// TODO(phase-3): Support column alias mapping from user presets
```

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change without feat/fix |
| `perf` | Performance improvement |
| `test` | Tests |
| `chore` | Tooling, deps, gitignore |

### Scope examples

`dashboard`, `analytics`, `import`, `export`, `css`, `charts`, `data`

### Examples

```
feat(dashboard): add KPI cards for offer acceptance rate
fix(import): handle empty sheet in xlsx workbook
docs(readme): add GitHub Pages deployment steps
chore(vendor): pin chart.js 4.4.1 in assets/vendor
```

### Rules

- Imperative mood: "add" not "added"
- Subject line ≤ 72 characters
- Reference issues: `Closes #12` in footer when applicable

---

## Responsive Rules

### Mobile-first

Write base styles for smallest viewport; enhance with `min-width` media queries.

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Layout requirements

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Single column; collapsible filters; charts full width |
| 640–1023px | Two-column KPI grid; table horizontal scroll if needed |
| ≥ 1024px | Full dashboard grid; sidebar filters optional |

### Touch targets

Minimum **44 × 44 px** interactive area on touch devices.

### Charts

- Maintain `aspect-ratio` or min-height to prevent layout shift
- Resize charts on `window.resize` with debounce (250 ms)

---

## Accessibility Rules

Target **WCAG 2.1 Level AA**.

| Requirement | Implementation |
|-------------|----------------|
| Semantics | Use `<main>`, `<nav>`, `<section>`, `<header>`, proper heading hierarchy |
| Keyboard | All interactive elements focusable and operable via keyboard |
| Focus visible | `:focus-visible` outline using `--color-focus-ring` token |
| Color | Do not convey information by color alone; use icons/labels |
| Charts | Provide `aria-label`, data table fallback, or screen-reader summary |
| Motion | Respect `prefers-reduced-motion`; disable non-essential animation |
| Forms | Every input has `<label>` or `aria-label`; errors linked via `aria-describedby` |
| Live regions | Use `aria-live="polite"` for filter result updates |

### Skip link

First focusable element in `index.html`:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

---

## Performance Rules

| Rule | Guideline |
|------|-----------|
| Parse budget | Initial JS parse < 100 KB authored code (excluding vendor) |
| Render | Avoid layout thrashing; batch DOM reads/writes |
| Listeners | Use event delegation for tables; `{ passive: true }` on scroll |
| Data | Aggregate in selectors; memoize expensive derivations |
| Images | SVG for icons; WebP for photos; explicit `width`/`height` |
| Lazy load | Dynamic `import()` for export and import modules until needed |
| Workers | Aggregations > 5 ms on 1k rows should move to Web Worker (Phase 7) |

### Anti-patterns

- No `document.querySelector` in hot loops
- No inline `onclick` in HTML
- No synchronous localStorage in render path

---

## Color System

Defined as CSS custom properties in `css/tokens.css` (Phase 1). Use tokens only — no raw hex in component files.

### Brand palette (light theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-500` | `#2563EB` | Primary actions, active nav |
| `--color-primary-600` | `#1D4ED8` | Hover primary |
| `--color-primary-100` | `#DBEAFE` | Tinted backgrounds |
| `--color-secondary-500` | `#7C3AED` | Secondary accents, analytics |
| `--color-success-500` | `#059669` | Positive deltas, hired status |
| `--color-warning-500` | `#D97706` | Pending, attention |
| `--color-danger-500` | `#DC2626` | Errors, withdrawn |
| `--color-neutral-900` | `#111827` | Primary text |
| `--color-neutral-600` | `#4B5563` | Secondary text |
| `--color-neutral-200` | `#E5E7EB` | Borders |
| `--color-neutral-50` | `#F9FAFB` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-focus-ring` | `#2563EB` | Focus outline |

### Chart series colors

| Token | Value |
|-------|-------|
| `--chart-series-1` | `#2563EB` |
| `--chart-series-2` | `#7C3AED` |
| `--chart-series-3` | `#059669` |
| `--chart-series-4` | `#D97706` |
| `--chart-series-5` | `#DC2626` |

Dark theme overrides live in `css/themes/dark.css` (Phase 6).

---

## Spacing System

4 px base unit. Use spacing tokens, not arbitrary values.

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### Application

- Card padding: `--space-6`
- Gap between KPI cards: `--space-4`
- Section margin-bottom: `--space-8`
- Page horizontal padding: `--space-4` (mobile), `--space-8` (desktop)

---

## Typography

### Font stacks

| Token | Stack |
|-------|-------|
| `--font-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `--font-mono` | `"JetBrains Mono", ui-monospace, "Cascadia Code", monospace` |

Inter and JetBrains Mono will be self-hosted under `assets/fonts/` (Phase 1).

### Type scale

| Token | Size | Line height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1.25 | Captions, table meta |
| `--text-sm` | 0.875rem (14px) | 1.4 | Labels, secondary body |
| `--text-base` | 1rem (16px) | 1.5 | Body |
| `--text-lg` | 1.125rem (18px) | 1.5 | Lead text |
| `--text-xl` | 1.25rem (20px) | 1.4 | Section titles |
| `--text-2xl` | 1.5rem (24px) | 1.3 | Page subtitle |
| `--text-3xl` | 1.875rem (30px) | 1.2 | KPI values |
| `--text-4xl` | 2.25rem (36px) | 1.1 | Page title |

### Weights

- `--font-normal`: 400
- `--font-medium`: 500
- `--font-semibold`: 600
- `--font-bold`: 700

### Rules

- Max line length ~ 70 characters for prose in `docs/`
- KPI values use `--text-3xl` + `--font-semibold` + `--font-mono` for tabular alignment
- Headings: one `<h1>` per view; do not skip levels

---

## HTML Guidelines (Phase 1+)

- Valid HTML5, UTF-8, viewport meta
- `lang="en"` on `<html>` (or appropriate locale)
- Load CSS in `<head>`; defer module script at end of `<body>`
- External links: `rel="noopener noreferrer"` when `target="_blank"`

---

## JavaScript Guidelines

- `"use strict"` implicit in modules
- Prefer `const`; use `let` only when reassigned
- No global variables; attach nothing to `window` except debug hook behind flag
- Use `async/await`; handle errors at service boundaries
- Export named exports; default export only for single-purpose modules if justified

---

## Security Guidelines

- Never commit API keys, tokens, or real employee PII
- Sanitize user-derived strings before inserting into DOM (`textContent` preferred)
- Excel import: treat all cell values as untrusted input
- CSP headers documented in `docs/` when hosting options expand

---

## Review Checklist

Before opening a PR:

- [ ] Follows naming and folder conventions
- [ ] No hardcoded demo metrics
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Keyboard navigable
- [ ] CHANGELOG updated if user-visible
- [ ] No console.log left in production paths

---

## Document History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-27 | Initial guidelines for Sprint 1 |
