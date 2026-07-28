/**
 * app.js
 * Sprint 3-6 — Orchestrator only. No business logic lives here directly;
 * it wires together data.js, filter.js, kpi.js, charts.js, table.js,
 * insight.js, upload.js (Sprint 3/4) and analytics.js, visualization.js,
 * heatmap.js, timeline.js, drilldown.js, animation.js (Sprint 5/6).
 */
import { loadSampleData, getAllRecords, onDataChanged } from './data.js';
import { createDefaultFilterState, applyFilters, getAvailableYears, MONTH_OPTIONS } from './filter.js';
import { computeKpis, renderKpis } from './kpi.js';
import { renderAllCharts } from './charts.js';
import { renderTable, resetTablePage } from './table.js';
import { renderInsight } from './insight.js';
import { initUpload } from './upload.js';
import { distinctValues, debounce } from './utils.js';

// Sprint 5 — HR Analytics Engine
import { computeAnalytics, invalidateAnalyticsCache, renderAdvancedKpis } from './analytics.js';
import { renderInsightsPanel } from './insight.js';

// Sprint 6 — Visualization layer
import {
  upgradeChartEngineDefaults, renderGrowthChart, renderRankingChart, renderLocationDonut,
  setGrowthGranularity, setRankingLimit, getRankingLimit, exportChartAsPng
} from './visualization.js';
import { renderHeatmap } from './heatmap.js';
import { renderTimeline, setTimelineZoom } from './timeline.js';
import { onDrilldown, drilldownToFilterPatch, resetDrilldown, getActiveDrilldown } from './drilldown.js';
import { animateAllNumbers } from './animation.js';

let filterState = createDefaultFilterState();

const FILTER_SELECTS = {
  year: 'filter-year',
  month: 'filter-month',
  department: 'filter-department',
  position: 'filter-position',
  location: 'filter-location',
  manager: 'filter-manager'
};

/** Single refresh pipeline — every module reads from the SAME filtered array. */
function refreshAll() {
  const all = getAllRecords();
  const filtered = applyFilters(all, filterState);

  renderKpis(computeKpis(filtered));
  renderAllCharts(filtered);
  renderTable(filtered);
  renderInsight(filtered);
  updateLastUpdated();

  // Sprint 5: one analytics computation, reused by KPIs + insights + warnings.
  const analytics = computeAnalytics(filtered);
  renderAdvancedKpis(analytics);
  renderInsightsPanel(analytics, filtered.length);

  // Sprint 6: visualization layer reads the SAME analytics/filtered data —
  // no separate filtering or aggregation logic duplicated here.
  renderGrowthChart(analytics);
  renderRankingChart('department', analytics, getRankingLimit('department'));
  renderRankingChart('manager', analytics, 10);
  renderLocationDonut(analytics);
  renderHeatmap(analytics);
  renderTimeline(filtered);

  animateAllNumbers(document.getElementById('advanced-kpi-grid'));
  updateDrilldownBanner();
}

function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const now = new Date();
  el.dateTime = now.toISOString();
  el.textContent = now.toLocaleString();
}

/** Rebuild filter dropdown options from the current full dataset (called on load + on import). */
function populateFilterOptions() {
  const all = getAllRecords();

  setOptions(FILTER_SELECTS.year, getAvailableYears(all).map((y) => ({ value: String(y), label: String(y) })), 'All years');
  setOptions(FILTER_SELECTS.month, MONTH_OPTIONS, 'All months');
  setOptions(FILTER_SELECTS.department, toOptions(distinctValues(all, 'department')), 'All departments');
  setOptions(FILTER_SELECTS.position, toOptions(distinctValues(all, 'position')), 'All positions');
  setOptions(FILTER_SELECTS.location, toOptions(distinctValues(all, 'location')), 'All locations');
  setOptions(FILTER_SELECTS.manager, toOptions(distinctValues(all, 'manager')), 'All managers');
}

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

function setOptions(selectId, options, allLabel) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const previousValue = select.value || 'all';
  select.innerHTML = `<option value="all">${allLabel}</option>` +
    options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
  // Preserve the user's current selection if it still exists in the new option list.
  const stillValid = previousValue === 'all' || options.some((o) => String(o.value) === previousValue);
  select.value = stillValid ? previousValue : 'all';
  if (!stillValid) {
    const key = Object.keys(FILTER_SELECTS).find((k) => FILTER_SELECTS[k] === selectId);
    if (key) filterState[key] = 'all';
  }
}

