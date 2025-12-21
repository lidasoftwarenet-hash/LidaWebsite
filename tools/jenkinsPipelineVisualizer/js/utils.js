// js/utils.js - Helper functions

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? '#ef4444' : '#10b981';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Copy to clipboard function
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage))
      .catch(() => {
        // Fallback method
        fallbackCopyToClipboard(text, successMessage);
      });
  } else {
    // Fallback for older browsers
    fallbackCopyToClipboard(text, successMessage);
  }
}

function fallbackCopyToClipboard(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('Failed to copy', true);
  }
  
  document.body.removeChild(textArea);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Export SVG as PNG
function exportAsPNG() {
  const svg = document.querySelector('#flowchart svg');
  if (!svg) {
    showToast('No flowchart to export', true);
    return;
  }

  // Clone SVG to avoid modifying the original
  const svgClone = svg.cloneNode(true);
  
  // Get SVG dimensions - use the viewBox from the original SVG
  const viewBox = svg.getAttribute('viewBox').split(' ');
  const svgWidth = parseFloat(viewBox[2]);
  const svgHeight = parseFloat(viewBox[3]);
  
  // Use the SVG dimensions directly for canvas
  const width = svgWidth;
  const height = svgHeight;
  
  svgClone.setAttribute('width', width);
  svgClone.setAttribute('height', height);
  svgClone.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

  // Embed styles directly in SVG
  const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleElement.textContent = `
    text {
      font-family: Arial, sans-serif;
      font-weight: bold;
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .pipeline-box rect { fill: #3b82f6; stroke: #2563eb; stroke-width: 2; }
    .pipeline-box text { fill: white; text-anchor: middle; dominant-baseline: middle; }
    .pipeline-title { font-size: 18px; }
    .pipeline-subtitle { font-size: 14px; }
    .stage-box rect { fill: #10b981; stroke: #059669; stroke-width: 2; }
    .stage-box text { fill: white; text-anchor: middle; dominant-baseline: middle; }
    .stage-title { font-size: 16px; }
    .stage-count { font-size: 12px; font-weight: normal; }
    .parallel-box rect { fill: #f59e0b; stroke: #d97706; stroke-width: 2; }
    .parallel-box text { fill: white; text-anchor: middle; dominant-baseline: middle; }
    .parallel-title { font-size: 16px; }
    .parallel-count { font-size: 12px; font-weight: normal; }
    .post-box rect { fill: #8b5cf6; stroke: #7c3aed; stroke-width: 2; }
    .post-box text { fill: white; text-anchor: middle; dominant-baseline: middle; font-size: 16px; }
    .flow-arrow { stroke: #64748b; stroke-width: 3; fill: none; }
    .flow-arrow-dashed { stroke: #64748b; stroke-width: 2; fill: none; stroke-dasharray: 5,5; }
    .arrow-marker path { fill: #64748b; }
    marker path { fill: #64748b; }
  `;
  svgClone.insertBefore(styleElement, svgClone.firstChild);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Load and draw image
  const img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    
    // Convert to PNG and download
    canvas.toBlob(function(blob) {
      const link = document.createElement('a');
      link.download = 'jenkins-pipeline-' + Date.now() + '.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(url);
      showToast('Pipeline exported as PNG!');
    });
  };
  
  img.onerror = function() {
    URL.revokeObjectURL(url);
    showToast('Export failed. Please try again.', true);
  };
  
  img.src = url;
}

// Create tooltip element
let tooltip = null;

function createTooltip() {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'stage-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function showTooltip(content, x, y) {
  const tip = createTooltip();
  tip.innerHTML = content;
  tip.style.display = 'block';
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

// Add interactive tooltips to SVG elements
function addInteractiveTooltips(ast) {
  setTimeout(() => {
    const stageGroups = document.querySelectorAll('.stage-box, .parallel-box');
    
    stageGroups.forEach((group, idx) => {
      const textElement = group.querySelector('text');
      if (!textElement) return;
      
      const stageName = textElement.textContent;
      
      // Find stage data
      let stageData = null;
      ast.stages.forEach(stage => {
        if (stage.name === stageName) {
          stageData = stage;
        }
        if (stage.parallel) {
          stage.parallel.forEach(p => {
            if (p.name === stageName) {
              stageData = p;
            }
          });
        }
      });
      
      if (!stageData) return;
      
      // Build tooltip content
      let tooltipHTML = `<div class="tooltip-header">${stageName}</div>`;
      if (stageData.steps && stageData.steps.length > 0) {
        tooltipHTML += '<div class="tooltip-steps">';
        stageData.steps.forEach(step => {
          tooltipHTML += `<div class="tooltip-step">▸ ${step}</div>`;
        });
        tooltipHTML += '</div>';
      }
      
      // Add hover events
      group.style.cursor = 'pointer';
      group.addEventListener('mouseenter', (e) => {
        const rect = group.getBoundingClientRect();
        showTooltip(tooltipHTML, rect.left + rect.width / 2, rect.top - 10);
      });
      
      group.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    });
  }, 100);
}

// Zoom and Pan functionality
let currentZoom = 1;
let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

function initZoomPan() {
  const container = document.getElementById('flowchart');
  const svg = container.querySelector('svg');
  
  if (!svg) return;
  
  // Apply transform
  function updateTransform() {
    svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    svg.style.transformOrigin = 'center center';
    svg.style.transition = 'transform 0.2s ease';
  }
  
  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    currentZoom = Math.min(Math.max(0.5, currentZoom + delta), 3);
    updateTransform();
  });
  
  // Pan with mouse drag
  container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.stage-box, .parallel-box')) return; // Don't pan when clicking stages
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    container.style.cursor = 'grabbing';
  });
  
  container.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });
  
  container.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });
  
  container.addEventListener('mouseleave', () => {
    isPanning = false;
    container.style.cursor = 'default';
  });
  
  container.style.cursor = 'grab';
  updateTransform();
}

