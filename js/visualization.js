/**
 * visualization.js
 * Sprint 6 — Visualization layer only. Does not touch filter.js, data.js,
 * upload.js, or the original charts.js — it upgrades chart *presentation*
 * globally and adds new ranking / growth chart panels that read from
 * analytics.js and report clicks through drilldown.js.
 */
import { requestDrilldown } from './drilldown.js';
import { colorForIndex } from './utils.js';

const instances = {}; // key -> Chart.js instance (separate namespace from charts.js)
let rankingMode = { department: 10 }; // 10 | 20 | 'all', per-chart

/**
 * Apply enterprise-grade global Chart.js defaults. Runs once. Because
 * Chart.js merges `Chart.defaults` under any per-chart options, this
 * upgrades animation/tooltip/legend/font for EVERY chart in the app —
 * including the six built in charts.js — without editing that file.
 */
export function upgradeChartEngineDefaults() {
  if (!window.Chart || upgradeChartEngineDefaults._applied) return;
  upgradeChartEngineDefaults._applied = true;

  const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = textColor;
  Chart.defaults.animation.duration = 650;
  Chart.defaults.animation.easing = 'easeOutCubic';
  Chart.defaults.transitions.active.animation.duration = 300;
  Chart.defaults.plugins.tooltip.backgroundColor = isDark ? '#20232B' : '#111827';
  Chart.defaults.plugins.tooltip.titleFont = { weight: '700', size: 12 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.scale.grid.color = gridColor;
  Chart.defaults.elements.bar.borderRadius = 4;
  Chart.defaults.elements.line.borderWidth = 2;
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.responsive = true;

  // Re-render on window resize using rAF to avoid layout thrash / excessive rerenders.
  let resizeFrame = null;
  window.addEventListener('resize', () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      Object.values(instances).forEach((c) => c.resize());
    });
  });
}

/** Destroy + recreate safety: always upsert instead of leaking chart instances. */
function upsert(key, canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  if (instances[key]) {
    instances[key].destroy();
  }
  instances[key] = new Chart(canvas.getContext('2d'), config);
  return instances[key];
}

/* ------------------------------------------------------------------ *
 * Hiring Growth chart — monthly / quarterly / yearly switch
 * ------------------------------------------------------------------ */
let growthGranularity = 'monthly';

export function setGrowthGranularity(mode) {
  growthGranularity = mode;
}

export function renderGrowthChart(analytics) {
  const canvas = document.getElementById('canvas-growth');
  if (!canvas || !analytics) return;
  const series = analytics.series[growthGranularity] || [];

  upsert('growth', 'canvas-growth', {
    type: 'bar',
    data: {
      labels: series.map((s) => s.label),
      datasets: [{
        label: 'New Hires',
        data: series.map((s) => s.value),
        backgroundColor: colorForIndex(0),
        borderRadius: 6,
        maxBarThickness: 40
      }]
    },
    options: {
      onClick: (evt, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        const point = series[idx];
        if (growthGranularity === 'monthly') {
          const [, m] = point.key.split('-');
          requestDrilldown('month', String(parseInt(m, 10)));
        } else if (growthGranularity === 'yearly') {
          requestDrilldown('year', point.key);
        }
        // quarterly has no direct single filter field — visual only.
      },
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } }
    }
  });
}

/* ------------------------------------------------------------------ *
 * Ranking charts — Department / Manager / Location, Top 10/20/All
 * ------------------------------------------------------------------ */
export function renderRankingChart(kind, analytics, limit = 10) {
  const canvasId = `canvas-ranking-${kind}`;
  const canvas = document.getElementById(canvasId);
  if (!canvas || !analytics) return;

  const fullList = analytics.top10[`${kind}s`] || [];
  const list = limit === 'all' ? fullList : fullList.slice(0, limit);

  upsert(`ranking-${kind}`, canvasId, {
    type: 'bar',
    data: {
      labels: list.map((e) => e.label),
      datasets: [{
        label: capitalize(kind),
        data: list.map((e) => e.value),
        backgroundColor: list.map((_, i) => colorForIndex(i)),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      onClick: (evt, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        requestDrilldown(kind, list[idx].label);
      },
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

/* ------------------------------------------------------------------ *
 * Location Donut — percentage + absolute value, hover animation built in
 * ------------------------------------------------------------------ */
export function renderLocationDonut(analytics) {
  const canvas = document.getElementById('canvas-location-donut');
  if (!canvas || !analytics) return;
  const list = analytics.top10.locations;
  const total = list.reduce((s, e) => s + e.value, 0) || 1;

  upsert('location-donut', 'canvas-location-donut', {
    type: 'doughnut',
    data: {
      labels: list.map((e) => e.label),
      datasets: [{
        data: list.map((e) => e.value),
        backgroundColor: list.map((_, i) => colorForIndex(i)),
        hoverOffset: 10,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      cutout: '62%',
      onClick: (evt, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        requestDrilldown('location', list[idx].label);
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              const pct = Math.round((value / total) * 100);
              return ` ${ctx.label}: ${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/** Sets the ranking granularity (10/20/all) for a chart, then re-renders it. */
export function setRankingLimit(kind, limit) {
  rankingMode[kind] = limit;
}
export function getRankingLimit(kind) {
  return rankingMode[kind] || 10;
}

/* ------------------------------------------------------------------ *
 * Export — download any chart canvas as a high-resolution PNG.
 * ------------------------------------------------------------------ */
export function exportChartAsPng(canvasId, filename) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `${filename || canvasId}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function getGrowthGranularity() {
  return growthGranularity;
}
