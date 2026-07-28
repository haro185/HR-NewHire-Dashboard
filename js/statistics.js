/**
 * statistics.js
 * Sprint 5 — Pure statistical primitives. No knowledge of the employee
 * record shape, no DOM access, no filtering. Everything here operates on
 * plain numeric arrays so it can be reused by analytics.js and, later,
 * any other module that needs descriptive statistics.
 */

/** Arithmetic mean. Returns 0 for an empty array (never NaN). */
export function mean(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Median (50th percentile), robust to unsorted input. */
export function median(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Mode — most frequently occurring value. Ties resolved by first-seen order. */
export function mode(values) {
  if (!values || values.length === 0) return 0;
  const counts = new Map();
  let best = values[0];
  let bestCount = 0;
  for (const v of values) {
    const c = (counts.get(v) || 0) + 1;
    counts.set(v, c);
    if (c > bestCount) {
      bestCount = c;
      best = v;
    }
  }
  return best;
}

export function min(values) {
  if (!values || values.length === 0) return 0;
  return Math.min(...values);
}

export function max(values) {
  if (!values || values.length === 0) return 0;
  return Math.max(...values);
}

/** Population standard deviation. */
export function stdDev(values) {
  if (!values || values.length === 0) return 0;
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

/**
 * Simple linear regression slope over an ordered numeric series (e.g. hires
 * per month, indexed 0..n-1). Positive slope = upward hiring trend.
 * Returns { slope, direction } where direction is 'up' | 'down' | 'flat'.
 */
export function linearTrend(values) {
  const n = values.length;
  if (n < 2) return { slope: 0, direction: 'flat' };

  const xs = values.map((_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(values);

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (values[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const direction = slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'flat';
  return { slope, direction };
}

/** Percentage change from `previous` to `current`, safe against divide-by-zero. */
export function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Herfindahl-style concentration index (0-1) for a set of category counts.
 * Higher = more concentrated in fewer categories (e.g. all hires in one dept).
 * Used for "Department Concentration" / "Location Concentration".
 */
export function concentrationIndex(counts) {
  const total = counts.reduce((s, c) => s + c, 0);
  if (total === 0) return 0;
  return counts.reduce((s, c) => s + (c / total) ** 2, 0);
}

/** Round to N decimal places (default 1) without floating point artifacts. */
export function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
