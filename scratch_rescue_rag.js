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

// Extract pure RAG body from the corrupted ragPath
const stickyNavMatch = ragStr.match(/<nav class="sticky-nav"[\s\S]*?<\/main>/);
const stickyNavToMain = stickyNavMatch ? stickyNavMatch[0] : '';

const scriptMatch = ragStr.match(/<script>[\s\S]*?const knowledgeBases[\s\S]*?<\/script>/);
const scriptBlock = scriptMatch ? scriptMatch[0] : '';

let pureRagBody = stickyNavToMain + '\n\n  ' + scriptBlock;

const ragCssMatch = ragStr.match(/<style>([\s\S]*?)<\/style>/);
let ragCss = ragCssMatch ? ragCssMatch[1] : '';
ragCss = '<style>\n' + ragCss + '\n</style>';

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
${pureRagBody}
${footer}
`;

fs.writeFileSync(ragPath, newHtml, 'utf8');
console.log('Fixed and merged successfully.');
