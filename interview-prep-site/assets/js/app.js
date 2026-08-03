// Main application entry point / initialization. Wires up the shared,
// page-agnostic modules that every page loads (global navigation, mobile
// drawer, continue-learning widget) once the DOM is ready. Topic-specific
// initialization (the content engine) is triggered separately by each
// topic's own script.js, which runs after this file.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initNavigation === 'function') {
    initNavigation();
  }
  if (typeof renderContinueLearning === 'function') {
    renderContinueLearning();
  }
  if (typeof initMobileNav === 'function') {
    initMobileNav();
  }
  if (typeof TopicFiles !== 'undefined' && typeof getCurrentTopicId === 'function') {
    var currentTopicId = getCurrentTopicId();
    if (currentTopicId) {
      TopicFiles.init(currentTopicId);
    }
  }
});
