/* ============================================================
   js/modules/calendar.js
   Tabletop Spiral Desk Calendar Controller
   Generates authentic, live month calendar grid with real date,
   commit markers, and live developer sprint status.
   ============================================================ */
'use strict';

export function initDeskCalendar() {
  const container = document.getElementById('desk-calendar');
  if (!container) return;

  const daysGrid = document.getElementById('cal-days-grid');
  const monthTitle = document.getElementById('cal-month-title');
  const monthAbbr = document.getElementById('cal-month-abbr');
  const dayNum = document.getElementById('cal-day-num');

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

    // Days with active commit indicators (realistic dev streak pattern around today)
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
      const isBirthday = (month === 8 && day === 28); // September 28
      let classes = 'cal-day-cell';
      if (isToday) classes += ' today';
      if (hasCommit && !isToday) classes += ' has-commit';
      if (isBirthday) classes += ' birthday-cell';

      let cellTitle = isToday ? "Today's Date" : `Day ${day}`;
      if (isBirthday) cellTitle = "🎂 September 28 — Asad's Birthday! 🎉";

      const bdayBadge = isBirthday ? '<span class="cal-bday-icon" aria-label="Birthday">🎂</span>' : '';
      const commitDot = hasCommit ? '<i class="cal-dot-mark"></i>' : '';

      gridHTML += `<span class="${classes}" title="${cellTitle}" data-day="${day}">${bdayBadge}<span class="cal-day-num">${day}</span>${commitDot}</span>`;
    }

    daysGrid.innerHTML = gridHTML;
  }

  buildMonthGrid();
}
