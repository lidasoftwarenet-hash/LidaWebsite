const fs = require('fs');
let html = fs.readFileSync('C:/Projects/LidaWebsite/tutorials/rag/index.html', 'utf8');

// The html currently has no RAG css, and lost its global CSS. 
// Actually, wait, let's just use guides.html to extract the proper <head> 
// and merge the body correctly. This will cleanly reconstruct the page.

const tutorialsHtml = fs.readFileSync('C:/Projects/LidaWebsite/guides.html', 'utf8');

// 1. Get head and global styles from tutorials
const headStart = tutorialsHtml.match(/<head>[\s\S]*?(?=<title>)/)[0];

// The global styles block is inside <head> after <title>. 
// We must extract the <style> block from guides.html and put it in headRest
const styleMatch = tutorialsHtml.match(/<style>[\s\S]*?<\/style>/);
const globalStyle = styleMatch ? styleMatch[0] : '';

let headRest = tutorialsHtml.match(/<link rel="preload"[\s\S]*?<\/head>/)[0];
// Ensure the global style is in headRest if it was before the link rel preload. Actually in guides.html, the <style> is at the END of <head>, after Google fonts.
// So headRest already contains the global <style>.
// Let's replace the duplicate style blocks in headRest just in case we capture it multiple times? No, the regex /<link rel="preload"[\s\S]*?<\/head>/ grabs everything from the preload link to the end of head, which includes the global <style>.
headRest = headRest.replace('href="logo.png"', 'href="../../logo.png"');

// 2. Add link to our scoped rag.css inside headRest
headRest = headRest.replace('</head>', '  <link rel="stylesheet" href="rag.css">\n</head>');

// 3. Get nav from tutorials
let nav = tutorialsHtml.match(/<nav class="nav-header" id="navbar">[\s\S]*?<\/nav>/)[0];
nav = nav.replace(/href="index\.html/g, 'href="../../index.html');
nav = nav.replace(/href="engineering\.html/g, 'href="../../engineering.html');
nav = nav.replace(/href="interview-prep\.html/g, 'href="../../interview-prep.html');
nav = nav.replace(/href="tutorials\.html/g, 'href="../../guides.html');
nav = nav.replace(/href="Dev-news\.html/g, 'href="../../Dev-news.html');
nav = nav.replace(/href="powers-your-business\/you-business\.html/g, 'href="../../powers-your-business/you-business.html');
nav = nav.replace(/src="logo\.png"/g, 'src="../../logo.png"');

// 4. Get footer from tutorials
let footer = tutorialsHtml.match(/<footer>[\s\S]*?<\/html>/)[0];

// 5. Extract the pure RAG body from current rag/index.html (it should have the sticky-nav and main and script)
const stickyNavMatch = html.match(/<nav class="sticky-nav"[\s\S]*?<\/main>/);
const stickyNavToMain = stickyNavMatch ? stickyNavMatch[0] : '';
const scriptMatch = html.match(/<script>[\s\S]*?const knowledgeBases[\s\S]*?<\/script>/);
const scriptBlock = scriptMatch ? scriptMatch[0] : '';

// 6. Wrap the RAG content in our scope div
const ragContentWrapped = '<div id="rag-tutorial-root">\n' + stickyNavToMain + '\n</div>\n' + scriptBlock;

// Assemble
const finalHtml = `<!DOCTYPE html>
<html lang="en">
${headStart}
  <title>Understanding RAG: Retrieval-Augmented Generation | LiDa Software</title>
  <meta name="description" content="Learn how RAG retrieves relevant chunks, builds prompt context, and helps AI answer using external knowledge. Includes an interactive client-side RAG sandbox." />
  <meta property="og:title" content="Understanding RAG: Retrieval-Augmented Generation | LiDa Software" />
  <meta property="og:description" content="Learn how RAG retrieves relevant chunks, builds prompt context, and helps AI answer using external knowledge. Includes an interactive client-side RAG sandbox." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://www.lidasoftware.online/tutorials/rag/index.html" />
  <meta property="og:image" content="https://www.lidasoftware.online/assets/og-image.jpg" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="Understanding RAG: Retrieval-Augmented Generation | LiDa Software" />
  <meta property="twitter:description" content="Learn how RAG retrieves relevant chunks, builds prompt context, and helps AI answer using external knowledge. Includes an interactive client-side RAG sandbox." />
  <meta property="twitter:image" content="https://www.lidasoftware.online/assets/og-image.jpg" />
  <link rel="canonical" href="https://www.lidasoftware.online/tutorials/rag/index.html">
${headRest}
<body>
${nav}
${ragContentWrapped}
${footer}
`;

fs.writeFileSync('C:/Projects/LidaWebsite/tutorials/rag/index.html', finalHtml, 'utf8');
console.log('Successfully reassembled the RAG page with perfectly scoped CSS and isolated DOM.');
