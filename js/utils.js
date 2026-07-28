/**
 * utils.js
 * Sprint 3 — Generic, reusable helper functions.
 * No data-shape knowledge and no DOM manipulation lives here.
 */

/** Parse an ISO date string ("YYYY-MM-DD") into a Date object (local, midnight). */
export function parseISODate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Format a Date (or ISO string) as "DD/MM/YYYY" for display. */
export function formatDate(input) {
  const date = input instanceof Date ? input : parseISODate(input);
  if (!date) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/** Return "YYYY-MM" key for a date/ISO string, used for month-based grouping. */
export function monthKey(input) {
  const date = input instanceof Date ? input : parseISODate(input);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Human-readable month label from a "YYYY-MM" key, e.g. "Jan 2024". */
export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[m - 1]} ${y}`;
}

/** Debounce a function call — used for search inputs. */
export function debounce(fn, delay = 250) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Get distinct, sorted, non-empty values for a given field across a list of records. */
export function distinctValues(records, field) {
  const set = new Set();
  for (const r of records) {
    if (r[field] !== undefined && r[field] !== null && r[field] !== '') set.add(r[field]);
  }
  return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
}

/** Escape a string for safe insertion into HTML. */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Normalize text for case/diacritic-insensitive search & matching (also used by upload.js). */
export function normalizeText(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .trim();
}

/** Simple stable sort comparator generator for string/number/date fields. */
export function compareBy(field, direction = 'asc', type = 'string') {
  const dir = direction === 'desc' ? -1 : 1;
  return (a, b) => {
    let va = a[field];
    let vb = b[field];
    if (type === 'date') {
      va = parseISODate(va)?.getTime() ?? 0;
      vb = parseISODate(vb)?.getTime() ?? 0;
    } else if (type === 'number') {
      va = Number(va) || 0;
      vb = Number(vb) || 0;
    } else {
      va = String(va ?? '').toLowerCase();
      vb = String(vb ?? '').toLowerCase();
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  };
}

/** Clamp a number between min and max. */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** A small deterministic color palette generator for chart series (accessible, repeatable). */
const PALETTE = [
  '#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED',
  '#0891B2', '#DB2777', '#65A30D', '#EA580C', '#4F46E5',
  '#0D9488', '#CA8A04', '#BE123C', '#4338CA', '#059669'
];
export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}
