// Topic content loader: fetches a topic's data/topic.json and its section
// JSON files over HTTP, using fetch. Contains no rendering or HTML
// generation logic — only loading and error handling.

// Resolves the directory portion of a topic.json path, e.g.
// "./data/topic.json" -> "./data/". Used to resolve section file paths,
// which are given relative to the topic.json location.
function getTopicBasePath(topicPath) {
  var lastSlash = topicPath.lastIndexOf('/');
  return lastSlash === -1 ? '' : topicPath.slice(0, lastSlash + 1);
}

// Loads and parses a topic's topic.json file.
// Returns a Promise resolving to the parsed topic definition, or rejecting
// with a descriptive Error on network failure, bad HTTP status, or invalid JSON.
async function loadTopicDefinition(topicPath) {
  var response;
  try {
    response = await fetch(topicPath);
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
  var url = getTopicBasePath(topicPath) + sectionFile;
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
    throw new Error('תוכן הנושא המשני אינו תקין (JSON שגוי).');
  }
}
