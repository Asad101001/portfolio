/* ════════════════════════════════════════════════════════════════
   js/modules/scroll-choreography.js
   Lightweight Zero-Layout-Thrash Directional Scroll Engine
   - Tracks body[data-scroll-dir="up"|"down"] via rAF-guarded scrollY check
   - Drives unique black .section-header effects immediately on entry
   - Differentiates scroll-down vs scroll-up revisits via IntersectionObserver
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

  let tickPending = false;
  window.addEventListener(
    'scroll',
    () => {
      if (tickPending) return;
      tickPending = true;
      requestAnimationFrame(() => {
        tickPending = false;
        const y = window.scrollY || window.pageYOffset || 0;
        if (y - lastY > 2) dir = 'down';
        else if (lastY - y > 2) dir = 'up';
        lastY = y;
        if (body.dataset.scrollDir !== dir) {
          body.dataset.scrollDir = dir;
        }
      });
    },
    { passive: true }
  );

  // Trigger black section headers slightly before entering viewport so morphs are crisp & immediate
  if ('IntersectionObserver' in window) {
    const headerObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove('sh-dir-up', 'sh-dir-down');
            el.classList.add('sh-active', dir === 'up' ? 'sh-dir-up' : 'sh-dir-down');
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.95 || entry.boundingClientRect.bottom < 0) {
            el.classList.remove('sh-dir-up', 'sh-dir-down');
            // Re-arm border/beam/shutter transitions cleanly offscreen without hiding readable titles
            if (el.closest('#projects, #about, #tech, #credentials, #education, #contact')) {
              el.classList.remove('sh-active');
            }
          }
        });
      },
      { threshold: 0.05, rootMargin: '80px 0px 85px 0px' }
    );
    headers.forEach((h) => headerObs.observe(h));

    // Upward revisit highlight on case studies & arsenal domains (zero per-scroll DOM reads)
    const cards = document.querySelectorAll('.case-study-card, #arsenal-grid .arsenal-domain');
    const cardObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (dir === 'up' && el.dataset.seenOnce === '1') {
              el.classList.add('revisit-up');
            }
            el.dataset.seenOnce = '1';
          } else {
            el.classList.remove('revisit-up');
          }
        });
      },
      { threshold: 0.14 }
    );
    cards.forEach((c) => cardObs.observe(c));
  } else {
    headers.forEach((h) => h.classList.add('sh-active'));
  }
})();
