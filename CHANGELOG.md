
## Sprint 3 — Core Dashboard Wired to Sample Data
- Added `data/sample.json` with 130 realistic employee records.
- Added modular JS: `utils.js`, `data.js`, `filter.js`, `kpi.js`, `charts.js`, `table.js`.
- Wired 6 Chart.js visualizations: Hiring Trend, Department, Position, Location, Manager, Timeline.
- Implemented 6 KPI cards + Average Hiring/Month.
- Implemented combined filters (Year, Month, Department, Position, Location, Manager, Search) — all compose together.
- Implemented sortable, paginated (20/page), searchable, sticky-header data table.
- Single shared filtering pipeline (`filter.js`) — no duplicated filter logic across modules.

## Sprint 4 — Excel/CSV Import
- Added `js/upload.js` using SheetJS (`xlsx`) to import `.xlsx`, `.xls`, `.csv`.
- Automatic column mapping with Vietnamese + English header recognition.
- Missing-required-column warning banner.
- Import replaces the single dataset and refreshes KPIs, charts, filters, table, and AI Insight — no page reload.
- Streaming ArrayBuffer read supports large files (5000+ rows) without blocking the main thread for long.

## Sprint 5 — HR Analytics Engine
- Added `js/statistics.js` (mean, median, mode, min, max, std dev, linear trend, % change, concentration index).
- Added `js/analytics.js` — single-pass HR analytics engine (totals, top hiring dept/position/manager/location, fastest growing department, monthly/quarterly/yearly growth, hiring distribution, concentration, manager workload, peak/lowest month, top-10 lists). Memoized against the current filtered array reference.
- Extended `js/insight.js` (non-destructively) with `generateInsightSentences()` (data-driven natural language, no hardcoded business sentences) and `generateWarnings()` (missing manager/department/start date, future start date, duplicate employee, department concentration, manager workload imbalance).
- New "HR Analytics" advanced KPI grid (Title/Value/Status/Tooltip) and "AI Insights" bullet list + warnings panel, wired additively in `index.html` and `app.js`.
- Did not modify `filter.js`, `upload.js`, `charts.js`, `data.js`, `table.js`, or `kpi.js`.

## Sprint 6 — Enterprise Visualization Layer
- Added `js/visualization.js` — global Chart.js defaults upgrade (animation easing, tooltip styling, resize handling via rAF) applied to every chart including the original six; plus new Hiring Growth (monthly/quarterly/yearly), Department/Manager Ranking (Top 10/20/All), and Location Donut charts with click-to-drilldown and PNG export.
- Added `js/heatmap.js` — GitHub-style Department × Month heatmap (CSS grid, 5-step intensity, hover tooltip, legend, click-to-drilldown).
- Added `js/timeline.js` — onboarding timeline, one event per employee, grouped by Month/Quarter/Year toggle, click-to-drilldown on group headers.
- Added `js/drilldown.js` — cross-chart/cross-filter pub-sub; every visualization module reports clicks here instead of touching filter state directly.
- Added `js/animation.js` — number count-up animation, fade-in, loading skeleton/shimmer helpers.
- Did not modify `filter.js`, `upload.js`, `data.js`, `table.js`, or `kpi.js`; `charts.js` (the original 6 charts) is untouched code-wise but visually upgraded via global Chart.js defaults.

## Hotfix — Excel Import Column Mapping
- Fixed `normalizeText()` (js/utils.js): the Vietnamese letter "đ" is a distinct
  Unicode character (U+0111), not a combining-diacritic form, so it was not
  being stripped by `.normalize('NFD')`. This caused the header
  "Ngày bắt đầu làm việc" to fail matching the `startDate` alias
  ("ngay bat dau lam viec"), producing the false
  "could not recognize required column(s): startDate" warning on import.
- Fixed `toIsoDate()` (js/upload.js): the anchored regex only matched a bare
  "DD/MM/YYYY" string. Real exports often prefix the date with a Vietnamese
  weekday label (e.g. "Thứ Hai, ngày 13/10/2025"), which silently failed to
  parse. The regex now searches for a DD/MM/YYYY pattern anywhere in the
  cell text, with range validation to avoid false positives.
- Fixed `mapHeaderToField()` (js/upload.js): the loose "contains" fallback
  caused a false match — "Ngày phỏng vấn" (interview date) was being mapped
  onto `department` because Vietnamese diacritic-stripping collapses "phòng"
  (department/room) and "phỏng" (as in "phỏng vấn") to the same ASCII string
  "phong". The fallback now requires the match to anchor at the start of the
  header and prefers the longest matching alias, eliminating the collision
  while keeping short department aliases working for real department headers.
- Verified against the user's actual 121-row "Nhân sự mới" export: 0 missing
  required columns, 0 empty startDate/department/position/employeeName after
  the fix (previously all rows lost their department value due to the second
  bug above).

## Update — Bilingual (EN/VI) Dashboard + UX Fixes
- Added `js/i18n.js`: full English/Vietnamese dictionary (~90 keys), language
  persisted in localStorage, `t()` translator with `{{var}}` interpolation,
  and language-aware month/quarter formatters used by charts, heatmap, and
  timeline instead of hardcoded English date labels.
- Added a language toggle button (`#lang-toggle`, VI/EN) in the sidebar;
  switching language re-translates all static labels and re-renders every
  dynamic view (KPIs, charts, table, insights, warnings, heatmap, timeline)
  in one pass, the same pipeline as a filter change.
- Tagged all static text in `index.html` with `data-i18n` / `data-i18n-attr`
  (79+ keys verified present in both languages); updated `insight.js`,
  `kpi.js`, `analytics.js`, `table.js`, `upload.js`, `visualization.js`,
  `heatmap.js` to generate their dynamic text via `t()` instead of hardcoded
  strings.
- Fixed Growth & Rankings charts stretching on browser zoom: removed a
  manual `window.resize` listener in `visualization.js` that fought with
  Chart.js's own ResizeObserver-based resizing (root cause of the runaway
  growth); added `Chart.defaults.resizeDelay` and firmer CSS containment
  (`overflow:hidden` + absolutely-positioned canvas). Also shrank those four
  charts via a new `.chart-panel__body--compact` class (220px/280px).
- Fixed the Hiring Heatmap: added a 6 months / 12 months / All time range
  filter so it no longer sprawls from 2024 to present by default; switched
  the column grid from fixed 34px cells to `minmax(30px, 1fr)` so it fills
  the card width instead of leaving empty space on the right.
- Reworked the Onboarding Timeline: groups now sort most-recent-first
  (previously oldest-first), and events render as a balanced auto-fill card
  grid instead of wrapped pill tags.
- Reworded the "future start date" warning: previously described these as
  generic "records"; since a future start date means the person hasn't
  actually started yet, they're now described as "Ứng viên" (candidates) /
  "candidate(s)" — incoming hires, not active employees.
- Wired the left sidebar navigation: clicking a menu item now smooth-scrolls
  the actual scroll container (`.main`, which uses `overflow-y: auto` — not
  the window) to the matching section, updates the active link state, closes
  the mobile sidebar, and an IntersectionObserver-based scroll-spy keeps the
  active link in sync while scrolling.
