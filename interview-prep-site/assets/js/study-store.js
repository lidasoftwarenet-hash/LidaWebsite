// Personal study state persistence layer. This is the ONLY file allowed to
// access localStorage directly — all other files must go through the
// StudyStore API below. Contains no DOM access and no rendering logic.
//
// Everything is stored under one versioned key so the storage format can be
// migrated later without breaking older saved data, and so this layer can be
// swapped for a real API client in the future without changing callers.

var STUDY_STORAGE_KEY = 'interviewPrep.studyState.v1';
var STUDY_STORAGE_VERSION = 1;

var STUDY_SECTION_STATUSES = ['not-started', 'in-progress', 'completed', 'review'];

// Statuses that count as "started" for progress purposes. A section only
// gets an explicit stored status once the user has interacted with it (see
// recordSectionVisit / setSectionStatus), so any stored status other than
// "not-started" (chosen explicitly by the user) means real engagement.
var STUDY_STARTED_STATUSES = ['in-progress', 'completed', 'review'];

function createDefaultStudyState() {
  return {
    version: STUDY_STORAGE_VERSION,
    topics: {}
  };
}

function createDefaultTopicState() {
  return {
    lastSectionId: null,
    lastVisitedAt: null,
    sections: {}
  };
}

function createDefaultSectionState() {
  return {
    status: 'not-started',
    note: '',
    lastVisitedAt: null
  };
}

// Reads and parses the stored state, falling back to a fresh default state
// on missing data, invalid JSON, or an unexpected shape. Never throws.
function readStudyState() {
  var raw;
  try {
    raw = window.localStorage.getItem(STUDY_STORAGE_KEY);
  } catch (accessError) {
    return createDefaultStudyState();
  }

  if (!raw) {
    return createDefaultStudyState();
  }

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (parseError) {
    return createDefaultStudyState();
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.topics !== 'object' || parsed.topics === null) {
    return createDefaultStudyState();
  }

  parsed.version = STUDY_STORAGE_VERSION;
  return parsed;
}

