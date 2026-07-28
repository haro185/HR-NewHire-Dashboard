/**
 * charts.js
 * Sprint 3 — Chart.js rendering for: Hiring Trend, Department, Position,
 * Location, Manager, Timeline.
 *
 * Charts consume already-filtered data passed in from app.js. They never
 * read from data.js or filter.js directly — no duplicated filtering logic.
 */
import { monthKey, monthLabel, distinctValues, colorForIndex } from './utils.js';

const CHART_CONFIG = [
  { key: 'hiringTrend', bodySelector: '#chart-hiring-trend', type: 'trend' },
  { key: 'department', bodySelector: '#chart-department', type: 'category', field: 'department' },
  { key: 'position', bodySelector: '#chart-position', type: 'category', field: 'position' },
  { key: 'location', bodySelector: '#chart-location', type: 'category', field: 'location' },
  { key: 'manager', bodySelector: '#chart-manager', type: 'category', field: 'manager' },
  { key: 'timeline', bodySelector: '#chart-timeline', type: 'timeline' }
];

const instances = {}; // key -> Chart.js instance
let initialized = false;

/** Replace each placeholder body with a <canvas>, once, on first render. */
function ensureCanvases() {
  if (initialized) return;
  for (const cfg of CHART_CONFIG) {
    const heading = document.getElementById(cfg.bodySelector.slice(1));
    if (!heading) continue;
    const panel = heading.closest('.chart-panel');
    const body = panel?.querySelector('.chart-panel__body');
    if (!body) continue;
    body.innerHTML = '';
    body.removeAttribute('role');
    body.removeAttribute('aria-label');
    const canvas = document.createElement('canvas');
    canvas.id = `canvas-${cfg.key}`;
    canvas.setAttribute('aria-label', `${cfg.key} chart`);
    canvas.setAttribute('role', 'img');
    body.appendChild(canvas);
  }
  initialized = true;
}

function buildMonthSeries(records) {
  const counts = new Map();
  for (const r of records) {
    const key = monthKey(r.startDate);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const keys = Array.from(counts.keys()).sort();
  return {
    labels: keys.map(monthLabel),
    values: keys.map((k) => counts.get(k))
  };
}

function buildCategorySeries(records, field, limit = 10) {
  const counts = new Map();
  for (const r of records) {
    const v = r[field] || 'Unassigned';
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
  return {
    labels: sorted.map((e) => e[0]),
    values: sorted.map((e) => e[1])
  };
}

/** Main entry — called from app.js whenever the filtered dataset changes. */
export function renderAllCharts(filteredRecords) {
  ensureCanvases();

  renderHiringTrend(filteredRecords);
  renderTimeline(filteredRecords);
  for (const cfg of CHART_CONFIG) {
    if (cfg.type === 'category') {
      renderCategoryChart(cfg, filteredRecords);
    }
  }
}

function upsertChart(key, canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (instances[key]) {
    instances[key].data = config.data;
    instances[key].options = config.options;
    instances[key].config.type = config.type;
    instances[key].update();
  } else {
    instances[key] = new Chart(canvas.getContext('2d'), config);
  }
}

function renderHiringTrend(records) {
  const { labels, values } = buildMonthSeries(records);
  upsertChart('hiringTrend', 'canvas-hiringTrend', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'New Hires',
        data: values,
        borderColor: colorForIndex(0),
        backgroundColor: 'rgba(37,99,235,0.15)',
        tension: 0.3,
        fill: true,
        pointRadius: 3
      }]
    },
    options: baseOptions('Hiring Trend by Month')
  });
}

function renderTimeline(records) {
  const { labels, values } = buildMonthSeries(records);
  // Cumulative headcount growth over time.
  let running = 0;
  const cumulative = values.map((v) => (running += v));
  upsertChart('timeline', 'canvas-timeline', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative Hires',
        data: cumulative,
        borderColor: colorForIndex(4),
        backgroundColor: 'rgba(124,58,237,0.12)',
        stepped: false,
        tension: 0.25,
        fill: true,
        pointRadius: 2
      }]
    },
    options: baseOptions('Cumulative Hiring Timeline')
  });
}

function renderCategoryChart(cfg, records) {
  const { labels, values } = buildCategorySeries(records, cfg.field);
  upsertChart(cfg.key, `canvas-${cfg.key}`, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: capitalize(cfg.field),
        data: values,
        backgroundColor: labels.map((_, i) => colorForIndex(i)),
        borderRadius: 4
      }]
    },
    options: {
      ...baseOptions(`${capitalize(cfg.field)} Distribution`),
      indexAxis: labels.length > 6 ? 'y' : 'x'
    }
  });
}

function baseOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      title: { display: false, text: title }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
