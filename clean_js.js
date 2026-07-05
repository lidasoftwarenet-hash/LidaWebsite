const fs = require('fs');

let content = fs.readFileSync('c:/Projects/LidaWebsite/powers-your-business/you-business.html', 'utf8');

content = content.replace(/const mobileMenuToggle = document\.getElementById\('mobileMenuToggle'\);[\s\S]*?\}\s*\n/g, '');

fs.writeFileSync('c:/Projects/LidaWebsite/powers-your-business/you-business.html', content);
console.log('Cleaned JS');