// Persists the given state. Returns true on success, false if localStorage
// is unavailable or writing failed (e.g. quota exceeded, private mode).
function writeStudyState(state) {
  try {
    window.localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (writeError) {
    return false;
  }
}

// Ensures state.topics[topicId] exists, creating a default entry if needed.
// Mutates `state` in place and returns the topic entry.
function ensureTopicEntry(state, topicId) {
  if (!state.topics[topicId]) {
    state.topics[topicId] = createDefaultTopicState();
  }
  return state.topics[topicId];
}

// Ensures topicEntry.sections[sectionId] exists, creating a default entry
// if needed. Mutates `topicEntry` in place and returns the section entry.
function ensureSectionEntry(topicEntry, sectionId) {
  if (!topicEntry.sections[sectionId]) {
    topicEntry.sections[sectionId] = createDefaultSectionState();
  }
  return topicEntry.sections[sectionId];
}

var StudyStore = {
  STATUSES: STUDY_SECTION_STATUSES.slice(),

  // Returns the full stored state (all topics). Always a valid shape, even
  // if localStorage is empty, missing, or corrupted.
  getState: function () {
    return readStudyState();
  },

  // Returns the stored state for one topic, or a safe default
  // ({ lastSectionId: null, lastVisitedAt: null, sections: {} }) if the
  // topic has no stored data yet.
  getTopicState: function (topicId) {
    var state = readStudyState();
    return state.topics[topicId] || createDefaultTopicState();
  },

  // Returns the stored state for one section, or a safe default
  // ({ status: "not-started", note: "", lastVisitedAt: null }) if the
  // section has no stored data yet.
  getSectionState: function (topicId, sectionId) {
    var topic = this.getTopicState(topicId);
    return topic.sections[sectionId] || createDefaultSectionState();
  },

  // Sets a section's study status. Validates the status against the
  // supported list; invalid values are rejected without touching storage.
  // Preserves all other topics and sections. Returns
  // { success, sectionState } — success is false on invalid status or a
  // failed write.
  setSectionStatus: function (topicId, sectionId, status) {
    if (STUDY_SECTION_STATUSES.indexOf(status) === -1) {
      return { success: false, sectionState: this.getSectionState(topicId, sectionId) };
    }

    var state = readStudyState();
    var topic = ensureTopicEntry(state, topicId);
    var section = ensureSectionEntry(topic, sectionId);
    section.status = status;

    var success = writeStudyState(state);
    return { success: success, sectionState: section };
  },

  // Saves a section's private note text. Preserves all other topics and
  // sections. Returns { success }.
  saveSectionNote: function (topicId, sectionId, note) {
    var state = readStudyState();
    var topic = ensureTopicEntry(state, topicId);
    var section = ensureSectionEntry(topic, sectionId);
    section.note = typeof note === 'string' ? note : '';

    var success = writeStudyState(state);
    return { success: success };
  },

  // Records a visit to a section: updates the topic's lastSectionId and
  // lastVisitedAt, and the section's own lastVisitedAt. If the section had
  // no prior stored state, its status is automatically set to
  // "in-progress" — an existing "completed" or "review" status (or any
  // other previously stored status) is left untouched. Returns
  // { success, sectionState }.
  recordSectionVisit: function (topicId, sectionId) {
    var state = readStudyState();
    var topic = ensureTopicEntry(state, topicId);
    var isNewSection = !topic.sections[sectionId];
    var section = ensureSectionEntry(topic, sectionId);

    var now = new Date().toISOString();
    topic.lastSectionId = sectionId;
    topic.lastVisitedAt = now;
    section.lastVisitedAt = now;

    if (isNewSection) {
      section.status = 'in-progress';
    }

    var success = writeStudyState(state);
    return { success: success, sectionState: section };
  },

  // Computes progress for a topic. `totalSections` should be the number of
  // sections defined by the topic's loaded topic.json (the store has no
  // knowledge of topic definitions, only of stored study state). Returns
  // { completed, started, total, percentage }, where percentage is based
  // only on completed sections.
  getTopicProgress: function (topicId, totalSections) {
    var topic = this.getTopicState(topicId);
    var sectionIds = Object.keys(topic.sections);

    var completed = 0;
    var started = 0;
    sectionIds.forEach(function (sectionId) {
      var status = topic.sections[sectionId].status;
      if (status === 'completed') {
        completed++;
      }
      if (STUDY_STARTED_STATUSES.indexOf(status) !== -1) {
        started++;
      }
    });

    var total = typeof totalSections === 'number' ? totalSections : sectionIds.length;
    var percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed: completed, started: started, total: total, percentage: percentage };
  },

  // Removes stored state for a single section within a topic.
  // If no sections remain in the topic, clears the topic state entirely.
  // Recalculates lastSectionId and lastVisitedAt to the most recently visited
  // remaining section if any exist. Returns { success }.
  clearSectionState: function (topicId, sectionId) {
    var state = readStudyState();
    var topic = state.topics[topicId];
    if (!topic || !topic.sections) {
      return { success: true };
    }

    delete topic.sections[sectionId];

    var remainingSectionIds = Object.keys(topic.sections);
    if (remainingSectionIds.length === 0) {
      delete state.topics[topicId];
    } else {
      var mostRecentSectionId = null;
      var mostRecentTime = null;
      remainingSectionIds.forEach(function (id) {
        var sec = topic.sections[id];
        if (sec.lastVisitedAt) {
          var time = new Date(sec.lastVisitedAt).getTime();
          if (mostRecentTime === null || time > mostRecentTime) {
            mostRecentTime = time;
            mostRecentSectionId = id;
          }
        }
      });
      topic.lastSectionId = mostRecentSectionId || remainingSectionIds[0];
      topic.lastVisitedAt = mostRecentTime ? new Date(mostRecentTime).toISOString() : null;
    }

    var success = writeStudyState(state);
    return { success: success };
  },

  // Removes all stored state for one topic (progress and notes), leaving
  // every other topic's data untouched. Returns { success }.
  clearTopicState: function (topicId) {
    var state = readStudyState();
    delete state.topics[topicId];
    var success = writeStudyState(state);
    return { success: success };
  }
};
