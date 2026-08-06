// Topic-specific script for "System Design" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/system-design/data/topic.json');
  }
});
