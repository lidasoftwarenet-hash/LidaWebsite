// Topic-specific script for "הסיפור האישי שלי" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/personal-story/data/topic.json');
  }
});
