# Sprint 3 & 4 — Review Notes

## Single data source
`js/data.js` is the only module holding the dataset (`rawRecords`). Sample load
(`loadSampleData`) and Excel/CSV import (`upload.js` → `setRecords`) both funnel
through the same setter, so there is exactly one source of truth at any time.
KPI, charts, table, and insight modules never read `data.json` or a workbook
directly — they only ever receive an already-filtered array from `app.js`.

## Single filtering pipeline
All filtering logic lives in `js/filter.js` (`applyFilters`). `app.js` calls it
once per state change and passes the same filtered array to `kpi.js`,
`charts.js`, `table.js`, and `insight.js`. No other module re-implements
year/month/department/position/location/manager/search matching.

## Duplication found & refactored during review
- Initially considered separate month-grouping code in both `charts.js` and
  `insight.js`. Kept the aggregation logic (`monthKey`/`monthLabel`) in
  `utils.js` so both modules call the same helpers instead of re-deriving
  month buckets.
- Consolidated color palette generation (`colorForIndex`) into `utils.js`
  rather than defining per-chart color arrays.
- `compareBy` (table sort) and `distinctValues` (KPI + filter option lists)
  are both shared in `utils.js` instead of being written twice.

## Performance notes
- Filtering, KPI computation, and chart aggregation are all O(n) single passes
  over the currently loaded dataset per refresh — no nested per-filter passes.
- Excel import reads the file as an `ArrayBuffer` via `FileReader` (does not
  block synchronously on huge files) and uses SheetJS `sheet_to_json` once;
  tested against a 5,000+ row synthetic sheet without UI freeze beyond the
  initial parse tick.
- Table pagination renders only the current 20-row page into the DOM rather
  than the full filtered set, keeping large datasets responsive.

## Stopping point
Per instructions, Sprint 4 work stops here. No Sprint 5 (Export) functionality
has been started.
