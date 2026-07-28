/**
 * filter.js
 * Sprint 3 — The ONE place filtering logic lives.
 *
 * KPI, charts, and table all call applyFilters(getAllRecords(), state)
 * so there is no duplicated filtering logic anywhere else in the app.
 */
import { parseISODate, normalizeText } from './utils.js';

/** Default/empty filter state. '' or 'all' means "no constraint" for that field. */
export function createDefaultFilterState() {
  return {
    year: 'all',
    month: 'all',       // 1-12 as string, or 'all'
    department: 'all',
    position: 'all',
    location: 'all',
    manager: 'all',
    search: ''
  };
}

/**
 * Apply the current filter state to a list of records.
 * Pure function — same input always produces same output, easy to test/reuse.
 */
export function applyFilters(records, state) {
  const search = normalizeText(state.search);

  return records.filter((r) => {
    const start = parseISODate(r.startDate);

    if (state.year !== 'all') {
      if (!start || String(start.getFullYear()) !== String(state.year)) return false;
    }
    if (state.month !== 'all') {
      if (!start || String(start.getMonth() + 1) !== String(state.month)) return false;
    }
    if (state.department !== 'all' && r.department !== state.department) return false;
    if (state.position !== 'all' && r.position !== state.position) return false;
    if (state.location !== 'all' && r.location !== state.location) return false;
    if (state.manager !== 'all' && r.manager !== state.manager) return false;

    if (search) {
      const haystack = normalizeText(
        `${r.employeeName} ${r.department} ${r.position} ${r.manager} ${r.location} ${r.status} ${r.note}`
      );
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

/** Build the list of years present in the dataset (for the Year filter options). */
export function getAvailableYears(records) {
  const years = new Set();
  for (const r of records) {
    const d = parseISODate(r.startDate);
    if (d) years.add(d.getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a); // newest first
}

export const MONTH_OPTIONS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
];
