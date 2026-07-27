# HR New Hire Analytics Dashboard

A production-grade, client-side HR analytics platform for tracking, visualizing, and reporting on new hire data. Built with vanilla web technologies for zero build-step deployment on GitHub Pages.

---

## Project Introduction

The **HR New Hire Analytics Dashboard** transforms raw new-hire records into actionable insights for HR teams, hiring managers, and leadership. The application reads structured data (JSON and Excel), renders interactive charts and filterable tables, and supports export workflows — all without a backend server.

This repository is the foundation for a full **HR Analytics Platform**. Sprint 1 establishes project structure, documentation, and engineering standards. Application code begins in Phase 1.

---

## Features

### Planned (Roadmap)

| Area | Capability |
|------|------------|
| **Dashboard** | KPI cards, trend charts, department breakdowns |
| **Analytics** | Time-to-hire, source effectiveness, retention signals |
| **Data Import** | Excel upload via SheetJS with validation |
| **AI Insights** | Pattern detection and narrative summaries |
| **Export** | PDF reports and chart snapshots |
| **Theming** | Dark mode with persisted preference |
| **Performance** | Lazy loading, virtualized tables, cached aggregates |
| **PWA** | Offline access and installable app shell |

### Current (Sprint 1)

- Project documentation and coding standards
- Folder structure and `.gitignore`
- Milestone tracking in `TODO.md`
- Changelog and license

---

## Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 1 | Core Dashboard | Planned |
| 2 | HR Analytics | Planned |
| 3 | Excel Upload | Planned |
| 4 | AI Insight | Planned |
| 5 | Export | Planned |
| 6 | Dark Mode | Planned |
| 7 | Performance | Planned |
| 8 | PWA | Planned |

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed scope per phase.

---

## Technology

| Layer | Stack |
|-------|-------|
| Markup | HTML5 (semantic, accessible) |
| Styling | CSS3 (custom design system, no Bootstrap/Tailwind) |
| Logic | Vanilla JavaScript (ES2022 modules) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Spreadsheets | [SheetJS (xlsx)](https://sheetjs.com/) |
| Tables | [Grid.js](https://gridjs.io/) |
| Icons | [Lucide Icons](https://lucide.dev/) |
| Screenshots | [html2canvas](https://html2canvas.hertzen.com/) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) |
| Hosting | GitHub Pages |

**Explicitly excluded:** React, Vue, Angular, Bootstrap, Tailwind.

---

## Installation

### Prerequisites

- [Git](https://git-scm.com/)
- A modern browser (Chrome, Firefox, Safari, Edge — latest two versions)
- Optional: [Python 3](https://www.python.org/) or [Node.js](https://nodejs.org/) for local static server

### Clone the repository

```bash
git clone https://github.com/<your-org>/HR-NewHire-Dashboard.git
cd HR-NewHire-Dashboard
```

No `npm install` or build step is required. Third-party libraries will be vendored under `assets/vendor/` in later phases.

---

## Run Locally

Because the app is static, serve the project root over HTTP (avoid `file://` for module loading and future PWA support).

### Option A — Python

```bash
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

### Option B — Node.js (npx)

```bash
npx serve .
```

### Option C — VS Code / Cursor

Use the **Live Server** extension and open the project root.

> **Note:** `index.html` and application assets will be added in Phase 1. Until then, verify the server by listing the directory or opening documentation files.

---

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select branch `main` (or `gh-pages`) and folder `/ (root)`.
5. Save. The site will be available at `https://<username>.github.io/HR-NewHire-Dashboard/`.

### Custom domain (optional)

Add a `CNAME` file at the repository root and configure DNS with your provider.

### Base path

If the repository name differs from the URL path, set `<base href="...">` in `index.html` (Phase 1) so assets resolve correctly.

---

## Folder Structure

```
HR-NewHire-Dashboard/
├── assets/          # Static assets (images, fonts, vendor libraries)
├── css/             # Stylesheets (design tokens, components, layout)
├── js/              # Application modules (ES2022)
├── data/            # Sample and cached datasets (JSON)
├── docs/            # Supplementary documentation
├── README.md
├── PROJECT_PLAN.md
├── PROJECT_STRUCTURE.md
├── CODING_GUIDELINES.md
├── TODO.md
├── CHANGELOG.md
└── LICENSE
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for file-level conventions.

---

## Screenshots

> Placeholder — screenshots will be added as features ship.

| View | Preview |
|------|---------|
| Dashboard Overview | _Coming in Phase 1_ |
| Analytics Detail | _Coming in Phase 2_ |
| Excel Import | _Coming in Phase 3_ |
| Dark Mode | _Coming in Phase 6_ |

<!-- Replace with actual images, e.g.:
![Dashboard Overview](./docs/screenshots/dashboard-overview.png)
-->

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Contribution

1. Read [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) before submitting changes.
2. Check [TODO.md](./TODO.md) for open milestones and claim a scoped item.
3. Fork the repository and create a feature branch (`feat/phase-1-kpi-cards`).
4. Follow [Conventional Commits](https://www.conventionalcommits.org/) (see coding guidelines).
5. Update [CHANGELOG.md](./CHANGELOG.md) under **Unreleased** for user-visible changes.
6. Open a pull request with a clear description and test plan.

For architectural decisions, propose updates to `PROJECT_PLAN.md` or `docs/` before large refactors.

Questions and discussions: open a GitHub Issue with the `question` label.
