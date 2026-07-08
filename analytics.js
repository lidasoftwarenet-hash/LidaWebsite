window.addEventListener('load', () => {
    // Prevent tracking local development visits
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    ) {
        return;
    }

    const storageKey = 'anonymous_visitor_id';

    let anonymousVisitorId = localStorage.getItem(storageKey);

    if (!anonymousVisitorId) {
        anonymousVisitorId = crypto.randomUUID();
        localStorage.setItem(storageKey, anonymousVisitorId);
    }

    // Send tracking data to the NestJS backend
    fetch('https://lidabenzotracker.onrender.com/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
            anonymous_visitor_id: anonymousVisitorId
        }),
        keepalive: true
    }).catch((error) => {
        console.error('Analytics tracking failed:', error);
    });
});