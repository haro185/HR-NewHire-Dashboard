/**
 * analytics.js
 * Sprint 5 — HR Analytics Engine.
 *
 * Transforms a (filtered) record array into business-meaning metrics.
 * This module is READ-ONLY with respect to the rest of the app: it never
 * touches data.js, filter.js, upload.js, or charts.js — it is a pure
 * derivation layer that app.js / insight.js / visualization.js consume.
 *
 * Performance contract:
 *  - Every metric is derived from ONE pass over `records` (buildFacts),
 *    then cheap aggregation over the resulting Maps. No nested O(n*m) loops
 *    over records themselves.
 *  - Results are memoized against the exact array reference + length, so
 *    re-rendering the same filtered set (e.g. re-render after a UI-only
 *    change) doesn't recompute analytics.
 */
import { parseISODate, monthKey, monthLabel } from './utils.js';
import { mean, stdDev, linearTrend, percentChange, concentrationIndex, round } from './statistics.js';

let cacheKey = null;
let cacheValue = null;

/** Public entry point — computed facts + derived business metrics. */
export function computeAnalytics(records) {
  const key = `${records.length}:${records === lastArrayRef ? 'same-ref' : 'new-ref'}`;
  lastArrayRef = records;
  if (cacheKey === key && cacheValue) return cacheValue;

  const facts = buildFacts(records);
  const result = deriveMetrics(facts, records.length);

  cacheKey = key;
  cacheValue = result;
  return result;
}
let lastArrayRef = null;

/** Single pass over records -> grouped Maps. This is the only O(n) walk. */
function buildFacts(records) {
  const byDepartment = new Map();
  const byPosition = new Map();
  const byManager = new Map();
  const byLocation = new Map();
  const byMonth = new Map();     // "YYYY-MM" -> count
  const byQuarter = new Map();   // "YYYY-Q#" -> count
  const byYear = new Map();      // "YYYY" -> count
  const deptByMonth = new Map(); // department -> Map(month -> count)
  const issues = { missingManager: 0, missingDepartment: 0, missingStartDate: 0, futureStartDate: [], duplicates: [] };
  const seen = new Map(); // dedupe key -> record, for duplicate detection

  const now = new Date();

  for (const r of records) {
    bump(byDepartment, r.department || 'Unassigned');
    bump(byPosition, r.position || 'Unassigned');
    bump(byManager, r.manager || 'Unassigned');
    bump(byLocation, r.location || 'Unassigned');

    const start = parseISODate(r.startDate);
    if (!r.startDate) {
      issues.missingStartDate++;
    } else if (start) {
      const mKey = monthKey(r.startDate);
      bump(byMonth, mKey);
      const q = `${start.getFullYear()}-Q${Math.floor(start.getMonth() / 3) + 1}`;
      bump(byQuarter, q);
      bump(byYear, String(start.getFullYear()));

      if (!deptByMonth.has(r.department)) deptByMonth.set(r.department, new Map());
      bump(deptByMonth.get(r.department), mKey);

      if (start > now) issues.futureStartDate.push(r);
    }

    if (!r.manager || r.manager === 'Unassigned') issues.missingManager++;
    if (!r.department || r.department === 'Unassigned') issues.missingDepartment++;

    const dupKey = `${(r.employeeName || '').trim().toLowerCase()}|${r.startDate}`;
    if (dupKey.trim() !== '|') {
      if (seen.has(dupKey)) issues.duplicates.push(r);
      else seen.set(dupKey, r);
    }
  }

  return { byDepartment, byPosition, byManager, byLocation, byMonth, byQuarter, byYear, deptByMonth, issues };
}

function bump(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topN(map, n = 10) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));
}

function sortedKeys(map) {
  return [...map.keys()].sort();
}

