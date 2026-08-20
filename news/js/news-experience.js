(() => {
    const BASE_TITLE = 'החדשות של Hen | LiDa Software';
    const LAST_SEEN_KEY = 'hen_news_last_seen_v2';
    const READER_SIZE_KEY = 'hen_news_reader_size';
    const SESSION_STARTED_AT = Date.now();
    const FIRST_VISIT_LOOKBACK_MS = 6 * 60 * 60 * 1000;
    const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
    const TRACKED_FEEDS = ['romania', 'israel', 'technology'];
    const visitedFeeds = new Set(['romania']);

    let lastSeen = loadLastSeen();
    let pendingUpdate = null;
    let updateCheckInFlight = false;

    function loadLastSeen() {
        try {
            const parsed = JSON.parse(localStorage.getItem(LAST_SEEN_KEY) || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function saveLastSeen() {
        try {
            localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(lastSeen));
        } catch (_) {}
    }

    function feedLabel(feed) {
        return ({ romania: 'רומניה', israel: 'ישראל', technology: 'טכנולוגיה', forme: 'בשבילי' })[feed] || 'חדשות';
    }

    function itemTimestamp(item) {
        const value = item?.publishedAt || item?.collectedAt || item?.createdAt;
        const ts = value ? new Date(value).getTime() : 0;
        return Number.isFinite(ts) ? ts : 0;
    }

    function lastSeenFor(feed) {
        const saved = Number(lastSeen[feed] || 0);
        return saved > 0 ? saved : SESSION_STARTED_AT - FIRST_VISIT_LOOKBACK_MS;
    }

    function getItems(feed) {
        if (feed === 'search') return state.news.search || [];
        return state.news[feed] || [];
    }

    function getUnread(feed, items = getItems(feed)) {
        if (!TRACKED_FEEDS.includes(feed)) return [];
        const threshold = lastSeenFor(feed);
        return items.filter(item => itemTimestamp(item) > threshold);
    }

    function uniqueSourceCount(items) {
        return new Set(
            items
                .map(item => String(item?.sourceName || '').trim().toLowerCase())
                .filter(Boolean)
        ).size;
    }

    function latestTimestamp(items) {
        return items.reduce((latest, item) => Math.max(latest, itemTimestamp(item)), 0);
    }

    function recomputeCombinedFeed() {
        state.news.forme = generateCombinedNews(
            state.news.romania || [],
            state.news.technology || []
        );
    }

    function parseArticleIdFromHref(href) {
        if (!href) return '';
        try {
            const url = new URL(href, window.location.origin);
            const parts = url.pathname.replace(/\/+$/, '').split('/');
            return decodeURIComponent(parts[parts.length - 1] || '');
        } catch (_) {
            return '';
        }
    }

    function decorateUnreadStories(feed, items) {
        if (!TRACKED_FEEDS.includes(feed)) return;

        const itemMap = new Map(items.map(item => [String(item.id), item]));
        const threshold = lastSeenFor(feed);

        UI.content.querySelectorAll('.editorial-card').forEach(card => {
            const link = card.querySelector(`a[href^="${NEWS_BASE}/"]`);
            const id = parseArticleIdFromHref(link?.getAttribute('href'));
            const item = itemMap.get(id);
            const unread = item && itemTimestamp(item) > threshold;

            card.classList.toggle('story-unread', Boolean(unread));
            card.querySelectorAll('.meta-unread').forEach(el => el.remove());

            if (unread) {
                const meta = card.querySelector('.card-meta');
                if (meta) {
                    meta.insertAdjacentHTML('afterbegin', '<span class="meta-unread">חדש מאז הביקור</span>');
                }
            }
        });
    }

    function renderNavBadges() {
        UI.tabs.forEach(tab => {
            tab.querySelectorAll('.feed-unread-badge').forEach(el => el.remove());
            const feed = tab.getAttribute('data-feed');
            if (!TRACKED_FEEDS.includes(feed)) return;

            const count = getUnread(feed).length;
            if (count > 0) {
                tab.insertAdjacentHTML('beforeend', `<span class="feed-unread-badge" aria-label="${count} חדשות חדשות">${Math.min(count, 99)}</span>`);
            }
        });
    }

    function renderFeedPulse() {
        if (state.isArticleView || state.isSearching) return;
        const feed = state.currentTab;
        if (!TRACKED_FEEDS.includes(feed)) return;

        const items = getItems(feed);
        if (!items.length) return;

        UI.content.querySelectorAll('#feedPulse').forEach(el => el.remove());

        const unread = getUnread(feed, items).length;
        const sources = uniqueSourceCount(items);
        const fresh = items.filter(item => SESSION_STARTED_AT - itemTimestamp(item) <= 3 * 60 * 60 * 1000).length;
        const latest = latestTimestamp(items);
        const latestLabel = latest ? formatRelativeHebrewDate(new Date(latest).toISOString()) : '';

        UI.content.insertAdjacentHTML('afterbegin', `
            <section class="feed-pulse" id="feedPulse" aria-label="מצב הפיד">
                <div class="feed-pulse-main">
                    <span class="feed-pulse-live"><span class="feed-pulse-dot"></span>${escapeHTML(feedLabel(feed))} עכשיו</span>
                    <span class="feed-pulse-stat"><strong>${items.length}</strong> כתבות</span>
                    <span class="feed-pulse-stat"><strong>${sources}</strong> מקורות</span>
                    <span class="feed-pulse-stat"><strong>${fresh}</strong> מה־3 שעות האחרונות</span>
                    ${unread ? `<span class="feed-pulse-stat feed-pulse-new"><strong>${unread}</strong> חדשות מאז הביקור</span>` : '<span class="feed-pulse-stat feed-pulse-caught-up">אתה מעודכן</span>'}
                </div>
                <div class="feed-pulse-actions">
                    ${latestLabel ? `<span class="feed-pulse-latest">העדכון האחרון ${escapeHTML(latestLabel)}</span>` : ''}
                    ${unread ? '<button type="button" class="feed-pulse-btn" data-action="mark-read">סמן כנקרא</button>' : ''}
                    <button type="button" class="feed-pulse-btn feed-pulse-refresh" data-action="refresh" aria-label="רענן חדשות">↻ רענן</button>
                </div>
            </section>
        `);

        const pulse = document.getElementById('feedPulse');
        pulse?.querySelector('[data-action="mark-read"]')?.addEventListener('click', () => {
            lastSeen[feed] = Date.now();
            saveLastSeen();
            renderCurrentView();
        });

        pulse?.querySelector('[data-action="refresh"]')?.addEventListener('click', async (event) => {
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = 'מרענן…';
            await refreshFeed(feed, true);
        });
    }

    function enhanceRomaniaSourceRail() {
        if (state.currentTab !== 'romania' || state.isSearching || state.isArticleView) return;
        const list = document.querySelector('#sourceRail .source-link-list');
        if (!list) return;

        const items = state.news.romania || [];
        const additions = [
            { name: 'Libertatea', domain: 'libertatea.ro', url: 'https://www.libertatea.ro' },
            { name: 'Știrile ProTV', domain: 'stirileprotv.ro', url: 'https://stirileprotv.ro' }
        ];

        additions.forEach(source => {
            if ([...list.querySelectorAll('.source-link-name')].some(el => el.textContent.trim() === source.name)) return;
            const count = items.filter(item => {
                const name = String(item.sourceName || '').toLowerCase();
                const sourceUrl = String(item.sourceUrl || '').toLowerCase();
                return name.includes(source.name.toLowerCase()) || sourceUrl.includes(source.domain);
            }).length;
            const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(source.domain)}&sz=64`;

            list.insertAdjacentHTML('beforeend', `
                <a class="source-link-row${count ? ' source-link-row--active' : ''}" href="${source.url}" target="_blank" rel="noopener noreferrer">
                    <span class="source-avatar" aria-hidden="true">
                        <img src="${favicon}" alt="" loading="lazy" referrerpolicy="no-referrer" />
                        <span class="source-avatar-fallback">${escapeHTML(source.name.charAt(0))}</span>
                    </span>
                    <span class="source-link-name"><bdi>${escapeHTML(source.name)}</bdi></span>
                    ${count ? `<span class="source-story-count">${count}</span>` : '<span class="source-external">↗</span>'}
                </a>
            `);
        });
    }

    function enhanceFeedView() {
        if (state.isArticleView) return;
        document.title = BASE_TITLE;
        renderNavBadges();

        if (!state.isSearching) {
            const feed = state.currentTab;
            const items = getItems(feed);
            renderFeedPulse();
            decorateUnreadStories(feed, items);
        }

        requestAnimationFrame(enhanceRomaniaSourceRail);
    }

    async function refreshFeed(feed, forceRender = false) {
        if (!TRACKED_FEEDS.includes(feed)) return;
        try {
            const items = await NewsApi.getCurrentWeekNews(feed);
            state.news[feed] = items || [];
            recomputeCombinedFeed();
            updateLastUpdateTime();
            pendingUpdate = null;
            hideUpdateToast();
            if (forceRender || (!state.isArticleView && !state.isSearching && state.currentTab === feed)) {
                renderCurrentView();
            }
        } catch (error) {
            console.error('Feed refresh failed:', error);
            const button = document.querySelector('#feedPulse [data-action="refresh"]');
            if (button) {
                button.disabled = false;
                button.textContent = '↻ נסה שוב';
            }
        }
    }

    function showUpdateToast(feed, items, count) {
        pendingUpdate = { feed, items };
        let toast = document.getElementById('newsUpdateToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'newsUpdateToast';
            toast.className = 'news-update-toast';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div>
                <strong>${count} ${count === 1 ? 'עדכון חדש' : 'עדכונים חדשים'}</strong>
                <span>בפיד ${escapeHTML(feedLabel(feed))}</span>
            </div>
            <button type="button">הצג עכשיו</button>
        `;
        toast.classList.add('is-visible');
        toast.querySelector('button')?.addEventListener('click', () => {
            if (!pendingUpdate) return;
            state.news[pendingUpdate.feed] = pendingUpdate.items;
            recomputeCombinedFeed();
            updateLastUpdateTime();
            pendingUpdate = null;
            hideUpdateToast();
            renderCurrentView();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, { once: true });
    }

    function hideUpdateToast() {
        document.getElementById('newsUpdateToast')?.classList.remove('is-visible');
    }

    async function checkForUpdates() {
        if (updateCheckInFlight || document.hidden || state.isArticleView || state.isSearching) return;
        const feed = state.currentTab;
        if (!TRACKED_FEEDS.includes(feed)) return;

        updateCheckInFlight = true;
        try {
            const latestItems = await NewsApi.getCurrentWeekNews(feed);
            const currentIds = new Set(getItems(feed).map(item => String(item.id)));
            const newItems = (latestItems || []).filter(item => !currentIds.has(String(item.id)));
            if (newItems.length > 0) {
                showUpdateToast(feed, latestItems || [], newItems.length);
            }
        } catch (_) {
            // Silent background check: never interrupt reading.
        } finally {
            updateCheckInFlight = false;
        }
    }

    function calculateArchiveDates() {
        const dateType = UI.dateFilter.value;
        const today = new Date();
        let from = '';
        let to = '';

        if (dateType === 'week') {
            const d = new Date(today);
            d.setDate(today.getDate() - 7);
            from = d.toISOString().split('T')[0];
        } else if (dateType === 'month') {
            const d = new Date(today);
            d.setMonth(today.getMonth() - 1);
            from = d.toISOString().split('T')[0];
        } else if (dateType === 'custom') {
            from = UI.dateFrom.value;
            to = UI.dateTo.value;
        }
        return { from, to };
    }

    // Archive can now be browsed by date/feed even with an empty text query.
    checkArchiveWarning = function() {
        UI.archiveWarning?.classList.add('hidden');
    };

    triggerSearch = async function() {
        const q = UI.searchInput.value.trim();
        const feed = UI.feedFilter.value;
        const { from, to } = calculateArchiveDates();
        const hasCriteria = Boolean(q || feed || from || to);

        checkArchiveWarning();

        if (!hasCriteria) {
            state.isSearching = false;
            state.news.search = null;
            return;
        }

        state.isSearching = true;
        if (state.searchAbortController) state.searchAbortController.abort();
        state.searchAbortController = new AbortController();

        updateURLState({
            q,
            feed,
            dateType: UI.dateFilter.value,
            from,
            to
        });

        renderEditorialSkeleton();
        hideError();

        try {
            const results = await NewsApi.searchNews({ q, feedCode: feed, from, to }, state.searchAbortController.signal);
            state.news.search = results || [];
            renderCurrentView();
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Archive/search error:', err);
            showError('הארכיון לא נטען. נסה שוב בעוד רגע.');
        }
    };

    const originalOpenSearchSection = openSearchSection;
    openSearchSection = function(...args) {
        const wasHidden = UI.searchSection.classList.contains('hidden');
        const result = originalOpenSearchSection.apply(this, args);

        if (wasHidden && !UI.searchInput.value.trim() && UI.dateFilter.value === 'any') {
            UI.dateFilter.value = 'week';
            setTimeout(() => triggerSearch(), 0);
        }
        return result;
    };

    const originalRenderSearch = renderSearch;
    renderSearch = function(items) {
        const q = UI.searchInput.value.trim();
        if (q) return originalRenderSearch(items);

        const sorted = [...(items || [])].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
        if (!sorted.length) {
            UI.content.innerHTML = `
                <div class="empty-state">
                    <p>לא נמצאו כתבות בטווח שבחרת.</p>
                </div>
            `;
            return;
        }

        const dateLabel = ({ week: '7 הימים האחרונים', month: 'החודש האחרון', custom: 'טווח התאריכים שנבחר' })[UI.dateFilter.value] || 'הארכיון';
        const feed = UI.feedFilter.value;
        const feedText = feed ? ` · ${feedLabel(feed)}` : '';

        UI.content.innerHTML = `
            <div class="archive-browse-heading">
                <div>
                    <span class="archive-browse-kicker">ARCHIVE</span>
                    <h2>${escapeHTML(dateLabel)}${escapeHTML(feedText)}</h2>
                </div>
                <span class="section-label">${sorted.length} כתבות</span>
            </div>
            <div class="story-cluster archive-story-cluster">
                ${sorted.map(item => renderCompactCard(item)).join('')}
            </div>
        `;
    };

    function readerSize() {
        const value = Number(localStorage.getItem(READER_SIZE_KEY) || 1);
        return [0, 1, 2].includes(value) ? value : 1;
    }

    function setReaderSize(value) {
        const size = Math.max(0, Math.min(2, value));
        try { localStorage.setItem(READER_SIZE_KEY, String(size)); } catch (_) {}
        const page = UI.content.querySelector('.article-page');
        if (page) page.dataset.readerSize = String(size);
        UI.content.querySelectorAll('[data-reader-size]').forEach(button => {
            button.classList.toggle('is-active', Number(button.dataset.readerSize) === size);
        });
    }

    function estimateReadingMinutes(item) {
        const text = String(item?.articleHe || item?.summaryHe || '').replace(/\\n/g, ' ');
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        return Math.max(1, Math.ceil(words / 210));
    }

    function enhanceArticle(item) {
        const page = UI.content.querySelector('.article-page');
        if (!page) return;

        document.title = `${item.titleHe || 'כתבה'} | החדשות של Hen`;
        page.dataset.readerSize = String(readerSize());

        const time = UI.content.querySelector('.article-time');
        if (time && !UI.content.querySelector('.article-read-time')) {
            time.insertAdjacentHTML('afterend', `<span class="article-read-time">· ${estimateReadingMinutes(item)} דק׳ קריאה</span>`);
        }

        const actions = UI.content.querySelector('.article-actions');
        if (!actions || actions.querySelector('.article-reader-controls')) return;

        actions.insertAdjacentHTML('afterbegin', `
            <div class="article-reader-controls" aria-label="כלי קריאה">
                <button type="button" class="reader-tool-btn" data-reader-size="0" aria-label="טקסט קטן">א−</button>
                <button type="button" class="reader-tool-btn" data-reader-size="1" aria-label="טקסט רגיל">א</button>
                <button type="button" class="reader-tool-btn" data-reader-size="2" aria-label="טקסט גדול">א+</button>
                <button type="button" class="reader-tool-btn reader-share-btn" aria-label="שתף כתבה">שתף</button>
            </div>
        `);

        setReaderSize(readerSize());

        actions.querySelectorAll('[data-reader-size]').forEach(button => {
            button.addEventListener('click', () => setReaderSize(Number(button.dataset.readerSize)));
        });

        actions.querySelector('.reader-share-btn')?.addEventListener('click', async (event) => {
            const button = event.currentTarget;
            const shareData = { title: item.titleHe || document.title, url: window.location.href };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    button.textContent = 'הועתק ✓';
                    setTimeout(() => { button.textContent = 'שתף'; }, 1600);
                }
            } catch (_) {}
        });
    }

    const originalRenderArticle = renderArticle;
    renderArticle = function(item) {
        const result = originalRenderArticle(item);
        enhanceArticle(item);
        return result;
    };

    const originalRenderCurrentView = renderCurrentView;
    renderCurrentView = function(...args) {
        const result = originalRenderCurrentView.apply(this, args);
        requestAnimationFrame(enhanceFeedView);
        return result;
    };

    const originalSwitchTab = switchTab;
    switchTab = function(feed, ...args) {
        if (TRACKED_FEEDS.includes(feed)) visitedFeeds.add(feed);
        hideUpdateToast();
        pendingUpdate = null;
        return originalSwitchTab.call(this, feed, ...args);
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (TRACKED_FEEDS.includes(state.currentTab)) visitedFeeds.add(state.currentTab);
        requestAnimationFrame(enhanceFeedView);

        setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) setTimeout(checkForUpdates, 1200);
        });
    });

    window.addEventListener('pagehide', () => {
        visitedFeeds.forEach(feed => {
            lastSeen[feed] = Math.max(Number(lastSeen[feed] || 0), SESSION_STARTED_AT);
        });
        saveLastSeen();
    });
})();
