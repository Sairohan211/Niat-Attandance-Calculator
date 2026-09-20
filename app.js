/**
 * NIAT x CDU Attandance Calculator
 * Client-side mathematical attendance utility
 */

// 1. Fixed Configuration
const CONFIG = {
  remainingWorkingDays: 14,
  gritDays: 4,
  normalDays: 10,
  sessionsPerDay: 8,
  gritSessionsIfNotWriting: 5,
  minimumAttendance: 70
};

// 2. Core Mathematical Calculation Function
function calculateAttendance(attendedSessions, totalSessions, writesGrit) {
  const { remainingWorkingDays, gritDays, normalDays, sessionsPerDay, gritSessionsIfNotWriting, minimumAttendance } = CONFIG;

  // Current attendance %
  const currentAttendance = (attendedSessions / totalSessions) * 100;

  // Total sessions that will be added in remaining 14 days (14 x 8 = 112)
  const futureTotalSessions = remainingWorkingDays * sessionsPerDay;

  // Maximum future attended sessions depending on GRIT selection
  let futureMaximumAttended;
  if (writesGrit) {
    futureMaximumAttended = (normalDays * sessionsPerDay) + (gritDays * sessionsPerDay); // 80 + 32 = 112
  } else {
    futureMaximumAttended = (normalDays * sessionsPerDay) + (gritDays * gritSessionsIfNotWriting); // 80 + 20 = 100
  }

  // Final totals after 14 days
  const finalTotalSessions = totalSessions + futureTotalSessions;
  const maximumFinalAttended = attendedSessions + futureMaximumAttended;
  const maximumPossibleAttendance = (maximumFinalAttended / finalTotalSessions) * 100;

  // Check 70% threshold
  const canReach70 = maximumPossibleAttendance >= minimumAttendance;

  // Maximum missable sessions if >= 70% can be achieved
  let maximumMissableSessions = 0;
  if (canReach70) {
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

const resFutureRatio = document.getElementById('res-future-ratio');
const resFutureLabel = document.getElementById('res-future-label');
const resFutureFootnote = document.getElementById('res-future-footnote');

const resFinalRatio = document.getElementById('res-final-ratio');
const resFinalPct = document.getElementById('res-final-pct');

const gritExplainText = document.getElementById('grit-explain-text');
const gritCalcBox = document.getElementById('grit-calc-box');
const btnRecalculate = document.getElementById('btn-recalculate');

// 4. State
let selectedGritOption = null; // 'yes' | 'no' | null

// 5. Navigation helper with browser history support
// Initialize base state
try {
  history.replaceState({ view: 'landing' }, '', window.location.pathname);
} catch (e) {
  // Safe fallback if history manipulation is restricted
}

function showView(viewId, pushHistory = true) {
  [landingView, calculatorView, resultsView].forEach(view => {
    view.classList.remove('active');
  });

  if (viewId === 'landing') {
    landingView.classList.add('active');
    headerSubtitle.textContent = 'Calculate your attendance for the remaining working days.';
  } else if (viewId === 'calculator') {
    calculatorView.classList.add('active');
    headerSubtitle.textContent = 'Enter your attendance details below.';
  } else if (viewId === 'results') {
    resultsView.classList.add('active');
    headerSubtitle.textContent = 'Your remaining 14-day attendance forecast.';
  }

  if (pushHistory && window.history && window.history.pushState) {
    history.pushState({ view: viewId }, '', '#' + viewId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle hardware/browser back and forward buttons
window.addEventListener('popstate', (event) => {
  const targetView = (event.state && event.state.view) || 'landing';
  showView(targetView, false);
});

// 6. GRIT Single-Selection Handler
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

// Attach event listeners to GRIT cards
[cardGritYes, cardGritNo].forEach(card => {
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

// 7. Validation Helpers
function showError(errorElement, message, inputWrapper = null) {
  errorElement.textContent = message;
  errorElement.classList.add('visible');
  if (inputWrapper) {
    inputWrapper.querySelector('.input-wrapper')?.classList.add('error');
  }
}

function clearError(errorElement, inputWrapper = null) {
  errorElement.textContent = '';
  errorElement.classList.remove('visible');
  if (inputWrapper) {
    inputWrapper.querySelector('.input-wrapper')?.classList.remove('error');
  }
}

// Input clearing on type
inputAttended.addEventListener('input', () => {
  clearError(errorAttended, groupAttended);
  clearError(errorTotal, groupTotal);
});

inputTotal.addEventListener('input', () => {
  clearError(errorTotal, groupTotal);
});

// Prevent trackpad / mouse wheel from changing input values
[inputAttended, inputTotal].forEach(input => {
  input.addEventListener('wheel', (e) => {
    e.preventDefault();
  }, { passive: false });
});

// 8. Form Submission & Validation
attendanceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;

  // Clear previous errors
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

  // Perform calculation
  const attended = parseInt(rawAttended, 10);
  const total = parseInt(rawTotal, 10);
  const writesGrit = selectedGritOption === 'yes';

  const result = calculateAttendance(attended, total, writesGrit);
  renderResults(attended, total, writesGrit, result);
  showView('results');
});

// 9. Render Results Function
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

  // Format percentages
  const currentPctStr = currentAttendance.toFixed(2) + '%';
  const maxPctStr = maximumPossibleAttendance.toFixed(2) + '%';

  // 1. Hero Percentage
  resMaxPct.textContent = maxPctStr;

  // 2. 70% Status Banner
  statusBanner.className = 'status-banner ' + (canReach70 ? 'success' : 'danger');
  if (canReach70) {
    statusIconWrap.innerHTML = '✓';
    if (currentAttendance >= CONFIG.minimumAttendance) {
      statusTitle.textContent = '✓ Attendance Safe (≥ 70%)';
      statusDesc.textContent = 'You are already at or above 70%. Keep attending your remaining sessions to maintain or further improve your standing!';
    } else {
      statusTitle.textContent = '✓ You can reach 70%';
      statusDesc.textContent = 'You can reach the 70% requirement by attending your remaining sessions. Stay consistent to secure your attendance!';
    }
  } else {
    statusIconWrap.innerHTML = 'ℹ';
    statusTitle.textContent = 'Below 70% (Estimated)';
    statusDesc.textContent = 'You may still fall below 70%. Don’t worry — this is only an estimate, and your actual attendance may vary based on backend updates, extra activities, or other attendance adjustments.';
  }

  // 3. Comparison & Progress Bar
  compCurrentPct.textContent = currentPctStr;
  compMaxPct.textContent = maxPctStr;

  // Visual Progress Bar clamping between 0 and 100
  const clampedCurrent = Math.min(Math.max(currentAttendance, 0), 100);
  const clampedMax = Math.min(Math.max(maximumPossibleAttendance, 0), 100);

  progressBarCurrent.style.width = clampedCurrent + '%';
  progressBarPotential.style.width = clampedMax + '%';

  // Missable Sessions Section (Conditional)
  if (canReach70) {
    cardMissable.style.display = 'flex';
    if (maximumMissableSessions > 0) {
      cardMissable.className = 'card missable-card';
      missableTitle.textContent = `You can still miss up to ${maximumMissableSessions} session${maximumMissableSessions === 1 ? '' : 's'}`;
      missableDesc.textContent = 'Based on maintaining at least 70% attendance.';
    } else {
      cardMissable.className = 'card missable-card cannot-miss';
      missableTitle.textContent = 'You cannot afford to miss any more sessions';
      missableDesc.textContent = 'You must attend all remaining sessions to ensure you meet the 70% requirement.';
    }
  } else {
    cardMissable.style.display = 'none';
  }

  // 4. Current Attendance Details Card
  resCurrentRatio.textContent = `${attended} / ${total}`;
  resCurrentPct.textContent = currentPctStr;
  resCurrentAttendedCount.textContent = attended;
  resCurrentTotalCount.textContent = total;

  // 5. Future Attendance Details Card
  resFutureRatio.textContent = `${futureMaximumAttended} / ${futureTotalSessions}`;
  if (writesGrit) {
    resFutureFootnote.textContent = 'Writing GRIT: All 8 sessions count on all 4 GRIT days (112 / 112 sessions possible).';
  } else {
    resFutureFootnote.textContent = 'Not writing GRIT: Only 5 of 8 sessions count on 4 GRIT days (100 / 112 sessions possible).';
  }

  // 6. Final Projected Attendance Card
  resFinalRatio.textContent = `${maximumFinalAttended} / ${finalTotalSessions}`;
  resFinalPct.textContent = maxPctStr;

  // 7. GRIT Explanation Card
  if (writesGrit) {
    gritExplainText.textContent = 'You are writing GRIT, so all 8 sessions count on each GRIT day.';
    gritCalcBox.innerHTML = `<code>4 GRIT days × 8 sessions\n= 32 possible attended sessions</code>`;
  } else {
    gritExplainText.textContent = 'You are not writing GRIT, so only 5 of the 8 sessions count as attended on each GRIT day.';
    gritCalcBox.innerHTML = `<code>4 GRIT days × 5 sessions\n= 20 possible attended sessions</code>`;
  }
}

// 10. Event Listeners for view changes
btnStartCalc.addEventListener('click', () => {
  showView('calculator');
  inputAttended.focus();
});

btnRecalculate.addEventListener('click', () => {
  if (window.history && window.history.length > 1) {
    history.back();
  } else {
    showView('calculator');
  }
});
