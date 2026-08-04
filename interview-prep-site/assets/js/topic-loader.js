// Topic content loader: fetches a topic's data/topic.json and its section
// JSON files over HTTP, using fetch. Contains no rendering or HTML
// generation logic — only loading and error handling.

// Resolves relative or absolute topic.json paths to an absolute root-relative path
function normalizeTopicPath(topicPath) {
  if (topicPath && (topicPath.startsWith('/') || topicPath.startsWith('http://') || topicPath.startsWith('https://'))) {
    return topicPath;
  }

  // Extract topic ID from URL path, e.g. /interview-prep-site/topics/java/index.html -> "java"
  var pathname = window.location.pathname || '';
  var match = pathname.match(/\/topics\/([^\/\.]+)/i);
  var topicId = match && match[1] ? match[1] : '';

  var cleanPath = topicPath ? topicPath.replace(/^\.\//, '') : 'data/topic.json';

  if (topicId) {
    return '/interview-prep-site/topics/' + topicId + '/' + cleanPath;
  }
  return '/interview-prep-site/' + cleanPath;
}

// Resolves the directory portion of a topic.json path, e.g.
// "/interview-prep-site/topics/java/data/topic.json" -> "/interview-prep-site/topics/java/data/".
// Used to resolve section file paths, which are given relative to the topic.json location.
function getTopicBasePath(topicPath) {
  var resolved = normalizeTopicPath(topicPath);
  var lastSlash = resolved.lastIndexOf('/');
  return lastSlash === -1 ? '' : resolved.slice(0, lastSlash + 1);
}

// Loads and parses a topic's topic.json file.
// Returns a Promise resolving to the parsed topic definition, or rejecting
// with a descriptive Error on network failure, bad HTTP status, or invalid JSON.
async function loadTopicDefinition(topicPath) {
  var resolvedPath = normalizeTopicPath(topicPath);
  var response;
  try {
    response = await fetch(resolvedPath);
  } catch (networkError) {
    throw new Error('לא ניתן היה לטעון את הגדרת הנושא (שגיאת רשת).');
  }

  if (!response.ok) {
    throw new Error('לא ניתן היה לטעון את הגדרת הנושא (סטטוס ' + response.status + ').');
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('הגדרת הנושא אינה תקינה (JSON שגוי).');
  }
}

// Loads and parses a section's JSON file, given the topic.json path (used to
// resolve the relative section file location) and the section's `file` field.
// Returns a Promise resolving to the parsed section content, or rejecting
// with a descriptive Error on network failure, bad HTTP status, or invalid JSON.
async function loadSectionContent(topicPath, sectionFile) {
  var basePath = getTopicBasePath(topicPath);
  var url = sectionFile.startsWith('/') ? sectionFile : (basePath + sectionFile);
  var response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error('לא ניתן היה לטעון את תוכן הנושא המשני (שגיאת רשת).');
  }

  if (!response.ok) {
    throw new Error('לא ניתן היה לטעון את תוכן הנושא המשני (סטטוס ' + response.status + ').');
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('תוכן הנושא המשני אינה תקינה (JSON שגוי).');
  }
}
