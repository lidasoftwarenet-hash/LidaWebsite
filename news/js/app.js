// UI Elements
const UI = {
    tabs: document.querySelectorAll('.feed-btn[data-feed]'),
    searchToggle: document.getElementById('searchToggleBtn'),
    searchSection: document.getElementById('searchSection'),
    closeSearchBtn: document.getElementById('closeSearchBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    feedFilter: document.getElementById('feedFilter'),
    dateFilter: document.getElementById('dateFilter'),
    customDateRange: document.getElementById('customDateRange'),
    dateFrom: document.getElementById('dateFrom'),
    dateTo: document.getElementById('dateTo'),
    archiveWarning: document.getElementById('archiveWarning'),
    content: document.getElementById('newsContent'),
    error: document.getElementById('newsError'),
    lastUpdated: document.getElementById('lastUpdated')
};

// Application State
const state = {
    currentTab: 'forme',
    isSearching: false,
    searchParams: { q: '', feedCode: '', from: '', to: '' },
    searchDebounceTimer: null,
    searchAbortController: null,
    isArticleView: false,
    currentArticleId: null,
    news: {
        forme: null,
        romania: null,
        technology: null,
        search: null
    }
};

/**
 * Route parsing helper
 */
function getArticleIdFromPath(pathname) {
    const normalized = pathname.replace(/\/+$/, '');
    if (
        normalized === '/news' ||
        normalized === '/news/index' ||
        normalized === '/news/index.html'
    ) {
        return null;
    }
    const match = normalized.match(/^\/news\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Initialize the application
 */
async function init() {
    setupEventListeners();
    
    // Check if URL is an article view
    const articleId = getArticleIdFromPath(window.location.pathname);
    if (articleId) {
        openArticle(articleId, true, true);
        return;
    }

    // Check URL state for deep-linked search
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q') || urlParams.has('feed') || urlParams.has('date')) {
        restoreSearchFromURL(urlParams);
        return;
    }

    renderEditorialSkeleton();

    try {
        const [romaniaResult, techResult] = await Promise.allSettled([
            NewsApi.getCurrentWeekNews('romania'),
            NewsApi.getCurrentWeekNews('technology')
        ]);

        const rNews = romaniaResult.status === 'fulfilled' ? romaniaResult.value : null;
        const tNews = techResult.status === 'fulfilled' ? techResult.value : null;

        if (!rNews && !tNews) {
            showError("לא הצלחנו לטעון את החדשות בשלב זה. אנא נסה שוב.");
            return;
        }

        state.news.romania = rNews || [];
        state.news.technology = tNews || [];
        state.news.forme = generateCombinedNews(state.news.romania, state.news.technology);

        updateLastUpdateTime();
        renderCurrentView();

    } catch (err) {
        console.error("Initialization error:", err);
        showError("אירעה שגיאה בלתי צפויה.");
    }
}

/**
 * Generate and rank the combined "For Me" feed
 */
function generateCombinedNews(romaniaNews, technologyNews) {
    const combined = [...romaniaNews, ...technologyNews];
    const seenIds = new Set();
    const uniqueCombined = [];
    
    for (const item of combined) {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueCombined.push(item);
        }
    }

    return uniqueCombined.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        const aImp = a.importanceScore || 0;
        const bImp = b.importanceScore || 0;
        if (aImp !== bImp) return bImp - aImp;

        const aPers = a.personalScore || 0;
        const bPers = b.personalScore || 0;
        if (aPers !== bPers) return bPers - aPers;

        const aDate = new Date(a.publishedAt || a.collectedAt).getTime();
        const bDate = new Date(b.publishedAt || b.collectedAt).getTime();
        return bDate - aDate;
    });
}

