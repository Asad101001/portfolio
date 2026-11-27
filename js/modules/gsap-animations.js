/**
 * js/modules/gsap-animations.js  — v2 (conflict-free, performance-first)
 *
 * KEY FIXES:
 *  1. Strips .reveal CSS opacity:0 BEFORE GSAP runs (prevents invisible-element bug)
 *  2. GSAP owns all animation — IntersectionObserver in ui.js is left to only handle .section-in
 *  3. No competing fizz/shooting-star writers — just smooth compositor-only tweens
 *  4. Mobile: zero expensive effects, only opacity + translateY
 *  5. Scroll progress bar is the only rAF outside GSAP (minimal)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── High-refresh-rate + Performance Global Settings ─────────────────
gsap.defaults({
  force3D: true,
  ease: 'power3.out'
});

// Unlock 120Hz/144Hz: GSAP's ticker auto-matches display refresh rate
gsap.ticker.fps(144);
gsap.ticker.lagSmoothing(500, 33); // PERF: gracefully recovers from frame drops instead of stuttering

ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
const isMobile = () => window._isMobile || window.innerWidth < 768;

/* ─── Strip CSS reveal/stagger transitions so GSAP takes full control ─ */
function disableCSSReveal() {
  const s = document.createElement('style');
  s.id = 'gsap-reveal-reset';
  s.textContent = '.reveal, .section-in, .section-in .s-child { opacity: 1; transform: none; transition: none; }';
  document.head.appendChild(s);
}

/* ─── Hero Entrance ─────────────────────────────────────────────── */
function heroEntrance() {
  const heroEl = document.getElementById('hero');
  if (!heroEl) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });

  tl.from('.hero-status-pill', { opacity: 0, y: -14, duration: 0.45, ease: 'back.out(1.8)', clearProps: 'transform,opacity' })
    .from('.hero-title-wrap', { opacity: 0, y: 22, duration: 0.6, ease: 'power3.out', clearProps: 'transform,opacity' }, '-=0.22')
    .from('.hero-statement, .hero-lead', { opacity: 0, y: 14, stagger: 0.08, duration: 0.45, clearProps: 'transform,opacity' }, '-=0.25')
    .from('.hero-action-buttons > *', { opacity: 0, y: 12, stagger: 0.08, duration: 0.4, ease: 'back.out(1.6)', clearProps: 'transform,opacity' }, '-=0.2')
    .from('.hero-social-sublinks', { opacity: 0, y: 8, duration: 0.35, clearProps: 'transform,opacity' }, '-=0.15');

  const matrixCard = document.getElementById('hero-matrix-card');
  if (matrixCard) {
    if (!isMobile()) {
      tl.from(matrixCard, { opacity: 0, x: 28, duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.3);
    } else {
      tl.from(matrixCard, { opacity: 0, y: 20, duration: 0.55, clearProps: 'transform,opacity' }, 0.4);
    }
  }
}

/* ─── Floating Orbs (desktop only, GPU-only props) ──────────────── */
function floatingOrbs() {
  if (isMobile()) return;
  document.querySelectorAll('.hero-orb').forEach((orb, i) => {
    gsap.to(orb, {
      x: gsap.utils.random(-35, 35),
      y: gsap.utils.random(-25, 25),
      duration: gsap.utils.random(7, 12),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 1.8,
      force3D: true
    });
  });
}

/* ─── Scroll Reveals (architectural section & card entrances) ───── */
function scrollReveals() {
  // Featured Case Studies + Compact Rows (snappy threshold so cards never lag behind scroll)
  document.querySelectorAll('.case-study-card, .cp-row').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 14,
      duration: 0.36,
      delay: Math.min(i, 2) * 0.04,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        once: true,
      },
    });
  });

  // About & Focus Cards
  const aboutCards = document.querySelectorAll('.about-col, .concurrent-focus-col');
  if (aboutCards.length) {
    aboutCards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 14,
        duration: 0.36,
        delay: i * 0.05,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 95%',
          once: true,
        },
      });
    });
  }

  // Arsenal domain cards & credentials table
  document.querySelectorAll('.arsenal-domain, .credentials-table-wrap').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 14,
      duration: 0.34,
      delay: Math.min(i % 2, 1) * 0.05,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });

  // Education Staircase items
  document.querySelectorAll('.edu-stair-item').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      x: isMobile() ? 0 : -14,
      y: 12,
      duration: 0.36,
      delay: i * 0.05,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        once: true,
      },
    });
  });

  // Social platform chips & feed cards
  const socialCards = document.querySelectorAll('.social-platform-card, .social-split-grid > *, .social-fullwidth-wrap');
  if (socialCards.length) {
    socialCards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 14,
        duration: 0.34,
        delay: Math.min(i % 4, 3) * 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 95%',
          once: true,
        },
      });
    });
  }
}

