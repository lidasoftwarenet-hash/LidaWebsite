// Topic-specific script for "Java" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('./data/topic.json');
  }
});
