// UI Elements
const UI = {
    tabs: document.querySelectorAll('.feed-btn[data-feed]'),
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
    lastUpdated: document.getElementById('lastUpdated'),
    utilDate: document.getElementById('utilDate'),
    utilClock: document.getElementById('utilClock'),
    utilityBar: document.getElementById('utilityBar')
};

/**
 * Utility Bar — date and clock (Israel timezone)
 */
function initUtilityBar() {
    function updateUtilityBar() {
        const now = new Date();
        const opts = { timeZone: 'Asia/Jerusalem' };
        const dayName = now.toLocaleDateString('he-IL', { ...opts, weekday: 'long' });
        const dateStr = now.toLocaleDateString('he-IL', { ...opts, day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('he-IL', { ...opts, hour: '2-digit', minute: '2-digit' });
        if (UI.utilDate) UI.utilDate.textContent = dayName + ', ' + dateStr;
        if (UI.utilClock) UI.utilClock.textContent = timeStr;
    }
    updateUtilityBar();
    setInterval(updateUtilityBar, 30000);

    // Weather panel toggle + data fetch
    const weatherBtn = document.getElementById('weatherToggleBtn');
    const weatherPanel = document.getElementById('weatherPanel');
    const weatherClose = document.getElementById('weatherCloseBtn');
    let weatherLoaded = false;

    if (weatherBtn && weatherPanel) {
        weatherBtn.addEventListener('click', () => {
            const opening = weatherPanel.classList.toggle('hidden') === false;
            if (opening && !weatherLoaded) {
                weatherLoaded = true;
                loadWeatherData();
            }
        });
        if (weatherClose) {
            weatherClose.addEventListener('click', () => {
                weatherPanel.classList.add('hidden');
            });
        }
        document.addEventListener('click', (e) => {
            if (!weatherPanel.classList.contains('hidden') &&
                !weatherPanel.contains(e.target) &&
                !weatherBtn.contains(e.target)) {
                weatherPanel.classList.add('hidden');
            }
        });
    }

    async function loadWeatherData() {
        const cities = [
            { id: 'weatherTelAviv', query: 'Tel_Aviv' },
            { id: 'weatherBucharest', query: 'Bucharest' }
        ];
        for (const city of cities) {
            const el = document.getElementById(city.id);
            const dataEl = el?.querySelector('.weather-city-data');
            if (!dataEl) continue;
            try {
                const resp = await fetch(`https://wttr.in/${city.query}?format=j1`);
                if (!resp.ok) throw new Error('fetch failed');
                const json = await resp.json();
                const cur = json.current_condition?.[0];
                if (!cur) { dataEl.textContent = 'לא זמין'; continue; }
                const tempC = cur.temp_C;
                const feelsLike = cur.FeelsLikeC;
                const humidity = cur.humidity;
                const windKmph = cur.windspeedKmph;
                const desc = cur.lang_he?.[0]?.value || cur.weatherDesc?.[0]?.value || '';
                const icon = getWeatherIcon(cur.weatherCode);
                dataEl.innerHTML = `
                    <div class="weather-temp">
                        <span class="weather-temp-icon">${icon}</span>
                        <span class="weather-temp-value">${tempC}°</span>
                    </div>
                    <div class="weather-condition">${escapeHTML(desc)}</div>
                    <div class="weather-details">
                        <span>מרגיש כמו ${feelsLike}°</span>
                        <span>לחות ${humidity}%</span>
                        <span>רוח ${windKmph} קמ״ש</span>
                    </div>
                `;
            } catch (e) {
                dataEl.textContent = 'לא ניתן לטעון נתוני מזג אוויר';
            }
        }
    }

    function getWeatherIcon(code) {
        const c = parseInt(code, 10);
        if (c === 113) return '☀️';
        if (c === 116) return '⛅';
        if (c === 119 || c === 122) return '☁️';
        if ([176,263,266,293,296,299,302,305,308,311,314,353,356,359].includes(c)) return '🌧️';
        if ([200,386,389,392,395].includes(c)) return '⛈️';
        if ([227,230,323,326,329,332,335,338,368,371,374,377].includes(c)) return '🌨️';
        if ([143,248,260].includes(c)) return '🌫️';
        return '🌤️';
    }
}

/**
 * Local development detection.
 * On localhost / 127.0.0.1 (any port), use the physical /news path.
 * In production, use the public /hennews2409 path.
 */
const _isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const NEWS_BASE = _isLocal ? '/news' : '/hennews2409';

// Application State
const state = {
    currentTab: 'romania',
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
    // Check both possible base paths
    const bases = ['/hennews2409', '/news'];
    for (const base of bases) {
        if (
            normalized === base ||
            normalized === base + '/index' ||
            normalized === base + '/index.html'
        ) {
            return null;
        }
        const match = normalized.match(new RegExp('^' + base.replace('/', '\\/') + '\\/([^/]+)$'));
        if (match) return decodeURIComponent(match[1]);
    }
    return null;
}

/**
 * Initialize the application
 */
async function init() {
    const normalizedPath = window.location.pathname.replace(/\/+$/, '');
    if (!_isLocal && (normalizedPath === '/news' || normalizedPath === '/news/index' || normalizedPath === '/news/index.html')) {
        window.location.replace('/404');
        return;
    }

    initUtilityBar();
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

    // Default to 'forme' initially
    document.querySelector('.news-app').setAttribute('data-current-feed', state.currentTab || 'forme');

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
            if (href && (href.startsWith('/hennews2409/') || href.startsWith('/news/')) && !href.includes('?') && !link.target) {
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
        if (UI.utilityBar) UI.utilityBar.classList.remove('hidden');

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

    document.querySelector('.news-app').setAttribute('data-current-feed', feed);
    
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
    if (UI.utilityBar) UI.utilityBar.classList.add('hidden');

    if (!skipPushState) {
        window.history.pushState({ article: id }, '', `${NEWS_BASE}/${id}`);
    }

    renderEditorialSkeleton();
    hideError();

    try {
        const article = await NewsApi.getArticle(id);
        if (!article) {
            showError("הכתבה לא נמצאה.");
            return;
        }
        
        // Save to history
        try {
            let history = JSON.parse(localStorage.getItem('news_history') || '[]');
            history = history.filter(i => i.id !== article.id);
            history.unshift({ id: article.id, titleHe: article.titleHe, sourceName: article.sourceName, publishedAt: article.publishedAt || article.collectedAt });
            if (history.length > 4) history.pop();
            localStorage.setItem('news_history', JSON.stringify(history));
        } catch(e) {}

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
            <div class="article-no-content">
                <p>הגרסה המלאה בעברית אינה זמינה עבור כתבה זו. מוזמנים לקרוא את הכתבה המקורית בקישור מטה.</p>
            </div>
            <p style="margin-top:24px;">${escapeHTML(item.summaryHe)}</p>
        `;
    }

    const feedCode = item.feed?.code || '';
    const sourceLangLabel = feedCode === 'romania' ? 'ברומנית' : 'באנגלית';
    const categoryLabel = item.location || item.category || (feedCode === 'romania' ? 'רומניה' : 'טכנולוגיה');

    // Get history to show at bottom
    let historyHtml = '';
    try {
        const history = JSON.parse(localStorage.getItem('news_history') || '[]').filter(i => i.id !== item.id);
        if (history.length > 0) {
            historyHtml = `
                <div class="article-footer">
                    <div class="footer-label">קראת לאחרונה</div>
                    <div class="continue-reading-grid">
                        ${history.map(h => `
                            <article class="editorial-card card-standard">
                                <a href="${NEWS_BASE}/${h.id}" class="block-link">
                                    <div class="card-meta">
                                        <span class="meta-source"><bdi>${escapeHTML(h.sourceName)}</bdi></span>
                                    </div>
                                    <h3 class="card-title">${escapeHTML(h.titleHe)}</h3>
                                </a>
                            </article>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } catch(e) {}

    const html = `
        <div class="reading-progress-container">
            <div class="reading-progress-bar" id="readingProgressBar"></div>
        </div>
        <article class="article-page">
            <header class="article-header">
                <span class="meta-category">${escapeHTML(categoryLabel)}</span>
                <h1 class="article-title">${escapeHTML(item.titleHe)}</h1>
                ${item.summaryHe && item.articleHe ? `<p class="article-standfirst">${escapeHTML(item.summaryHe)}</p>` : ''}
                
                <div class="article-meta-bar">
                    <div class="article-author-info">
                        <div class="article-source-badge">${escapeHTML(item.sourceName)}</div>
                        <div class="article-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</div>
                    </div>
                    <div class="article-actions">
                        <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="btn-outline">מקור ${sourceLangLabel} ↗</a>
                        <button class="btn-outline" onclick="window.history.back()">חזור</button>
                    </div>
                </div>
                ${item.originalTitle ? `<div class="original-title"><bdi>${escapeHTML(item.originalTitle)}</bdi></div>` : ''}
            </header>

            <div class="article-body">
                ${articleHeHtml}
            </div>

            ${historyHtml}
        </article>
    `;

    UI.content.innerHTML = html;

    const updateProgress = () => {
        const scrolled = window.scrollY;
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;
        const bar = document.getElementById('readingProgressBar');
        if (bar) bar.style.width = progress + '%';
    };
    window.addEventListener('scroll', updateProgress);
}

function renderCurrentView() {
    if (state.isSearching) {
        renderSearch(state.news.search);
        return;
    }
    switch (state.currentTab) {
        case 'forme': renderForMe(state.news.forme); break;
        case 'romania': renderRomania(state.news.romania); break;
        case 'technology': renderTechnology(state.news.technology); break;
    }
}

function isFresh(dateStr) {
    if (!dateStr) return false;
    const diff = new Date() - new Date(dateStr);
    return diff < 3 * 60 * 60 * 1000; // < 3 hours old
}

function renderBreakingStrip(items) {
    if (!items || items.length === 0) return '';
    const recent = [...items].sort((a, b) => {
        return new Date(b.publishedAt || b.collectedAt) - new Date(a.publishedAt || a.collectedAt);
    }).slice(0, 5);

    if (recent.length === 0) return '';

    return `
        <div class="breaking-strip">
            <div class="breaking-label"><div class="live-dot"></div> מבזקים</div>
            <div class="breaking-marquee">
                <div class="breaking-items">
                    ${recent.map(item => `
                        <a href="${NEWS_BASE}/${item.id}" class="breaking-item">
                            <span class="breaking-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                            <span class="breaking-title">${escapeHTML(item.titleHe)}</span>
                        </a>
                    `).join('<span class="breaking-sep"></span>')}
                </div>
            </div>
        </div>
    `;
}

function renderForMe(items) {
    if (!items || items.length === 0) return renderEmpty();

    const mainStory = items[0];
    const majorStories = items.slice(1, 4);
    const compactStories = items.slice(4, 10);
    const rest = items.slice(10);

    let html = renderBreakingStrip(items);

    html += `
        <div class="hero-grid">
            <div class="hero-main">
                ${renderHeroCard(mainStory)}
            </div>
            <div class="hero-side">
                ${majorStories.map(item => renderMajorCard(item)).join('')}
            </div>
        </div>
    `;

    if (compactStories.length > 0) {
        html += `
            <div class="section-header">
                <h2>עדכונים שוטפים</h2>
                <span class="section-label">הכי חשוב עכשיו</span>
            </div>
            <div class="story-cluster" style="margin-bottom: 48px;">
                ${compactStories.map(item => renderCompactCard(item)).join('')}
            </div>
        `;
    }
    
    if (rest.length > 0) {
        html += `
            <div class="section-header">
                <h2>עוד חדשות</h2>
            </div>
            <div class="rhythm-grid three-col">
                ${rest.slice(0, 9).map(item => renderStandardCard(item)).join('')}
            </div>
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

    renderCategorizedFeed(items, groups, renderBreakingStrip(items));
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

    renderCategorizedFeed(items, groups, renderBreakingStrip(items));
}

function renderSearch(items) {
    const queryStr = UI.searchInput.value.trim();
    if (!items || items.length === 0) {
        UI.content.innerHTML = `
            <div class="empty-state">
                <p>לא מצאתי חדשות שמתאימות לחיפוש "${escapeHTML(queryStr)}".</p>
                <button class="btn-outline" style="margin-top: 16px;" onclick="document.getElementById('clearSearchBtn').click()">נקה חיפוש</button>
            </div>
        `;
        return;
    }
    
    const sorted = [...items].sort((a, b) => new Date(b.publishedAt || b.collectedAt) - new Date(a.publishedAt || a.collectedAt));

    UI.content.innerHTML = `
        <div class="section-header">
            <h2>תוצאות עבור "${escapeHTML(queryStr)}"</h2>
            <span class="section-label">${sorted.length} כתבות</span>
        </div>
        <div class="story-cluster">
            ${sorted.map(item => renderCompactCard(item)).join('')}
        </div>
    `;
}

function renderCategorizedFeed(items, predefinedGroups, prefixHtml = '') {
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

    let html = prefixHtml;
    
    // Top story overall
    if (sorted.length > 0) {
        html += `
            <div class="hero-grid">
                <div class="hero-main">
                    ${renderHeroCard(sorted[0])}
                </div>
                <div class="hero-side">
                    ${sorted.slice(1, 4).map(item => renderMajorCard(item)).join('')}
                </div>
            </div>
        `;
    }

    // Render remaining grouped items
    predefinedGroups.forEach(g => {
        const data = groupData[g.key];
        const gItems = data.items.filter(i => !sorted.slice(0,4).includes(i));
        
        if (gItems.length > 0) {
            html += `
                <div class="section-header">
                    <h2>${data.title}</h2>
                </div>
                <div class="rhythm-grid">
                    ${gItems.map(item => renderStandardCard(item)).join('')}
                </div>
            `;
        }
    });

    const oItems = otherItems.filter(i => !sorted.slice(0,4).includes(i));
    if (oItems.length > 0) {
        html += `
            <div class="section-header">
                <h2>עוד חדשות</h2>
            </div>
            <div class="story-cluster" style="margin-bottom: 48px;">
                ${oItems.map(item => renderCompactCard(item)).join('')}
            </div>
        `;
    }

    UI.content.innerHTML = html;
}

function renderHeroCard(item) {
    const freshHtml = isFresh(item.publishedAt || item.collectedAt) ? '<span class="meta-fresh">חדש</span>' : '';
    return `
        <article class="editorial-card card-hero">
            <a href="${NEWS_BASE}/${item.id}" class="block-link">
                <div class="card-meta">
                    ${freshHtml}
                    <span class="meta-category">${escapeHTML(item.category || item.location || 'ראשי')}</span>
                    <span class="meta-sep">/</span>
                    <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                </div>
                <h2 class="card-title">${escapeHTML(item.titleHe)}</h2>
                <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
                <div class="card-meta" style="margin-top:12px;">
                    <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                </div>
            </a>
        </article>
    `;
}

function renderMajorCard(item) {
    return `
        <article class="editorial-card card-major">
            <a href="${NEWS_BASE}/${item.id}" class="block-link">
                <div class="card-meta">
                    <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                    <span class="meta-sep">/</span>
                    <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                </div>
                <h3 class="card-title">${escapeHTML(item.titleHe)}</h3>
                <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
            </a>
        </article>
    `;
}

function renderStandardCard(item) {
    return `
        <article class="editorial-card card-standard">
            <a href="${NEWS_BASE}/${item.id}" class="block-link">
                <div class="card-meta">
                    <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                    <span class="meta-sep">/</span>
                    <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                </div>
                <h3 class="card-title">${escapeHTML(item.titleHe)}</h3>
            </a>
        </article>
    `;
}

function renderCompactCard(item) {
    return `
        <article class="editorial-card card-compact">
            <div class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt, true)}</div>
            <div>
                <a href="${NEWS_BASE}/${item.id}" class="block-link">
                    <h4 class="card-title">${escapeHTML(item.titleHe)}</h4>
                </a>
                <div class="card-meta">
                    <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                </div>
            </div>
        </article>
    `;
}

function renderEmpty() {
    UI.content.innerHTML = `
        <div class="empty-state">
            <p>אין כרגע עדכונים חדשים בקטגוריה הזאת.</p>
            <button class="btn-outline" style="margin-top: 16px;" onclick="window.history.back()">חזור לראשי</button>
        </div>
    `;
}

function renderEditorialSkeleton() {
    UI.content.innerHTML = `
        <div class="hero-grid">
            <div class="hero-main">
                <div class="sk-card">
                    <div class="sk-meta sk-line"></div>
                    <div class="sk-title sk-line" style="height:48px;"></div>
                    <div class="sk-title sk-line" style="height:48px; width:60%;"></div>
                    <div class="sk-meta sk-line" style="margin-top:12px; width:90%;"></div>
                </div>
            </div>
            <div class="hero-side" style="display:flex; flex-direction:column; gap:24px;">
                <div class="sk-card"><div class="sk-meta sk-line"></div><div class="sk-title sk-line"></div></div>
                <div class="sk-card"><div class="sk-meta sk-line"></div><div class="sk-title sk-line"></div></div>
            </div>
        </div>
    `;
}

/**
 * Date Formatter
 */
function formatRelativeHebrewDate(dateString, shortMode = false) {
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
    
    if (shortMode) {
        if (isToday) return timeStr;
        if (isYesterday) return 'אתמול';
        return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    }

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
