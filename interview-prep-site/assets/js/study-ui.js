// Personal study panel UI: owns all DOM and event handling for the status
// selector, notes textarea, saved-state indicator, topic progress bar,
// reset button, and the per-section status indicators in the internal
// subtopic navigation. Reads and writes study state exclusively through
// the StudyStore API (assets/js/study-store.js) — never touches
// localStorage directly.
//
// topic-renderer.js calls into this module after a section successfully
// loads (StudyUI.onSectionLoaded) and once after the topic definition
// loads (StudyUI.initStudyPanel). All other study-related DOM logic lives
// here, not in topic-renderer.js.

var NOTE_SAVE_DEBOUNCE_MS = 500;

var studyUIState = {
  topicId: null,
  topicData: null,
  activeSectionId: null,
  listenersAttached: false,
  noteSaveTimer: null,
  noteEditToken: 0
};

var STUDY_STATUS_LABELS = {
  'not-started': 'לא התחיל',
  'in-progress': 'בתהליך',
  'completed': 'הושלם',
  'review': 'לחזור עליו'
};

var STUDY_STATUS_SYMBOLS = {
  'not-started': '○',
  'in-progress': '●',
  'completed': '✓',
  'review': '↻'
};

function getStudyStatusLabel(status) {
  return STUDY_STATUS_LABELS[status] || status;
}

function getStudyStatusSymbol(status) {
  return STUDY_STATUS_SYMBOLS[status] || '';
}

/* --------------------------------------------------------------------------
   Status selector (#section-status) and private notes (#section-note)
   -------------------------------------------------------------------------- */

function populateStatusSelect(selectEl) {
  while (selectEl.firstChild) {
    selectEl.removeChild(selectEl.firstChild);
  }
  StudyStore.STATUSES.forEach(function (status) {
    var option = document.createElement('option');
    option.value = status;
    option.textContent = getStudyStatusLabel(status);
    selectEl.appendChild(option);
  });
}

// Loads the stored status and note for the active section into the panel.
function loadSectionPanel(topicId, sectionId) {
  var statusSelect = document.getElementById('section-status');
  var noteTextarea = document.getElementById('section-note');
  var sectionState = StudyStore.getSectionState(topicId, sectionId);

  if (statusSelect) {
    statusSelect.value = sectionState.status;
  }
  if (noteTextarea) {
    // Setting .value (not innerHTML) preserves line breaks safely without
    // ever interpreting the stored note as markup.
    noteTextarea.value = sectionState.note || '';
  }

  refreshStatusBadge(sectionState.status);
  refreshCharCount(sectionState.note || '');

  studyUIState.noteEditToken++;
  setNoteSaveState('idle');
}

// Updates the small status badge (#section-status-badge) that mirrors the
// current selector value, using both text and an accessible label so the
// state is never conveyed by color alone.
function refreshStatusBadge(status) {
  var badge = document.getElementById('section-status-badge');
  if (!badge) {
    return;
  }
  badge.className = 'status-badge status-' + status;
  badge.textContent = getStudyStatusSymbol(status) + ' ' + getStudyStatusLabel(status);
}

// Updates the note character count (#note-char-count).
function refreshCharCount(noteText) {
  var countEl = document.getElementById('note-char-count');
  if (!countEl) {
    return;
  }
  countEl.textContent = noteText.length + ' תווים';
}

// Updates the saved-state indicator (#note-save-state). One of:
// "saving" -> "שומר...", "saved" -> "נשמר", "error" -> clear error message,
// "idle" -> cleared.
function setNoteSaveState(state, customMessage) {
  var el = document.getElementById('note-save-state');
  if (!el) {
    return;
  }
  el.classList.remove('is-saving', 'is-saved', 'is-error');

  if (state === 'saving') {
    el.textContent = 'שומר...';
    el.classList.add('is-saving');
  } else if (state === 'saved') {
    el.textContent = 'נשמר';
    el.classList.add('is-saved');
  } else if (state === 'error') {
    el.textContent = customMessage || 'שגיאה בשמירת ההערה. נסו שוב.';
    el.classList.add('is-error');
  } else {
    el.textContent = '';
  }
}

function handleStatusChange(event) {
  if (!studyUIState.activeSectionId) {
    return;
  }
  StudyStore.setSectionStatus(studyUIState.topicId, studyUIState.activeSectionId, event.target.value);
  refreshStatusBadge(event.target.value);
  refreshSectionNavIndicators(studyUIState.topicId, studyUIState.topicData.sections);
  refreshTopicProgress();
}

function handleNoteInput(event) {
  if (!studyUIState.activeSectionId) {
    return;
  }

  setNoteSaveState('saving');
  refreshCharCount(event.target.value);

  var topicId = studyUIState.topicId;
  var sectionId = studyUIState.activeSectionId;
  var value = event.target.value;
  var token = studyUIState.noteEditToken;

  if (studyUIState.noteSaveTimer) {
    clearTimeout(studyUIState.noteSaveTimer);
  }

  studyUIState.noteSaveTimer = setTimeout(function () {
    var result = StudyStore.saveSectionNote(topicId, sectionId, value);
    // Only touch the shared indicator if the user is still editing the same
    // section's note (avoids a stale "נשמר" appearing after switching
    // sections while a save was still pending).
    if (token === studyUIState.noteEditToken) {
      setNoteSaveState(result.success ? 'saved' : 'error');
    }
  }, NOTE_SAVE_DEBOUNCE_MS);
}