function deriveMetrics(facts, totalRecords) {
  const { byDepartment, byPosition, byManager, byLocation, byMonth, byQuarter, byYear, deptByMonth, issues } = facts;

  const monthKeysSorted = sortedKeys(byMonth);
  const monthValues = monthKeysSorted.map((k) => byMonth.get(k));
  const quarterKeysSorted = sortedKeys(byQuarter);
  const quarterValues = quarterKeysSorted.map((k) => byQuarter.get(k));
  const yearKeysSorted = sortedKeys(byYear);
  const yearValues = yearKeysSorted.map((k) => byYear.get(k));

  const avgPerMonth = monthKeysSorted.length ? round(totalRecords / monthKeysSorted.length, 1) : 0;

  // Growth: compare last two completed periods.
  const monthlyGrowth = growthBetweenLastTwo(monthValues);
  const quarterlyGrowth = growthBetweenLastTwo(quarterValues);
  const yearlyGrowth = growthBetweenLastTwo(yearValues);

  const topDepartments = topN(byDepartment, 10);
  const topPositions = topN(byPosition, 10);
  const topManagers = topN(byManager, 10);
  const topLocations = topN(byLocation, 10);

  const peakMonthEntry = monthKeysSorted.length
    ? [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0] : null;
  const lowMonthEntry = monthKeysSorted.length
    ? [...byMonth.entries()].sort((a, b) => a[1] - b[1])[0] : null;

  // Fastest growing department: compare each department's last two active months.
  const fastestGrowingDept = fastestGrowingCategory(deptByMonth);

  // Concentration indices (0 = perfectly spread, 1 = all in one bucket)
  const departmentConcentration = round(concentrationIndex([...byDepartment.values()]) * 100, 1);
  const locationConcentration = round(concentrationIndex([...byLocation.values()]) * 100, 1);

  // Manager workload: mean/stddev of headcount per manager, flags imbalance.
  const managerCounts = [...byManager.values()];
  const managerWorkload = {
    mean: round(mean(managerCounts), 1),
    stdDev: round(stdDev(managerCounts), 1),
    max: topManagers[0] || null,
    overloaded: topManagers.filter((m) => m.value >= 10)
  };

  const trend = linearTrend(monthValues);

  return {
    totals: {
      employees: totalRecords,
      departments: byDepartment.size,
      positions: byPosition.size,
      managers: byManager.size,
      locations: byLocation.size,
      avgPerMonth
    },
    top: {
      department: topDepartments[0] || null,
      position: topPositions[0] || null,
      manager: topManagers[0] || null,
      location: topLocations[0] || null
    },
    top10: { departments: topDepartments, positions: topPositions, managers: topManagers, locations: topLocations },
    growth: {
      monthly: monthlyGrowth,
      quarterly: quarterlyGrowth,
      yearly: yearlyGrowth,
      trendDirection: trend.direction,
      trendSlope: round(trend.slope, 2)
    },
    fastestGrowingDepartment: fastestGrowingDept,
    peakMonth: peakMonthEntry ? { key: peakMonthEntry[0], label: monthLabel(peakMonthEntry[0]), value: peakMonthEntry[1] } : null,
    lowestMonth: lowMonthEntry ? { key: lowMonthEntry[0], label: monthLabel(lowMonthEntry[0]), value: lowMonthEntry[1] } : null,
    concentration: { department: departmentConcentration, location: locationConcentration },
    managerWorkload,
    series: {
      monthly: monthKeysSorted.map((k, i) => ({ key: k, label: monthLabel(k), value: monthValues[i] })),
      quarterly: quarterKeysSorted.map((k, i) => ({ key: k, label: k, value: quarterValues[i] })),
      yearly: yearKeysSorted.map((k, i) => ({ key: k, label: k, value: yearValues[i] }))
    },
    deptByMonth,
    issues
  };
}

function growthBetweenLastTwo(values) {
  if (values.length < 2) return { percent: 0, direction: 'flat' };
  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  const percent = round(percentChange(current, previous), 1);
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat';
  return { percent, direction, current, previous };
}

function fastestGrowingCategory(byCategoryByMonth) {
  let best = null;
  for (const [category, monthMap] of byCategoryByMonth.entries()) {
    const keys = sortedKeys(monthMap);
    if (keys.length < 2) continue;
    const current = monthMap.get(keys[keys.length - 1]);
    const previous = monthMap.get(keys[keys.length - 2]);
    const percent = percentChange(current, previous);
    if (!best || percent > best.percent) {
      best = { category, percent: round(percent, 1), current, previous };
    }
  }
  return best;
}

/** Invalidate the memoized result — call after a dataset replacement (import). */
export function invalidateAnalyticsCache() {
  cacheKey = null;
  cacheValue = null;
  lastArrayRef = null;
}

