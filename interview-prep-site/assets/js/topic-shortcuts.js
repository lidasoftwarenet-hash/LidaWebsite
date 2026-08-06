// assets/js/topic-shortcuts.js
// Handles keyboard navigation, shortcut actions, and accessible shortcuts help dialog.

(function () {
  'use strict';

  var shortcutsConfig = {
    goNext: null,
    goPrevious: null,
    toggleStudied: null,
    focusNotes: null,
    focusSearch: null,
    openToc: null,
    onEscape: null
  };

  var dialogEl = null;
  var overlayEl = null;
  var lastFocusedElement = null;

  var SHORTCUTS_DATA = [
    { key: '→', desc: 'כרטיסייה הבאה במצב מיקוד / מעבר לנושא המשני הבא' },
    { key: '←', desc: 'כרטיסייה קודמת במצב מיקוד / מעבר לנושא המשני הקודם' },
    { key: 'Space', desc: 'מעבר לכרטיסייה הבאה במצב מיקוד' },
    { key: 'Esc', desc: 'יציאה ממצב מיקוד / סגירת חלונות ותוצאות חיפוש' },
    { key: 'S', desc: 'סימון / ביטול סימון הנושא כנלמד' },
    { key: 'N', desc: 'מיקוד באזור ההערות האישיות' },
    { key: 'F  או  /', desc: 'מיקוד בשדה החיפוש בנושא' },
    { key: 'T', desc: 'פתיחת / מיקוד בתוכן העניינים' },
    { key: '?', desc: 'פתיחת חלון קיצורי מקשים זה' }
  ];

  function isInputFocused(el) {
    if (!el) return false;
    var tagName = el.tagName ? el.tagName.toLowerCase() : '';
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return true;
    }
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
      return true;
    }
    if (el.closest && el.closest('.cm-editor, .cm-content, [role="textbox"]')) {
      return true;
    }
    return false;
  }

  function isNavBlockedByFocus(el) {
    if (!el) return false;
    // Inside a tab list (e.g. tabs component)
    if (el.closest && el.closest('[role="tablist"], .tabs-nav, .tab-button')) {
      return true;
    }
    // Inside CodeMirror editor
    if (el.closest && el.closest('.cm-editor')) {
      return true;
    }
    // Horizontally scrolling element
    if (el.scrollWidth > el.clientWidth && el.clientWidth > 0) {
      try {
        var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        var overflowX = style ? style.overflowX : '';
        if (overflowX === 'scroll' || overflowX === 'auto') {
          return true;
        }
      } catch (err) {}
    }
    return false;
  }

  function createHelpDialog() {
    if (dialogEl && overlayEl) {
      return;
    }

    overlayEl = document.createElement('div');
    overlayEl.className = 'shortcuts-dialog-overlay';
    overlayEl.setAttribute('aria-hidden', 'true');
    overlayEl.hidden = true;

    dialogEl = document.createElement('div');
    dialogEl.className = 'shortcuts-dialog';
    dialogEl.setAttribute('role', 'dialog');
    dialogEl.setAttribute('aria-modal', 'true');
    dialogEl.setAttribute('aria-labelledby', 'shortcuts-dialog-title');
    dialogEl.setAttribute('tabindex', '-1');
    dialogEl.hidden = true;

    var header = document.createElement('div');
    header.className = 'shortcuts-dialog-header';

    var title = document.createElement('h3');
    title.id = 'shortcuts-dialog-title';
    title.className = 'shortcuts-dialog-title';
    title.textContent = '⌨️ קיצורי מקשים';
    header.appendChild(title);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'shortcuts-dialog-close';
    closeBtn.setAttribute('aria-label', 'סגירת חלון קיצורי מקשים');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closeHelpDialog);
    header.appendChild(closeBtn);

    dialogEl.appendChild(header);

    var list = document.createElement('ul');
    list.className = 'shortcuts-dialog-list';

    SHORTCUTS_DATA.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'shortcuts-dialog-item';

      var desc = document.createElement('span');
      desc.className = 'shortcuts-dialog-description';
      desc.textContent = item.desc;

      var kbd = document.createElement('kbd');
      kbd.className = 'shortcuts-dialog-key';
      kbd.textContent = item.key;

      li.appendChild(desc);
      li.appendChild(kbd);
      list.appendChild(li);
    });

    dialogEl.appendChild(list);

    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) {
        closeHelpDialog();
      }
    });

    document.body.appendChild(overlayEl);
    document.body.appendChild(dialogEl);
  }

  function openHelpDialog() {
    createHelpDialog();
    lastFocusedElement = document.activeElement;
    overlayEl.hidden = false;
    dialogEl.hidden = false;
    overlayEl.classList.add('is-open');
    dialogEl.classList.add('is-open');

    var closeBtn = dialogEl.querySelector('.shortcuts-dialog-close');
    if (closeBtn) {
      closeBtn.focus();
    } else {
      dialogEl.focus();
    }
  }

  function closeHelpDialog() {
    if (!dialogEl || dialogEl.hidden) return;
    dialogEl.classList.remove('is-open');
    overlayEl.classList.remove('is-open');
    dialogEl.hidden = true;
    overlayEl.hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try {
        lastFocusedElement.focus();
      } catch (e) {}
    }
    lastFocusedElement = null;
  }

  function isHelpDialogOpen() {
    return Boolean(dialogEl && !dialogEl.hidden && dialogEl.classList.contains('is-open'));
  }

  function handleKeyDown(e) {
    // Ignore repeat events
    if (e.repeat) return;

    // Do not override browser shortcuts (Ctrl, Cmd, Alt)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var activeEl = document.activeElement;

    // Handle Escape
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (isHelpDialogOpen()) {
        e.preventDefault();
        closeHelpDialog();
        return;
      }
      if (window.StudyMode && typeof window.StudyMode.isActive === 'function' && window.StudyMode.isActive()) {
        e.preventDefault();
        window.StudyMode.exit();
        return;
      }
      if (typeof shortcutsConfig.onEscape === 'function') {
        shortcutsConfig.onEscape();
      }
      return;
    }

    // Modal trap focus while open
    if (isHelpDialogOpen()) {
      if (e.key === 'Tab') {
        var focusables = dialogEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length > 0) {
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (e.shiftKey && activeEl === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && activeEl === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      return;
    }

    // Do not trigger single-key shortcuts while typing in editable fields
    if (isInputFocused(activeEl)) {
      return;
    }

    // ? -> Open Help Dialog
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      openHelpDialog();
      return;
    }

    // Space -> Next block in Study Mode (unless inside interactive element)
    if (e.key === ' ' || e.code === 'Space') {
      if (window.StudyMode && typeof window.StudyMode.isActive === 'function' && window.StudyMode.isActive()) {
        var isInteractive = activeEl && (
          activeEl.tagName === 'BUTTON' ||
          activeEl.tagName === 'A' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SUMMARY' ||
          activeEl.getAttribute('role') === 'tab' ||
          Boolean(activeEl.closest && activeEl.closest('.cm-editor, .tabs-list, .qa-toggle-btn, .interview-answer-toggle, .code-editor-copy-button, button, a'))
        );
        if (!isInteractive) {
          e.preventDefault();
          window.StudyMode.goNext();
          return;
        }
      }
    }

    // Arrow navigation
    if (e.key === 'ArrowRight') {
      if (!isNavBlockedByFocus(activeEl)) {
        e.preventDefault();
        if (window.StudyMode && typeof window.StudyMode.isActive === 'function' && window.StudyMode.isActive()) {
          window.StudyMode.goNext();
        } else if (typeof shortcutsConfig.goNext === 'function') {
          shortcutsConfig.goNext();
        }
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      if (!isNavBlockedByFocus(activeEl)) {
        e.preventDefault();
        if (window.StudyMode && typeof window.StudyMode.isActive === 'function' && window.StudyMode.isActive()) {
          window.StudyMode.goPrevious();
        } else if (typeof shortcutsConfig.goPrevious === 'function') {
          shortcutsConfig.goPrevious();
        }
      }
      return;
    }

    // S / s / ד -> Toggle studied status
    if (e.key === 's' || e.key === 'S' || e.key === 'ד') {
      e.preventDefault();
      if (typeof shortcutsConfig.toggleStudied === 'function') {
        shortcutsConfig.toggleStudied();
      }
      return;
    }

    // N / n / מ -> Focus notes
    if (e.key === 'n' || e.key === 'N' || e.key === 'מ') {
      e.preventDefault();
      if (typeof shortcutsConfig.focusNotes === 'function') {
        shortcutsConfig.focusNotes();
      }
      return;
    }

    // F / f / / / כ -> Focus search
    if (e.key === 'f' || e.key === 'F' || e.key === '/' || e.key === 'כ') {
      e.preventDefault();
      if (typeof shortcutsConfig.focusSearch === 'function') {
        shortcutsConfig.focusSearch();
      }
      return;
    }

    // T / t / א -> Open / focus TOC
    if (e.key === 't' || e.key === 'T' || e.key === 'א') {
      e.preventDefault();
      if (typeof shortcutsConfig.openToc === 'function') {
        shortcutsConfig.openToc();
      }
      return;
    }
  }

  function init(options) {
    if (options && typeof options === 'object') {
      shortcutsConfig.goNext = options.goNext || null;
      shortcutsConfig.goPrevious = options.goPrevious || null;
      shortcutsConfig.toggleStudied = options.toggleStudied || null;
      shortcutsConfig.focusNotes = options.focusNotes || null;
      shortcutsConfig.focusSearch = options.focusSearch || null;
      shortcutsConfig.openToc = options.openToc || null;
      shortcutsConfig.onEscape = options.onEscape || null;
    }

    window.removeEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
  }

  window.TopicShortcuts = {
    init: init,
    openHelpDialog: openHelpDialog,
    closeHelpDialog: closeHelpDialog,
    isHelpDialogOpen: isHelpDialogOpen
  };
})();