/* --------------------------------------------------------------------------
   Topic progress bar (#topic-progress-bar) and text (#topic-progress-text)
   -------------------------------------------------------------------------- */

function refreshTopicProgress() {
  var barEl = document.getElementById('topic-progress-bar');
  var textEl = document.getElementById('topic-progress-text');
  if (!studyUIState.topicId || !studyUIState.topicData) {
    return;
  }

  var total = studyUIState.topicData.sections.length;
  var progress = StudyStore.getTopicProgress(studyUIState.topicId, total);

  if (barEl) {
    barEl.setAttribute('aria-valuenow', String(progress.percentage));
    var fillEl = barEl.querySelector('.topic-progress-fill');
    if (fillEl) {
      fillEl.style.width = progress.percentage + '%';
    }
  }
  if (textEl) {
    textEl.textContent =
      progress.completed + ' מתוך ' + progress.total + ' הושלמו · ' + progress.started + ' התחילו';
  }
}

/* --------------------------------------------------------------------------
   Internal subtopic navigation status indicators (#section-list)
   -------------------------------------------------------------------------- */

// Adds a small status indicator (symbol + accessible label) to each
// subtopic link in #section-list, reflecting its stored study status.
// Safe to call repeatedly (e.g. after topic-renderer rebuilds the list).
function refreshSectionNavIndicators(topicId, sections) {
  var list = document.getElementById('section-list');
  if (!list || !sections) {
    return;
  }

  var links = list.querySelectorAll('a.section-link');
  links.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var sectionId = href.replace(/^#/, '');
    var sectionState = StudyStore.getSectionState(topicId, sectionId);

    var existing = link.querySelector('.section-status-indicator');
    if (existing) {
      link.removeChild(existing);
    }

    var indicator = document.createElement('span');
    indicator.className = 'section-status-indicator status-' + sectionState.status;
    indicator.setAttribute('aria-label', getStudyStatusLabel(sectionState.status));
    indicator.textContent = getStudyStatusSymbol(sectionState.status);
    link.appendChild(indicator);
  });
}

/* --------------------------------------------------------------------------
   Reset button (#reset-topic-progress)
   -------------------------------------------------------------------------- */

function handleResetClick() {
  var topicTitle = (studyUIState.topicData && studyUIState.topicData.title) || '';
  var confirmed = window.confirm(
    'לאפס את כל ההתקדמות וההערות הפרטיות בנושא ' + topicTitle + '? לא ניתן לשחזר פעולה זו.'
  );
  if (!confirmed) {
    return;
  }

  StudyStore.clearTopicState(studyUIState.topicId);

  if (studyUIState.activeSectionId) {
    loadSectionPanel(studyUIState.topicId, studyUIState.activeSectionId);
  }
  refreshSectionNavIndicators(studyUIState.topicId, studyUIState.topicData.sections);
  refreshTopicProgress();
}

/* --------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

// Called once after the topic definition loads. Wires up the status
// selector, notes textarea, and reset button (idempotent — safe even if
// called more than once), and does an initial progress render.
function initStudyPanel(topicId, topicData) {
  studyUIState.topicId = topicId;
  studyUIState.topicData = topicData;

  if (!studyUIState.listenersAttached) {
    var statusSelect = document.getElementById('section-status');
    if (statusSelect) {
      populateStatusSelect(statusSelect);
      statusSelect.addEventListener('change', handleStatusChange);
    }

    var noteTextarea = document.getElementById('section-note');
    if (noteTextarea) {
      noteTextarea.addEventListener('input', handleNoteInput);
    }

    var resetButton = document.getElementById('reset-topic-progress');
    if (resetButton) {
      resetButton.addEventListener('click', handleResetClick);
    }

    studyUIState.listenersAttached = true;
  }

  refreshTopicProgress();
}

// Called after a section's content has successfully loaded and rendered.
// Records the visit (via StudyStore), then refreshes every study UI piece
// for the newly active section.
function onSectionLoaded(topicId, sectionId, topicData) {
  studyUIState.topicId = topicId;
  studyUIState.topicData = topicData;
  studyUIState.activeSectionId = sectionId;

  StudyStore.recordSectionVisit(topicId, sectionId);

  loadSectionPanel(topicId, sectionId);
  refreshSectionNavIndicators(topicId, topicData.sections);
  refreshTopicProgress();
}

var StudyUI = {
  initStudyPanel: initStudyPanel,
  onSectionLoaded: onSectionLoaded,
  refreshSectionNavIndicators: refreshSectionNavIndicators,
  refreshTopicProgress: refreshTopicProgress
};
