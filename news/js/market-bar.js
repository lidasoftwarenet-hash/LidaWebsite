(() => {
    const MARKET_API_URL = 'https://lidabenzotracker.onrender.com/api/market-summary';
    const REFRESH_MS = 5 * 60 * 1000;

    function createMarketBar() {
        if (document.getElementById('marketStrip')) return;

        const weatherWrap = document.querySelector('.util-weather-wrap');
        if (!weatherWrap) return;

        const separator = document.createElement('span');
        separator.className = 'util-sep market-separator';
        separator.textContent = '|';

        const strip = document.createElement('span');
        strip.id = 'marketStrip';
        strip.className = 'market-strip';
        strip.setAttribute('aria-label', 'נתוני שוק ושערי מטבע');
        strip.innerHTML = `
            <span class="market-item stock-item" title="ZoomInfo Technologies (NASDAQ: GTM)">
                <span class="market-symbol">GTM</span>
                <strong id="zoominfoPrice" class="market-value-stock">--</strong>
                <span id="zoominfoChange" class="market-change"></span>
            </span>
            <span class="market-mini-sep">•</span>
            <span class="market-item" title="1 דולר אמריקאי בשקלים">
                <span class="market-symbol">USD</span>
                <strong id="usdIls" class="market-value">₪--</strong>
            </span>
            <span class="market-mini-sep">•</span>
            <span class="market-item" title="1 אירו בשקלים">
                <span class="market-symbol">EUR</span>
                <strong id="eurIls" class="market-value">₪--</strong>
            </span>
            <span class="market-mini-sep">•</span>
            <span class="market-item" title="1 ליי רומני בשקלים">
                <span class="market-symbol">RON</span>
                <strong id="ronIls" class="market-value">₪--</strong>
            </span>
        `;

        weatherWrap.insertAdjacentElement('afterend', separator);
        separator.insertAdjacentElement('afterend', strip);
    }

    function formatNumber(value, digits) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }).format(value);
    }

    function renderStock(stock) {
        const priceEl = document.getElementById('zoominfoPrice');
        const changeEl = document.getElementById('zoominfoChange');
        if (!priceEl || !changeEl) return;

        if (!stock || !Number.isFinite(Number(stock.price))) {
            priceEl.textContent = '--';
            changeEl.textContent = '';
            changeEl.className = 'market-change';
            return;
        }

        priceEl.textContent = `$${formatNumber(Number(stock.price), 2)}`;

        const pct = Number(stock.changePercent);
        if (!Number.isFinite(pct)) {
            changeEl.textContent = '';
            changeEl.className = 'market-change';
            return;
        }

        const direction = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
        const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '';
        changeEl.className = `market-change market-${direction}`;
        changeEl.textContent = `${arrow}${Math.abs(pct).toFixed(2)}%`;
    }

    function renderFx(rates) {
        const byCode = new Map((rates || []).map(rate => [rate.code, Number(rate.ilsRate)]));
        const targets = {
            USD: document.getElementById('usdIls'),
            EUR: document.getElementById('eurIls'),
            RON: document.getElementById('ronIls'),
        };

        Object.entries(targets).forEach(([code, el]) => {
            if (!el) return;
            const rate = byCode.get(code);
            el.textContent = Number.isFinite(rate) ? `₪${formatNumber(rate, 3)}` : '₪--';
        });
    }

    async function loadMarketSummary() {
        try {
            const response = await fetch(MARKET_API_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Market API returned ${response.status}`);

            const data = await response.json();
            renderStock(data.stock);
            renderFx(data.fx);
        } catch (error) {
            console.error('Failed to load market summary:', error);
            renderStock(null);
            renderFx([]);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        createMarketBar();
        loadMarketSummary();
        setInterval(loadMarketSummary, REFRESH_MS);
    });
})();