function updateLastUpdateTime() {
    let latestTime = 0;
    const allNews = state.news.forme;
    if (!allNews || allNews.length === 0) return;
    
    allNews.forEach(item => {
        const t = new Date(item.collectedAt || item.publishedAt).getTime();
        if (t > latestTime) latestTime = t;
    });

    if (latestTime > 0) {
        const d = new Date(latestTime);
        const timeStr = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' });
        UI.lastUpdated.textContent = `עודכן לאחרונה: ${timeStr}`;
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    // Navigation Tabs
    UI.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const feed = e.target.closest('.feed-btn').getAttribute('data-feed');
            if (feed === 'archive') {
                openSearchSection();
            } else if (feed) {
                switchTab(feed);
            }
        });
    });

    // Search UI toggles
    UI.searchToggle.addEventListener('click', openSearchSection);
    UI.closeSearchBtn.addEventListener('click', closeSearchSection);
    UI.clearSearchBtn.addEventListener('click', () => {
        UI.searchInput.value = '';
        UI.clearSearchBtn.classList.add('hidden');
        triggerSearch();
    });

    // Search Inputs (Debounced)
    UI.searchInput.addEventListener('input', () => {
        UI.clearSearchBtn.classList.toggle('hidden', UI.searchInput.value.trim() === '');
        
        // Show archive warning if trying to search empty query with dates
        checkArchiveWarning();
        
        clearTimeout(state.searchDebounceTimer);
        state.searchDebounceTimer = setTimeout(triggerSearch, 600);
    });

    // Filter changes
    UI.feedFilter.addEventListener('change', triggerSearch);
    UI.dateFilter.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            UI.customDateRange.classList.remove('hidden');
        } else {
            UI.customDateRange.classList.add('hidden');
            triggerSearch();
        }
        checkArchiveWarning();
    });

    UI.dateFrom.addEventListener('change', triggerSearch);
    UI.dateTo.addEventListener('change', triggerSearch);

    // Intercept clicks on article links for SPA routing
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/news/') && !href.includes('?') && !link.target) {
                const url = new URL(link.href, window.location.origin);
                const articleId = getArticleIdFromPath(url.pathname);
                if (articleId) {
                    e.preventDefault();
                    openArticle(articleId);
                }
            }
        }
    });

    // Browser History
    window.addEventListener('popstate', (e) => {
        const articleId = getArticleIdFromPath(window.location.pathname);
        if (articleId) {
            openArticle(articleId, true);
            return;
        }

        // Exiting article view
        state.isArticleView = false;
        state.currentArticleId = null;
        document.querySelector('.sticky-nav-wrapper').classList.remove('hidden');
        document.querySelector('.news-header').classList.remove('hidden');

        if (e.state) {
            restoreState(e.state);
        } else {
            // Re-parse URL if no state object
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('q') || urlParams.has('feed') || urlParams.has('date')) {
                restoreSearchFromURL(urlParams);
            } else {
                switchTab('forme', true); // no push state
            }
        }
    });
}

/**
 * UI State Managers
 */
