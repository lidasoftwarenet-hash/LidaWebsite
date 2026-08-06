// Topic-specific script for "Angular - Frontend" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/frontend/data/topic.json');
  }
});
