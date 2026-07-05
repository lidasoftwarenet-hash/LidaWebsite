const fs = require('fs');
const path = require('path');

function migrateFile(filePath, activeAttr) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (!content.includes('site-nav.css')) {
    let scriptPath = '/components/site-nav.js';
    let cssPath = '/components/site-nav.css';
    const tag = '<link rel="stylesheet" href="' + cssPath + '">\n  <script src="' + scriptPath + '" defer></script>\n';
    content = content.replace('</head>', tag + '</head>');
  }

  // Remove CSS blocks
  content = content.replace(/\/\* Navigation Header \*\/[\s\S]*?\.mobile-menu-toggle\s*\{[^}]+\}/, '');
  
  // Remove nav-container inside media query 768px
  content = content.replace(/\.nav-container\s*\{\s*height:\s*70px;\s*\}/, '');
  content = content.replace(/\.nav-links\s*\{\s*position:\s*fixed;[\s\S]*?z-index:\s*999;\s*\}/, '');
  content = content.replace(/\.nav-links\.active\s*\{\s*transform:\s*translateX\(0\);\s*\}/, '');
  content = content.replace(/\.mobile-menu-toggle\s*\{\s*display:\s*block;[\s\S]*?justify-content:\s*center;\s*\}/, '');
  content = content.replace(/\.nav-social\s*\{\s*flex-direction:\s*row;[\s\S]*?margin-top:\s*10px;\s*\}/, '');
  content = content.replace(/\.nav-social\s*\{\s*flex-direction:\s*row;[\s\S]*?gap:\s*6px;\s*\}/, '');
  content = content.replace(/\.nav-social\s*a\s*svg\s*\{[^}]+\}/, '');
  content = content.replace(/\.nav-links\s*a\s*\{\s*min-height:\s*44px;[^}]+\}/, '');
  content = content.replace(/@media\s*\(\s*max-width\s*:\s*480px\s*\)\s*\{\s*\.nav-links\s*a\s*\{\s*font-size:\s*0\.95em;\s*\}\s*\}/, '');
  
  // Clean up loose pieces
  content = content.replace(/\.nav-links\s+li\.active\s+a\s*\{[^}]+\}/g, '');
  content = content.replace(/\.nav-links\s+li\.active\s+a::after\s*\{[^}]+\}/g, '');
  
  // Replace HTML block
  const navRegex = /<!-- Navigation Header -->\s*<nav class="nav-header" id="navbar">[\s\S]*?<\/nav>/;
  content = content.replace(navRegex, '<site-nav active="' + activeAttr + '"></site-nav>');

  // Remove JS block
  const jsRegex = /\/\/\s*Navbar scroll effect[\s\S]*?navLinks\.classList\.toggle\('active'\);\s*\}\);/;
  content = content.replace(jsRegex, '');
  
  fs.writeFileSync(fullPath, content);
  console.log('Migrated', filePath);
}

try {
  migrateFile('guides.html', 'guides');
  migrateFile('powers-your-business/you-business.html', 'you-business');
} catch (e) {
  console.error(e);
}
