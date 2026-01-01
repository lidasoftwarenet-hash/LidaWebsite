// Graph Visualizer Application - Enhanced Version
let currentData = null;
let isDragging = false;
let selectedNode = null;
let filteredTypes = new Set();
let searchTerm = '';

// Zoom and Pan State
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// Initialize application
function init() {
  checkWelcomeModal();
  setupEventListeners();
  // Auto-render the default example
  setTimeout(() => renderGraph(), 100);
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('renderBtn').addEventListener('click', renderGraph);
  document.getElementById('clearBtn').addEventListener('click', clearGraph);
  document.getElementById('exportBtn').addEventListener('click', exportGraph);
  document.getElementById('exportPngBtn').addEventListener('click', exportGraphAsPNG);
  document.getElementById('closeDetailsBtn')?.addEventListener('click', closeDetailsPanel);
  document.getElementById('searchInput')?.addEventListener('input', handleSearch);
  
  // Show prompts button - reopens welcome modal
  document.getElementById('showPromptsBtn')?.addEventListener('click', showWelcomeModal);
  
  // Zoom controls
  document.getElementById('zoomInBtn')?.addEventListener('click', () => adjustZoom(0.1));
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => adjustZoom(-0.1));
  document.getElementById('zoomResetBtn')?.addEventListener('click', resetZoom);
  document.getElementById('fitToScreenBtn')?.addEventListener('click', fitToScreen);
  
  // Update scale value display
  document.getElementById('exportScale')?.addEventListener('input', (e) => {
    document.getElementById('scaleValue').textContent = e.target.value + 'x';
  });
  
  // Filter checkboxes
  document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });
  
  // Pan with mouse drag on graph area
  const graphArea = document.getElementById('graph');
  graphArea?.addEventListener('mousedown', startPan);
  graphArea?.addEventListener('wheel', handleWheel, { passive: false });
}

// Zoom Functions
function adjustZoom(delta) {
  zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
  applyZoom();
}

function resetZoom() {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  applyZoom();
}

function fitToScreen() {
  const graphArea = document.getElementById('graph');
  const canvasWrapper = graphArea?.querySelector('.canvas-wrapper');
  if (!canvasWrapper) return;
  
  const wrapperWidth = parseInt(canvasWrapper.style.width);
  const wrapperHeight = parseInt(canvasWrapper.style.height);
  const areaWidth = graphArea.clientWidth;
  const areaHeight = graphArea.clientHeight;
  
  const scaleX = areaWidth / wrapperWidth;
  const scaleY = areaHeight / wrapperHeight;
  zoomLevel = Math.min(scaleX, scaleY) * 0.9;
  panX = 0;
  panY = 0;
  applyZoom();
}

function applyZoom() {
  const canvasWrapper = document.querySelector('.canvas-wrapper');
  if (!canvasWrapper) return;
  
  canvasWrapper.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
  
  // Update zoom level display
  const zoomLevelEl = document.getElementById('zoomLevel');
  if (zoomLevelEl) {
    zoomLevelEl.textContent = Math.round(zoomLevel * 100) + '%';
  }
}

// Pan Functions
function startPan(e) {
  if (e.target.closest('.node') || e.button !== 0) return;
  
  isPanning = true;
  panStartX = e.clientX - panX;
  panStartY = e.clientY - panY;
  
  const graphArea = document.getElementById('graph');
  graphArea.classList.add('panning');
  
  document.addEventListener('mousemove', doPan);
  document.addEventListener('mouseup', endPan);
}

function doPan(e) {
  if (!isPanning) return;
  
  panX = e.clientX - panStartX;
  panY = e.clientY - panStartY;
  applyZoom();
}

function endPan() {
  isPanning = false;
  const graphArea = document.getElementById('graph');
  graphArea.classList.remove('panning');
  
  document.removeEventListener('mousemove', doPan);
  document.removeEventListener('mouseup', endPan);
}

// Mouse wheel zoom
function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  adjustZoom(delta);
}

// Welcome Modal Functions
function checkWelcomeModal() {
  // Don't auto-hide the modal - let user close it manually
  // The modal will only close when user clicks "Go to App" button
}

function copyWelcomeText() {
  const textToCopy = document.getElementById('copyText').textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    const copyButton = document.querySelector('.copy-button');
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '✓ Copied!';
    copyButton.classList.add('copied');
    setTimeout(() => {
      copyButton.innerHTML = originalText;
      copyButton.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy text. Please select and copy manually.');
  });
}

function showWelcomeModal() {
  const modal = document.getElementById('welcomeModal');
  modal.classList.remove('hidden');
}

function closeWelcomeModal() {
  const modal = document.getElementById('welcomeModal');
  modal.classList.add('hidden');
  localStorage.setItem('welcomeModalSeen', 'true');
}

// Message Display
function showMessage(text, type = 'error') {
  const msgEl = document.getElementById('message');
  msgEl.className = `message ${type}`;
  msgEl.textContent = text;
  setTimeout(() => {
    msgEl.textContent = '';
    msgEl.className = 'message';
  }, 5000);
}

