(() => {
    // app.js exposes these bindings to classic scripts loaded after it.
    // Keep Israel support isolated so the existing Romania/Technology flow stays untouched.
    state.news.israel = [];

    const originalGenerateCombinedNews = generateCombinedNews;
    const originalRenderCurrentView = renderCurrentView;
    const originalRenderArticle = renderArticle;

    generateCombinedNews = function(romaniaNews = [], technologyNews = []) {
        const israelNews = state.news.israel || [];
        return originalGenerateCombinedNews(
            [...romaniaNews, ...israelNews],
            technologyNews
        );
    };

    function renderIsrael(items) {
        if (!items || items.length === 0) return renderEmpty();

        const groups = [
            {
                key: 'security',
                title: 'ביטחון ומדיני',
                match: (item) => hasTerm(item, 'security') || hasTerm(item, 'defense') || hasTerm(item, 'military') ||
                    hasTerm(item, 'ביטחון') || hasTerm(item, 'צבא') || hasTopic(item, 'security') || hasTopic(item, 'defense')
            },
            {
                key: 'politics',
                title: 'פוליטיקה וממשלה',
                match: (item) => hasTerm(item, 'politics') || hasTerm(item, 'government') ||
                    hasTerm(item, 'פוליטיקה') || hasTerm(item, 'ממשלה') || hasTopic(item, 'politics')
            },
            {
                key: 'economy',
                title: 'כלכלה ועסקים',
                match: (item) => hasTerm(item, 'economy') || hasTerm(item, 'business') ||
                    hasTerm(item, 'כלכלה') || hasTerm(item, 'עסקים') || hasTopic(item, 'economy') || hasTopic(item, 'business')
            },
            {
                key: 'sports',
                title: 'ספורט',
                match: (item) => hasTerm(item, 'sports') || hasTerm(item, 'football') ||
                    hasTerm(item, 'ספורט') || hasTerm(item, 'כדורגל') || hasTopic(item, 'sports') || hasTopic(item, 'football')
            }
        ];

        renderCategorizedFeed(items, groups);
    }

    renderCurrentView = function() {
        if (state.isSearching) {
            renderSearch(state.news.search);
            return;
        }

        if (state.currentTab === 'israel') {
            renderIsrael(state.news.israel);
            return;
        }

        originalRenderCurrentView();
    };

    renderArticle = function(item) {
        originalRenderArticle(item);

        if (item?.feed?.code !== 'israel') return;

        const categoryLabel = UI.content.querySelector('.article-category-label');
        if (categoryLabel && (!item.location && !item.category)) {
            categoryLabel.textContent = 'ישראל';
        }

        const originalTitle = UI.content.querySelector('.article-original-title');
        if (originalTitle) originalTitle.setAttribute('dir', 'rtl');

        const originalLink = UI.content.querySelector('.action-original-large');
        if (originalLink) originalLink.textContent = 'לכתבה המקורית בעברית ↗';
    };

    async function loadIsraelFeed() {
        try {
            const israelNews = await NewsApi.getCurrentWeekNews('israel');
            state.news.israel = israelNews || [];

            state.news.forme = generateCombinedNews(
                state.news.romania || [],
                state.news.technology || []
            );

            updateLastUpdateTime();

            if (!state.isArticleView && !state.isSearching && state.currentTab === 'israel') {
                renderCurrentView();
            }
        } catch (err) {
            console.error('Failed to load Israel news:', err);
            state.news.israel = [];

            if (!state.isArticleView && !state.isSearching && state.currentTab === 'israel') {
                renderCurrentView();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', loadIsraelFeed);
})();
