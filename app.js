/**
 * NIAT x CDU Attandance Calculator
 * Client-side mathematical attendance utility
 * Dynamic schedule engine tracking up to October 14th, 2026 freeze date
 */

// 1. Master Schedule Calendar (Sep 21, 2026 to Oct 14, 2026)
// Average 7 sessions per working day
const SCHEDULE_CALENDAR = [
  { date: '2026-09-21', type: 'normal', sessions: 7, label: 'Mon, Sep 21' },
  { date: '2026-09-22', type: 'normal', sessions: 7, label: 'Tue, Sep 22' },
  { date: '2026-09-23', type: 'normal', sessions: 7, label: 'Wed, Sep 23' },
  { date: '2026-09-24', type: 'normal', sessions: 7, label: 'Thu, Sep 24' },
  { date: '2026-09-25', type: 'holiday', sessions: 0, label: 'Fri, Sep 25' },
  { date: '2026-09-26', type: 'normal', sessions: 7, label: 'Sat, Sep 26' },
  { date: '2026-09-27', type: 'holiday', sessions: 0, label: 'Sun, Sep 27' },
  { date: '2026-09-28', type: 'normal', sessions: 7, label: 'Mon, Sep 28' },
  { date: '2026-09-29', type: 'normal', sessions: 7, label: 'Tue, Sep 29' },
  { date: '2026-09-30', type: 'normal', sessions: 7, label: 'Wed, Sep 30' },
  { date: '2026-10-01', type: 'normal', sessions: 7, label: 'Thu, Oct 1' },
  { date: '2026-10-02', type: 'holiday', sessions: 0, label: 'Fri, Oct 2' }, // Gandhi Jayanti
  { date: '2026-10-03', type: 'normal', sessions: 7, label: 'Sat, Oct 3' },
  { date: '2026-10-04', type: 'holiday', sessions: 0, label: 'Sun, Oct 4' },
  { date: '2026-10-05', type: 'normal', sessions: 7, label: 'Mon, Oct 5' },
  { date: '2026-10-06', type: 'normal', sessions: 7, label: 'Tue, Oct 6' },
  { date: '2026-10-07', type: 'normal', sessions: 7, label: 'Wed, Oct 7' },
  { date: '2026-10-08', type: 'normal', sessions: 7, label: 'Thu, Oct 8' },
  { date: '2026-10-09', type: 'normal', sessions: 7, label: 'Fri, Oct 9' },
  { date: '2026-10-10', type: 'normal', sessions: 7, label: 'Sat, Oct 10' },
  { date: '2026-10-11', type: 'holiday', sessions: 0, label: 'Sun, Oct 11' }, // Sunday Holiday
  { date: '2026-10-12', type: 'normal', sessions: 7, label: 'Mon, Oct 12' },
  { date: '2026-10-13', type: 'normal', sessions: 7, label: 'Tue, Oct 13' },
  { date: '2026-10-14', type: 'normal', sessions: 7, label: 'Wed, Oct 14' }  // Freeze Date
];

/**
 * Daily Session Timetable (7 Sessions per Day)
 * College Hours: 8:30 AM to 4:00 PM
 */
const DAILY_TIMETABLE = [
  { id: 1, label: 'Session 1', start: '8:30 AM', end: '9:30 AM', startMin: 8 * 60 + 30, endMin: 9 * 60 + 30 },
  { id: 2, label: 'Session 2', start: '9:30 AM', end: '10:30 AM', startMin: 9 * 60 + 30, endMin: 10 * 60 + 30 },
  { id: 3, label: 'Session 3', start: '10:30 AM', end: '11:30 AM', startMin: 10 * 60 + 30, endMin: 11 * 60 + 30 },
  { id: 4, label: 'Session 4', start: '11:30 AM', end: '12:30 PM', startMin: 11 * 60 + 30, endMin: 12 * 60 + 30 },
  { id: 5, label: 'Session 5', start: '1:30 PM', end: '2:20 PM', startMin: 13 * 60 + 30, endMin: 14 * 60 + 20 },
  { id: 6, label: 'Session 6', start: '2:20 PM', end: '3:10 PM', startMin: 14 * 60 + 20, endMin: 15 * 60 + 10 },
  { id: 7, label: 'Session 7', start: '3:10 PM', end: '4:00 PM', startMin: 15 * 60 + 10, endMin: 16 * 60 + 0 }
];

