// Topic Files Storage and UI Manager
// Uses browser IndexedDB to persist user-uploaded documents (PDF, Word, Excel, CSV)
// privately and locally per topic with no server requirement and no strict 5MB quota limit.

var TOPIC_FILES_DB_NAME = 'InterviewPrepFilesDB';
var TOPIC_FILES_DB_VERSION = 1;
var TOPIC_FILES_STORE_NAME = 'topicFiles';

var ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ods', 'rtf'];

var ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/rtf'
];

var dbInstancePromise = null;

function getFilesDB() {
  if (dbInstancePromise) {
    return dbInstancePromise;
  }

  dbInstancePromise = new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    var request = window.indexedDB.open(TOPIC_FILES_DB_NAME, TOPIC_FILES_DB_VERSION);

    request.onupgradeneeded = function (event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains(TOPIC_FILES_STORE_NAME)) {
        var store = db.createObjectStore(TOPIC_FILES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('topicId', 'topicId', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject(event.target.error);
    };
  });

  return dbInstancePromise;
}

function getFileExtension(filename) {
  var parts = (filename || '').split('.');
  if (parts.length < 2) return '';
  return parts.pop().toLowerCase();
}

function isValidFileType(file) {
  var ext = getFileExtension(file.name);
  if (ALLOWED_FILE_EXTENSIONS.indexOf(ext) !== -1) {
    return true;
  }
  if (file.type && ALLOWED_MIME_TYPES.indexOf(file.type) !== -1) {
    return true;
  }
  return false;
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes === 0) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

function getFileTypeDetails(filename, mimeType) {
  var ext = getFileExtension(filename);
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return { label: 'PDF', class: 'file-type-pdf', icon: '📄' };
  }
  if (ext === 'doc' || ext === 'docx' || ext === 'rtf') {
    return { label: 'DOC', class: 'file-type-doc', icon: '📝' };
  }
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv' || ext === 'ods') {
    return { label: ext.toUpperCase(), class: 'file-type-sheet', icon: '📊' };
  }
  return { label: 'DOC', class: 'file-type-default', icon: '📎' };
}

