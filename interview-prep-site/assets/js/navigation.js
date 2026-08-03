// Site navigation logic: renders topic cards, sidebar, breadcrumbs,
// previous/next links, and detects the active topic from the current URL.
// Relies on the global `topics` list defined in data/topics.js.
//
// Home page cards, the progress summary, and the "continue learning" widget
// read study progress via StudyStore (assets/js/study-store.js) when it is
// available (it is loaded on the home page and on topic pages) — this file
// never accesses localStorage directly.

// Extracts the current topic id from the URL path, e.g.
// ".../topics/java/index.html" -> "java". Returns null on the home page.
function getCurrentTopicId() {
  var match = window.location.pathname.match(/topics\/([^/]+)\/?/);
  return match ? match[1] : null;
}

// Builds short plain-text initials from a topic name, used as a simple
// text-based icon on the home page cards.
function getTopicInitials(name) {
  var cleaned = name.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  var words = cleaned.split(' ').filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Only the Java topic currently has real section data (data/topic.json).
// Other topics have no section count to compute progress against, so their
// cards show a clean "not started yet" state rather than a fabricated 0%.
// This mirrors what topic-renderer.js itself can load today.
var TOPIC_SECTION_COUNTS = {
  java: 2
};

/* --------------------------------------------------------------------------
   Home page topic cards (#topics-grid)
   -------------------------------------------------------------------------- */

function buildTopicCardProgress(topicId) {
  var totalSections = TOPIC_SECTION_COUNTS[topicId];
  if (!totalSections || typeof StudyStore === 'undefined') {
    return null;
  }
  return StudyStore.getTopicProgress(topicId, totalSections);
}

function renderHomeCards() {
  var grid = document.getElementById('topics-grid');
  if (!grid || typeof topics === 'undefined') {
    return;
  }

  grid.innerHTML = '';

  topics.forEach(function (topic) {
    var card = document.createElement('a');
    card.className = 'topic-card';
    card.href = topic.path + '/index.html';

    var top = document.createElement('div');
    top.className = 'topic-card-top';

    var icon = document.createElement('span');
    icon.className = 'topic-card-icon';
    icon.setAttribute('aria-hidden', 'true');

    var iconImg = document.createElement('img');
    var defaultPng = 'assets/icons/' + topic.id + '.png';
    var defaultSvg = 'assets/icons/' + topic.id + '.svg';

    iconImg.src = topic.icon || defaultPng;
    iconImg.alt = '';
    iconImg.loading = 'lazy';

    var triedSvg = false;
    iconImg.onerror = function () {
      if (!topic.icon && !triedSvg) {
        triedSvg = true;
        iconImg.src = defaultSvg;
      } else {
        icon.innerHTML = '';
        icon.textContent = getTopicInitials(topic.name);
      }
    };
    icon.appendChild(iconImg);

    var heading = document.createElement('div');
    heading.className = 'topic-card-heading';

    var name = document.createElement('span');
    name.className = 'topic-card-name';
    name.textContent = topic.name;
    heading.appendChild(name);

    var progress = buildTopicCardProgress(topic.id);

    var statusLine = document.createElement('span');
    statusLine.className = 'topic-card-status';
    var dot = document.createElement('span');
    dot.className = 'status-dot status-' + (progress && progress.completed === progress.total && progress.total > 0 ? 'completed' : progress && progress.started > 0 ? 'in-progress' : 'not-started');
    statusLine.appendChild(dot);
    var statusText = document.createElement('span');
    statusText.textContent = progress && progress.started > 0
      ? (progress.percentage + '% הושלם')
      : 'טרם התחלת';
    statusLine.appendChild(statusText);
    heading.appendChild(statusLine);

    top.appendChild(icon);
    top.appendChild(heading);
    card.appendChild(top);

    if (progress && progress.started > 0) {
      var track = document.createElement('div');
      track.className = 'topic-card-progress-track';
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', '100');
      track.setAttribute('aria-valuenow', String(progress.percentage));
      track.setAttribute('aria-label', topic.name + ' — התקדמות');
      var fill = document.createElement('div');
      fill.className = 'topic-card-progress-fill';
      fill.style.width = progress.percentage + '%';
      track.appendChild(fill);
      card.appendChild(track);

      var meta = document.createElement('p');
      meta.className = 'topic-card-meta';
      meta.textContent = progress.completed + ' מתוך ' + progress.total + ' נושאים הושלמו';
      card.appendChild(meta);

      if (typeof StudyStore !== 'undefined') {
        var topicState = StudyStore.getTopicState(topic.id);
        if (topicState.lastSectionId) {
          var lastMeta = document.createElement('p');
          lastMeta.className = 'topic-card-meta';
          lastMeta.textContent = 'נושא אחרון: ' + topicState.lastSectionId;
          card.appendChild(lastMeta);
        }
      }
    } else {
      var emptyMeta = document.createElement('p');
      emptyMeta.className = 'topic-card-meta is-empty';
      emptyMeta.textContent = 'טרם התחלת';
      card.appendChild(emptyMeta);
    }

    grid.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   Overall progress summary (#progress-summary)
   -------------------------------------------------------------------------- */

function renderProgressSummary() {
  var completedEl = document.getElementById('summary-completed-count');
  var startedEl = document.getElementById('summary-started-count');
  var totalEl = document.getElementById('summary-total-count');
  if (!completedEl || !startedEl || !totalEl || typeof topics === 'undefined' || typeof StudyStore === 'undefined') {
    return;
  }

  var topicsWithData = Object.keys(TOPIC_SECTION_COUNTS);
  var completedTopics = 0;
  var startedTopics = 0;

  topicsWithData.forEach(function (topicId) {
    var progress = StudyStore.getTopicProgress(topicId, TOPIC_SECTION_COUNTS[topicId]);
    if (progress.started > 0) {
      startedTopics++;
    }
    if (progress.completed === progress.total && progress.total > 0) {
      completedTopics++;
    }
  });

  completedEl.textContent = String(completedTopics);
  startedEl.textContent = String(startedTopics);
  totalEl.textContent = String(topics.length);
}

/* --------------------------------------------------------------------------
   Sidebar / breadcrumbs / global previous-next (topic pages)
   -------------------------------------------------------------------------- */

// Renders the sidebar topic list (#sidebar-list) and highlights the active topic.
function renderSidebar(activeId) {
  var list = document.getElementById('sidebar-list');
  if (!list || typeof topics === 'undefined') {
    return;
  }

  list.innerHTML = '';

  topics.forEach(function (topic) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.className = 'sidebar-link';
    link.href = '../' + topic.id + '/index.html';
    link.textContent = topic.name;

    if (topic.id === activeId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }

    item.appendChild(link);
    list.appendChild(item);
  });
}

// Renders breadcrumbs (#breadcrumbs) for the current topic.
function renderBreadcrumbs(activeTopic) {
  var breadcrumbs = document.getElementById('breadcrumbs');
  if (!breadcrumbs) {
    return;
  }

  breadcrumbs.innerHTML = '';

  var homeLink = document.createElement('a');
  homeLink.href = '../../index.html';
  homeLink.textContent = 'בית';

  var separator = document.createElement('span');
  separator.className = 'breadcrumb-separator';
  separator.textContent = '/';

  var current = document.createElement('span');
  current.className = 'breadcrumb-current';
  current.textContent = activeTopic ? activeTopic.name : '';

  breadcrumbs.appendChild(homeLink);
  breadcrumbs.appendChild(separator);
  breadcrumbs.appendChild(current);
}

// Renders the current topic title (#topic-title) with its topic icon.
function renderTopicTitle(activeTopic) {
  var titleEl = document.getElementById('topic-title');
  if (!titleEl || !activeTopic) {
    return;
  }

  titleEl.innerHTML = '';
  titleEl.className = 'topic-title';

  var iconWrap = document.createElement('span');
  iconWrap.className = 'topic-title-icon';
  iconWrap.setAttribute('aria-hidden', 'true');

  var defaultPng = '../../assets/icons/' + activeTopic.id + '.png';
  var defaultSvg = '../../assets/icons/' + activeTopic.id + '.svg';
  var iconSrc = activeTopic.icon ? ('../../' + activeTopic.icon) : defaultPng;

  var iconImg = document.createElement('img');
  iconImg.src = iconSrc;
  iconImg.alt = '';
  iconImg.loading = 'eager';

  var triedSvg = false;
  iconImg.onerror = function () {
    if (!activeTopic.icon && !triedSvg) {
      triedSvg = true;
      iconImg.src = defaultSvg;
    } else {
      iconWrap.innerHTML = '';
      iconWrap.textContent = getTopicInitials(activeTopic.name);
    }
  };
  iconWrap.appendChild(iconImg);

  var textSpan = document.createElement('span');
  textSpan.className = 'topic-title-text';
  textSpan.textContent = activeTopic.name;

  titleEl.appendChild(iconWrap);
  titleEl.appendChild(textSpan);
}

// Renders previous/next topic links (#prev-topic / #next-topic),
// hiding whichever side doesn't exist (first/last topic).
function renderPrevNext(activeId) {
  var prevEl = document.getElementById('prev-topic');
  var nextEl = document.getElementById('next-topic');
  if (!prevEl || !nextEl || typeof topics === 'undefined') {
    return;
  }

  var index = topics.findIndex(function (topic) {
    return topic.id === activeId;
  });
  if (index === -1) {
    return;
  }

  var prevTopic = index > 0 ? topics[index - 1] : null;
  var nextTopic = index < topics.length - 1 ? topics[index + 1] : null;

  renderPagerLink(prevEl, prevTopic, 'נושא קודם', 'prev', function (topic) {
    return '../' + topic.id + '/index.html';
  });
  renderPagerLink(nextEl, nextTopic, 'נושא הבא', 'next', function (topic) {
    return '../' + topic.id + '/index.html';
  });
}

// Fills a pager <a> element (topic-level or section-level) with a direction
// label and destination name, or hides it when there is no destination.
// `getHref(destination)` builds the href — topic-level pagers link to a
// sibling folder, section-level pagers link to a hash; each caller supplies
// the right scheme.
function renderPagerLink(linkEl, destination, directionLabel, side, getHref) {
  linkEl.classList.remove('pager-prev', 'pager-next');
  linkEl.classList.add(side === 'prev' ? 'pager-prev' : 'pager-next');
  while (linkEl.firstChild) {
    linkEl.removeChild(linkEl.firstChild);
  }

  if (!destination) {
    linkEl.removeAttribute('href');
    linkEl.classList.add('is-hidden');
    linkEl.setAttribute('aria-hidden', 'true');
    return;
  }

  linkEl.classList.remove('is-hidden');
  linkEl.removeAttribute('aria-hidden');
  linkEl.href = getHref(destination);

  var directionEl = document.createElement('span');
  directionEl.className = 'pager-direction';
  directionEl.textContent = directionLabel;

  var destinationEl = document.createElement('span');
  destinationEl.className = 'pager-destination';
  destinationEl.textContent = destination.name || destination.title;

  linkEl.appendChild(directionEl);
  linkEl.appendChild(destinationEl);
}

/* --------------------------------------------------------------------------
   Entry point
   -------------------------------------------------------------------------- */

// Entry point called by app.js on DOMContentLoaded. Detects the current
// page type from the DOM and current URL, then renders whatever applies.
function initNavigation() {
  if (document.getElementById('topics-grid')) {
    renderHomeCards();
    renderProgressSummary();
  }

  var activeId = getCurrentTopicId();
  if (activeId && typeof topics !== 'undefined') {
    var activeTopic = topics.find(function (topic) {
      return topic.id === activeId;
    }) || null;

    renderSidebar(activeId);
    renderBreadcrumbs(activeTopic);
    renderTopicTitle(activeTopic);
    renderPrevNext(activeId);
  }
}