/**
 * Determine live session progression for today in the background
 * Returns completed count (0-7) and current period status
 */
function getTodaySessionProgress(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let completedSessions = 0;
  let currentStatusText = '';
  let activeSessionName = null;

  if (currentMinutes < 8 * 60 + 30) {
    // Before college starts (Before 8:30 AM)
    completedSessions = 0;
    currentStatusText = 'Starts today at 8:30 AM';
  } else if (currentMinutes >= 16 * 60) {
    // After college ends (4:00 PM and later)
    completedSessions = DAILY_TIMETABLE.length;
    currentStatusText = 'All sessions completed today (4:00 PM EOD)';
  } else {
    // During college hours (8:30 AM – 4:00 PM)
    for (let i = 0; i < DAILY_TIMETABLE.length; i++) {
      const slot = DAILY_TIMETABLE[i];
      if (currentMinutes >= slot.endMin) {
        completedSessions = i + 1;
      } else if (currentMinutes >= slot.startMin && currentMinutes < slot.endMin) {
        activeSessionName = slot.label;
        currentStatusText = `${slot.label} in progress (${slot.start} – ${slot.end})`;
        break;
      }
    }

    if (!activeSessionName && completedSessions < DAILY_TIMETABLE.length) {
      currentStatusText = `${completedSessions} session${completedSessions === 1 ? '' : 's'} completed today`;
    }
  }

  return {
    completedSessions: Math.min(completedSessions, DAILY_TIMETABLE.length),
    currentStatusText,
    activeSessionName,
    isAfter4PM: currentMinutes >= 16 * 60
  };
}

/**
 * Automatically compute current schedule constants from local date & time
 * Sessions decrement dynamically in real-time as each period completes.
 */
function getActiveScheduleConfig(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;

  const { completedSessions, currentStatusText, isAfter4PM } = getTodaySessionProgress(now);

  let remainingWorkingDays = 0;
  let futureTotalSessions = 0;
  let todayRemainingSessions = 0;
  let isTodayWorkingDay = false;
  let todayType = 'none';

  SCHEDULE_CALENDAR.forEach(schedDay => {
    // Past days (before today) are already concluded
    if (schedDay.date < localDate) {
      return;
    }

    // Today's dynamic handling
    if (schedDay.date === localDate) {
      todayType = schedDay.type;
      if (schedDay.type === 'normal') {
        isTodayWorkingDay = true;
        const remainingToday = Math.max(0, schedDay.sessions - completedSessions);
        todayRemainingSessions = remainingToday;
        if (remainingToday > 0) {
          remainingWorkingDays++;
          futureTotalSessions += remainingToday;
        }
      }
      return;
    }

    // Future days (date > localDate)
    if (schedDay.type === 'normal') {
      remainingWorkingDays++;
      futureTotalSessions += schedDay.sessions;
    }
  });

  // If before Sep 21 baseline, reset to full schedule baseline
  if (localDate < '2026-09-21') {
    remainingWorkingDays = 19;
    futureTotalSessions = 133; // 19 working days * 7 sessions
    todayRemainingSessions = 7;
  }

  return {
    localDate,
    isAfter4PM,
    completedSessionsToday: completedSessions,
    todayRemainingSessions,
    isTodayWorkingDay,
    todayType,
    currentStatusText,
    remainingWorkingDays,
    sessionsPerDay: 7,
    futureTotalSessions,
    minimumAttendance: 60
  };
}

// Global active configuration computed automatically
let CONFIG = getActiveScheduleConfig();

// Global set of selected leave dates (YYYY-MM-DD)
const selectedLeaveDates = new Set();
let tempLeaveDates = new Set();

/**
 * Calculate session capacity loss for a given date
 */
