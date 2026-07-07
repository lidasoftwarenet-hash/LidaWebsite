const fs = require('fs');
const path = require('path');

function injectAnalytics(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectAnalytics(fullPath); // Recursive run on subdirectories
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Ensure we haven't already injected
            if (!content.includes('analytics.js')) {
                content = content.replace('</head>', '  <script src="/analytics.js" defer></script>\n</head>');
                fs.writeFileSync(fullPath, content);
                console.log(`Injected into: ${file}`);
            }
        }
    });
}

injectAnalytics('./'); // Path to your HTML files directory