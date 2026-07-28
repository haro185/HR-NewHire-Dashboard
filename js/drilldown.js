/**
 * drilldown.js
 * Sprint 6 — Cross-chart drill-down / cross-filtering.
 *
 * This module owns NO filtering logic itself (filter.js still does that).
 * It is a tiny pub/sub: visualization/heatmap/timeline modules call
 * `requestDrilldown(field, value)` when the user clicks a bar/cell/event,
 * and app.js subscribes via `onDrilldown()` to translate that into the
 * existing filterState + refreshAll() — the only place filter state lives.
 *
 * Also tracks "active drilldown" so charts can highlight the selected
 * category and a Reset control can appear.
 */

const listeners = new Set();
let activeDrilldown = null; // { field, value } | null

/** Called by any visualization module when a data point is clicked. */
export function requestDrilldown(field, value) {
  activeDrilldown = { field, value };
  for (const cb of listeners) cb(activeDrilldown);
}

/**
 * Like requestDrilldown, but for data points that map to more than one
 * filter field at once (e.g. a heatmap cell = department + month).
 * `patch` is applied directly as the filter patch (see drilldownToFilterPatch).
 */
export function requestDrilldownMulti(patch, label) {
  activeDrilldown = { multi: true, patch, label };
  for (const cb of listeners) cb(activeDrilldown);
}

/** Double-click / explicit reset clears cross-filtering. */
export function resetDrilldown() {
  activeDrilldown = null;
  for (const cb of listeners) cb(null);
}

export function getActiveDrilldown() {
  return activeDrilldown;
}

/** Subscribe to drilldown requests. Returns an unsubscribe function. */
export function onDrilldown(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Maps a drilldown field/value onto the existing filterState shape used by
 * filter.js (createDefaultFilterState()). Kept here so every caller
 * (app.js) applies the same mapping rule — no duplicated switch statements.
 */
export function drilldownToFilterPatch(drilldown) {
  if (!drilldown) return {};
  if (drilldown.multi) return drilldown.patch || {};
  const { field, value } = drilldown;
  switch (field) {
    case 'department': return { department: value };
    case 'position': return { position: value };
    case 'manager': return { manager: value };
    case 'location': return { location: value };
    case 'month': return { month: value }; // value = "1".."12"
    case 'year': return { year: value };
    default: return {};
  }
}
