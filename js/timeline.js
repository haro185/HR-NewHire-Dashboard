/**
 * timeline.js
 * Sprint 6 — Onboarding timeline. Every employee becomes one event on a
 * horizontal, scrollable timeline grouped by Month / Quarter / Year
 * ("zoom level" — implemented as a grouping switch rather than true
 * pinch-zoom, which keeps it fast and fully keyboard/touch accessible).
 */
import { parseISODate, monthKey, monthLabel } from './utils.js';
import { requestDrilldown } from './drilldown.js';

let zoomLevel = 'month'; // 'month' | 'quarter' | 'year'

export function setTimelineZoom(level) {
  zoomLevel = level;
}
export function getTimelineZoom() {
  return zoomLevel;
}

export function renderTimeline(records) {
  const track = document.getElementById('timeline-track');
  if (!track) return;

  if (!records.length) {
    track.innerHTML = '<p class="timeline-empty">No hires to display for the current filters.</p>';
    return;
  }

  const groups = groupRecords(records, zoomLevel);

  track.innerHTML = groups.map((g) => `
    <div class="timeline-group">
      <button type="button" class="timeline-group__header" data-group-key="${g.key}" data-group-level="${zoomLevel}"
        aria-label="Filter by ${g.label}, ${g.items.length} hire(s)">
        <span class="timeline-group__label">${g.label}</span>
        <span class="timeline-group__count">${g.items.length}</span>
      </button>
      <div class="timeline-group__events">
        ${g.items.map((r) => `
          <div class="timeline-event" tabindex="0" role="listitem"
            aria-label="${escapeHtml(r.employeeName)}, ${escapeHtml(r.position)}, ${escapeHtml(r.department)}, started ${r.startDate}">
            <span class="timeline-event__dot" aria-hidden="true"></span>
            <span class="timeline-event__name">${escapeHtml(r.employeeName)}</span>
            <span class="timeline-event__meta">${escapeHtml(r.position)} · ${escapeHtml(r.department)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  track.querySelectorAll('.timeline-group__header').forEach((btn) => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.groupLevel;
      const key = btn.dataset.groupKey;
      if (level === 'month') {
        const [, m] = key.split('-');
        requestDrilldown('month', String(parseInt(m, 10)));
      } else if (level === 'year') {
        requestDrilldown('year', key);
      }
      // quarter grouping has no single filter field — visual grouping only.
    });
  });
}

function groupRecords(records, level) {
  const buckets = new Map();
  for (const r of records) {
    const d = parseISODate(r.startDate);
    if (!d) continue;
    let key, label;
    if (level === 'year') {
      key = String(d.getFullYear());
      label = key;
    } else if (level === 'quarter') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      key = `${d.getFullYear()}-Q${q}`;
      label = `Q${q} ${d.getFullYear()}`;
    } else {
      key = monthKey(r.startDate);
      label = monthLabel(key);
    }
    if (!buckets.has(key)) buckets.set(key, { key, label, items: [] });
    buckets.get(key).items.push(r);
  }
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
