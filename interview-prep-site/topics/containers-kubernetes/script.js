// Topic-specific script for "Containers & Kubernetes" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/containers-kubernetes/data/topic.json');
  }
});
