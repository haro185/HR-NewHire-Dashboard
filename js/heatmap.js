/**
 * Department-by-month hiring heatmap.
 * The public entry point and drilldown payload intentionally remain unchanged.
 */
import { requestDrilldownMulti } from './drilldown.js';

const INTENSITY_STEPS = 5;
const DEFAULT_DEPARTMENT_LIMIT = 15;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let showAllDepartments = false;

export function renderHeatmap(analytics) {
  const container = document.getElementById('heatmap-grid');
  const legend = document.getElementById('heatmap-legend');
  if (!container || !analytics) return;

  const { deptByMonth, series } = analytics;
  const months = series.monthly.map(({ key }) => key);
  const departmentRows = getDepartmentRows(deptByMonth);
  container._heatmapAnalytics = analytics;

  if (!departmentRows.length || !months.length) {
    renderEmptyState(container, legend);
    return;
  }

  const visibleRows = showAllDepartments
    ? departmentRows
    : departmentRows.slice(0, DEFAULT_DEPARTMENT_LIMIT);
  const maxCount = Math.max(1, ...departmentRows.flatMap(({ monthMap }) =>
    months.map((month) => monthMap.get(month) || 0)
  ));

  container.style.setProperty('--heatmap-cols', months.length);
  container.innerHTML = [
    renderHeader(months),
    ...visibleRows.map((row) => renderDepartmentRow(row, months, maxCount)),
    renderFooter(visibleRows.length, departmentRows.length)
  ].join('');

  if (!container.dataset.heatmapClickBound) {
    container.addEventListener('click', handleHeatmapClick);
    container.dataset.heatmapClickBound = 'true';
  }
  renderLegend(legend);
}

function getDepartmentRows(deptByMonth) {
  return [...deptByMonth.entries()]
    .map(([department, monthMap]) => ({
      department,
      monthMap,
      total: [...monthMap.values()].reduce((sum, count) => sum + count, 0)
    }))
    .sort((a, b) => b.total - a.total || a.department.localeCompare(b.department));
}

function renderHeader(months) {
  return `<div class="heatmap-row heatmap-row--header" role="row">
    <div class="heatmap-cell heatmap-cell--label heatmap-cell--corner" role="columnheader">Department</div>
    ${months.map((month) => `<div class="heatmap-cell heatmap-cell--col-label" role="columnheader" title="${monthLabelFor(month)}">${shortMonthLabelFor(month)}</div>`).join('')}
  </div>`;
}

function renderDepartmentRow({ department, monthMap }, months, maxCount) {
  const safeDepartment = escapeHtml(department);
  return `<div class="heatmap-row" role="row">
    <div class="heatmap-cell heatmap-cell--label" role="rowheader" title="${safeDepartment}">${safeDepartment}</div>
    ${months.map((month) => renderDataCell(department, month, monthMap.get(month) || 0, maxCount)).join('')}
  </div>`;
}

function renderDataCell(department, month, count, maxCount) {
  const level = intensityFor(count, maxCount);
  const monthLabel = monthLabelFor(month);
  const safeDepartment = escapeHtml(department);
  const tooltip = `${department} — ${monthLabel}: ${count} ${count === 1 ? 'hire' : 'hires'}`;

  return `<button type="button" class="heatmap-cell heatmap-cell--data" data-level="${level}"
    data-dept="${safeDepartment}" data-month="${month}"
    aria-label="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}">
    ${count || ''}
  </button>`;
}

function renderFooter(visibleDepartments, totalDepartments) {
  const canToggle = totalDepartments > DEFAULT_DEPARTMENT_LIMIT;
  const button = canToggle
    ? `<button type="button" class="heatmap-toggle" data-heatmap-toggle aria-expanded="${showAllDepartments}">
        ${showAllDepartments ? 'Collapse' : 'Show All'}
      </button>`
    : '';

  return `<div class="heatmap-footer">
    <span>Showing ${visibleDepartments} / ${totalDepartments} departments</span>
    ${button}
  </div>`;
}

function handleHeatmapClick(event) {
  const toggle = event.target.closest('[data-heatmap-toggle]');
  if (toggle) {
    showAllDepartments = !showAllDepartments;
    renderHeatmapFromCurrentView();
    return;
  }

  const cell = event.target.closest('.heatmap-cell--data');
  if (!cell) return;

  const { dept: department, month: monthKey } = cell.dataset;
  const [, month] = monthKey.split('-');
  requestDrilldownMulti(
    { department, month: String(parseInt(month, 10)) },
    `${department} · ${monthLabelFor(monthKey)}`
  );
}

function renderHeatmapFromCurrentView() {
  // The analytics object is retained on the element, avoiding a second data walk or API change.
  const container = document.getElementById('heatmap-grid');
  if (container?._heatmapAnalytics) renderHeatmap(container._heatmapAnalytics);
}

function renderEmptyState(container, legend) {
  container.innerHTML = '<p class="heatmap-empty">No data available for the current filters.</p>';
  if (legend) legend.innerHTML = '';
}

function renderLegend(legend) {
  if (!legend) return;
  legend.innerHTML = `<span class="heatmap-legend__label">Less</span>
    ${Array.from({ length: INTENSITY_STEPS }, (_, level) => `<span class="heatmap-cell heatmap-cell--legend" data-level="${level}"></span>`).join('')}
    <span class="heatmap-legend__label">More</span>`;
}

function intensityFor(count, maxCount) {
  if (!count) return 0;
  return Math.min(INTENSITY_STEPS - 1, Math.ceil((count / maxCount) * (INTENSITY_STEPS - 1)));
}

function shortMonthLabelFor(key) {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1].slice(0, 3)} '${year.slice(2)}`;
}

function monthLabelFor(key) {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
