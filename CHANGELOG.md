
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