function openSearchSection() {
    UI.searchSection.classList.remove('hidden');
    UI.searchInput.focus();
    
    // Deactivate standard tabs visually
    UI.tabs.forEach(tab => {
        if (tab.getAttribute('data-feed') === 'archive' || tab.getAttribute('data-feed') === null) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    checkArchiveWarning();
}

function closeSearchSection() {
    UI.searchSection.classList.add('hidden');
    // If we were actively looking at search results, we shouldn't necessarily leave them,
    // but if we want to return to news, switch back to 'forme'
    if (state.isSearching && !UI.searchInput.value.trim()) {
        switchTab('forme');
    } else {
        // Re-highlight the appropriate tab based on current state
        UI.tabs.forEach(tab => {
            const feed = tab.getAttribute('data-feed');
            if (state.isSearching) {
                if (feed === 'archive') tab.classList.add('active');
                else tab.classList.remove('active');
            } else {
                if (feed === state.currentTab) tab.classList.add('active');
                else tab.classList.remove('active');
            }
        });
    }
}

function switchTab(feed, skipPushState = false) {
    if (feed === 'archive') return; // Handled by openSearchSection

    state.currentTab = feed;
    state.isSearching = false;
    
    // Reset search inputs
    UI.searchInput.value = '';
    UI.feedFilter.value = '';
    UI.dateFilter.value = 'any';
    UI.customDateRange.classList.add('hidden');
    UI.clearSearchBtn.classList.add('hidden');
    UI.searchSection.classList.add('hidden');
    
    UI.tabs.forEach(tab => {
        if (tab.getAttribute('data-feed') === feed) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    
    if (!skipPushState) {
        updateURLState({ tab: feed });
    }
    
    // If news isn't loaded yet, it means we deep-linked into search and now clicked a tab
    if (!state.news[feed] && feed !== 'forme') {
        init(); // re-init to fetch standard feeds
        return;
    }
    
    renderCurrentView();
}

function checkArchiveWarning() {
    const q = UI.searchInput.value.trim();
    const hasDate = UI.dateFilter.value !== 'any';
    // Backend returns 400 if q is empty
    if (!q && hasDate) {
        UI.archiveWarning.classList.remove('hidden');
    } else {
        UI.archiveWarning.classList.add('hidden');
    }
}

/**
 * Search Logic & URL Syncing
 */
async function triggerSearch() {
    const q = UI.searchInput.value.trim();
    const feed = UI.feedFilter.value;
    const dateType = UI.dateFilter.value;
    
    let from = '';
    let to = '';

    // Calculate dates
    const today = new Date();
    if (dateType === 'week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        from = lastWeek.toISOString().split('T')[0];
    } else if (dateType === 'month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        from = lastMonth.toISOString().split('T')[0];
    } else if (dateType === 'custom') {
        from = UI.dateFrom.value;
        to = UI.dateTo.value;
    }

    checkArchiveWarning();

    // If query is too short (except for acronyms like AI), and no filters, don't search
    if (q.length < 2 && !feed && !from && !to) {
        if (state.isSearching) {
            // Cleared search
            switchTab('forme');
        }
        return;
    }

    // Backend limitation: requires 'q'
    if (!q) {
        // Cannot search purely by date or feed right now without q
        // Show empty results gracefully instead of crashing
        if (from || to || feed) {
            state.isSearching = true;
            state.news.search = [];
            renderCurrentView();
        }
        return;
    }

    state.isSearching = true;
    
    // Cancel previous request if pending
    if (state.searchAbortController) {
        state.searchAbortController.abort();
    }
    state.searchAbortController = new AbortController();

    // Update URL
    updateURLState({ q, feed, dateType, from, to });

    renderEditorialSkeleton();
    hideError();

    try {
        const results = await NewsApi.searchNews({ q, feedCode: feed, from, to }, state.searchAbortController.signal);
        state.news.search = results;
        renderCurrentView();
    } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("Search error:", err);
        showError("חיפוש נכשל. אנא נסה שוב.");
    }
}

function updateURLState(params) {
    const url = new URL(window.location);
    url.search = ''; // clear current params
    
    if (params.tab) {
        // no query string for base tabs, just clean URL
    } else if (params.q !== undefined) {
        if (params.q) url.searchParams.set('q', params.q);
        if (params.feed) url.searchParams.set('feed', params.feed);
        if (params.dateType && params.dateType !== 'any') url.searchParams.set('date', params.dateType);
        if (params.from) url.searchParams.set('from', params.from);
        if (params.to) url.searchParams.set('to', params.to);
    }
    
    window.history.pushState(params, '', url.toString());
}

function restoreSearchFromURL(urlParams) {
    UI.searchInput.value = urlParams.get('q') || '';
    UI.feedFilter.value = urlParams.get('feed') || '';
    UI.dateFilter.value = urlParams.get('date') || 'any';
    
    if (UI.dateFilter.value === 'custom') {
        UI.customDateRange.classList.remove('hidden');
        UI.dateFrom.value = urlParams.get('from') || '';
        UI.dateTo.value = urlParams.get('to') || '';
    }
    
    UI.clearSearchBtn.classList.toggle('hidden', !UI.searchInput.value);
    
    openSearchSection();
    triggerSearch();
}

function restoreState(savedState) {
    if (savedState.tab) {
        switchTab(savedState.tab, true);
    } else if (savedState.q !== undefined) {
        UI.searchInput.value = savedState.q;
        UI.feedFilter.value = savedState.feed;
        UI.dateFilter.value = savedState.dateType;
        if (savedState.dateType === 'custom') {
            UI.customDateRange.classList.remove('hidden');
            UI.dateFrom.value = savedState.from;
            UI.dateTo.value = savedState.to;
        } else {
            UI.customDateRange.classList.add('hidden');
        }
        openSearchSection();
        triggerSearch();
    }
}

/**
 * Article View Handling
 */
async function openArticle(id, skipPushState = false, isInitialLoad = false) {
    state.isArticleView = true;
    state.currentArticleId = id;
    
    // Hide headers
    document.querySelector('.sticky-nav-wrapper').classList.add('hidden');
    document.querySelector('.news-header').classList.add('hidden');
    UI.searchSection.classList.add('hidden');

    if (!skipPushState) {
        window.history.pushState({ article: id }, '', `/news/${id}`);
    }

    renderEditorialSkeleton();
    hideError();

    try {
        const article = await NewsApi.getArticle(id);
        if (!article) {
            showError("הכתבה לא נמצאה.");
            return;
        }
        renderArticle(article);
    } catch (err) {
        console.error("Failed to load article:", err);
        showError("שגיאה בטעינת הכתבה.");
    }
}

function renderArticle(item) {
    let articleHeHtml = '';
    if (item.articleHe) {
        articleHeHtml = item.articleHe
            .split('\\n')
            .filter(p => p.trim() !== '')
            .map(p => `<p>${escapeHTML(p)}</p>`)
            .join('');
    } else {
        articleHeHtml = `
            <p>${escapeHTML(item.summaryHe)}</p>
            <div class="article-no-hebrew-msg">
                <p>הגרסה המלאה בעברית אינה זמינה עבור כתבה זו. מוזמנים לקרוא את הכתבה המקורית.</p>
            </div>
        `;
    }

    const html = `
        <article class="article-page">
            <div class="article-page-nav">
                <button class="back-to-news-btn" onclick="window.history.back()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: scaleX(-1);">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    חזרה לחדשות
                </button>
            </div>
            
            <header class="article-header">
                ${getContextLabels(item, false)}
                <h1 class="article-title">${escapeHTML(item.titleHe)}</h1>
                ${item.originalTitle ? `<div class="article-original-title" dir="ltr">${escapeHTML(item.originalTitle)}</div>` : ''}
                <div class="article-meta">
                    <span class="source-name">${escapeHTML(item.sourceName)}</span>
                    <span>·</span>
                    <span class="pub-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                </div>
            </header>

            <div class="article-content">
                ${articleHeHtml}
            </div>

            <footer class="article-footer">
                <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="action-original-large">
                    קרא את הכתבה המקורית ב-${escapeHTML(item.sourceName)} ↗
                </a>
            </footer>
        </article>
    `;

    UI.content.innerHTML = html;
}

/**
 * Main Routing for Rendering
 */
function renderCurrentView() {
    if (state.isSearching) {
        renderSearch(state.news.search);
        return;
    }

    switch (state.currentTab) {
        case 'forme':
            renderForMe(state.news.forme);
            break;
        case 'romania':
            renderRomania(state.news.romania);
            break;
        case 'technology':
            renderTechnology(state.news.technology);
            break;
    }
}

/**
 * Renderers
 */
function renderForMe(items) {
    if (!items || items.length === 0) return renderEmpty();

    const mainStory = items[0];
    const secondaryStories = items.slice(1, 4);
    
    const rest = items.slice(4).sort((a, b) => {
        const aDate = new Date(a.publishedAt || a.collectedAt).getTime();
        const bDate = new Date(b.publishedAt || b.collectedAt).getTime();
        return bDate - aDate;
    });

    let html = `
        <div class="top-stories-layout">
            <div class="secondary-stories-area">
                ${secondaryStories.map(item => renderStandardNewsCard(item)).join('')}
            </div>
            <div class="main-story-area">
                ${renderFeatureNewsCard(mainStory)}
            </div>
        </div>
    `;

    if (rest.length > 0) {
        html += `
            <section class="latest-news-section">
                <h2 class="latest-news-header">החדשות האחרונות</h2>
                <div class="latest-stream">
                    ${rest.map(item => renderLatestNewsItem(item)).join('')}
                </div>
            </section>
        `;
    }

    UI.content.innerHTML = html;
}

function renderRomania(items) {
    if (!items || items.length === 0) return renderEmpty();

    const groups = [
        { key: 'bucharest', title: 'בוקרשט', match: (item) => hasTerm(item, 'bucharest') || hasTerm(item, 'בוקרשט') || hasTopic(item, 'bucharest') },
        { key: 'pitesti', title: "פיטשטי וארג'ש", match: (item) => hasTerm(item, 'pitesti') || hasTerm(item, 'arges') || hasTerm(item, "פיטשטי") || hasTopic(item, 'pitesti') },
        { key: 'national', title: 'חדשות ארציות', match: (item) => item.category?.toLowerCase() === 'national' || item.category?.toLowerCase() === 'politics' }
    ];

    renderCategorizedFeed(items, groups);
}

function renderTechnology(items) {
    if (!items || items.length === 0) return renderEmpty();

    const groups = [
        { key: 'ai', title: 'AI & Machine Learning', match: (item) => hasTerm(item, 'ai') || hasTerm(item, 'openai') || hasTopic(item, 'ai') },
        { key: 'dev', title: 'Developer Tools', match: (item) => hasTerm(item, 'developer') || hasTerm(item, 'programming') || hasTopic(item, 'dev') },
        { key: 'cyber', title: 'Cybersecurity', match: (item) => hasTerm(item, 'cybersecurity') || hasTerm(item, 'security') || hasTopic(item, 'security') },
        { key: 'business', title: 'Startups & Business', match: (item) => hasTerm(item, 'business') || hasTerm(item, 'startup') },
        { key: 'hardware', title: 'Hardware & Chips', match: (item) => hasTerm(item, 'hardware') || hasTopic(item, 'hardware') }
    ];

    renderCategorizedFeed(items, groups);
}

function renderSearch(items) {
    const queryStr = UI.searchInput.value.trim();
    
    if (!items || items.length === 0) {
        UI.content.innerHTML = `
            <div class="empty-state">
                <p>לא מצאתי חדשות שמתאימות לחיפוש "${escapeHTML(queryStr)}".</p>
                <button class="clear-search-btn-empty" onclick="document.getElementById('clearSearchBtn').click()">נקה חיפוש</button>
            </div>
        `;
        return;
    }
    
    // Sort chronologically for search
    const sorted = [...items].sort((a, b) => {
        const aDate = new Date(a.publishedAt || a.collectedAt).getTime();
        const bDate = new Date(b.publishedAt || b.collectedAt).getTime();
        return bDate - aDate;
    });

    UI.content.innerHTML = `
        <h2 class="search-results-header">תוצאות עבור "${escapeHTML(queryStr)}" (${sorted.length})</h2>
        <div class="latest-stream">
            ${sorted.map(item => renderLatestNewsItem(item, true)).join('')}
        </div>
    `;
}

function renderCategorizedFeed(items, predefinedGroups) {
    // Rank editorially
    const sorted = [...items].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.importanceScore || 0) - (a.importanceScore || 0);
    });

    const groupData = {};
    predefinedGroups.forEach(g => groupData[g.key] = { title: g.title, items: [] });
    const otherItems = [];

    sorted.forEach(item => {
        let matched = false;
        for (const g of predefinedGroups) {
            if (g.match(item)) {
                groupData[g.key].items.push(item);
                matched = true;
                break;
            }
        }
        if (!matched) otherItems.push(item);
    });

    let html = '';

    predefinedGroups.forEach(g => {
        const data = groupData[g.key];
        if (data.items.length > 0) {
            html += `
                <section class="category-section">
                    <h2 class="category-header">${data.title}</h2>
                    <div class="category-grid">
                        ${data.items.map((item, idx) => {
                            if (idx === 0) return renderSectionLeadCard(item);
                            return renderCompactNewsItem(item);
                        }).join('')}
                    </div>
                </section>
            `;
        }
    });

    if (otherItems.length > 0) {
        html += `
            <section class="category-section">
                <h2 class="category-header">חדשות נוספות</h2>
                <div class="category-grid">
                    ${otherItems.map(item => renderCompactNewsItem(item)).join('')}
                </div>
            </section>
        `;
    }

    UI.content.innerHTML = html;
}

