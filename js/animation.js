/**
 * animation.js
 * Sprint 6 — Small, dependency-free animation helpers used by the
 * visualization layer. Pure DOM/rAF utilities — no business logic.
 */

/**
 * Animate a numeric text value from its current displayed number to `to`.
 * Falls back to an instant set for non-numeric targets (e.g. "Hanoi (12)").
 */
export function animateNumber(el, to, { duration = 500, formatter = (n) => Math.round(n).toLocaleString() } = {}) {
  if (!el) return;
  if (el._numberAnimationFrame) cancelAnimationFrame(el._numberAnimationFrame);
  const raw = el.textContent.replace(/[^\d.-]/g, '');
  const from = raw ? parseFloat(raw) : 0;
  const targetNum = typeof to === 'number' ? to : parseFloat(String(to).replace(/[^\d.-]/g, ''));

  if (Number.isNaN(from) || Number.isNaN(targetNum)) {
    el.textContent = String(to);
    return;
  }

  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(progress);
    const current = from + (targetNum - from) * eased;
    el.textContent = formatter(current);
    if (progress < 1) el._numberAnimationFrame = requestAnimationFrame(tick);
    else {
      el.textContent = formatter(targetNum);
      delete el._numberAnimationFrame;
    }
  }
  el._numberAnimationFrame = requestAnimationFrame(tick);
}

/** Animate every [data-animate-target] number inside a container at once. */
export function animateAllNumbers(container) {
  if (!container) return;
  container.querySelectorAll('[data-animate-target]').forEach((el) => {
    const text = el.textContent.trim();
    const numeric = parseFloat(text.replace(/[^\d.-]/g, ''));
    if (!Number.isNaN(numeric) && /^-?[\d.,]+%?$/.test(text.replace(/\s/g, ''))) {
      const suffix = text.includes('%') ? '%' : '';
      const to = numeric;
      el.textContent = '0' + suffix;
      animateNumber(el, to, { formatter: (n) => `${Math.round(n).toLocaleString()}${suffix}` });
    }
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Fade an element in (used after async chart/heatmap render). */
export function fadeIn(el, duration = 220) {
  if (!el) return;
  el.style.transition = `opacity ${duration}ms ease`;
  el.style.opacity = '0';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  });
}

/** Show a shimmering skeleton placeholder inside a container while data loads. */
export function showSkeleton(container, rows = 3) {
  if (!container) return;
  container.innerHTML = Array.from({ length: rows })
    .map(() => '<div class="skeleton-bar"></div>')
    .join('') + '<span class="visually-hidden" role="status">Loading content</span>';
  container.classList.add('is-loading-skeleton');
  container.setAttribute('aria-busy', 'true');
}

export function hideSkeleton(container) {
  if (!container) return;
  container.classList.remove('is-loading-skeleton');
  container.removeAttribute('aria-busy');
}
