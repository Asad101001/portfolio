/* ════════════════════════════════════════════════════════════════
   js/modules/scroll-choreography.js
   Low-End & Mobile-Smooth Reversible Scroll Morph Engine
   - Tight 8-tile GPU sticky morph (#work-transition), zero canvas loop
   - Reversibly toggles section headers, bespoke SVG paths/rotations,
     and revisit accents across both Scroll-Down & Scroll-Up
   ════════════════════════════════════════════════════════════════ */

(function initScrollChoreography() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  let lastY = window.scrollY || window.pageYOffset || 0;
  let dir = 'down';
  body.dataset.scrollDir = 'down';

  const headers = Array.from(document.querySelectorAll('section:not(#hero) .section-header'));
  if (prefersReduced) {
    headers.forEach((h) => h.classList.add('sh-active'));
    return;
  }

  // ── 1. Fast, Reversible 8-Tile Sticky Stage (#work-transition) ─
  const stage = document.getElementById('work-transition');
  const sticky = document.getElementById('wt-sticky');
  const tiles = Array.from(document.querySelectorAll('#wt-tiles .wt-tile'));
  const dirPill = document.getElementById('wt-dir-pill');
  const TILE_ORDER = [0, 7, 2, 5, 1, 6, 3, 4];

  let wtInView = false;
  let wtRafPending = false;
  let cachedScrollable = stage ? Math.max(1, stage.offsetHeight - window.innerHeight) : 1;

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function updateStickyStage() {
    if (!stage || !sticky) return;
    const rectTop = stage.getBoundingClientRect().top;
    const p = clamp01(-rectTop / cachedScrollable);

    sticky.classList.toggle('is-ink', p >= 0.24);
    const floorP = clamp01((p - 0.34) / 0.34);
    const copyP = clamp01(p / 0.36);
    sticky.style.setProperty('--wt-floor', floorP.toFixed(3));
    sticky.style.setProperty('--wt-copy', copyP.toFixed(3));

    if (dirPill) {
      if (dir === 'up' && p > 0.02 && p < 0.96) {
        dirPill.innerHTML = 'REWINDING &uarr;';
      } else if (p >= 0.50) {
        dirPill.innerHTML = 'WORK READY &darr;';
      } else {
        dirPill.innerHTML = 'SCROLL &darr;';
      }
    }

    // Complete 8 modular GPU tiles swiftly between p = 0.02 and 0.52 (instant feel)
    const count = tiles.length;
    for (let rank = 0; rank < count; rank++) {
      const tile = tiles[TILE_ORDER[rank]];
      if (!tile) continue;
      const startP = 0.02 + (rank / count) * 0.28;
      const tP = clamp01((p - startP) / 0.22);
      const eased = tP * tP * (3 - 2 * tP);
      tile.style.transform = `scale3d(${eased.toFixed(3)},${eased.toFixed(3)},1)`;
      tile.style.opacity = eased.toFixed(3);
    }
  }

  if (stage && 'IntersectionObserver' in window) {
    const wtObs = new IntersectionObserver(
      (entries) => {
        wtInView = entries[0].isIntersecting;
        if (wtInView) updateStickyStage();
      },
      { rootMargin: '120px 0px 120px 0px' }
    );
    wtObs.observe(stage);
  }

  window.addEventListener(
    'resize',
    () => {
      if (stage) cachedScrollable = Math.max(1, stage.offsetHeight - window.innerHeight);
      if (wtInView) updateStickyStage();
    },
    { passive: true }
  );

  // ── 2. Lightweight Single rAF Direction + Sticky Tracker ──────
  window.addEventListener(
    'scroll',
    () => {
      if (wtRafPending) return;
      wtRafPending = true;
      requestAnimationFrame(() => {
        wtRafPending = false;
        const y = window.scrollY || window.pageYOffset || 0;
        if (y - lastY > 2) dir = 'down';
        else if (lastY - y > 2) dir = 'up';
        lastY = y;

        if (body.dataset.scrollDir !== dir) {
          body.dataset.scrollDir = dir;
        }
        if (wtInView) {
          updateStickyStage();
        }
      });
    },
    { passive: true }
  );

  // ── 3. Reversible Header Graphics & Directional Section Effects ─
  if ('IntersectionObserver' in window) {
    const headerObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove('sh-dir-up', 'sh-dir-down');
            el.classList.add('sh-active', dir === 'up' ? 'sh-dir-up' : 'sh-dir-down');
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.94 || entry.boundingClientRect.bottom < 0) {
            // Re-arm reversibly whenever scrolled completely out top or bottom
            el.classList.remove('sh-active', 'sh-dir-up', 'sh-dir-down');
          }
        });
      },
      { threshold: 0.05, rootMargin: '95px 0px 95px 0px' }
    );
    headers.forEach((h) => headerObs.observe(h));

    // Upward-revisit accents + reversible education bar state
    const revisitTargets = document.querySelectorAll('.case-study-card, #arsenal-grid .arsenal-domain, .edu-stair-item');
    const revisitObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add('in-view-ed');
            if (dir === 'up' && el.dataset.seenOnce === '1') {
              el.classList.add('revisit-up');
            }
            el.dataset.seenOnce = '1';
          } else {
            el.classList.remove('revisit-up');
            if (dir === 'up') el.classList.remove('in-view-ed');
          }
        });
      },
      { threshold: 0.14 }
    );
    revisitTargets.forEach((el) => revisitObs.observe(el));
  } else {
    headers.forEach((h) => h.classList.add('sh-active'));
  }

  // Initial sync
  updateStickyStage();
})();
