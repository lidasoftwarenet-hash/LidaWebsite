// Topic-specific script for "GCP Cloud" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/cloud-gcp/data/topic.json');
  }
});
