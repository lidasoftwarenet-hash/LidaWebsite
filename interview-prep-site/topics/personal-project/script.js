// Topic-specific script for "הפרויקט האישי שלי" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/personal-project/data/topic.json');
  }
});