/* ─── Subtle Mouse Parallax on Hero Cards (desktop only) ─────────── */
function heroParallax() {
  if (isMobile()) return;
  const hero = document.getElementById('hero');
  const cards = document.querySelectorAll('.hero-grid .glass-card');
  if (!hero || !cards.length) return;

  // Use gsap.quickTo for maximum performance on high-frequency events like mousemove
  const xSetters = Array.from(cards).map(c => gsap.quickTo(c, "x", { duration: 0.9, ease: "power2.out" }));
  const ySetters = Array.from(cards).map(c => gsap.quickTo(c, "y", { duration: 0.9, ease: "power2.out" }));

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const mx = (e.clientX - r.left - r.width  / 2) / r.width;
    const my = (e.clientY - r.top  - r.height / 2) / r.height;
    
    cards.forEach((_, i) => {
      xSetters[i](mx * (3 + i * 1.2));
      ySetters[i](my * (2.5 + i));
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    cards.forEach((_, i) => {
      xSetters[i](0);
      ySetters[i](0);
    });
  });
}

/* ─── Focus Item Hover Nudge ─────────────────────────────────────── */
function focusItemHover() {
  document.querySelectorAll('.focus-item').forEach(item => {
    item.addEventListener('mouseenter', () => gsap.to(item, { x: 5, duration: 0.18, ease: 'power2.out' }));
    item.addEventListener('mouseleave', () => gsap.to(item, { x: 0, duration: 0.3, ease: 'power3.out' }));
  });
}

/* ─── Experience Toggle Breathing ───────────────────────────────── */
function experienceToggle() {
  const btn = document.getElementById('experience-toggle');
  if (!btn) return;

  let breathing = gsap.to(btn, {
    scale: 1.012,
    duration: 2.2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  btn.addEventListener('mouseenter', () => {
    breathing.pause();
    gsap.to(btn, { scale: 1.03, duration: 0.18, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      scale: 1,
      duration: 0.45,
      ease: 'elastic.out(1, 0.45)',
      onComplete: () => breathing.resume(),
    });
  });
}

/* ─── Scroll Progress Bar (GPU scaleX, zero layout triggers) ───── */
function scrollProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'gsap-scroll-bar';
  bar.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:2.5px', 'width:100%',
    'background:linear-gradient(90deg,#F59E0B,#D97706)',
    'z-index:9999', 'pointer-events:none',
    'transform-origin:left center',
    'transform:scaleX(0)',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const docH = Math.max(1, (window._docH || (document.documentElement.scrollHeight - window.innerHeight)));
    const ratio = Math.min(1, Math.max(0, window.scrollY / docH));
    bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ─── Footer Blocks Spring ───────────────────────────────────────── */
function footerBlocks() {
  const blocks = document.querySelectorAll('#footer-blocks .block');
  if (!blocks.length) return;
  gsap.from(blocks, {
    scaleY: 0,
    transformOrigin: 'bottom',
    stagger: 0.1,
    duration: 0.45,
    ease: 'back.out(2)',
    scrollTrigger: { trigger: '#footer-blocks', start: 'top 90%', once: true },
  });
}

/* ─── SVG Line Drawing Animation (Disabled for smooth scroll performance) ─ */
function svgDrawAnimation() {
  // Disabled: getTotalLength() queries across hundreds of SVGs trigger forced reflows & scroll jank
}

/* ─── Boot ───────────────────────────────────────────────────────── */
function boot() {
  // Critical for above-the-fold
  disableCSSReveal();
  heroEntrance();
  floatingOrbs();

  // Defer below-the-fold scroll triggers to avoid large layout thrashing in one task
  setTimeout(() => {
    scrollReveals();
    heroParallax();
  }, 100);

  setTimeout(() => {
    focusItemHover();
    experienceToggle();
    scrollProgressBar();
    footerBlocks();
    ScrollTrigger.refresh();
  }, 250);

}

// Wait for DOM + a small delay so the loading screen is gone
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 50));
} else {
  setTimeout(boot, 50);
}
