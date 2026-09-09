// js/main.js
// Main entry point: minimal critical code for FCP/LCP, optimized progressive loading

import './app.js';
import './modules/loader.js';
import './modules/theme.js';
import './modules/ui.js';
import './modules/mobile.js';
import './modules/desktop.js';

// Fast native fallback for smoothScrollTo before any deferred libraries load
if (!window.smoothScrollTo) {
  window.smoothScrollTo = (target, offset = -30) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
}

// Progressive module hydration after initial paint
window.addEventListener('load', () => {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 1024;

  // Desktop only: Load Lenis smooth scroll without bloating the mobile bundle
  if (!isMobile) {
    import('./modules/lenis-setup.js');
  }

  const idleLoad = (fn, timeout = 2000) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, timeout);
    }
  };

  // Phase 1: Core animations — critical for above-fold feel
  idleLoad(() => {
    import('./modules/animations.js');
    import('./modules/swup-setup.js');
  }, isMobile ? 500 : 250);

  // Phase 2: Canvas (desktop only) + GSAP scroll triggers
  idleLoad(() => {
    if (!isMobile) import('./modules/canvas.js');
    import('./modules/gsap-animations.js');
  }, isMobile ? 1200 : 600);

  // Phase 3: Interactive terminal & WebGL (desktop only, very heavy)
  idleLoad(() => {
    import('./modules/terminal.js');
    if (!isMobile) import('./modules/webgl.js');
  }, isMobile ? 2200 : 1200);

  // Phase 4: Below-fold widgets & Twitter feed
  let widgetsLoaded = false;
  let twitterLoaded = false;

  const loadWidgets = () => {
    if (!widgetsLoaded) {
      widgetsLoaded = true;
      import('./modules/widgets.js');
    }
  };

  const loadTwitter = () => {
    if (!twitterLoaded) {
      twitterLoaded = true;
      import('./modules/twitter.js');
    }
  };

  // Pre-fetch on scroll proximity to social / widgets
  const twitterEl = document.getElementById('twitter-feed') || document.getElementById('social');
  if (twitterEl && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadTwitter();
        obs.disconnect();
      }
    }, { rootMargin: '400px' });
    obs.observe(twitterEl);
  }

  // Fallback idle load so they are ready even if user doesn't scroll immediately
  idleLoad(() => {
    loadWidgets();
    loadTwitter();
  }, isMobile ? 2800 : 1600);
});