// Clear Graph
function clearGraph() {
  document.getElementById('graph').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <p><strong>No graph rendered yet</strong></p>
      <p>Paste your project JSON and click "Render Graph"</p>
    </div>
  `;
  document.getElementById('stats').style.display = 'none';
  closeDetailsPanel();
  currentData = null;
  selectedNode = null;
}

// Search Handler
function handleSearch(e) {
  searchTerm = e.target.value.toLowerCase();
  if (currentData) {
    highlightSearchResults();
  }
}

function highlightSearchResults() {
  const nodes = document.querySelectorAll('.node');
  if (nodes.length === 0) return;
  
  nodes.forEach(node => {
    const labelEl = node.querySelector('.node-label');
    const typeEl = node.querySelector('.node-type');
    const techEl = node.querySelector('.node-tech');
    
    if (!labelEl) return;
    
    const label = labelEl.textContent.toLowerCase();
    const type = typeEl ? typeEl.textContent.toLowerCase() : '';
    const tech = techEl ? techEl.textContent.toLowerCase() : '';
    const nodeId = node.dataset.nodeId;
    const nodeData = currentData.nodes.find(n => n.id === nodeId);
    
    const matches = searchTerm === '' ||
                   label.includes(searchTerm) || 
                   type.includes(searchTerm) ||
                   tech.includes(searchTerm) ||
                   nodeId.toLowerCase().includes(searchTerm) ||
                   (nodeData?.description?.toLowerCase().includes(searchTerm)) ||
                   (nodeData?.technology?.toLowerCase().includes(searchTerm));
    
    if (matches) {
      node.style.opacity = '1';
      node.style.transform = searchTerm !== '' ? 'scale(1.1)' : 'scale(1)';
      node.style.filter = searchTerm !== '' ? 'brightness(1.3)' : 'brightness(1)';
      node.style.boxShadow = searchTerm !== '' ? '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.3)' : '';
      node.style.borderColor = searchTerm !== '' ? '#ffd700' : '';
      node.style.borderWidth = searchTerm !== '' ? '3px' : '';
      node.style.zIndex = searchTerm !== '' ? '100' : '10';
    } else {
      node.style.opacity = '0.2';
      node.style.transform = 'scale(0.9)';
      node.style.filter = 'brightness(0.5) grayscale(0.5)';
      node.style.boxShadow = '';
      node.style.borderColor = '';
      node.style.borderWidth = '';
      node.style.zIndex = '10';
    }
  });
}

// Filter Handler
function handleFilterChange(e) {
  const type = e.target.value;
  if (e.target.checked) {
    filteredTypes.delete(type);
  } else {
    filteredTypes.add(type);
  }
  
  if (currentData) {
    applyFilters();
  }
}

function applyFilters() {
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(node => {
    const nodeType = node.dataset.nodeType;
    if (filteredTypes.has(nodeType)) {
      node.style.display = 'none';
    } else {
      node.style.display = 'flex';
    }
  });
  
  // Update edges visibility
  if (currentData && currentData.edges) {
    const container = document.querySelector('.graph-container');
    const svg = container?.querySelector('svg');
    if (svg) {
      const nodePositions = {};
      document.querySelectorAll('.node').forEach(node => {
        if (node.style.display !== 'none') {
          nodePositions[node.dataset.nodeId] = {
            x: parseFloat(node.style.left),
            y: parseFloat(node.style.top),
            element: node
          };
        }
      });
      drawEdges(svg, nodePositions, currentData.edges, container);
    }
  }
}

// --- FIXED renderGraph ---
function renderGraph() {
  const input = document.getElementById('jsonInput').value.trim();
  const graphEl = document.getElementById('graph');
  
  if (!input) return showMessage('⚠️ Please enter JSON data');
  let data;
  try { data = JSON.parse(input); } catch (e) { return showMessage('❌ Invalid JSON'); }

  if (data.unsupported) return showMessage('⚠️ ' + (data.reason || 'Project not supported'));
  if (!data.nodes || !Array.isArray(data.nodes)) return showMessage('❌ Missing or invalid nodes array');

  currentData = data;
  selectedNode = null;
  closeDetailsPanel();
  graphEl.innerHTML = ''; // Clear everything
  
  // FORCE scrollbars to appear
  graphEl.style.overflow = 'scroll';

  // 1. CALCULATE POSITIONS (Content-First)
  // We calculate layout BEFORE creating DOM to know the exact size needed
  const layoutResult = calculateSmartLayout(data); 
  const positions = layoutResult.positions;

  // 2. DETERMINE EXACT SIZE IN PIXELS
  const allX = Object.values(positions).map(p => p.x);
  const allY = Object.values(positions).map(p => p.y);
  // Add 300px buffer to ensure right/bottom edges aren't cut
  const totalWidth = Math.max(...allX) + 300; 
  const totalHeight = Math.max(...allY) + 200;

  // 3. CREATE CANVAS WRAPPER (The Sized Surface)
  const canvas = document.createElement('div');
  canvas.className = 'canvas-wrapper';
  // FORCE EXACT PIXEL SIZE - This forces the parent (.graph-area) to scroll
  canvas.style.width = totalWidth + 'px';
  canvas.style.height = totalHeight + 'px';
  // RELATIVE POSITION is crucial so children (absolute) align to THIS, not the screen
  canvas.style.position = 'relative'; 
  
  graphEl.appendChild(canvas);

  // 4. CREATE SVG (Overlay)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = totalWidth + 'px'; // Match canvas wrapper exactly
  svg.style.height = totalHeight + 'px';
  svg.style.pointerEvents = 'none';
  canvas.appendChild(svg);

  // 5. RENDER NODES
  const connectedNodes = new Set();
  if (data.edges) data.edges.forEach(edge => { connectedNodes.add(edge.from); connectedNodes.add(edge.to); });
  
  data.nodes.forEach((node, i) => {
    const pos = positions[node.id];
    if (!pos) return;
    
    const el = document.createElement('div');
    el.className = `node ${node.type || ''}`;
    el.dataset.nodeId = node.id;
    el.dataset.nodeType = node.type || '';
    // ABSOLUTE positioning inside the RELATIVE canvas
    el.style.position = 'absolute';
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    el.style.opacity = '0';
    el.style.zIndex = '10';
    
    if (!connectedNodes.has(node.id)) {
      el.classList.add('isolated');
      el.title = 'Shared/Utility Component';
    }
    
    if (node.importance) el.classList.add(`importance-${node.importance}`);
    
    el.innerHTML = `
      <div class="node-header"><div class="node-label">${node.label || node.id}</div>
        ${node.importance === 'critical' ? '<span class="critical-badge">⚡</span>' : ''}
      </div>
      <div class="node-type">${node.type || ''}</div>
      ${node.technology ? `<div class="node-tech">${node.technology}</div>` : ''}
    `;

    // Dragging Logic
    makeDraggable(el, svg, positions, data.edges); 
    el.addEventListener('click', (e) => { e.stopPropagation(); showNodeDetails(node); });
    
    canvas.appendChild(el);
    positions[node.id].element = el;
    
    // Animation
    setTimeout(() => {
      el.style.opacity = '1';
      el.classList.add('node-entering');
    }, i * 50);
  });

  // 6. RENDER EDGES (Using offsetLeft/Top)
  drawEdges(svg, positions, data.edges);
  
  // Stats
  document.getElementById('stats').style.display = 'grid';
  document.getElementById('nodeCount').textContent = data.nodes.length;
  document.getElementById('edgeCount').textContent = (data.edges || []).length;
  
  if (data.project) {
    const projectInfo = document.getElementById('projectInfo');
    if (projectInfo) {
      projectInfo.innerHTML = `<strong>${data.project.name}</strong>`;
      projectInfo.style.display = 'block';
    }
  }
  
  showMessage(`✓ Graph rendered (${totalWidth}px x ${totalHeight}px)`, 'success');
}

// --- FIXED calculateSmartLayout ---
function calculateSmartLayout(data) {
  const positions = {};
  const NODE_WIDTH = 220; // Width + Gap
  const ROW_HEIGHT = 150; // Height + Gap
  const START_X = 50;     // Fixed Start
  const START_Y = 50;

  // Simple grouping by type
  const typeRowMap = { 'frontend': 0, 'backend': 1, 'service': 1, 'database': 2, 'infra': 3, 'external': 3 };
  const rows = {};

  data.nodes.forEach(node => {
    const r = typeRowMap[node.type] ?? 1;
    if (!rows[r]) rows[r] = [];
    rows[r].push(node);
  });

  // Place nodes in a strict grid (Left to Right)
  Object.keys(rows).forEach(rKey => {
    const rowIdx = parseInt(rKey);
    rows[rKey].forEach((node, colIdx) => {
      positions[node.id] = {
        x: START_X + (colIdx * NODE_WIDTH),
        y: START_Y + (rowIdx * ROW_HEIGHT)
      };
    });
  });
  return { positions };
}

function calculateLayeredLayout(data, width, height) {
  const positions = {};
  const layers = {
    presentation: [],
    business: [],
    data: [],
    infrastructure: []
  };
  
  // Group nodes by layer
  data.nodes.forEach(node => {
    const layer = node.layer || 'business';
    if (layers[layer]) {
      layers[layer].push(node);
    } else {
      layers.business.push(node);
    }
  });
  
  const layerOrder = ['presentation', 'business', 'data', 'infrastructure'];
  const nodeWidth = 200;
  const nodeHeight = 100;
  const verticalGap = 120;
  const horizontalGap = 60;
  let currentY = 80;
  
  layerOrder.forEach(layerName => {
    const layerNodes = layers[layerName];
    if (layerNodes.length === 0) return;
    
    // Calculate total width needed for this layer
    const totalWidth = layerNodes.length * nodeWidth + (layerNodes.length - 1) * horizontalGap;
    const startX = Math.max(50, (width - totalWidth) / 2);
    
    layerNodes.forEach((node, i) => {
      positions[node.id] = {
        x: startX + i * (nodeWidth + horizontalGap),
        y: currentY
      };
    });
    
    currentY += nodeHeight + verticalGap;
  });
  
  return positions;
}

function calculateHierarchicalLayout(data, width, height) {
  const positions = {};
  const levels = {};
  const visited = new Set();
  
  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set();
  if (data.edges) {
    data.edges.forEach(edge => hasIncoming.add(edge.to));
  }
  
  const roots = data.nodes.filter(node => !hasIncoming.has(node.id));
  if (roots.length === 0) {
    // If no clear roots, use first node
    roots.push(data.nodes[0]);
  }
  
  // BFS to assign levels
  function assignLevel(nodeId, level) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    if (!levels[level]) levels[level] = [];
    levels[level].push(nodeId);
    
    // Find children
    if (data.edges) {
      data.edges.forEach(edge => {
        if (edge.from === nodeId) {
          assignLevel(edge.to, level + 1);
        }
      });
    }
  }
  
  roots.forEach(node => assignLevel(node.id, 0));
  
  // Position unvisited nodes
  data.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const maxLevel = Object.keys(levels).length > 0 ? Math.max(...Object.keys(levels).map(Number)) : 0;
      if (!levels[maxLevel + 1]) levels[maxLevel + 1] = [];
      levels[maxLevel + 1].push(node.id);
      visited.add(node.id);
    }
  });
  
  // Calculate positions with proper spacing
  const nodeWidth = 200;
  const nodeHeight = 100;
  const verticalGap = 120;
  const horizontalGap = 60;
  
  Object.keys(levels).forEach(level => {
    const levelNodes = levels[level];
    const totalWidth = levelNodes.length * nodeWidth + (levelNodes.length - 1) * horizontalGap;
    const startX = Math.max(50, (width - totalWidth) / 2);
    const y = 80 + parseInt(level) * (nodeHeight + verticalGap);
    
    levelNodes.forEach((nodeId, i) => {
      positions[nodeId] = {
        x: startX + i * (nodeWidth + horizontalGap),
        y: y
      };
    });
  });
  
  return positions;
}

// Draw Groups
function drawGroups(container, groups, nodePositions) {
  groups.forEach(group => {
    const groupNodes = group.nodes.map(id => nodePositions[id]).filter(Boolean);
    if (groupNodes.length === 0) return;
    
    const padding = 30;
    const nodeWidth = 200;
    const nodeHeight = 100;
    
    const minX = Math.min(...groupNodes.map(n => n.x)) - padding;
    const maxX = Math.max(...groupNodes.map(n => n.x)) + nodeWidth + padding;
    const minY = Math.min(...groupNodes.map(n => n.y)) - padding;
    const maxY = Math.max(...groupNodes.map(n => n.y)) + nodeHeight + padding;
    
    const groupEl = document.createElement('div');
    groupEl.className = 'group-boundary';
    groupEl.style.left = minX + 'px';
    groupEl.style.top = minY + 'px';
    groupEl.style.width = (maxX - minX) + 'px';
    groupEl.style.height = (maxY - minY) + 'px';
    if (group.color) {
      groupEl.style.borderColor = group.color;
    }
    
    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = group.label;
    groupEl.appendChild(label);
    
    container.insertBefore(groupEl, container.firstChild);
  });
}

// --- 3. REPLACED drawEdges (The Coordinate Fix) ---
function drawEdges(svg, positions, edges) {
  // Clear old edges
  while (svg.lastChild) {
    if (svg.lastChild.tagName === 'defs') break; // Keep arrow definitions
    svg.removeChild(svg.lastChild);
  }
  // If defs are missing, re-add them (simplified for brevity)
  if (!svg.querySelector('defs')) addArrowMarkers(svg);

  if (!edges) return;

  edges.forEach(edge => {
    const p1 = positions[edge.from];
    const p2 = positions[edge.to];
    if (!p1 || !p2 || !p1.element || !p2.element) return;

    // MATH: Use offsetLeft/Top which is relative to the 'canvas-wrapper'
    // This ignores scroll position entirely.
    const x1 = p1.element.offsetLeft + (p1.element.offsetWidth / 2);
    const y1 = p1.element.offsetTop + (p1.element.offsetHeight / 2);
    const x2 = p2.element.offsetLeft + (p2.element.offsetWidth / 2);
    const y2 = p2.element.offsetTop + (p2.element.offsetHeight / 2);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} L ${x2} ${y2}`;
    
    line.setAttribute('d', d);
    line.setAttribute('class', 'edge-line');
    line.setAttribute('stroke', '#6366f1');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead-5)'); // Ensure you have marker defs
    svg.appendChild(line);
  });
}

