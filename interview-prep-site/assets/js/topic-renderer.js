// Topic content renderer + controller: renders the internal subtopic
// navigation, section title, section content blocks, previous/next
// subtopic links, and loading/error states. Also owns the small amount of
// controller logic needed to wire hash-based routing to the loader
// (assets/js/topic-loader.js) — the topic page's script.js only calls
// initTopicPage() with its topic.json path.
//
// Supported content block types: paragraph, heading, bulletList, code,
// callout, qa. Content is always inserted via textContent/createElement,
// never innerHTML, so arbitrary JSON content cannot inject markup.

var topicPageState = {
  topicPath: null,
  topicData: null,
  activeSectionId: null,
  activeBlockId: null
};

// In-memory cache for loaded section JSON files and search index
var sectionContentCache = {};
var topicSearchIndex = [];
var searchDebounceTimer = null;
var readingProgressRafId = null;

// Removes all children of an element without using innerHTML.
function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

// Reads the current subtopic id from the URL hash (e.g. "#oop" -> "oop", "#oop?block=block-oop-1" -> "oop").
function getHashSectionId() {
  var hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  var parts = hash.split(/[?\/]/);
  return parts[0] || null;
}

// Reads target block id from the URL hash if present
function getHashBlockId() {
  var hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  var match = hash.match(/[?&]block=([^&]+)/) || hash.match(/\/([^?&]+)/);
  return match ? match[1] : null;
}

/* --------------------------------------------------------------------------
   Reading progress indicator for active section
   -------------------------------------------------------------------------- */

function ensureReadingProgressElement() {
  var existing = document.getElementById('section-reading-progress');
  if (existing) {
    return existing;
  }

  var sectionBody = document.querySelector('.section-body');
  if (!sectionBody) {
    return null;
  }

  var progressEl = document.createElement('div');
  progressEl.id = 'section-reading-progress';
  progressEl.className = 'section-reading-progress';
  progressEl.setAttribute('aria-hidden', 'true');

  var track = document.createElement('div');
  track.className = 'section-reading-progress-track';

  var bar = document.createElement('div');
  bar.id = 'section-reading-progress-bar';
  bar.className = 'section-reading-progress-bar';
  bar.style.width = '0%';
  track.appendChild(bar);

  var label = document.createElement('span');
  label.id = 'section-reading-progress-label';
  label.className = 'section-reading-progress-label';
  label.textContent = '0%';

  progressEl.appendChild(track);
  progressEl.appendChild(label);

  sectionBody.insertBefore(progressEl, sectionBody.firstChild);
  return progressEl;
}

function updateReadingProgress() {
  if (readingProgressRafId) {
    cancelAnimationFrame(readingProgressRafId);
  }

  readingProgressRafId = requestAnimationFrame(function () {
    var bar = document.getElementById('section-reading-progress-bar');
    var label = document.getElementById('section-reading-progress-label');
    var wrapper = document.getElementById('section-content-wrapper');

    if (!bar || !wrapper || wrapper.hidden) {
      return;
    }

    var rect = wrapper.getBoundingClientRect();
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    var totalHeight = rect.height - (windowHeight * 0.75);
    var percentage = 0;

    if (totalHeight <= 0) {
      percentage = rect.top <= 120 ? 100 : 0;
    } else {
      var scrolled = -rect.top + 80;
      if (scrolled <= 0) {
        percentage = 0;
      } else if (scrolled >= totalHeight) {
        percentage = 100;
      } else {
        percentage = Math.round((scrolled / totalHeight) * 100);
      }
    }

    percentage = Math.max(0, Math.min(100, percentage));
    bar.style.width = percentage + '%';
    if (label) {
      label.textContent = percentage + '%';
    }
  });
}

function resetReadingProgress() {
  var bar = document.getElementById('section-reading-progress-bar');
  var label = document.getElementById('section-reading-progress-label');
  if (bar) {
    bar.style.width = '0%';
  }
  if (label) {
    label.textContent = '0%';
  }
}

function initReadingProgress() {
  ensureReadingProgressElement();
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress, { passive: true });
}

/* --------------------------------------------------------------------------
   Search inside current topic
   -------------------------------------------------------------------------- */

var BLOCK_TYPE_LABELS = {
  sectionTitle: 'נושא',
  heading: 'כותרת',
  paragraph: 'תוכן',
  bulletList: 'רשימה',
  code: 'קוד',
  callout: 'הערה',
  qa: 'שאלה ותשובה',
  definition: 'הגדרה',
  comparison: 'השוואה',
  steps: 'שלבים',
  interviewAnswer: 'שאלת ראיון',
  table: 'טבלה',
  checklist: 'צ׳קליסט',
  flow: 'תרשים זרימה',
  tabs: 'טאבים'
};

function getBlockTypeLabel(type) {
  return BLOCK_TYPE_LABELS[type] || 'מידע';
}

function extractBlockSearchText(block) {
  if (!block || typeof block !== 'object') return '';
  var type = block.type;
  if (type === 'paragraph' || type === 'heading') {
    return block.text || '';
  }
  if (type === 'bulletList') {
    if (Array.isArray(block.items)) {
      return block.items.map(function (item) {
        return typeof item === 'string' ? item : ((item && item.text) || '');
      }).join(' ');
    }
    return '';
  }
  if (type === 'code') {
    return (block.code || '') + (block.language ? ' ' + block.language : '');
  }
  if (type === 'callout') {
    return (block.title || '') + ' ' + (block.text || '');
  }
  if (type === 'qa') {
    return (block.question || '') + ' ' + (block.answer || '');
  }
  if (type === 'definition') {
    return (block.term || '') + ' ' + (block.definition || '') + ' ' + (block.text || '') + ' ' + (block.details || '');
  }
  if (type === 'comparison') {
    var compParts = [(block.title || ''), (block.leftTitle || ''), (block.rightTitle || '')];
    if (Array.isArray(block.items)) {
      block.items.forEach(function (item) {
        if (typeof item === 'string') {
          compParts.push(item);
        } else if (item && typeof item === 'object') {
          compParts.push((item.topic || '') + ' ' + (item.left || '') + ' ' + (item.right || ''));
        }
      });
    }
    return compParts.join(' ');
  }
  if (type === 'steps') {
    var stepParts = [block.title || ''];
    if (Array.isArray(block.items)) {
      block.items.forEach(function (item) {
        if (typeof item === 'string') {
          stepParts.push(item);
        } else if (item && typeof item === 'object') {
          stepParts.push((item.title || '') + ' ' + (item.text || ''));
        }
      });
    }
    return stepParts.join(' ');
  }
  if (type === 'interviewAnswer') {
    var ansParts = [
      block.question || '',
      block.shortAnswer || '',
      block.fullAnswer || ''
    ];
    if (Array.isArray(block.keyPoints)) {
      ansParts.push(block.keyPoints.join(' '));
    }
    if (Array.isArray(block.tags)) {
      ansParts.push(block.tags.join(' '));
    }
    return ansParts.join(' ');
  }
  if (type === 'table') {
    var tableParts = [block.title || '', block.caption || ''];
    if (Array.isArray(block.headers)) {
      tableParts.push(block.headers.join(' '));
    }
    if (Array.isArray(block.rows)) {
      block.rows.forEach(function (r) {
        if (Array.isArray(r)) tableParts.push(r.join(' '));
      });
    }
    return tableParts.join(' ');
  }
  if (type === 'checklist') {
    var checkParts = [block.title || ''];
    if (Array.isArray(block.items)) {
      block.items.forEach(function (item) {
        if (typeof item === 'string') checkParts.push(item);
        else if (item && typeof item === 'object') checkParts.push(item.text || '');
      });
    }
    return checkParts.join(' ');
  }
  if (type === 'flow') {
    var flowParts = [block.title || ''];
    if (Array.isArray(block.items)) {
      block.items.forEach(function (item) {
        if (typeof item === 'string') flowParts.push(item);
        else if (item && typeof item === 'object') flowParts.push((item.title || '') + ' ' + (item.text || ''));
      });
    }
    return flowParts.join(' ');
  }
  if (type === 'tabs') {
    var tabsParts = [block.title || ''];
    if (Array.isArray(block.tabs)) {
      block.tabs.forEach(function (tab) {
        if (tab && typeof tab === 'object') {
          tabsParts.push(tab.title || '');
          if (Array.isArray(tab.content)) {
            tab.content.forEach(function (sub) {
              tabsParts.push(extractBlockSearchText(sub));
            });
          }
        }
      });
    }
    return tabsParts.join(' ');
  }
  return '';
}

