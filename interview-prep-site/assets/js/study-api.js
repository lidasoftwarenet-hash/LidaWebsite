// Backend API client for interview prep study tracking.
// This is the ONLY file containing fetch calls and the backend base URL
// for the interview prep application.

var STUDY_API_BASE_URL = 'https://lidabenzotracker.onrender.com';

var StudyApi = {
  // Returns all section study states across all topics.
  // GET /api/interview-prep/sections
  getAllStates: async function () {
    var response = await fetch(STUDY_API_BASE_URL + '/api/interview-prep/sections');
    if (!response.ok) {
      throw new Error('Failed to fetch sections: ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  },

  // Returns all section study states for a specific topic.
  // GET /api/interview-prep/sections?topicId=:topicId
  getTopicStates: async function (topicId) {
    var url = STUDY_API_BASE_URL + '/api/interview-prep/sections' + (topicId ? '?topicId=' + encodeURIComponent(topicId) : '');
    var response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch topic sections for ' + topicId + ': ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  },

  // Updates status, note, and/or visited flag for a specific section.
  // PATCH /api/interview-prep/topics/:topicId/sections/:sectionId
  updateSection: async function (topicId, sectionId, changes) {
    var url = STUDY_API_BASE_URL + '/api/interview-prep/topics/' + encodeURIComponent(topicId) + '/sections/' + encodeURIComponent(sectionId);
    var response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changes || {})
    });
    if (!response.ok) {
      throw new Error('Failed to update section ' + sectionId + ': ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  },

  // Deletes study state for a specific section.
  // DELETE /api/interview-prep/topics/:topicId/sections/:sectionId
  deleteSection: async function (topicId, sectionId) {
    var url = STUDY_API_BASE_URL + '/api/interview-prep/topics/' + encodeURIComponent(topicId) + '/sections/' + encodeURIComponent(sectionId);
    var response = await fetch(url, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete section ' + sectionId + ': ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  },

  // Deletes all study states for an entire topic.
  // DELETE /api/interview-prep/topics/:topicId
  resetTopic: async function (topicId) {
    var url = STUDY_API_BASE_URL + '/api/interview-prep/topics/' + encodeURIComponent(topicId);
    var response = await fetch(url, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to reset topic ' + topicId + ': ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  }
};
