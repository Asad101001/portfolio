/* ══════════════════════════════════════════════════════════
   js/modules/lenis-setup.js
   Native smooth scroll — replaces Lenis (removed as unused dep).
   CSS scroll-behavior: smooth is set on <html> which handles
   anchor link scrolling with zero JS overhead.
   ══════════════════════════════════════════════════════════ */

// Enable native CSS smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

// Polyfill smoothScrollTo used elsewhere in the codebase
if (!window.smoothScrollTo) {
  window.smoothScrollTo = function(target, offset) {
    offset = offset || -80;
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  };
}

export function initLenis() { return null; }