async function buildTopicSearchIndex(topicPath, topicData) {
  if (!topicData || !Array.isArray(topicData.sections) || topicData.sections.length === 0) {
    topicSearchIndex = [];
    return;
  }

  topicSearchIndex = [];
  var sections = topicData.sections;

  // Add section titles to search index
  sections.forEach(function (sec) {
    if (sec.title) {
      topicSearchIndex.push({
        sectionId: sec.id,
        sectionTitle: sec.title,
        blockId: null,
        blockType: 'sectionTitle',
        text: sec.title
      });
    }
  });

  // Pre-fetch and index all section content blocks
  var indexPromises = sections.map(async function (sec) {
    try {
      var content;
      if (sectionContentCache[sec.id]) {
        content = sectionContentCache[sec.id];
      } else {
        content = await loadSectionContent(topicPath, sec.file);
        sectionContentCache[sec.id] = content;
      }

      if (content && Array.isArray(content.blocks)) {
        content.blocks.forEach(function (block, idx) {
          var blockText = extractBlockSearchText(block).trim();
          if (blockText) {
            topicSearchIndex.push({
              sectionId: sec.id,
              sectionTitle: sec.title || content.title || sec.id,
              blockId: 'block-' + sec.id + '-' + idx,
              blockType: block.type || 'paragraph',
              text: blockText
            });
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ Search index: could not load section "' + sec.id + '":', err.message);
    }
  });

  await Promise.all(indexPromises);
}

function createSnippetElement(fullText, matchIndex, queryLength) {
  var container = document.createElement('div');
  container.className = 'topic-search-result-snippet';

  var start = Math.max(0, matchIndex - 35);
  var end = Math.min(fullText.length, matchIndex + queryLength + 50);

  var prefix = (start > 0 ? '… ' : '') + fullText.slice(start, matchIndex);
  var match = fullText.slice(matchIndex, matchIndex + queryLength);
  var suffix = fullText.slice(matchIndex + queryLength, end) + (end < fullText.length ? ' …' : '');

  if (prefix) {
    container.appendChild(document.createTextNode(prefix));
  }

  var mark = document.createElement('mark');
  mark.className = 'topic-search-highlight';
  mark.textContent = match;
  container.appendChild(mark);

  if (suffix) {
    container.appendChild(document.createTextNode(suffix));
  }

  return container;
}

/* --------------------------------------------------------------------------
   Direct block links & clipboard helpers
   -------------------------------------------------------------------------- */

function copyBlockLink(sectionId, blockId, btnEl, titleText) {
  var hash = '#' + sectionId + (blockId ? '?block=' + blockId : '');
  var url = window.location.origin + window.location.pathname + hash;

  try {
    window.history.replaceState(null, '', hash);
  } catch (e) {}

  function showSuccess() {
    if (btnEl) {
      btnEl.classList.add('block-anchor-copied');
      var originalLabel = btnEl.getAttribute('aria-label') || 'העתקת קישור ישיר';
      btnEl.setAttribute('aria-label', 'הקישור הועתק!');
      var feedback = btnEl.querySelector('.block-anchor-feedback');
      if (feedback) {
        feedback.textContent = 'הקישור הועתק ללוח';
      }
      setTimeout(function () {
        btnEl.classList.remove('block-anchor-copied');
        btnEl.setAttribute('aria-label', originalLabel);
        if (feedback) {
          feedback.textContent = '';
        }
      }, 1500);
    }

    if (blockId) {
      highlightAndScrollToBlock(blockId);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(url).then(showSuccess).catch(function () {
      fallbackCopy(url, showSuccess);
    });
  } else {
    fallbackCopy(url, showSuccess);
  }
}

function createBlockAnchorButton(sectionId, blockId, titleText) {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'block-anchor-button';
  var targetLabel = titleText ? ' ל' + titleText : '';
  btn.setAttribute('aria-label', 'העתקת קישור ישיר' + targetLabel);
  btn.setAttribute('title', 'העתקת קישור ישיר');

  var icon = document.createElement('span');
  icon.className = 'block-anchor-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🔗';
  btn.appendChild(icon);

  var feedback = document.createElement('span');
  feedback.className = 'block-anchor-feedback sr-only';
  feedback.setAttribute('aria-live', 'polite');
  btn.appendChild(feedback);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    copyBlockLink(sectionId, blockId, btn, titleText);
  });

  return btn;
}

function highlightAndScrollToBlock(blockId) {
  if (!blockId) return;

  setTimeout(function () {
    var el = document.getElementById(blockId);
    if (!el) return;

    // Check if target is inside a collapsed QA card
    var qaCard = el.closest('.qa-card');
    if (qaCard && !qaCard.classList.contains('qa-open')) {
      qaCard.classList.add('qa-open');
      var qaBtn = qaCard.querySelector('.qa-toggle-btn');
      if (qaBtn) {
        qaBtn.setAttribute('aria-expanded', 'true');
        qaBtn.textContent = 'הסתר תשובה';
      }
      var qaAns = qaCard.querySelector('.qa-answer');
      if (qaAns) {
        qaAns.hidden = false;
        qaAns.setAttribute('aria-hidden', 'false');
      }
    }

    // Check if target is inside a collapsed interviewAnswer card
    var interviewCard = el.closest('.interview-answer-card');
    if (interviewCard && !interviewCard.classList.contains('is-expanded')) {
      interviewCard.classList.add('is-expanded');
      var fullToggle = interviewCard.querySelector('.interview-answer-toggle');
      if (fullToggle) {
        fullToggle.setAttribute('aria-expanded', 'true');
        fullToggle.textContent = 'הסתר תשובה מלאה';
      }
      var fullAns = interviewCard.querySelector('.interview-answer-full');
      if (fullAns) {
        fullAns.hidden = false;
        fullAns.setAttribute('aria-hidden', 'false');
      }
    }

    // Check if target is inside a tab panel that is currently hidden
    var tabPanel = el.closest('.tab-panel');
    if (tabPanel && tabPanel.hidden) {
      var tabsContainer = tabPanel.closest('.tabs-block');
      if (tabsContainer) {
        var panels = Array.from(tabsContainer.querySelectorAll('.tab-panel'));
        var panelIdx = panels.indexOf(tabPanel);
        var buttons = tabsContainer.querySelectorAll('.tab-button');
        if (buttons[panelIdx]) {
          buttons[panelIdx].click();
        }
      }
    }

    updateReadingProgress();

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('block-highlight', 'block-target-highlight');
    void el.offsetWidth;
    el.classList.add('block-target-highlight');
    setTimeout(function () {
      el.classList.remove('block-target-highlight');
    }, 2600);
  }, 200);
}

function navigateToSearchResult(sectionId, blockId) {
  if (typeof StudyMode !== 'undefined' && typeof StudyMode.isActive === 'function' && StudyMode.isActive()) {
    StudyMode.exit();
  }
  var resultsContainer = document.getElementById('topic-search-results');
  if (resultsContainer) {
    resultsContainer.hidden = true;
  }
  closeMobileTocDrawer();

  var targetHash = '#' + sectionId + (blockId ? '?block=' + blockId : '');
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    highlightAndScrollToBlock(blockId);
  }
}

function renderSearchControl() {
  var existing = document.getElementById('topic-search');
  if (existing) {
    return existing;
  }

  var topicMain = document.querySelector('.topic-main');
  var sectionLayout = document.querySelector('.section-layout');
  if (!topicMain || !sectionLayout) {
    return null;
  }

  var container = document.createElement('div');
  container.id = 'topic-search';
  container.className = 'topic-search';
  container.setAttribute('role', 'search');

  var wrapper = document.createElement('div');
  wrapper.className = 'topic-search-input-wrapper';

  var icon = document.createElement('span');
  icon.className = 'topic-search-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🔍';
  wrapper.appendChild(icon);

  var input = document.createElement('input');
  input.type = 'search';
  input.id = 'topic-search-input';
  input.className = 'topic-search-input';
  input.placeholder = 'חיפוש בנושא הנוכחי...';
  input.setAttribute('aria-label', 'חיפוש בנושא הנוכחי');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'topic-search-results');
  wrapper.appendChild(input);

  var clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.id = 'topic-search-clear';
  clearBtn.className = 'topic-search-clear';
  clearBtn.setAttribute('aria-label', 'ניקוי חיפוש');
  clearBtn.textContent = '×';
  clearBtn.hidden = true;
  wrapper.appendChild(clearBtn);

  var shortcutsBtn = document.createElement('button');
  shortcutsBtn.type = 'button';
  shortcutsBtn.id = 'shortcuts-help-button';
  shortcutsBtn.className = 'shortcuts-help-button';
  shortcutsBtn.setAttribute('aria-label', 'קיצורי מקשים');
  shortcutsBtn.setAttribute('title', 'קיצורי מקשים (?)');
  shortcutsBtn.textContent = '⌨️ קיצורים (?)';
  shortcutsBtn.addEventListener('click', function () {
    if (typeof TopicShortcuts !== 'undefined' && typeof TopicShortcuts.openHelpDialog === 'function') {
      TopicShortcuts.openHelpDialog();
    }
  });
  wrapper.appendChild(shortcutsBtn);

  var statusEl = document.createElement('div');
  statusEl.id = 'topic-search-status';
  statusEl.className = 'topic-search-status sr-only';
  statusEl.setAttribute('aria-live', 'polite');

  var resultsList = document.createElement('div');
  resultsList.id = 'topic-search-results';
  resultsList.className = 'topic-search-results';
  resultsList.setAttribute('role', 'listbox');
  resultsList.hidden = true;

  container.appendChild(wrapper);
  container.appendChild(statusEl);
  container.appendChild(resultsList);

  topicMain.insertBefore(container, sectionLayout);

  var focusedIndex = -1;

  function updateActiveDescendant(items) {
    items.forEach(function (el, i) {
      if (i === focusedIndex) {
        el.classList.add('is-focused');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('is-focused');
      }
    });
  }

  function doSearch(query) {
    var trimmed = (query || '').trim();
    clearBtn.hidden = trimmed.length === 0;
    focusedIndex = -1;

    if (trimmed.length < 2) {
      resultsList.hidden = true;
      clearElement(resultsList);
      statusEl.textContent = '';
      return;
    }

    var lower = trimmed.toLowerCase();
    var matches = [];

    for (var i = 0; i < topicSearchIndex.length; i++) {
      var item = topicSearchIndex[i];
      var idx = item.text.toLowerCase().indexOf(lower);
      if (idx !== -1) {
        matches.push({
          item: item,
          matchIndex: idx,
          queryLength: trimmed.length
        });
        if (matches.length >= 30) {
          break;
        }
      }
    }

    clearElement(resultsList);

    if (matches.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'topic-search-empty';
      emptyEl.textContent = 'לא נמצאו תוצאות עבור "' + trimmed + '"';
      resultsList.appendChild(emptyEl);
      resultsList.hidden = false;
      statusEl.textContent = 'לא נמצאו תוצאות';
      return;
    }

    statusEl.textContent = 'נמצאו ' + matches.length + ' תוצאות';

    matches.forEach(function (matchData, mIdx) {
      var itm = matchData.item;
      var itemEl = document.createElement('div');
      itemEl.className = 'topic-search-result';
      itemEl.setAttribute('role', 'option');
      itemEl.setAttribute('tabindex', '-1');
      itemEl.id = 'search-result-' + mIdx;

      var meta = document.createElement('div');
      meta.className = 'topic-search-result-meta';

      var secTitle = document.createElement('span');
      secTitle.className = 'topic-search-result-section';
      secTitle.textContent = itm.sectionTitle;
      meta.appendChild(secTitle);

      var badge = document.createElement('span');
      badge.className = 'topic-search-result-badge';
      badge.textContent = getBlockTypeLabel(itm.blockType);
      meta.appendChild(badge);

      itemEl.appendChild(meta);

      var snippet = createSnippetElement(itm.text, matchData.matchIndex, matchData.queryLength);
      itemEl.appendChild(snippet);

      itemEl.addEventListener('click', function () {
        navigateToSearchResult(itm.sectionId, itm.blockId);
      });

      resultsList.appendChild(itemEl);
    });

    resultsList.hidden = false;
  }

  input.addEventListener('input', function () {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(function () {
      doSearch(input.value);
    }, 200);
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    doSearch('');
    input.focus();
  });

  input.addEventListener('keydown', function (e) {
    var resultItems = resultsList.querySelectorAll('.topic-search-result');
    var count = resultItems.length;

    if (e.key === 'ArrowDown') {
      if (count > 0) {
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % count;
        updateActiveDescendant(resultItems);
      }
    } else if (e.key === 'ArrowUp') {
      if (count > 0) {
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + count) % count;
        updateActiveDescendant(resultItems);
      }
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < count) {
        e.preventDefault();
        resultItems[focusedIndex].click();
      }
    } else if (e.key === 'Escape') {
      resultsList.hidden = true;
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) {
      resultsList.hidden = true;
    }
  });

  return container;
}