var TopicFilesStore = {
  getFilesByTopic: function (topicId) {
    return getFilesDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(TOPIC_FILES_STORE_NAME, 'readonly');
        var store = tx.objectStore(TOPIC_FILES_STORE_NAME);
        var index = store.index('topicId');
        var request = index.getAll(topicId);

        request.onsuccess = function () {
          var results = request.result || [];
          results.sort(function (a, b) {
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
          });
          resolve(results);
        };

        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  },

  saveFile: function (topicId, file) {
    return new Promise(function (resolve, reject) {
      if (!isValidFileType(file)) {
        reject(new Error('סוג קובץ לא נתמך. ניתן להעלות מסמכי PDF, Word (doc, docx) וגליונות אלקטרוניים (xls, xlsx, csv) בלבד.'));
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var fileData = e.target.result;
        getFilesDB().then(function (db) {
          var tx = db.transaction(TOPIC_FILES_STORE_NAME, 'readwrite');
          var store = tx.objectStore(TOPIC_FILES_STORE_NAME);

          var record = {
            topicId: topicId,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            extension: getFileExtension(file.name),
            uploadedAt: new Date().toISOString(),
            data: fileData
          };

          var req = store.add(record);
          req.onsuccess = function () {
            resolve(req.result);
          };
          req.onerror = function () {
            reject(req.error);
          };
        }).catch(reject);
      };

      reader.onerror = function () {
        reject(new Error('שגיאה בקריאת הקובץ מהמחשב.'));
      };

      reader.readAsDataURL(file);
    });
  },

  deleteFile: function (fileId) {
    return getFilesDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(TOPIC_FILES_STORE_NAME, 'readwrite');
        var store = tx.objectStore(TOPIC_FILES_STORE_NAME);
        var req = store.delete(fileId);

        req.onsuccess = function () {
          resolve(true);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }
};

var TopicFilesUI = {
  currentTopicId: null,

  init: function (topicId) {
    if (!topicId) return;
    this.currentTopicId = topicId;

    var main = document.querySelector('.topic-main');
    if (!main) return;

    var existing = document.getElementById('topic-files-section');
    if (existing) {
      existing.remove();
    }

    var section = document.createElement('section');
    section.id = 'topic-files-section';
    section.className = 'topic-files-section';
    section.setAttribute('aria-label', 'קבצים ומסמכים מצורפים');

    section.innerHTML = 
      '<div class="topic-files-header">' +
        '<div class="topic-files-title-wrap">' +
          '<h2 class="topic-files-title">קבצים ומסמכים מצורפים</h2>' +
          '<p class="topic-files-subtitle">העלאת סיכומים, מסמכים (Word / PDF) וגליונות נתונים (Excel / CSV) לנושא זה</p>' +
        '</div>' +
        '<span class="topic-files-badge">PDF / DOC / XLS</span>' +
      '</div>' +
      '<div class="topic-files-dropzone" id="topic-files-dropzone">' +
        '<input type="file" id="topic-file-input" class="topic-file-input" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ods,.rtf" multiple>' +
        '<div class="topic-files-dropzone-content">' +
          '<div class="dropzone-icon" aria-hidden="true">📁</div>' +
          '<p class="dropzone-text"><strong>גררו קבצים לכאן</strong> או <span class="dropzone-browse">לחצו לבחירת קבצים</span></p>' +
          '<p class="dropzone-hint">פורמטים נתמכים: PDF, Word (.doc, .docx), Excel (.xls, .xlsx, .csv)</p>' +
        '</div>' +
      '</div>' +
      '<div class="topic-files-feedback" id="topic-files-feedback" role="alert" hidden></div>' +
      '<div class="topic-files-list-container">' +
        '<h3 class="topic-files-list-title">קבצים שהועלו (<span id="topic-files-count">0</span>)</h3>' +
        '<div class="topic-files-list" id="topic-files-list">' +
          '<p class="topic-files-empty">טוען קבצים...</p>' +
        '</div>' +
      '</div>';

    main.appendChild(section);
    this.bindEvents(topicId);
    this.renderList(topicId);
  },

  bindEvents: function (topicId) {
    var self = this;
    var dropzone = document.getElementById('topic-files-dropzone');
    var fileInput = document.getElementById('topic-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
      if (e.target.files && e.target.files.length > 0) {
        self.handleFiles(topicId, e.target.files);
        fileInput.value = '';
      }
    });

    ['dragenter', 'dragover'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        self.handleFiles(topicId, e.dataTransfer.files);
      }
    });
  },

  showFeedback: function (message, isError) {
    var feedback = document.getElementById('topic-files-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = 'topic-files-feedback ' + (isError ? 'feedback-error' : 'feedback-success');
    feedback.hidden = false;

    setTimeout(function () {
      feedback.hidden = true;
    }, 5000);
  },

  handleFiles: function (topicId, filesList) {
    var self = this;
    var validFiles = [];
    var invalidFiles = [];

    for (var i = 0; i < filesList.length; i++) {
      var file = filesList[i];
      if (isValidFileType(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      self.showFeedback('הקובץ "' + invalidFiles.join(', ') + '" נדחה. ניתן להעלות קובצי PDF, Word (doc, docx) וגליונות אלקטרוניים (xls, xlsx, csv) בלבד.', true);
    }

    if (validFiles.length === 0) return;

    var savePromises = validFiles.map(function (file) {
      return TopicFilesStore.saveFile(topicId, file);
    });

    Promise.all(savePromises).then(function () {
      self.showFeedback('הועלו בהצלחה ' + validFiles.length + ' קבצים.', false);
      self.renderList(topicId);
    }).catch(function (err) {
      self.showFeedback(err.message || 'שגיאה בשמירת הקבצים.', true);
    });
  },

  renderList: function (topicId) {
    var self = this;
    var listEl = document.getElementById('topic-files-list');
    var countEl = document.getElementById('topic-files-count');
    if (!listEl) return;

    TopicFilesStore.getFilesByTopic(topicId).then(function (files) {
      if (countEl) {
        countEl.textContent = files.length;
      }

      if (!files || files.length === 0) {
        listEl.innerHTML = '<p class="topic-files-empty">טרם הועלו קבצים לנושא זה. גררו קובץ לכאן או לחצו לבחירה.</p>';
        return;
      }

      listEl.innerHTML = '';
      files.forEach(function (fileRecord) {
        var typeInfo = getFileTypeDetails(fileRecord.name, fileRecord.type);
        var dateFormatted = new Date(fileRecord.uploadedAt).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        var item = document.createElement('div');
        item.className = 'topic-file-item';

        item.innerHTML =
          '<div class="file-item-main">' +
            '<div class="file-item-badge ' + typeInfo.class + '">' +
              '<span class="file-item-icon">' + typeInfo.icon + '</span>' +
              '<span class="file-item-ext">' + typeInfo.label + '</span>' +
            '</div>' +
            '<div class="file-item-details">' +
              '<p class="file-item-name" title="' + fileRecord.name + '">' + fileRecord.name + '</p>' +
              '<p class="file-item-meta">' + formatBytes(fileRecord.size) + ' · הועלה ב-' + dateFormatted + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="file-item-actions">' +
            '<button type="button" class="button-secondary file-action-download" title="הורדה / פתיחה">' +
              '📥 הורדה' +
            '</button>' +
            '<button type="button" class="button-danger-ghost file-action-delete" title="מחיקת קובץ">' +
              '🗑️ מחיקה' +
            '</button>' +
          '</div>';

        var downloadBtn = item.querySelector('.file-action-download');
        downloadBtn.addEventListener('click', function () {
          self.downloadFile(fileRecord);
        });

        var deleteBtn = item.querySelector('.file-action-delete');
        deleteBtn.addEventListener('click', function () {
          var confirmed = window.confirm('האם למחוק את הקובץ "' + fileRecord.name + '"?');
          if (confirmed) {
            TopicFilesStore.deleteFile(fileRecord.id).then(function () {
              self.renderList(topicId);
              self.showFeedback('הקובץ נמחק.', false);
            });
          }
        });

        listEl.appendChild(item);
      });
    }).catch(function (err) {
      listEl.innerHTML = '<p class="topic-files-empty error">שגיאה בטעינת הקבצים.</p>';
    });
  },

  downloadFile: function (fileRecord) {
    if (!fileRecord.data) return;
    var link = document.createElement('a');
    link.href = fileRecord.data;
    link.download = fileRecord.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.TopicFiles = {
  Store: TopicFilesStore,
  UI: TopicFilesUI,
  init: function (topicId) {
    TopicFilesUI.init(topicId);
  }
};