function getSessionCountForDate(dateStr) {
  const { localDate, todayRemainingSessions } = CONFIG;
  if (dateStr === localDate) {
    return todayRemainingSessions;
  }
  const found = SCHEDULE_CALENDAR.find(d => d.date === dateStr);
  return (found && found.type === 'normal') ? found.sessions : 0;
}

/**
 * Total sessions lost based on a set of leave dates
 */
function calculateTotalLeaveSessionsLost(leaveSet = selectedLeaveDates) {
  let total = 0;
  leaveSet.forEach(dateStr => {
    total += getSessionCountForDate(dateStr);
  });
  return total;
}

// 2. Core Mathematical Attendance Calculation
function calculateAttendance(attendedSessions, totalSessions, leaveSet = selectedLeaveDates) {
  const {
    futureTotalSessions,
    minimumAttendance
  } = CONFIG;

  // Current attendance %
  const currentAttendance = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

  // Calculate planned leave session deductions
  const leaveSessionsLost = calculateTotalLeaveSessionsLost(leaveSet);
  const plannedLeaveCount = leaveSet.size;

  // Maximum future attended sessions taking planned leaves into account
  const futureMaximumAttended = Math.max(0, futureTotalSessions - leaveSessionsLost);

  // Final totals after remaining days up to freeze date (Oct 14)
  const finalTotalSessions = totalSessions + futureTotalSessions;
  const maximumFinalAttended = attendedSessions + futureMaximumAttended;
  const maximumPossibleAttendance = finalTotalSessions > 0
    ? (maximumFinalAttended / finalTotalSessions) * 100
    : currentAttendance;

  // Check 60% threshold
  const canReach70 = maximumPossibleAttendance >= minimumAttendance;

  // Maximum ADDITIONAL missable sessions (beyond planned leaves) while maintaining >= 60% attendance
  let maximumMissableSessions = 0;
  if (canReach70 && futureTotalSessions > 0) {
    maximumMissableSessions = Math.floor(
      maximumFinalAttended - ((CONFIG.minimumAttendance / 100) * finalTotalSessions)
    );
    if (maximumMissableSessions < 0) maximumMissableSessions = 0;
    if (maximumMissableSessions > futureMaximumAttended) maximumMissableSessions = futureMaximumAttended;
  }

  return {
    currentAttendance,
    futureTotalSessions,
    futureMaximumAttended,
    leaveSessionsLost,
    plannedLeaveCount,
    finalTotalSessions,
    maximumFinalAttended,
    maximumPossibleAttendance,
    canReach70,
    maximumMissableSessions
  };
}

// 3. DOM Elements
const landingView = document.getElementById('landing-view');
const calculatorView = document.getElementById('calculator-view');
const resultsView = document.getElementById('results-view');
const headerSubtitle = document.getElementById('header-subtitle');

const factRemainingDays = document.getElementById('fact-remaining-days');
const factRemainingSessions = document.getElementById('fact-remaining-sessions');

const btnStartCalc = document.getElementById('btn-start-calc');
const attendanceForm = document.getElementById('attendance-form');
const inputAttended = document.getElementById('input-attended');
const inputTotal = document.getElementById('input-total');

const errorAttended = document.getElementById('error-attended');
const errorTotal = document.getElementById('error-total');
const groupAttended = document.getElementById('group-attended');
const groupTotal = document.getElementById('group-total');

// Leaves DOM Elements
const btnOpenLeavesModal = document.getElementById('btn-open-leaves-modal');
const leavesSummaryText = document.getElementById('leaves-summary-text');
const leavesCountBadge = document.getElementById('leaves-count-badge');
const leavesChipsContainer = document.getElementById('leaves-chips-container');
const btnClearLeavesForm = document.getElementById('btn-clear-leaves-form');

