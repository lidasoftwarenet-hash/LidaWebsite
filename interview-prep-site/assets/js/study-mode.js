// assets/js/study-mode.js
// Focus Mode: Transforms section raw content blocks into cohesive, meaningful learning cards.
// Supports keyboard navigation, CodeMirror lifecycle, progress tracking, accessible announcements,
// and seamless section study status updates.

(function () {
  'use strict';

  var state = {
    active: false,
    sectionId: '',
    sectionTitle: '',
    cards: [],
    currentIndex: 0,
    topicData: null,
    originButton: null,
    activeCardEl: null,
    isCompletedScreen: false
  };

  var containerEl = null;
  var titleEl = null;
  var counterEl = null;
  var progressBarEl = null;
  var progressTrackEl = null;
  var contentEl = null;
  var completeEl = null;
  var completeTitleEl = null;
  var completeDescEl = null;
  var markStudiedBtn = null;
  var restartBtn = null;
  var completeExitBtn = null;
  var prevBtn = null;
  var nextBtn = null;
  var exitBtn = null;

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  /* --------------------------------------------------------------------------
     Block validation and semantic card builder
     -------------------------------------------------------------------------- */

  function isValidBlock(block) {
    if (!block || typeof block !== 'object' || typeof block.type !== 'string') {
      return false;
    }
    var type = block.type;
    if (type === 'heading') {
      return Boolean(block.text && typeof block.text === 'string' && block.text.trim().length > 0);
    }
    if (type === 'paragraph' || type === 'callout') {
      return Boolean(block.text && typeof block.text === 'string' && block.text.trim().length > 0);
    }
    if (type === 'bulletList') {
      if (!Array.isArray(block.items) || block.items.length === 0) return false;
      return block.items.some(function (it) {
        if (typeof it === 'string') return it.trim().length > 0;
        if (it && typeof it.text === 'string') return it.text.trim().length > 0;
        return false;
      });
    }
    if (type === 'code') {
      return Boolean(block.code && typeof block.code === 'string' && block.code.trim().length > 0);
    }
    if (type === 'qa') {
      var hasQ = Boolean(block.question && typeof block.question === 'string' && block.question.trim().length > 0);
      var hasA = Boolean((block.answer && typeof block.answer === 'string' && block.answer.trim().length > 0) ||
                         (block.text && typeof block.text === 'string' && block.text.trim().length > 0));
      return hasQ && hasA;
    }
    if (type === 'interviewAnswer') {
      var hasQ = Boolean(block.question && typeof block.question === 'string' && block.question.trim().length > 0);
      var hasA = Boolean(block.answer && typeof block.answer === 'string' && block.answer.trim().length > 0);
      var hasT = Boolean(block.text && typeof block.text === 'string' && block.text.trim().length > 0);
      return hasQ || hasA || hasT;
    }
    if (type === 'comparison') {
      var hasCols = Array.isArray(block.columns) && block.columns.length > 0;
      var hasRows = Array.isArray(block.rows) && block.rows.length > 0;
      var hasItems = Array.isArray(block.items) && block.items.length > 0;
      return (hasCols && hasRows) || hasItems;
    }
    if (type === 'steps' || type === 'flow') {
      var hasSteps = Array.isArray(block.steps) && block.steps.length > 0;
      var hasItems = Array.isArray(block.items) && block.items.length > 0;
      var hasNodes = Array.isArray(block.nodes) && block.nodes.length > 0;
      return hasSteps || hasItems || hasNodes;
    }
    if (type === 'tabs') {
      return Array.isArray(block.tabs) && block.tabs.length > 0;
    }
    if (type === 'table') {
      var hasHeaders = Array.isArray(block.headers) && block.headers.length > 0;
      var hasRows = Array.isArray(block.rows) && block.rows.length > 0;
      return hasHeaders || hasRows;
    }
    if (type === 'checklist') {
      return Array.isArray(block.items) && block.items.length > 0;
    }
    if (type === 'definition') {
      var hasTerm = Boolean(block.term && typeof block.term === 'string' && block.term.trim().length > 0);
      var hasDef = Boolean((block.definition && typeof block.definition === 'string' && block.definition.trim().length > 0) ||
                           (block.text && typeof block.text === 'string' && block.text.trim().length > 0));
      return hasTerm || hasDef;
    }
    return true;
  }

  function getBlockCharCount(block) {
    if (!block) return 0;
    var count = 0;
    if (block.text) count += String(block.text).length;
    if (block.title) count += String(block.title).length;
    if (block.term) count += String(block.term).length;
    if (block.definition) count += String(block.definition).length;
    if (block.code) count += String(block.code).length;
    if (block.question) count += String(block.question).length;
    if (block.answer) count += String(block.answer).length;
    if (Array.isArray(block.items)) {
      block.items.forEach(function (it) {
        if (typeof it === 'string') count += it.length;
        else if (it && it.text) count += String(it.text).length;
      });
    }
    if (Array.isArray(block.rows)) {
      block.rows.forEach(function (r) {
        if (Array.isArray(r)) {
          r.forEach(function (c) { count += String(c).length; });
        }
      });
    }
    if (Array.isArray(block.steps)) {
      block.steps.forEach(function (s) {
        if (typeof s === 'string') count += s.length;
        else if (s) {
          if (s.title) count += String(s.title).length;
          if (s.text) count += String(s.text).length;
          if (s.desc) count += String(s.desc).length;
        }
      });
    }
    if (Array.isArray(block.tabs)) {
      block.tabs.forEach(function (t) {
        if (t) {
          if (t.label || t.title) count += String(t.label || t.title).length;
          if (Array.isArray(t.blocks)) {
            t.blocks.forEach(function (tb) { count += getBlockCharCount(tb); });
          }
        }
      });
    }
    return count;
  }

  function isRichBlock(block) {
    if (!block) return false;
    var type = block.type;
    return (
      type === 'comparison' ||
      type === 'steps' ||
      type === 'table' ||
      type === 'flow' ||
      type === 'tabs' ||
      type === 'interviewAnswer' ||
      type === 'qa' ||
      type === 'checklist' ||
      type === 'definition'
    );
  }

  function getBlockTitle(block) {
    if (!block) return null;
    if (block.type === 'heading' && block.text && block.text.trim()) {
      return block.text.trim();
    }
    if (block.title && typeof block.title === 'string' && block.title.trim()) {
      return block.title.trim();
    }
    if (block.term && typeof block.term === 'string' && block.term.trim()) {
      return block.term.trim();
    }
    if (block.question && typeof block.question === 'string' && block.question.trim()) {
      return block.question.trim();
    }
    if (block.label && typeof block.label === 'string' && block.label.trim()) {
      return block.label.trim();
    }
    return null;
  }

  function hasRichOrInteractiveBlock(blocks) {
    if (!Array.isArray(blocks)) return false;
    return blocks.some(function (b) {
      return isRichBlock(b) || (b && b.type === 'code');
    });
  }

  function getCardTotalChars(card) {
    if (!card || !Array.isArray(card.blocks)) return 0;
    var total = (card.title || '').length;
    card.blocks.forEach(function (b) {
      total += getBlockCharCount(b);
    });
    return total;
  }

  /**
   * buildFocusCards: Groups raw section blocks into semantic Focus Mode cards.
   * Follows strict grouping, merge, and split rules.
   */
  function buildFocusCards(rawBlocks, sectionTitle) {
    if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
      return [];
    }

    // Step A: Filter out invalid / empty blocks with concise warnings
    var validBlocks = [];
    rawBlocks.forEach(function (b, idx) {
      if (isValidBlock(b)) {
        validBlocks.push(b);
      } else {
        console.warn('⚠️ FocusMode: skipping invalid or empty block at index ' + idx, b);
      }
    });

    if (validBlocks.length === 0) {
      return [];
    }

    // Step B, C, D, E: Initial grouping by headings, introductions, and standalone rich blocks
    var rawCards = [];
    var currentCard = null;
    var introTitle = sectionTitle ? ('מבוא: ' + sectionTitle) : 'מבוא';

    validBlocks.forEach(function (block) {
      if (block.type === 'heading') {
        // Start a new group. The heading text becomes the card's title.
        // We do not render the heading twice inside the card body.
        if (currentCard && currentCard.blocks.length > 0) {
          rawCards.push(currentCard);
        }
        currentCard = {
          title: block.text.trim(),
          blocks: []
        };
      } else if (!currentCard) {
        // Blocks appearing before the first heading -> group into an Introduction card
        currentCard = {
          title: introTitle,
          blocks: [block]
        };
      } else {
        // Check if standalone rich block should start its own card (when current card already has substantive content)
        var isRich = isRichBlock(block);
        var richTitle = getBlockTitle(block);

        if (isRich && richTitle && currentCard.blocks.length >= 2 && getCardTotalChars(currentCard) >= 350) {
          rawCards.push(currentCard);
          currentCard = {
            title: richTitle,
            blocks: [block]
          };
        } else {
          currentCard.blocks.push(block);
        }
      }
    });

    if (currentCard && currentCard.blocks.length > 0) {
      rawCards.push(currentCard);
    } else if (currentCard && currentCard.blocks.length === 0 && rawCards.length > 0) {
      // Heading appeared with no subsequent blocks -> attach title note to prior card or drop
      rawCards[rawCards.length - 1].title += ' - ' + currentCard.title;
    }

    if (rawCards.length === 0) {
      return [];
    }

    // Step F: Merge cards that are too small
    // A card is too small if it has 0 blocks, or only 1 short paragraph (< 100 chars) and no rich/code block.
    var mergedCards = [];
    for (var i = 0; i < rawCards.length; i++) {
      var card = rawCards[i];
      var charCount = getCardTotalChars(card);
      var isSmall = (card.blocks.length === 0) ||
                    (card.blocks.length === 1 && charCount < 100 && !hasRichOrInteractiveBlock(card.blocks));

      if (isSmall) {
        if (i < rawCards.length - 1) {
          // Merge with next card
          var nextCard = rawCards[i + 1];
          nextCard.blocks = card.blocks.concat(nextCard.blocks);
          // If next card had an intro/generic title, preserve the more specific title
          if (nextCard.title === introTitle && card.title !== introTitle) {
            nextCard.title = card.title;
          }
        } else if (mergedCards.length > 0) {
          // Final card: merge with previous merged card
          var prevCard = mergedCards[mergedCards.length - 1];
          prevCard.blocks = prevCard.blocks.concat(card.blocks);
        } else {
          // Only card in section, keep it
          mergedCards.push(card);
        }
      } else {
        mergedCards.push(card);
      }
    }

    if (mergedCards.length === 0) {
      mergedCards = rawCards;
    }

    // Step G: Split cards that are too large
    // More than 6 blocks or > 1800 chars, with safe boundary splitting
    var finalCards = [];
    mergedCards.forEach(function (card) {
      var charCount = getCardTotalChars(card);
      var shouldSplit = card.blocks.length > 6 || (charCount > 1800 && card.blocks.length >= 4);

      if (shouldSplit) {
        // Find safe split index (before a code block or rich block near the middle)
        var splitIdx = Math.floor(card.blocks.length / 2);
        for (var s = 2; s < card.blocks.length - 1; s++) {
          var bType = card.blocks[s].type;
          if (bType === 'code' || isRichBlock(card.blocks[s])) {
            splitIdx = s;
            break;
          }
        }

        var part1Blocks = card.blocks.slice(0, splitIdx);
        var part2Blocks = card.blocks.slice(splitIdx);

        if (part1Blocks.length > 0 && part2Blocks.length > 0) {
          finalCards.push({
            title: card.title + ' (חלק 1)',
            blocks: part1Blocks
          });
          finalCards.push({
            title: card.title + ' (חלק 2)',
            blocks: part2Blocks
          });
          return;
        }
      }

      finalCards.push(card);
    });

    // Step 4: Finalize Titles & Card IDs
    var cleanedCards = [];
    finalCards.forEach(function (card, index) {
      if (!card.blocks || card.blocks.length === 0) return;

      var title = card.title;
      if (!title || !title.trim()) {
        title = getBlockTitle(card.blocks[0]) || sectionTitle || 'מושג מרכזי';
      }

      cleanedCards.push({
        id: 'focus-card-' + (index + 1),
        title: title,
        blocks: card.blocks
      });
    });

    return cleanedCards;
  }

  /* --------------------------------------------------------------------------
     CodeMirror Lifecycle Management
     -------------------------------------------------------------------------- */

  function destroyCurrentCardEditors() {
    if (!contentEl) return;
    try {
      if (contentEl._cmView && typeof contentEl._cmView.destroy === 'function') {
        contentEl._cmView.destroy();
      }
      var codeCards = contentEl.querySelectorAll('.code-editor-card');
      Array.prototype.forEach.call(codeCards, function (codeCard) {
        if (codeCard._cmView && typeof codeCard._cmView.destroy === 'function') {
          try {
            codeCard._cmView.destroy();
          } catch (err) {}
        }
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     DOM Container Construction
     -------------------------------------------------------------------------- */

  function ensureContainer() {
    if (containerEl && document.body.contains(containerEl)) {
      return containerEl;
    }

    var sectionBody = document.querySelector('.section-body');
    if (!sectionBody) {
      return null;
    }

    var existing = document.getElementById('focus-mode-container') || document.getElementById('study-mode-container');
    if (existing) {
      containerEl = existing;
    } else {
      containerEl = document.createElement('section');
      containerEl.id = 'focus-mode-container';
      containerEl.className = 'study-mode focus-mode';
      containerEl.setAttribute('aria-label', 'מצב מיקוד');
      containerEl.hidden = true;

      // Header
      var header = document.createElement('div');
      header.className = 'study-mode-header';

      var headerInfo = document.createElement('div');
      headerInfo.className = 'study-mode-header-info';

      var badge = document.createElement('span');
      badge.className = 'study-mode-badge focus-mode-badge';
      badge.textContent = '🎯 מצב מיקוד';
      headerInfo.appendChild(badge);

      titleEl = document.createElement('h3');
      titleEl.id = 'study-mode-title';
      titleEl.className = 'study-mode-title focus-mode-title';
      titleEl.setAttribute('tabindex', '-1');
      headerInfo.appendChild(titleEl);

      header.appendChild(headerInfo);

      var headerControls = document.createElement('div');
      headerControls.className = 'study-mode-header-controls';

      counterEl = document.createElement('span');
      counterEl.id = 'study-mode-counter';
      counterEl.className = 'study-mode-counter focus-mode-counter';
      counterEl.setAttribute('aria-live', 'polite');
      headerControls.appendChild(counterEl);

      exitBtn = document.createElement('button');
      exitBtn.type = 'button';
      exitBtn.id = 'study-mode-exit-btn';
      exitBtn.className = 'study-mode-exit focus-mode-exit';
      exitBtn.setAttribute('aria-label', 'יציאה ממצב מיקוד');
      exitBtn.textContent = '✕ יציאה';
      exitBtn.addEventListener('click', function () {
        exit();
      });
      headerControls.appendChild(exitBtn);

      header.appendChild(headerControls);
      containerEl.appendChild(header);

      // Progress bar
      progressTrackEl = document.createElement('div');
      progressTrackEl.className = 'study-mode-progress focus-mode-progress';
      progressTrackEl.setAttribute('role', 'progressbar');
      progressTrackEl.setAttribute('aria-valuemin', '0');
      progressTrackEl.setAttribute('aria-valuemax', '100');
      progressTrackEl.setAttribute('aria-valuenow', '0');
      progressTrackEl.id = 'study-mode-progress-track';

      progressBarEl = document.createElement('div');
      progressBarEl.className = 'study-mode-progress-bar';
      progressBarEl.id = 'study-mode-progress-bar';
      progressTrackEl.appendChild(progressBarEl);

      containerEl.appendChild(progressTrackEl);

      // Body (active content and completion screen)
      var body = document.createElement('div');
      body.className = 'study-mode-body';

      contentEl = document.createElement('div');
      contentEl.id = 'study-mode-content';
      contentEl.className = 'study-mode-content focus-mode-card-content';
      contentEl.setAttribute('aria-live', 'polite');
      body.appendChild(contentEl);

      // Completion screen
      completeEl = document.createElement('div');
      completeEl.id = 'study-mode-complete';
      completeEl.className = 'study-mode-complete focus-mode-complete';
      completeEl.hidden = true;

      var completeIcon = document.createElement('div');
      completeIcon.className = 'study-mode-complete-icon';
      completeIcon.setAttribute('aria-hidden', 'true');
      completeIcon.textContent = '🎉';
      completeEl.appendChild(completeIcon);

      completeTitleEl = document.createElement('h4');
      completeTitleEl.id = 'study-mode-complete-title';
      completeTitleEl.className = 'study-mode-complete-title';
      completeTitleEl.setAttribute('tabindex', '-1');
      completeTitleEl.textContent = 'סיימת את כל הכרטיסיות בנושא זה!';
      completeEl.appendChild(completeTitleEl);

      completeDescEl = document.createElement('p');
      completeDescEl.className = 'study-mode-complete-desc';
      completeDescEl.textContent = 'עברת בהצלחה על כל הכרטיסיות הממוקדות.';
      completeEl.appendChild(completeDescEl);

      var completeActions = document.createElement('div');
      completeActions.className = 'study-mode-complete-actions';

      markStudiedBtn = document.createElement('button');
      markStudiedBtn.type = 'button';
      markStudiedBtn.id = 'study-mode-mark-studied-btn';
      markStudiedBtn.className = 'study-mode-complete-mark-btn button-primary';
      markStudiedBtn.textContent = '✓ סימון הנושא כנלמד';
      markStudiedBtn.addEventListener('click', function () {
        markSectionStudied();
      });
      completeActions.appendChild(markStudiedBtn);

      restartBtn = document.createElement('button');
      restartBtn.type = 'button';
      restartBtn.id = 'study-mode-restart-btn';
      restartBtn.className = 'study-mode-complete-restart-btn button-secondary';
      restartBtn.textContent = '↺ חזרה להתחלה';
      restartBtn.addEventListener('click', function () {
        state.isCompletedScreen = false;
        state.currentIndex = 0;
        renderCurrentCard();
      });
      completeActions.appendChild(restartBtn);

      completeExitBtn = document.createElement('button');
      completeExitBtn.type = 'button';
      completeExitBtn.id = 'study-mode-finish-exit-btn';
      completeExitBtn.className = 'study-mode-complete-exit-btn button-secondary';
      completeExitBtn.textContent = 'חזרה לתצוגה רגילה';
      completeExitBtn.addEventListener('click', function () {
        exit();
      });
      completeActions.appendChild(completeExitBtn);

      completeEl.appendChild(completeActions);
      body.appendChild(completeEl);

      containerEl.appendChild(body);

      // Actions footer
      actionsEl = document.createElement('div');
      actionsEl.className = 'study-mode-actions';
      var actions = actionsEl;

      prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.id = 'study-mode-prev-btn';
      prevBtn.className = 'study-mode-previous button-secondary';
      prevBtn.setAttribute('aria-label', 'מעבר לכרטיסייה הקודמת');
      prevBtn.textContent = '← הקודם';
      prevBtn.addEventListener('click', function () {
        goPrevious();
      });
      actions.appendChild(prevBtn);

      var hints = document.createElement('div');
      hints.className = 'study-mode-shortcuts-hint';
      hints.setAttribute('aria-hidden', 'true');

      var hintText = document.createElement('span');
      hintText.textContent = 'ניווט: ';
      var kbdNext = document.createElement('kbd');
      kbdNext.className = 'study-mode-kbd';
      kbdNext.textContent = '→';
      var kbdPrev = document.createElement('kbd');
      kbdPrev.className = 'study-mode-kbd';
      kbdPrev.textContent = '←';
      var kbdSpace = document.createElement('kbd');
      kbdSpace.className = 'study-mode-kbd';
      kbdSpace.textContent = 'Space';
      var kbdEsc = document.createElement('kbd');
      kbdEsc.className = 'study-mode-kbd';
      kbdEsc.textContent = 'Esc';

      hintText.appendChild(kbdNext);
      hintText.appendChild(document.createTextNode(' '));
      hintText.appendChild(kbdPrev);
      hintText.appendChild(document.createTextNode(' / '));
      hintText.appendChild(kbdSpace);
      hintText.appendChild(document.createTextNode(' | יציאה: '));
      hintText.appendChild(kbdEsc);

      hints.appendChild(hintText);
      actions.appendChild(hints);

      nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.id = 'study-mode-next-btn';
      nextBtn.className = 'study-mode-next button-primary';
      nextBtn.setAttribute('aria-label', 'מעבר לכרטיסייה הבאה');
      nextBtn.textContent = 'הבא →';
      nextBtn.addEventListener('click', function () {
        goNext();
      });
      actions.appendChild(nextBtn);

      containerEl.appendChild(actions);

      sectionBody.appendChild(containerEl);
    }

    return containerEl;
  }

  /* --------------------------------------------------------------------------
     Study Status Integration
     -------------------------------------------------------------------------- */

  function markSectionStudied() {
    var topicData = state.topicData;
    var sectionId = state.sectionId;
    if (!topicData || !sectionId) return;

    if (typeof StudyStore !== 'undefined' && topicData.id) {
      StudyStore.setSectionStatus(topicData.id, sectionId, 'completed');
    }

    var statusSelect = document.getElementById('section-status');
    if (statusSelect) {
      statusSelect.value = 'completed';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (typeof StudyUI !== 'undefined' && topicData.id && typeof StudyUI.onSectionLoaded === 'function') {
      StudyUI.onSectionLoaded(topicData.id, sectionId, topicData);
    }

    if (markStudiedBtn) {
      markStudiedBtn.classList.add('is-marked');
      markStudiedBtn.textContent = '✓ הנושא סומן כנלמד בהצלחה!';
      markStudiedBtn.disabled = true;
    }
  }

  function updateCompletionMarkButton() {
    if (!markStudiedBtn) return;
    var topicData = state.topicData;
    var sectionId = state.sectionId;

    var isAlreadyDone = false;
    if (typeof StudyStore !== 'undefined' && topicData && topicData.id && sectionId) {
      var curr = StudyStore.getSectionState(topicData.id, sectionId);
      isAlreadyDone = curr && curr.status === 'completed';
    } else {
      var statusSelect = document.getElementById('section-status');
      if (statusSelect) {
        isAlreadyDone = statusSelect.value === 'completed';
      }
    }

    if (isAlreadyDone) {
      markStudiedBtn.classList.add('is-marked');
      markStudiedBtn.textContent = '✓ הנושא כבר מסומן כנלמד';
      markStudiedBtn.disabled = true;
    } else {
      markStudiedBtn.classList.remove('is-marked');
      markStudiedBtn.textContent = '✓ סימון הנושא כנלמד';
      markStudiedBtn.disabled = false;
    }
  }

  var actionsEl = null;

  function showCompletionScreen() {
    destroyCurrentCardEditors();
    state.isCompletedScreen = true;

    if (contentEl) contentEl.hidden = true;
    if (completeEl) completeEl.hidden = false;
    if (actionsEl) actionsEl.hidden = true;

    var total = state.cards.length;
    if (titleEl) {
      titleEl.textContent = 'סיום ' + (state.sectionTitle || 'נושא זה');
    }
    if (counterEl) {
      counterEl.textContent = 'הושלם (' + total + '/' + total + ')';
    }
    if (completeDescEl) {
      completeDescEl.textContent = 'עברת בהצלחה על כל ' + total + ' הכרטיסיות הממוקדות בנושא זה.';
    }
    if (progressBarEl && progressTrackEl) {
      progressBarEl.style.width = '100%';
      progressTrackEl.setAttribute('aria-valuenow', '100');
    }

    updateCompletionMarkButton();

    if (containerEl && typeof containerEl.scrollIntoView === 'function') {
      containerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (completeTitleEl) {
      completeTitleEl.focus();
    }
  }

  function renderCurrentCard() {
    ensureContainer();
    if (!state.active || state.cards.length === 0) {
      return;
    }

    destroyCurrentCardEditors();
    state.isCompletedScreen = false;

    if (contentEl) contentEl.hidden = false;
    if (completeEl) completeEl.hidden = true;
    if (actionsEl) actionsEl.hidden = false;

    var idx = state.currentIndex;
    var total = state.cards.length;
    var card = state.cards[idx];

    // Update Header Title (Card Title)
    if (titleEl) {
      titleEl.textContent = card.title || state.sectionTitle || 'מצב מיקוד';
    }

    // Update Counter (e.g. כרטיסייה 3 מתוך 8)
    if (counterEl) {
      counterEl.textContent = 'כרטיסייה ' + (idx + 1) + ' מתוך ' + total;
    }

    // Update Progress Bar
    var pct = Math.round(((idx + 1) / total) * 100);
    if (progressBarEl && progressTrackEl) {
      progressBarEl.style.width = pct + '%';
      progressTrackEl.setAttribute('aria-valuenow', String(pct));
    }

    // Update Buttons
    if (prevBtn) {
      var isFirst = idx === 0;
      prevBtn.disabled = isFirst;
      prevBtn.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
    }

    if (nextBtn) {
      var isLast = idx === total - 1;
      nextBtn.disabled = false;
      nextBtn.setAttribute('aria-disabled', 'false');
      nextBtn.textContent = isLast ? 'סיום ✓' : 'הבא →';
      nextBtn.setAttribute('aria-label', isLast ? 'סיום מצב מיקוד' : 'מעבר לכרטיסייה הבאה');
    }

    // Clear and render all blocks of this card
    clearElement(contentEl);

    var renderedCount = 0;
    (card.blocks || []).forEach(function (block, bIdx) {
      var blockId = 'focus-block-' + state.sectionId + '-' + idx + '-' + bIdx;
      var renderedEl = null;

      if (typeof window.renderBlock === 'function') {
        try {
          renderedEl = window.renderBlock(block, {
            inTabs: false,
            sectionId: state.sectionId,
            blockId: blockId
          });
        } catch (err) {
          console.warn('⚠️ FocusMode: Error rendering block in card', err);
        }
      }

      if (renderedEl) {
        contentEl.appendChild(renderedEl);
        renderedCount++;
      }
    });

    // If all blocks in this card failed rendering, render a graceful fallback
    if (renderedCount === 0) {
      var fallbackEl = document.createElement('div');
      fallbackEl.className = 'content-block callout callout-warning';
      var warn = document.createElement('p');
      warn.className = 'callout-content';
      warn.textContent = 'כרטיסייה זו אינה זמינה כרגע לתצוגה.';
      fallbackEl.appendChild(warn);
      contentEl.appendChild(fallbackEl);
    }

    // Scroll card to top and set focus to title for accessibility
    if (containerEl && typeof containerEl.scrollIntoView === 'function') {
      containerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (titleEl && typeof titleEl.focus === 'function') {
      try {
        titleEl.focus();
      } catch (e) {}
    }

    // Trigger CodeMirror resize adjustments after mounting
    setTimeout(function () {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new Event('resize'));
        } catch (e) {}
      }
    }, 60);
  }

  /* --------------------------------------------------------------------------
     Public Lifecycle Controller
     -------------------------------------------------------------------------- */

  function enter(config) {
    if (!config || !Array.isArray(config.blocks)) {
      console.warn('⚠️ FocusMode.enter: invalid configuration or empty blocks array', config);
      return;
    }

    var sectionTitle = config.sectionTitle || '';
    var cards = buildFocusCards(config.blocks, sectionTitle);

    if (cards.length === 0) {
      console.warn('⚠️ FocusMode: section does not contain enough structured content');
      alert('נושא זה אינו מכיל מספיק תוכן מובנה למצב מיקוד.');
      return;
    }

    ensureContainer();
    if (!containerEl) {
      return;
    }

    state.active = true;
    state.sectionId = config.sectionId || '';
    state.sectionTitle = sectionTitle;
    state.cards = cards;
    state.currentIndex = 0;
    state.topicData = config.topicData || null;
    state.originButton = config.originButton || null;
    state.isCompletedScreen = false;

    var contentWrapper = document.getElementById('section-content-wrapper');
    if (contentWrapper) {
      contentWrapper.hidden = true;
    }

    containerEl.hidden = false;
    renderCurrentCard();
  }

  function exit() {
    if (!state.active) {
      return;
    }

    destroyCurrentCardEditors();
    state.active = false;
    state.isCompletedScreen = false;

    if (containerEl) {
      containerEl.hidden = true;
    }

    var contentWrapper = document.getElementById('section-content-wrapper');
    if (contentWrapper) {
      contentWrapper.hidden = false;
    }

    if (state.originButton && typeof state.originButton.focus === 'function') {
      try {
        state.originButton.focus();
      } catch (e) {}
    }

    state.originButton = null;
  }

  function goNext() {
    if (!state.active) return;

    if (state.isCompletedScreen) {
      exit();
      return;
    }

    if (state.currentIndex < state.cards.length - 1) {
      state.currentIndex += 1;
      renderCurrentCard();
    } else {
      showCompletionScreen();
    }
  }

  function goPrevious() {
    if (!state.active) return;

    if (state.isCompletedScreen) {
      state.isCompletedScreen = false;
      renderCurrentCard();
      return;
    }

    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderCurrentCard();
    }
  }

  function isActive() {
    return Boolean(state.active && containerEl && !containerEl.hidden);
  }

  var FocusModeApi = {
    enter: enter,
    exit: exit,
    goNext: goNext,
    goPrevious: goPrevious,
    isActive: isActive,
    markSectionStudied: markSectionStudied,
    buildFocusCards: buildFocusCards
  };

  window.FocusMode = FocusModeApi;
  // Aliased for full backwards compatibility
  window.StudyMode = FocusModeApi;
})();
