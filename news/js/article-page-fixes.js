(() => {
    function forceArticleTop() {
        // SPA navigation does not reset scroll position automatically.
        // Every article should start at the top of the page, including the masthead.
        window.scrollTo(0, 0);
        requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    function alignArticleNavSlider() {
        const nav = document.querySelector('.feed-nav');
        const slider = nav?.querySelector('.feed-nav-slider');
        const active = nav?.querySelector('.feed-btn.active');
        if (!nav || !slider || !active) return;

        const navRect = nav.getBoundingClientRect();
        const btnRect = active.getBoundingClientRect();
        slider.style.left = `${btnRect.left - navRect.left}px`;
        slider.style.width = `${btnRect.width}px`;
    }

    const previousOpenArticle = openArticle;
    openArticle = function(...args) {
        forceArticleTop();
        const result = previousOpenArticle.apply(this, args);

        return Promise.resolve(result).finally(() => {
            if (typeof state !== 'undefined' && state.isArticleView) {
                forceArticleTop();
                requestAnimationFrame(alignArticleNavSlider);
            }
        });
    };

    const previousRenderArticle = renderArticle;
    renderArticle = function(item) {
        const result = previousRenderArticle(item);
        forceArticleTop();

        // The article feed is selected only after its payload is known.
        // Re-measure the sliding pill after the active tab changes.
        requestAnimationFrame(() => {
            alignArticleNavSlider();
            requestAnimationFrame(alignArticleNavSlider);
        });

        return result;
    };

    window.addEventListener('resize', () => {
        if (typeof state !== 'undefined' && state.isArticleView) {
            alignArticleNavSlider();
        }
    }, { passive: true });
})();
