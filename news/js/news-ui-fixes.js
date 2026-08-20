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
        if (!window.state?.news || !TRACKED_FEEDS.includes(feed)) return 0;
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
                return;
            }

            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'feed-unread-badge';
                tab.appendChild(badge);
            }

            const visibleCount = count > 99 ? '99+' : String(count);
            badge.innerHTML = `<span class="feed-unread-number">${visibleCount}</span><span class="feed-unread-word"> חדש</span>`;
            badge.setAttribute('aria-label', `${count} כתבות חדשות מאז הביקור האחרון בפיד ${FEED_LABELS[feed]}`);
            badge.setAttribute('title', `${count} כתבות חדשות מאז הביקור האחרון בפיד ${FEED_LABELS[feed]}`);
        });
    }

    function alignSideRails() {
        const rails = document.querySelectorAll('.editorial-side-rail');
        if (!rails.length) return;
        if (window.state?.isArticleView || window.state?.isSearching) return;

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

        // Create slider element
        const slider = document.createElement('div');
        slider.className = 'feed-nav-slider';
        nav.prepend(slider);

        function moveSliderToActive() {
            const activeBtn = nav.querySelector('.feed-btn.active');
            if (!activeBtn) return;
            const navRect = nav.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            slider.style.left = (btnRect.left - navRect.left) + 'px';
            slider.style.width = btnRect.width + 'px';
        }

        // Move on tab click (before .active class changes)
        nav.addEventListener('click', (e) => {
            const btn = e.target.closest('.feed-btn[data-feed]');
            if (!btn) return;
            // Defer so .active has been toggled by app.js first
            requestAnimationFrame(() => {
                requestAnimationFrame(moveSliderToActive);
            });
        });

        // Initial position (no transition on first paint)
        slider.style.transition = 'none';
        moveSliderToActive();
        // Re-enable transition after first paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                slider.style.transition = '';
            });
        });

        // Re-align on resize
        window.addEventListener('resize', moveSliderToActive, { passive: true });
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
                // Existing experience code may redraw badges; normalize their label afterwards.
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
        // Recheck briefly during startup so its unread badge appears without requiring a click.
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