function bindFilterEvents() {
  for (const [key, id] of Object.entries(FILTER_SELECTS)) {
    const select = document.getElementById(id);
    if (!select) continue;
    select.addEventListener('change', () => {
      filterState[key] = select.value;
      resetTablePage();
      refreshAll();
    });
  }

  const debouncedSearch = debounce((value) => {
    filterState.search = value;
    resetTablePage();
    refreshAll();
  }, 200);

  const tableSearch = document.getElementById('table-search');
  const globalSearch = document.getElementById('global-search');

  tableSearch?.addEventListener('input', (e) => {
    if (globalSearch) globalSearch.value = e.target.value;
    debouncedSearch(e.target.value);
  });
  globalSearch?.addEventListener('input', (e) => {
    if (tableSearch) tableSearch.value = e.target.value;
    debouncedSearch(e.target.value);
  });

  document.getElementById('filter-reset')?.addEventListener('click', () => {
    filterState = createDefaultFilterState();
    if (tableSearch) tableSearch.value = '';
    if (globalSearch) globalSearch.value = '';
    for (const id of Object.values(FILTER_SELECTS)) {
      const select = document.getElementById(id);
      if (select) select.value = 'all';
    }
    resetTablePage();
    refreshAll();
  });
}

function bindSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggleBtn || !sidebar || !overlay) return;

  const close = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };
  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });
  overlay.addEventListener('click', close);
}

/* ===================================================================
 * Sprint 6 — Visualization controls wiring
 * =================================================================== */

function bindSegmented(containerId, dataAttr, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented__btn');
    if (!btn) return;
    container.querySelectorAll('.segmented__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    onSelect(btn.dataset[dataAttr]);
  });
}

function bindVisualizationControls() {
  bindSegmented('growth-mode-toggle', 'mode', (mode) => {
    setGrowthGranularity(mode);
    refreshAll();
  });

  bindSegmented('ranking-department-toggle', 'limit', (limit) => {
    setRankingLimit('department', limit === 'all' ? 'all' : parseInt(limit, 10));
    refreshAll();
  });

  bindSegmented('timeline-zoom-toggle', 'zoom', (zoom) => {
    setTimelineZoom(zoom);
    refreshAll();
  });

  // Export any chart canvas as PNG — reusable across every chart panel.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.chart-export-btn');
    if (!btn) return;
    exportChartAsPng(btn.dataset.exportCanvas, btn.dataset.exportName);
  });
}

/** Sprint 6 — cross-chart / cross-filter drill-down wiring. */
function bindDrilldown() {
  onDrilldown((drilldown) => {
    if (!drilldown) {
      filterState = createDefaultFilterState();
      syncFilterUiFromState();
    } else {
      const patch = drilldownToFilterPatch(drilldown);
      Object.assign(filterState, patch);
      syncFilterUiFromState();
    }
    resetTablePage();
    refreshAll();
  });

  document.getElementById('drilldown-clear')?.addEventListener('click', () => resetDrilldown());
}

/** Reflect the current filterState back onto the <select> controls (used after a drilldown click). */
function syncFilterUiFromState() {
  for (const [key, id] of Object.entries(FILTER_SELECTS)) {
    const select = document.getElementById(id);
    if (select && filterState[key] !== undefined) select.value = String(filterState[key]);
  }
}

function updateDrilldownBanner() {
  const banner = document.getElementById('drilldown-banner');
  const text = document.getElementById('drilldown-banner-text');
  if (!banner || !text) return;
  const active = getActiveDrilldown();
  if (!active) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  const label = active.multi ? active.label : `${active.field}: ${active.value}`;
  text.textContent = `Drilled down by ${label} — every chart, KPI, and the table are filtered to match.`;
}

async function init() {
  bindFilterEvents();
  bindSidebarToggle();
  bindVisualizationControls();
  bindDrilldown();
  initUpload();
  upgradeChartEngineDefaults();

  // Sprint 4: whenever data.js's dataset is replaced (Excel/CSV import),
  // rebuild filter options and refresh every view — no page reload needed.
  onDataChanged(() => {
    filterState = createDefaultFilterState();
    resetTablePage();
    resetDrilldown();
    invalidateAnalyticsCache(); // Sprint 5: new dataset invalidates memoized analytics
    populateFilterOptions();
    refreshAll();
  });

  try {
    await loadSampleData();
    populateFilterOptions();
    refreshAll();
  } catch (err) {
    console.error('Failed to load sample data:', err);
    const el = document.getElementById('upload-status');
    if (el) {
      el.hidden = false;
      el.className = 'upload-status upload-status--error';
      el.textContent = 'Could not load sample data. Try uploading a file instead.';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
