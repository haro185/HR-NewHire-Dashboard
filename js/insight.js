/**
 * insight.js
 * "AI Insight" summary generated purely client-side from the currently
 * filtered dataset. Refreshed on every filter change, after every Excel/CSV
 * import, and on every language toggle.
 *
 *  - renderInsight(): short one-paragraph summary (top of the panel).
 *  - generateInsightSentences(): full bullet list, built entirely from
 *    computed analytics.js numbers — no hardcoded business sentences.
 *  - generateWarnings(): data-quality / imbalance warning engine.
 *  - renderInsightsPanel(): renders both lists into the DOM.
 *
 * All user-facing text comes from i18n.js so both English and Vietnamese
 * are generated from the exact same numbers.
 */
import { distinctValues, monthKey } from './utils.js';
import { t, formatMonth, formatQuarter } from './i18n.js';

export function renderInsight(filteredRecords) {
  const titleEl = document.getElementById('insight-title');
  const textEl = document.getElementById('insight-text');
  if (!titleEl || !textEl) return;

  if (filteredRecords.length === 0) {
    titleEl.textContent = t('insight.noMatch.title');
    textEl.textContent = t('insight.noMatch.text');
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
    if (last > prev) trendPhrase = t('insight.trendUpShort');
    else if (last < prev) trendPhrase = t('insight.trendDownShort');
    else trendPhrase = t('insight.trendFlatShort');
  }

  titleEl.textContent = t('insight.titleSummary', { count: filteredRecords.length, depts: byDept.size });
  textEl.textContent =
    `${topDept ? t('insight.leadsHiring', { name: topDept[0], count: topDept[1] }) + ' ' : ''}` +
    `${topMonth ? t('insight.busiestMonth', { month: formatMonth(topMonth[0]), count: topMonth[1] }) + ' ' : ''}` +
    t('insight.spans', { locations, managers }) +
    trendPhrase;
}

/* ===================================================================
 * AI Insight Generator + Warning Engine
 * =================================================================== */

/**
 * Build natural-language insight sentences purely from computed analytics.
 * Every number is interpolated from `analytics` (see analytics.js) — nothing
 * here is a hardcoded business statement.
 */
export function generateInsightSentences(analytics, totalRecords) {
  const sentences = [];
  if (!analytics || totalRecords === 0) {
    return [t('insight.noMatch.list')];
  }

  const { totals, top, growth, fastestGrowingDepartment, peakMonth, concentration, managerWorkload } = analytics;

  if (growth.monthly.percent !== 0 && growth.monthly.current !== undefined) {
    const key = growth.monthly.percent > 0 ? 'insight.hiringIncreased' : 'insight.hiringDecreased';
    sentences.push(t(key, { percent: Math.abs(growth.monthly.percent) }));
  }

  if (top.department) {
    const share = totals.employees ? Math.round((top.department.value / totals.employees) * 100) : 0;
    sentences.push(t('insight.topDepartment', { name: top.department.label, count: top.department.value, share }));
  }

  if (top.location) {
    const share = totals.employees ? Math.round((top.location.value / totals.employees) * 100) : 0;
    sentences.push(t('insight.topLocation', { name: top.location.label, share }));
  }

  if (analytics.series.quarterly.length) {
    const topQuarter = [...analytics.series.quarterly].sort((a, b) => b.value - a.value)[0];
    sentences.push(t('insight.topQuarter', { quarter: formatQuarter(topQuarter.key), count: topQuarter.value }));
  }

  if (managerWorkload.overloaded.length > 0) {
    sentences.push(t('insight.overloadedManagers', { count: managerWorkload.overloaded.length }));
  }

  if (fastestGrowingDepartment && fastestGrowingDepartment.percent > 0) {
    sentences.push(t('insight.fastestGrowing', { name: fastestGrowingDepartment.category, percent: fastestGrowingDepartment.percent }));
  }

  if (peakMonth) {
    sentences.push(t('insight.peakMonth', { month: formatMonth(peakMonth.key), count: peakMonth.value }));
  }

  if (concentration.department >= 40) {
    sentences.push(t('insight.concentration', { score: concentration.department }));
  }

  if (growth.trendDirection !== 'flat') {
    sentences.push(t(growth.trendDirection === 'up' ? 'insight.trendUp' : 'insight.trendDown'));
  }

  return sentences.length ? sentences : [t('insight.steady')];
}

/**
 * Warning Engine — flags data-quality and workload-imbalance issues found by
 * analytics.js's single-pass fact builder (see `issues` on computeAnalytics()).
 * Returns an array of { level: 'warning'|'error', message } objects.
 *
 * Note: records with a future start date haven't actually started yet, so
 * they're described as "candidates" (Ứng viên) rather than generic "records" —
 * they represent incoming hires, not active employees.
 */
export function generateWarnings(analytics) {
  const warnings = [];
  if (!analytics) return warnings;
  const { issues, concentration, managerWorkload, totals } = analytics;

  if (concentration.department >= 50) {
    warnings.push({ level: 'warning', message: t('warning.deptConcentration', { score: concentration.department }) });
  }
  if (managerWorkload.stdDev > managerWorkload.mean && totals.managers > 1) {
    warnings.push({ level: 'warning', message: t('warning.managerImbalance', { mean: managerWorkload.mean, stdDev: managerWorkload.stdDev }) });
  }
  if (issues.missingManager > 0) {
    warnings.push({ level: 'error', message: t('warning.missingManager', { count: issues.missingManager }) });
  }
  if (issues.missingDepartment > 0) {
    warnings.push({ level: 'error', message: t('warning.missingDepartment', { count: issues.missingDepartment }) });
  }
  if (issues.missingStartDate > 0) {
    warnings.push({ level: 'error', message: t('warning.missingStartDate', { count: issues.missingStartDate }) });
  }
  if (issues.futureStartDate.length > 0) {
    warnings.push({ level: 'warning', message: t('warning.futureStartDate', { count: issues.futureStartDate.length }) });
  }
  if (issues.duplicates.length > 0) {
    warnings.push({ level: 'warning', message: t('warning.duplicates', { count: issues.duplicates.length }) });
  }

  return warnings;
}

/** Render both lists into the "Analytics & Insights" section (index.html). */
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
