// Topic-specific script for "Live Coding" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/live-coding/data/topic.json');
  }
});
