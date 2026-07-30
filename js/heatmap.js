/**
 * Department-by-month hiring heatmap.
 * The public entry point and drilldown payload intentionally remain unchanged.
 */
import { requestDrilldownMulti } from './drilldown.js';
import { t, formatMonthCompact, formatMonthFull } from './i18n.js';

const INTENSITY_STEPS = 5;
const DEFAULT_DEPARTMENT_LIMIT = 15;

let showAllDepartments = false;
let monthRangeMode = 12; // 6 | 12 | 'all'

export function setHeatmapMonthRange(mode) {
  monthRangeMode = mode;
}
export function getHeatmapMonthRange() {
  return monthRangeMode;
}

export function renderHeatmap(analytics) {
  const container = document.getElementById('heatmap-grid');
  const legend = document.getElementById('heatmap-legend');
  if (!container || !analytics) return;

  const { deptByMonth, series } = analytics;
  const allMonths = series.monthly.map(({ key }) => key);
  const months = monthRangeMode === 'all' ? allMonths : allMonths.slice(-monthRangeMode);
  const departmentRows = getDepartmentRows(deptByMonth, months);
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

/** Only totals hires within the currently visible month range (so sorting/limit reflect the active range). */
function getDepartmentRows(deptByMonth, months) {
  const monthSet = new Set(months);
  return [...deptByMonth.entries()]
    .map(([department, monthMap]) => ({
      department,
      monthMap,
      total: [...monthMap.entries()].reduce((sum, [m, count]) => sum + (monthSet.has(m) ? count : 0), 0)
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total || a.department.localeCompare(b.department));
}

function renderHeader(months) {
  return `<div class="heatmap-row heatmap-row--header" role="row">
    <div class="heatmap-cell heatmap-cell--label heatmap-cell--corner" role="columnheader">${t('filters.department')}</div>
    ${months.map((month) => `<div class="heatmap-cell heatmap-cell--col-label" role="columnheader" title="${formatMonthFull(month)}">${formatMonthCompact(month)}</div>`).join('')}
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
  const monthLabel = formatMonthFull(month);
  const tooltip = t('heatmap.cellAria', { dept: department, month: monthLabel, count });

  return `<button type="button" class="heatmap-cell heatmap-cell--data" data-level="${level}"
    data-dept="${escapeHtml(department)}" data-month="${month}"
    aria-label="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}">
    ${count || ''}
  </button>`;
}

function renderFooter(visibleDepartments, totalDepartments) {
  const canToggle = totalDepartments > DEFAULT_DEPARTMENT_LIMIT;
  const button = canToggle
    ? `<button type="button" class="heatmap-toggle" data-heatmap-toggle aria-expanded="${showAllDepartments}">
        ${showAllDepartments ? t('heatmap.collapse') : t('heatmap.showAll')}
      </button>`
    : '';

  return `<div class="heatmap-footer">
    <span>${t('heatmap.showingDepartments', { visible: visibleDepartments, total: totalDepartments })}</span>
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
    `${department} · ${formatMonthFull(monthKey)}`
  );
}

/** Re-render using the last-known analytics snapshot — avoids a second data walk or API change. */
export function renderHeatmapFromCurrentView() {
  const container = document.getElementById('heatmap-grid');
  if (container?._heatmapAnalytics) renderHeatmap(container._heatmapAnalytics);
}

function renderEmptyState(container, legend) {
  container.innerHTML = `<p class="heatmap-empty">${t('heatmap.empty')}</p>`;
  if (legend) legend.innerHTML = '';
}

function renderLegend(legend) {
  if (!legend) return;
  legend.innerHTML = `<span class="heatmap-legend__label">${t('heatmap.less')}</span>
    ${Array.from({ length: INTENSITY_STEPS }, (_, level) => `<span class="heatmap-cell heatmap-cell--legend" data-level="${level}"></span>`).join('')}
    <span class="heatmap-legend__label">${t('heatmap.more')}</span>`;
}

function intensityFor(count, maxCount) {
  if (!count) return 0;
  return Math.min(INTENSITY_STEPS - 1, Math.ceil((count / maxCount) * (INTENSITY_STEPS - 1)));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