/* --------------------------------------------------------------------------
   Table of Contents & Subtopic navigation (#section-list + mobile drawer)
   -------------------------------------------------------------------------- */

function ensureMobileTocDrawer(topicData) {
  var drawer = document.getElementById('topic-toc-drawer');
  var overlay = document.getElementById('topic-toc-overlay');

  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'topic-toc-drawer';
    drawer.className = 'topic-toc-drawer';

    var header = document.createElement('div');
    header.className = 'topic-toc-drawer-header';

    var title = document.createElement('h3');
    title.className = 'topic-toc-drawer-title';
    title.textContent = 'תוכן עניינים';
    header.appendChild(title);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'topic-toc-drawer-close';
    closeBtn.setAttribute('aria-label', 'סגירת תוכן עניינים');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closeMobileTocDrawer);
    header.appendChild(closeBtn);

    var drawerList = document.createElement('ul');
    drawerList.id = 'topic-toc-drawer-list';
    drawerList.className = 'topic-toc-drawer-list';

    drawer.appendChild(header);
    drawer.appendChild(drawerList);
    document.body.appendChild(drawer);
  }

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'topic-toc-overlay';
    overlay.className = 'topic-toc-overlay';
    overlay.addEventListener('click', closeMobileTocDrawer);
    document.body.appendChild(overlay);
  }

  // Ensure Mobile Toggle Button before .section-body
  var toggleBtn = document.getElementById('topic-toc-mobile-toggle');
  if (!toggleBtn) {
    var sectionBody = document.querySelector('.section-body');
    if (sectionBody) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.id = 'topic-toc-mobile-toggle';
      toggleBtn.className = 'topic-toc-mobile-toggle';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-controls', 'topic-toc-drawer');
      toggleBtn.setAttribute('aria-label', 'פתיחת תוכן עניינים');

      var toggleText = document.createElement('span');
      toggleText.textContent = '📑 תוכן עניינים';
      var toggleIcon = document.createElement('span');
      toggleIcon.setAttribute('aria-hidden', 'true');
      toggleIcon.textContent = '◀';

      toggleBtn.appendChild(toggleText);
      toggleBtn.appendChild(toggleIcon);

      toggleBtn.addEventListener('click', function () {
        if (drawer.classList.contains('is-open')) {
          closeMobileTocDrawer();
        } else {
          openMobileTocDrawer();
        }
      });

      sectionBody.insertBefore(toggleBtn, sectionBody.firstChild);
    }
  }

  return { drawer: drawer, overlay: overlay, toggle: toggleBtn };
}

function openMobileTocDrawer() {
  var drawer = document.getElementById('topic-toc-drawer');
  var overlay = document.getElementById('topic-toc-overlay');
  var toggle = document.getElementById('topic-toc-mobile-toggle');
  if (drawer) drawer.classList.add('is-open');
  if (overlay) overlay.classList.add('is-open');
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

function closeMobileTocDrawer() {
  var drawer = document.getElementById('topic-toc-drawer');
  var overlay = document.getElementById('topic-toc-overlay');
  var toggle = document.getElementById('topic-toc-mobile-toggle');
  if (drawer) drawer.classList.remove('is-open');
  if (overlay) overlay.classList.remove('is-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var drawer = document.getElementById('topic-toc-drawer');
    if (drawer && drawer.classList.contains('is-open')) {
      closeMobileTocDrawer();
      var toggle = document.getElementById('topic-toc-mobile-toggle');
      if (toggle) toggle.focus();
    }
  }
});

function renderSectionNav(topicData, activeId) {
  var nav = document.querySelector('.section-nav');
  if (nav) {
    nav.classList.add('topic-toc');
    var navTitle = nav.querySelector('.section-nav-title');
    if (navTitle) {
      navTitle.classList.add('topic-toc-header');
    }
  }

  var list = document.getElementById('section-list');
  if (list) {
    list.classList.add('topic-toc-list');
    clearElement(list);

    topicData.sections.forEach(function (section, idx) {
      var item = document.createElement('li');
      item.className = 'topic-toc-item';

      var link = document.createElement('a');
      link.className = 'section-link topic-toc-link';
      link.href = '#' + section.id;

      var numSpan = document.createElement('span');
      numSpan.className = 'topic-toc-number';
      numSpan.textContent = (idx + 1) + '.';
      link.appendChild(numSpan);

      var textSpan = document.createElement('span');
      textSpan.className = 'topic-toc-text';
      textSpan.textContent = section.title;
      link.appendChild(textSpan);

      if (section.id === activeId) {
        link.classList.add('active', 'topic-toc-active');
        link.setAttribute('aria-current', 'page');
      }

      item.appendChild(link);
      list.appendChild(item);
    });
  }

  // Update mobile drawer items
  ensureMobileTocDrawer(topicData);
  var drawerList = document.getElementById('topic-toc-drawer-list');
  if (drawerList) {
    clearElement(drawerList);
    topicData.sections.forEach(function (section, idx) {
      var item = document.createElement('li');
      item.className = 'topic-toc-item';

      var link = document.createElement('a');
      link.className = 'section-link topic-toc-link';
      link.href = '#' + section.id;

      var numSpan = document.createElement('span');
      numSpan.className = 'topic-toc-number';
      numSpan.textContent = (idx + 1) + '.';
      link.appendChild(numSpan);

      var textSpan = document.createElement('span');
      textSpan.className = 'topic-toc-text';
      textSpan.textContent = section.title;
      link.appendChild(textSpan);

      if (section.id === activeId) {
        link.classList.add('active', 'topic-toc-active');
        link.setAttribute('aria-current', 'page');
      }

      link.addEventListener('click', function () {
        closeMobileTocDrawer();
      });

      item.appendChild(link);
      drawerList.appendChild(item);
    });
  }
}

/* --------------------------------------------------------------------------
   Section title (#section-title)
   -------------------------------------------------------------------------- */

function renderSectionTitle(title, sectionId) {
  var titleEl = document.getElementById('section-title');
  if (!titleEl) {
    return;
  }
  clearElement(titleEl);

  var textSpan = document.createElement('span');
  textSpan.textContent = title || '';
  titleEl.appendChild(textSpan);

  var secId = sectionId || topicPageState.activeSectionId;
  if (secId) {
    titleEl.classList.add('block-anchor-wrapper');
    var anchorBtn = createBlockAnchorButton(secId, null, title);
    titleEl.appendChild(anchorBtn);
  }
}

/* --------------------------------------------------------------------------
   Section content blocks (#section-content)
   -------------------------------------------------------------------------- */

function buildParagraphBlock(block) {
  var p = document.createElement('p');
  p.className = 'content-block content-paragraph';
  p.textContent = block.text || '';
  return p;
}

