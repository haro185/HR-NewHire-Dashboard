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
import { renderHeatmap, setHeatmapMonthRange } from './heatmap.js';
import { renderTimeline, setTimelineZoom } from './timeline.js';
import { onDrilldown, drilldownToFilterPatch, resetDrilldown, getActiveDrilldown } from './drilldown.js';
import { animateAllNumbers } from './animation.js';

// Language toggle
import { getLanguage, setLanguage, translateStaticDom, t } from './i18n.js';

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

  renderActiveFilterChips();
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

  document.getElementById('filter-active-chips')?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter-key]');
    if (!chip) return;

    const key = chip.dataset.filterKey;
    const select = document.getElementById(FILTER_SELECTS[key]);
    if (!select) return;

    filterState[key] = 'all';
    select.value = 'all';
    resetTablePage();
    refreshAll();
  });
}

/** Renders presentation-only summaries of filters that are currently applied. */
function renderActiveFilterChips() {
  const container = document.getElementById('filter-active-chips');
  if (!container) return;

  const chips = Object.entries(FILTER_SELECTS)
    .filter(([key]) => filterState[key] && filterState[key] !== 'all')
    .map(([key, id]) => {
      const select = document.getElementById(id);
      const label = select?.labels?.[0]?.textContent || key;
      const value = select?.selectedOptions?.[0]?.textContent || filterState[key];
      const safeLabel = escapeHtml(label);
      const safeValue = escapeHtml(value);
      return `<button type="button" class="filter-chip" data-filter-key="${key}" aria-label="${t('filters.removeChip', { label: safeLabel, value: safeValue })}">
        <span>${safeLabel}: ${safeValue}</span><span class="filter-chip__remove" aria-hidden="true">×</span>
      </button>`;
    });

  container.hidden = chips.length === 0;
  container.innerHTML = chips.length
    ? `<span class="filter-bar__active-label">${t('filters.active')}</span>${chips.join('')}`
    : '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
 * Language toggle (English / Tiếng Việt)
 * =================================================================== */
function updateLangToggleUi() {
  const lang = getLanguage();
  document.querySelectorAll('#lang-toggle [data-lang-option]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.langOption === lang);
  });
}

function bindLanguageToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  updateLangToggleUi();

  btn.addEventListener('click', (e) => {
    const option = e.target.closest('[data-lang-option]');
    const nextLang = option ? option.dataset.langOption : (getLanguage() === 'en' ? 'vi' : 'en');
    if (nextLang === getLanguage()) return;
    setLanguage(nextLang); // also re-translates every [data-i18n] element in the DOM
    updateLangToggleUi();
    // Every dynamic renderer (KPIs, charts, table, insights, heatmap, timeline,
    // drilldown banner) generates its own text, so a full refresh picks up
    // the new language everywhere in one pass — same pipeline as a filter change.
    refreshAll();
  });
}

/* ===================================================================
 * Sidebar navigation — smooth-scroll to the matching dashboard section
 * and keep the active link + mobile sidebar state in sync.
 * =================================================================== */
function bindSidebarNav() {
  const links = document.querySelectorAll('.nav-list__link[data-nav-target]');
  if (!links.length) return;

  const scrollContainer = document.querySelector('.main');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.navTarget;
      const target = document.getElementById(targetId);
      if (!target || !scrollContainer) return; // fall back to default anchor behavior if missing
      e.preventDefault();

      // `.main` is its own scroll container (overflow-y: auto), not the window,
      // so compute the target's position relative to it directly rather than
      // relying on offsetTop (which is relative to the nearest positioned
      // ancestor, not necessarily this scroll container) or window.scrollTo
      // (which has no effect here since the window itself never scrolls).
      const targetRect = target.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const top = targetRect.top - containerRect.top + scrollContainer.scrollTop - 16;
      scrollContainer.scrollTo({ top, behavior: 'smooth' });

      links.forEach((l) => {
        l.classList.remove('nav-list__link--active');
        l.removeAttribute('aria-current');
      });
      link.classList.add('nav-list__link--active');
      link.setAttribute('aria-current', 'page');

      // Close the mobile sidebar after navigating, same as picking any other action.
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      const toggleBtn = document.getElementById('sidebar-toggle');
      if (sidebar?.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
        overlay?.classList.remove('is-visible');
        toggleBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Scroll-spy: highlight whichever section is currently most visible.
  const sections = Array.from(links)
    .map((l) => document.getElementById(l.dataset.navTarget))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((en) => en.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const activeId = visible[0].target.id;
      links.forEach((l) => {
        const isActive = l.dataset.navTarget === activeId;
        l.classList.toggle('nav-list__link--active', isActive);
        if (isActive) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    },
    { root: scrollContainer, rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  sections.forEach((s) => observer.observe(s));
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

  bindSegmented('heatmap-range-toggle', 'range', (range) => {
    setHeatmapMonthRange(range === 'all' ? 'all' : parseInt(range, 10));
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
  text.textContent = t('drilldown.text', { label });
}

async function init() {
  translateStaticDom(); // apply saved/default language to static labels before first paint of dynamic content
  bindFilterEvents();
  bindSidebarToggle();
  bindSidebarNav();
  bindLanguageToggle();
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
      el.textContent = t('upload.sampleFailed');
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
