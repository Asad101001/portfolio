if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* ── Global Shared State ─────────────────────────────────── */
window._isMobile   = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
window._lerpY    = 0;
window._scrollTasks = [];

/* ── Passive scroll listener & Cached Doc Height ───────────── */
(function () {
  var prevY = 0;
  function onScroll() {
    var y = window.pageYOffset;
    window._scrollDir = y > prevY ? 1 : -1;
    window._scrollY   = y;
    prevY = y;
  }
  function calcDocH() {
    window._docH = Math.max(1, Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', calcDocH, { passive: true });
  window.addEventListener('load', calcDocH, { once: true });
  window._calcDocH = calcDocH;
  calcDocH();
  onScroll();
})();

/* ── Master rAF Loop ─────────────────────────────────────── */
if (window._isMobile) {
  // Batch mobile scroll callbacks into at most 1 rAF per frame for zero scroll jank
  var mobileRafPending = false;
  function flushMobileScroll(timestamp) {
    mobileRafPending = false;
    window._lerpY = window._scrollY;
    var len = window._scrollTasks.length;
    for (var i = 0; i < len; i++) {
      try { window._scrollTasks[i](timestamp); } catch (err) {}
    }
  }
  window.addEventListener('scroll', function() {
    if (!mobileRafPending) {
      mobileRafPending = true;
      requestAnimationFrame(flushMobileScroll);
    }
  }, { passive: true });

  setTimeout(function() {
    flushMobileScroll(0);
  }, 100);
} else {
  // On desktop, run scroll tasks inside one cohesive rAF batch on scroll (no idle extra loop)
  var desktopRafPending = false;
  window.addEventListener('scroll', function() {
    if (!desktopRafPending) {
      desktopRafPending = true;
      requestAnimationFrame(function(timestamp) {
        desktopRafPending = false;
        window._lerpY = window._scrollY;
        var len = window._scrollTasks.length;
        for (var i = 0; i < len; i++) {
          try { window._scrollTasks[i](timestamp); } catch (err) {}
        }
      });
    }
  }, { passive: true });
  setTimeout(function() {
    window._lerpY = window._scrollY;
    var len = window._scrollTasks.length;
    for (var i = 0; i < len; i++) {
      try { window._scrollTasks[i](0); } catch (err) {}
    }
  }, 100);
}

/* ── DOM Ready Initializations ────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Easter Egg Console Message
  const styleTitle = "font-size: 24px; font-weight: 800; color: #00ff41; background: #18181b; padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0,255,65,0.3); font-family: monospace;";
  const styleBody = "font-size: 14px; color: #a1a1aa; line-height: 1.6; font-family: monospace;";
  console.log("%cSystem Initialized. // Muhammad Asad Khan", styleTitle);
  console.log("%c\nHey fellow dev! Looking under the hood?\nThe source code is completely modular and built with Vanilla JS + Vite.\n\nLet's connect:\nLinkedIn: https://www.linkedin.com/in/muhammadasad101/\nGitHub:   https://github.com/Asad101001\n", styleBody);

  // Trigger SVG animations on scroll
  // Project SVG Drawing Trigger Task
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawing'); // Trigger the drawing in CSS
        projectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Trigger earlier so drawing starts as it fades in

  document.querySelectorAll('.project-card').forEach(card => projectObserver.observe(card));

  // Disabled hash scroll on load to keep default top-of-page behavior across reloads.
});

// NOTE: LiquidGlass mount is disabled — it breaks hero card styling by clearing
// innerHTML and re-mounting in a React root, which kills GSAP bindings and
// overwrites the dark glass background with a flat gray overlay.
// The native CSS glass effect on .hero-main is the intended implementation.
// import('./components/LiquidGlassHero.jsx').then(({ mountLiquidGlass }) => {
//   mountLiquidGlass();
// }).catch(err => console.error("Failed to load LiquidGlass wrapper", err));
