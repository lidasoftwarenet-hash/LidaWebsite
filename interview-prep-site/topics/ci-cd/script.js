// Topic-specific script for "CI/CD" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/ci-cd/data/topic.json');
  }
});
