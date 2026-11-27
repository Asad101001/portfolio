// js/main.js
// Main entry point: minimal critical code for FCP/LCP, optimized progressive loading

import './app.js';
import './modules/loader.js';
import './modules/theme.js';
import './modules/ui.js';
import './modules/mobile.js';
import './modules/desktop.js';
import './modules/scroll-choreography.js';

// Fast native fallback for smoothScrollTo before any deferred libraries load
if (!window.smoothScrollTo) {
  window.smoothScrollTo = (target, offset = -30) => {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
}

// Progressive module hydration after initial paint
window.addEventListener('load', () => {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;

  const idleLoad = (fn, timeout = 2500) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, timeout);
    }
  };

  let widgetsLoaded = false;
  let twitterLoaded = false;
  let deviconsLoaded = false;

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

  const loadDevicons = () => {
    if (deviconsLoaded || document.getElementById('devicon-css')) return;
    deviconsLoaded = true;
    const link = document.createElement('link');
    link.id = 'devicon-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css';
    document.head.appendChild(link);
  };

  // Hydrate widgets on scroll proximity to about/contact or on interaction
  const triggerWidgetLoad = () => {
    loadWidgets();
    loadTwitter();
  };

  // Immediate desktop-only enhancements (smooth scroll + non-blocking visual modules)
  if (!isMobile) {
    import('./modules/lenis-setup.js');

    idleLoad(() => {
      import('./modules/animations.js');
      import('./modules/canvas.js');
      import('./modules/gsap-animations.js');
    }, 600);

    idleLoad(() => {
      import('./modules/terminal.js');
      import('./modules/webgl.js');
    }, 1400);
  }

  // Defer heavy widgets until user interacts or scrolls towards them
  const onUserInteraction = () => {
    triggerWidgetLoad();
    loadDevicons();
    window.removeEventListener('scroll', onUserInteraction);
    window.removeEventListener('touchstart', onUserInteraction);
  };
  window.addEventListener('scroll', onUserInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', onUserInteraction, { passive: true, once: true });

  // Pre-fetch Devicons when scrolling towards Tech Stack
  const techEl = document.getElementById('tech');
  if (techEl && 'IntersectionObserver' in window) {
    const techObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadDevicons();
        techObs.disconnect();
      }
    }, { rootMargin: '350px' });
    techObs.observe(techEl);
  }

  // Pre-fetch Widgets & Twitter on scroll proximity to about or contact
  const widgetTrigger = document.getElementById('about') || document.getElementById('contact');
  if (widgetTrigger && 'IntersectionObserver' in window) {
    const wObs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        triggerWidgetLoad();
        wObs.disconnect();
      }
    }, { rootMargin: '400px' });
    wObs.observe(widgetTrigger);
  }

  // Fallback idle hydration after initial Lighthouse evaluation window
  idleLoad(() => {
    triggerWidgetLoad();
    loadDevicons();
  }, isMobile ? 3800 : 2600);
});