function buildHeadingBlock(block, context) {
  var level = block.level;
  if (typeof level !== 'number' || level < 2 || level > 6) {
    level = 3;
  }
  var heading = document.createElement('h' + level);
  heading.className = 'content-block content-heading block-anchor-wrapper';

  var textSpan = document.createElement('span');
  textSpan.textContent = block.text || '';
  heading.appendChild(textSpan);

  if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, block.text);
    heading.appendChild(anchorBtn);
  }

  return heading;
}

var componentIdCounter = 0;
function getUniqueId(prefix) {
  componentIdCounter += 1;
  return (prefix || 'component') + '-' + componentIdCounter;
}

function buildBulletListBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ buildBulletListBlock: invalid block object', block);
    return null;
  }

  var items = Array.isArray(block.items) ? block.items : [];
  if (items.length === 0) {
    console.warn('⚠️ buildBulletListBlock: empty or missing items array', block);
    return null;
  }

  var validVariants = ['default', 'pros', 'cons', 'check', 'warning', 'numbered'];
  var variant = 'default';
  if (block.variant && typeof block.variant === 'string') {
    var reqVariant = block.variant.trim().toLowerCase();
    if (validVariants.indexOf(reqVariant) !== -1) {
      variant = reqVariant;
    } else {
      console.warn('⚠️ buildBulletListBlock: unknown variant "' + block.variant + '", falling back to default', block);
    }
  }

  var isNumbered = variant === 'numbered';
  var list = document.createElement(isNumbered ? 'ol' : 'ul');
  list.className = 'content-block content-bullet-list styled-list styled-list-' + variant;

  items.forEach(function (itemText) {
    if (itemText == null) return;
    var itemStr = typeof itemText === 'string' ? itemText : String(itemText);
    if (!itemStr.trim()) return;
    var item = document.createElement('li');
    item.className = 'styled-list-item';
    item.textContent = itemStr;
    list.appendChild(item);
  });

  if (typeof block.title === 'string' && block.title.trim()) {
    var wrapper = document.createElement('div');
    wrapper.className = 'content-block styled-list-wrapper';

    var title = document.createElement('h5');
    title.className = 'styled-list-title';
    title.textContent = block.title.trim();
    wrapper.appendChild(title);

    list.classList.remove('content-block');
    wrapper.appendChild(list);
    return wrapper;
  }

  return list;
}

function buildCodeBlock(block, context) {
  var card = document.createElement('div');
  card.className = 'content-block code-editor-card';

  var header = document.createElement('div');
  header.className = 'code-editor-header';

  var language = document.createElement('span');
  language.className = 'code-editor-language';
  var rawLang = (block.language || '').trim();
  language.textContent = rawLang.toUpperCase();
  if (!rawLang) {
    language.hidden = true;
  }
  header.appendChild(language);

  var showCopyButton = block.showCopyButton !== false;
  if (showCopyButton) {
    var copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'code-editor-copy-button';
    copyButton.textContent = 'העתקה';
    copyButton.setAttribute('aria-label', 'העתקת קוד ללוח');
    header.appendChild(copyButton);

    copyButton.addEventListener('click', function () {
      copyCodeToClipboard(block.code || '', copyButton);
    });
  }

  if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, block.language ? 'קוד ' + block.language : 'קוד');
    header.appendChild(anchorBtn);
  }

  card.appendChild(header);

  var editorContainer = document.createElement('div');
  editorContainer.className = 'code-editor-container';
  card.appendChild(editorContainer);

  var codeOptions = {
    code: block.code || '',
    language: block.language || '',
    editable: block.editable === true,
    showLineNumbers: block.showLineNumbers !== false,
    showCopyButton: showCopyButton
  };

  if (typeof CodeBlockEditor !== 'undefined' && typeof CodeBlockEditor.render === 'function') {
    CodeBlockEditor.render(editorContainer, codeOptions);
  } else {
    var fallbackPre = document.createElement('pre');
    fallbackPre.className = 'code-editor-fallback';
    var fallbackCode = document.createElement('code');
    fallbackCode.textContent = block.code || '';
    fallbackPre.appendChild(fallbackCode);
    editorContainer.appendChild(fallbackPre);
  }

  return card;
}

// Copies text to the clipboard using the modern Clipboard API when
// available, falling back to a hidden textarea + execCommand for older or
// restricted contexts. Shows brief success feedback on the button either
// way; silently leaves the button unchanged if both methods fail.
function copyTextToClipboard(text, buttonEl, successLabel) {
  var successText = successLabel || 'הועתק!';
  function showCopied() {
    var originalLabel = buttonEl.textContent;
    buttonEl.textContent = successText;
    buttonEl.classList.add('is-copied');
    setTimeout(function () {
      buttonEl.textContent = originalLabel;
      buttonEl.classList.remove('is-copied');
    }, 1500);
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      navigator.clipboard.writeText(text).then(showCopied, function () {
        fallbackCopy(text, showCopied);
      });
    } catch (e) {
      fallbackCopy(text, showCopied);
    }
  } else {
    fallbackCopy(text, showCopied);
  }
}

function copyCodeToClipboard(text, buttonEl) {
  copyTextToClipboard(text, buttonEl, 'הועתק!');
}

function fallbackCopy(text, onSuccess) {
  try {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    if (textarea.style) {
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
    }
    if (document.body) {
      document.body.appendChild(textarea);
    }
    if (typeof textarea.select === 'function') {
      textarea.select();
    }
    if (document.execCommand && document.execCommand('copy')) {
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }
    if (document.body && textarea.parentNode === document.body) {
      document.body.removeChild(textarea);
    }
  } catch (copyError) {
    // Copying is unsupported in this context; leave the button as-is.
  }
}

var CALLOUT_DEFAULTS = {
  info: { label: 'Info', icon: 'ℹ' },
  tip: { label: 'Tip', icon: '💡' },
  warning: { label: 'Warning', icon: '⚠️' },
  danger: { label: 'Important', icon: '⛔' },
  interview: { label: 'Interview', icon: '🎯' },
  senior: { label: 'Senior point', icon: '⚡' },
  remember: { label: 'Remember', icon: '📌' }
};

function buildCalloutBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ buildCalloutBlock: invalid block object', block);
    return null;
  }

  var text = typeof block.text === 'string' ? block.text.trim() : '';
  if (!text) {
    console.warn('⚠️ buildCalloutBlock: missing text', block);
    return null;
  }

  var variant = 'info';
  if (block.variant && typeof block.variant === 'string') {
    var reqVariant = block.variant.trim().toLowerCase();
    if (CALLOUT_DEFAULTS[reqVariant]) {
      variant = reqVariant;
    } else {
      console.warn('⚠️ buildCalloutBlock: unknown variant "' + block.variant + '", falling back to default info', block);
    }
  }

  var config = CALLOUT_DEFAULTS[variant];

  var callout = document.createElement('div');
  callout.className = 'content-block content-callout callout callout-' + variant + ' content-callout-' + variant;

  var header = document.createElement('div');
  header.className = 'callout-header';

  var icon = document.createElement('span');
  icon.className = 'callout-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = config.icon;
  header.appendChild(icon);

  var label = document.createElement('span');
  label.className = 'callout-label';
  var displayTitle = (typeof block.title === 'string' && block.title.trim()) ? block.title.trim() : config.label;
  label.textContent = displayTitle;
  header.appendChild(label);

  callout.appendChild(header);

  var textEl = document.createElement('p');
  textEl.className = 'callout-content';
  textEl.textContent = text;
  callout.appendChild(textEl);

  return callout;
}

function buildQaBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ buildQaBlock: invalid block object', block);
    return null;
  }

  var questionText = typeof block.question === 'string' ? block.question.trim() : '';
  var answerText = typeof block.answer === 'string' ? block.answer.trim() : '';

  if (!questionText && !answerText) {
    console.warn('⚠️ buildQaBlock: missing both question and answer', block);
    return null;
  }

  var isOpen = block.initiallyOpen === true;
  var ansId = getUniqueId('qa-answer');

  var card = document.createElement('div');
  card.className = 'content-block content-qa qa-flashcard';
  if (isOpen) {
    card.classList.add('qa-open');
  }

  var header = document.createElement('div');
  header.className = 'qa-header';

  var labelSpan = document.createElement('span');
  labelSpan.className = 'qa-label';
  labelSpan.textContent = (typeof block.label === 'string' && block.label.trim()) ? block.label.trim() : 'שאלת תרגול';
  header.appendChild(labelSpan);

  var questionEl = document.createElement('h4');
  questionEl.className = 'qa-question';
  questionEl.textContent = questionText;
  header.appendChild(questionEl);

  var toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'qa-toggle';
  toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  toggleBtn.setAttribute('aria-controls', ansId);
  toggleBtn.textContent = isOpen ? 'הסתר תשובה' : 'הצג תשובה';
  header.appendChild(toggleBtn);

  card.appendChild(header);

  var answerEl = document.createElement('div');
  answerEl.id = ansId;
  answerEl.className = 'qa-answer';
  answerEl.hidden = !isOpen;
  answerEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

  var answerInner = document.createElement('div');
  answerInner.className = 'qa-answer-inner';
  answerInner.textContent = answerText;
  answerEl.appendChild(answerInner);

  card.appendChild(answerEl);

  function toggleAnswer() {
    var currentlyOpen = card.classList.contains('qa-open');
    if (currentlyOpen) {
      card.classList.remove('qa-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = 'הצג תשובה';
      answerEl.hidden = true;
      answerEl.setAttribute('aria-hidden', 'true');
    } else {
      card.classList.add('qa-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.textContent = 'הסתר תשובה';
      answerEl.hidden = false;
      answerEl.setAttribute('aria-hidden', 'false');
    }
    updateReadingProgress();
  }

  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleAnswer();
  });

  header.addEventListener('click', function () {
    toggleAnswer();
  });

  return card;
}

