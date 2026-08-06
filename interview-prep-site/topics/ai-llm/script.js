// Topic-specific script for "AI / LLM" — initializes the reusable topic content engine.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initTopicPage === 'function') {
    initTopicPage('/interview-prep-site/topics/ai-llm/data/topic.json');
  }
});
