const fs = require('fs');

let content = fs.readFileSync('c:/Projects/LidaWebsite/powers-your-business/you-business.html', 'utf8');

content = content.replace(/\/\*\s*NAV\s*\*\/[\s\S]*?\.mobile-menu-toggle\s*\{\s*display:\s*block;\s*\}[\s\S]*?\.nav-social\s*\{\s*margin-top:\s*auto;\s*\}\s*\}/, '');

fs.writeFileSync('c:/Projects/LidaWebsite/powers-your-business/you-business.html', content);
console.log('Cleaned');
