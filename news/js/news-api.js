/**
 * @typedef {Object} NewsTopic
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} NewsFeed
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} [description]
 */

/**
 * @typedef {Object} NewsItem
 * @property {string} id
 * @property {string} titleHe
 * @property {string} [originalTitle]
 * @property {string} summaryHe
 * @property {string} sourceName
 * @property {string} sourceUrl
 * @property {string} [category]
 * @property {string} [location]
 * @property {string} [companyTopic]
 * @property {number} [importanceScore]
 * @property {number} [personalScore]
 * @property {boolean} isFeatured
 * @property {boolean} includedInBriefing
 * @property {boolean} isActive
 * @property {string} displayWeekStart
 * @property {string} [publishedAt]
 * @property {string} collectedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {NewsFeed} feed
 * @property {NewsTopic[]} topics
 */

const NEXT_PUBLIC_NEWS_API_BASE_URL = 'https://lidabenzotracker.onrender.com/api/news';

const NewsApi = {
    /**
     * @param {string} feedCode
     * @returns {Promise<NewsItem[]>}
     */
    getCurrentWeekNews: async function(feedCode) {
        const url = new URL(NEXT_PUBLIC_NEWS_API_BASE_URL + '/current-week');
        url.searchParams.append('feedCode', feedCode);
        
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch news for feed: ' + feedCode);
        }
        return response.json();
    },

    /**
     * @param {Object} params
     * @param {string} [params.q]
     * @param {string} [params.feedCode]
     * @param {string} [params.category]
     * @param {string} [params.location]
     * @param {string} [params.from]
     * @param {string} [params.to]
     * @returns {Promise<NewsItem[]>}
     */
    searchNews: async function(params) {
        const url = new URL(NEXT_PUBLIC_NEWS_API_BASE_URL + '/search');
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.append(key, params[key]);
                }
            });
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to search news');
        }
        return response.json();
    },

    /**
     * @param {string} id
     * @returns {Promise<NewsItem>}
     */
    getArticle: async function(id) {
        const url = new URL(NEXT_PUBLIC_NEWS_API_BASE_URL + '/' + id);
        const response = await fetch(url.toString());
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch article: ' + id);
        }
        return response.json();
    }
};
