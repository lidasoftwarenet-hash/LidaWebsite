(() => {
    const FOOTER_ID = 'newsroomFooter';
    const READ_ACTIVITY_KEY = 'hen_news_read_activity_v1';
    const DASHBOARD_REFRESH_MS = 5 * 60 * 1000;
    const RENDER_REFRESH_MS = 60 * 1000;
    const FEEDS = {
        romania: { label: 'רומניה', short: 'RO' },
        israel: { label: 'ישראל', short: 'IL' },
        technology: { label: 'טכנולוגיה', short: 'TECH' }
    };

    let dashboard = null;
    let dashboardStatus = 'loading';
    let dashboardRequestInFlight = false;
    let lastArticleSnapshot = null;
    let renderQueued = false;

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function safeUrl(value) {
        if (!value) return '';
        try {
            const url = new URL(value, window.location.origin);
            return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
        } catch (_) {
            return '';
        }
    }

    function timestamp(value) {
        const time = value ? new Date(value).getTime() : 0;
        return Number.isFinite(time) ? time : 0;
    }

    function relativeTime(value) {
        if (!value) return '';
        try {
            if (typeof formatRelativeHebrewDate === 'function') {
                return formatRelativeHebrewDate(value);
            }
        } catch (_) {}

        const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp(value)) / 60000));
        if (diffMinutes < 1) return 'עכשיו';
        if (diffMinutes < 60) return `לפני ${diffMinutes} דק׳`;
        const hours = Math.floor(diffMinutes / 60);
        if (hours < 24) return `לפני ${hours} שע׳`;
        return new Date(value).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    }

    function jerusalemDay(value = Date.now()) {
        return new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
    }

    function loadReadActivity() {
        try {
            const value = JSON.parse(localStorage.getItem(READ_ACTIVITY_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    function recordRead(item) {
        if (!item?.id) return;
        lastArticleSnapshot = item;
        try {
            const current = loadReadActivity().filter(entry => String(entry.id) !== String(item.id));
            current.unshift({
                id: item.id,
                titleHe: item.titleHe || '',
                sourceName: item.sourceName || '',
                feedCode: item.feed?.code || '',
                publishedAt: item.publishedAt || item.collectedAt || item.createdAt || null,
                readAt: Date.now()
            });
            localStorage.setItem(READ_ACTIVITY_KEY, JSON.stringify(current.slice(0, 50)));
        } catch (_) {}
        queueRender();
    }

    function normalizeItem(item, feedCode = '') {
        return {
            id: item?.id,
            titleHe: item?.titleHe || '',
            summaryHe: item?.summaryHe || '',
            sourceName: item?.sourceName || '',
            imageUrl: item?.imageUrl || '',
            publishedAt: item?.publishedAt || item?.collectedAt || item?.createdAt || null,
            importanceScore: Number(item?.importanceScore || 0),
            personalScore: Number(item?.personalScore || 0),
            isFeatured: Boolean(item?.isFeatured),
            feedCode: item?.feedCode || item?.feed?.code || feedCode
        };
    }

    function buildLocalDashboard() {
        const feedCodes = Object.keys(FEEDS);
        const feeds = [];
        const allItems = [];

        for (const code of feedCodes) {
            const items = typeof state !== 'undefined' && Array.isArray(state.news?.[code])
                ? state.news[code]
                : [];
            const sources = new Map();
            items.forEach(item => {
                const source = String(item.sourceName || '').trim();
                if (source) sources.set(source, (sources.get(source) || 0) + 1);
                allItems.push(normalizeItem(item, code));
            });
            const rankedSources = [...sources.entries()].sort((a, b) => b[1] - a[1]);
            const dominantCount = rankedSources[0]?.[1] || 0;
            const latest = items.reduce((max, item) => Math.max(max, timestamp(item.publishedAt || item.collectedAt)), 0);
            feeds.push({
                code,
                label: FEEDS[code].label,
                storyCount: items.length,
                sourceCount: sources.size,
                fresh3h: items.filter(item => Date.now() - timestamp(item.publishedAt || item.collectedAt) <= 3 * 3600000).length,
                latestPublishedAt: latest ? new Date(latest).toISOString() : null,
                dominantSource: rankedSources[0]?.[0] || null,
                dominantShare: items.length ? Math.round((dominantCount / items.length) * 100) : 0,
                health: items.length && sources.size >= Math.min(2, items.length) ? 'watch' : 'low'
            });
        }

        if (!allItems.length && lastArticleSnapshot) {
            allItems.push(normalizeItem(lastArticleSnapshot));
        }

        const uniqueSources = new Set(allItems.map(item => item.sourceName.toLowerCase()).filter(Boolean));
        const highlights = [...allItems]
            .sort((a, b) => {
                const score = item => item.importanceScore * 7 + item.personalScore * 2.5 + (item.isFeatured ? 10 : 0) + Math.max(0, 18 - Math.max(0, (Date.now() - timestamp(item.publishedAt)) / 3600000));
                return score(b) - score(a);
            })
            .slice(0, 18);

        const topicCounts = new Map();
        if (typeof state !== 'undefined') {
            for (const code of feedCodes) {
                for (const item of state.news?.[code] || []) {
                    const candidates = [
                        ...(item.topics || []).map(topic => topic.name || topic.code),
                        item.companyTopic
                    ].filter(Boolean);
                    new Set(candidates).forEach(name => topicCounts.set(name, (topicCounts.get(name) || 0) + 1));
                }
            }
        }

        return {
            generatedAt: new Date().toISOString(),
            totals: {
                stories: allItems.length,
                sources: uniqueSources.size,
                fresh3h: allItems.filter(item => Date.now() - timestamp(item.publishedAt) <= 3 * 3600000).length,
                stories24h: allItems.filter(item => Date.now() - timestamp(item.publishedAt) <= 24 * 3600000).length
            },
            feeds,
            trending: [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([name, count]) => ({ name, code: name, count })),
            highlights
        };
    }

    async function loadDashboard() {
        if (dashboardRequestInFlight) return;
        dashboardRequestInFlight = true;
        try {
            dashboard = await NewsApi.getDashboard();
            dashboardStatus = 'live';
        } catch (error) {
            console.warn('Newsroom dashboard unavailable, using local data:', error);
            dashboard = buildLocalDashboard();
            dashboardStatus = 'local';
        } finally {
            dashboardRequestInFlight = false;
            renderFooter();
        }
    }

    function currentDashboard() {
        return dashboard || buildLocalDashboard();
    }

    function currentReadIds() {
        return new Set(loadReadActivity().map(entry => String(entry.id)));
    }

    function selectDontMiss(data) {
        const readIds = currentReadIds();
        const currentId = typeof state !== 'undefined' ? String(state.currentArticleId || '') : '';
        const candidates = (data.highlights || [])
            .map(item => normalizeItem(item, item.feedCode))
            .filter(item => item.id && item.titleHe && !readIds.has(String(item.id)) && String(item.id) !== currentId);

        const selected = [];
        const usedFeeds = new Set();
        for (const item of candidates) {
            if (usedFeeds.has(item.feedCode)) continue;
            selected.push(item);
            usedFeeds.add(item.feedCode);
            if (selected.length === 3) return selected;
        }
        for (const item of candidates) {
            if (selected.some(existing => String(existing.id) === String(item.id))) continue;
            selected.push(item);
            if (selected.length === 3) break;
        }
        return selected;
    }

    function latestSignal(data) {
        return [...(data.highlights || [])]
            .map(item => normalizeItem(item, item.feedCode))
            .filter(item => item.id && item.publishedAt)
            .sort((a, b) => timestamp(b.publishedAt) - timestamp(a.publishedAt))[0] || null;
    }

    function healthLabel(value) {
        if (value === 'good') return 'GOOD';
        if (value === 'watch') return 'WATCH';
        return 'CHECK';
    }

    function healthHebrew(value) {
        if (value === 'good') return 'תקין';
        if (value === 'watch') return 'במעקב';
        return 'דורש בדיקה';
    }

    function overallHealth(feeds) {
        if (!feeds?.length) return 'low';
        if (feeds.some(feed => feed.health === 'low')) return 'low';
        if (feeds.some(feed => feed.health === 'watch')) return 'watch';
        return 'good';
    }

    function renderDontMiss(items) {
        if (!items.length) {
            return '<div class="nf-empty">אין כרגע כתבות משמעותיות שלא נקראו.</div>';
        }
        return items.map((item, index) => {
            const feed = FEEDS[item.feedCode] || { label: 'חדשות', short: 'NEWS' };
            const imageUrl = safeUrl(item.imageUrl);
            return `
                <a class="nf-dontmiss-item" href="${NEWS_BASE}/${encodeURIComponent(item.id)}" data-feed="${esc(item.feedCode)}">
                    <span class="nf-dontmiss-index">0${index + 1}</span>
                    ${imageUrl ? `<span class="nf-dontmiss-thumb"><img src="${esc(imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.nf-dontmiss-thumb')?.classList.add('is-failed')" /></span>` : '<span class="nf-dontmiss-thumb nf-dontmiss-thumb--fallback">HN</span>'}
                    <span class="nf-dontmiss-copy">
                        <span class="nf-meta"><span class="nf-feed-code">${esc(feed.short)}</span><span>${esc(item.sourceName)}</span><span>${esc(relativeTime(item.publishedAt))}</span></span>
                        <strong>${esc(item.titleHe)}</strong>
                    </span>
                    <span class="nf-arrow" aria-hidden="true">↗</span>
                </a>
            `;
        }).join('');
    }

    function renderPulse(data) {
        const feeds = data.feeds || [];
        const maxStories = Math.max(1, ...feeds.map(feed => Number(feed.storyCount || 0)));
        return feeds.map(feed => {
            const width = Math.max(5, Math.round((Number(feed.storyCount || 0) / maxStories) * 100));
            return `
                <button class="nf-feed-stat" type="button" data-footer-feed="${esc(feed.code)}">
                    <span class="nf-feed-stat-head"><b>${esc(feed.label)}</b><span>${Number(feed.storyCount || 0)} כתבות</span></span>
                    <span class="nf-feed-bar"><i style="--nf-width:${width}%"></i></span>
                    <span class="nf-feed-stat-foot"><span>${Number(feed.sourceCount || 0)} מקורות</span><span>${Number(feed.fresh3h || 0)} חדשות ב־3ש׳</span></span>
                </button>
            `;
        }).join('');
    }

    function renderHealth(data) {
        const feeds = data.feeds || [];
        const globalHealth = overallHealth(feeds);
        const dominant = [...feeds].sort((a, b) => Number(b.dominantShare || 0) - Number(a.dominantShare || 0))[0];
        return `
            <div class="nf-health-overall" data-health="${globalHealth}">
                <span class="nf-health-orb"></span>
                <div><small>COVERAGE STATUS</small><strong>${healthLabel(globalHealth)}</strong></div>
            </div>
            <div class="nf-health-list">
                ${feeds.map(feed => `
                    <div class="nf-health-row" data-health="${esc(feed.health)}">
                        <span class="nf-health-dot"></span>
                        <span>${esc(feed.label)}</span>
                        <b>${esc(healthHebrew(feed.health))}</b>
                    </div>
                `).join('')}
            </div>
            <div class="nf-health-note">
                <span>פיזור מקורות</span>
                <b>${Number(data.totals?.sources || 0)} מקורות פעילים</b>
            </div>
            ${dominant?.dominantSource ? `<div class="nf-health-note"><span>המקור הדומיננטי ביותר</span><b><bdi>${esc(dominant.dominantSource)}</bdi> · ${Number(dominant.dominantShare || 0)}%</b></div>` : ''}
        `;
    }

    function renderTrending(data) {
        const topics = data.trending || [];
        if (!topics.length) return '<div class="nf-empty">ממתין למספיק אותות כדי לזהות מגמות.</div>';
        return `
            <div class="nf-trending-cloud">
                ${topics.map((topic, index) => `
                    <button type="button" class="nf-topic${index < 2 ? ' nf-topic--hot' : ''}" data-footer-topic="${esc(topic.name)}">
                        <span>${esc(topic.name)}</span><small>${Number(topic.count || 0)}</small>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function renderPersonal() {
        const activity = loadReadActivity();
        const today = jerusalemDay();
        const readToday = activity.filter(entry => jerusalemDay(entry.readAt) === today).length;
        const recent = activity.slice(0, 3);
        return `
            <div class="nf-personal-stats">
                <div><strong>${readToday}</strong><span>נקראו היום</span></div>
                <div><strong>${activity.length}</strong><span>בהיסטוריה האישית</span></div>
            </div>
            <div class="nf-recent-list">
                ${recent.length ? recent.map(entry => `
                    <a href="${NEWS_BASE}/${encodeURIComponent(entry.id)}" class="nf-recent-item">
                        <span class="nf-recent-dot" data-feed="${esc(entry.feedCode)}"></span>
                        <span><strong>${esc(entry.titleHe)}</strong><small>${esc(entry.sourceName)} · ${esc(relativeTime(new Date(entry.readAt).toISOString()))}</small></span>
                    </a>
                `).join('') : '<div class="nf-empty">אחרי שתקרא כתבות, ההמשך שלך יופיע כאן.</div>'}
            </div>
        `;
    }

    function renderFooter() {
        const footer = document.getElementById(FOOTER_ID);
        if (!footer) return;
        const data = currentDashboard();
        const dontMiss = selectDontMiss(data);
        const signal = latestSignal(data);
        const generatedLabel = data.generatedAt ? relativeTime(data.generatedAt) : 'עכשיו';
        const modeLabel = dashboardStatus === 'live' ? 'LIVE DATA' : dashboardStatus === 'local' ? 'LOCAL SNAPSHOT' : 'CONNECTING';

        footer.innerHTML = `
            <div class="nf-accent-line"></div>
            <div class="nf-grid-bg" aria-hidden="true"></div>
            <div class="nf-shell">
                <div class="nf-brand-row">
                    <a href="${NEWS_BASE}" class="nf-brand" aria-label="HEN NEWS - ראשי">
                        <span class="nf-monogram">HN</span>
                        <span class="nf-brand-copy"><strong>HEN NEWS</strong><small>PERSONAL NEWS INTELLIGENCE</small></span>
                    </a>
                    <div class="nf-live-status">
                        <span class="nf-live-dot"></span>
                        <div><strong>NEWSROOM LIVE</strong><small>${esc(modeLabel)} · סונכרן ${esc(generatedLabel)}</small></div>
                    </div>
                </div>

                ${signal ? `
                    <a class="nf-signal-strip" href="${NEWS_BASE}/${encodeURIComponent(signal.id)}">
                        <span class="nf-signal-label"><i></i>LATEST SIGNAL</span>
                        <span class="nf-signal-copy"><b>${esc(FEEDS[signal.feedCode]?.label || 'חדשות')}</b><strong>${esc(signal.titleHe)}</strong></span>
                        <span class="nf-signal-time">${esc(relativeTime(signal.publishedAt))}</span>
                    </a>
                ` : ''}

                <div class="nf-dashboard-grid">
                    <section class="nf-panel nf-panel--dontmiss">
                        <header class="nf-panel-header"><div><span class="nf-kicker">EDITOR'S DESK</span><h2>לפני שאתה ממשיך</h2></div><span class="nf-panel-count">${dontMiss.length}</span></header>
                        <div class="nf-dontmiss-list">${renderDontMiss(dontMiss)}</div>
                    </section>

                    <section class="nf-panel nf-panel--pulse">
                        <header class="nf-panel-header"><div><span class="nf-kicker">NEWS PULSE</span><h2>מצב הפידים</h2></div><span class="nf-panel-count">${Number(data.totals?.stories || 0)}</span></header>
                        <div class="nf-pulse-summary">
                            <div><strong>${Number(data.totals?.stories24h || 0)}</strong><span>ב־24 שעות</span></div>
                            <div><strong>${Number(data.totals?.fresh3h || 0)}</strong><span>ב־3 שעות</span></div>
                            <div><strong>${Number(data.totals?.sources || 0)}</strong><span>מקורות</span></div>
                        </div>
                        <div class="nf-feed-stats">${renderPulse(data)}</div>
                    </section>

                    <section class="nf-panel nf-panel--health">
                        <header class="nf-panel-header"><div><span class="nf-kicker">SYSTEM WATCH</span><h2>Coverage Health</h2></div></header>
                        ${renderHealth(data)}
                    </section>

                    <section class="nf-panel nf-panel--trending">
                        <header class="nf-panel-header"><div><span class="nf-kicker">SIGNALS</span><h2>מה חוזר בכותרות</h2></div><span class="nf-subtle">לחץ לחיפוש בארכיון</span></header>
                        ${renderTrending(data)}
                    </section>

                    <section class="nf-panel nf-panel--personal">
                        <header class="nf-panel-header"><div><span class="nf-kicker">YOUR NEWS</span><h2>המסלול שלך</h2></div><button type="button" class="nf-text-action" data-footer-action="clear-history">נקה</button></header>
                        ${renderPersonal()}
                    </section>
                </div>

                <div class="nf-footer-nav">
                    <nav aria-label="ניווט תחתון">
                        <button type="button" data-footer-feed="romania">רומניה</button>
                        <button type="button" data-footer-feed="israel">ישראל</button>
                        <button type="button" data-footer-feed="technology">טכנולוגיה</button>
                        <button type="button" data-footer-action="archive">ארכיון</button>
                        <button type="button" data-footer-action="search">חיפוש</button>
                    </nav>
                    <button type="button" class="nf-back-top" data-footer-action="top"><span>חזרה למעלה</span><b>↑</b></button>
                </div>

                <div class="nf-legal-row">
                    <span>HEN NEWS · CURATED PERSONAL NEWS DESK · ${new Date().getFullYear()}</span>
                    <span>מקורות ותמונות נשארים בבעלות המפרסמים המקוריים · סנכרון footer כל 5 דקות</span>
                </div>
            </div>
        `;
    }

    function queueRender() {
        if (renderQueued) return;
        renderQueued = true;
        requestAnimationFrame(() => {
            renderQueued = false;
            renderFooter();
        });
    }

    function openFooterSearch(term = '') {
        try {
            openSearchSection();
            if (UI?.searchInput) {
                UI.searchInput.value = term;
                UI.clearSearchBtn?.classList.toggle('hidden', !term);
            }
            if (term) triggerSearch();
            setTimeout(() => {
                document.getElementById('searchSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                UI?.searchInput?.focus();
            }, 50);
        } catch (_) {
            window.location.href = NEWS_BASE + (term ? `?q=${encodeURIComponent(term)}` : '');
        }
    }

    function setupEvents() {
        const footer = document.getElementById(FOOTER_ID);
        if (!footer) return;
        footer.addEventListener('click', event => {
            const feedButton = event.target.closest('[data-footer-feed]');
            if (feedButton) {
                event.preventDefault();
                const feed = feedButton.getAttribute('data-footer-feed');
                if (feed && typeof switchTab === 'function') {
                    switchTab(feed);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            const topic = event.target.closest('[data-footer-topic]');
            if (topic) {
                event.preventDefault();
                openFooterSearch(topic.getAttribute('data-footer-topic') || '');
                return;
            }

            const action = event.target.closest('[data-footer-action]')?.getAttribute('data-footer-action');
            if (!action) return;
            event.preventDefault();
            if (action === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
            if (action === 'archive') openFooterSearch('');
            if (action === 'search') openFooterSearch('');
            if (action === 'clear-history') {
                try { localStorage.removeItem(READ_ACTIVITY_KEY); } catch (_) {}
                renderFooter();
            }
        });
    }

    function wrapArticleRenderer() {
        if (typeof renderArticle !== 'function') return;
        const originalRenderArticleForFooter = renderArticle;
        renderArticle = function(item) {
            recordRead(item);
            const result = originalRenderArticleForFooter(item);
            queueRender();
            return result;
        };
    }

    function initFooter() {
        setupEvents();
        wrapArticleRenderer();
        renderFooter();
        loadDashboard();

        const content = document.getElementById('newsContent');
        if (content) {
            const observer = new MutationObserver(queueRender);
            observer.observe(content, { childList: true, subtree: false });
        }

        setInterval(loadDashboard, DASHBOARD_REFRESH_MS);
        setInterval(renderFooter, RENDER_REFRESH_MS);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) loadDashboard();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter, { once: true });
    } else {
        initFooter();
    }
})();
