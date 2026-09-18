/* ============================================================
   js/modules/calendar.js
   Tabletop Spiral Desk Calendar Controller
   Auto-rotating, interactive page-flip logic with pause/play
   and authentic, live month calendar grid generator.
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
  const daysGrid = document.getElementById('cal-days-grid');
  const monthTitle = document.getElementById('cal-month-title');
  const monthAbbr = document.getElementById('cal-month-abbr');
  const dayNum = document.getElementById('cal-day-num');

  if (pages.length === 0) return;

  const pageNames = [
    'MONTH VIEW',
    'WEEKLY ROUTINE',
    '2026 ROADMAP',
    'CONNECT & WORK'
  ];

  // ── Render Authentic Month Grid ───────────────────────────────
  function buildMonthGrid() {
    if (!daysGrid) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const todayDate = now.getDate();

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const monthAbbrs = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    if (monthTitle) monthTitle.textContent = `${monthNames[month]} ${year}`;
    if (monthAbbr) monthAbbr.textContent = monthAbbrs[month];
    if (dayNum) dayNum.textContent = todayDate < 10 ? `0${todayDate}` : `${todayDate}`;

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDay = new Date(year, month, 1).getDay();
    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Days with active commit indicators (semi-randomized realistic commit pattern around today)
    const commitDays = new Set([
      todayDate,
      Math.max(1, todayDate - 1),
      Math.max(1, todayDate - 3),
      Math.max(1, todayDate - 4),
      Math.max(1, todayDate - 7),
      Math.min(totalDays, todayDate + 2),
      Math.min(totalDays, todayDate + 5)
    ]);

    let gridHTML = '';

    // Empty lead cells before day 1
    for (let i = 0; i < firstDay; i++) {
      gridHTML += '<span class="cal-day-cell empty"></span>';
    }

    // Days 1 to totalDays
    for (let day = 1; day <= totalDays; day++) {
      const isToday = day === todayDate;
      const hasCommit = commitDays.has(day);
      let classes = 'cal-day-cell';
      if (isToday) classes += ' today';
      if (hasCommit && !isToday) classes += ' has-commit';

      gridHTML += `<span class="${classes}" title="${isToday ? "Today's Date" : ''}">${day}${hasCommit ? '<i class="cal-dot-mark"></i>' : ''}</span>`;
    }

    daysGrid.innerHTML = gridHTML;
  }

  buildMonthGrid();

  let currentIndex = 0;
  let isPaused = false;
  let autoFlipTimer = null;
  const ROTATE_INTERVAL = 6000; // 6s per planner page

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
      pageTracker.textContent = `PAGE 0${nextIndex + 1} / 0${pages.length} · ${pageNames[nextIndex] || ''}`;
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
      startAutoFlip();
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
    if (pauseBtn && pauseBtn.textContent === '❚❚') {
      isPaused = false;
    }
  });

  // Start auto-rotation
  startAutoFlip();
}