/**
 * Article Component Generators
 */
function renderFeatureNewsCard(item) {
    return `
        <article class="news-card feature-card">
            <div class="card-meta">
                <span class="source-name"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                <span>·</span>
                <span class="pub-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                ${item.isFeatured ? `<span>·</span><span class="featured-badge">כתבת תחקיר</span>` : ''}
                ${getContextLabels(item, true)}
            </div>
            <h2 class="card-title">
                <a href="/news/${item.id}">${escapeHTML(item.titleHe)}</a>
            </h2>
            ${item.originalTitle ? `<div class="card-original-title"><bdi>${escapeHTML(item.originalTitle)}</bdi></div>` : ''}
            <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
            <div class="card-actions">
                <a href="/news/${item.id}" class="action-read-he">קרא בעברית</a>
                <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="action-original">לכתבה המקורית ↗</a>
            </div>
        </article>
    `;
}

function renderStandardNewsCard(item) {
    return `
        <article class="news-card standard-card">
            <div class="card-meta">
                <span class="source-name"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                <span>·</span>
                <span class="pub-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                ${getContextLabels(item, true)}
            </div>
            <h3 class="card-title">
                <a href="/news/${item.id}">${escapeHTML(item.titleHe)}</a>
            </h3>
            <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
            <div class="card-actions">
                <a href="/news/${item.id}" class="action-read-he">קרא בעברית</a>
                <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="action-original">לכתבה המקורית ↗</a>
            </div>
        </article>
    `;
}

