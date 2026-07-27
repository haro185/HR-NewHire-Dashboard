# TODO — HR New Hire Analytics Dashboard

Track milestones and feature progress. Check items when complete. See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for phase details.

---

## Milestone Overview

| Milestone | Target | Status |
|-----------|--------|--------|
| Sprint 1 — Project Foundation | 2026-07 | In Progress |
| Phase 1 — Core Dashboard | TBD | Not Started |
| Phase 2 — HR Analytics | TBD | Not Started |
| Phase 3 — Excel Upload | TBD | Not Started |
| Phase 4 — AI Insight | TBD | Not Started |
| Phase 5 — Export | TBD | Not Started |
| Phase 6 — Dark Mode | TBD | Not Started |
| Phase 7 — Performance | TBD | Not Started |
| Phase 8 — PWA | TBD | Not Started |

---

## Sprint 1 — Project Foundation

### Documentation

- [x] Create `README.md` with introduction, features, roadmap, tech stack
- [x] Create `README.md` installation and local run instructions
- [x] Create `README.md` GitHub Pages deployment section
- [x] Create `README.md` folder structure and contribution guide
- [x] Create `PROJECT_PLAN.md` with Phases 1–8
- [x] Create `PROJECT_STRUCTURE.md` with folder and data flow docs
- [x] Create `CODING_GUIDELINES.md` with conventions and design tokens
- [x] Create `TODO.md` with milestone checkboxes
- [x] Create `CHANGELOG.md`
- [x] Create `LICENSE` (MIT)

### Repository Setup

- [x] Create `.gitignore`
- [x] Create folder `assets/`
- [x] Create folder `css/`
- [x] Create folder `js/`
- [x] Create folder `data/`
- [x] Create folder `docs/`
- [ ] Initial commit on `main`
- [ ] Enable GitHub Pages on repository

---

## Phase 1 — Core Dashboard

### HTML Shell

- [ ] Create `index.html` with semantic landmarks
- [ ] Add skip link and `main` content region
- [ ] Add meta tags (viewport, description, theme-color)
- [ ] Wire ES module entry `js/main.js`

### Design System (CSS)

- [ ] Create `css/tokens.css` (colors, spacing, typography)
- [ ] Create `css/reset.css`
- [ ] Create `css/typography.css`
- [ ] Create `css/layout.css`
- [ ] Create `css/components/button.css`
- [ ] Create `css/components/card.css`
- [ ] Create `css/components/chart-wrapper.css`
- [ ] Create `css/components/table.css`
- [ ] Create `css/utilities.css`
- [ ] Create `css/main.css` import chain

### Vendor Assets

- [ ] Add Chart.js to `assets/vendor/chart.js/`
- [ ] Add Grid.js to `assets/vendor/gridjs/`
- [ ] Add Lucide to `assets/vendor/lucide/`
- [ ] Document vendor versions in CHANGELOG

### Data Layer

- [ ] Create `data/schema.json`
- [ ] Create `data/sample-new-hires.json` (synthetic data only)
- [ ] Implement `js/config.js`
- [ ] Implement `js/services/data-loader.js`
- [ ] Implement `js/state/store.js`
- [ ] Implement `js/state/selectors.js`

### Application Core

- [ ] Implement `js/main.js` entry bootstrap
- [ ] Implement `js/app.js` orchestration
- [ ] Implement `js/utils/date.js`
- [ ] Implement `js/utils/format.js`
- [ ] Implement `js/utils/dom.js`

### UI Components

- [ ] Implement `js/components/header.js`
- [ ] Implement `js/components/kpi-card.js`
- [ ] Implement `js/components/chart-panel.js`
- [ ] Implement `js/components/data-table.js`

### KPI Cards

- [ ] Total new hires (filtered period)
- [ ] Average time-to-hire
- [ ] Open / pending roles count
- [ ] Offer acceptance rate

### Charts

- [ ] Implement `js/charts/chart-theme.js`
- [ ] Implement `js/charts/hires-over-time.js` (line chart)
- [ ] Implement `js/charts/hires-by-department.js` (bar chart)
- [ ] Chart empty state when no data
- [ ] Chart loading state

### Data Table

- [ ] Grid.js integration with sortable columns
- [ ] Pagination (configurable page size)
- [ ] Column formatting (dates, status badges)

### Responsive & Accessibility

- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640–1023px)
- [ ] Desktop layout (≥ 1024px)
- [ ] Keyboard navigation for interactive elements
- [ ] ARIA labels for charts and KPI regions
- [ ] Lighthouse Accessibility ≥ 90

### Deployment

- [ ] Verify GitHub Pages live URL
- [ ] Add dashboard screenshot to `docs/screenshots/`
- [ ] Update README screenshots section

---

## Phase 2 — HR Analytics

### Routing / Views

- [ ] Hash-based or lightweight view switcher
- [ ] Analytics view layout shell
- [ ] Back navigation to dashboard

### Analytics Service

- [ ] Implement `js/services/analytics.js`
- [ ] Time-to-hire by department aggregation
- [ ] Source channel effectiveness metrics
- [ ] Offer-to-start conversion rate
- [ ] MoM / QoQ comparison helpers

### Filters

- [ ] Implement `js/components/filter-bar.js`
- [ ] Date range picker (start / end)
- [ ] Department multiselect
- [ ] Status filter
- [ ] Filter persistence in URL hash or store

### Visualizations

- [ ] Implement `js/charts/funnel.js`
- [ ] Source effectiveness chart
- [ ] Period comparison chart
- [ ] Drill-down from chart segment to filtered table

