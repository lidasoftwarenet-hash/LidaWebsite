// CodeBlockEditor: CodeMirror 6 integration for interactive and syntax-highlighted code blocks.
// Loads CodeMirror 6 packages on demand via ESM from a CDN without requiring npm or bundlers.
// Reuses module promises and provides an instant styled fallback if CDN loading fails or is offline.

(function () {
  'use strict';

  var CDN_BASE = 'https://esm.sh';
  var coreModulesPromise = null;
  var languagePromises = {};
  var hasLoggedFallbackWarning = false;

  // Language mapping to ESM modules
  var LANGUAGE_MAP = {
    'javascript': { pkg: '@codemirror/lang-javascript@6', fn: function (m) { return m.javascript(); } },
    'js': { pkg: '@codemirror/lang-javascript@6', fn: function (m) { return m.javascript(); } },
    'typescript': { pkg: '@codemirror/lang-javascript@6', fn: function (m) { return m.javascript({ typescript: true }); } },
    'ts': { pkg: '@codemirror/lang-javascript@6', fn: function (m) { return m.javascript({ typescript: true }); } },
    'java': { pkg: '@codemirror/lang-java@6', fn: function (m) { return m.java(); } },
    'json': { pkg: '@codemirror/lang-json@6', fn: function (m) { return m.json(); } },
    'html': { pkg: '@codemirror/lang-html@6', fn: function (m) { return m.html(); } },
    'css': { pkg: '@codemirror/lang-css@6', fn: function (m) { return m.css(); } },
    'sql': { pkg: '@codemirror/lang-sql@6', fn: function (m) { return m.sql(); } },
    'yaml': { pkg: '@codemirror/lang-yaml@6', fn: function (m) { return m.yaml(); } },
    'yml': { pkg: '@codemirror/lang-yaml@6', fn: function (m) { return m.yaml(); } }
  };

  function loadCoreModules() {
    if (!coreModulesPromise) {
      coreModulesPromise = Promise.all([
        import(CDN_BASE + '/@codemirror/state@6'),
        import(CDN_BASE + '/@codemirror/view@6'),
        import(CDN_BASE + '/@codemirror/language@6'),
        import(CDN_BASE + '/@codemirror/theme-one-dark@6')
      ]).then(function (modules) {
        return {
          state: modules[0],
          view: modules[1],
          language: modules[2],
          theme: modules[3]
        };
      });
    }
    return coreModulesPromise;
  }

  function loadLanguageExtension(lang) {
    if (!lang || typeof lang !== 'string') {
      return Promise.resolve(null);
    }
    var key = lang.trim().toLowerCase();
    var mapping = LANGUAGE_MAP[key];
    if (!mapping) {
      // Unsupported language (e.g. bash, shell, text, dockerfile) — render plain text safely
      return Promise.resolve(null);
    }

    if (!languagePromises[key]) {
      languagePromises[key] = import(CDN_BASE + '/' + mapping.pkg)
        .then(function (module) {
          return mapping.fn(module);
        })
        .catch(function (err) {
          console.warn('⚠️ CodeBlockEditor: Could not load language parser for "' + lang + '", rendering plain text.', err);
          return null;
        });
    }
    return languagePromises[key];
  }

  function renderFallback(container, codeText) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    var pre = document.createElement('pre');
    pre.className = 'code-editor-fallback';
    var code = document.createElement('code');
    code.textContent = codeText || '';
    pre.appendChild(code);
    container.appendChild(pre);
  }

  function render(container, options) {
    if (!container) {
      return Promise.resolve(null);
    }

    var opts = options || {};
    var code = typeof opts.code === 'string' ? opts.code : '';
    var language = typeof opts.language === 'string' ? opts.language : '';
    var editable = opts.editable === true;
    var showLineNumbers = opts.showLineNumbers !== false;

    // Render fallback element immediately for instant display while modules load
    renderFallback(container, code);

    return Promise.all([
      loadCoreModules(),
      loadLanguageExtension(language)
    ]).then(function (results) {
      var core = results[0];
      var langExtension = results[1];

      var extensions = [
        core.theme.oneDark,
        core.language.syntaxHighlighting(core.language.defaultHighlightStyle, { fallback: true }),
        core.language.bracketMatching(),
        core.view.highlightSpecialChars(),
        core.view.highlightActiveLine(),
        core.view.EditorView.lineWrapping,
        core.state.EditorState.readOnly.of(!editable),
        core.view.EditorView.editable.of(editable)
      ];

      if (showLineNumbers) {
        extensions.unshift(core.view.lineNumbers(), core.view.highlightActiveLineGutter());
      }

      if (langExtension) {
        extensions.push(langExtension);
      }

      // Clear the fallback before attaching CodeMirror editor view
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      var state = core.state.EditorState.create({
        doc: code,
        extensions: extensions
      });

      var view = new core.view.EditorView({
        state: state,
        parent: container
      });

      return view;
    }).catch(function (err) {
      if (!hasLoggedFallbackWarning) {
        console.warn('⚠️ CodeBlockEditor: Failed to load CodeMirror modules from CDN, falling back to static code block.', err);
        hasLoggedFallbackWarning = true;
      }
      renderFallback(container, code);
      return null;
    });
  }

  window.CodeBlockEditor = {
    render: render
  };
})();
