/**
 * insight.js
 * Sprint 3/4 — Lightweight heuristic "AI Insight" summary generated purely
 * client-side from the currently filtered dataset. Refreshed on every
 * filter change and after every Excel/CSV import (Sprint 4 requirement).
 *
 * Sprint 5 extension (appended below, original function untouched):
 *  - generateInsightSentences(): natural-language bullet list built entirely
 *    from computed analytics.js numbers — no hardcoded business sentences.
 *  - generateWarnings(): data-quality / imbalance warning engine.
 *  - renderInsightsPanel(): renders both lists into the new Sprint 5 DOM.
 */
import { distinctValues } from './utils.js';
import { monthKey, monthLabel } from './utils.js';

export function renderInsight(filteredRecords) {
  const titleEl = document.getElementById('insight-title');
  const textEl = document.getElementById('insight-text');
  if (!titleEl || !textEl) return;

  if (filteredRecords.length === 0) {
    titleEl.textContent = 'No matching records';
    textEl.textContent = 'Try adjusting or resetting the filters to see hiring insights.';
    return;
  }

  const byDept = new Map();
  const byMonth = new Map();
  for (const r of filteredRecords) {
    byDept.set(r.department, (byDept.get(r.department) || 0) + 1);
    const key = monthKey(r.startDate);
    if (key) byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }

  const topDept = [...byDept.entries()].sort((a, b) => b[1] - a[1])[0];
  const months = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const topMonth = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0];

  const locations = distinctValues(filteredRecords, 'location').length;
  const managers = distinctValues(filteredRecords, 'manager').length;

  let trendPhrase = '';
  if (months.length >= 2) {
    const last = months[months.length - 1][1];
    const prev = months[months.length - 2][1];
    if (last > prev) trendPhrase = ' Hiring is trending upward in the most recent month.';
    else if (last < prev) trendPhrase = ' Hiring has slowed slightly in the most recent month.';
    else trendPhrase = ' Hiring pace has stayed flat month over month.';
  }

  titleEl.textContent = `${filteredRecords.length} new hires across ${byDept.size} departments`;
  textEl.textContent =
    `${topDept ? `${topDept[0]} leads hiring with ${topDept[1]} new hire(s). ` : ''}` +
    `${topMonth ? `The busiest month was ${monthLabel(topMonth[0])} with ${topMonth[1]} hire(s). ` : ''}` +
    `Hires span ${locations} location(s) and ${managers} manager(s).` +
    trendPhrase;
}

/* ===================================================================
 * Sprint 5 — AI Insight Generator + Warning Engine
 * =================================================================== */

/**
 * Build natural-language insight sentences purely from computed analytics.
 * Every number is interpolated from `analytics` (see analytics.js) — nothing
 * here is a hardcoded business statement.
 */
