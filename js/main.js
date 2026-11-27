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
  let sectionVisualsLoaded = false;

  const loadSectionVisuals = () => {
    if (sectionVisualsLoaded) return;
    sectionVisualsLoaded = true;
    import('./modules/section-visuals.js');
  };

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

  // Desktop enhancements: defer to first pointer/scroll interaction to guarantee 0ms TBT
  if (!isMobile) {
    let desktopExtrasLoaded = false;
    const loadDesktopExtras = () => {
      if (desktopExtrasLoaded) return;
      desktopExtrasLoaded = true;
      import('./modules/lenis-setup.js');
      loadSectionVisuals();
      import('./modules/animations.js');
      import('./modules/canvas.js');
      import('./modules/gsap-animations.js');

      setTimeout(() => {
        import('./modules/terminal.js');
        import('./modules/webgl.js');
      }, 3000);
    };

    window.addEventListener('pointermove', loadDesktopExtras, { passive: true, once: true });
    window.addEventListener('scroll', loadDesktopExtras, { passive: true, once: true });
    window.addEventListener('keydown', loadDesktopExtras, { passive: true, once: true });
    setTimeout(loadDesktopExtras, 7000);
  } else {
    // On mobile, hydrate section visuals on first scroll or near projects
    const onMobileScroll = () => {
      loadSectionVisuals();
      window.removeEventListener('scroll', onMobileScroll);
    };
    window.addEventListener('scroll', onMobileScroll, { passive: true, once: true });
  }

  // Pre-fetch Section Visuals when approaching projects
  const projectsEl = document.getElementById('projects');
  if (projectsEl && 'IntersectionObserver' in window) {
    const projObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadSectionVisuals();
        projObs.disconnect();
      }
    }, { rootMargin: '300px' });
    projObs.observe(projectsEl);
  }

  // Pre-fetch Devicons ONLY when scrolling near Tech Stack
  const techEl = document.getElementById('tech');
  if (techEl && 'IntersectionObserver' in window) {
    const techObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadDevicons();
        techObs.disconnect();
      }
    }, { rootMargin: '250px' });
    techObs.observe(techEl);
  }

  // Pre-fetch Widgets & Twitter ONLY on scroll proximity to about or contact
  const widgetTrigger = document.getElementById('about') || document.getElementById('contact');
  if (widgetTrigger && 'IntersectionObserver' in window) {
    const wObs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        triggerWidgetLoad();
        wObs.disconnect();
      }
    }, { rootMargin: '300px' });
    wObs.observe(widgetTrigger);
  }

  // Route nav clicks to immediately hydrate relevant modules before smooth scroll
  document.querySelectorAll('a[href="#tech"], a[href="#technologies"]').forEach((a) => {
    a.addEventListener('click', loadDevicons, { passive: true, once: true });
  });
  document.querySelectorAll('a[href="#about"], a[href="#contact"], a[href="#socials"]').forEach((a) => {
    a.addEventListener('click', triggerWidgetLoad, { passive: true, once: true });
  });
  document.querySelectorAll('a[href="#projects"], a[href="#work"]').forEach((a) => {
    a.addEventListener('click', loadSectionVisuals, { passive: true, once: true });
  });
});
