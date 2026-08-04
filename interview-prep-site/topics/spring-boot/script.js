// Topic-specific script for "Spring Boot" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/spring-boot/data/topic.json');
  }
});
