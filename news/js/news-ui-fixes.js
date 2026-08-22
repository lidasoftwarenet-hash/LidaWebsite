(() => {
    const LAST_SEEN_KEY = 'hen_news_last_seen_v2';
    const FIRST_VISIT_LOOKBACK_MS = 6 * 60 * 60 * 1000;
    const PAGE_STARTED_AT = Date.now();
    const TRACKED_FEEDS = ['romania', 'israel', 'technology'];
    const FEED_LABELS = {
        romania: 'רומניה',
        israel: 'ישראל',
        technology: 'טכנולוגיה'
    };

    function loadLastSeen() {
        try {
            const parsed = JSON.parse(localStorage.getItem(LAST_SEEN_KEY) || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function itemTimestamp(item) {
        const raw = item?.publishedAt || item?.collectedAt || item?.createdAt;
        const value = raw ? new Date(raw).getTime() : 0;
        return Number.isFinite(value) ? value : 0;
    }

    function unreadCount(feed) {
        if (typeof state === 'undefined' || !state.news || !TRACKED_FEEDS.includes(feed)) return 0;
        const items = state.news[feed] || [];
        const lastSeen = loadLastSeen();
        const saved = Number(lastSeen[feed] || 0);
        const threshold = saved > 0 ? saved : PAGE_STARTED_AT - FIRST_VISIT_LOOKBACK_MS;
        return items.reduce((count, item) => count + (itemTimestamp(item) > threshold ? 1 : 0), 0);
    }

    function syncUnreadBadges() {
        document.querySelectorAll('.feed-btn[data-feed]').forEach(tab => {
            const feed = tab.getAttribute('data-feed');
            if (!TRACKED_FEEDS.includes(feed)) return;

            const count = unreadCount(feed);
            let badge = tab.querySelector('.feed-unread-badge');

            if (count <= 0) {
                badge?.remove();
                tab.setAttribute('aria-label', FEED_LABELS[feed]);
                tab.removeAttribute('title');
                return;
            }

            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'feed-unread-badge';
                badge.setAttribute('aria-hidden', 'true');
                tab.appendChild(badge);
            }

            const visibleCount = count > 99 ? '99+' : String(count);
            badge.textContent = visibleCount;
            tab.setAttribute('aria-label', `${FEED_LABELS[feed]}, ${count} כתבות חדשות`);
            tab.setAttribute('title', `${count} כתבות חדשות מאז הביקור האחרון בפיד ${FEED_LABELS[feed]}`);
        });
    }

    function alignSideRails() {
        const rails = document.querySelectorAll('.editorial-side-rail');
        if (!rails.length) return;
        if (typeof state !== 'undefined' && (state.isArticleView || state.isSearching)) return;

        // Align the side rails with the editorial hero, never with the moving ticker.
        const anchor = document.querySelector('#newsContent .hero-grid') ||
            document.querySelector('#newsContent .section-header') ||
            document.querySelector('#newsContent');
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const top = Math.max(0, Math.round(rect.top + window.scrollY));
        rails.forEach(rail => {
            rail.style.top = `${top}px`;
        });
    }

    function showArticleSiteChrome() {
        document.querySelector('.sticky-nav-wrapper')?.classList.remove('hidden');
        document.querySelector('.news-header')?.classList.remove('hidden');
        document.getElementById('utilityBar')?.classList.remove('hidden');
        document.getElementById('searchSection')?.classList.add('hidden');
        document.body.classList.add('news-article-with-header');
    }

    function syncArticleFeed(feed) {
        if (!TRACKED_FEEDS.includes(feed)) return;
        if (typeof state !== 'undefined') state.currentTab = feed;
        document.querySelector('.news-app')?.setAttribute('data-current-feed', feed);
        document.querySelectorAll('.feed-btn[data-feed]').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-feed') === feed);
        });
    }

    // Keep the complete site masthead visible on every article page.
    const originalOpenArticleForHeader = openArticle;
    openArticle = function(...args) {
        const result = originalOpenArticleForHeader.apply(this, args);
        showArticleSiteChrome();
        return Promise.resolve(result).finally(() => {
            if (typeof state === 'undefined' || state.isArticleView) showArticleSiteChrome();
        });
    };

    // Once the article payload is available, highlight the feed it belongs to.
    const originalRenderArticleForHeader = renderArticle;
    renderArticle = function(item) {
        const result = originalRenderArticleForHeader(item);
        showArticleSiteChrome();
        syncArticleFeed(item?.feed?.code || '');
        requestAnimationFrame(syncUnreadBadges);
        return result;
    };

    // Feed navigation remains functional while reading an article.
    const originalSwitchTabForHeader = switchTab;
    switchTab = function(feed, skipPushState = false) {
        if (typeof state !== 'undefined' && state.isArticleView && feed !== 'archive') {
            state.isArticleView = false;
            state.currentArticleId = null;
            document.body.classList.remove('news-article-with-header');

            if (!skipPushState) {
                window.history.pushState({ tab: feed }, '', NEWS_BASE);
            }

            return originalSwitchTabForHeader.call(this, feed, true);
        }
        return originalSwitchTabForHeader.call(this, feed, skipPushState);
    };

    // Archive also works directly from an article page instead of opening over the article.
    const originalOpenSearchForHeader = openSearchSection;
    openSearchSection = function(...args) {
        if (typeof state !== 'undefined' && state.isArticleView) {
            state.isArticleView = false;
            state.currentArticleId = null;
            document.body.classList.remove('news-article-with-header');
            window.history.pushState({ archive: true }, '', NEWS_BASE);
            renderCurrentView();
        }
        return originalOpenSearchForHeader.apply(this, args);
    };

    let framePending = false;
    function scheduleSync() {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(() => {
            framePending = false;
            syncUnreadBadges();
            alignSideRails();
        });
    }

    function initPillSlider() {
        const nav = document.querySelector('.feed-nav');
        if (!nav) return;
        const track = nav.querySelector('.feed-nav-primary') || nav;

        // The slider belongs only to the three editorial feeds. Archive is a
        // separate utility action and deliberately sits outside this track.
        const slider = document.createElement('div');
        slider.className = 'feed-nav-slider';
        track.prepend(slider);

        function moveSliderToActive() {
            if (typeof state !== 'undefined' && state.isSearching) {
                slider.style.opacity = '0';
                return;
            }

            const activeBtn = track.querySelector('.feed-btn.active');
            if (!activeBtn) {
                slider.style.opacity = '0';
                return;
            }

            const trackRect = track.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            slider.style.opacity = '1';
            slider.style.left = (btnRect.left - trackRect.left) + 'px';
            slider.style.width = btnRect.width + 'px';
        }

        nav.addEventListener('click', (e) => {
            const btn = e.target.closest('.feed-btn[data-feed]');
            if (!btn) return;
            requestAnimationFrame(() => {
                requestAnimationFrame(moveSliderToActive);
            });
        });

        slider.style.transition = 'none';
        moveSliderToActive();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                slider.style.transition = '';
            });
        });

        // Badges arrive asynchronously. Re-measure whenever their content is
        // inserted/removed so the blue pill always matches the real tab width.
        const trackObserver = new MutationObserver(() => {
            requestAnimationFrame(moveSliderToActive);
        });
        trackObserver.observe(track, { childList: true, subtree: true, characterData: true });

        window.addEventListener('resize', moveSliderToActive, { passive: true });
        window.addEventListener('pageshow', moveSliderToActive);
    }

    function init() {
        const content = document.getElementById('newsContent');
        if (content) {
            const observer = new MutationObserver(scheduleSync);
            observer.observe(content, { childList: true, subtree: true });
        }

        const nav = document.querySelector('.feed-nav');
        if (nav) {
            const navObserver = new MutationObserver(() => {
                setTimeout(syncUnreadBadges, 0);
            });
            navObserver.observe(nav, { childList: true, subtree: true });
        }

        window.addEventListener('resize', scheduleSync, { passive: true });
        window.addEventListener('pageshow', scheduleSync);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) scheduleSync();
        });

        scheduleSync();
        initPillSlider();

        // Israel is fetched asynchronously after the initial Romania render.
        let startupChecks = 0;
        const startupTimer = setInterval(() => {
            scheduleSync();
            startupChecks += 1;
            if (startupChecks >= 24) clearInterval(startupTimer);
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();