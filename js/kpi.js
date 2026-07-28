/**
 * kpi.js
 * Sprint 3 — Computes KPI metrics from an already-filtered record set
 * and renders them into the existing KPI cards in index.html (no markup replaced).
 */
import { distinctValues } from './utils.js';
import { monthKey } from './utils.js';
import { animateNumber } from './animation.js';

const previousValues = new Map();

/** Pure computation — returns a plain object of KPI numbers. */
export function computeKpis(filteredRecords) {
  const totalHires = filteredRecords.length;
  const totalDepartments = distinctValues(filteredRecords, 'department').length;
  const totalPositions = distinctValues(filteredRecords, 'position').length;
  const totalManagers = distinctValues(filteredRecords, 'manager').length;
  const totalLocations = distinctValues(filteredRecords, 'location').length;

  const monthsWithHires = new Set();
  for (const r of filteredRecords) {
    const key = monthKey(r.startDate);
    if (key) monthsWithHires.add(key);
  }
  const monthCount = monthsWithHires.size || 1;
  const avgPerMonth = totalHires / monthCount;

  return {
    totalHires,
    totalDepartments,
    totalPositions,
    totalManagers,
    totalLocations,
    avgPerMonth: Math.round(avgPerMonth * 10) / 10
  };
}

// Maps each KPI to the id already present in index.html's <p class="kpi-card__value">.
const KPI_VALUE_IDS = {
  totalHires: 'kpi-hires-value',
  totalDepartments: 'kpi-dept-value',
  totalPositions: 'kpi-pos-value',
  totalManagers: 'kpi-mgr-value',
  totalLocations: 'kpi-loc-value',
  avgPerMonth: 'kpi-avg-value'
};

/**
 * Render KPI numbers into the DOM.
 * Sprint 3 extends the existing kpi-card markup by targeting the value <p> via
 * a data attribute so we never need to replace the original placeholder HTML.
 */
export function renderKpis(kpis) {
  setValue('kpi-hires', kpis.totalHires);
  setValue('kpi-dept', kpis.totalDepartments);
  setValue('kpi-pos', kpis.totalPositions);
  setValue('kpi-mgr', kpis.totalManagers);
  setValue('kpi-loc', kpis.totalLocations);
  setValue('kpi-avg', kpis.avgPerMonth);
}

function setValue(labelId, value) {
  const labelEl = document.getElementById(labelId);
  if (!labelEl) return;
  const card = labelEl.closest('.kpi-card');
  if (!card) return;
  const valueEl = card.querySelector('.kpi-card__value');
  if (valueEl) {
    animateNumber(valueEl, value, { formatter: (number) => formatKpiValue(number, value) });
  }

  const trendEl = card.querySelector('.kpi-card__trend');
  if (trendEl) {
    trendEl.innerHTML = renderTrendBadge(previousValues.get(labelId), value);
  }
  previousValues.set(labelId, value);
}

function formatKpiValue(number, target) {
  const decimalPlaces = Number.isInteger(target) ? 0 : 1;
  return number.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
}

function renderTrendBadge(previousValue, value) {
  if (previousValue === undefined) {
    return '<span class="kpi-card__trend-badge kpi-card__trend-badge--neutral">Current selection</span>';
  }

  const difference = value - previousValue;
  if (difference === 0) {
    return '<span class="kpi-card__trend-badge kpi-card__trend-badge--neutral">No change</span>';
  }

  const direction = difference > 0 ? 'up' : 'down';
  const sign = difference > 0 ? '+' : '−';
  return `<span class="kpi-card__trend-badge kpi-card__trend-badge--${direction}">
    <span aria-hidden="true">${direction === 'up' ? '↑' : '↓'}</span>
    ${sign}${formatKpiValue(Math.abs(difference), difference)} since last view
  </span>`;
}
