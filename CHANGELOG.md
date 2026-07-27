# Changelog

All notable changes to the HR New Hire Analytics Dashboard are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Sprint 2 UI foundation:
  - `index.html` — semantic dashboard shell with sidebar, header, KPI grid, chart placeholders, insight panel, and data table placeholder
  - `css/reset.css`, `css/variables.css`, `css/layout.css`, `css/components.css`, `css/dashboard.css`, `css/responsive.css`, `css/dark.css`
  - `js/app.js` — sidebar toggle, keyboard navigation, focus management (no dark mode logic)
  - Premium design system: Inter typography, Fabric/Power BI–inspired layout, 200ms transitions, responsive breakpoints
- Sprint 1 project foundation:
  - `README.md` — project overview, installation, GitHub Pages deployment
  - `PROJECT_PLAN.md` — phased delivery plan (Phases 1–8)
  - `PROJECT_STRUCTURE.md` — folder layout, JS module map, CSS architecture, data flow
  - `CODING_GUIDELINES.md` — naming, commits, responsive, a11y, performance, design tokens
  - `TODO.md` — milestone tracking with feature checkboxes
  - `CHANGELOG.md` — this file
  - `LICENSE` — MIT License
  - `.gitignore` — Node, OS, editor, and secret exclusions
  - Directory scaffold: `assets/`, `css/`, `js/`, `data/`, `docs/`

---

## Version History (Planned)

| Version | Milestone | Description |
|---------|-----------|-------------|
| 0.1.0 | Sprint 1 | Documentation and repository scaffold |
| 0.2.0 | Phase 1 | Core dashboard with KPIs, charts, table |
| 0.3.0 | Phase 2 | HR analytics views and filters |
| 0.4.0 | Phase 3 | Excel upload and validation |
| 0.5.0 | Phase 4 | AI / rule-based insights |
| 0.6.0 | Phase 5 | PDF and image export |
| 0.7.0 | Phase 6 | Dark mode |
| 0.8.0 | Phase 7 | Performance optimizations |
| 1.0.0 | Phase 8 | PWA, offline support, production release |

---

<!-- Release template:

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security-related changes

-->