export function generateInsightSentences(analytics, totalRecords) {
  const sentences = [];
  if (!analytics || totalRecords === 0) {
    return ['No records match the current filters — adjust or reset filters to see insights.'];
  }

  const { totals, top, growth, fastestGrowingDepartment, peakMonth, concentration, managerWorkload } = analytics;

  if (growth.monthly.percent !== 0 && growth.monthly.current !== undefined) {
    const dir = growth.monthly.percent > 0 ? 'increased' : 'decreased';
    sentences.push(`Hiring ${dir} by ${Math.abs(growth.monthly.percent)}% compared with the previous month.`);
  }

  if (top.department) {
    const share = totals.employees ? Math.round((top.department.value / totals.employees) * 100) : 0;
    sentences.push(`Department "${top.department.label}" has the highest hiring demand with ${top.department.value} hire(s) (${share}% of total).`);
  }

  if (top.location) {
    const share = totals.employees ? Math.round((top.location.value / totals.employees) * 100) : 0;
    sentences.push(`${top.location.label} office represents ${share}% of new hires.`);
  }

  if (analytics.series.quarterly.length) {
    const topQuarter = [...analytics.series.quarterly].sort((a, b) => b.value - a.value)[0];
    sentences.push(`Most onboarding activity occurred during ${topQuarter.label} with ${topQuarter.value} hire(s).`);
  }

  if (managerWorkload.overloaded.length > 0) {
    sentences.push(`${managerWorkload.overloaded.length} manager(s) are onboarding 10 or more employees simultaneously.`);
  }

  if (fastestGrowingDepartment && fastestGrowingDepartment.percent > 0) {
    sentences.push(`"${fastestGrowingDepartment.category}" is the fastest growing department, up ${fastestGrowingDepartment.percent}% month-over-month.`);
  }

  if (peakMonth) {
    sentences.push(`Hiring peaked in ${peakMonth.label} with ${peakMonth.value} new hire(s).`);
  }

  if (concentration.department >= 40) {
    sentences.push(`Hiring is fairly concentrated: a department-concentration score of ${concentration.department}/100 suggests demand is not evenly spread.`);
  }

  if (growth.trendDirection !== 'flat') {
    sentences.push(`The overall hiring trend is ${growth.trendDirection === 'up' ? 'trending upward' : 'trending downward'} across the selected period.`);
  }

  return sentences.length ? sentences : ['Hiring activity is steady with no notable outliers in the current selection.'];
}

/**
 * Warning Engine — flags data-quality and workload-imbalance issues found by
 * analytics.js's single-pass fact builder (see `issues` on computeAnalytics()).
 * Returns an array of { level: 'warning'|'error', message } objects.
 */
export function generateWarnings(analytics) {
  const warnings = [];
  if (!analytics) return warnings;
  const { issues, concentration, managerWorkload, totals } = analytics;

  if (concentration.department >= 50) {
    warnings.push({ level: 'warning', message: `Hiring is heavily concentrated in one department (concentration score ${concentration.department}/100).` });
  }
  if (managerWorkload.stdDev > managerWorkload.mean && totals.managers > 1) {
    warnings.push({ level: 'warning', message: `Manager workload is imbalanced — headcount per manager varies widely (avg ${managerWorkload.mean}, std dev ${managerWorkload.stdDev}).` });
  }
  if (issues.missingManager > 0) {
    warnings.push({ level: 'error', message: `${issues.missingManager} record(s) are missing a manager.` });
  }
  if (issues.missingDepartment > 0) {
    warnings.push({ level: 'error', message: `${issues.missingDepartment} record(s) are missing a department.` });
  }
  if (issues.missingStartDate > 0) {
    warnings.push({ level: 'error', message: `${issues.missingStartDate} record(s) are missing a start date.` });
  }
  if (issues.futureStartDate.length > 0) {
    warnings.push({ level: 'warning', message: `${issues.futureStartDate.length} record(s) have a start date in the future.` });
  }
  if (issues.duplicates.length > 0) {
    warnings.push({ level: 'warning', message: `${issues.duplicates.length} possible duplicate employee record(s) detected (same name + start date).` });
  }

  return warnings;
}

/** Render both lists into the Sprint 5 "Analytics & Insights" section (index.html). */
export function renderInsightsPanel(analytics, totalRecords) {
  const insightList = document.getElementById('ai-insight-list');
  const warningList = document.getElementById('warning-list');
  const warningSection = document.getElementById('warning-section');
  if (insightList) {
    const sentences = generateInsightSentences(analytics, totalRecords);
    insightList.innerHTML = sentences.map((s) => `<li>${escapeHtmlLocal(s)}</li>`).join('');
  }
  if (warningList && warningSection) {
    const warnings = generateWarnings(analytics);
    if (warnings.length === 0) {
      warningSection.hidden = true;
    } else {
      warningSection.hidden = false;
      warningList.innerHTML = warnings
        .map((w) => `<li class="warning-item warning-item--${w.level}">${escapeHtmlLocal(w.message)}</li>`)
        .join('');
    }
  }
}

function escapeHtmlLocal(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