/* ===================================================================
 * Sprint 5 — Advanced KPI rendering.
 * A separate, additive set of KPI cards (Title/Value/Trend/Delta/Status/
 * Tooltip) rendered into the new "#advanced-kpi-grid" section added in
 * index.html. Does not touch or replace the original kpi.js cards.
 * =================================================================== */
const ADVANCED_KPI_DEFS = [
  {
    id: 'akpi-monthly-growth',
    title: 'Monthly Hiring Growth',
    tooltip: 'Percentage change in new hires vs. the previous month.',
    get: (a) => ({ value: `${a.growth.monthly.percent > 0 ? '+' : ''}${a.growth.monthly.percent}%`, status: statusFromPercent(a.growth.monthly.percent) })
  },
  {
    id: 'akpi-quarterly-growth',
    title: 'Quarterly Hiring Growth',
    tooltip: 'Percentage change in new hires vs. the previous quarter.',
    get: (a) => ({ value: `${a.growth.quarterly.percent > 0 ? '+' : ''}${a.growth.quarterly.percent}%`, status: statusFromPercent(a.growth.quarterly.percent) })
  },
  {
    id: 'akpi-yearly-growth',
    title: 'Yearly Hiring Growth',
    tooltip: 'Percentage change in new hires vs. the previous year.',
    get: (a) => ({ value: `${a.growth.yearly.percent > 0 ? '+' : ''}${a.growth.yearly.percent}%`, status: statusFromPercent(a.growth.yearly.percent) })
  },
  {
    id: 'akpi-top-department',
    title: 'Top Hiring Department',
    tooltip: 'The department with the most new hires in the current selection.',
    get: (a) => ({ value: a.top.department ? `${a.top.department.label} (${a.top.department.value})` : '—', status: 'neutral' })
  },
  {
    id: 'akpi-fastest-growing',
    title: 'Fastest Growing Department',
    tooltip: 'Department with the largest month-over-month percentage increase.',
    get: (a) => ({
      value: a.fastestGrowingDepartment ? `${a.fastestGrowingDepartment.category} (+${a.fastestGrowingDepartment.percent}%)` : '—',
      status: a.fastestGrowingDepartment && a.fastestGrowingDepartment.percent > 0 ? 'positive' : 'neutral'
    })
  },
  {
    id: 'akpi-dept-concentration',
    title: 'Department Concentration',
    tooltip: 'How concentrated hiring is across departments (0 = evenly spread, 100 = all in one department).',
    get: (a) => ({ value: `${a.concentration.department}/100`, status: a.concentration.department >= 50 ? 'negative' : a.concentration.department >= 30 ? 'neutral' : 'positive' })
  },
  {
    id: 'akpi-manager-workload',
    title: 'Manager Workload (avg ± std dev)',
    tooltip: 'Average number of hires per manager and how much that varies.',
    get: (a) => ({ value: `${a.managerWorkload.mean} ± ${a.managerWorkload.stdDev}`, status: a.managerWorkload.overloaded.length > 0 ? 'negative' : 'positive' })
  },
  {
    id: 'akpi-peak-month',
    title: 'Hiring Peak Month',
    tooltip: 'The single month with the highest number of new hires.',
    get: (a) => ({ value: a.peakMonth ? `${a.peakMonth.label} (${a.peakMonth.value})` : '—', status: 'neutral' })
  }
];

function statusFromPercent(p) {
  if (p > 0) return 'positive';
  if (p < 0) return 'negative';
  return 'neutral';
}

/** Renders the advanced KPI grid. Call from app.js after computeAnalytics(). */
export function renderAdvancedKpis(analytics) {
  const grid = document.getElementById('advanced-kpi-grid');
  if (!grid) return;

  grid.innerHTML = ADVANCED_KPI_DEFS.map((def) => {
    const { value, status } = def.get(analytics);
    return `
      <article class="card advanced-kpi-card advanced-kpi-card--${status}" tabindex="0"
        aria-label="${def.title}: ${value}" title="${def.tooltip}">
        <p class="advanced-kpi-card__title">${def.title}</p>
        <p class="advanced-kpi-card__value" data-animate-target>${value}</p>
        <span class="advanced-kpi-card__status-dot" aria-hidden="true"></span>
      </article>
    `;
  }).join('');
}
