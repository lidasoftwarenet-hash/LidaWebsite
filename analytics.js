window.addEventListener('load', () => {
    // Prevent tracking local development visits
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
    }

    // Send tracking data to the NestJS backend
    fetch('https://lidabenzotracker.onrender.com/analytics/track', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null
        }),
        keepalive: true // Ensures the request completes even if the user immediately closes the tab
    }).catch((error) => {
        // Log errors to console for debugging CORS or network issues
        console.error('Analytics tracking failed:', error);
    });
});