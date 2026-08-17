(() => {
    const SOURCE_GROUPS = {
        israel: [
            { name: 'Ynet', domain: 'ynet.co.il', url: 'https://www.ynet.co.il', aliases: ['ynet'] },
            { name: 'Walla', domain: 'walla.co.il', url: 'https://news.walla.co.il', aliases: ['walla', 'וואלה'] },
            { name: 'Maariv', domain: 'maariv.co.il', url: 'https://www.maariv.co.il', aliases: ['maariv', 'מעריב'] },
            { name: 'TheMarker', domain: 'themarker.com', url: 'https://www.themarker.com', aliases: ['themarker'] },
            { name: 'ONE', domain: 'one.co.il', url: 'https://www.one.co.il', aliases: ['one'] }
        ],
        romania: [
            { name: 'Digi24', domain: 'digi24.ro', url: 'https://www.digi24.ro', aliases: ['digi24'] },
            { name: 'HotNews', domain: 'hotnews.ro', url: 'https://hotnews.ro', aliases: ['hotnews'] },
            { name: 'G4Media', domain: 'g4media.ro', url: 'https://www.g4media.ro', aliases: ['g4media'] },
            { name: 'Biziday', domain: 'biziday.ro', url: 'https://www.biziday.ro', aliases: ['biziday'] },
            { name: 'Recorder', domain: 'recorder.ro', url: 'https://recorder.ro', aliases: ['recorder'] },
            { name: 'ArgeșPlus', domain: 'argesplus.ro', url: 'https://argesplus.ro', aliases: ['argesplus', 'argeșplus'] },
            { name: 'Gazeta Sporturilor', domain: 'gsp.ro', url: 'https://www.gsp.ro', aliases: ['gazeta sporturilor', 'gsp'] }
        ],
        technology: [
            { name: 'TechCrunch', domain: 'techcrunch.com', url: 'https://techcrunch.com', aliases: ['techcrunch'] },
            { name: 'Ars Technica', domain: 'arstechnica.com', url: 'https://arstechnica.com', aliases: ['ars technica'] },
            { name: 'InfoQ', domain: 'infoq.com', url: 'https://www.infoq.com', aliases: ['infoq'] },
            { name: 'BleepingComputer', domain: 'bleepingcomputer.com', url: 'https://www.bleepingcomputer.com', aliases: ['bleepingcomputer'] },
            { name: 'The Register', domain: 'theregister.com', url: 'https://www.theregister.com', aliases: ['the register'] },
            { name: 'VentureBeat', domain: 'venturebeat.com', url: 'https://venturebeat.com', aliases: ['venturebeat'] }
        ]
    };

    const FEED_LABELS = {
        israel: 'ישראל',
        romania: 'רומניה',
        technology: 'טכנולוגיה',
        forme: 'בשבילי',
        search: 'תוצאות החיפוש'
    };

    let sourceRail;
    let interestRail;

    function escapeRailHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function faviconUrl(domain) {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }

    function getCurrentContext() {
        if (state.isSearching) {
            return {
                feed: UI.feedFilter?.value || 'search',
                items: state.news.search || []
            };
        }

        const feed = state.currentTab || 'romania';
        return {
            feed,
            items: state.news[feed] || []
        };
    }

    function getItemHost(item) {
        try {
            return new URL(item.sourceUrl || '').hostname.toLowerCase().replace(/^www\./, '');
        } catch (_) {
            return '';
        }
    }

    function sourceMatchesItem(source, item) {
        const sourceName = String(item.sourceName || '').toLowerCase();
        const host = getItemHost(item);
        const domain = source.domain.toLowerCase().replace(/^www\./, '');

        if (host === domain || host.endsWith(`.${domain}`)) return true;
        return source.aliases.some(alias => sourceName.includes(alias.toLowerCase()));
    }

    function getSourcesForFeed(feed, items) {
        if (SOURCE_GROUPS[feed]) return SOURCE_GROUPS[feed];

        const all = Object.values(SOURCE_GROUPS).flat();
        const unique = [...new Map(all.map(source => [source.domain, source])).values()];
        const active = unique.filter(source => items.some(item => sourceMatchesItem(source, item)));
        return active.length ? active.slice(0, 8) : unique.slice(0, 8);
    }

    function sourceCount(source, items) {
        return items.reduce((count, item) => count + (sourceMatchesItem(source, item) ? 1 : 0), 0);
    }

    function formatRailTime(dateValue) {
        if (!dateValue) return '';
        try {
            if (typeof formatRelativeHebrewDate === 'function') {
                return formatRelativeHebrewDate(dateValue);
            }
        } catch (_) {}

        return new Date(dateValue).toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jerusalem'
        });
    }

    function createRails() {
        if (document.getElementById('sourceRail') || document.getElementById('interestRail')) return;

        sourceRail = document.createElement('aside');
        sourceRail.id = 'sourceRail';
        sourceRail.className = 'editorial-side-rail editorial-side-rail--sources';
        sourceRail.setAttribute('aria-label', 'מקורות חדשות');

        interestRail = document.createElement('aside');
        interestRail.id = 'interestRail';
        interestRail.className = 'editorial-side-rail editorial-side-rail--interest';
        interestRail.setAttribute('aria-label', 'כתבות מעניינות עכשיו');

        document.body.appendChild(sourceRail);
        document.body.appendChild(interestRail);
    }

    function renderSourceRail(feed, items) {
        if (!sourceRail) return;

        const sources = getSourcesForFeed(feed, items);
        const feedLabel = FEED_LABELS[feed] || FEED_LABELS.search;
        const totalStories = items.length;

        sourceRail.dataset.feed = SOURCE_GROUPS[feed] ? feed : 'search';
        sourceRail.innerHTML = `
            <div class="side-rail-card source-rail-card">
                <div class="side-rail-accent"></div>
                <header class="side-rail-header">
                    <div>
                        <div class="side-rail-kicker">מקורות בפיד</div>
                        <h2>${escapeRailHTML(feedLabel)}</h2>
                    </div>
                    <span class="side-rail-count">${totalStories}</span>
                </header>
                <div class="source-link-list">
                    ${sources.map(source => {
                        const count = sourceCount(source, items);
                        const firstLetter = source.name.trim().charAt(0).toUpperCase();
                        return `
                            <a class="source-link-row${count ? ' source-link-row--active' : ''}"
                               href="${escapeRailHTML(source.url)}"
                               target="_blank"
                               rel="noopener noreferrer"
                               title="פתח את ${escapeRailHTML(source.name)}">
                                <span class="source-avatar" aria-hidden="true">
                                    <img src="${faviconUrl(source.domain)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
                                    <span class="source-avatar-fallback">${escapeRailHTML(firstLetter)}</span>
                                </span>
                                <span class="source-link-name"><bdi>${escapeRailHTML(source.name)}</bdi></span>
                                ${count ? `<span class="source-story-count" title="${count} כתבות בפיד">${count}</span>` : '<span class="source-external">↗</span>'}
                            </a>
                        `;
                    }).join('')}
                </div>
                <footer class="side-rail-footer">
                    <span class="source-live-dot"></span>
                    קישורים ישירים למקורות
                </footer>
            </div>
        `;

        sourceRail.querySelectorAll('.source-avatar img').forEach(img => {
            img.addEventListener('load', () => img.parentElement?.classList.add('has-logo'));
            img.addEventListener('error', () => img.remove());
        });
    }

    function storyPriority(item) {
        const published = new Date(item.publishedAt || item.collectedAt || item.createdAt || 0).getTime();
        const ageHours = Number.isFinite(published) && published > 0
            ? Math.max(0, (Date.now() - published) / 3600000)
            : 24;

        const importance = Number(item.importanceScore || 0);
        const personal = Number(item.personalScore || 0);
        const featured = item.isFeatured ? 10 : 0;
        const freshness = Math.max(0, 14 - ageHours) * 0.75;

        return (importance * 6) + (personal * 2.5) + featured + freshness;
    }

    function selectInterestingStories(items) {
        const sorted = [...items]
            .filter(item => item?.id && item?.titleHe)
            .sort((a, b) => storyPriority(b) - storyPriority(a));

        const selected = [];
        const sourceUsage = new Map();

        for (const item of sorted) {
            const source = String(item.sourceName || getItemHost(item) || 'unknown').toLowerCase();
            const used = sourceUsage.get(source) || 0;
            if (used >= 2) continue;

            selected.push(item);
            sourceUsage.set(source, used + 1);
            if (selected.length === 5) break;
        }

        return selected;
    }

    function renderInterestRail(feed, items) {
        if (!interestRail) return;

        const stories = selectInterestingStories(items);
        const feedLabel = FEED_LABELS[feed] || FEED_LABELS.search;
        interestRail.dataset.feed = SOURCE_GROUPS[feed] ? feed : 'search';

        interestRail.innerHTML = `
            <div class="side-rail-card interest-rail-card">
                <div class="side-rail-accent"></div>
                <header class="side-rail-header interest-rail-header">
                    <div>
                        <div class="side-rail-kicker side-rail-kicker--live"><span class="interest-live-dot"></span> חי עכשיו</div>
                        <h2>עכשיו מעניין</h2>
                    </div>
                </header>
                <div class="interest-story-list">
                    ${stories.length ? stories.map((item, index) => {
                        const source = item.sourceName || '';
                        const time = formatRailTime(item.publishedAt || item.collectedAt || item.createdAt);
                        const importance = Number(item.importanceScore || 0);
                        return `
                            <a class="interest-story${index === 0 ? ' interest-story--lead' : ''}"
                               href="${NEWS_BASE}/${encodeURIComponent(item.id)}"
                               title="${escapeRailHTML(item.titleHe)}">
                                <div class="interest-story-meta">
                                    ${time ? `<span class="interest-story-time">${escapeRailHTML(time)}</span>` : ''}
                                    ${source ? `<span class="interest-story-source"><bdi>${escapeRailHTML(source)}</bdi></span>` : ''}
                                    ${importance >= 5 ? '<span class="interest-story-hot">חשוב</span>' : ''}
                                </div>
                                <div class="interest-story-title">${escapeRailHTML(item.titleHe)}</div>
                            </a>
                        `;
                    }).join('') : `
                        <div class="interest-empty">
                            <span class="interest-empty-dot"></span>
                            ממתין לעדכונים חדשים
                        </div>
                    `}
                </div>
                <footer class="side-rail-footer">מתוך ${escapeRailHTML(feedLabel)}</footer>
            </div>
        `;
    }

    function setRailsVisible(visible) {
        if (sourceRail) sourceRail.classList.toggle('side-rail-hidden', !visible);
        if (interestRail) interestRail.classList.toggle('side-rail-hidden', !visible);
    }

    function updateRails() {
        if (!sourceRail || !interestRail) createRails();

        if (state.isArticleView) {
            setRailsVisible(false);
            return;
        }

        const { feed, items } = getCurrentContext();
        renderSourceRail(feed, items);
        renderInterestRail(feed, items);
        setRailsVisible(true);
    }

    const originalRenderCurrentViewForRails = renderCurrentView;
    renderCurrentView = function(...args) {
        const result = originalRenderCurrentViewForRails.apply(this, args);
        requestAnimationFrame(updateRails);
        return result;
    };

    const originalOpenArticleForRails = openArticle;
    openArticle = async function(...args) {
        setRailsVisible(false);
        return originalOpenArticleForRails.apply(this, args);
    };

    document.addEventListener('DOMContentLoaded', () => {
        createRails();
        updateRails();
    });

    window.addEventListener('pageshow', () => {
        requestAnimationFrame(updateRails);
    });
})();