### Edge Cases

- [ ] Empty filter results state
- [ ] Partial date data handling
- [ ] Single-department dataset handling

---

## Phase 3 — Excel Upload

### Import Service

- [ ] Add SheetJS to `assets/vendor/sheetjs/`
- [ ] Implement `js/services/import.js`
- [ ] Parse `.xlsx` and `.xls` workbooks
- [ ] Column header detection and mapping
- [ ] Row-level validation against schema
- [ ] Duplicate ID detection

### Import UI

- [ ] Implement `js/components/import-dialog.js`
- [ ] Drag-and-drop upload zone
- [ ] File picker fallback
- [ ] Column mapping wizard
- [ ] Error list with row numbers
- [ ] Success summary (imported / skipped counts)

### Data Merge

- [ ] Replace dataset mode
- [ ] Merge / upsert by ID mode
- [ ] Implement `js/services/storage.js` for optional cache
- [ ] Document localStorage size limits

### Template

- [ ] Downloadable Excel template from UI
- [ ] Template documentation in `docs/`

### Validation Utils

- [ ] Implement `js/utils/validate.js`
- [ ] Date format normalization
- [ ] Enum validation for status field

---

## Phase 4 — AI Insight

### Rule-Based Engine (MVP)

- [ ] Implement `js/services/insights.js`
- [ ] Trend detection (hire volume up/down)
- [ ] Outlier flagging (department time-to-hire)
- [ ] Threshold-based alerts

### Insight UI

- [ ] Insight card component
- [ ] Dismiss / snooze interaction
- [ ] Regenerate on filter or data change
- [ ] Empty insights state

### Contextual Summaries

- [ ] "Explain this chart" for dashboard charts
- [ ] Screen-reader friendly summary text

### Optional LLM Integration

- [ ] Configurable external endpoint hook
- [ ] User consent dialog before sending data
- [ ] Graceful fallback when service unavailable
- [ ] Document privacy constraints in `docs/`

---

## Phase 5 — Export

### Export Service

- [ ] Add html2canvas to `assets/vendor/html2canvas/`
- [ ] Add jsPDF to `assets/vendor/jspdf/`
- [ ] Implement `js/services/export.js`
- [ ] Capture dashboard region to canvas
- [ ] Capture individual chart panels

### PDF Report

- [ ] Multi-page PDF layout
- [ ] Report header (title, date range, generated timestamp)
- [ ] KPI summary section in PDF
- [ ] Chart images embedded in PDF
- [ ] Footer with page numbers

### Other Formats

- [ ] Export filtered table to CSV
- [ ] Export chart as PNG download

### Print Styles

- [ ] Create `css/print.css`
- [ ] Hide navigation and filters in print view
- [ ] Page break rules for charts

---

## Phase 6 — Dark Mode

### Theme System

- [ ] Create `css/themes/light.css`
- [ ] Create `css/themes/dark.css`
- [ ] `[data-theme]` attribute on `<html>`
- [ ] Respect `prefers-color-scheme: dark`

### Theme Toggle

- [ ] Implement `js/components/theme-toggle.js`
- [ ] Persist preference in localStorage
- [ ] Prevent flash of wrong theme on load

### Component Theming

- [ ] Chart.js dark palette in `chart-theme.js`
- [ ] Grid.js dark styles
- [ ] Form controls and borders in dark mode

### Accessibility

- [ ] Contrast check all text pairs (WCAG AA)
- [ ] Focus ring visible in both themes

---

## Phase 7 — Performance

### Optimization

- [ ] Dynamic import for export module
- [ ] Dynamic import for import module
- [ ] Debounce filter updates (250 ms)
- [ ] Memoize selector outputs

### Web Workers

- [ ] Implement `js/workers/aggregate.js`
- [ ] Offload large aggregations from main thread
- [ ] Worker fallback for unsupported browsers

### Large Data

- [ ] Add `data/fixtures/large-10k.json` for testing
- [ ] Grid.js performance tuning for 10k rows
- [ ] Document performance budget in `docs/PERFORMANCE.md`

### Assets

- [ ] Audit vendor bundle sizes
- [ ] Lazy load non-critical CSS if applicable
- [ ] Lighthouse Performance ≥ 85

---

## Phase 8 — PWA

### Manifest

- [ ] Create `manifest.webmanifest`
- [ ] Add icons to `assets/icons/` (192, 512, maskable)
- [ ] Set theme and background colors

### Service Worker

- [ ] Create `sw.js`
- [ ] Cache static assets (cache-first)
- [ ] Cache last-known data (network-first with fallback)
- [ ] Offline fallback page

### Install Experience

- [ ] Register service worker in `main.js`
- [ ] Update available prompt for new deployments
- [ ] Test install on Chrome desktop and Android

### Verification

- [ ] Core dashboard readable offline
- [ ] Service worker does not corrupt localStorage imports

---

## Backlog / Future Ideas

- [ ] Multi-language support (i18n)
- [ ] Custom dashboard widget layout
- [ ] Scheduled email reports (requires backend — out of scope for static MVP)
- [ ] Integration with Zulip topic data source
- [ ] Role-based view permissions (requires auth backend)

---

## Definition of Done (Global)

A feature is complete when:

- [ ] Code follows [CODING_GUIDELINES.md](./CODING_GUIDELINES.md)
- [ ] Responsive and keyboard accessible
- [ ] No hardcoded metrics; data-driven from store
- [ ] User-visible changes noted in [CHANGELOG.md](./CHANGELOG.md)
- [ ] Works on GitHub Pages deployment URL
