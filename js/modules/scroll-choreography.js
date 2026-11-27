/* ════════════════════════════════════════════════════════════════
   js/modules/scroll-choreography.js
   Bidirectional Scroll-to-Morph Stage + Scroll-Direction Reveals
   - Drives #work-transition sticky 2D particle-to-grid + 16-tile morph
   - Tracks body[data-scroll-dir="up"|"down"] so scrolling UP & DOWN
     adjusts reveals, parallax, dividers, and revisit accents smoothly
   ════════════════════════════════════════════════════════════════ */

(function initScrollChoreography() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const docEl = document.documentElement;
  const body = document.body;
  let lastY = window.scrollY || window.pageYOffset || 0;
  let currentDir = 'down';
  body.dataset.scrollDir = 'down';

  // ── 1. Sticky Work-Transition Morph Engine (#work-transition) ──
  const stage = document.getElementById('work-transition');
  const sticky = document.getElementById('wt-sticky');
  const tiles = Array.from(document.querySelectorAll('#wt-tiles .wt-tile'));
  const dirPill = document.getElementById('wt-dir-pill');
  const wtCanvas = document.getElementById('wt-canvas');

  // Shuffled spatial order so tiles snap cleanly across quadrants
  const TILE_ORDER = [0, 15, 5, 10, 3, 12, 6, 9, 1, 14, 7, 8, 2, 13, 4, 11];
  let wtTargetP = 0;
  let wtCurrentP = 0;
  let wtInView = false;
  let wtRaf = null;

  // 24 geometric data nodes morphing between organic wave drift & 6x4 structured matrix
  const wtCtx = wtCanvas ? wtCanvas.getContext('2d') : null;
  const NODE_COUNT = 24;
  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
    seed: i * 1.37,
    col: i % 6,
    row: Math.floor(i / 6),
    amber: i % 3 === 0,
  }));

  function resizeWtCanvas() {
    if (!wtCanvas || !sticky) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = sticky.clientWidth || window.innerWidth;
    const h = sticky.clientHeight || window.innerHeight;
    if (wtCanvas.width !== Math.round(w * dpr) || wtCanvas.height !== Math.round(h * dpr)) {
      wtCanvas.width = Math.round(w * dpr);
      wtCanvas.height = Math.round(h * dpr);
    }
  }

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function renderWorkTransition(p, timeSec) {
    if (!sticky) return;

    sticky.style.setProperty('--wt-p', p.toFixed(4));
    sticky.classList.toggle('is-ink', p >= 0.36);

    const floorP = clamp01((p - 0.52) / 0.34);
    const copyP = clamp01((p - 0.14) / 0.42);
    const exitP = clamp01((p - 0.84) / 0.16);
    sticky.style.setProperty('--wt-floor', floorP.toFixed(4));
    sticky.style.setProperty('--wt-copy-in', copyP.toFixed(4));
    sticky.style.setProperty('--wt-exit', exitP.toFixed(4));

    if (dirPill) {
      if (currentDir === 'up' && p > 0.04 && p < 0.96) {
        dirPill.innerHTML = 'REWINDING &uarr; INTRO';
      } else if (p >= 0.72) {
        dirPill.innerHTML = 'READY // SELECTED WORK &darr;';
      } else {
        dirPill.innerHTML = 'MORPHING &rarr; WORK &darr;';
      }
    }

    // Drive 16 modular blocks symmetrically (forward scrolling down, reverse scrolling up)
    const nTiles = tiles.length;
    for (let rank = 0; rank < nTiles; rank++) {
      const tile = tiles[TILE_ORDER[rank]];
      if (!tile) continue;
      const startP = 0.05 + (rank / nTiles) * 0.42;
      const span = 0.22;
      const tP = clamp01((p - startP) / span);
      // Smooth cubic ease
      const eased = tP * tP * (3 - 2 * tP);
      tile.style.transform = `scale(${eased.toFixed(3)})`;
      tile.style.opacity = eased.toFixed(3);
    }

    // Draw organic -> 6x4 structured matrix canvas behind/around tiles
    if (wtCtx && wtCanvas) {
      resizeWtCanvas();
      const cw = wtCanvas.width;
      const ch = wtCanvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      wtCtx.clearRect(0, 0, cw, ch);

      const dotAlpha = 1 - clamp01((p - 0.46) / 0.28);
      if (dotAlpha > 0.02) {
        const gridBlend = clamp01((p - 0.08) / 0.40);
        const padX = cw * 0.16;
        const padY = ch * 0.22;
        const gridW = cw - padX * 2;
        const gridH = ch - padY * 2;

        const pts = [];
        for (let i = 0; i < NODE_COUNT; i++) {
          const n = nodes[i];
          const gx = padX + (n.col / 5) * gridW;
          const gy = padY + (n.row / 3) * gridH;

          const waveX = cw * (0.14 + ((i * 0.19 + Math.sin(timeSec * 0.65 + n.seed) * 0.06) % 0.72));
          const waveY = ch * (0.5 + Math.sin(timeSec * 0.8 + n.seed * 1.4) * 0.28);

          const x = waveX + (gx - waveX) * gridBlend;
          const y = waveY + (gy - waveY) * gridBlend;
          pts.push({ x, y, amber: n.amber });
        }

        // Faint connecting lattice lines emerge as points organize into grid
        if (gridBlend > 0.18) {
          wtCtx.strokeStyle = `rgba(217, 119, 6, ${(gridBlend * dotAlpha * 0.22).toFixed(3)})`;
          wtCtx.lineWidth = Math.max(1, dpr);
          wtCtx.beginPath();
          for (let i = 0; i < pts.length; i++) {
            const c = i % 6;
            const r = Math.floor(i / 6);
            if (c < 5) {
              wtCtx.moveTo(pts[i].x, pts[i].y);
              wtCtx.lineTo(pts[i + 1].x, pts[i + 1].y);
            }
            if (r < 3) {
              wtCtx.moveTo(pts[i].x, pts[i].y);
              wtCtx.lineTo(pts[i + 6].x, pts[i + 6].y);
            }
          }
          wtCtx.stroke();
        }

        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i];
          wtCtx.fillStyle = pt.amber
            ? `rgba(217, 119, 6, ${(dotAlpha * 0.88).toFixed(3)})`
            : `rgba(18, 18, 18, ${(dotAlpha * 0.65).toFixed(3)})`;
          wtCtx.beginPath();
          wtCtx.arc(pt.x, pt.y, (pt.amber ? 4.2 : 3.0) * dpr, 0, Math.PI * 2);
          wtCtx.fill();
        }
      }
    }
  }

  function updateTargetProgress() {
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const totalScrollable = Math.max(1, stage.offsetHeight - window.innerHeight);
    wtTargetP = clamp01(-rect.top / totalScrollable);
  }

  function wtTick(now) {
    if (!wtInView && Math.abs(wtTargetP - wtCurrentP) < 0.002) {
      wtRaf = null;
      return;
    }
    wtCurrentP += (wtTargetP - wtCurrentP) * 0.18;
    renderWorkTransition(wtCurrentP, now * 0.001);
    wtRaf = requestAnimationFrame(wtTick);
  }

  if (stage && !prefersReduced) {
    if ('IntersectionObserver' in window) {
      const wtObs = new IntersectionObserver(
        (entries) => {
          wtInView = entries[0].isIntersecting;
          if (wtInView && !wtRaf) {
            updateTargetProgress();
            wtRaf = requestAnimationFrame(wtTick);
          }
        },
        { rootMargin: '220px 0px 220px 0px' }
      );
      wtObs.observe(stage);
    } else {
      wtInView = true;
      wtRaf = requestAnimationFrame(wtTick);
    }
  }

  // ── 2. Bidirectional Per-Section Scrubs & Upward Revisit Choreography ─
  const caseCards = Array.from(document.querySelectorAll('.case-study-card'));
  const dividers = Array.from(document.querySelectorAll('.section-divider'));
  const aboutSection = document.getElementById('about');
  const eduBars = Array.from(document.querySelectorAll('.edu-progress-bar-fill'));
  const arsenalDomains = Array.from(document.querySelectorAll('#arsenal-grid .arsenal-domain'));
  const eduItems = Array.from(document.querySelectorAll('.edu-stair-item'));

  // Upward-revisit observers highlight controls/titles gently when scrolling BACK UP
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revisitTargets = [...caseCards, ...arsenalDomains, ...eduItems];
    const revisitObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (currentDir === 'up' && el.dataset.seenOnce === '1') {
              el.classList.add('revisit-up');
            }
            el.dataset.seenOnce = '1';
          } else {
            el.classList.remove('revisit-up');
          }
        });
      },
      { threshold: 0.18 }
    );
    revisitTargets.forEach((el) => revisitObs.observe(el));
  }

  let framePending = false;
  function updateScrollDrivenTransforms() {
    framePending = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight || 800;

    if (y - lastY > 1.5) {
      currentDir = 'down';
    } else if (lastY - y > 1.5) {
      currentDir = 'up';
    }
    lastY = y;
    if (body.dataset.scrollDir !== currentDir) {
      body.dataset.scrollDir = currentDir;
    }

    if (stage && !prefersReduced) {
      updateTargetProgress();
      if (wtInView && !wtRaf) {
        wtRaf = requestAnimationFrame(wtTick);
      }
    }

    if (prefersReduced) return;

    // 2a. Case study card border progress & image parallax scrub
    for (let i = 0; i < caseCards.length; i++) {
      const card = caseCards[i];
      const r = card.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      const p = clamp01((vh - r.top) / (vh + r.height));
      card.style.setProperty('--card-p', p.toFixed(3));
    }

    // 2b. Section divider diamond rotation (clockwise down, counter-clockwise up)
    for (let i = 0; i < dividers.length; i++) {
      const d = dividers[i];
      const r = d.getBoundingClientRect();
      if (r.bottom < -30 || r.top > vh + 30) continue;
      const p = ((vh - r.top) / Math.max(1, vh)) * 2 - 1;
      d.style.setProperty('--div-p', Math.max(-1, Math.min(1, p)).toFixed(3));
    }

    // 2c. Asymmetric About / Current Focus parallax split
    if (aboutSection) {
      const ar = aboutSection.getBoundingClientRect();
      if (ar.bottom > -20 && ar.top < vh + 20) {
        const shift = ((vh - ar.top) / Math.max(1, vh + ar.height)) * 2 - 1;
        aboutSection.style.setProperty('--about-shift', Math.max(-1, Math.min(1, shift)).toFixed(3));
      }
    }

    // 2d. Education completion bar scrub
    for (let i = 0; i < eduBars.length; i++) {
      const bar = eduBars[i];
      const r = bar.getBoundingClientRect();
      if (r.bottom < -30 || r.top > vh + 30) continue;
      const p = clamp01(0.45 + ((vh - r.top) / Math.max(1, vh * 0.72)) * 0.55);
      bar.style.setProperty('--edu-p', p.toFixed(3));
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(updateScrollDrivenTransforms);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    resizeWtCanvas();
    updateScrollDrivenTransforms();
  }, { passive: true });

  // Initial pass
  resizeWtCanvas();
  updateScrollDrivenTransforms();
})();