function renderDefinitionBlock(block, context) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderDefinitionBlock: invalid block object', block);
    return null;
  }

  var term = typeof block.term === 'string' ? block.term.trim() : '';
  var text = typeof block.text === 'string' ? block.text.trim() : '';

  if (!term && !text) {
    console.warn('⚠️ renderDefinitionBlock: missing term and text', block);
    return null;
  }

  var card = document.createElement('div');
  card.className = 'content-block definition-card';

  var header = document.createElement('div');
  header.className = 'definition-header';

  var label = document.createElement('span');
  label.className = 'definition-label';
  label.textContent = (typeof block.label === 'string' && block.label.trim()) ? block.label.trim() : 'Definition';
  header.appendChild(label);

  var icon = document.createElement('span');
  icon.className = 'definition-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '💡';
  header.appendChild(icon);

  if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, term || block.label || 'הגדרה');
    header.appendChild(anchorBtn);
  }

  card.appendChild(header);

  if (term) {
    var termEl = document.createElement('h4');
    termEl.className = 'definition-term';
    termEl.textContent = term;
    card.appendChild(termEl);
  }

  if (text) {
    var textEl = document.createElement('p');
    textEl.className = 'definition-text';
    textEl.textContent = text;
    card.appendChild(textEl);
  }

  if (typeof block.example === 'string' && block.example.trim()) {
    var exampleEl = document.createElement('div');
    exampleEl.className = 'definition-example';

    var exampleLabel = document.createElement('span');
    exampleLabel.className = 'definition-example-label';
    exampleLabel.textContent = 'דוגמה: ';
    exampleEl.appendChild(exampleLabel);

    var exampleText = document.createElement('span');
    exampleText.className = 'definition-example-text';
    exampleText.textContent = block.example.trim();
    exampleEl.appendChild(exampleText);

    card.appendChild(exampleEl);
  }

  return card;
}

function renderComparisonBlock(block, context) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderComparisonBlock: invalid block object', block);
    return null;
  }

  if (!Array.isArray(block.columns) || block.columns.length === 0) {
    console.warn('⚠️ renderComparisonBlock: missing or empty columns array', block);
    return null;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'content-block comparison-block';

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleWrapper = document.createElement('div');
    titleWrapper.className = 'comparison-title-wrapper block-anchor-wrapper';

    var title = document.createElement('h4');
    title.className = 'comparison-title';
    title.textContent = block.title.trim();
    titleWrapper.appendChild(title);

    if (context && context.blockId) {
      var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, block.title.trim());
      titleWrapper.appendChild(anchorBtn);
    }

    wrapper.appendChild(titleWrapper);
  } else if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, 'השוואה');
    wrapper.classList.add('block-anchor-wrapper');
    wrapper.appendChild(anchorBtn);
  }

  var grid = document.createElement('div');
  grid.className = 'comparison-grid';

  var validVariants = ['positive', 'negative', 'warning', 'neutral'];

  block.columns.forEach(function (col) {
    if (!col || typeof col !== 'object') {
      return;
    }

    var colCard = document.createElement('div');
    colCard.className = 'comparison-column';

    if (col.variant && typeof col.variant === 'string') {
      var variantKey = col.variant.trim().toLowerCase();
      if (validVariants.indexOf(variantKey) !== -1) {
        colCard.classList.add('comparison-column-' + variantKey);
      }
    }

    var colHeader = document.createElement('div');
    colHeader.className = 'comparison-column-header';

    if (typeof col.title === 'string' && col.title.trim()) {
      var colTitle = document.createElement('h5');
      colTitle.className = 'comparison-column-title';
      colTitle.textContent = col.title.trim();
      colHeader.appendChild(colTitle);
    }

    if (typeof col.subtitle === 'string' && col.subtitle.trim()) {
      var colSubtitle = document.createElement('p');
      colSubtitle.className = 'comparison-column-subtitle';
      colSubtitle.textContent = col.subtitle.trim();
      colHeader.appendChild(colSubtitle);
    }

    colCard.appendChild(colHeader);

    var itemsList = document.createElement('ul');
    itemsList.className = 'comparison-items';

    var items = Array.isArray(col.items) ? col.items : [];
    items.forEach(function (item) {
      var itemText = typeof item === 'string' ? item.trim() : (item && typeof item === 'object' && item.text ? String(item.text).trim() : '');
      if (itemText) {
        var li = document.createElement('li');
        li.className = 'comparison-item';
        li.textContent = itemText;
        itemsList.appendChild(li);
      }
    });

    colCard.appendChild(itemsList);
    grid.appendChild(colCard);
  });

  if (!grid.children.length) {
    console.warn('⚠️ renderComparisonBlock: no valid columns rendered', block);
    return null;
  }

  wrapper.appendChild(grid);
  return wrapper;
}

function renderStepsBlock(block, context) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderStepsBlock: invalid block object', block);
    return null;
  }

  if (!Array.isArray(block.items) || block.items.length === 0) {
    console.warn('⚠️ renderStepsBlock: missing or empty items array', block);
    return null;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'content-block steps-block';

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleWrapper = document.createElement('div');
    titleWrapper.className = 'steps-title-wrapper block-anchor-wrapper';

    var title = document.createElement('h4');
    title.className = 'steps-title';
    title.textContent = block.title.trim();
    titleWrapper.appendChild(title);

    if (context && context.blockId) {
      var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, block.title.trim());
      titleWrapper.appendChild(anchorBtn);
    }

    wrapper.appendChild(titleWrapper);
  } else if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, 'שלבים');
    wrapper.classList.add('block-anchor-wrapper');
    wrapper.appendChild(anchorBtn);
  }

  var list = document.createElement('ol');
  list.className = 'steps-list';

  var renderedCount = 0;

  block.items.forEach(function (item) {
    if (!item) {
      return;
    }

    var stepItem = document.createElement('li');
    stepItem.className = 'step-item';

    renderedCount += 1;
    var stepNumber = document.createElement('div');
    stepNumber.className = 'step-number';
    stepNumber.setAttribute('aria-hidden', 'true');
    stepNumber.textContent = String(renderedCount);
    stepItem.appendChild(stepNumber);

    var stepContent = document.createElement('div');
    stepContent.className = 'step-content';

    if (typeof item === 'string') {
      var stepText = document.createElement('p');
      stepText.className = 'step-text';
      stepText.textContent = item.trim();
      stepContent.appendChild(stepText);
    } else if (typeof item === 'object') {
      if (typeof item.title === 'string' && item.title.trim()) {
        var stepTitle = document.createElement('h5');
        stepTitle.className = 'step-title';
        stepTitle.textContent = item.title.trim();
        stepContent.appendChild(stepTitle);
      }
      if (typeof item.text === 'string' && item.text.trim()) {
        var stepTextObj = document.createElement('p');
        stepTextObj.className = 'step-text';
        stepTextObj.textContent = item.text.trim();
        stepContent.appendChild(stepTextObj);
      }
    }

    stepItem.appendChild(stepContent);
    list.appendChild(stepItem);
  });

  if (renderedCount === 0) {
    console.warn('⚠️ renderStepsBlock: no valid steps items rendered', block);
    return null;
  }

  wrapper.appendChild(list);
  return wrapper;
}

function renderInterviewAnswerBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderInterviewAnswerBlock: invalid block object', block);
    return null;
  }

  var question = typeof block.question === 'string' ? block.question.trim() : '';
  var shortAnswer = typeof block.shortAnswer === 'string' ? block.shortAnswer.trim() : '';
  var fullAnswer = typeof block.fullAnswer === 'string' ? block.fullAnswer.trim() : '';

  if (!question) {
    console.warn('⚠️ renderInterviewAnswerBlock: missing question', block);
    return null;
  }

  if (!shortAnswer && !fullAnswer) {
    console.warn('⚠️ renderInterviewAnswerBlock: missing both shortAnswer and fullAnswer', block);
    return null;
  }

  var isExpanded = block.initiallyExpanded === true;
  var fullAnsId = getUniqueId('interview-full');

  var card = document.createElement('div');
  card.className = 'content-block interview-answer-card';
  if (isExpanded) {
    card.classList.add('is-expanded');
  }

  // Header with Label, Level, and Tags
  var header = document.createElement('div');
  header.className = 'interview-answer-header';

  var headerMeta = document.createElement('div');
  headerMeta.className = 'interview-answer-meta';

  var label = document.createElement('span');
  label.className = 'interview-answer-label';
  label.textContent = 'שאלת ראיון';
  headerMeta.appendChild(label);

  if (typeof block.level === 'string' && block.level.trim()) {
    var level = document.createElement('span');
    level.className = 'interview-answer-level';
    level.textContent = block.level.trim();
    headerMeta.appendChild(level);
  }

  if (Array.isArray(block.tags) && block.tags.length > 0) {
    var tagsContainer = document.createElement('div');
    tagsContainer.className = 'interview-answer-tags';
    block.tags.forEach(function (tag) {
      if (typeof tag === 'string' && tag.trim()) {
        var tagEl = document.createElement('span');
        tagEl.className = 'interview-answer-tag';
        tagEl.textContent = tag.trim();
        tagsContainer.appendChild(tagEl);
      }
    });
    headerMeta.appendChild(tagsContainer);
  }

  header.appendChild(headerMeta);
  card.appendChild(header);

  // Question
  var questionEl = document.createElement('h4');
  questionEl.className = 'interview-answer-question';
  questionEl.textContent = question;
  card.appendChild(questionEl);

  // Short Answer
  if (shortAnswer) {
    var shortEl = document.createElement('div');
    shortEl.className = 'interview-answer-short';

    var shortLabel = document.createElement('span');
    shortLabel.className = 'interview-answer-short-label';
    shortLabel.textContent = 'תשובה תמציתית:';
    shortEl.appendChild(shortLabel);

    var shortText = document.createElement('p');
    shortText.className = 'interview-answer-short-text';
    shortText.textContent = shortAnswer;
    shortEl.appendChild(shortText);

    card.appendChild(shortEl);
  }

  // Full Answer (Collapsible)
  var fullEl = document.createElement('div');
  fullEl.id = fullAnsId;
  fullEl.className = 'interview-answer-full';
  fullEl.hidden = !isExpanded;
  fullEl.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');

  if (fullAnswer) {
    var fullLabel = document.createElement('span');
    fullLabel.className = 'interview-answer-full-label';
    fullLabel.textContent = 'תשובה מורחבת ומעמיקה:';
    fullEl.appendChild(fullLabel);

    var fullText = document.createElement('p');
    fullText.className = 'interview-answer-full-text';
    fullText.textContent = fullAnswer;
    fullEl.appendChild(fullText);
  }

  card.appendChild(fullEl);

  // Actions Bar
  var actions = document.createElement('div');
  actions.className = 'interview-answer-actions';

  if (fullAnswer) {
    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'interview-answer-toggle';
    toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    toggleBtn.setAttribute('aria-controls', fullAnsId);
    toggleBtn.textContent = isExpanded ? 'הסתר תשובה מלאה' : 'הצג תשובה מלאה';

    toggleBtn.addEventListener('click', function () {
      var currentlyExpanded = card.classList.contains('is-expanded');
      if (currentlyExpanded) {
        card.classList.remove('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.textContent = 'הצג תשובה מלאה';
        fullEl.hidden = true;
        fullEl.setAttribute('aria-hidden', 'true');
      } else {
        card.classList.add('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = 'הסתר תשובה מלאה';
        fullEl.hidden = false;
        fullEl.setAttribute('aria-hidden', 'false');
      }
      updateReadingProgress();
    });

    actions.appendChild(toggleBtn);
  }

  var showCopy = block.showCopyButton === true || (block.showCopyButton !== false && (shortAnswer || fullAnswer));
  if (showCopy) {
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'interview-answer-copy';
    copyBtn.textContent = 'העתקת תשובה';
    copyBtn.setAttribute('aria-label', 'העתקת שאלת ותשובת הראיון ללוח');

    copyBtn.addEventListener('click', function () {
      var fullCopyText = 'שאלה:\n' + question;
      if (shortAnswer) {
        fullCopyText += '\n\nתשובה תמציתית:\n' + shortAnswer;
      }
      if (fullAnswer) {
        fullCopyText += '\n\nתשובה מלאה:\n' + fullAnswer;
      }
      copyTextToClipboard(fullCopyText, copyBtn, 'הועתק!');
    });

    actions.appendChild(copyBtn);
  }

  if (context && context.blockId) {
    var anchorBtn = createBlockAnchorButton(context.sectionId, context.blockId, question);
    actions.appendChild(anchorBtn);
  }

  card.appendChild(actions);

  return card;
}

function renderTableBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderTableBlock: invalid block object', block);
    return null;
  }

  var headers = Array.isArray(block.headers) ? block.headers : [];
  var rows = Array.isArray(block.rows) ? block.rows : [];

  if (headers.length === 0 && rows.length === 0) {
    console.warn('⚠️ renderTableBlock: table has neither headers nor rows', block);
    return null;
  }

  var container = document.createElement('div');
  container.className = 'content-block data-table-block';

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleEl = document.createElement('h5');
    titleEl.className = 'data-table-title';
    titleEl.textContent = block.title.trim();
    container.appendChild(titleEl);
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'data-table-wrapper';

  var table = document.createElement('table');
  table.className = 'data-table';
  if (block.compact === true) {
    table.classList.add('data-table-compact');
  }
  if (block.striped !== false) {
    table.classList.add('data-table-striped');
  }

  if (typeof block.caption === 'string' && block.caption.trim()) {
    var caption = document.createElement('caption');
    caption.className = 'data-table-caption';
    caption.textContent = block.caption.trim();
    table.appendChild(caption);
  }

  if (headers.length > 0) {
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    headers.forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h != null ? String(h) : '';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
  }

  if (rows.length > 0) {
    var tbody = document.createElement('tbody');
    rows.forEach(function (row) {
      if (!Array.isArray(row)) {
        return;
      }
      var tr = document.createElement('tr');
      row.forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = cell != null ? String(cell) : '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  wrapper.appendChild(table);
  container.appendChild(wrapper);
  return container;
}

function renderChecklistBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderChecklistBlock: invalid block object', block);
    return null;
  }

  var rawItems = Array.isArray(block.items) ? block.items : [];
  if (rawItems.length === 0) {
    console.warn('⚠️ renderChecklistBlock: empty items array', block);
    return null;
  }

  var isInteractive = block.interactive !== false;

  var container = document.createElement('div');
  container.className = 'content-block checklist-block';
  if (!isInteractive) {
    container.classList.add('checklist-readonly');
  }

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleEl = document.createElement('h5');
    titleEl.className = 'checklist-title';
    titleEl.textContent = block.title.trim();
    container.appendChild(titleEl);
  }

  var ul = document.createElement('ul');
  ul.className = 'checklist-items';

  var validCount = 0;

  rawItems.forEach(function (itemData) {
    var text = '';
    var isChecked = false;

    if (typeof itemData === 'string') {
      text = itemData.trim();
    } else if (itemData && typeof itemData === 'object') {
      text = typeof itemData.text === 'string' ? itemData.text.trim() : '';
      isChecked = itemData.checked === true;
    }

    if (!text) {
      return;
    }

    validCount++;

    var li = document.createElement('li');
    li.className = 'checklist-item';
    if (isChecked) {
      li.classList.add('checklist-completed');
    }

    var label = document.createElement('label');
    label.className = 'checklist-label';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checklist-checkbox';
    checkbox.checked = isChecked;
    if (!isInteractive) {
      checkbox.disabled = true;
    } else {
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          li.classList.add('checklist-completed');
        } else {
          li.classList.remove('checklist-completed');
        }
      });
    }

    var textSpan = document.createElement('span');
    textSpan.className = 'checklist-text';
    textSpan.textContent = text;

    label.appendChild(checkbox);
    label.appendChild(textSpan);
    li.appendChild(label);
    ul.appendChild(li);
  });

  if (validCount === 0) {
    console.warn('⚠️ renderChecklistBlock: no valid checklist items', block);
    return null;
  }

  container.appendChild(ul);
  return container;
}

function renderFlowBlock(block) {
  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderFlowBlock: invalid block object', block);
    return null;
  }

  var rawItems = Array.isArray(block.items) ? block.items : [];
  if (rawItems.length === 0) {
    console.warn('⚠️ renderFlowBlock: empty items array', block);
    return null;
  }

  var validDirections = ['horizontal', 'vertical'];
  var direction = 'horizontal';
  if (block.direction && typeof block.direction === 'string') {
    var reqDir = block.direction.trim().toLowerCase();
    if (validDirections.indexOf(reqDir) !== -1) {
      direction = reqDir;
    } else {
      console.warn('⚠️ renderFlowBlock: unknown direction "' + block.direction + '", falling back to horizontal', block);
    }
  }

  var container = document.createElement('div');
  container.className = 'content-block flow-block';

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleEl = document.createElement('h5');
    titleEl.className = 'flow-title';
    titleEl.textContent = block.title.trim();
    container.appendChild(titleEl);
  }

  var flowList = document.createElement('div');
  flowList.className = 'flow-list flow-' + direction;

  var validItems = [];
  rawItems.forEach(function (itemData) {
    if (typeof itemData === 'string' && itemData.trim()) {
      validItems.push({ title: itemData.trim(), text: '' });
    } else if (itemData && typeof itemData === 'object') {
      var t = typeof itemData.title === 'string' ? itemData.title.trim() : '';
      var desc = typeof itemData.text === 'string' ? itemData.text.trim() : '';
      if (t || desc) {
        validItems.push({ title: t, text: desc });
      }
    }
  });

  if (validItems.length === 0) {
    console.warn('⚠️ renderFlowBlock: no valid flow items', block);
    return null;
  }

  validItems.forEach(function (nodeData, index) {
    var node = document.createElement('div');
    node.className = 'flow-node';

    if (nodeData.title) {
      var nodeTitle = document.createElement('div');
      nodeTitle.className = 'flow-node-title';
      nodeTitle.textContent = nodeData.title;
      node.appendChild(nodeTitle);
    }

    if (nodeData.text) {
      var nodeText = document.createElement('div');
      nodeText.className = 'flow-node-text';
      nodeText.textContent = nodeData.text;
      node.appendChild(nodeText);
    }

    flowList.appendChild(node);

    if (index < validItems.length - 1) {
      var connector = document.createElement('div');
      connector.className = 'flow-connector';
      connector.setAttribute('aria-hidden', 'true');
      connector.textContent = '←';
      flowList.appendChild(connector);
    }
  });

  container.appendChild(flowList);
  return container;
}

