/**
 * NIAT x CDU Attandance Calculator
 * Client-side mathematical attendance utility
 * Dynamic schedule engine tracking up to October 8th, 2026 freeze date
 */

// 1. Master Schedule Calendar (Sep 21, 2026 to Oct 8, 2026)
const SCHEDULE_CALENDAR = [
  { date: '2026-09-21', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-09-22', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-09-23', type: 'grit', sessions: 8, gritNo: 5 },
  { date: '2026-09-24', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-09-25', type: 'holiday', sessions: 0, gritNo: 0 },
  { date: '2026-09-26', type: 'grit', sessions: 8, gritNo: 5 },
  { date: '2026-09-27', type: 'holiday', sessions: 0, gritNo: 0 },
  { date: '2026-09-28', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-09-29', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-09-30', type: 'grit', sessions: 8, gritNo: 5 },
  { date: '2026-10-01', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-10-02', type: 'holiday', sessions: 0, gritNo: 0 },
  { date: '2026-10-03', type: 'grit', sessions: 8, gritNo: 5 },
  { date: '2026-10-04', type: 'holiday', sessions: 0, gritNo: 0 },
  { date: '2026-10-05', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-10-06', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-10-07', type: 'normal', sessions: 8, gritNo: 8 },
  { date: '2026-10-08', type: 'normal', sessions: 8, gritNo: 8 }
];

/**
 * Daily Session Timetable
 * College Hours: 8:30 AM to 4:00 PM
 * Start times: 8:30, 9:20, 10:25, 11:00, 11:50, 12:40, 1:30, 2:20, 3:10 -> Ends at 4:00 PM
 */
const DAILY_TIMETABLE = [
  { id: 1, label: 'Session 1', start: '08:30', end: '09:20', startMin: 8 * 60 + 30, endMin: 9 * 60 + 20 },
  { id: 2, label: 'Session 2', start: '09:20', end: '10:25', startMin: 9 * 60 + 20, endMin: 10 * 60 + 25 },
  { id: 3, label: 'Session 3', start: '10:25', end: '11:00', startMin: 10 * 60 + 25, endMin: 11 * 60 + 0 },
  { id: 4, label: 'Session 4', start: '11:00', end: '11:50', startMin: 11 * 60 + 0, endMin: 11 * 60 + 50 },
  { id: 5, label: 'Session 5', start: '11:50', end: '12:40', startMin: 11 * 60 + 50, endMin: 12 * 60 + 40 },
  { id: 6, label: 'Session 6', start: '12:40', end: '13:30', startMin: 12 * 60 + 40, endMin: 13 * 60 + 30 },
  { id: 7, label: 'Session 7', start: '13:30', end: '14:20', startMin: 13 * 60 + 30, endMin: 14 * 60 + 20 },
  { id: 8, label: 'Session 8', start: '14:20', end: '16:00', startMin: 14 * 60 + 20, endMin: 16 * 60 + 0 }
];

/**
 * Determine live session progression for today
 * Returns completed count (0-8) and current period status
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
    completedSessions = 8;
    currentStatusText = 'All sessions completed today (4:00 PM EOD)';
  } else {
    // During college hours
    for (let i = 0; i < DAILY_TIMETABLE.length; i++) {
      const slot = DAILY_TIMETABLE[i];
      if (currentMinutes >= slot.endMin) {
        completedSessions = i + 1;
      } else if (currentMinutes >= slot.startMin && currentMinutes < slot.endMin) {
        activeSessionName = slot.label;
        currentStatusText = `${slot.label} in progress (${slot.start} - ${slot.end.replace('16:00', '4:00 PM').replace('13:30', '1:30 PM').replace('14:20', '2:20 PM')})`;
        break;
      }
    }

    if (!activeSessionName && completedSessions < 8) {
      currentStatusText = `${completedSessions} session${completedSessions === 1 ? '' : 's'} completed today`;
    }
  }

  return {
    completedSessions: Math.min(completedSessions, 8),
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

  let normalDays = 0;
  let gritDays = 0;
  let futureTotalSessions = 0;
  let futureMaxGritYes = 0;
  let futureMaxGritNo = 0;
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
          normalDays++;
          futureTotalSessions += remainingToday;
          futureMaxGritYes += remainingToday;
          futureMaxGritNo += remainingToday;
        }
      } else if (schedDay.type === 'grit') {
        isTodayWorkingDay = true;
        const remainingToday = Math.max(0, schedDay.sessions - completedSessions);
        todayRemainingSessions = remainingToday;
        if (remainingToday > 0) {
          gritDays++;
          futureTotalSessions += remainingToday;
          futureMaxGritYes += remainingToday;
          // For not writing GRIT: max attendable is 5
          const remainingGritNoToday = Math.max(0, Math.min(remainingToday, 5 - completedSessions));
          futureMaxGritNo += remainingGritNoToday;
        }
      }
      return;
    }

    // Future days (date > localDate)
    if (schedDay.type === 'normal') {
      normalDays++;
      futureTotalSessions += schedDay.sessions;
      futureMaxGritYes += schedDay.sessions;
      futureMaxGritNo += schedDay.sessions;
    } else if (schedDay.type === 'grit') {
      gritDays++;
      futureTotalSessions += schedDay.sessions;
      futureMaxGritYes += schedDay.sessions;
      futureMaxGritNo += schedDay.gritNo;
    }
  });

  // If before Sep 21 baseline, reset to full schedule baseline
  if (localDate < '2026-09-21') {
    normalDays = 10;
    gritDays = 4;
    futureTotalSessions = 112;
    futureMaxGritYes = 112;
    futureMaxGritNo = 100;
    todayRemainingSessions = 8;
  }

  const remainingWorkingDays = normalDays + gritDays;

  return {
    localDate,
    isAfter4PM,
    completedSessionsToday: completedSessions,
    todayRemainingSessions,
    isTodayWorkingDay,
    todayType,
    currentStatusText,
    remainingWorkingDays,
    normalDays,
    gritDays,
    sessionsPerDay: 8,
    gritSessionsIfNotWriting: 5,
    futureTotalSessions,
    futureMaxGritYes,
    futureMaxGritNo,
    gritTotalSessions: gritDays * 8,
    gritAttendedSessionsNo: gritDays * 5,
    minimumAttendance: 70
  };
}

// Global active configuration computed automatically
let CONFIG = getActiveScheduleConfig();

// 2. Core Mathematical Calculation Function
function calculateAttendance(attendedSessions, totalSessions, writesGrit) {
  const {
    futureTotalSessions,
    futureMaxGritYes,
    futureMaxGritNo,
    minimumAttendance
  } = CONFIG;

  // Current attendance %
  const currentAttendance = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

  // Maximum future attended sessions depending on GRIT selection
  const futureMaximumAttended = writesGrit ? futureMaxGritYes : futureMaxGritNo;

  // Final totals after remaining days up to freeze date
  const finalTotalSessions = totalSessions + futureTotalSessions;
  const maximumFinalAttended = attendedSessions + futureMaximumAttended;
  const maximumPossibleAttendance = finalTotalSessions > 0
    ? (maximumFinalAttended / finalTotalSessions) * 100
    : currentAttendance;

  // Check 70% threshold
  const canReach70 = maximumPossibleAttendance >= minimumAttendance;

  // Maximum missable sessions if >= 70% can be achieved
  let maximumMissableSessions = 0;
  if (canReach70 && futureTotalSessions > 0) {
    maximumMissableSessions = Math.floor(
      maximumFinalAttended - (0.70 * finalTotalSessions)
    );
    if (maximumMissableSessions < 0) maximumMissableSessions = 0;
    if (maximumMissableSessions > futureMaximumAttended) maximumMissableSessions = futureMaximumAttended;
  }

  return {
    currentAttendance,
    futureTotalSessions,
    futureMaximumAttended,
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
const liveSessionPill = document.getElementById('live-session-pill');
const liveSessionText = document.getElementById('live-session-text');

const factRemainingDays = document.getElementById('fact-remaining-days');
const factRemainingSessions = document.getElementById('fact-remaining-sessions');
const factGritDays = document.getElementById('fact-grit-days');

const gritCardYesTag = document.getElementById('grit-card-yes-tag');
const gritCardNoTag = document.getElementById('grit-card-no-tag');

const btnStartCalc = document.getElementById('btn-start-calc');
const attendanceForm = document.getElementById('attendance-form');
const inputAttended = document.getElementById('input-attended');
const inputTotal = document.getElementById('input-total');
const cardGritYes = document.getElementById('card-grit-yes');
const cardGritNo = document.getElementById('card-grit-no');

const errorAttended = document.getElementById('error-attended');
const errorTotal = document.getElementById('error-total');
const errorGrit = document.getElementById('error-grit');
const groupAttended = document.getElementById('group-attended');
const groupTotal = document.getElementById('group-total');

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
const resFutureGritBadge = document.getElementById('res-future-grit-badge');
const resFutureRatio = document.getElementById('res-future-ratio');
const resFutureLabel = document.getElementById('res-future-label');
const resFutureFootnote = document.getElementById('res-future-footnote');

const resFinalRatio = document.getElementById('res-final-ratio');
const resFinalPct = document.getElementById('res-final-pct');

const gritExplainText = document.getElementById('grit-explain-text');
const gritCalcBox = document.getElementById('grit-calc-box');
const btnRecalculate = document.getElementById('btn-recalculate');

// State
let selectedGritOption = null; // 'yes' | 'no' | null

/**
 * Apply dynamic constants to initial landing and form elements
 */
function applyScheduleData() {
  CONFIG = getActiveScheduleConfig();

  if (factRemainingDays) factRemainingDays.textContent = `${CONFIG.remainingWorkingDays} Days`;
  if (factRemainingSessions) factRemainingSessions.textContent = `${CONFIG.futureTotalSessions} Total`;
  if (factGritDays) factGritDays.textContent = `${CONFIG.gritDays} Days`;

  if (gritCardYesTag) {
    gritCardYesTag.textContent = `${CONFIG.gritTotalSessions} / ${CONFIG.gritTotalSessions} GRIT sessions`;
  }
  if (gritCardNoTag) {
    gritCardNoTag.textContent = `${CONFIG.gritAttendedSessionsNo} / ${CONFIG.gritTotalSessions} GRIT sessions`;
  }

  // Update Live Session Ticker / Pill
  if (liveSessionText) {
    if (CONFIG.localDate < '2026-09-21') {
      liveSessionText.textContent = 'Starts Sep 21 at 8:30 AM';
    } else if (CONFIG.isTodayWorkingDay) {
      liveSessionText.textContent = `Live: ${CONFIG.currentStatusText}`;
    } else if (CONFIG.todayType === 'holiday') {
      liveSessionText.textContent = 'Holiday Today';
    } else {
      liveSessionText.textContent = 'Tracking Live Sessions';
    }
  }
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

// 5. GRIT Single-Selection Handler
function selectGritOption(option) {
  selectedGritOption = option;
  clearError(errorGrit);

  if (option === 'yes') {
    cardGritYes.classList.add('selected');
    cardGritYes.setAttribute('aria-checked', 'true');
    cardGritNo.classList.remove('selected');
    cardGritNo.setAttribute('aria-checked', 'false');
  } else if (option === 'no') {
    cardGritNo.classList.add('selected');
    cardGritNo.setAttribute('aria-checked', 'true');
    cardGritYes.classList.remove('selected');
    cardGritYes.setAttribute('aria-checked', 'false');
  }
}

[cardGritYes, cardGritNo].forEach(card => {
  if (!card) return;
  card.addEventListener('click', () => {
    selectGritOption(card.dataset.value);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      selectGritOption(card.dataset.value);
    }
  });
});

// 6. Validation Helpers
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
      // Unfocus input on scroll so number doesn't accidentally change while page scrolls freely
      if (document.activeElement === input) {
        input.blur();
      }
    });
  });
}

