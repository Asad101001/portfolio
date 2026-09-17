/* ============================================================
   js/modules/calendar.js
   Tabletop Spiral Desk Calendar Controller
   Auto-rotating, interactive page-flip logic with pause/play
   ============================================================ */
'use strict';

export function initDeskCalendar() {
  const container = document.getElementById('desk-calendar');
  if (!container) return;

  const pages = Array.from(container.querySelectorAll('.calendar-page'));
  const dotTabs = Array.from(container.querySelectorAll('.cal-dot-tab'));
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const pauseBtn = document.getElementById('cal-pause-btn');
  const pageTracker = document.getElementById('cal-page-tracker');

  if (pages.length === 0) return;

  let currentIndex = 0;
  let isPaused = false;
  let autoFlipTimer = null;
  const ROTATE_INTERVAL = 5500; // 5.5s per month page

  function updatePage(nextIndex, direction = 'next') {
    if (nextIndex === currentIndex) return;
    if (nextIndex < 0) nextIndex = pages.length - 1;
    if (nextIndex >= pages.length) nextIndex = 0;

    const oldPage = pages[currentIndex];
    const newPage = pages[nextIndex];

    // Animate out
    oldPage.classList.remove('active');
    oldPage.classList.add('flip-out');

    setTimeout(() => {
      oldPage.classList.remove('flip-out');
    }, 450);

    // Animate in
    newPage.classList.add('active');

    // Update bottom tab dots
    dotTabs.forEach((tab, i) => {
      if (i === nextIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update tracker
    if (pageTracker) {
      pageTracker.textContent = `PAGE 0${nextIndex + 1} / 0${pages.length}`;
    }

    currentIndex = nextIndex;
  }

  function next() {
    updatePage(currentIndex + 1, 'next');
  }

  function prev() {
    updatePage(currentIndex - 1, 'prev');
  }

  function startAutoFlip() {
    stopAutoFlip();
    autoFlipTimer = setInterval(() => {
      if (!isPaused) {
        next();
      }
    }, ROTATE_INTERVAL);
  }

  function stopAutoFlip() {
    if (autoFlipTimer) {
      clearInterval(autoFlipTimer);
      autoFlipTimer = null;
    }
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prev();
      startAutoFlip(); // Reset interval on interaction
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      next();
      startAutoFlip();
    });
  }

  // Pause / Resume Toggle
  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '▶' : '❚❚';
      pauseBtn.title = isPaused ? 'Resume Auto Flip' : 'Pause Auto Flip';
      pauseBtn.style.color = isPaused ? 'var(--cyan, #10b981)' : '';
    });
  }

  // Click on dots/tabs
  dotTabs.forEach((tab, i) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      updatePage(i, i > currentIndex ? 'next' : 'prev');
      startAutoFlip();
    });
  });

  // Pause on hover
  container.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  container.addEventListener('mouseleave', () => {
    // Only resume if pause button wasn't explicitly toggled
    if (pauseBtn && pauseBtn.textContent === '❚❚') {
      isPaused = false;
    }
  });

  // Start auto-rotation
  startAutoFlip();
}