// Helper: Add markers if missing
function addArrowMarkers(svg) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead-5');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3.5');
  marker.setAttribute('orient', 'auto');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', '0 0, 10 3.5, 0 7');
  poly.setAttribute('fill', '#6366f1');
  marker.appendChild(poly);
  defs.appendChild(marker);
  svg.prepend(defs);
}

// Helper: Simplified Drag
function handleDragStart(e, el, svg, positions, edges) {
  if (e.target.closest('.node-label')) return; // Allow text selection
  e.preventDefault();
  let startX = e.clientX;
  let startY = e.clientY;
  let startLeft = el.offsetLeft;
  let startTop = el.offsetTop;

  function onMove(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    el.style.left = `${startLeft + dx}px`;
    el.style.top = `${startTop + dy}px`;
    // Redraw edges live
    drawEdges(svg, positions, edges);
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// Show Node Details Panel
function showNodeDetails(node) {
  selectedNode = node;
  const panel = document.getElementById('detailsPanel');
  
  // Find connections
  const incoming = currentData.edges?.filter(e => e.to === node.id) || [];
  const outgoing = currentData.edges?.filter(e => e.from === node.id) || [];
  
  let html = `
    <div class="details-header">
      <h3>${node.label || node.id}</h3>
      <button id="closeDetailsBtn" class="close-details-btn">✕</button>
    </div>
    
    <div class="details-content">
      <div class="detail-section">
        <div class="detail-label">Type</div>
        <div class="detail-value"><span class="type-badge ${node.type}">${node.type || 'unknown'}</span></div>
      </div>
      
      ${node.description ? `
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">${node.description}</div>
        </div>
      ` : ''}
      
      ${node.technology ? `
        <div class="detail-section">
          <div class="detail-label">Technology</div>
          <div class="detail-value"><code>${node.technology}</code></div>
        </div>
      ` : ''}
      
      ${node.layer ? `
        <div class="detail-section">
          <div class="detail-label">Layer</div>
          <div class="detail-value">${node.layer}</div>
        </div>
      ` : ''}
      
      ${node.importance ? `
        <div class="detail-section">
          <div class="detail-label">Importance</div>
          <div class="detail-value"><span class="importance-badge ${node.importance}">${node.importance}</span></div>
        </div>
      ` : ''}
      
      ${node.status ? `
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value"><span class="status-badge ${node.status}">${node.status}</span></div>
        </div>
      ` : ''}
      
      ${node.team ? `
        <div class="detail-section">
          <div class="detail-label">Team</div>
          <div class="detail-value">${node.team}</div>
        </div>
      ` : ''}
      
      ${node.repository ? `
        <div class="detail-section">
          <div class="detail-label">Repository</div>
          <div class="detail-value"><a href="${node.repository}" target="_blank">${node.repository}</a></div>
        </div>
      ` : ''}
      
      ${incoming.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">Incoming Connections (${incoming.length})</div>
          <div class="connections-list">
            ${incoming.map(e => {
              const fromNode = currentData.nodes.find(n => n.id === e.from);
              return `
                <div class="connection-item">
                  <span class="connection-node">${fromNode?.label || e.from}</span>
                  <span class="connection-type">${e.type || 'connection'}</span>
                  ${e.description ? `<div class="connection-desc">${e.description}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${outgoing.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">Outgoing Connections (${outgoing.length})</div>
          <div class="connections-list">
            ${outgoing.map(e => {
              const toNode = currentData.nodes.find(n => n.id === e.to);
              return `
                <div class="connection-item">
                  <span class="connection-node">${toNode?.label || e.to}</span>
                  <span class="connection-type">${e.type || 'connection'}</span>
                  ${e.description ? `<div class="connection-desc">${e.description}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  panel.innerHTML = html;
  panel.classList.add('visible');
  
  // Re-attach close button listener
  document.getElementById('closeDetailsBtn').addEventListener('click', closeDetailsPanel);
}

function closeDetailsPanel() {
  const panel = document.getElementById('detailsPanel');
  panel.classList.remove('visible');
  selectedNode = null;
}

// Make Draggable
function makeDraggable(element, svg, nodePositions, edges) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.closest('.node-label') || e.target.closest('.node-tech')) {
      return; // Allow clicking for details
    }
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    isDragging = true;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    
    // Update position in nodePositions
    const nodeId = element.dataset.nodeId;
    if (nodePositions[nodeId]) {
      nodePositions[nodeId].x = element.offsetLeft;
      nodePositions[nodeId].y = element.offsetTop;
    }
    
    // Redraw edges while dragging
    if (edges && edges.length > 0) {
      const container = element.parentElement;
      drawEdges(svg, nodePositions, edges, container);
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    setTimeout(() => { isDragging = false; }, 100);
  }
}

// Export Graph
function exportGraph() {
  if (!currentData) {
    showMessage('⚠️ No graph to export. Render a graph first.');
    return;
  }
  
  const dataStr = JSON.stringify(currentData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'system-graph.json';
  link.click();
  URL.revokeObjectURL(url);
  
  showMessage('✓ Graph exported successfully', 'success');
}

// Load Example - Updated with enhanced data
function loadExample(type) {
  let example;
  
  switch(type) {
    case 'simple':
      example = {
        "project": { 
          "name": "Simple Web App",
          "type": "monolith"
        },
        "nodes": [
          { 
            "id": "frontend", 
            "label": "React Frontend", 
            "type": "frontend",
            "description": "Customer-facing web application",
            "technology": "React 18, TypeScript",
            "layer": "presentation",
            "importance": "critical"
          },
          { 
            "id": "backend", 
            "label": "Express API", 
            "type": "backend",
            "description": "Main REST API server",
            "technology": "Node.js, Express",
            "layer": "business",
            "importance": "critical"
          },
          { 
            "id": "database", 
            "label": "PostgreSQL", 
            "type": "database",
            "description": "Primary data store",
            "technology": "PostgreSQL 14",
            "layer": "data",
            "importance": "critical"
          }
        ],
        "edges": [
          { 
            "from": "frontend", 
            "to": "backend", 
            "type": "rest",
            "description": "API requests for data and operations",
            "protocol": "HTTPS",
            "weight": 10
          },
          { 
            "from": "backend", 
            "to": "database", 
            "type": "database",
            "description": "SQL queries for persistent data",
            "protocol": "PostgreSQL",
            "weight": 9
          }
        ],
        "groups": [
          {
            "id": "app-tier",
            "label": "Application Tier",
            "nodes": ["frontend", "backend"]
          }
        ]
      };
      break;
      
    case 'medium':
      example = {
        "project": { 
          "name": "E-commerce Platform",
          "type": "monolith"
        },
        "nodes": [
          { 
            "id": "frontend", 
            "label": "React Frontend", 
            "type": "frontend",
            "description": "Customer-facing web application",
            "technology": "React, Redux",
            "layer": "presentation",
            "importance": "critical"
          },
          { 
            "id": "backend", 
            "label": "Node.js API", 
            "type": "backend",
            "description": "Main application server",
            "technology": "Node.js, Express",
            "layer": "business",
            "importance": "critical"
          },
          { 
            "id": "database", 
            "label": "PostgreSQL", 
            "type": "database",
            "description": "Primary relational database",
            "technology": "PostgreSQL 14",
            "layer": "data",
            "importance": "critical"
          },
          { 
            "id": "cache", 
            "label": "Redis Cache", 
            "type": "cache",
            "description": "Session and data caching",
            "technology": "Redis 7",
            "layer": "data",
            "importance": "high"
          },
          { 
            "id": "payment-api", 
            "label": "Stripe API", 
            "type": "external",
            "description": "Payment processing",
            "technology": "Stripe",
            "importance": "critical"
          },
          { 
            "id": "nginx", 
            "label": "Nginx", 
            "type": "infra",
            "description": "Reverse proxy and load balancer",
            "technology": "Nginx",
            "layer": "infrastructure",
            "importance": "high"
          }
        ],
        "edges": [
          { 
            "from": "nginx", 
            "to": "frontend", 
            "type": "rest",
            "description": "Serves static files",
            "protocol": "HTTP",
            "weight": 8
          },
          { 
            "from": "frontend", 
            "to": "backend", 
            "type": "rest",
            "description": "API requests",
            "protocol": "HTTPS",
            "weight": 10
          },
          { 
            "from": "backend", 
            "to": "database", 
            "type": "database",
            "description": "Data queries",
            "protocol": "PostgreSQL",
            "weight": 9
          },
          { 
            "from": "backend", 
            "to": "cache", 
            "type": "cache",
            "description": "Cache operations",
            "protocol": "Redis",
            "weight": 7
          },
          { 
            "from": "backend", 
            "to": "payment-api", 
            "type": "rest",
            "description": "Payment processing",
            "protocol": "HTTPS",
            "weight": 8
          }
        ],
        "groups": [
          {
            "id": "frontend-tier",
            "label": "Frontend Tier",
            "nodes": ["nginx", "frontend"]
          },
          {
            "id": "backend-tier",
            "label": "Backend Tier",
            "nodes": ["backend"]
          },
          {
            "id": "data-tier",
            "label": "Data Tier",
            "nodes": ["database", "cache"]
          }
        ]
      };
      break;
      
    case 'complex':
      example = {
        "project": { 
          "name": "Microservices Platform",
          "type": "microservices"
        },
        "nodes": [
          { 
            "id": "web-app", 
            "label": "Web Application", 
            "type": "frontend",
            "description": "Customer web portal",
            "technology": "React, Next.js",
            "layer": "presentation",
            "importance": "critical",
            "team": "Frontend Team"
          },
          { 
            "id": "mobile-app", 
            "label": "Mobile App", 
            "type": "frontend",
            "description": "iOS and Android apps",
            "technology": "React Native",
            "layer": "presentation",
            "importance": "high",
            "team": "Mobile Team"
          },
          { 
            "id": "api-gateway", 
            "label": "API Gateway", 
            "type": "gateway",
            "description": "Central entry point",
            "technology": "Kong Gateway",
            "layer": "business",
            "importance": "critical",
            "team": "Platform Team"
          },
          { 
            "id": "auth-service", 
            "label": "Auth Service", 
            "type": "service",
            "description": "Authentication and authorization",
            "technology": "Node.js, JWT",
            "layer": "business",
            "importance": "critical",
            "team": "Security Team"
          },
          { 
            "id": "user-service", 
            "label": "User Service", 
            "type": "service",
            "description": "User management",
            "technology": "Java Spring Boot",
            "layer": "business",
            "importance": "critical",
            "team": "Core Team"
          },
          { 
            "id": "order-service", 
            "label": "Order Service", 
            "type": "service",
            "description": "Order processing",
            "technology": "Go",
            "layer": "business",
            "importance": "critical",
            "team": "Commerce Team"
          },
          { 
            "id": "notification-service", 
            "label": "Notification Service", 
            "type": "service",
            "description": "Email and SMS notifications",
            "technology": "Python, Celery",
            "layer": "business",
            "importance": "high",
            "team": "Platform Team"
          },
          { 
            "id": "postgres", 
            "label": "PostgreSQL", 
            "type": "database",
            "description": "Primary relational database",
            "technology": "PostgreSQL 15",
            "layer": "data",
            "importance": "critical"
          },
          { 
            "id": "mongodb", 
            "label": "MongoDB", 
            "type": "database",
            "description": "Document store",
            "technology": "MongoDB 6",
            "layer": "data",
            "importance": "high"
          },
          { 
            "id": "redis", 
            "label": "Redis", 
            "type": "cache",
            "description": "Distributed cache",
            "technology": "Redis Cluster",
            "layer": "data",
            "importance": "high"
          },
          { 
            "id": "rabbitmq", 
            "label": "RabbitMQ", 
            "type": "queue",
            "description": "Message broker",
            "technology": "RabbitMQ 3.12",
            "layer": "infrastructure",
            "importance": "high"
          },
          { 
            "id": "payment-gateway", 
            "label": "Stripe API", 
            "type": "external",
            "description": "Payment processing",
            "technology": "Stripe",
            "importance": "critical"
          }
        ],
        "edges": [
          { "from": "web-app", "to": "api-gateway", "type": "rest", "description": "Client requests", "protocol": "HTTPS", "weight": 10 },
          { "from": "mobile-app", "to": "api-gateway", "type": "rest", "description": "Mobile API calls", "protocol": "HTTPS", "weight": 9 },
          { "from": "api-gateway", "to": "auth-service", "type": "grpc", "description": "Authentication", "protocol": "gRPC", "weight": 9 },
          { "from": "api-gateway", "to": "user-service", "type": "grpc", "description": "User operations", "protocol": "gRPC", "weight": 8 },
          { "from": "api-gateway", "to": "order-service", "type": "grpc", "description": "Order operations", "protocol": "gRPC", "weight": 10 },
          { "from": "auth-service", "to": "postgres", "type": "database", "description": "User credentials", "protocol": "PostgreSQL", "weight": 8 },
          { "from": "auth-service", "to": "redis", "type": "cache", "description": "Session cache", "protocol": "Redis", "weight": 9 },
          { "from": "user-service", "to": "postgres", "type": "database", "description": "User data", "protocol": "PostgreSQL", "weight": 9 },
          { "from": "order-service", "to": "postgres", "type": "database", "description": "Order data", "protocol": "PostgreSQL", "weight": 10 },
          { "from": "order-service", "to": "payment-gateway", "type": "rest", "description": "Payment processing", "protocol": "HTTPS", "weight": 10 },
          { "from": "order-service", "to": "rabbitmq", "type": "queue", "description": "Order events", "protocol": "AMQP", "weight": 8 },
          { "from": "notification-service", "to": "rabbitmq", "type": "queue", "description": "Consume events", "protocol": "AMQP", "weight": 7 },
          { "from": "notification-service", "to": "mongodb", "type": "database", "description": "Notification logs", "protocol": "MongoDB", "weight": 5 }
        ],
        "groups": [
          { "id": "clients", "label": "Client Applications", "nodes": ["web-app", "mobile-app"] },
          { "id": "gateway", "label": "Gateway Layer", "nodes": ["api-gateway"] },
          { "id": "services", "label": "Microservices", "nodes": ["auth-service", "user-service", "order-service", "notification-service"] },
          { "id": "data", "label": "Data Layer", "nodes": ["postgres", "mongodb", "redis"] },
          { "id": "infra", "label": "Infrastructure", "nodes": ["rabbitmq"] }
        ]
      };
      break;
      
    default:
      example = {
        "project": { "name": "example-project" },
        "nodes": [
          { "id": "frontend", "label": "Frontend", "type": "frontend" },
          { "id": "backend", "label": "Backend API", "type": "backend" },
          { "id": "db", "label": "Database", "type": "database" }
        ],
        "edges": [
          { "from": "frontend", "to": "backend", "type": "rest" },
          { "from": "backend", "to": "db", "type": "database" }
        ]
      };
  }
  
  document.getElementById('jsonInput').value = JSON.stringify(example, null, 2);
  showMessage(`✓ ${type.charAt(0).toUpperCase() + type.slice(1)} example loaded! Click "Render Graph" to visualize`, 'success');
}

// Initialize on page load
window.addEventListener('load', init);

// Close details panel when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('detailsPanel');
  if (panel && panel.classList.contains('visible') && !panel.contains(e.target) && !e.target.closest('.node')) {
    closeDetailsPanel();
  }
});

// Simple Export Image Function
async function openExportModal() {
  if (!currentData) {
    showMessage('⚠️ No graph to export. Render a graph first.');
    return;
  }
  
  const graphArea = document.querySelector('.canvas-wrapper');
  if (!graphArea) {
    showMessage('⚠️ No graph to export');
    return;
  }
  
  // Check if the canvas has valid dimensions
  const rect = graphArea.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    showMessage('⚠️ Graph has invalid dimensions. Please render the graph first.', 'error');
    return;
  }
  
  let originalBg = '';
  let originalBgSize = '';
  let svgElements = [];
  
  try {
    showMessage('📸 Generating image...', 'success');
    
    // Completely remove ALL background styling to avoid canvas errors
    originalBg = graphArea.style.backgroundImage;
    originalBgSize = graphArea.style.backgroundSize;
    graphArea.style.backgroundImage = 'none';
    graphArea.style.backgroundSize = 'auto';
    graphArea.style.background = '#0a0e1a'; // Solid color only
    
    // Temporarily hide SVG elements (edges) to avoid canvas errors
    svgElements = Array.from(graphArea.querySelectorAll('svg'));
    svgElements.forEach(svg => {
      svg.style.display = 'none';
    });
    
    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(graphArea, {
      scale: 2,
      backgroundColor: '#0a0e1a',
      logging: false,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.tagName === 'svg' || 
               element.tagName === 'CANVAS' ||
               element.classList.contains('empty-state') ||
               (element.offsetWidth === 0 && element.offsetHeight === 0);
      }
    });
    
    // Restore background and SVG elements
    graphArea.style.backgroundImage = originalBg;
    graphArea.style.backgroundSize = originalBgSize;
    graphArea.style.background = '';
    svgElements.forEach(svg => {
      svg.style.display = '';
    });
    
    const link = document.createElement('a');
    link.download = 'graph-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showMessage('✓ Image exported! (Note: edges are not included in export)', 'success');
    
  } catch (error) {
    console.error('Export error:', error);
    // Restore background and SVG elements even on error
    if (originalBg) {
      graphArea.style.backgroundImage = originalBg;
      graphArea.style.backgroundSize = originalBgSize;
      graphArea.style.background = '';
    }
    svgElements.forEach(svg => {
      svg.style.display = '';
    });
    showMessage('❌ Export failed: ' + error.message, 'error');
  }
}

function closeExportModal() {
  // Not needed anymore
}

function exportAsPNG() {
  // Not needed anymore
}

function exportAsSVG() {
  // Not needed anymore
}

// NEW: Canvas-based PNG Export (bypasses html2canvas issues)
function exportGraphAsPNG() {
  if (!currentData) {
    showMessage('⚠️ No graph to export. Render a graph first.');
    return;
  }
  
  const canvasWrapper = document.querySelector('.canvas-wrapper');
  if (!canvasWrapper) {
    showMessage('⚠️ No graph to export');
    return;
  }
  
  try {
    showMessage('📸 Generating PNG...', 'success');
    
    // Get all nodes
    const nodes = document.querySelectorAll('.node');
    if (nodes.length === 0) {
      showMessage('⚠️ No nodes to export');
      return;
    }
    
    // Calculate canvas dimensions
    const wrapperWidth = parseInt(canvasWrapper.style.width);
    const wrapperHeight = parseInt(canvasWrapper.style.height);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const scale = 2; // High quality
    canvas.width = wrapperWidth * scale;
    canvas.height = wrapperHeight * scale;
    const ctx = canvas.getContext('2d');
    
    // Scale for high quality
    ctx.scale(scale, scale);
    
    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, wrapperWidth, wrapperHeight);
    
    // Draw grid pattern
    ctx.strokeStyle = 'rgba(58, 63, 80, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < wrapperWidth; x += 20) {
      for (let y = 0; y < wrapperHeight; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw edges first (so they appear behind nodes)
    const svg = canvasWrapper.querySelector('svg');
    if (svg && currentData.edges) {
      currentData.edges.forEach(edge => {
        const fromNode = Array.from(nodes).find(n => n.dataset.nodeId === edge.from);
        const toNode = Array.from(nodes).find(n => n.dataset.nodeId === edge.to);
        
        if (fromNode && toNode) {
          const x1 = fromNode.offsetLeft + fromNode.offsetWidth / 2;
          const y1 = fromNode.offsetTop + fromNode.offsetHeight / 2;
          const x2 = toNode.offsetLeft + toNode.offsetWidth / 2;
          const y2 = toNode.offsetTop + toNode.offsetHeight / 2;
          
          // Draw line
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw arrowhead
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const arrowSize = 10;
          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - arrowSize * Math.cos(angle - Math.PI / 6),
            y2 - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            x2 - arrowSize * Math.cos(angle + Math.PI / 6),
            y2 - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        }
      });
    }
    
    // Draw nodes
    nodes.forEach(node => {
      const x = node.offsetLeft;
      const y = node.offsetTop;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      
      // Get node type for color
      const nodeType = node.dataset.nodeType || '';
      const typeColors = {
        'frontend': '#22c55e',
        'backend': '#6366f1',
        'database': '#f97316',
        'cache': '#14b8a6',
        'queue': '#f59e0b',
        'gateway': '#a855f7',
        'service': '#3b82f6',
        'external': '#ec4899',
        'infra': '#eab308'
      };
      const borderColor = typeColors[nodeType] || '#6366f1';
      
      // Draw node background
      ctx.fillStyle = 'rgba(30, 41, 66, 0.95)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, width, height, 12);
      ctx.fill();
      ctx.stroke();
      
      // Draw node label
      const label = node.querySelector('.node-label')?.textContent || '';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(label, x + 16, y + 28);
      
      // Draw node type
      const type = node.querySelector('.node-type')?.textContent || '';
      if (type) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillText(type.toUpperCase(), x + 16, y + 46);
      }
      
      // Draw technology
      const tech = node.querySelector('.node-tech')?.textContent || '';
      if (tech) {
        ctx.fillStyle = 'rgba(168, 179, 207, 0.8)';
        ctx.font = '10px Monaco, monospace';
        ctx.fillText(tech, x + 16, y + 62);
      }
    });
    
    // Download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'system-graph.png';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showMessage('✓ PNG exported successfully!', 'success');
    });
    
  } catch (error) {
    console.error('Export error:', error);
    showMessage('❌ Export failed: ' + error.message, 'error');
  }
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ===== SMART PROMPT TEMPLATES =====

const promptTemplates = {
  general: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "general" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | queue | cache | dependency",
      "description": "What this connection represents"
    }
  ]
}

GENERAL ARCHITECTURE ANALYSIS GUIDELINES:
✨ Use this template when you're not sure which specific architecture type fits your project, or when your project combines multiple patterns.

WHAT TO INCLUDE:
- All major components in your system (frontend, backend, databases, services, etc.)
- How components communicate with each other (APIs, data flows, dependencies)
- External services and integrations (payment gateways, email services, cloud providers)
- Infrastructure components (load balancers, caches, message queues)
- Technology stack for each component
- Mark critical components with importance levels

ANALYSIS APPROACH:
1. Start with user-facing components (web apps, mobile apps, APIs)
2. Map backend services and their responsibilities
3. Identify data storage solutions (databases, caches, file storage)
4. Show how data flows through the system
5. Include external dependencies and third-party services
6. Mark components by importance (critical, high, medium, low)

TIPS:
- Use clear, descriptive labels for each component
- Include technology details to understand the stack
- Show both synchronous (API calls) and asynchronous (queues) connections
- Group related components logically
- Don't worry about perfect categorization - focus on clarity

Generate a complete JSON structure based on the project description I provide.`,

  fullstack: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | queue | cache",
      "description": "What this connection represents"
    }
  ]
}

FULL-STACK ANALYSIS GUIDELINES:
- Identify ALL layers: Frontend, Backend, Database, Cache, External Services
- Show complete data flow from UI to database
- Include authentication/authorization components
- Map API endpoints and their connections
- Identify shared utilities and libraries
- Mark critical path components with importance: "critical"
- Include technology stack for each component
- Show both synchronous (API) and asynchronous (queue) connections

Generate a complete JSON structure based on the project description I provide.`,

  microservices: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "microservices" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low",
      "team": "Owning team name"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | queue | cache | grpc",
      "description": "What this connection represents",
      "protocol": "HTTP | gRPC | AMQP | etc"
    }
  ]
}

MICROSERVICES ANALYSIS GUIDELINES:
- Identify API Gateway as the entry point
- Map each microservice with its specific responsibility
- Show service-to-service communication (REST, gRPC, message queues)
- Include shared infrastructure (databases, caches, message brokers)
- Identify service boundaries and ownership (team field)
- Mark critical services that affect multiple domains
- Show external service dependencies (payment, email, etc.)
- Include service mesh or load balancers if present
- Map data stores per service (database per service pattern)

Generate a complete JSON structure based on the project description I provide.`,

  monolithic: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "monolith" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "layer": "presentation | business | data | infrastructure",
      "importance": "critical | high | medium | low"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | internal",
      "description": "What this connection represents"
    }
  ]
}

