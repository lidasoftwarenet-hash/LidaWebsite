// Topic-specific script for "TypeScript" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/typescript/data/topic.json');
  }
});
