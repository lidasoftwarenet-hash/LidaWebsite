(() => {
    const originalRenderHeroCard = renderHeroCard;
    const originalRenderMajorCard = renderMajorCard;
    const originalRenderStandardCard = renderStandardCard;
    const originalRenderArticle = renderArticle;

    function safeImageUrl(value) {
        if (!value) return '';
        try {
            const url = new URL(value, window.location.origin);
            if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
            return url.toString();
        } catch (_) {
            return '';
        }
    }

    function sourceInitial(item) {
        const source = String(item?.sourceName || 'News').trim();
        return source.charAt(0).toUpperCase() || 'N';
    }

    function renderMedia(item, variant, options = {}) {
        const imageUrl = safeImageUrl(item?.imageUrl);
        const source = escapeHTML(item?.sourceName || 'News');
        const initial = escapeHTML(sourceInitial(item));
        const priority = options.priority ? ' fetchpriority="high"' : '';
        const loading = options.priority ? 'eager' : 'lazy';
        const showFallback = options.showFallback || Boolean(imageUrl);

        if (!imageUrl && !showFallback) return '';

        return `
            <div class="news-story-media news-story-media--${variant}${imageUrl ? ' has-source-image' : ' is-fallback'}">
                <div class="news-story-media-fallback" aria-hidden="true">
                    <span class="news-media-live">NEWS</span>
                    <span class="news-media-initial">${initial}</span>
                    <span class="news-media-source"><bdi>${source}</bdi></span>
                </div>
                ${imageUrl ? `
                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt=""
                        loading="${loading}"
                        decoding="async"${priority}
                        referrerpolicy="no-referrer"
                        onerror="this.classList.add('news-media-image-failed')"
                    />
                ` : ''}
                <span class="news-media-shade" aria-hidden="true"></span>
            </div>
        `;
    }

    renderHeroCard = function(item) {
        const freshHtml = isFresh(item.publishedAt || item.collectedAt)
            ? '<span class="meta-fresh">חדש</span>'
            : '';

        return `
            <article class="editorial-card card-hero card-hero--visual">
                <a href="${NEWS_BASE}/${item.id}" class="block-link">
                    ${renderMedia(item, 'hero', { priority: true, showFallback: true })}
                    <div class="news-card-copy news-card-copy--hero">
                        <div class="card-meta">
                            ${freshHtml}
                            <span class="meta-category">${escapeHTML(item.category || item.location || 'ראשי')}</span>
                            <span class="meta-sep">/</span>
                            <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                        </div>
                        <h2 class="card-title">${escapeHTML(item.titleHe)}</h2>
                        <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
                        <div class="card-meta news-card-source-row">
                            <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                            <span class="news-source-mark" aria-hidden="true">↗</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    };

    renderMajorCard = function(item) {
        const media = renderMedia(item, 'major');
        if (!media) return originalRenderMajorCard(item);

        return `
            <article class="editorial-card card-major card-major--visual">
                <a href="${NEWS_BASE}/${item.id}" class="block-link">
                    <div class="major-story-copy">
                        <div class="card-meta">
                            <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                            <span class="meta-sep">/</span>
                            <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                        </div>
                        <h3 class="card-title">${escapeHTML(item.titleHe)}</h3>
                        <p class="card-summary">${escapeHTML(item.summaryHe)}</p>
                    </div>
                    ${media}
                </a>
            </article>
        `;
    };

    renderStandardCard = function(item) {
        const shouldShowImage = Boolean(safeImageUrl(item?.imageUrl)) && Number(item?.importanceScore || 0) >= 4;
        if (!shouldShowImage) return originalRenderStandardCard(item);

        return `
            <article class="editorial-card card-standard card-standard--visual">
                <a href="${NEWS_BASE}/${item.id}" class="block-link">
                    ${renderMedia(item, 'standard')}
                    <div class="news-card-copy news-card-copy--standard">
                        <div class="card-meta">
                            <span class="meta-source"><bdi>${escapeHTML(item.sourceName)}</bdi></span>
                            <span class="meta-sep">/</span>
                            <span class="meta-time">${formatRelativeHebrewDate(item.publishedAt || item.collectedAt)}</span>
                        </div>
                        <h3 class="card-title">${escapeHTML(item.titleHe)}</h3>
                    </div>
                </a>
            </article>
        `;
    };

    renderArticle = function(item) {
        originalRenderArticle(item);

        const imageUrl = safeImageUrl(item?.imageUrl);
        if (!imageUrl) return;

        const header = UI.content.querySelector('.article-header');
        if (!header) return;

        header.insertAdjacentHTML('afterend', `
            <figure class="article-lead-media">
                <div class="article-lead-media-frame">
                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt=""
                        loading="eager"
                        decoding="async"
                        fetchpriority="high"
                        referrerpolicy="no-referrer"
                        onerror="this.closest('.article-lead-media')?.remove()"
                    />
                </div>
                <figcaption>תמונה מתוך הכתבה המקורית · <bdi>${escapeHTML(item.sourceName || '')}</bdi></figcaption>
            </figure>
        `);
    };
})();
