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
// "saving" -> "שומר...", "saved" -> "נשמר", "local-only" -> "נשמר מקומית בלבד",
// "error" -> clear error message, "idle" -> cleared.
function setNoteSaveState(state, customMessage) {
  var el = document.getElementById('note-save-state');
  if (!el) {
    return;
  }
  el.classList.remove('is-saving', 'is-saved', 'is-local-only', 'is-error');

  if (state === 'saving') {
    el.textContent = 'שומר...';
    el.classList.add('is-saving');
  } else if (state === 'saved') {
    el.textContent = 'נשמר';
    el.classList.add('is-saved');
  } else if (state === 'local-only') {
    el.textContent = 'נשמר מקומית בלבד';
    el.classList.add('is-local-only');
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
  var newStatus = event.target.value;
  var topicId = studyUIState.topicId;
  var sectionId = studyUIState.activeSectionId;

  // Optimistically update UI and local cache
  StudyStore.setSectionStatus(topicId, sectionId, newStatus);
  refreshStatusBadge(newStatus);
  refreshSectionNavIndicators(topicId, studyUIState.topicData.sections);
  refreshTopicProgress();

  if (typeof StudyApi !== 'undefined' && StudyApi.updateSection) {
    StudyApi.updateSection(topicId, sectionId, { status: newStatus })
      .then(function (record) {
        if (record) {
          StudyStore.updateSectionFromBackend(topicId, sectionId, record);
          refreshSectionNavIndicators(topicId, studyUIState.topicData.sections);
          refreshTopicProgress();
        }
      })
      .catch(function (err) {
        console.warn('⚠️ Could not sync section status to server for ' + sectionId + ':', err);
      });
  }
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
  var token = ++studyUIState.noteEditToken;

  if (studyUIState.noteSaveTimer) {
    clearTimeout(studyUIState.noteSaveTimer);
  }

  studyUIState.noteSaveTimer = setTimeout(function () {
    var result = StudyStore.saveSectionNote(topicId, sectionId, value);
    if (!result.success) {
      if (token === studyUIState.noteEditToken) {
        setNoteSaveState('error');
      }
      return;
    }

    if (typeof StudyApi !== 'undefined' && StudyApi.updateSection) {
      StudyApi.updateSection(topicId, sectionId, { note: value })
        .then(function (record) {
          if (record) {
            StudyStore.updateSectionFromBackend(topicId, sectionId, record);
          }
          if (token === studyUIState.noteEditToken) {
            setNoteSaveState('saved');
          }
        })
        .catch(function (err) {
          console.warn('⚠️ Could not sync note to server for ' + sectionId + ':', err);
          if (token === studyUIState.noteEditToken) {
            setNoteSaveState('local-only');
          }
        });
    } else {
      if (token === studyUIState.noteEditToken) {
        setNoteSaveState('local-only');
      }
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

  var topicId = studyUIState.topicId;
  var resetButton = document.getElementById('reset-topic-progress');
  if (resetButton) {
    resetButton.disabled = true;
  }

  if (typeof StudyApi !== 'undefined' && StudyApi.resetTopic) {
    StudyApi.resetTopic(topicId)
      .then(function () {
        StudyStore.clearTopicState(topicId);
        if (studyUIState.activeSectionId) {
          loadSectionPanel(topicId, studyUIState.activeSectionId);
        }
        refreshSectionNavIndicators(topicId, studyUIState.topicData.sections);
        refreshTopicProgress();
      })
      .catch(function (err) {
        console.warn('⚠️ Could not reset topic on server for ' + topicId + ':', err);
        window.alert('איפוס ההתקדמות בשרת נכשל. הנתונים לא אופסו.');
      })
      .finally(function () {
        if (resetButton) {
          resetButton.disabled = false;
        }
      });
  } else {
    StudyStore.clearTopicState(topicId);
    if (studyUIState.activeSectionId) {
      loadSectionPanel(topicId, studyUIState.activeSectionId);
    }
    refreshSectionNavIndicators(topicId, studyUIState.topicData.sections);
    refreshTopicProgress();
    if (resetButton) {
      resetButton.disabled = false;
    }
  }
}

/* --------------------------------------------------------------------------
   Background server sync (authoritative hydration)
   -------------------------------------------------------------------------- */

function syncTopicFromBackend(topicId, topicData, options) {
  if (typeof StudyApi === 'undefined' || !StudyApi.getTopicStates) {
    return;
  }

  StudyApi.getTopicStates(topicId)
    .then(function (apiSections) {
      if (Array.isArray(apiSections)) {
        var replaceResult = StudyStore.replaceTopicFromApi(topicId, apiSections);
        var updatedTopicState = replaceResult.topicState;

        refreshTopicProgress();
        if (topicData && topicData.sections) {
          refreshSectionNavIndicators(topicId, topicData.sections);
        }

        // When opening without an explicit hash, navigate to the section with newest lastVisitedAt
        var hasExplicitHash = options && options.hasExplicitHash;
        var newestSectionId = updatedTopicState && updatedTopicState.lastSectionId;
        var sectionStillExists =
          newestSectionId &&
          topicData &&
          topicData.sections &&
          topicData.sections.some(function (sec) {
            return sec.id === newestSectionId;
          });

        if (!hasExplicitHash && sectionStillExists && newestSectionId !== studyUIState.activeSectionId) {
          if (options && typeof options.onNavigateToSection === 'function') {
            options.onNavigateToSection(newestSectionId);
            return;
          }
        }

        // Refresh active section controls
        if (studyUIState.activeSectionId) {
          var noteTextarea = document.getElementById('section-note');
          var isEditingNote = noteTextarea && document.activeElement === noteTextarea;
          var sectionState = StudyStore.getSectionState(topicId, studyUIState.activeSectionId);

          var statusSelect = document.getElementById('section-status');
          if (statusSelect) {
            statusSelect.value = sectionState.status;
          }
          refreshStatusBadge(sectionState.status);

          if (!isEditingNote && noteTextarea) {
            noteTextarea.value = sectionState.note || '';
            refreshCharCount(sectionState.note || '');
          }
        }
      }
    })
    .catch(function (err) {
      console.warn('⚠️ Could not sync topic data from server, continuing with cached local data:', err);
    });
}

/* --------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

// Called once after the topic definition loads. Wires up the status
// selector, notes textarea, and reset button (idempotent — safe even if
// called more than once), and does an initial progress render.
function initStudyPanel(topicId, topicData, options) {
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
  syncTopicFromBackend(topicId, topicData, options);
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

  if (typeof StudyApi !== 'undefined' && StudyApi.updateSection) {
    StudyApi.updateSection(topicId, sectionId, { visited: true })
      .then(function (record) {
        if (record) {
          StudyStore.updateSectionFromBackend(topicId, sectionId, record);
        }
      })
      .catch(function (err) {
        console.warn('⚠️ Could not sync section visit to server for ' + sectionId + ':', err);
      });
  }
}

var StudyUI = {
  initStudyPanel: initStudyPanel,
  onSectionLoaded: onSectionLoaded,
  refreshSectionNavIndicators: refreshSectionNavIndicators,
  refreshTopicProgress: refreshTopicProgress
};
