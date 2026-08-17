(() => {
    function enhanceTicker(marquee) {
        if (!marquee || marquee.dataset.tickerEnhanced === 'true') return;

        const items = marquee.querySelector(':scope > .breaking-items');
        if (!items || !items.children.length) return;

        const track = document.createElement('div');
        track.className = 'breaking-track';

        const duplicate = items.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));

        track.appendChild(items);
        track.appendChild(duplicate);
        marquee.appendChild(track);
        marquee.dataset.tickerEnhanced = 'true';
    }

    function enhanceAllTickers() {
        document.querySelectorAll('.breaking-marquee').forEach(enhanceTicker);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const newsContent = document.getElementById('newsContent');
        if (!newsContent) return;

        enhanceAllTickers();

        const observer = new MutationObserver(() => {
            requestAnimationFrame(enhanceAllTickers);
        });

        observer.observe(newsContent, {
            childList: true,
            subtree: true,
        });
    });
})();