MONOLITHIC APPLICATION GUIDELINES:
- Focus on logical layers within the monolith
- Identify major modules/packages and their responsibilities
- Show internal module dependencies
- Map external integrations (databases, caches, external APIs)
- Include infrastructure components (web server, reverse proxy)
- Highlight tightly coupled vs loosely coupled modules
- Show data access patterns
- Identify potential bottlenecks or single points of failure
- Mark modules that could be extracted as microservices

Generate a complete JSON structure based on the project description I provide.`,

  frontend: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "frontend-heavy" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used (React/Vue/Angular components)",
      "importance": "critical | high | medium | low"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | state",
      "description": "What this connection represents"
    }
  ]
}

FRONTEND-HEAVY ANALYSIS GUIDELINES:
- Map major UI components and their hierarchy
- Identify state management (Redux, Context, Zustand, etc.)
- Show component-to-component communication
- Map API integration points and data fetching
- Include routing structure
- Identify shared components and utilities
- Show external dependencies (CDNs, analytics, auth providers)
- Map build tools and bundlers
- Include static assets and their sources
- Show client-side caching strategies
- Identify performance-critical components

Generate a complete JSON structure based on the project description I provide.`,

  backend: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "backend-api" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | queue | cache",
      "description": "What this connection represents",
      "protocol": "HTTP | gRPC | WebSocket | etc"
    }
  ]
}