function zoomIn() {
  currentZoom = Math.min(currentZoom + 0.2, 3);
  const svg = document.querySelector('#flowchart svg');
  if (svg) {
    svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    svg.style.transition = 'transform 0.2s ease';
  }
}

function zoomOut() {
  currentZoom = Math.max(currentZoom - 0.2, 0.5);
  const svg = document.querySelector('#flowchart svg');
  if (svg) {
    svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    svg.style.transition = 'transform 0.2s ease';
  }
}

function resetZoom() {
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  const svg = document.querySelector('#flowchart svg');
  if (svg) {
    svg.style.transform = 'translate(0, 0) scale(1)';
    svg.style.transition = 'transform 0.3s ease';
  }
}

// Simple syntax highlighting for Jenkinsfile
function highlightSyntax(code) {
  const keywords = ['pipeline', 'agent', 'stages', 'stage', 'steps', 'parallel', 'post', 'always', 'success', 'failure', 'environment', 'when', 'branch'];
  const functions = ['echo', 'sh', 'git', 'docker', 'kubectl', 'terraform', 'npm', 'mvn', 'input', 'dir', 'checkout', 'archiveArtifacts', 'publishHTML'];
  
  let highlighted = code;
  
  // Keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
  });
  
  // Functions
  functions.forEach(func => {
    const regex = new RegExp(`\\b(${func})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="function">$1</span>');
  });
  
  // Strings
  highlighted = highlighted.replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');
  highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
  
  // Comments
  highlighted = highlighted.replace(/\/\/(.*?)$/gm, '<span class="comment">//$1</span>');
  highlighted = highlighted.replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>');
  
  // Variables
  highlighted = highlighted.replace(/\$\{([^}]+)\}/g, '<span class="variable">${$1}</span>');
  highlighted = highlighted.replace(/\$([A-Z_][A-Z0-9_]*)/g, '<span class="variable">$$$1</span>');
  
  return highlighted;
}

function applySyntaxHighlighting(textarea) {
  // Create a div overlay for syntax highlighting
  const container = textarea.parentElement;
  const highlightDiv = document.createElement('div');
  highlightDiv.className = 'syntax-highlight-overlay';
  highlightDiv.style.position = 'absolute';
  highlightDiv.style.top = textarea.offsetTop + 'px';
  highlightDiv.style.left = textarea.offsetLeft + 'px';
  highlightDiv.style.width = textarea.offsetWidth + 'px';
  highlightDiv.style.height = textarea.offsetHeight + 'px';
  highlightDiv.style.pointerEvents = 'none';
  highlightDiv.style.overflow = 'hidden';
  highlightDiv.style.fontFamily = textarea.style.fontFamily || 'monospace';
  highlightDiv.style.fontSize = textarea.style.fontSize || '14px';
  highlightDiv.style.lineHeight = textarea.style.lineHeight || '1.6';
  highlightDiv.style.padding = '1rem';
  highlightDiv.style.whiteSpace = 'pre-wrap';
  highlightDiv.style.wordWrap = 'break-word';
  
  // Make textarea background transparent
  textarea.style.background = 'transparent';
  textarea.style.position = 'relative';
  textarea.style.zIndex = '2';
  textarea.style.color = 'transparent';
  textarea.style.caretColor = '#f1f5f9';
  
  // Update highlighting on input
  function updateHighlight() {
    const code = textarea.value;
    highlightDiv.innerHTML = highlightSyntax(code);
    highlightDiv.scrollTop = textarea.scrollTop;
    highlightDiv.scrollLeft = textarea.scrollLeft;
  }
  
  textarea.addEventListener('input', updateHighlight);
  textarea.addEventListener('scroll', () => {
    highlightDiv.scrollTop = textarea.scrollTop;
    highlightDiv.scrollLeft = textarea.scrollLeft;
  });
  
  // Insert highlight div before textarea
  container.style.position = 'relative';
  container.insertBefore(highlightDiv, textarea);
  
  // Initial highlight
  updateHighlight();
}
