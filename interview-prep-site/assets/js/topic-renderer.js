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
  topicData: null
};

// Removes all children of an element without using innerHTML.
function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

// Reads the current subtopic id from the URL hash (e.g. "#oop" -> "oop").
// Returns null if there is no hash.
function getHashSectionId() {
  var hash = window.location.hash.replace(/^#/, '');
  return hash || null;
}

/* --------------------------------------------------------------------------
   Subtopic navigation list (#section-list)
   -------------------------------------------------------------------------- */

function renderSectionNav(topicData, activeId) {
  var list = document.getElementById('section-list');
  if (!list) {
    return;
  }

  clearElement(list);

  topicData.sections.forEach(function (section) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.className = 'section-link';
    link.href = '#' + section.id;
    link.textContent = section.title;

    if (section.id === activeId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'true');
    }

    item.appendChild(link);
    list.appendChild(item);
  });
}

/* --------------------------------------------------------------------------
   Section title (#section-title)
   -------------------------------------------------------------------------- */

function renderSectionTitle(title) {
  var titleEl = document.getElementById('section-title');
  if (!titleEl) {
    return;
  }
  titleEl.textContent = title || '';
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

function buildHeadingBlock(block) {
  var level = block.level;
  if (typeof level !== 'number' || level < 2 || level > 6) {
    level = 3;
  }
  var heading = document.createElement('h' + level);
  heading.className = 'content-block content-heading';
  heading.textContent = block.text || '';
  return heading;
}

function buildBulletListBlock(block) {
  var list = document.createElement('ul');
  list.className = 'content-block content-bullet-list';
  (block.items || []).forEach(function (itemText) {
    var item = document.createElement('li');
    item.textContent = itemText;
    list.appendChild(item);
  });
  return list;
}

function buildCodeBlock(block) {
  var pre = document.createElement('pre');
  pre.className = 'content-block content-code';

  var header = document.createElement('div');
  header.className = 'content-code-header';

  var language = document.createElement('span');
  language.className = 'content-code-language';
  language.textContent = block.language || '';
  if (!block.language) {
    language.hidden = true;
  }
  header.appendChild(language);

  var copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'content-code-copy';
  copyButton.textContent = 'העתקה';
  copyButton.setAttribute('aria-label', 'העתקת קוד ללוח');
  header.appendChild(copyButton);

  pre.appendChild(header);

  var code = document.createElement('code');
  code.textContent = block.code || '';
  pre.appendChild(code);

  copyButton.addEventListener('click', function () {
    copyCodeToClipboard(block.code || '', copyButton);
  });

  return pre;
}

// Copies text to the clipboard using the modern Clipboard API when
// available, falling back to a hidden textarea + execCommand for older or
// restricted contexts. Shows brief success feedback on the button either
// way; silently leaves the button unchanged if both methods fail.
function copyCodeToClipboard(text, buttonEl) {
  function showCopied() {
    var originalLabel = buttonEl.textContent;
    buttonEl.textContent = 'הועתק!';
    buttonEl.classList.add('is-copied');
    setTimeout(function () {
      buttonEl.textContent = originalLabel;
      buttonEl.classList.remove('is-copied');
    }, 1500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showCopied, function () {
      fallbackCopy(text, showCopied);
    });
  } else {
    fallbackCopy(text, showCopied);
  }
}

function fallbackCopy(text, onSuccess) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (document.execCommand('copy')) {
      onSuccess();
    }
  } catch (copyError) {
    // Copying is unsupported in this context; leave the button as-is.
  }
  document.body.removeChild(textarea);
}

function buildCalloutBlock(block) {
  var callout = document.createElement('div');
  callout.className = 'content-block content-callout';
  if (block.variant) {
    callout.classList.add('content-callout-' + block.variant);
  }
  var text = document.createElement('p');
  text.textContent = block.text || '';
  callout.appendChild(text);
  return callout;
}

function buildQaBlock(block) {
  var wrapper = document.createElement('div');
  wrapper.className = 'content-block content-qa';

  var question = document.createElement('p');
  question.className = 'qa-question';
  question.textContent = block.question || '';

  var answer = document.createElement('p');
  answer.className = 'qa-answer';
  answer.textContent = block.answer || '';

  wrapper.appendChild(question);
  wrapper.appendChild(answer);
  return wrapper;
}

var blockBuilders = {
  paragraph: buildParagraphBlock,
  heading: buildHeadingBlock,
  bulletList: buildBulletListBlock,
  code: buildCodeBlock,
  callout: buildCalloutBlock,
  qa: buildQaBlock
};

function renderSectionBlocks(blocks) {
  var container = document.getElementById('section-content');
  if (!container) {
    return;
  }

  clearElement(container);

  (blocks || []).forEach(function (block) {
    var builder = blockBuilders[block.type];
    if (!builder) {
      return;
    }
    container.appendChild(builder(block));
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
async function loadAndRenderSection(sectionId) {
  var topicData = topicPageState.topicData;
  renderSectionNav(topicData, sectionId);

  var sectionMeta = topicData.sections.find(function (section) {
    return section.id === sectionId;
  });

  if (!sectionMeta) {
    showSectionError('הנושא המשני המבוקש אינו קיים.', true);
    return;
  }

  showSectionLoading();

  try {
    var content = await loadSectionContent(topicPageState.topicPath, sectionMeta.file);
    renderSectionTitle(content.title || sectionMeta.title);
    renderSectionBlocks(content.blocks);
    renderSectionPager(topicData, sectionId);
    hideSectionLoading();
    showSectionContent();

    if (typeof StudyUI !== 'undefined' && topicData.id) {
      StudyUI.onSectionLoaded(topicData.id, sectionId, topicData);
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
  if (sectionId) {
    loadAndRenderSection(sectionId);
  }
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

  var hasExplicitHash = Boolean(getHashSectionId());
  var hashSectionId = getHashSectionId();
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
    await loadAndRenderSection(initialSectionId);
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