BACKEND API ANALYSIS GUIDELINES:
- Map all API endpoints and their groupings (REST resources)
- Identify middleware layers (auth, logging, rate limiting)
- Show database connections and query patterns
- Include caching strategies (Redis, Memcached)
- Map message queues and async processing
- Identify external API integrations
- Show authentication/authorization flow
- Include background jobs and schedulers
- Map data validation and transformation layers
- Identify API versioning strategy
- Show load balancing and scaling components
- Mark rate-limited or throttled endpoints

Generate a complete JSON structure based on the project description I provide.`,

  eventdriven: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "event-driven" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low",
      "eventType": "producer | consumer | both"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "event | command | query | data",
      "description": "What this connection represents",
      "eventName": "Name of the event"
    }
  ]
}

EVENT-DRIVEN ARCHITECTURE GUIDELINES:
- Identify event producers (services that emit events)
- Map event consumers (services that react to events)
- Show event brokers/buses (Kafka, RabbitMQ, EventBridge, etc.)
- Include event schemas and their purposes
- Map event flows through the system
- Identify synchronous vs asynchronous patterns
- Show command vs event patterns (CQRS if applicable)
- Include event stores or event sourcing components
- Map saga patterns for distributed transactions
- Show dead letter queues and error handling
- Identify event replay capabilities
- Mark critical event flows with importance
- Include monitoring and observability components
- Show event versioning strategies

Generate a complete JSON structure based on the project description I provide.`,

  serverless: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "serverless" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used (Lambda, Cloud Functions, etc.)",
      "importance": "critical | high | medium | low",
      "trigger": "http | schedule | event | stream"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | event | trigger | data",
      "description": "What this connection represents"
    }
  ]
}

