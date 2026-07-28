/**
 * data.js
 * Sprint 3/4 — Single source of truth for employee records.
 *
 * This module owns the ONE canonical dataset the whole app reads from.
 * Every other module (kpi, charts, table, filter, upload) must go through
 * this module's getters/setters — never hold its own private copy.
 */

let rawRecords = [];      // full dataset currently loaded (sample OR uploaded)
let dataSource = 'sample'; // 'sample' | 'upload'
const listeners = new Set();

/** Subscribe to dataset replacement events (used by app.js to trigger a full refresh). */
export function onDataChanged(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  for (const cb of listeners) cb(getAllRecords());
}

/** Load the bundled sample.json (Sprint 3 default data source). */
export async function loadSampleData() {
  const res = await fetch('data/sample.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load sample data: ${res.status}`);
  const json = await res.json();
  rawRecords = normalizeRecords(json);
  dataSource = 'sample';
  notify();
  return rawRecords;
}

/**
 * Replace the entire dataset (used by Sprint 4 Excel/CSV import).
 * This is the ONLY other way records enter the app — keeps "one data source" true.
 */
export function setRecords(records, source = 'upload') {
  rawRecords = normalizeRecords(records);
  dataSource = source;
  notify();
  return rawRecords;
}

/** Basic shape/defensive normalization so downstream modules never see undefined fields. */
function normalizeRecords(records) {
  return (records || []).map((r, idx) => ({
    id: r.id ?? `ROW${idx + 1}`,
    employeeName: r.employeeName ?? '',
    gender: r.gender ?? '',
    birthday: r.birthday ?? '',
    department: r.department ?? 'Unassigned',
    position: r.position ?? 'Unassigned',
    manager: r.manager ?? 'Unassigned',
    location: r.location ?? 'Unassigned',
    startDate: r.startDate ?? '',
    status: r.status ?? 'Active',
    note: r.note ?? ''
  }));
}

/** Returns the full, unfiltered dataset. */
export function getAllRecords() {
  return rawRecords;
}

export function getDataSource() {
  return dataSource;
}

export function getRecordCount() {
  return rawRecords.length;
}