// 7. Form Submission & Validation
if (attendanceForm) {
  attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    clearError(errorAttended, groupAttended);
    clearError(errorTotal, groupTotal);
    clearError(errorGrit);

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

    // Validate GRIT selection
    if (!selectedGritOption) {
      showError(errorGrit, 'Please select whether you are writing GRIT.');
      isValid = false;
    }

    if (!isValid) return;

    // Refresh dynamic schedule state based on current date
    CONFIG = getActiveScheduleConfig();

    const attended = parseInt(rawAttended, 10);
    const total = parseInt(rawTotal, 10);
    const writesGrit = selectedGritOption === 'yes';

    const result = calculateAttendance(attended, total, writesGrit);
    renderResults(attended, total, writesGrit, result);
    showView('results');
  });
}

// 8. Render Results Function
function renderResults(attended, total, writesGrit, result) {
  const {
    currentAttendance,
    futureTotalSessions,
    futureMaximumAttended,
    finalTotalSessions,
    maximumFinalAttended,
    maximumPossibleAttendance,
    canReach70,
    maximumMissableSessions
  } = result;

  const { remainingWorkingDays, normalDays, gritDays, gritTotalSessions, gritAttendedSessionsNo } = CONFIG;

  // Format percentages
  const currentPctStr = currentAttendance.toFixed(2) + '%';
  const maxPctStr = maximumPossibleAttendance.toFixed(2) + '%';

  // 1. Hero Percentage
  if (resMaxPct) resMaxPct.textContent = maxPctStr;

  // 2. 70% Status Banner
  if (statusBanner) {
    statusBanner.className = 'status-banner ' + (canReach70 ? 'success' : 'danger');
  }
  if (canReach70) {
    if (statusIconWrap) statusIconWrap.innerHTML = '✓';
    if (currentAttendance >= CONFIG.minimumAttendance) {
      if (statusTitle) statusTitle.textContent = '✓ Attendance Safe (≥ 70%)';
      if (statusDesc) statusDesc.textContent = 'You are already at or above 70%. Keep attending your remaining sessions to maintain or further improve your standing!';
    } else {
      if (statusTitle) statusTitle.textContent = '✓ You can reach 70%';
      if (statusDesc) statusDesc.textContent = 'You can reach the 70% requirement by attending your remaining sessions. Stay consistent to secure your attendance!';
    }
  } else {
    if (statusIconWrap) statusIconWrap.innerHTML = 'ℹ';
    if (statusTitle) statusTitle.textContent = 'Below 70% (Estimated)';
    if (statusDesc) statusDesc.textContent = 'You may still fall below 70%. Don’t worry — this is only an estimate, and your actual attendance may vary based on backend updates, extra activities, or other attendance adjustments.';
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
        if (missableTitle) missableTitle.textContent = `You can still miss up to ${maximumMissableSessions} session${maximumMissableSessions === 1 ? '' : 's'}`;
        if (missableDesc) missableDesc.textContent = 'Based on maintaining at least 70% attendance.';
      } else {
        cardMissable.className = 'card missable-card cannot-miss';
        if (missableTitle) missableTitle.textContent = 'You cannot afford to miss any more sessions';
        if (missableDesc) missableDesc.textContent = 'You must attend all remaining sessions to ensure you meet the 70% requirement.';
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
  if (resFutureNormalBadge) resFutureNormalBadge.textContent = `${normalDays} Normal Day${normalDays === 1 ? '' : 's'}`;
  if (resFutureGritBadge) resFutureGritBadge.textContent = `${gritDays} GRIT Day${gritDays === 1 ? '' : 's'}`;
  if (resFutureRatio) resFutureRatio.textContent = `${futureMaximumAttended} / ${futureTotalSessions}`;
  
  if (resFutureFootnote) {
    if (writesGrit) {
      resFutureFootnote.textContent = `Writing GRIT: All 8 sessions count on all ${gritDays} GRIT days (${futureMaximumAttended} / ${futureTotalSessions} sessions possible).`;
    } else {
      resFutureFootnote.textContent = `Not writing GRIT: Only 5 of 8 sessions count on ${gritDays} GRIT days (${futureMaximumAttended} / ${futureTotalSessions} sessions possible).`;
    }
  }

  // 6. Final Projected Attendance Card
  if (resFinalRatio) resFinalRatio.textContent = `${maximumFinalAttended} / ${finalTotalSessions}`;
  if (resFinalPct) resFinalPct.textContent = maxPctStr;

  // 7. GRIT Explanation Card
  if (gritExplainText && gritCalcBox) {
    if (gritDays === 0) {
      gritExplainText.textContent = 'All remaining days until October 8th are normal classes (no further GRIT days remaining).';
      gritCalcBox.innerHTML = `<code>0 remaining GRIT days\nAll future sessions follow normal 8-session schedule.</code>`;
    } else if (writesGrit) {
      gritExplainText.textContent = `You are writing GRIT, so all 8 sessions count on each remaining GRIT day.`;
      gritCalcBox.innerHTML = `<code>${gritDays} GRIT day${gritDays === 1 ? '' : 's'} × 8 sessions\n= ${gritTotalSessions} possible attended sessions</code>`;
    } else {
      gritExplainText.textContent = `You are not writing GRIT, so only 5 of the 8 sessions count as attended on each remaining GRIT day.`;
      gritCalcBox.innerHTML = `<code>${gritDays} GRIT day${gritDays === 1 ? '' : 's'} × 5 sessions\n= ${gritAttendedSessionsNo} possible attended sessions (${gritTotalSessions - gritAttendedSessionsNo} sessions deduction)</code>`;
    }
  }
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

// Dynamic real-time auto-refresh (updates dynamically as periods finish every 10s)
setInterval(applyScheduleData, 10000);
