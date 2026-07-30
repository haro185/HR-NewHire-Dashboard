/**
 * table.js
 * Renders the New Hire Records table: sortable columns, pagination
 * (20 rows/page), sticky header (CSS), responsive wrapper.
 *
 * Receives already-filtered records from app.js; owns only sort + page state.
 * Column labels and pagination text are re-translated on every render, so a
 * language toggle (which triggers a normal refreshAll()) updates them too.
 */
import { compareBy, formatDate, escapeHtml } from './utils.js';
import { t } from './i18n.js';

const PAGE_SIZE = 20;

const COLUMNS = [
  { field: 'employeeName', labelKey: 'table.col.name', type: 'string' },
  { field: 'department', labelKey: 'table.col.department', type: 'string' },
  { field: 'position', labelKey: 'table.col.position', type: 'string' },
  { field: 'manager', labelKey: 'table.col.manager', type: 'string' },
  { field: 'location', labelKey: 'table.col.location', type: 'string' },
  { field: 'startDate', labelKey: 'table.col.hiredate', type: 'date' },
  { field: 'status', labelKey: 'table.col.status', type: 'string' }
];

let state = {
  sortField: 'startDate',
  sortDirection: 'desc',
  page: 1
};

let tableEl = null;
let paginationEl = null;

function ensureDom() {
  if (tableEl) return;
  tableEl = document.querySelector('.data-table');
  if (!tableEl) return;

  // Build header structure once (click binding lives here); label TEXT is
  // refreshed separately on every render via updateHeaderLabels() so a
  // language toggle updates it without rebuilding the whole table.
  const thead = tableEl.querySelector('thead tr');
  if (thead) {
    thead.innerHTML = COLUMNS.map((col) => `
      <th scope="col">
        <button type="button" class="th-sort-btn" data-field="${col.field}" data-type="${col.type}">
          <span class="th-sort-label" data-label-for="${col.field}"></span>
          <span class="th-sort-icon" data-field-icon="${col.field}" aria-hidden="true"></span>
        </button>
      </th>
    `).join('');
    thead.addEventListener('click', onHeaderClick);
  }

  // Create a pagination bar under the table if one doesn't already exist.
  const panel = tableEl.closest('.table-panel');
  if (panel && !panel.querySelector('.table-panel__pagination')) {
    paginationEl = document.createElement('div');
    paginationEl.className = 'table-panel__pagination';
    panel.appendChild(paginationEl);
  } else if (panel) {
    paginationEl = panel.querySelector('.table-panel__pagination');
  }
}

function updateHeaderLabels() {
  for (const col of COLUMNS) {
    const labelEl = tableEl.querySelector(`[data-label-for="${col.field}"]`);
    if (labelEl) labelEl.textContent = t(col.labelKey);
  }
}

function onHeaderClick(e) {
  const btn = e.target.closest('.th-sort-btn');
  if (!btn) return;
  const field = btn.dataset.field;
  if (state.sortField === field) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortField = field;
    state.sortDirection = 'asc';
  }
  state.page = 1;
  renderTable(lastRecords);
}

let lastRecords = [];

/** Main entry point — called whenever the filtered dataset changes (or the language toggles). */
export function renderTable(records) {
  ensureDom();
  if (!tableEl) return;
  lastRecords = records;
  updateHeaderLabels();

  const colType = COLUMNS.find((c) => c.field === state.sortField)?.type || 'string';
  const sorted = [...records].sort(compareBy(state.sortField, state.sortDirection, colType));

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const startIdx = (state.page - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  renderRows(pageRows);
  updateSortIcons();
  renderPagination(sorted.length, totalPages);
}

function renderRows(rows) {
  const tbody = tableEl.querySelector('tbody');
  if (!tbody) return;
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${COLUMNS.length}" class="data-table__empty">${t('table.empty')}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${escapeHtml(r.employeeName)}</td>
      <td>${escapeHtml(r.department)}</td>
      <td>${escapeHtml(r.position)}</td>
      <td>${escapeHtml(r.manager)}</td>
      <td>${escapeHtml(r.location)}</td>
      <td>${formatDate(r.startDate)}</td>
      <td><span class="status-badge status-badge--${slug(r.status)}">${escapeHtml(r.status)}</span></td>
    </tr>
  `).join('');
}

function updateSortIcons() {
  for (const col of COLUMNS) {
    const icon = tableEl.querySelector(`[data-field-icon="${col.field}"]`);
    if (!icon) continue;
    icon.closest('th')?.setAttribute(
      'aria-sort',
      col.field === state.sortField && state.sortDirection === 'asc' ? 'ascending' : col.field === state.sortField ? 'descending' : 'none'
    );
    if (col.field === state.sortField) {
      icon.textContent = state.sortDirection === 'asc' ? '▲' : '▼';
    } else {
      icon.textContent = '';
    }
  }
}

function renderPagination(totalRows, totalPages) {
  if (!paginationEl) return;
  const from = totalRows === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(state.page * PAGE_SIZE, totalRows);

  paginationEl.innerHTML = `
    <p class="table-panel__pagination-info">${t('table.showing', { from, to, total: totalRows })}</p>
    <div class="table-panel__pagination-controls">
      <button type="button" class="pagination-btn" data-action="prev" ${state.page <= 1 ? 'disabled' : ''}>${t('table.prev')}</button>
      <span class="pagination-current">${t('table.page', { page: state.page, totalPages })}</span>
      <button type="button" class="pagination-btn" data-action="next" ${state.page >= totalPages ? 'disabled' : ''}>${t('table.next')}</button>
    </div>
  `;
  paginationEl.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    renderTable(lastRecords);
  });
  paginationEl.querySelector('[data-action="next"]')?.addEventListener('click', () => {
    state.page = state.page + 1;
    renderTable(lastRecords);
  });
}

function slug(status) {
  return String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Reset pagination — called by app.js when filters change so users land on page 1. */
export function resetTablePage() {
  state.page = 1;
}
