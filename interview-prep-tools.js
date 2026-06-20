/**
 * Interview Prep Interactive Addon Tools - Logic File
 * Encapsulated in the window.InterviewPrepTools namespace.
 */
(function () {
  'use strict';

  // Initialize namespace
  const IPT = {};

  /**
   * Helper to write values to localStorage.
   */
  IPT.saveToLocalStorage = function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[IPT] LocalStorage save failed:', e);
    }
  };

  /**
   * Helper to read values from localStorage.
   */
  IPT.readFromLocalStorage = function (key, fallbackValue) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : fallbackValue;
    } catch (e) {
      console.warn('[IPT] LocalStorage read failed:', e);
      return fallbackValue;
    }
  };

  /**
   * Helper to copy text to the clipboard and update button text temporarily.
   */
  IPT.copyToClipboard = function (text, buttonElement) {
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        IPT.showCopySuccess(buttonElement);
      } catch (err) {
        console.error('[IPT] Fallback copy failed:', err);
      }
      document.body.removeChild(textarea);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        IPT.showCopySuccess(buttonElement);
      })
      .catch((err) => {
        console.error('[IPT] Clipboard copy failed:', err);
      });
  };

  IPT.showCopySuccess = function (btn) {
    if (!btn) return;
    const oldText = btn.innerHTML;
    btn.innerHTML = 'Copied!';
    btn.classList.add('ipt-copied');
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.classList.remove('ipt-copied');
    }, 2000);
  };

  /**
   * Helper to create a custom addon section wrapper element.
   */
  IPT.createAddonSection = function (html, options = {}) {
    const section = document.createElement('section');
    section.className = options.className || 'section ipt-section';
    if (options.id) {
      section.id = options.id;
    }
    section.innerHTML = html;
    return section;
  };

  // ─── RENDERING CHOOSE YOUR PATH ───
  IPT.renderChooseYourPath = function (data, insertTarget) {
    let lastPathHTML = '';
    const lastPath = IPT.readFromLocalStorage('ipt.selectedPath', null);
    if (lastPath) {
      lastPathHTML = `<div class="ipt-status-badge" id="ipt-last-path-badge">Last selected focus: ${lastPath}</div>`;
    } else {
      lastPathHTML = `<div class="ipt-status-badge" id="ipt-last-path-badge" style="display: none;"></div>`;
    }

    let cardsHTML = '';
    data.paths.forEach((path, idx) => {
      cardsHTML += `
        <div class="ipt-path-card" data-target="${path.target}" data-name="${path.name}" tabindex="0">
          <div>
            <h3 class="ipt-path-title">${path.name}</h3>
            <p class="ipt-path-desc">${path.desc}</p>
          </div>
          <div class="ipt-path-action">
            Go to Guide
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      `;
    });

    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Interactive Path Selection</div>
        <h2 class="sec-title">What are you preparing for?</h2>
        <p class="sec-subtitle">Choose your interview focus and jump directly to the parts of this guide that matter most for you. <strong>Bookmark this page as a hub to practice with before every job interview.</strong></p>
        ${lastPathHTML}
        <div id="ipt-path-status-container"></div>
      </div>
      <div class="ipt-path-grid">
        ${cardsHTML}
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-choose-focus-path' });
    insertTarget.insertAdjacentElement('afterend', section);

    const cards = section.querySelectorAll('.ipt-path-card');
    cards.forEach(card => {
      const navigate = () => {
        const targetId = card.getAttribute('data-target');
        const name = card.getAttribute('data-name');

        IPT.saveToLocalStorage('ipt.selectedPath', name);
        const badge = document.getElementById('ipt-last-path-badge');
        if (badge) {
          badge.innerHTML = `Last selected focus: ${name}`;
          badge.style.display = 'inline-flex';
        }

        const targetEl = document.getElementById(targetId);
        const statusContainer = document.getElementById('ipt-path-status-container');
        if (statusContainer) statusContainer.innerHTML = '';

        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          if (statusContainer) {
            statusContainer.innerHTML = `
              <div class="ipt-banner">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                The section "#${targetId}" is not available in the current configuration of this page.
              </div>
            `;
            setTimeout(() => {
              statusContainer.innerHTML = '';
            }, 5000);
          }
          console.warn(`[IPT Warning] Target section #${targetId} is not available.`);
        }
      };

      card.addEventListener('click', navigate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });
    });

    return section;
  };

  // ─── RENDERING DAILY PRACTICE SUITE ───
  IPT.renderDailyPracticeSuite = function (data, insertTarget) {
    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Daily Reps</div>
        <h2 class="sec-title">Daily Interview Practice</h2>
        <p class="sec-subtitle">Keep your skills sharp with active recall workouts and random question simulations.</p>
      </div>
      <div class="ipt-practice-layout">
        <div class="ipt-card" id="ipt-workout-card"></div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="ipt-card" id="ipt-qday-card" style="padding: 24px;"></div>
          <div class="ipt-card" id="ipt-generator-card" style="padding: 24px;"></div>
        </div>
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-daily-interview-practice' });
    insertTarget.insertAdjacentElement('afterend', section);

    IPT.initWorkoutModule(data);
    IPT.initQuestionDayModule(data);
    IPT.initGeneratorModule(data);
    return section;
  };

  // ─── MODULE: TODAY'S WORKOUT ───
  IPT.initWorkoutModule = function (data) {
    const container = document.getElementById('ipt-workout-card');
    if (!container || !data.dailyWorkouts.length) return;

    const getDailyIndex = () => {
      return new Date().getDate() % data.dailyWorkouts.length;
    };

    const renderWorkout = (workoutIndex) => {
      const w = data.dailyWorkouts[workoutIndex];
      let focusPointsHTML = '';
      w.focusPoints.forEach(fp => {
        focusPointsHTML += `<li>${fp}</li>`;
      });
      let strongHTML = '';
      w.strongAnswerShouldInclude.forEach(sa => {
        strongHTML += `<li>${sa}</li>`;
      });

      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Today's Interview Workout
          </div>
          <span class="ipt-meta-badge timer">${w.timeLimit}</span>
        </div>
        <p class="ipt-path-desc" style="margin-top: -8px;">A short practice task you can complete before your next interview. Come back tomorrow for a different challenge.</p>
        
        <div class="ipt-question-box">
          <div class="ipt-question-label">${w.category} • ${w.title}</div>
          <div class="ipt-question-text">"${w.question}"</div>
        </div>

        <div class="ipt-details-panel">
          <div class="ipt-detail-block">
            <div class="ipt-detail-title focus">Key Focus Points:</div>
            <div class="ipt-detail-desc">
              <ul>${focusPointsHTML}</ul>
            </div>
          </div>

          <div class="ipt-detail-block strong">
            <div class="ipt-detail-title strong">Strong Answers Should Include:</div>
            <div class="ipt-detail-desc">
              <ul>${strongHTML}</ul>
            </div>
          </div>

          <div class="ipt-detail-block mistake">
            <div class="ipt-detail-title mistake">Mistake to Avoid:</div>
            <div class="ipt-detail-desc">${w.mistakeToAvoid}</div>
          </div>
        </div>

        <div class="ipt-control-row">
          <button class="ipt-button secondary" id="ipt-workout-refresh">
            <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:none; stroke:currentColor; stroke-width:2.5;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Show Another Workout
          </button>
        </div>
      `;

      document.getElementById('ipt-workout-refresh').addEventListener('click', () => {
        let newIdx;
        do {
          newIdx = Math.floor(Math.random() * data.dailyWorkouts.length);
        } while (newIdx === workoutIndex && data.dailyWorkouts.length > 1);
        renderWorkout(newIdx);
      });
    };

    renderWorkout(getDailyIndex());
  };

  // ─── MODULE: QUESTION OF THE DAY ───
  IPT.initQuestionDayModule = function (data) {
    const container = document.getElementById('ipt-qday-card');
    if (!container || !data.questionGenerator.length) return;

    const getQDayIndex = () => {
      return (new Date().getDate() + 3) % data.questionGenerator.length;
    };

    const q = data.questionGenerator[getQDayIndex()];

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Question of the Day
        </div>
        <span class="ipt-meta-badge">${q.category}</span>
      </div>

      <div class="ipt-question-box" style="padding: 16px;">
        <div class="ipt-question-text" style="font-size: 13.5px;">"${q.question}"</div>
      </div>

      <div class="ipt-details-panel">
        <div class="ipt-detail-block" style="padding-left: 10px;">
          <div class="ipt-detail-title focus" style="font-size: 11px;">Follow-up Question:</div>
          <div class="ipt-detail-desc" style="font-size: 13px;">"${q.followUp}"</div>
        </div>

        <div class="ipt-detail-block strong" style="padding-left: 10px;">
          <div class="ipt-detail-title strong" style="font-size: 11px;">What a Strong Answer Should Include:</div>
          <div class="ipt-detail-desc" style="font-size: 13px;">${q.strongAnswer}</div>
        </div>
      </div>
    `;
  };

  // ─── MODULE: RANDOM QUESTION GENERATOR ───
  IPT.initGeneratorModule = function (data) {
    const container = document.getElementById('ipt-generator-card');
    if (!container || !data.questionGenerator.length) return;

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          Give Me a Question
        </div>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <div class="ipt-select-wrapper">
          <select class="ipt-select" id="ipt-gen-category">
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Coding">Coding</option>
            <option value="Backend">Backend</option>
            <option value="Full-stack">Full-stack</option>
            <option value="System Design">System Design</option>
            <option value="AI">AI</option>
            <option value="Production">Production</option>
            <option value="Leadership">Leadership</option>
          </select>
        </div>
        <button class="ipt-button" id="ipt-gen-btn">
          Generate Question
        </button>
      </div>

      <div id="ipt-gen-output" style="display: none; flex-direction: column; gap: 16px;"></div>
    `;

    const select = document.getElementById('ipt-gen-category');
    const button = document.getElementById('ipt-gen-btn');
    const output = document.getElementById('ipt-gen-output');

    const generate = () => {
      const cat = select.value;
      let pool = data.questionGenerator;
      if (cat !== 'all') {
        pool = pool.filter(q => q.category.toLowerCase() === cat.toLowerCase());
      }

      if (!pool.length) {
        output.innerHTML = `<p style="color: var(--red); font-size:13px;">No questions found for this category.</p>`;
        output.style.display = 'flex';
        return;
      }

      const q = pool[Math.floor(Math.random() * pool.length)];

      output.innerHTML = `
        <div class="ipt-question-box" style="padding: 16px; margin-top: 10px;">
          <div class="ipt-question-label">${q.category} Question</div>
          <div class="ipt-question-text" style="font-size: 13.5px;">"${q.question}"</div>
        </div>

        <div class="ipt-details-panel">
          <div class="ipt-detail-block" style="padding-left: 10px;">
            <div class="ipt-detail-title focus" style="font-size: 11px;">Follow-up Question:</div>
            <div class="ipt-detail-desc" style="font-size: 13px;">"${q.followUp}"</div>
          </div>

          <div class="ipt-detail-block strong" style="padding-left: 10px;">
            <div class="ipt-detail-title strong" style="font-size: 11px;">Strong Answer Elements:</div>
            <div class="ipt-detail-desc" style="font-size: 13px;">${q.strongAnswer}</div>
          </div>

          <div class="ipt-detail-block mistake" style="padding-left: 10px;">
            <div class="ipt-detail-title mistake" style="font-size: 11px;">Mistake to Avoid:</div>
            <div class="ipt-detail-desc" style="font-size: 13px;">${q.mistakeToAvoid}</div>
          </div>
        </div>
      `;
      output.style.display = 'flex';
    };

    button.addEventListener('click', generate);
  };

  // ─── RENDERING INTERACTIVE SIMULATION SUITE ───
  IPT.renderInteractiveToolsSuite = function (data, insertTarget) {
    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Interactive Simulation &amp; Structure</div>
        <h2 class="sec-title">Mock Interview &amp; Prep Tools</h2>
        <p class="sec-subtitle">Practice with a mock interview flow, evaluate your performance, and use structure templates to draft strong answers.</p>
      </div>
      <div class="ipt-practice-layout">
        <div class="ipt-card" id="ipt-mock-card"></div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="ipt-card" id="ipt-scorecard-card" style="padding: 24px;"></div>
          <div class="ipt-card" id="ipt-builder-card" style="padding: 24px;"></div>
        </div>
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-interactive-tools-suite' });
    insertTarget.insertAdjacentElement('afterend', section);

    IPT.initMockModule(data);
    IPT.initScorecardModule(data);
    IPT.initBuilderModule(data);
    return section;
  };

  // ─── MODULE: MINI MOCK INTERVIEW MODE ───
  IPT.initMockModule = function (data) {
    const container = document.getElementById('ipt-mock-card');
    if (!container || !data.mockInterviewFlows.length) return;

    let currentStep = 0;
    let timerInterval = null;
    let timeRemaining = 0;
    let timerRunning = false;

    const savedStep = IPT.readFromLocalStorage('ipt.mockStep', null);

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const updateTimerDisplay = () => {
      const display = document.getElementById('ipt-mock-timer-display');
      if (display) {
        display.innerHTML = formatTime(timeRemaining);
      }
    };

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      timerRunning = false;
      const playPauseBtn = document.getElementById('ipt-mock-timer-play');
      if (playPauseBtn) {
        playPauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        `;
      }
    };

    const startTimer = () => {
      if (timerRunning) return;
      timerRunning = true;
      const playPauseBtn = document.getElementById('ipt-mock-timer-play');
      if (playPauseBtn) {
        playPauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><line x1="18" y1="5" x2="18" y2="19"/><line x1="6" y1="5" x2="6" y2="19"/></svg>
        `;
      }

      timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining--;
          updateTimerDisplay();
        } else {
          stopTimer();
          const display = document.getElementById('ipt-mock-timer-display');
          if (display) {
            display.innerHTML = "Time's Up!";
          }
        }
      }, 1000);
    };

    const renderStep = (stepIdx) => {
      currentStep = stepIdx;
      IPT.saveToLocalStorage('ipt.mockStep', currentStep);

      stopTimer();
      const step = data.mockInterviewFlows[currentStep];
      timeRemaining = step.timeLimit;

      const progressPercent = ((currentStep) / (data.mockInterviewFlows.length)) * 100;
      const progressText = `Step ${currentStep + 1} of ${data.mockInterviewFlows.length}`;

      container.innerHTML = `
        <div class="ipt-card-header" style="flex-wrap: wrap;">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            5-Minute Mock Interview
          </div>
          
          <div class="ipt-timer-container">
            <div class="ipt-timer-display" id="ipt-mock-timer-display">${formatTime(timeRemaining)}</div>
            <button class="ipt-timer-btn" id="ipt-mock-timer-play" title="Play/Pause">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button class="ipt-timer-btn" id="ipt-mock-timer-reset" title="Reset Timer">
              <svg viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>

        <p class="ipt-path-desc" style="margin-top: -8px;">Practice a short interview flow. Answer out loud, then compare your answer to the expected signals.</p>

        <div class="ipt-mock-progress-container">
          <div class="ipt-mock-progress-bar-bg">
            <div class="ipt-mock-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <span class="ipt-mock-progress-text">${progressText}</span>
        </div>

        <div class="ipt-question-box">
          <div class="ipt-question-label">${step.type} Stage</div>
          <div class="ipt-question-text">"${step.question}"</div>
        </div>

        <div class="ipt-details-panel">
          <div class="ipt-detail-block strong">
            <div class="ipt-detail-title strong">Strong Answers Should Mention:</div>
            <div class="ipt-detail-desc">${step.strongAnswer}</div>
          </div>

          <div class="ipt-detail-block mistake">
            <div class="ipt-detail-title mistake">Mistake to Avoid:</div>
            <div class="ipt-detail-desc">${step.mistakeToAvoid}</div>
          </div>
        </div>

        <div class="ipt-control-row">
          <div>
            <button class="ipt-button secondary" id="ipt-mock-restart" style="padding: 8px 12px;" title="Restart Mock">
              Restart
            </button>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="ipt-button secondary" id="ipt-mock-prev" ${currentStep === 0 ? 'disabled' : ''}>
              Back
            </button>
            <button class="ipt-button" id="ipt-mock-next">
              ${currentStep === data.mockInterviewFlows.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      `;

      document.getElementById('ipt-mock-timer-play').addEventListener('click', () => {
        if (timerRunning) stopTimer(); else startTimer();
      });

      document.getElementById('ipt-mock-timer-reset').addEventListener('click', () => {
        stopTimer();
        timeRemaining = step.timeLimit;
        updateTimerDisplay();
      });

      document.getElementById('ipt-mock-restart').addEventListener('click', () => {
        renderStep(0);
      });

      if (currentStep > 0) {
        document.getElementById('ipt-mock-prev').addEventListener('click', () => {
          renderStep(currentStep - 1);
        });
      }

      document.getElementById('ipt-mock-next').addEventListener('click', () => {
        if (currentStep < data.mockInterviewFlows.length - 1) {
          renderStep(currentStep + 1);
        } else {
          stopTimer();
          localStorage.removeItem('ipt.mockStep');
          container.innerHTML = `
            <div class="ipt-card-header">
              <div class="ipt-card-title">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Mock Interview Complete!
              </div>
            </div>
            <p class="ipt-path-desc">Great job! You completed all 5 steps of the mock simulation. Use the evaluation scorecard to self-assess your communication, depth, and ownership.</p>
            <div class="ipt-control-row" style="justify-content: flex-end;">
              <button class="ipt-button" id="ipt-mock-restart-final">Start New Interview</button>
            </div>
          `;
          document.getElementById('ipt-mock-restart-final').addEventListener('click', () => {
            renderStep(0);
          });
        }
      });
    };

    if (savedStep !== null && savedStep >= 0 && savedStep < data.mockInterviewFlows.length) {
      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            5-Minute Mock Interview
          </div>
        </div>
        <div class="ipt-resume-banner">
          <div class="ipt-resume-banner-text">
            You have a mock session saved at <strong>Step ${savedStep + 1}</strong> of ${data.mockInterviewFlows.length}.
          </div>
        </div>
        <div class="ipt-control-row" style="justify-content: flex-end; gap: 8px;">
          <button class="ipt-button secondary" id="ipt-resume-restart">Restart</button>
          <button class="ipt-button" id="ipt-resume-confirm">Resume Flow</button>
        </div>
      `;

      document.getElementById('ipt-resume-restart').addEventListener('click', () => {
        renderStep(0);
      });
      document.getElementById('ipt-resume-confirm').addEventListener('click', () => {
        renderStep(savedStep);
      });
    } else {
      renderStep(0);
    }
  };

  // ─── MODULE: INTERVIEW SCORECARD ───
  IPT.initScorecardModule = function (data) {
    const container = document.getElementById('ipt-scorecard-card');
    if (!container || !data.scorecardSignals.length) return;

    let checkedStates = IPT.readFromLocalStorage('ipt.scorecard', Array(data.scorecardSignals.length).fill(false));

    const getClassification = (score) => {
      if (score <= 2) return { text: "Needs work", class: "needs-work" };
      if (score <= 4) return { text: "Good start", class: "good-start" };
      return { text: "Strong answer", class: "strong-ans" };
    };

    const renderScorecard = () => {
      const score = checkedStates.filter(Boolean).length;
      const classification = getClassification(score);

      let listHTML = '';
      data.scorecardSignals.forEach((sig, idx) => {
        listHTML += `
          <label class="ipt-scorecard-row">
            <input type="checkbox" class="ipt-scorecard-checkbox" data-idx="${idx}" ${checkedStates[idx] ? 'checked' : ''} />
            <div class="ipt-scorecard-info">
              <span class="ipt-scorecard-name">${sig.name}</span>
              <span class="ipt-scorecard-question">${sig.question}</span>
            </div>
          </label>
        `;
      });

      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Rate Your Answer Like an Interviewer
          </div>
        </div>
        <p class="ipt-path-desc" style="margin-top: -8px;">After practicing an answer, use this scorecard to check whether your response is clear, structured, and covers core technical details.</p>
        
        <div class="ipt-scorecard-list">
          ${listHTML}
        </div>

        <div class="ipt-score-result">
          <div class="ipt-score-num">
            ${score}<span>/6</span>
          </div>
          <span class="ipt-score-badge ${classification.class}">
            ${classification.text}
          </span>
        </div>

        <div class="ipt-control-row" style="border: none; padding-top: 0;">
          <button class="ipt-button secondary" id="ipt-scorecard-reset" style="width: 100%; justify-content: center;">
            Reset Scorecard
          </button>
        </div>
      `;

      const checkboxes = container.querySelectorAll('.ipt-scorecard-checkbox');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          const idx = parseInt(cb.getAttribute('data-idx'));
          checkedStates[idx] = cb.checked;
          IPT.saveToLocalStorage('ipt.scorecard', checkedStates);
          renderScorecard();
        });
      });

      document.getElementById('ipt-scorecard-reset').addEventListener('click', () => {
        checkedStates = Array(data.scorecardSignals.length).fill(false);
        IPT.saveToLocalStorage('ipt.scorecard', checkedStates);
        renderScorecard();
      });
    };

    renderScorecard();
  };

  // ─── MODULE: ANSWER BUILDER ───
  IPT.initBuilderModule = function (data) {
    const container = document.getElementById('ipt-builder-card');
    if (!container || !data.answerBuilders.length) return;

    let selectedTemplateIdx = IPT.readFromLocalStorage('ipt.builderTemplateIndex', 0);

    const renderBuilder = () => {
      const builder = data.answerBuilders[selectedTemplateIdx];

      let tabsHTML = '';
      data.answerBuilders.forEach((b, idx) => {
        tabsHTML += `
          <button class="ipt-builder-tab ${idx === selectedTemplateIdx ? 'active' : ''}" data-idx="${idx}">
            Template ${idx + 1}
          </button>
        `;
      });

      let fieldsHTML = '';
      builder.fields.forEach(field => {
        const savedVal = IPT.readFromLocalStorage(`ipt.builder.${builder.id}.${field.key}`, '');
        fieldsHTML += `
          <div class="ipt-builder-field">
            <label class="ipt-builder-label">${field.label}</label>
            <input type="text" class="ipt-builder-input" data-key="${field.key}" placeholder="${field.placeholder}" value="${savedVal}" />
          </div>
        `;
      });

      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Build Your Answer
          </div>
        </div>
        <p class="ipt-path-desc" style="margin-top: -8px;">Use this builder to structure your answer draft before practicing out loud. Changes are rendered in real time.</p>

        <div class="ipt-builder-tabs">
          ${tabsHTML}
        </div>

        <div class="ipt-builder-grid">
          <div style="font-size: 13.5px; font-weight: 700; color: #fff; margin-top: 8px;">
            Target Question: "${builder.title}"
          </div>
          ${fieldsHTML}
        </div>

        <div class="ipt-builder-output-box">
          <div class="ipt-builder-output-label">Live Generated Draft</div>
          <div class="ipt-builder-output-text" id="ipt-builder-output-preview"></div>
        </div>

        <div class="ipt-control-row" style="border: none; padding-top: 0;">
          <button class="ipt-button" id="ipt-builder-copy" style="width: 100%; justify-content: center;">
            Copy Drafted Answer
          </button>
        </div>
      `;

      const previewContainer = document.getElementById('ipt-builder-output-preview');

      const updatePreview = () => {
        let compiled = builder.template;
        builder.fields.forEach(field => {
          const input = container.querySelector(`input[data-key="${field.key}"]`);
          const val = input ? input.value.trim() : '';
          const displayVal = val || `[${field.label}]`;
          compiled = compiled.replace(`[${field.key}]`, displayVal);
        });
        previewContainer.innerHTML = compiled;
      };

      updatePreview();

      const tabs = container.querySelectorAll('.ipt-builder-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const idx = parseInt(tab.getAttribute('data-idx'));
          selectedTemplateIdx = idx;
          IPT.saveToLocalStorage('ipt.builderTemplateIndex', idx);
          renderBuilder();
        });
      });

      const inputs = container.querySelectorAll('.ipt-builder-input');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          const key = input.getAttribute('data-key');
          IPT.saveToLocalStorage(`ipt.builder.${builder.id}.${key}`, input.value);
          updatePreview();
        });
      });

      document.getElementById('ipt-builder-copy').addEventListener('click', (e) => {
        const textToCopy = previewContainer.innerText;
        IPT.copyToClipboard(textToCopy, e.currentTarget);
      });
    };

    renderBuilder();
  };

  // ─── RENDERING COMPANY RESEARCH LINKS ───
  IPT.renderCompanyResearch = function (data, insertTarget) {
    const savedCompany = IPT.readFromLocalStorage('ipt.companyName', '');
    const savedRole = IPT.readFromLocalStorage('ipt.companyRole', '');

    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Company Intelligence</div>
        <h2 class="sec-title">Prepare for a Specific Company</h2>
        <p class="sec-subtitle">Enter a company name and instantly generate useful research links before the interview.</p>
      </div>

      <div class="ipt-card" style="margin-bottom: 24px;">
        <div class="ipt-research-inputs-row">
          <div class="ipt-builder-field">
            <label class="ipt-builder-label">Company Name *</label>
            <input type="text" class="ipt-builder-input" id="ipt-research-input-company" placeholder="e.g. Google" value="${savedCompany}" />
          </div>
          <div class="ipt-builder-field">
            <label class="ipt-builder-label">Role Title (Optional)</label>
            <input type="text" class="ipt-builder-input" id="ipt-research-input-role" placeholder="e.g. Software Engineer" value="${savedRole}" />
          </div>
        </div>

        <div class="ipt-control-row" style="border: none; padding-top: 0; justify-content: flex-end; gap: 8px;">
          <button class="ipt-button secondary" id="ipt-research-clear">Clear</button>
          <button class="ipt-button" id="ipt-research-save">Remember this company</button>
        </div>

        <div id="ipt-research-links-container"></div>
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-prepare-company-section' });
    insertTarget.insertAdjacentElement('afterend', section);

    const compInput = document.getElementById('ipt-research-input-company');
    const roleInput = document.getElementById('ipt-research-input-role');
    const saveBtn = document.getElementById('ipt-research-save');
    const clearBtn = document.getElementById('ipt-research-clear');
    const linksContainer = document.getElementById('ipt-research-links-container');

    const generateLinks = () => {
      const company = compInput.value.trim();
      const role = roleInput.value.trim();

      if (!company) {
        linksContainer.innerHTML = `
          <div class="ipt-banner" style="background: rgba(167, 139, 250, 0.04); border-color: rgba(167, 139, 250, 0.15); color: var(--muted); margin-top: 20px;">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.5;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Type a company name above to generate custom intelligence and search links.
          </div>
        `;
        return;
      }

      const qWebsite = `https://www.google.com/search?q=${encodeURIComponent(company + ' official website')}`;
      const qCareers = `https://www.google.com/search?q=${encodeURIComponent(company + ' careers')}`;
      const qNews = `https://news.google.com/search?q=${encodeURIComponent(company)}`;
      const qGlassdoor = `https://www.google.com/search?q=${encodeURIComponent(company + ' Glassdoor interview questions')}`;
      const qIndeed = `https://www.google.com/search?q=${encodeURIComponent(company + ' Indeed interview process')}`;
      const qLinkedIn = `https://www.google.com/search?q=${encodeURIComponent(company + ' LinkedIn company')}`;
      const qLevels = `https://www.google.com/search?q=${encodeURIComponent(company + ' Levels.fyi salary' + (role ? ' ' + role : ''))}`;
      const qCrunchbase = `https://www.google.com/search?q=${encodeURIComponent(company + ' Crunchbase')}`;
      const qBlog = `https://www.google.com/search?q=${encodeURIComponent(company + ' engineering blog')}`;
      const qTechStack = `https://www.google.com/search?q=${encodeURIComponent(company + ' tech stack')}`;
      const qRisk = `https://www.google.com/search?q=${encodeURIComponent(company + ' layoffs funding acquisition')}`;
      const qProcess = `https://www.google.com/search?q=${encodeURIComponent(company + ' ' + (role ? role + ' ' : '') + 'interview process')}`;

      linksContainer.innerHTML = `
        <div class="ipt-research-links-grid">
          <!-- GROUP 1: Company Basics -->
          <div class="ipt-link-card-group">
            <div class="ipt-link-card-group-title">Company Basics</div>
            <div class="ipt-link-card-list">
              <a href="${qWebsite}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Official Website
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qLinkedIn}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                LinkedIn Profile
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qCrunchbase}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Crunchbase Page
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          <!-- GROUP 2: Interview Process -->
          <div class="ipt-link-card-group">
            <div class="ipt-link-card-group-title">Interview Process</div>
            <div class="ipt-link-card-list">
              <a href="${qProcess}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Process Overview
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qGlassdoor}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Glassdoor Qs
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qIndeed}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Indeed Reviews
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          <!-- GROUP 3: Salary & Level -->
          <div class="ipt-link-card-group">
            <div class="ipt-link-card-group-title">Salary &amp; Level</div>
            <div class="ipt-link-card-list">
              <a href="${qLevels}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Levels.fyi Salaries
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qCareers}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Careers Hub
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qNews}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Google News Hub
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          <!-- GROUP 4: Tech Research -->
          <div class="ipt-link-card-group">
            <div class="ipt-link-card-group-title">Technical Research</div>
            <div class="ipt-link-card-list">
              <a href="${qBlog}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Engineering Blog
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qTechStack}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Tech Stack
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <a href="${qRisk}" target="_blank" rel="noopener noreferrer" class="ipt-link-card-item">
                Risk &amp; Layoffs
                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </div>
      `;
    };

    // Live binding
    compInput.addEventListener('input', () => {
      IPT.saveToLocalStorage('ipt.companyName', compInput.value.trim());
      generateLinks();
    });
    
    roleInput.addEventListener('input', () => {
      IPT.saveToLocalStorage('ipt.companyRole', roleInput.value.trim());
      generateLinks();
    });

    // Save
    saveBtn.addEventListener('click', (e) => {
      IPT.saveToLocalStorage('ipt.companyName', compInput.value.trim());
      IPT.saveToLocalStorage('ipt.companyRole', roleInput.value.trim());
      IPT.showCopySuccess(e.currentTarget);
    });

    // Clear
    clearBtn.addEventListener('click', () => {
      compInput.value = '';
      roleInput.value = '';
      localStorage.removeItem('ipt.companyName');
      localStorage.removeItem('ipt.companyRole');
      generateLinks();
    });

    generateLinks();
    return section;
  };

  // ─── RENDERING AFTER-INTERVIEW SUITE ───
  IPT.renderAfterInterviewSuite = function (data, insertTarget) {
    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Post-Interview Loop</div>
        <h2 class="sec-title">Right After the Interview</h2>
        <p class="sec-subtitle">Log questions, track signals, and prepare your follow-up email while memory is fresh.</p>
      </div>

      <div class="ipt-practice-layout">
        <!-- NOTES CARD -->
        <div class="ipt-card" id="ipt-notes-card"></div>

        <!-- EMAIL CARD -->
        <div class="ipt-card" id="ipt-email-card" style="padding: 24px;"></div>
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-after-interview-section' });
    insertTarget.insertAdjacentElement('afterend', section);

    IPT.initNotesModule(data);
    IPT.initEmailModule(data);
    return section;
  };

  // ─── MODULE: AFTER INTERVIEW NOTES ───
  IPT.initNotesModule = function (data) {
    const container = document.getElementById('ipt-notes-card');
    if (!container) return;

    const savedNotes = IPT.readFromLocalStorage('ipt.notesText', data.notesTemplate);

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          After Interview Notes
        </div>
      </div>
      <p class="ipt-path-desc" style="margin-top: -8px;">Right after the interview, write down what happened. It helps you prepare for the next round and avoid forgetting details.</p>

      <div class="ipt-builder-field">
        <textarea class="ipt-builder-input" id="ipt-notes-textarea" rows="12" style="font-family:'JetBrains Mono', monospace; font-size:12px; resize:vertical; background:rgba(10,10,15,0.7);">${savedNotes}</textarea>
      </div>

      <div style="font-size: 11px; color: var(--muted); font-style: italic; margin-top: -8px;">
        ⚠️ Notes are stored locally in your browser memory only and are never transmitted to any external server.
      </div>

      <div class="ipt-control-row">
        <div>
          <button class="ipt-button secondary" id="ipt-notes-clear">Clear</button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="ipt-button secondary" id="ipt-notes-save">Save notes locally</button>
          <button class="ipt-button" id="ipt-notes-copy">Copy Notes</button>
        </div>
      </div>
    `;

    const area = document.getElementById('ipt-notes-textarea');
    const saveBtn = document.getElementById('ipt-notes-save');
    const copyBtn = document.getElementById('ipt-notes-copy');
    const clearBtn = document.getElementById('ipt-notes-clear');

    saveBtn.addEventListener('click', (e) => {
      IPT.saveToLocalStorage('ipt.notesText', area.value);
      IPT.showCopySuccess(e.currentTarget);
    });

    copyBtn.addEventListener('click', (e) => {
      IPT.copyToClipboard(area.value, e.currentTarget);
    });

    clearBtn.addEventListener('click', () => {
      area.value = data.notesTemplate;
      localStorage.removeItem('ipt.notesText');
    });
  };

  // ─── MODULE: FOLLOW-UP EMAIL ───
  IPT.initEmailModule = function (data) {
    const container = document.getElementById('ipt-email-card');
    if (!container) return;

    const savedName = IPT.readFromLocalStorage('ipt.followupName', '');
    const savedTopic = IPT.readFromLocalStorage('ipt.followupTopic', '');
    const savedSender = IPT.readFromLocalStorage('ipt.followupSender', '');

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          After the Interview: Follow-Up Message
        </div>
      </div>
      <p class="ipt-path-desc" style="margin-top: -8px;">A short follow-up message can be useful after a good conversation.</p>

      <div class="ipt-builder-grid">
        <div class="ipt-builder-field">
          <label class="ipt-builder-label">Interviewer Name</label>
          <input type="text" class="ipt-builder-input ipt-email-field" data-key="interviewerName" placeholder="e.g. Sarah" value="${savedName}" />
        </div>
        <div class="ipt-builder-field">
          <label class="ipt-builder-label">Specific Topic Discussed</label>
          <input type="text" class="ipt-builder-input ipt-email-field" data-key="specificTopic" placeholder="e.g. scaling database synchronization" value="${savedTopic}" />
        </div>
        <div class="ipt-builder-field">
          <label class="ipt-builder-label">Your Name</label>
          <input type="text" class="ipt-builder-input ipt-email-field" data-key="yourName" placeholder="e.g. Alex" value="${savedSender}" />
        </div>
      </div>

      <div class="ipt-builder-output-box">
        <div class="ipt-builder-output-label">Compiled Message Draft</div>
        <div class="ipt-builder-output-text" id="ipt-email-output-preview"></div>
      </div>

      <div class="ipt-control-row" style="border: none; padding-top: 0;">
        <button class="ipt-button" id="ipt-email-copy" style="width: 100%; justify-content: center;">
          Copy Message Draft
        </button>
      </div>
    `;

    const preview = document.getElementById('ipt-email-output-preview');
    const fields = container.querySelectorAll('.ipt-email-field');

    const updatePreview = () => {
      let draft = data.followUpEmailTemplate.template;
      fields.forEach(input => {
        const key = input.getAttribute('data-key');
        const val = input.value.trim();
        const displayVal = val || `[${key.replace(/([A-Z])/g, ' $1')}]`;
        draft = draft.replace(`[${key}]`, displayVal);
      });
      preview.innerHTML = draft;
    };

    // Live binding and saving
    fields.forEach(input => {
      input.addEventListener('input', () => {
        const key = input.getAttribute('data-key');
        if (key === 'interviewerName') IPT.saveToLocalStorage('ipt.followupName', input.value);
        if (key === 'specificTopic') IPT.saveToLocalStorage('ipt.followupTopic', input.value);
        if (key === 'yourName') IPT.saveToLocalStorage('ipt.followupSender', input.value);
        updatePreview();
      });
    });

    document.getElementById('ipt-email-copy').addEventListener('click', (e) => {
      IPT.copyToClipboard(preview.innerText, e.currentTarget);
    });

    updatePreview();
  };

  // ─── RENDERING TOMORROW REVIEW CARDS ───
  IPT.renderTomorrowChecklist = function (data, insertTarget) {
    let checkedStates = IPT.readFromLocalStorage('ipt.tomorrowChecklist', Array(data.tomorrowCards.length).fill(false));

    let cardsHTML = '';
    data.tomorrowCards.forEach((card, idx) => {
      const isChecked = checkedStates[idx];
      cardsHTML += `
        <div class="ipt-tomorrow-card ${isChecked ? 'checked' : ''}" data-idx="${idx}" tabindex="0">
          <input type="checkbox" class="ipt-tomorrow-checkbox-input" ${isChecked ? 'checked' : ''} tabindex="-1" />
          <div>
            <h3 class="ipt-tomorrow-title">${card.title}</h3>
            <p class="ipt-tomorrow-text">${card.text}</p>
          </div>
        </div>
      `;
    });

    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Final Night Review</div>
        <h2 class="sec-title">Interview Tomorrow? Review This Tonight</h2>
        <p class="sec-subtitle">Quick checkpoints to run through the evening before your interview. Read, tick, and rest.</p>
      </div>

      <div class="ipt-tomorrow-checklist-grid">
        ${cardsHTML}
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-tomorrow-review-section' });
    insertTarget.insertAdjacentElement('afterend', section);

    // Bind cards clicks
    const tomorrowCards = section.querySelectorAll('.ipt-tomorrow-card');
    tomorrowCards.forEach(card => {
      const checkbox = card.querySelector('.ipt-tomorrow-checkbox-input');
      const idx = parseInt(card.getAttribute('data-idx'));

      const toggleCard = (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        checkedStates[idx] = checkbox.checked;
        IPT.saveToLocalStorage('ipt.tomorrowChecklist', checkedStates);
        
        if (checkbox.checked) {
          card.classList.add('checked');
        } else {
          card.classList.remove('checked');
        }
      };

      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard(e);
        }
      });

      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        checkedStates[idx] = checkbox.checked;
        IPT.saveToLocalStorage('ipt.tomorrowChecklist', checkedStates);
        if (checkbox.checked) {
          card.classList.add('checked');
        } else {
          card.classList.remove('checked');
        }
      });
    });

    return section;
  };

  // ─── RENDERING ADVANCED PREP SUITE ───
  IPT.renderAdvancedPrepSuite = function (data, insertTarget) {
    const sectionHTML = `
      <div class="ipt-section-header">
        <div class="sec-label">Advanced Diagnostics</div>
        <h2 class="sec-title">Advanced Interview Evaluation</h2>
        <p class="sec-subtitle">Gauge opportunities, drill key backend concepts, compare framing signals, and prepare for targeted experience tiers.</p>
      </div>

      <!-- ROW 1: Flags & Explain Better -->
      <div class="ipt-practice-layout" style="margin-bottom: 40px;">
        <div class="ipt-card" id="ipt-flags-card" style="padding: 24px;"></div>
        <div class="ipt-card" id="ipt-explain-better-card" style="padding: 24px;"></div>
      </div>

      <!-- ROW 2: Flashcards & Questions by Level -->
      <div class="ipt-practice-layout">
        <div class="ipt-card" id="ipt-flashcards-card" style="padding: 24px;"></div>
        <div class="ipt-card" id="ipt-levels-card" style="padding: 24px;"></div>
      </div>
    `;

    const section = IPT.createAddonSection(sectionHTML, { id: 'ipt-advanced-prep-suite' });
    insertTarget.insertAdjacentElement('afterend', section);

    IPT.initFlagsModule(data);
    IPT.initExplainBetterModule(data);
    IPT.initFlashcardsModule(data);
    IPT.initLevelsModule(data);
    return section;
  };

  // ─── MODULE: RED FLAGS & GREEN FLAGS ───
  IPT.initFlagsModule = function (data) {
    const container = document.getElementById('ipt-flags-card');
    if (!container) return;

    let greenHTML = '';
    data.flags.green.forEach(item => {
      greenHTML += `
        <div class="ipt-flag-item">
          <span class="ipt-flag-icon-bullet">✓</span>
          <span>${item}</span>
        </div>
      `;
    });

    let redHTML = '';
    data.flags.red.forEach(item => {
      redHTML += `
        <div class="ipt-flag-item">
          <span class="ipt-flag-icon-bullet">✗</span>
          <span>${item}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Interview Red Flags and Green Flags
        </div>
      </div>
      <p class="ipt-path-desc" style="margin-top: -8px;">An interview is not only the company evaluating you. You are also evaluating the company.</p>

      <div class="ipt-flags-grid">
        <div class="ipt-flags-column green">
          <div class="ipt-flags-title-row">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Green Flags
          </div>
          <div class="ipt-flags-list">
            ${greenHTML}
          </div>
        </div>

        <div class="ipt-flags-column red">
          <div class="ipt-flags-title-row">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Red Flags
          </div>
          <div class="ipt-flags-list">
            ${redHTML}
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: var(--muted); font-style: italic; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 12px;">
        💡 One red flag does not always mean you should reject a role. Look for patterns.
      </div>
    `;
  };

  // ─── MODULE: EXPLAIN IT BETTER ───
  IPT.initExplainBetterModule = function (data) {
    const container = document.getElementById('ipt-explain-better-card');
    if (!container || !data.explainBetter.length) return;

    let itemsHTML = '';
    data.explainBetter.forEach((item, idx) => {
      itemsHTML += `
        <div class="ipt-eb-card">
          <div class="ipt-eb-row">
            <div class="ipt-eb-badge-row">
              <span class="ipt-eb-badge weak">Weak Statement</span>
            </div>
            <div class="ipt-eb-text weak">"${item.weak}"</div>
          </div>
          <div class="ipt-eb-row" style="border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 10px; margin-top: 4px;">
            <div class="ipt-eb-badge-row">
              <span class="ipt-eb-badge better">Better Framing</span>
              <button class="ipt-timer-btn ipt-eb-copy-btn" data-idx="${idx}" title="Copy Better Framing" style="color:var(--accent2);">
                <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill:none; stroke:currentColor; stroke-width:2.5;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <div class="ipt-eb-text better" id="ipt-eb-better-${idx}">"${item.better}"</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="ipt-card-header">
        <div class="ipt-card-title">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Explain It Better
        </div>
      </div>
      <p class="ipt-path-desc" style="margin-top: -8px;">Many candidates know the technology but explain it too weakly. Strong answers connect tools to reasons, trade-offs, and outcomes.</p>

      <div class="ipt-eb-list">
        ${itemsHTML}
      </div>
    `;

    // Copy triggers
    const copyBtns = container.querySelectorAll('.ipt-eb-copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.getAttribute('data-idx');
        const textElement = document.getElementById(`ipt-eb-better-${idx}`);
        if (textElement) {
          IPT.copyToClipboard(textElement.innerText.replace(/"/g, ''), e.currentTarget);
        }
      });
    });
  };

  // ─── MODULE: DEVELOPER INTERVIEW FLASHCARDS ───
  IPT.initFlashcardsModule = function (data) {
    const container = document.getElementById('ipt-flashcards-card');
    if (!container || !data.flashcards.length) return;

    let activeFilter = 'all';
    let activeCards = [...data.flashcards];
    let currentIndex = 0;

    // Load reviewed cards from storage
    let reviewedCardFronts = IPT.readFromLocalStorage('ipt.flashcardsReviewed', []);

    const buildHTML = () => {
      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            Developer Interview Flashcards
          </div>
        </div>
        <p class="ipt-path-desc" style="margin-top: -8px;">Quick concepts you should be able to explain clearly in interviews. Click or press Enter/Space to flip.</p>

        <!-- Category Filters -->
        <div class="ipt-builder-tabs" id="ipt-flash-tabs" style="width:100%;">
          <button class="ipt-builder-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="ipt-builder-tab ${activeFilter === 'Backend' ? 'active' : ''}" data-filter="Backend">Backend</button>
          <button class="ipt-builder-tab ${activeFilter === 'System Design' ? 'active' : ''}" data-filter="System Design">Design</button>
          <button class="ipt-builder-tab ${activeFilter === 'Messaging' ? 'active' : ''}" data-filter="Messaging">Messaging</button>
          <button class="ipt-builder-tab ${activeFilter === 'Database' ? 'active' : ''}" data-filter="Database">Database</button>
          <button class="ipt-builder-tab ${activeFilter === 'API' ? 'active' : ''}" data-filter="API">API</button>
          <button class="ipt-builder-tab ${activeFilter === 'Production' ? 'active' : ''}" data-filter="Production">Ops</button>
          <button class="ipt-builder-tab ${activeFilter === 'AI' ? 'active' : ''}" data-filter="AI">AI</button>
        </div>

        <div class="ipt-flashcard-carousel-layout">
          <!-- Perspective Wrapper -->
          <div class="ipt-flashcard-perspective">
            <div class="ipt-flashcard-inner" id="ipt-flashcard-flipper" tabindex="0">
              <!-- Front Side -->
              <div class="ipt-flashcard-front">
                <span class="ipt-flashcard-cat-label" id="ipt-flashcard-front-cat"></span>
                <span class="ipt-flashcard-status-dot hidden" id="ipt-flashcard-front-check">
                  Learned
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div class="ipt-flashcard-question-text" id="ipt-flashcard-front-q"></div>
                <div class="ipt-flashcard-flip-tip">Click card to reveal answer</div>
              </div>
              
              <!-- Back Side -->
              <div class="ipt-flashcard-back">
                <span class="ipt-flashcard-cat-label" id="ipt-flashcard-back-cat"></span>
                <div class="ipt-flashcard-answer-text" id="ipt-flashcard-back-a"></div>
                <div class="ipt-flashcard-flip-tip">Click card to view question</div>
              </div>
            </div>
          </div>

          <!-- Slide Counters -->
          <div class="ipt-mock-progress-text" id="ipt-flashcard-indicators" style="text-align: center; width: 100%;"></div>

          <!-- Controls -->
          <div class="ipt-control-row" style="border: none; padding-top: 0; width:100%;">
            <div>
              <button class="ipt-button secondary" id="ipt-flash-shuffle" style="padding: 8px 12px;">Shuffle</button>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="ipt-button secondary" id="ipt-flash-learned-toggle" style="padding: 8px 12px; font-size:11px;">Mark Learned</button>
              <button class="ipt-button secondary" id="ipt-flash-prev" style="padding: 8px 12px;">&lt; Prev</button>
              <button class="ipt-button" id="ipt-flash-next" style="padding: 8px 12px;">Next &gt;</button>
            </div>
          </div>
        </div>
      `;

      // Event listeners
      const tabs = container.querySelectorAll('#ipt-flash-tabs button');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const filter = tab.getAttribute('data-filter');
          activeFilter = filter;
          applyFilter();
        });
      });

      const flipper = document.getElementById('ipt-flashcard-flipper');
      if (flipper) {
        const toggleFlip = () => {
          flipper.classList.toggle('flipped');
        };
        flipper.addEventListener('click', toggleFlip);
        flipper.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        });
      }

      const prevBtn = document.getElementById('ipt-flash-prev');
      const nextBtn = document.getElementById('ipt-flash-next');
      const shuffleBtn = document.getElementById('ipt-flash-shuffle');
      const learnedBtn = document.getElementById('ipt-flash-learned-toggle');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentIndex > 0) {
            currentIndex--;
            showActiveCard();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentIndex < activeCards.length - 1) {
            currentIndex++;
            showActiveCard();
          }
        });
      }

      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
          shuffleActiveCards();
        });
      }

      if (learnedBtn) {
        learnedBtn.addEventListener('click', () => {
          toggleLearnedState();
        });
      }

      showActiveCard();
    };

    const applyFilter = () => {
      if (activeFilter === 'all') {
        activeCards = [...data.flashcards];
      } else {
        activeCards = data.flashcards.filter(c => c.category === activeFilter);
      }
      currentIndex = 0;
      buildHTML();
    };

    const shuffleActiveCards = () => {
      for (let i = activeCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeCards[i], activeCards[j]] = [activeCards[j], activeCards[i]];
      }
      currentIndex = 0;
      const flipper = document.getElementById('ipt-flashcard-flipper');
      if (flipper) flipper.classList.remove('flipped');
      setTimeout(() => {
        showActiveCard();
      }, 150);
    };

    const toggleLearnedState = () => {
      if (!activeCards.length) return;
      const card = activeCards[currentIndex];
      const isReviewed = reviewedCardFronts.includes(card.front);

      if (isReviewed) {
        reviewedCardFronts = reviewedCardFronts.filter(f => f !== card.front);
      } else {
        reviewedCardFronts.push(card.front);
      }

      IPT.saveToLocalStorage('ipt.flashcardsReviewed', reviewedCardFronts);
      showActiveCard();
    };

    const showActiveCard = () => {
      if (!activeCards.length) {
        document.getElementById('ipt-flashcard-front-q').innerHTML = 'No cards in this category.';
        document.getElementById('ipt-flashcard-back-a').innerHTML = 'No cards in this category.';
        document.getElementById('ipt-flashcard-indicators').innerHTML = '';
        return;
      }

      const flipper = document.getElementById('ipt-flashcard-flipper');
      if (flipper) flipper.classList.remove('flipped');

      const card = activeCards[currentIndex];
      const isReviewed = reviewedCardFronts.includes(card.front);

      setTimeout(() => {
        document.getElementById('ipt-flashcard-front-q').innerText = card.front;
        document.getElementById('ipt-flashcard-front-cat').innerText = card.category;
        document.getElementById('ipt-flashcard-back-cat').innerText = card.category;
        document.getElementById('ipt-flashcard-back-a').innerText = card.back;

        const checkBadge = document.getElementById('ipt-flashcard-front-check');
        if (checkBadge) {
          if (isReviewed) {
            checkBadge.classList.remove('hidden');
          } else {
            checkBadge.classList.add('hidden');
          }
        }

        const learnedBtn = document.getElementById('ipt-flash-learned-toggle');
        if (learnedBtn) {
          learnedBtn.innerHTML = isReviewed ? 'Mark Unlearned' : 'Mark Learned';
        }

        const indicators = document.getElementById('ipt-flashcard-indicators');
        if (indicators) {
          indicators.innerHTML = `Card ${currentIndex + 1} of ${activeCards.length} (Learned: ${reviewedCardFronts.length})`;
        }

        const prevBtn = document.getElementById('ipt-flash-prev');
        const nextBtn = document.getElementById('ipt-flash-next');
        if (prevBtn) prevBtn.disabled = (currentIndex === 0);
        if (nextBtn) nextBtn.disabled = (currentIndex === activeCards.length - 1);
      }, 150);
    };

    buildHTML();
  };

  // ─── MODULE: INTERVIEW QUESTIONS BY LEVEL ───
  IPT.initLevelsModule = function (data) {
    const container = document.getElementById('ipt-levels-card');
    if (!container || !data.questionsByLevel) return;

    let selectedLevelKey = 'senior'; // Default highlight level

    const renderLevel = () => {
      const currentLevel = data.questionsByLevel[selectedLevelKey];

      let tabsHTML = '';
      const levelsMap = [
        { key: 'junior', label: 'Junior' },
        { key: 'mid', label: 'Mid-level' },
        { key: 'senior', label: 'Senior' },
        { key: 'lead', label: 'Tech Lead' }
      ];

      levelsMap.forEach(item => {
        tabsHTML += `
          <button class="ipt-builder-tab ${item.key === selectedLevelKey ? 'active' : ''}" data-level="${item.key}">
            ${item.label}
          </button>
        `;
      });

      let questionsHTML = '';
      currentLevel.questions.forEach(q => {
        questionsHTML += `
          <div class="ipt-level-question-item">
            ${q}
          </div>
        `;
      });

      container.innerHTML = `
        <div class="ipt-card-header">
          <div class="ipt-card-title">
            <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Interview Questions by Level
          </div>
        </div>
        <p class="ipt-path-desc" style="margin-top: -8px;">The same topic can be asked differently depending on the role level.</p>

        <!-- Level selection tabs -->
        <div class="ipt-builder-tabs">
          ${tabsHTML}
        </div>

        <!-- Listening for block -->
        <div class="ipt-level-listen-callout">
          <div class="ipt-level-listen-title">What interviewers listen for:</div>
          <div class="ipt-level-listen-text">${currentLevel.listenFor}</div>
        </div>

        <!-- Questions List -->
        <div class="ipt-level-questions-list">
          ${questionsHTML}
        </div>
      `;

      // Tab handlers
      const tabs = container.querySelectorAll('.ipt-builder-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          selectedLevelKey = tab.getAttribute('data-level');
          renderLevel();
        });
      });
    };

    renderLevel();
  };

  // ─── MODULE: INTERACTIVE PREP CHECKLIST (PHASE 1) ───
  IPT.initPrepChecklistModule = function () {
    const listItems = document.querySelectorAll('.checklist-item');
    if (!listItems.length) return;

    let checkedItems = IPT.readFromLocalStorage('ipt.checklist.prepCheckedItems', []);

    listItems.forEach(li => {
      const titleEl = li.querySelector('.checklist-title');
      if (!titleEl) return;
      const text = titleEl.innerText.trim();

      // Make keyboard-accessible
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'checkbox');

      const isChecked = checkedItems.includes(text);
      if (isChecked) {
        li.classList.add('ipt-checked');
        li.setAttribute('aria-checked', 'true');
      } else {
        li.setAttribute('aria-checked', 'false');
      }

      const toggleCheck = () => {
        let currentChecked = IPT.readFromLocalStorage('ipt.checklist.prepCheckedItems', []);
        const idx = currentChecked.indexOf(text);
        if (idx > -1) {
          currentChecked.splice(idx, 1);
          li.classList.remove('ipt-checked');
          li.setAttribute('aria-checked', 'false');
        } else {
          currentChecked.push(text);
          li.classList.add('ipt-checked');
          li.setAttribute('aria-checked', 'true');
        }
        IPT.saveToLocalStorage('ipt.checklist.prepCheckedItems', currentChecked);
      };

      li.addEventListener('click', toggleCheck);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCheck();
        }
      });
    });
  };

  // ─── MODULE: INTERACTIVE FINAL CHECKLIST ───
  IPT.initFinalChecklistModule = function () {
    const listItems = document.querySelectorAll('.checklist-deck-li');
    if (!listItems.length) return;

    let checkedItems = IPT.readFromLocalStorage('ipt.checklist.finalCheckedItems', []);

    listItems.forEach(li => {
      const span = li.querySelector('span');
      if (!span) return;
      const text = span.innerText.trim();

      // Make keyboard-accessible
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'checkbox');

      const isChecked = checkedItems.includes(text);
      if (isChecked) {
        li.classList.add('ipt-checked');
        li.setAttribute('aria-checked', 'true');
      } else {
        li.setAttribute('aria-checked', 'false');
      }

      const toggleCheck = () => {
        let currentChecked = IPT.readFromLocalStorage('ipt.checklist.finalCheckedItems', []);
        const idx = currentChecked.indexOf(text);
        if (idx > -1) {
          currentChecked.splice(idx, 1);
          li.classList.remove('ipt-checked');
          li.setAttribute('aria-checked', 'false');
        } else {
          currentChecked.push(text);
          li.classList.add('ipt-checked');
          li.setAttribute('aria-checked', 'true');
        }
        IPT.saveToLocalStorage('ipt.checklist.finalCheckedItems', currentChecked);
      };

      li.addEventListener('click', toggleCheck);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCheck();
        }
      });
    });
  };

  // ─── RENDERING AI INTERVIEW PREP SUITE ───
  IPT.renderAIPrepSuite = function (data, insertBeforeTarget) {
    if (!data.aiPrep) return null;

    const section = document.createElement('section');
    section.className = 'section bg-alternate';
    section.id = 'ai-interview-prep';

    // Build capabilities cards HTML
    let capsHTML = '';
    data.aiPrep.capabilities.forEach(cap => {
      capsHTML += `
        <div class="ipt-path-card" style="cursor: default;">
          <div class="ipt-ai-card-content">
            <div class="ipt-ai-card-title">${cap.title}</div>
            <div class="ipt-ai-card-desc">${cap.desc}</div>
          </div>
        </div>
      `;
    });

    // Build categories cards HTML
    let catsHTML = '';
    data.aiPrep.categories.forEach(cat => {
      const toolsHTML = cat.tools.map(t => `<span class="ipt-ai-tool-tag">${t}</span>`).join('');
      const useCasesHTML = cat.useCases.map(uc => `<li>${uc}</li>`).join('');
      catsHTML += `
        <div class="ipt-card ipt-ai-cat-card">
          <div class="ipt-ai-card-content" style="display: flex; flex-direction: column; height: 100%;">
            <div class="ipt-ai-card-title">${cat.title}</div>
            <div class="ipt-ai-tools-list">
              ${toolsHTML}
            </div>
            <div class="ipt-ai-use-cases">
              <strong>Key Use Cases:</strong>
              <ul>
                ${useCasesHTML}
              </ul>
            </div>
            <div class="ipt-ai-cat-notes">
              <strong>Note:</strong> ${cat.notes}
            </div>
          </div>
        </div>
      `;
    });

    // Build workflow steps HTML
    let flowHTML = '';
    data.aiPrep.workflow.forEach(w => {
      flowHTML += `
        <div class="ipt-ai-workflow-step">
          <div class="ipt-ai-step-badge">${w.step}</div>
          <div class="ipt-ai-step-body">
            <div class="ipt-ai-step-title">${w.title}</div>
            <div class="ipt-ai-step-desc" style="font-size: 13.5px; color: var(--muted); line-height: 1.5; margin-bottom: 8px;">${w.text}</div>
            <div class="ipt-ai-step-prompt-box">
              <pre class="ipt-ai-step-prompt-text" id="ipt-ai-wf-prompt-${w.step}">${w.prompt}</pre>
              <button class="ipt-ai-step-prompt-copy" data-step="${w.step}">Copy Prompt</button>
            </div>
          </div>
        </div>
      `;
    });

    // Build Prompts HTML
    let promptsHTML = '';
    data.aiPrep.prompts.forEach((p, idx) => {
      promptsHTML += `
        <div class="ipt-ai-prompt-card">
          <div class="ipt-ai-prompt-meta">
            <div class="ipt-ai-prompt-info">
              <div class="ipt-ai-prompt-title">${p.title}</div>
              <div class="ipt-ai-prompt-desc"><strong>Best for:</strong> ${p.bestFor}</div>
            </div>
            <button class="ipt-ai-prompt-copy-btn" data-idx="${idx}">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Prompt
            </button>
          </div>
          <pre class="ipt-ai-prompt-body" id="ipt-ai-prompt-text-${idx}">${p.promptText}</pre>
        </div>
      `;
    });

    // Build Software Dev Tips HTML
    let devTipsHTML = '';
    data.aiPrep.devPrepTips.forEach(tip => {
      devTipsHTML += `
        <div class="ipt-card ipt-ai-dev-card">
          <div class="ipt-ai-card-content">
            <div class="ipt-ai-card-title">${tip.title}</div>
            <div class="ipt-ai-card-desc">${tip.text}</div>
          </div>
        </div>
      `;
    });

    // Build Do/Don't lists HTML
    let dosHTML = '';
    data.aiPrep.ethics.dos.forEach(item => {
      dosHTML += `<li>${item}</li>`;
    });

    let dontsHTML = '';
    data.aiPrep.ethics.donts.forEach(item => {
      dontsHTML += `<li>${item}</li>`;
    });

    // Build search suggestions HTML
    let suggestionsHTML = '';
    data.aiPrep.toolsAlert.suggestions.forEach(query => {
      const encodedQuery = encodeURIComponent(query);
      suggestionsHTML += `
        <a href="https://www.google.com/search?q=${encodedQuery}" target="_blank" rel="noopener noreferrer" class="ipt-ai-search-tag">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          ${query}
        </a>
      `;
    });

    section.innerHTML = `
      <div class="sec-label">AI Prep</div>
      <h2 class="sec-title">${data.aiPrep.title}</h2>
      <p class="sec-subtitle">${data.aiPrep.subtitle}</p>

      <div class="ipt-ai-section">
        <!-- Callout Banner -->
        <div class="ipt-ai-callout">
          <div class="ipt-ai-callout-icon">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="ipt-ai-callout-text">
            <strong>Warning:</strong> ${data.aiPrep.callout}
          </div>
        </div>

        <!-- Block 1: What AI Can Help You With -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 14px;">1. What AI Can Help You With</h3>
          <div class="ipt-ai-grid-2">
            ${capsHTML}
          </div>
        </div>

        <!-- Block 2: Popular AI Tool Categories -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 8px;">2. Popular AI Tool Categories</h3>
          <p class="ipt-path-desc" style="margin-bottom: 8px;">${data.aiPrep.categoriesIntro}</p>
          <p class="ipt-path-desc" style="margin-bottom: 20px; font-size: 13px; font-style: italic; color: var(--amber);"><strong>Disclaimer:</strong> Tool availability, pricing, and features change often. Always verify on the official website.</p>
          <div class="ipt-ai-grid-3">
            ${catsHTML}
          </div>
        </div>

        <!-- Block 3: AI Interview Prep Workflow -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 8px;">3. A Practical AI Interview Prep Workflow</h3>
          <p class="ipt-path-desc" style="margin-bottom: 20px;">${data.aiPrep.workflowIntro}</p>
          <div class="ipt-ai-workflow">
            ${flowHTML}
          </div>
        </div>

        <!-- Block 4: Prompt Library -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 8px;">4. AI Prompt Library</h3>
          <p class="ipt-path-desc" style="margin-bottom: 16px;">Copy these prompts directly into ChatGPT, Claude, or Gemini. Customize the placeholder tags inside brackets.</p>
          <div class="ipt-ai-prompts-container">
            ${promptsHTML}
          </div>
        </div>

        <!-- Block 5: Software Developer AI Prep -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 8px;">5. Using AI as a Software Developer Candidate</h3>
          <p class="ipt-path-desc" style="margin-bottom: 20px;">${data.aiPrep.devPrepTipsIntro}</p>
          <div class="ipt-ai-grid-3">
            ${devTipsHTML}
          </div>
        </div>

        <!-- Block 6: Ethical Use: Good vs Bad -->
        <div>
          <h3 class="ipt-section-subtitle" style="margin-bottom: 14px;">6. Ethical AI Use in Interview Preparation</h3>
          <div class="ipt-ai-grid-2">
            <div class="ipt-ai-ethics-column ipt-ai-do-col">
              <h4 class="ipt-ai-ethics-title"><span class="ipt-ai-tag-good" style="font-size: 12px; padding: 4px 10px;">Do</span></h4>
              <ul class="ipt-ai-ethics-list">
                ${dosHTML}
              </ul>
            </div>
            <div class="ipt-ai-ethics-column ipt-ai-dont-col">
              <h4 class="ipt-ai-ethics-title"><span class="ipt-ai-tag-bad" style="font-size: 12px; padding: 4px 10px;">Don't</span></h4>
              <ul class="ipt-ai-ethics-list">
                ${dontsHTML}
              </ul>
            </div>
          </div>
          <div class="ipt-ai-ethics-quote">
            "${data.aiPrep.ethics.highlight}"
          </div>
        </div>

        <!-- Block 7: Tools Change Fast -->
        <div class="ipt-ai-alert-card" style="display: block; padding: 24px;">
          <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px;">
            <div class="ipt-ai-alert-icon" style="flex-shrink: 0; margin-top: 2px;">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="ipt-ai-alert-text">
              <strong style="font-size: 16px; color: var(--amber); display: block; margin-bottom: 8px;">${data.aiPrep.toolsAlert.title}</strong>
              <span style="font-size: 14px; line-height: 1.5; color: var(--text);">${data.aiPrep.toolsAlert.text}</span>
            </div>
          </div>
          <div class="ipt-ai-search-suggestions">
            <div class="ipt-ai-search-label" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 12px;">Recommended Search Queries:</div>
            <div class="ipt-ai-search-tags-grid">
              ${suggestionsHTML}
            </div>
          </div>
        </div>

        <!-- Block 8: Mini CTA -->
        <div class="ipt-ai-cta-card">
          <div class="ipt-ai-card-title" style="font-size: 18px; margin-bottom: 8px;">${data.aiPrep.cta.title}</div>
          <div class="ipt-ai-cta-text" style="margin-bottom: 20px;">${data.aiPrep.cta.text}</div>
          <div class="ipt-ai-cta-buttons" style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
            <a href="#interview-question-bank" class="ipt-button" style="text-decoration: none; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); color: #fff;">Back to Question Bank</a>
            <a href="#simulator-section" class="ipt-button" style="text-decoration: none;">Start Mock Interview</a>
          </div>
        </div>
      </div>
    `;

    if (insertBeforeTarget.id === 'main-content') {
      insertBeforeTarget.appendChild(section);
    } else {
      insertBeforeTarget.parentNode.insertBefore(section, insertBeforeTarget);
    }

    // Add Copy event listeners for Prompts
    const copyBtns = section.querySelectorAll('.ipt-ai-prompt-copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.getAttribute('data-idx');
        const textElement = document.getElementById(`ipt-ai-prompt-text-${idx}`);
        if (textElement) {
          IPT.copyToClipboard(textElement.innerText, e.currentTarget);
        }
      });
    });

    // Add Copy event listeners for Workflow Prompts
    const wfCopyBtns = section.querySelectorAll('.ipt-ai-step-prompt-copy');
    wfCopyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepNum = btn.getAttribute('data-step');
        const textElement = document.getElementById(`ipt-ai-wf-prompt-${stepNum}`);
        if (textElement) {
          IPT.copyToClipboard(textElement.innerText, e.currentTarget);
        }
      });
    });

    return section;
  };

  // Expose namespace to window
  window.InterviewPrepTools = IPT;

  // Initialize addons when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[IPT] DOM loaded. Initializing Interview Prep addons...');
    const data = window.interviewPrepToolsData;
    if (!data) {
      console.warn('[IPT Warning] Addon data file was not loaded or is missing.');
      return;
    }

    // ─── PLACEMENT GROUP 1: PATH SELECTOR & DAILY REPS ───
    const insertTarget1 = document.getElementById('tutorial-video') || document.querySelector('.hero');
    if (insertTarget1) {
      const pathSection = IPT.renderChooseYourPath(data, insertTarget1);
      if (pathSection) {
        IPT.renderDailyPracticeSuite(data, pathSection);
      }
    }

    // ─── PLACEMENT GROUP 2: MOCK INTERVIEW, SCORECARD, BUILDER ───
    const insertTarget2 = document.getElementById('simulator-section') || 
                           document.getElementById('interview-question-bank') || 
                           document.getElementById('final-checklist');
    if (insertTarget2) {
      IPT.renderInteractiveToolsSuite(data, insertTarget2);
    } else {
      console.warn('[IPT Warning] Secondary insertion targets not found. Injected mock tools suite at end of #main-content.');
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        IPT.renderInteractiveToolsSuite(data, mainContent);
      }
    }

    // ─── PLACEMENT GROUP 3: COMPANY RESEARCH & POST-INTERVIEW SUITE ───
    const insertTarget3 = document.getElementById('research-toolkit-section') || 
                           document.getElementById('final-checklist');
    let tomorrowSectionRef = null;
    if (insertTarget3) {
      const compSection = IPT.renderCompanyResearch(data, insertTarget3);
      if (compSection) {
        const afterSection = IPT.renderAfterInterviewSuite(data, compSection);
        if (afterSection) {
          tomorrowSectionRef = IPT.renderTomorrowChecklist(data, afterSection);
        }
      }
    } else {
      console.warn('[IPT Warning] Tertiary insertion targets not found. Injected post-interview loop tools suite at end of #main-content.');
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        const compSection = IPT.renderCompanyResearch(data, mainContent);
        if (compSection) {
          const afterSection = IPT.renderAfterInterviewSuite(data, compSection);
          if (afterSection) {
            tomorrowSectionRef = IPT.renderTomorrowChecklist(data, afterSection);
          }
        }
      }
    }

    // ─── PLACEMENT GROUP 3.5: AI INTERVIEW PREP SECTION ───
    const qBankTarget = document.getElementById('interview-question-bank') || 
                        document.getElementById('final-checklist');
    if (qBankTarget) {
      IPT.renderAIPrepSuite(data, qBankTarget);
    } else {
      console.warn('[IPT Warning] Question bank target not found for AI Prep. Injected at end of #main-content.');
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        IPT.renderAIPrepSuite(data, mainContent);
      }
    }

    // ─── PLACEMENT GROUP 4: ADVANCED SUITE (FLAGS, EXPLAIN BETTER, FLASHCARDS, LEVELS) ───
    const insertTarget4 = tomorrowSectionRef || document.getElementById('final-checklist');
    if (insertTarget4) {
      IPT.renderAdvancedPrepSuite(data, insertTarget4);
    } else {
      console.warn('[IPT Warning] Quaternary insertion targets not found. Injected advanced suite at end of #main-content.');
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        IPT.renderAdvancedPrepSuite(data, mainContent);
      }
    }

    // Initialize original page interactive checklists
    IPT.initPrepChecklistModule();
    IPT.initFinalChecklistModule();
  });


})();