SERVERLESS ARCHITECTURE GUIDELINES:
- Map all serverless functions and their triggers
- Identify API Gateway endpoints
- Show event sources (S3, DynamoDB Streams, EventBridge, etc.)
- Include managed services (DynamoDB, S3, SQS, SNS, etc.)
- Map function-to-function invocations
- Show authentication layers (Cognito, Auth0, etc.)
- Include CDN and static hosting (CloudFront, S3)
- Map scheduled functions (cron jobs)
- Identify cold start critical paths
- Show IAM roles and permissions boundaries
- Include monitoring and logging (CloudWatch, X-Ray)
- Map data flows between services
- Identify cost-critical components
- Show scaling patterns and limits
- Include third-party integrations

Generate a complete JSON structure based on the project description I provide.`,

  monorepo: `Create a system architecture JSON for visualization with this structure:

{
  "project": { "name": "Your Project Name", "type": "monorepo-nx" },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "frontend | backend | database | cache | queue | gateway | service | external | infra",
      "description": "What this component does",
      "technology": "Tech stack used",
      "importance": "critical | high | medium | low",
      "workspace": "apps | libs | tools",
      "scope": "@org/package-name"
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "api | data | dependency | shared",
      "description": "What this connection represents"
    }
  ]
}

MONOREPO-NX ANALYSIS GUIDELINES:
- Map all apps in the workspace (frontend apps, backend services, etc.)
- Identify shared libraries and their purposes
- Show inter-package dependencies (which apps use which libs)
- Include build tools and configuration packages
- Map shared UI component libraries
- Identify shared utilities and helper libraries
- Show data access layers and API clients
- Include testing utilities and shared test configurations
- Map deployment targets for each app
- Identify workspace structure (apps/, libs/, tools/)
- Show dependency graph between packages
- Mark buildable vs non-buildable libraries
- Include NX plugins and generators used
- Show affected project relationships
- Identify shared types/interfaces packages

Generate a complete JSON structure based on the project description I provide.`
};

// Template Selection Function
function selectTemplate(templateName) {
  // Update active button
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.template-btn').classList.add('active');
  
  // Update prompt text
  const promptText = promptTemplates[templateName];
  document.getElementById('copyText').textContent = promptText;
  
  // Show feedback
  const templateNames = {
    general: 'General',
    fullstack: 'Full-Stack',
    microservices: 'Microservices',
    monolithic: 'Monolithic',
    frontend: 'Frontend-Heavy',
    backend: 'Backend API',
    eventdriven: 'Event-Driven',
    serverless: 'Serverless',
    monorepo: 'Monorepo-NX'
  };
  
  showMessage(`✓ ${templateNames[templateName]} template selected!`, 'success');
}