function renderTabsBlock(block, context) {
  if (context && context.inTabs) {
    console.warn('⚠️ renderTabsBlock: nested tabs are not supported');
    var fallback = document.createElement('div');
    fallback.className = 'content-block callout callout-warning';
    var warnText = document.createElement('p');
    warnText.className = 'callout-content';
    warnText.textContent = 'טאבים מקוננים אינם נתמכים.';
    fallback.appendChild(warnText);
    return fallback;
  }

  if (!block || typeof block !== 'object') {
    console.warn('⚠️ renderTabsBlock: invalid block object', block);
    return null;
  }

  var rawTabs = Array.isArray(block.tabs) ? block.tabs : [];
  if (rawTabs.length === 0) {
    console.warn('⚠️ renderTabsBlock: missing or empty tabs array', block);
    return null;
  }

  var container = document.createElement('div');
  container.className = 'content-block tabs-block';

  if (typeof block.title === 'string' && block.title.trim()) {
    var titleEl = document.createElement('h5');
    titleEl.className = 'tabs-title';
    titleEl.textContent = block.title.trim();
    container.appendChild(titleEl);
  }

  var tabsList = document.createElement('div');
  tabsList.className = 'tabs-list';
  tabsList.setAttribute('role', 'tablist');
  tabsList.setAttribute('aria-label', (block.title || 'Tab navigation').trim());

  var panelsContainer = document.createElement('div');
  panelsContainer.className = 'tab-panels';

  var tabGroupId = getUniqueId('tabset');
  var initialIndex = typeof block.initialTab === 'number' && block.initialTab >= 0 && block.initialTab < rawTabs.length ? block.initialTab : 0;

  var tabButtons = [];
  var tabPanels = [];

  rawTabs.forEach(function (tabData, idx) {
    var tabTitle = (tabData && typeof tabData.title === 'string' && tabData.title.trim()) ? tabData.title.trim() : ('טאב ' + (idx + 1));
    var tabId = tabGroupId + '-tab-' + idx;
    var panelId = tabGroupId + '-panel-' + idx;
    var isActive = idx === initialIndex;

    // Tab Button
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab-button' + (isActive ? ' tab-button-active' : '');
    btn.id = tabId;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    btn.textContent = tabTitle;

    tabsList.appendChild(btn);
    tabButtons.push(btn);

    // Tab Panel
    var panel = document.createElement('div');
    panel.className = 'tab-panel' + (isActive ? ' tab-panel-active' : '');
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = !isActive;
    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

    var contentBlocks = (tabData && Array.isArray(tabData.content)) ? tabData.content : [];
    contentBlocks.forEach(function (subBlock) {
      var subEl = renderBlock(subBlock, { inTabs: true });
      if (subEl) {
        panel.appendChild(subEl);
      }
    });

    panelsContainer.appendChild(panel);
    tabPanels.push(panel);
  });

  function switchTab(newIndex) {
    if (newIndex < 0 || newIndex >= tabButtons.length) return;

    tabButtons.forEach(function (btn, i) {
      var isNowActive = i === newIndex;
      btn.classList.toggle('tab-button-active', isNowActive);
      btn.setAttribute('aria-selected', isNowActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isNowActive ? '0' : '-1');
    });

    tabPanels.forEach(function (pnl, i) {
      var isNowActive = i === newIndex;
      pnl.classList.toggle('tab-panel-active', isNowActive);
      pnl.hidden = !isNowActive;
      pnl.setAttribute('aria-hidden', isNowActive ? 'false' : 'true');
    });

    tabButtons[newIndex].focus();

    // Trigger window resize so any CodeMirror instance inside freshly visible tab adjusts its geometry
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }

    updateReadingProgress();
  }

  tabButtons.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      switchTab(idx);
    });

    btn.addEventListener('keydown', function (e) {
      var count = tabButtons.length;
      var targetIdx = -1;

      if (e.key === 'ArrowRight') {
        targetIdx = (idx + 1) % count;
      } else if (e.key === 'ArrowLeft') {
        targetIdx = (idx - 1 + count) % count;
      } else if (e.key === 'Home') {
        targetIdx = 0;
      } else if (e.key === 'End') {
        targetIdx = count - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchTab(idx);
        return;
      }

      if (targetIdx !== -1) {
        e.preventDefault();
        switchTab(targetIdx);
      }
    });
  });

  container.appendChild(tabsList);
  container.appendChild(panelsContainer);
  return container;
}

var blockBuilders = {
  paragraph: buildParagraphBlock,
  heading: buildHeadingBlock,
  bulletList: buildBulletListBlock,
  code: buildCodeBlock,
  callout: buildCalloutBlock,
  qa: buildQaBlock,
  definition: renderDefinitionBlock,
  comparison: renderComparisonBlock,
  steps: renderStepsBlock,
  interviewAnswer: renderInterviewAnswerBlock,
  table: renderTableBlock,
  checklist: renderChecklistBlock,
  flow: renderFlowBlock,
  tabs: renderTabsBlock
};

function renderBlock(block, context) {
  if (!block || typeof block !== 'object' || !block.type) {
    return null;
  }
  var builder = blockBuilders[block.type];
  if (!builder) {
    console.warn('⚠️ Unknown block type: ' + block.type, block);
    return null;
  }
  try {
    return builder(block, context);
  } catch (err) {
    console.warn('⚠️ Error rendering block of type ' + block.type + ':', err);
    return null;
  }
}
window.renderBlock = renderBlock;

function renderStudyModeToggle(sectionId, title, blocks) {
  var existingBtn = document.getElementById('study-mode-toggle-btn') || document.getElementById('focus-mode-toggle-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  var validBlocks = Array.isArray(blocks) ? blocks.filter(function (b) {
    return b && typeof b === 'object' && typeof b.type === 'string';
  }) : [];

  if (validBlocks.length === 0) {
    return;
  }

  // If FocusMode is available, check if section yields valid cards
  var FocusApi = (typeof FocusMode !== 'undefined') ? FocusMode : (typeof StudyMode !== 'undefined' ? StudyMode : null);
  if (FocusApi && typeof FocusApi.buildFocusCards === 'function') {
    var cards = FocusApi.buildFocusCards(validBlocks, title);
    if (cards.length === 0) {
      return;
    }
  }

  var titleEl = document.getElementById('section-title');
  if (!titleEl || !titleEl.parentNode) {
    return;
  }

  var headerRow = titleEl.parentNode.querySelector('.section-header-row');
  if (!headerRow) {
    headerRow = document.createElement('div');
    headerRow.className = 'section-header-row';
    titleEl.parentNode.insertBefore(headerRow, titleEl);
    headerRow.appendChild(titleEl);
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'focus-mode-toggle-btn';
  btn.className = 'study-mode-toggle-button focus-mode-toggle-button';
  btn.setAttribute('aria-label', 'מעבר למצב מיקוד - לימוד הנושא בכרטיסיות ממוקדות');
  btn.setAttribute('title', 'לימוד הנושא בכרטיסיות ממוקדות');

  var icon = document.createElement('span');
  icon.className = 'study-mode-toggle-icon focus-mode-toggle-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🎯';
  btn.appendChild(icon);

  var text = document.createElement('span');
  text.textContent = 'מצב מיקוד';
  btn.appendChild(text);

  btn.addEventListener('click', function () {
    var activeApi = (typeof FocusMode !== 'undefined') ? FocusMode : (typeof StudyMode !== 'undefined' ? StudyMode : null);
    if (activeApi) {
      activeApi.enter({
        sectionId: sectionId,
        sectionTitle: title,
        blocks: validBlocks,
        topicData: topicPageState.topicData,
        originButton: btn
      });
    }
  });

  headerRow.appendChild(btn);
}

function renderSectionBlocks(blocks, sectionId) {
  var container = document.getElementById('section-content');
  if (!container) {
    return;
  }

  clearElement(container);

  var secId = sectionId || topicPageState.activeSectionId || 'sec';

  (blocks || []).forEach(function (block, idx) {
    var blockId = 'block-' + secId + '-' + idx;
    var el = renderBlock(block, { inTabs: false, sectionId: secId, blockId: blockId });
    if (el) {
      el.id = blockId;
      container.appendChild(el);
    }
  });
}

/* --------------------------------------------------------------------------
   Previous / next subtopic navigation (#previous-section / #next-section)
   -------------------------------------------------------------------------- */

function renderSectionPager(topicData, activeId) {
  var prevEl = document.getElementById('previous-section');
  var nextEl = document.getElementById('next-section');
  if (!prevEl || !nextEl) {
    return;
  }

  var index = topicData.sections.findIndex(function (section) {
    return section.id === activeId;
  });
  if (index === -1) {
    return;
  }

  var prevSection = index > 0 ? topicData.sections[index - 1] : null;
  var nextSection = index < topicData.sections.length - 1 ? topicData.sections[index + 1] : null;

  if (typeof renderPagerLink === 'function') {
    renderPagerLink(prevEl, prevSection, 'נושא משני קודם', 'prev', function (section) {
      return '#' + section.id;
    });
    renderPagerLink(nextEl, nextSection, 'נושא משני הבא', 'next', function (section) {
      return '#' + section.id;
    });
  }
}

/* --------------------------------------------------------------------------
   Loading / error states
   -------------------------------------------------------------------------- */