// Modal DOM Elements
const leavesModal = document.getElementById('leaves-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const btnCloseLeavesModal = document.getElementById('btn-close-leaves-modal');
const modalCalendarBody = document.getElementById('modal-calendar-body');
const modalLeavesCount = document.getElementById('modal-leaves-count');
const modalSessionsLost = document.getElementById('modal-sessions-lost');
const btnClearLeaves = document.getElementById('btn-clear-leaves');
const btnConfirmLeaves = document.getElementById('btn-confirm-leaves');

// Result Elements
const resMaxPct = document.getElementById('res-max-pct');
const statusBanner = document.getElementById('status-banner');
const statusIconWrap = document.getElementById('status-icon-wrap');
const statusTitle = document.getElementById('status-title');
const statusDesc = document.getElementById('status-desc');

const compCurrentPct = document.getElementById('comp-current-pct');
const compMaxPct = document.getElementById('comp-max-pct');
const progressBarCurrent = document.getElementById('progress-bar-current');
const progressBarPotential = document.getElementById('progress-bar-potential');

const cardMissable = document.getElementById('card-missable');
const missableIconWrap = document.getElementById('missable-icon-wrap');
const missableTitle = document.getElementById('missable-title');
const missableDesc = document.getElementById('missable-desc');

const resCurrentRatio = document.getElementById('res-current-ratio');
const resCurrentPct = document.getElementById('res-current-pct');
const resCurrentAttendedCount = document.getElementById('res-current-attended-count');
const resCurrentTotalCount = document.getElementById('res-current-total-count');

const resFutureTitle = document.getElementById('res-future-title');
const resFutureNormalBadge = document.getElementById('res-future-normal-badge');
const resFutureLeaveBadge = document.getElementById('res-future-leave-badge');
const resFutureRatio = document.getElementById('res-future-ratio');
const resFutureLabel = document.getElementById('res-future-label');
const resFutureFootnote = document.getElementById('res-future-footnote');

const resFinalRatio = document.getElementById('res-final-ratio');
const resFinalPct = document.getElementById('res-final-pct');

const btnRecalculate = document.getElementById('btn-recalculate');

/**
 * Apply dynamic constants to initial landing and form elements
 */
function applyScheduleData() {
  CONFIG = getActiveScheduleConfig();

  if (factRemainingDays) factRemainingDays.textContent = `${CONFIG.remainingWorkingDays} Days`;
  if (factRemainingSessions) factRemainingSessions.textContent = `${CONFIG.futureTotalSessions} Total`;
  
  updateLeavesUI();
}

// 4. Navigation helper with browser history support
try {
  history.replaceState({ view: 'landing' }, '', window.location.pathname);
} catch (e) {
  // Safe fallback
}

function showView(viewId, pushHistory = true) {
  [landingView, calculatorView, resultsView].forEach(view => {
    if (view) view.classList.remove('active');
  });

  if (viewId === 'landing') {
    if (landingView) landingView.classList.add('active');
    if (headerSubtitle) headerSubtitle.textContent = 'Calculate your attendance for the remaining working days.';
  } else if (viewId === 'calculator') {
    if (calculatorView) calculatorView.classList.add('active');
    if (headerSubtitle) headerSubtitle.textContent = 'Enter your attendance details below.';
  } else if (viewId === 'results') {
    if (resultsView) resultsView.classList.add('active');
    if (headerSubtitle) headerSubtitle.textContent = `Your remaining ${CONFIG.remainingWorkingDays}-day attendance forecast.`;
  }

  if (pushHistory && window.history && window.history.pushState) {
    history.pushState({ view: viewId }, '', '#' + viewId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('popstate', (event) => {
  const targetView = (event.state && event.state.view) || 'landing';
  showView(targetView, false);
});

// 5. Validation Helpers
function showError(errorElement, message, inputWrapper = null) {
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.add('visible');
  if (inputWrapper) {
    inputWrapper.querySelector('.input-wrapper')?.classList.add('error');
  }
}

function clearError(errorElement, inputWrapper = null) {
  if (!errorElement) return;
  errorElement.textContent = '';
  errorElement.classList.remove('visible');
  if (inputWrapper) {
    inputWrapper.querySelector('.input-wrapper')?.classList.remove('error');
  }
}

if (inputAttended) {
  inputAttended.addEventListener('input', () => {
    clearError(errorAttended, groupAttended);
    clearError(errorTotal, groupTotal);
  });
}

if (inputTotal) {
  inputTotal.addEventListener('input', () => {
    clearError(errorTotal, groupTotal);
  });
}

if (inputAttended && inputTotal) {
  [inputAttended, inputTotal].forEach(input => {
    input.addEventListener('wheel', () => {
      if (document.activeElement === input) {
        input.blur();
      }
    });
  });
}

// 6. Interactive Leave Calendar Modal Logic
function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

function updateLeavesUI() {
  const count = selectedLeaveDates.size;
  const sessionsLost = calculateTotalLeaveSessionsLost(selectedLeaveDates);

  if (leavesCountBadge) {
    leavesCountBadge.textContent = `${count} Day${count === 1 ? '' : 's'}`;
    if (count > 0) {
      leavesCountBadge.classList.add('has-leaves');
    } else {
      leavesCountBadge.classList.remove('has-leaves');
    }
  }

  if (leavesSummaryText) {
    if (count === 0) {
      leavesSummaryText.textContent = 'Select leave dates';
    } else {
      leavesSummaryText.textContent = `${count} leave day${count === 1 ? '' : 's'} (${sessionsLost} sessions missed)`;
    }
  }

  if (btnClearLeavesForm) {
    if (count > 0) {
      btnClearLeavesForm.style.display = 'inline-flex';
    } else {
      btnClearLeavesForm.style.display = 'none';
    }
  }

  if (leavesChipsContainer) {
    if (count === 0) {
      leavesChipsContainer.style.display = 'none';
      leavesChipsContainer.innerHTML = '';
    } else {
      leavesChipsContainer.style.display = 'flex';
      leavesChipsContainer.innerHTML = '';

      const sortedDates = Array.from(selectedLeaveDates).sort();
      sortedDates.forEach(dateStr => {
        const chip = document.createElement('div');
        chip.className = 'leave-chip';
        chip.innerHTML = `
          <span>${formatDisplayDate(dateStr)}</span>
          <button type="button" class="leave-chip-remove" data-date="${dateStr}" aria-label="Remove leave on ${dateStr}">✕</button>
        `;
        leavesChipsContainer.appendChild(chip);
      });

      // Attach remove handlers
      leavesChipsContainer.querySelectorAll('.leave-chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetDate = btn.dataset.date;
          selectedLeaveDates.delete(targetDate);
          updateLeavesUI();
        });
      });
    }
  }
}

function updateModalFooterCounters() {
  const count = tempLeaveDates.size;
  const sessionsLost = calculateTotalLeaveSessionsLost(tempLeaveDates);

  if (modalLeavesCount) {
    modalLeavesCount.textContent = `${count} day${count === 1 ? '' : 's'} selected`;
  }
  if (modalSessionsLost) {
    modalSessionsLost.textContent = `(${sessionsLost} session${sessionsLost === 1 ? '' : 's'} deducted)`;
  }
}

/**
 * Render Interactive Calendar for Sep and Oct 2026
 */
function renderCalendarGrid() {
  if (!modalCalendarBody) return;
  modalCalendarBody.innerHTML = '';

  const { localDate } = CONFIG;

  const months = [
    { name: 'September 2026', monthNum: 9, startDay: 21, endDay: 30, year: 2026 },
    { name: 'October 2026', monthNum: 10, startDay: 1, endDay: 14, year: 2026 }
  ];

  months.forEach(m => {
    const monthBlock = document.createElement('div');
    monthBlock.className = 'calendar-month-block';

    const heading = document.createElement('div');
    heading.className = 'month-heading';
    heading.textContent = m.name;
    monthBlock.appendChild(heading);

    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'cal-weekdays';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(wd => {
      const span = document.createElement('span');
      span.textContent = wd;
      weekdaysRow.appendChild(span);
    });
    monthBlock.appendChild(weekdaysRow);

    const daysGrid = document.createElement('div');
    daysGrid.className = 'cal-days-grid';

    // First day weekday offset (0 for Sun, 1 for Mon, ..., 6 for Sat)
    const firstDate = new Date(m.year, m.monthNum - 1, m.startDay);
    const firstWeekday = firstDate.getDay(); // 0 is Sun, 6 is Sat

    // Empty offset cells
    for (let i = 0; i < firstWeekday; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      daysGrid.appendChild(emptyCell);
    }

    // Days in current range
    for (let d = m.startDay; d <= m.endDay; d++) {
      const dateStr = `${m.year}-${String(m.monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const schedItem = SCHEDULE_CALENDAR.find(s => s.date === dateStr);

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.dataset.date = dateStr;

      const isPast = dateStr < localDate;
      const isToday = dateStr === localDate;
      const isHoliday = !schedItem || schedItem.type === 'holiday';
      const isWorking = schedItem && schedItem.type === 'normal';
      const isSelected = tempLeaveDates.has(dateStr);

      let subLabel = '';
      if (isHoliday) {
        subLabel = 'Holiday';
        cell.classList.add('holiday');
      } else if (isPast) {
        subLabel = 'Past';
        cell.classList.add('past');
      } else {
        subLabel = '';
        cell.classList.add('working');

        if (isToday) cell.classList.add('today');
        if (isSelected) cell.classList.add('selected-leave');

        // Toggle click handler
        cell.addEventListener('click', () => {
          if (tempLeaveDates.has(dateStr)) {
            tempLeaveDates.delete(dateStr);
            cell.classList.remove('selected-leave');
          } else {
            tempLeaveDates.add(dateStr);
            cell.classList.add('selected-leave');
          }
          updateModalFooterCounters();
        });
      }

      cell.innerHTML = `
        <span class="day-num">${d}</span>
        ${subLabel ? `<span class="day-sub">${subLabel}</span>` : ''}
      `;

      daysGrid.appendChild(cell);
    }

    monthBlock.appendChild(daysGrid);
    modalCalendarBody.appendChild(monthBlock);
  });

  updateModalFooterCounters();
}

function openLeavesModal() {
  tempLeaveDates = new Set(selectedLeaveDates);
  renderCalendarGrid();
  if (leavesModal) {
    leavesModal.classList.add('active');
    leavesModal.setAttribute('aria-hidden', 'false');
  }
}

function closeLeavesModal() {
  if (leavesModal) {
    leavesModal.classList.remove('active');
    leavesModal.setAttribute('aria-hidden', 'true');
  }
}

if (btnOpenLeavesModal) {
  btnOpenLeavesModal.addEventListener('click', openLeavesModal);
}

if (btnCloseLeavesModal) {
  btnCloseLeavesModal.addEventListener('click', closeLeavesModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', closeLeavesModal);
}

if (btnClearLeaves) {
  btnClearLeaves.addEventListener('click', () => {
    tempLeaveDates.clear();
    renderCalendarGrid();
  });
}

if (btnConfirmLeaves) {
  btnConfirmLeaves.addEventListener('click', () => {
    selectedLeaveDates.clear();
    tempLeaveDates.forEach(d => selectedLeaveDates.add(d));
    updateLeavesUI();
    closeLeavesModal();
  });
}

if (btnClearLeavesForm) {
  btnClearLeavesForm.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectedLeaveDates.clear();
    updateLeavesUI();
  });
}

// 7. Form Submission & Validation
if (attendanceForm) {
  attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    clearError(errorAttended, groupAttended);
    clearError(errorTotal, groupTotal);

    const rawAttended = inputAttended.value.trim();
    const rawTotal = inputTotal.value.trim();

    // Validate attended sessions
    if (rawAttended === '') {
      showError(errorAttended, 'Please enter your attended sessions.', groupAttended);
      isValid = false;
    } else {
      const attendedNum = Number(rawAttended);
      if (!Number.isInteger(attendedNum) || attendedNum < 0) {
        showError(errorAttended, 'Attended sessions must be a positive whole number (0 or more).', groupAttended);
        isValid = false;
      }
    }

    // Validate total sessions
    if (rawTotal === '') {
      showError(errorTotal, 'Please enter total sessions conducted.', groupTotal);
      isValid = false;
    } else {
      const totalNum = Number(rawTotal);
      if (!Number.isInteger(totalNum) || totalNum <= 0) {
        showError(errorTotal, 'Total sessions must be a positive whole number greater than 0.', groupTotal);
        isValid = false;
      }
    }

    // Cross-field validation: attended <= total
    if (isValid) {
      const attendedNum = Number(rawAttended);
      const totalNum = Number(rawTotal);
      if (attendedNum > totalNum) {
        showError(errorAttended, 'Attended sessions cannot be greater than total sessions.', groupAttended);
        isValid = false;
      }
    }

    if (!isValid) return;

    // Refresh dynamic schedule state based on current date
    CONFIG = getActiveScheduleConfig();

    const attended = parseInt(rawAttended, 10);
    const total = parseInt(rawTotal, 10);

    const result = calculateAttendance(attended, total, selectedLeaveDates);
    renderResults(attended, total, result);
    showView('results');
  });
}

// 8. Render Results Function
function renderResults(attended, total, result) {
  const {
    currentAttendance,
    futureTotalSessions,
    futureMaximumAttended,
    leaveSessionsLost,
    plannedLeaveCount,
    finalTotalSessions,
    maximumFinalAttended,
    maximumPossibleAttendance,
    canReach70,
    maximumMissableSessions
  } = result;

  const { remainingWorkingDays } = CONFIG;

  // Format percentages
  const currentPctStr = currentAttendance.toFixed(2) + '%';
  const maxPctStr = maximumPossibleAttendance.toFixed(2) + '%';

  // 1. Hero Percentage
  if (resMaxPct) resMaxPct.textContent = maxPctStr;

  // 2. 60% Status Banner
  if (statusBanner) {
    statusBanner.className = 'status-banner ' + (canReach70 ? 'success' : 'danger');
  }
  if (canReach70) {
    if (statusIconWrap) statusIconWrap.innerHTML = '✓';
    if (currentAttendance >= CONFIG.minimumAttendance) {
      if (statusTitle) statusTitle.textContent = '✓ Attendance Safe (≥ 60%)';
      if (statusDesc) {
        if (plannedLeaveCount > 0) {
          statusDesc.textContent = `Even with your ${plannedLeaveCount} planned leave day${plannedLeaveCount === 1 ? '' : 's'}, you can comfortably stay above 60%!`;
        } else {
          statusDesc.textContent = 'You are already at or above 60%. Keep attending your remaining sessions to maintain or further improve your standing!';
        }
      }
    } else {
      if (statusTitle) statusTitle.textContent = '✓ You can reach 60%';
      if (statusDesc) {
        if (plannedLeaveCount > 0) {
          statusDesc.textContent = `Accounting for your ${plannedLeaveCount} planned leave day${plannedLeaveCount === 1 ? '' : 's'}, you can still reach 60% by attending your other sessions!`;
        } else {
          statusDesc.textContent = 'You can reach the 60% requirement by attending your remaining sessions. Stay consistent to secure your attendance!';
        }
      }
    }
  } else {
    if (statusIconWrap) statusIconWrap.innerHTML = 'ℹ';
    if (statusTitle) statusTitle.textContent = 'Below 60% (Estimated)';
    if (statusDesc) {
      if (plannedLeaveCount > 0) {
        statusDesc.textContent = `Taking ${plannedLeaveCount} leave day${plannedLeaveCount === 1 ? '' : 's'} (${leaveSessionsLost} sessions) lowers your maximum attendance below 60%. Consider reducing your leaves.`;
      } else {
        statusDesc.textContent = 'You may still fall below 60%. Don’t worry — this is only an estimate, and your actual attendance may vary based on backend updates or adjustments.';
      }
    }
  }

  // 3. Comparison & Progress Bar
  if (compCurrentPct) compCurrentPct.textContent = currentPctStr;
  if (compMaxPct) compMaxPct.textContent = maxPctStr;

  const clampedCurrent = Math.min(Math.max(currentAttendance, 0), 100);
  const clampedMax = Math.min(Math.max(maximumPossibleAttendance, 0), 100);

  if (progressBarCurrent) progressBarCurrent.style.width = clampedCurrent + '%';
  if (progressBarPotential) progressBarPotential.style.width = clampedMax + '%';

  // Missable Sessions Section
  if (cardMissable) {
    if (canReach70 && futureTotalSessions > 0) {
      cardMissable.style.display = 'flex';
      if (maximumMissableSessions > 0) {
        cardMissable.className = 'card missable-card';
        if (missableTitle) {
          if (plannedLeaveCount > 0) {
            missableTitle.textContent = `You can still miss ${maximumMissableSessions} additional session${maximumMissableSessions === 1 ? '' : 's'}`;
          } else {
            missableTitle.textContent = `You can still miss up to ${maximumMissableSessions} session${maximumMissableSessions === 1 ? '' : 's'}`;
          }
        }
        if (missableDesc) {
          if (plannedLeaveCount > 0) {
            missableDesc.textContent = `Beyond your ${plannedLeaveCount} planned leave day${plannedLeaveCount === 1 ? '' : 's'} while keeping attendance ≥ 60%.`;
          } else {
            missableDesc.textContent = 'Based on maintaining at least 60% attendance.';
          }
        }
      } else {
        cardMissable.className = 'card missable-card cannot-miss';
        if (missableTitle) missableTitle.textContent = 'You cannot afford to miss any more sessions';
        if (missableDesc) {
          if (plannedLeaveCount > 0) {
            missableDesc.textContent = `With ${plannedLeaveCount} planned leave day${plannedLeaveCount === 1 ? '' : 's'}, you must attend all other remaining sessions.`;
          } else {
            missableDesc.textContent = 'You must attend all remaining sessions to ensure you meet the 60% requirement.';
          }
        }
      }
    } else {
      cardMissable.style.display = 'none';
    }
  }

  // 4. Current Attendance Details Card
  if (resCurrentRatio) resCurrentRatio.textContent = `${attended} / ${total}`;
  if (resCurrentPct) resCurrentPct.textContent = currentPctStr;
  if (resCurrentAttendedCount) resCurrentAttendedCount.textContent = attended;
  if (resCurrentTotalCount) resCurrentTotalCount.textContent = total;

  // 5. Future Attendance Details Card
  if (resFutureTitle) resFutureTitle.textContent = `Remaining ${remainingWorkingDays} Working Days`;
  if (resFutureNormalBadge) resFutureNormalBadge.textContent = `${remainingWorkingDays} Days Remaining`;
  
  if (resFutureLeaveBadge) {
    if (plannedLeaveCount > 0) {
      resFutureLeaveBadge.style.display = 'inline-block';
      resFutureLeaveBadge.textContent = `${plannedLeaveCount} Leave${plannedLeaveCount === 1 ? '' : 's'} (${leaveSessionsLost} sess off)`;
    } else {
      resFutureLeaveBadge.style.display = 'none';
    }
  }

  if (resFutureRatio) resFutureRatio.textContent = `${futureMaximumAttended} / ${futureTotalSessions}`;
  
  if (resFutureFootnote) {
    if (plannedLeaveCount > 0) {
      resFutureFootnote.textContent = `Taking ${plannedLeaveCount} planned leave day${plannedLeaveCount === 1 ? '' : 's'} (${leaveSessionsLost} sessions deducted). ${futureMaximumAttended} of ${futureTotalSessions} future sessions attendable.`;
    } else {
      resFutureFootnote.textContent = `The number of sessions varies per hall; calculated on an average of 7 sessions per working day (${futureMaximumAttended} total sessions estimated remaining).`;
    }
  }

  // 6. Final Projected Attendance Card
  if (resFinalRatio) resFinalRatio.textContent = `${maximumFinalAttended} / ${finalTotalSessions}`;
  if (resFinalPct) resFinalPct.textContent = maxPctStr;
}

// 9. Event Listeners for view changes
if (btnStartCalc) {
  btnStartCalc.addEventListener('click', () => {
    showView('calculator');
    inputAttended?.focus();
  });
}

if (btnRecalculate) {
  btnRecalculate.addEventListener('click', () => {
    if (window.history && window.history.length > 1) {
      history.back();
    } else {
      showView('calculator');
    }
  });
}

// Initialize on page load
applyScheduleData();

// Dynamic real-time auto-refresh in background (updates dynamically every 10s)
setInterval(applyScheduleData, 10000);