function renderSectionLeadCard(item) {
    return `
        <article class="news-card section-lead-card">
            <h3 class="card-title">
                <a href="/news/${item.id}">${escapeHTML(item.titleHe)}</a>
            </h3>
            <div class="card-meta" style="margin-top: 12px; margin-bottom: 12px;">
                <span class="source-name"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                <span>·</span>
                <span class="pub-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
            </div>
            <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
            <div class="card-actions">
                <a href="/news/${item.id}" class="action-read-he">קרא בעברית</a>
                <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="action-original">לכתבה המקורית ↗</a>
            </div>
        </article>
    `;
}

function renderCompactNewsItem(item) {
    return `
        <article class="news-card compact-card">
            <h4 class="card-title">
                <a href="/news/${item.id}">${escapeHTML(item.titleHe)}</a>
            </h4>
            <div class="card-meta">
                <span class="source-name"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                <span>·</span>
                <span class="pub-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
            </div>
        </article>
    `;
}

function renderLatestNewsItem(item, includeSummary = false) {
    return `
        <article class="latest-item">
            <div class="latest-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</div>
            <div class="latest-content">
                <h4 class="latest-title">
                    <a href="/news/${item.id}">${escapeHTML(item.titleHe)}</a>
                </h4>
                ${includeSummary && item.summaryHe ? `<p class="card-summary" style="margin-bottom: 8px; font-size: 1rem;">${escapeHTML(item.summaryHe)}</p>` : ''}
                <div class="card-meta">
                    <span class="source-name"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                    ${item.feed?.name ? `<span>·</span><span>${escapeHTML(item.feed.name)}</span>` : ''}
                    ${item.category ? `<span>·</span><span>${escapeHTML(item.category)}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

function renderEmpty() {
    UI.content.innerHTML = `<div class="empty-state">לא נמצאו חדשות בתצוגה זו.</div>`;
}

function renderEditorialSkeleton() {
    UI.content.innerHTML = `
        <div class="editorial-skeleton">
            <div style="display: flex; flex-direction: column; gap: 32px;">
                <div class="sk-card">
                    <div class="sk-meta sk-pulse"></div>
                    <div class="sk-title-md sk-pulse"></div>
                    <div class="sk-text sk-pulse"></div>
                </div>
                <div class="sk-card">
                    <div class="sk-meta sk-pulse"></div>
                    <div class="sk-title-md sk-pulse"></div>
                    <div class="sk-text sk-pulse"></div>
                </div>
            </div>
            <div class="sk-card">
                <div class="sk-meta sk-pulse"></div>
                <div class="sk-title-lg sk-pulse"></div>
                <div class="sk-text sk-pulse"></div>
                <div class="sk-text sk-pulse"></div>
                <div class="sk-text-short sk-pulse"></div>
            </div>
        </div>
    `;
}

/**
 * Date Formatter
 */
function formatRelativeHebrewDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 0) return 'עכשיו';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    const isToday = now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.getDate() === date.getDate() && yesterday.getMonth() === date.getMonth() && yesterday.getFullYear() === date.getFullYear();
    
    const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' });
    
    if (diffMins < 1) return 'עכשיו';
    if (diffMins === 1) return 'לפני דקה';
    if (diffMins === 2) return 'לפני שתי דקות';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    
    if (diffHours === 1) return 'לפני שעה';
    if (diffHours === 2) return 'לפני שעתיים';
    if (diffHours < 6) return `לפני ${diffHours} שעות`;
    
    if (isToday) return `היום, ${timeStr}`;
    if (isYesterday) return `אתמול, ${timeStr}`;
    
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jerusalem' });
}

/**
 * Utilities
 */
function getContextLabels(item, prependDot = false) {
    const labels = [];
    if (item.location) labels.push(item.location);
    else if (item.category) labels.push(item.category);
    
    if (labels.length === 0) return '';
    return `${prependDot ? '<span>·</span>' : ''}<span>${escapeHTML(labels[0])}</span>`;
}

function hasTerm(item, term) {
    const str = `${item.location || ''} ${item.category || ''} ${item.companyTopic || ''}`.toLowerCase();
    return str.includes(term.toLowerCase());
}

function hasTopic(item, topicStr) {
    if (!item.topics) return false;
    return item.topics.some(t => t.code.toLowerCase().includes(topicStr) || t.name.toLowerCase().includes(topicStr));
}

function showError(msg) {
    UI.error.innerHTML = `<p>${msg}</p><button class="retry-btn" onclick="init()">נסה שוב</button>`;
    UI.error.classList.remove('hidden');
    UI.content.innerHTML = '';
}
function hideError() {
    UI.error.classList.add('hidden');
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Start application
document.addEventListener('DOMContentLoaded', init);