function showSectionLoading() {
  var loadingEl = document.getElementById('section-loading');
  var wrapper = document.getElementById('section-content-wrapper');
  var errorEl = document.getElementById('section-error');
  if (loadingEl) {
    loadingEl.hidden = false;
  }
  if (wrapper) {
    wrapper.hidden = true;
  }
  if (errorEl) {
    errorEl.hidden = true;
  }
}

function hideSectionLoading() {
  var loadingEl = document.getElementById('section-loading');
  if (loadingEl) {
    loadingEl.hidden = true;
  }
}

function showSectionContent() {
  var wrapper = document.getElementById('section-content-wrapper');
  if (wrapper) {
    wrapper.hidden = false;
  }
}

// Shows a clear error message in #section-error. When `offerReturnToFirst`
// is true and a first section is known, also renders a button that
// navigates back to it (used for unknown-hash errors).
function showSectionError(message, offerReturnToFirst) {
  var errorEl = document.getElementById('section-error');
  var wrapper = document.getElementById('section-content-wrapper');
  var loadingEl = document.getElementById('section-loading');
  if (!errorEl) {
    return;
  }

  clearElement(errorEl);

  var messageEl = document.createElement('p');
  messageEl.className = 'section-error-message';
  messageEl.textContent = message;
  errorEl.appendChild(messageEl);

  var firstSection = topicPageState.topicData && topicPageState.topicData.sections[0];
  if (offerReturnToFirst && firstSection) {
    var returnButton = document.createElement('button');
    returnButton.type = 'button';
    returnButton.className = 'section-error-action';
    returnButton.textContent = 'חזרה לנושא המשני הראשון';
    returnButton.addEventListener('click', function () {
      window.location.hash = firstSection.id;
    });
    errorEl.appendChild(returnButton);
  }

  errorEl.hidden = false;
  if (wrapper) {
    wrapper.hidden = true;
  }
  if (loadingEl) {
    loadingEl.hidden = true;
  }
}

/* --------------------------------------------------------------------------
   Controller: ties the loader and renderer together via hash routing
   -------------------------------------------------------------------------- */

// Loads and renders the section identified by `sectionId`. Shows the
// loading state while fetching, then either renders the section or shows
// an error state (unknown section id, or a JSON loading failure).
async function loadAndRenderSection(sectionId, targetBlockId) {
  var topicData = topicPageState.topicData;
  topicPageState.activeSectionId = sectionId;
  topicPageState.activeBlockId = targetBlockId || null;

  renderSectionNav(topicData, sectionId);

  var sectionMeta = topicData.sections.find(function (section) {
    return section.id === sectionId;
  });

  if (!sectionMeta) {
    showSectionError('הנושא המשני המבוקש אינו קיים.', true);
    return;
  }

  if (typeof StudyMode !== 'undefined' && typeof StudyMode.isActive === 'function' && StudyMode.isActive()) {
    StudyMode.exit();
  }

  showSectionLoading();
  resetReadingProgress();

  try {
    var content;
    if (sectionContentCache[sectionId]) {
      content = sectionContentCache[sectionId];
    } else {
      content = await loadSectionContent(topicPageState.topicPath, sectionMeta.file);
      sectionContentCache[sectionId] = content;
    }

    renderSectionTitle(content.title || sectionMeta.title, sectionId);
    renderStudyModeToggle(sectionId, content.title || sectionMeta.title, content.blocks);
    renderSectionBlocks(content.blocks, sectionId);
    renderSectionPager(topicData, sectionId);
    hideSectionLoading();
    showSectionContent();

    if (typeof StudyUI !== 'undefined' && topicData.id) {
      StudyUI.onSectionLoaded(topicData.id, sectionId, topicData);
    }

    updateReadingProgress();

    if (targetBlockId) {
      highlightAndScrollToBlock(targetBlockId);
    }
  } catch (error) {
    showSectionError(error.message, false);
  }
}

function handleHashChange() {
  var topicData = topicPageState.topicData;
  if (!topicData) {
    return;
  }
  var sectionId = getHashSectionId() || (topicData.sections[0] && topicData.sections[0].id);
  var blockId = getHashBlockId();

  if (sectionId) {
    if (topicPageState.activeSectionId !== sectionId) {
      loadAndRenderSection(sectionId, blockId);
    } else if (blockId) {
      highlightAndScrollToBlock(blockId);
    }
  }
}

/* --------------------------------------------------------------------------
   Topic keyboard shortcuts initialization
   -------------------------------------------------------------------------- */

function initTopicShortcuts() {
  if (typeof TopicShortcuts === 'undefined') {
    return;
  }

  TopicShortcuts.init({
    goNext: function () {
      var nextEl = document.getElementById('next-section');
      if (nextEl && !nextEl.classList.contains('disabled')) {
        var href = nextEl.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href;
        }
      }
    },
    goPrevious: function () {
      var prevEl = document.getElementById('previous-section');
      if (prevEl && !prevEl.classList.contains('disabled')) {
        var href = prevEl.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href;
        }
      }
    },
    toggleStudied: function () {
      var statusSelect = document.getElementById('section-status');
      var topicData = topicPageState.topicData;
      var activeSecId = topicPageState.activeSectionId;
      if (statusSelect) {
        var current = statusSelect.value;
        var nextStatus = current === 'completed' ? 'not-started' : 'completed';
        statusSelect.value = nextStatus;
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (typeof StudyStore !== 'undefined' && topicData && topicData.id && activeSecId) {
        var currState = StudyStore.getSectionState(topicData.id, activeSecId);
        var newStatus = currState.status === 'completed' ? 'not-started' : 'completed';
        StudyStore.setSectionStatus(topicData.id, activeSecId, newStatus);
      }
    },
    focusNotes: function () {
      var noteArea = document.getElementById('section-note');
      if (noteArea) {
        noteArea.focus();
        noteArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    focusSearch: function () {
      var searchInput = document.getElementById('topic-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    openToc: function () {
      var drawer = document.getElementById('topic-toc-drawer');
      if (window.innerWidth <= 860 && drawer) {
        openMobileTocDrawer();
      } else {
        var activeTocLink = document.querySelector('.topic-toc-active') || document.querySelector('.section-link.active') || document.querySelector('.section-nav');
        if (activeTocLink) {
          activeTocLink.focus();
          activeTocLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },
    onEscape: function () {
      closeMobileTocDrawer();
      var searchResults = document.getElementById('topic-search-results');
      if (searchResults && !searchResults.hidden) {
        searchResults.hidden = true;
      }
      var sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
      }
      var backdrop = document.querySelector('.sidebar-backdrop');
      if (backdrop) backdrop.hidden = true;
    }
  });
}

// Public entry point. Called by a topic's own script.js with the path to
// its topic.json, e.g. initTopicPage("./data/topic.json").
async function initTopicPage(topicPath) {
  showSectionLoading();
  topicPageState.topicPath = topicPath;

  var topicData;
  try {
    topicData = await loadTopicDefinition(topicPath);
  } catch (error) {
    showSectionError(error.message, false);
    return;
  }

  topicPageState.topicData = topicData;

  // Initialize UI features: reading progress, search control, table of contents
  initReadingProgress();
  renderSearchControl();

  // Initialize shortcuts
  if (typeof TopicShortcuts === 'undefined') {
    var scScript = document.createElement('script');
    scScript.src = '/interview-prep-site/assets/js/topic-shortcuts.js?v=3';
    scScript.onload = function () {
      initTopicShortcuts();
    };
    document.head.appendChild(scScript);
  } else {
    initTopicShortcuts();
  }

  // Initialize study-mode script
  if (typeof StudyMode === 'undefined') {
    var smScript = document.createElement('script');
    smScript.src = '/interview-prep-site/assets/js/study-mode.js?v=3';
    document.head.appendChild(smScript);
  }

  // Build topic-wide in-memory search index asynchronously in background
  buildTopicSearchIndex(topicPath, topicData);

  var hasExplicitHash = Boolean(getHashSectionId());
  var hashSectionId = getHashSectionId();
  var hashBlockId = getHashBlockId();
  var firstSectionId = topicData.sections[0] && topicData.sections[0].id;

  // An explicit hash always takes priority. Only when there is no hash at
  // all do we fall back to the topic's saved last-visited section (if it
  // still exists among the current sections), then to the first section.
  var initialSectionId = hashSectionId;
  if (!initialSectionId) {
    var savedLastSectionId =
      typeof StudyStore !== 'undefined' && topicData.id
        ? StudyStore.getTopicState(topicData.id).lastSectionId
        : null;
    var savedSectionStillExists =
      savedLastSectionId &&
      topicData.sections.some(function (section) {
        return section.id === savedLastSectionId;
      });
    initialSectionId = savedSectionStillExists ? savedLastSectionId : firstSectionId;
  }

  if (!hashSectionId && initialSectionId) {
    window.history.replaceState(null, '', '#' + initialSectionId);
  }

  window.addEventListener('hashchange', handleHashChange);

  if (initialSectionId) {
    await loadAndRenderSection(initialSectionId, hashBlockId);
  }

  if (typeof StudyUI !== 'undefined' && topicData.id) {
    StudyUI.initStudyPanel(topicData.id, topicData, {
      hasExplicitHash: hasExplicitHash,
      onNavigateToSection: function (targetSectionId) {
        window.history.replaceState(null, '', '#' + targetSectionId);
        loadAndRenderSection(targetSectionId);
      }
    });
  }
}
