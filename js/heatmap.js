/**
 * heatmap.js
 * Sprint 6 — GitHub-style hiring heatmap.
 * Rows = departments, Columns = months, Cell color intensity = hiring count.
 * Rendered as a CSS grid (no canvas needed) so it stays crisp at any zoom
 * and is easy to make keyboard-navigable.
 */
import { requestDrilldownMulti } from './drilldown.js';

const INTENSITY_STEPS = 5; // 0..4, GitHub-style buckets

export function renderHeatmap(analytics) {
  const container = document.getElementById('heatmap-grid');
  const legend = document.getElementById('heatmap-legend');
  if (!container || !analytics) return;

  const { deptByMonth, series } = analytics;
  const months = series.monthly.map((m) => m.key); // sorted "YYYY-MM"
  const departments = [...deptByMonth.keys()].sort();

  if (departments.length === 0 || months.length === 0) {
    container.innerHTML = '<p class="heatmap-empty">No data available for the current filters.</p>';
    if (legend) legend.innerHTML = '';
    return;
  }

  const maxCount = Math.max(1, ...departments.map((d) =>
    Math.max(0, ...months.map((m) => deptByMonth.get(d)?.get(m) || 0))
  ));

  const monthLabels = months.map((k) => {
    const [y, m] = k.split('-');
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m, 10) - 1]} '${y.slice(2)}`;
  });

  let html = `<div class="heatmap-row heatmap-row--header">
      <div class="heatmap-cell heatmap-cell--label" aria-hidden="true"></div>
      ${monthLabels.map((l) => `<div class="heatmap-cell heatmap-cell--col-label">${l}</div>`).join('')}
    </div>`;

  for (const dept of departments) {
    const monthMap = deptByMonth.get(dept);
    html += `<div class="heatmap-row">
      <div class="heatmap-cell heatmap-cell--label" title="${escapeHtml(dept)}">${escapeHtml(dept)}</div>
      ${months.map((m) => {
        const count = monthMap.get(m) || 0;
        const level = count === 0 ? 0 : Math.min(INTENSITY_STEPS - 1, Math.ceil((count / maxCount) * (INTENSITY_STEPS - 1)));
        return `<button type="button" class="heatmap-cell heatmap-cell--data" data-level="${level}"
          data-dept="${escapeHtml(dept)}" data-month="${m}"
          aria-label="${escapeHtml(dept)}, ${monthLabelFor(m)}: ${count} hire(s)"
          title="${escapeHtml(dept)} — ${monthLabelFor(m)}: ${count} hire(s)">
          ${count > 0 ? count : ''}
        </button>`;
      }).join('')}
    </div>`;
  }

  container.innerHTML = html;
  container.style.setProperty('--heatmap-cols', months.length);

  container.querySelectorAll('.heatmap-cell--data').forEach((cell) => {
    cell.addEventListener('click', () => {
      const dept = cell.dataset.dept;
      const monthKey = cell.dataset.month;
      const [, m] = monthKey.split('-');
      requestDrilldownMulti({ department: dept, month: String(parseInt(m, 10)) }, `${dept} · ${monthLabelFor(monthKey)}`);
    });
  });

  if (legend) {
    legend.innerHTML = `
      <span class="heatmap-legend__label">Less</span>
      ${Array.from({ length: INTENSITY_STEPS }).map((_, i) => `<span class="heatmap-cell heatmap-cell--legend" data-level="${i}"></span>`).join('')}
      <span class="heatmap-legend__label">More</span>
    `;
  }
}

function monthLabelFor(key) {
  const [y, m] = key.split('-');
  return `${['January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(m, 10) - 1]} ${y}`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
