// Topic-specific script for "JavaScript / Node.js" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/javascript-nodejs/data/topic.json');
  }
});
