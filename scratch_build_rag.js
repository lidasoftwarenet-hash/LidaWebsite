const fs = require('fs');

const tutorialsPath = 'C:/Projects/LidaWebsite/guides.html';
const ragPath = 'C:/Projects/LidaWebsite/tutorials/rag/index.html';

const tutorialsStr = fs.readFileSync(tutorialsPath, 'utf8');
const ragStr = fs.readFileSync(ragPath, 'utf8');

const headStart = tutorialsStr.match(/<head>[\s\S]*?(?=<title>)/)[0];
let headRest = tutorialsStr.match(/<link rel="preload"[\s\S]*?<\/head>/)[0];
headRest = headRest.replace('href="logo.png"', 'href="../../logo.png"');

let navMatch = tutorialsStr.match(/<nav class="nav-header" id="navbar">[\s\S]*?<\/nav>/);
let nav = navMatch[0];

// Fix relative links in nav
nav = nav.replace(/href="index\.html/g, 'href="../../index.html');
nav = nav.replace(/href="engineering\.html/g, 'href="../../engineering.html');
nav = nav.replace(/href="interview-prep\.html/g, 'href="../../interview-prep.html');
nav = nav.replace(/href="tutorials\.html/g, 'href="../../guides.html');
nav = nav.replace(/href="Dev-news\.html/g, 'href="../../Dev-news.html');
nav = nav.replace(/href="powers-your-business\/you-business\.html/g, 'href="../../powers-your-business/you-business.html');
nav = nav.replace(/src="logo\.png"/g, 'src="../../logo.png"');

let footerMatch = tutorialsStr.match(/<footer>[\s\S]*?<\/html>/);
let footer = footerMatch[0];

// Extract from RAG prototype:
const ragCssMatch = ragStr.match(/<style>([\s\S]*?)<\/style>/);
let ragCss = ragCssMatch ? ragCssMatch[1] : '';

// To protect global nav, we scoped the basic selectors
ragCss = '<style>\n' + ragCss + '\n</style>';
// Handle body background for RAG page without affecting layout too much
ragCss = ragCss.replace(/body\s*\{[\s\S]*?\}/, 'body { font-family: var(--font); color: var(--text); background: radial-gradient(circle at 15% 5%, rgba(167,139,250,.22), transparent 30rem), radial-gradient(circle at 85% 25%, rgba(56,189,248,.16), transparent 28rem), radial-gradient(circle at 40% 95%, rgba(34,197,94,.07), transparent 24rem), var(--bg); line-height: 1.65; overflow-x: hidden; margin: 0; padding-top: 80px; }');

// We also need to fix RAG's `.sticky-nav` class to not hide behind the main nav
// The main nav height is 80px, so .sticky-nav { top: 80px !important; }
ragCss = ragCss.replace(/\.sticky-nav\s*\{[\s\S]*?\}/, match => match.replace('top: 0;', 'top: 80px;'));

const ragBodyMatch = ragStr.match(/<body>([\s\S]*?)<\/body>/);
let ragBody = ragBodyMatch ? ragBodyMatch[1] : '';

// Remove RAG's footer note
ragBody = ragBody.replace(/<footer class="footer-note page-shell">[\s\S]*?<\/footer>/, '');

// Link to Vector Similarity tutorial inside the RAG body
const calloutToReplace = `<div class="callout" style="margin-top: 18px;">
        <strong>Where vector similarity fits:</strong> the query becomes a vector, each chunk has a vector, and retrieval ranks chunks by how close their vectors are.
      </div>`;

const newCallout = `<div class="callout" style="margin-top: 18px;">
        <strong>Where vector similarity fits:</strong> the query becomes a vector, each chunk has a vector, and retrieval ranks chunks by how close their vectors are.
        <br><br>
        If vector similarity is unclear, start with the <a href="../../tools/vector-sandbox/index.html" style="color: var(--accent-2); text-decoration: underline;">Vector Similarity tutorial</a> first.
      </div>`;

ragBody = ragBody.replace(calloutToReplace, newCallout);

const newHtml = `<!DOCTYPE html>
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
${ragCss}
<body>
${nav}
${ragBody}
${footer}
`;

fs.writeFileSync(ragPath, newHtml, 'utf8');
console.log('Merged successfully with fixed relative links and CSS.');
