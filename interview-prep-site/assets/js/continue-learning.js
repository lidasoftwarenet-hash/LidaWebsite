// "Continue learning" home page widget: reads the most recently visited
// topic/section from StudyStore and renders a shortcut back into it, or a
// clean empty state pointing at Java when there is no study history yet.
// Read-only with respect to storage — never writes, only calls
// StudyStore.getState()/getTopicProgress().

var CONTINUE_LEARNING_STATUS_LABELS = {
  'not-started': 'לא התחיל',
  'in-progress': 'בתהליך',
  'completed': 'הושלם',
  'review': 'לחזור עליו'
};

// Finds the most recently visited topic across all stored topics, using
// each topic's own lastVisitedAt timestamp. Returns null if there is no
// study history at all.
function findMostRecentTopic(state) {
  var topicIds = Object.keys(state.topics);
  var mostRecentId = null;
  var mostRecentTime = null;

  topicIds.forEach(function (topicId) {
    var topicState = state.topics[topicId];
    if (!topicState.lastVisitedAt) {
      return;
    }
    var time = new Date(topicState.lastVisitedAt).getTime();
    if (mostRecentTime === null || time > mostRecentTime) {
      mostRecentTime = time;
      mostRecentId = topicId;
    }
  });

  return mostRecentId;
}

// Formats an ISO timestamp into a short, readable Hebrew relative-ish label.
// Falls back to a plain locale date string for anything not "recent".
function formatVisitedAt(isoString) {
  var date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '';
  }

  var diffMs = Date.now() - date.getTime();
  var diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'ממש עכשיו';
  }
  if (diffMinutes < 60) {
    return 'לפני ' + diffMinutes + ' דקות';
  }
  var diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return 'לפני ' + diffHours + ' שעות';
  }
  var diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return 'לפני ' + diffDays + ' ימים';
  }
  return date.toLocaleDateString('he-IL');
}

function renderContinueLearningEmptyState(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var eyebrow = document.createElement('p');
  eyebrow.className = 'continue-learning-eyebrow';
  eyebrow.textContent = 'המשך למידה';

  var title = document.createElement('p');
  title.className = 'continue-learning-title';
  title.textContent = 'עדיין לא התחלת ללמוד';

  var meta = document.createElement('p');
  meta.className = 'continue-learning-meta';
  meta.textContent = 'בחרו נושא מרשימת הנושאים כדי להתחיל ללמוד';

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(meta);
}

function renderContinueLearningActive(container, topicId, topicState, topicName) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var sectionId = topicState.lastSectionId;
  var sectionState = topicState.sections[sectionId] || { status: 'not-started' };

  var eyebrow = document.createElement('p');
  eyebrow.className = 'continue-learning-eyebrow';
  eyebrow.textContent = 'המשך למידה';

  var title = document.createElement('p');
  title.className = 'continue-learning-title';
  title.textContent = (topicName || topicId) + (sectionId ? ' · ' + sectionId : '');

  var meta = document.createElement('p');
  meta.className = 'continue-learning-meta';

  var statusSpan = document.createElement('span');
  var dot = document.createElement('span');
  dot.className = 'status-dot status-' + sectionState.status;
  statusSpan.appendChild(dot);
  statusSpan.appendChild(document.createTextNode(' ' + (CONTINUE_LEARNING_STATUS_LABELS[sectionState.status] || sectionState.status)));
  meta.appendChild(statusSpan);

  if (topicState.lastVisitedAt) {
    var timeSpan = document.createElement('span');
    timeSpan.textContent = 'נצפה לאחרונה ' + formatVisitedAt(topicState.lastVisitedAt);
    meta.appendChild(timeSpan);
  }

  var actions = document.createElement('div');
  actions.className = 'continue-learning-actions';
  var button = document.createElement('a');
  button.className = 'button-primary';
  button.href = '/interview-prep-site/topics/' + topicId + '/index.html' + (sectionId ? '#' + sectionId : '');
  button.textContent = 'המשך מהנקודה האחרונה';
  actions.appendChild(button);

  var resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'button-danger-ghost';
  resetBtn.textContent = 'איפוס מקטע';
  resetBtn.setAttribute('aria-label', 'איפוס ההתקדמות עבור מקטע זה');
  resetBtn.addEventListener('click', function () {
    var label = (topicName || topicId) + (sectionId ? ' · ' + sectionId : '');
    var confirmed = window.confirm('האם לאפס את ההתקדמות עבור ' + label + '?');
    if (!confirmed) {
      return;
    }

    if (typeof StudyStore !== 'undefined') {
      if (sectionId && typeof StudyStore.clearSectionState === 'function') {
        StudyStore.clearSectionState(topicId, sectionId);
      } else {
        StudyStore.clearTopicState(topicId);
      }
    }

    renderContinueLearning();
    if (typeof renderHomeCards === 'function') {
      renderHomeCards();
    }
    if (typeof renderProgressSummary === 'function') {
      renderProgressSummary();
    }
  });
  actions.appendChild(resetBtn);

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(actions);
}

// Entry point. Renders into #continue-learning. Requires the global
// `topics` list (data/topics.js) to resolve a display name for the most
// recently visited topic, and StudyStore for the underlying study state.
function renderContinueLearning() {
  var container = document.getElementById('continue-learning');
  if (!container || typeof StudyStore === 'undefined') {
    return;
  }

  var state = StudyStore.getState();
  var mostRecentTopicId = findMostRecentTopic(state);

  if (!mostRecentTopicId) {
    renderContinueLearningEmptyState(container);
    return;
  }

  var topicState = state.topics[mostRecentTopicId];
  var topicMeta = typeof topics !== 'undefined'
    ? topics.find(function (topic) {
        return topic.id === mostRecentTopicId;
      })
    : null;

  renderContinueLearningActive(container, mostRecentTopicId, topicState, topicMeta ? topicMeta.name : null);
}
