/**
 * Vector Distance & Similarity Sandbox
 * Core Mathematics and Client-Side UI Logic
 */

// ==========================================
// 1. Core Mathematics Logic (Separated)
// ==========================================

/**
 * Calculates the dot product of two 2D vectors.
 * Formula: A . B = Ax * Bx + Ay * By
 */
function calculateDotProduct(vA, vB) {
    return vA.x * vB.x + vA.y * vB.y;
}

/**
 * Calculates the magnitude (length) of a 2D vector.
 * Formula: ||v|| = sqrt(vx^2 + vy^2)
 */
function calculateMagnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Calculates the Euclidean distance between two 2D vectors.
 * Formula: d = sqrt((Ax - Bx)^2 + (Ay - By)^2)
 */
function calculateEuclideanDistance(vA, vB) {
    const dx = vA.x - vB.x;
    const dy = vA.y - vB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the cosine similarity of two 2D vectors.
 * Formula: cos(θ) = (A . B) / (||A|| * ||B||)
 * Returns null if one or both vectors have zero magnitude.
 */
function calculateCosineSimilarity(vA, vB) {
    const magA = calculateMagnitude(vA);
    const magB = calculateMagnitude(vB);
    
    // Safety check for zero-vector magnitude to prevent divide by zero
    if (magA === 0 || magB === 0) {
        return null;
    }
    return calculateDotProduct(vA, vB) / (magA * magB);
}


// ==========================================
// 2. UI and Interaction Logic
// ==========================================

// Global state
let vectorA = { x: 4.0, y: 3.0 };
let vectorB = { x: 2.0, y: -3.0 };
let activeDragHandle = null;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initSVGGrid();
    initShareFunctionality();
    setupEventListeners();
    updateSandbox();
    initSemanticSimilarity(); // Initialize Semantic Similarity Tool
});

// Create SVG background coordinate grid and labels dynamically
function initSVGGrid() {
    const gridLinesGroup = document.getElementById('svg-grid-lines');
    const gridLabelsGroup = document.getElementById('svg-grid-labels');
    
    if (!gridLinesGroup || !gridLabelsGroup) return;

    // Draw grid lines from -10 to 10
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue; // Skip main axes lines (already defined in HTML)

        // Vertical lines
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', i);
        vLine.setAttribute('y1', -12);
        vLine.setAttribute('x2', i);
        vLine.setAttribute('y2', 12);
        vLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.03)');
        vLine.setAttribute('stroke-width', '0.04');
        gridLinesGroup.appendChild(vLine);

        // Horizontal lines
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', -12);
        hLine.setAttribute('y1', i);
        hLine.setAttribute('x2', 12);
        hLine.setAttribute('y2', i);
        hLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.03)');
        hLine.setAttribute('stroke-width', '0.04');
        gridLinesGroup.appendChild(hLine);
    }

    // Add coordinate labels for reference ticks
    const tickValues = [-10, -5, 5, 10];
    tickValues.forEach(val => {
        // X axis labels
        const xText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xText.setAttribute('x', val);
        xText.setAttribute('y', 0.8);
        xText.setAttribute('text-anchor', 'middle');
        xText.textContent = val;
        gridLabelsGroup.appendChild(xText);

        // Y axis labels (Cartesian Y values are inverted in SVG viewBox)
        const yText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yText.setAttribute('x', 0.5);
        yText.setAttribute('y', -val + 0.2); // invert coordinates to match Cartesian orientation
        yText.setAttribute('text-anchor', 'start');
        yText.textContent = val;
        gridLabelsGroup.appendChild(yText);
    });
}

// Update the full Sandbox: metrics calculations, labels, sliders, and SVG rendering
function updateSandbox() {
    // 1. Perform core calculations using decoupled logic
    const dotProduct = calculateDotProduct(vectorA, vectorB);
    const euclideanDist = calculateEuclideanDistance(vectorA, vectorB);
    const cosineSim = calculateCosineSimilarity(vectorA, vectorB);
    const magA = calculateMagnitude(vectorA);
    const magB = calculateMagnitude(vectorB);

    // 2. Update Metrics UI values
    document.getElementById('val-dot').textContent = dotProduct.toFixed(2);
    document.getElementById('val-euclidean').textContent = euclideanDist.toFixed(2);
    
    // Scale visual indicator bars
    const eucBarPercentage = Math.max(0, Math.min(100, (euclideanDist / 20) * 100));
    document.getElementById('bar-euclidean').style.width = `${eucBarPercentage}%`;

    const warningEl = document.getElementById('zero-vector-warning');
    const cosineValEl = document.getElementById('val-cosine');
    const cosineBarEl = document.getElementById('bar-cosine');

    if (cosineSim === null) {
        // Safe display for zero magnitude vector
        cosineValEl.textContent = 'N/A';
        cosineBarEl.style.width = '0%';
        warningEl.style.display = 'block';
    } else {
        cosineValEl.textContent = cosineSim.toFixed(3);
        const cosBarPercentage = Math.max(0, Math.min(100, ((cosineSim + 1) / 2) * 100));
        cosineBarEl.style.width = `${cosBarPercentage}%`;
        warningEl.style.display = 'none';
    }

    // Update dynamic metric interpretations
    updateInterpretation(cosineSim, dotProduct, euclideanDist);

    // 3. Update Coordinates Display
    document.getElementById('display-coords-a').textContent = `(${vectorA.x.toFixed(1)}, ${vectorA.y.toFixed(1)})`;
    document.getElementById('display-coords-b').textContent = `(${vectorB.x.toFixed(1)}, ${vectorB.y.toFixed(1)})`;

    // 4. Synchronize Sliders UI values
    document.getElementById('slider-ax').value = vectorA.x;
    document.getElementById('slider-ay').value = vectorA.y;
    document.getElementById('slider-bx').value = vectorB.x;
    document.getElementById('slider-by').value = vectorB.y;

    document.getElementById('val-slider-ax').textContent = vectorA.x.toFixed(1);
    document.getElementById('val-slider-ay').textContent = vectorA.y.toFixed(1);
    document.getElementById('val-slider-bx').textContent = vectorB.x.toFixed(1);
    document.getElementById('val-slider-by').textContent = vectorB.y.toFixed(1);

    // 5. Update SVG Canvas rendering (Note: Cartesian y goes up, SVG y goes down)
    document.getElementById('svg-vector-a').setAttribute('x2', vectorA.x);
    document.getElementById('svg-vector-a').setAttribute('y2', -vectorA.y);
    
    document.getElementById('svg-vector-b').setAttribute('x2', vectorB.x);
    document.getElementById('svg-vector-b').setAttribute('y2', -vectorB.y);

    document.getElementById('svg-handle-a').setAttribute('cx', vectorA.x);
    document.getElementById('svg-handle-a').setAttribute('cy', -vectorA.y);

    document.getElementById('svg-handle-b').setAttribute('cx', vectorB.x);
    document.getElementById('svg-handle-b').setAttribute('cy', -vectorB.y);

    document.getElementById('svg-connection-line').setAttribute('x1', vectorA.x);
    document.getElementById('svg-connection-line').setAttribute('y1', -vectorA.y);
    document.getElementById('svg-connection-line').setAttribute('x2', vectorB.x);
    document.getElementById('svg-connection-line').setAttribute('y2', -vectorB.y);

    // Dynamic placement of text labels so they don't overlap the handle nodes
    const labelA = document.getElementById('svg-label-a');
    labelA.setAttribute('x', vectorA.x + 0.6);
    labelA.setAttribute('y', -vectorA.y - 0.6);
    labelA.textContent = `A (${vectorA.x.toFixed(1)}, ${vectorA.y.toFixed(1)})`;

    const labelB = document.getElementById('svg-label-b');
    labelB.setAttribute('x', vectorB.x + 0.6);
    labelB.setAttribute('y', -vectorB.y + 0.9);
    labelB.textContent = `B (${vectorB.x.toFixed(1)}, ${vectorB.y.toFixed(1)})`;
}

// Function to update interpretation badges
function updateInterpretation(cosine, dot, euclidean) {
    const badgeCosine = document.getElementById('badge-cosine');
    const descCosine = document.getElementById('desc-cosine');
    const badgeDot = document.getElementById('badge-dot');
    const descDot = document.getElementById('desc-dot');
    const badgeEuc = document.getElementById('badge-euclidean');
    const descEuc = document.getElementById('desc-euclidean');

    // 1. Cosine Similarity Interpretation
    badgeCosine.className = 'interpretation-badge';
    if (cosine === null) {
        badgeCosine.textContent = 'Undefined';
        badgeCosine.classList.add('status-undefined');
        descCosine.textContent = 'Cosine similarity is undefined for a zero vector (magnitude = 0).';
    } else {
        if (cosine > 0.9) {
            badgeCosine.textContent = 'Similar';
            badgeCosine.classList.add('status-similar');
            descCosine.textContent = 'Highly similar direction (close to 1.0).';
        } else if (cosine > 0.3) {
            badgeCosine.textContent = 'Weak Similar';
            badgeCosine.classList.add('status-similar-weak');
            descCosine.textContent = 'Moderately similar direction.';
        } else if (cosine >= -0.3) {
            badgeCosine.textContent = 'Orthogonal';
            badgeCosine.classList.add('status-orthogonal');
            descCosine.textContent = 'Perpendicular or unrelated direction (around 0.0).';
        } else if (cosine >= -0.9) {
            badgeCosine.textContent = 'Weak Opposite';
            badgeCosine.classList.add('status-opposite-weak');
            descCosine.textContent = 'Moderately opposite direction.';
        } else {
            badgeCosine.textContent = 'Opposite';
            badgeCosine.classList.add('status-opposite');
            descCosine.textContent = 'Opposing direction (close to -1.0).';
        }
    }

    // 2. Dot Product Interpretation
    badgeDot.className = 'interpretation-badge';
    if (dot > 0.1) {
        badgeDot.textContent = 'Positive';
        badgeDot.classList.add('status-similar');
        descDot.textContent = 'Positive: aligned in similar general direction.';
    } else if (dot < -0.1) {
        badgeDot.textContent = 'Negative';
        badgeDot.classList.add('status-opposite');
        descDot.textContent = 'Negative: opposing general direction.';
    } else {
        badgeDot.textContent = 'Zero';
        badgeDot.classList.add('status-orthogonal');
        descDot.textContent = 'Zero: perpendicular, no general alignment.';
    }

    // 3. Euclidean Distance Interpretation
    badgeEuc.className = 'interpretation-badge';
    if (euclidean < 3.5) {
        badgeEuc.textContent = 'Close';
        badgeEuc.classList.add('status-similar');
        descEuc.textContent = 'Close range: vector tips are very close.';
    } else if (euclidean < 8.5) {
        badgeEuc.textContent = 'Moderate';
        badgeEuc.classList.add('status-neutral');
        descEuc.textContent = 'Moderate range: vector tips have standard spacing.';
    } else {
        badgeEuc.textContent = 'Far';
        badgeEuc.classList.add('status-opposite');
        descEuc.textContent = 'Far range: vector tips are far apart.';
    }
}

// Convert screen mouse/touch coordinates to local SVG viewBox coordinates
function getLocalSVGCoords(clientX, clientY, svgElement) {
    const rect = svgElement.getBoundingClientRect();
    // Maps bounding client size into the -12 to 12 range matching our viewBox layout
    const x = ((clientX - rect.left) / rect.width) * 24 - 12;
    const y = ((clientY - rect.top) / rect.height) * 24 - 12;
    
    // Invert y axis back to standard Cartesian system where positive y goes upwards
    return {
        x: Math.max(-10, Math.min(10, Math.round(x * 10) / 10)),
        y: Math.max(-10, Math.min(10, Math.round(-y * 10) / 10))
    };
}

// Set up UI controls & interactive event listeners
function setupEventListeners() {
    // 1. Connect input slider changes
    const inputs = ['ax', 'ay', 'bx', 'by'];
    inputs.forEach(id => {
        const slider = document.getElementById(`slider-${id}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                clearPresetSelection();
                if (id === 'ax') vectorA.x = val;
                if (id === 'ay') vectorA.y = val;
                if (id === 'bx') vectorB.x = val;
                if (id === 'by') vectorB.y = val;
                updateSandbox();
            });
        }
    });

    // 2. Configure Interactive SVG Handle dragging (Desktop & Mobile support)
    const svgEl = document.getElementById('vector-svg');
    const handleA = document.getElementById('svg-handle-a');
    const handleB = document.getElementById('svg-handle-b');

    const startDrag = (handleId) => {
        activeDragHandle = handleId;
        document.body.style.cursor = 'grabbing';
    };

    const stopDrag = () => {
        activeDragHandle = null;
        document.body.style.cursor = 'default';
    };

    const performDrag = (clientX, clientY) => {
        if (!activeDragHandle) return;
        clearPresetSelection();
        const coords = getLocalSVGCoords(clientX, clientY, svgEl);

        if (activeDragHandle === 'A') {
            vectorA.x = coords.x;
            vectorA.y = coords.y;
        } else if (activeDragHandle === 'B') {
            vectorB.x = coords.x;
            vectorB.y = coords.y;
        }
        updateSandbox();
    };

    // Mouse handlers
    handleA.addEventListener('mousedown', () => startDrag('A'));
    handleB.addEventListener('mousedown', () => startDrag('B'));
    
    window.addEventListener('mousemove', (e) => {
        if (activeDragHandle) {
            e.preventDefault();
            performDrag(e.clientX, e.clientY);
        }
    });
    
    window.addEventListener('mouseup', stopDrag);

    // Touch handlers (Mobile support)
    handleA.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag('A');
    }, { passive: false });
    
    handleB.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag('B');
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (activeDragHandle && e.touches.length > 0) {
            performDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', stopDrag);
}

// Applies a preset scenario to the vectors A and B
function applyPreset(presetType) {
    // Remove active state from all presets first
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    
    const btn = document.getElementById(`preset-${presetType}`);
    if (btn) btn.classList.add('active');

    switch (presetType) {
        case 'similar':
            vectorA = { x: 4.0, y: 3.0 };
            vectorB = { x: 8.0, y: 6.0 };
            break;
        case 'opposite':
            vectorA = { x: 4.0, y: 3.0 };
            vectorB = { x: -4.0, y: -3.0 };
            break;
        case 'perpendicular':
            vectorA = { x: 5.0, y: 0.0 };
            vectorB = { x: 0.0, y: 5.0 };
            break;
        case 'close':
            vectorA = { x: 3.0, y: 4.0 };
            vectorB = { x: 4.0, y: 4.0 };
            break;
        case 'far':
            vectorA = { x: -8.0, y: -6.0 };
            vectorB = { x: 8.0, y: 6.0 };
            break;
        case 'zero':
            vectorA = { x: 0.0, y: 0.0 };
            vectorB = { x: 4.0, y: 3.0 };
            break;
    }
    updateSandbox();
}

// Clears the selected state from all preset buttons
function clearPresetSelection() {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
}

// Randomizes vector components to random integer values between -10 and 10
function randomizeVectors() {
    clearPresetSelection();
    vectorA.x = Math.floor(Math.random() * 21) - 10;
    vectorA.y = Math.floor(Math.random() * 21) - 10;
    vectorB.x = Math.floor(Math.random() * 21) - 10;
    vectorB.y = Math.floor(Math.random() * 21) - 10;
    updateSandbox();
}

// Reset vectors back to default state
function resetVectors() {
    clearPresetSelection();
    vectorA = { x: 4.0, y: 3.0 };
    vectorB = { x: 2.0, y: -3.0 };
    updateSandbox();
}

// Copy Metrics Results to Clipboard
async function copyResults() {
    const dot = calculateDotProduct(vectorA, vectorB).toFixed(2);
    const euc = calculateEuclideanDistance(vectorA, vectorB).toFixed(2);
    const cos = calculateCosineSimilarity(vectorA, vectorB);
    const cosStr = cos !== null ? cos.toFixed(3) : 'Undefined (Zero Vector)';

    const content = `Vector Distance & Similarity Sandbox Metrics
--------------------------------------------------
Vector A: [${vectorA.x.toFixed(1)}, ${vectorA.y.toFixed(1)}]
Vector B: [${vectorB.x.toFixed(1)}, ${vectorB.y.toFixed(1)}]

Similarity & Distance Metrics:
- Cosine Similarity: ${cosStr}
- Dot Product: ${dot}
- Euclidean Distance: ${euc}

Computed client-side at LiDa Software Developer Hub.`;

    try {
        await navigator.clipboard.writeText(content);
        showBtnFeedback('btn-copy-results', 'Copied Metrics!');
    } catch (err) {
        console.error('Clipboard copy failed:', err);
    }
}

// Copy Vector Values & Metrics as JSON to Clipboard
async function copyJSON() {
    const dot = calculateDotProduct(vectorA, vectorB);
    const euc = calculateEuclideanDistance(vectorA, vectorB);
    const cos = calculateCosineSimilarity(vectorA, vectorB);

    const dataObj = {
        vectorA: { x: vectorA.x, y: vectorA.y, magnitude: calculateMagnitude(vectorA) },
        vectorB: { x: vectorB.x, y: vectorB.y, magnitude: calculateMagnitude(vectorB) },
        metrics: {
            cosineSimilarity: cos,
            dotProduct: dot,
            euclideanDistance: euc
        },
        timestamp: new Date().toISOString()
    };

    try {
        await navigator.clipboard.writeText(JSON.stringify(dataObj, null, 2));
        showBtnFeedback('btn-copy-json', 'Copied JSON!');
    } catch (err) {
        console.error('Clipboard copy failed:', err);
    }
}

// Utility to display copy success feedback in UI buttons
function showBtnFeedback(buttonId, text) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.15rem;">done</span> ${text}`;
    btn.style.borderColor = 'var(--success)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderColor = '';
    }, 2000);
}

// Share Functionality (Social widgets & mobile native share sheet)
function initShareFunctionality() {
    const shareButton = document.getElementById('share-tool-button');
    const desktopShareButtons = document.getElementById('desktop-share-buttons');
    const shareUrl = window.location.href;
    const shareTitle = 'Vector Distance & Similarity Sandbox | LiDa Software';
    const shareText = 'Check out this interactive 2D Vector Distance & Similarity Sandbox for RAG & embeddings!';

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        shareButton.style.display = 'inline-flex';
        shareButton.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log('Share failed:', err);
                }
            }
        });
    } else {
        desktopShareButtons.style.display = 'flex';

        document.getElementById('share-facebook').addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
        });

        document.getElementById('share-linkedin').addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
        });

        document.getElementById('share-twitter').addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
        });

        document.getElementById('share-copy').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                const btn = document.getElementById('share-copy');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    }
}

// ============================================================================
// 3. Semantic Similarity API & Interactive UI Logic
// ============================================================================

let semanticApiExamples = [];
let semanticApiCategories = [];
let wakingUpTimer = null;

// Initialize Semantic Similarity
async function initSemanticSimilarity() {
    setupSemanticEventListeners();
    await loadApiCategories();
    await loadApiExamples();
}

// Setup Event Listeners
function setupSemanticEventListeners() {

    // Run comparison for manual entries (advanced drawer)
    document.getElementById('btn-compare').addEventListener('click', () => {
        const textA = document.getElementById('text-input-a').value.trim();
        const textB = document.getElementById('text-input-b').value.trim();
        if (textA && textB) {
            applyExampleValues(textA, textB);
        } else {
            alert('Please enter both Text A and Text B.');
        }
    });

    document.getElementById('btn-random-example').addEventListener('click', applyRandomExample);
    document.getElementById('btn-copy-compare-results').addEventListener('click', copyCompareResults);
    
    // Glossary expand/collapse all
    const btnExpandAll = document.getElementById('btn-expand-all-glossary');
    const btnCollapseAll = document.getElementById('btn-collapse-all-glossary');
    if (btnExpandAll && btnCollapseAll) {
        btnExpandAll.addEventListener('click', () => {
            document.querySelectorAll('.glossary-details').forEach(el => {
                el.open = true;
            });
        });
        btnCollapseAll.addEventListener('click', () => {
            document.querySelectorAll('.glossary-details').forEach(el => {
                el.open = false;
            });
        });
    }

    // Auto-open details when clicked from quick jump links
    document.querySelectorAll('.suggestion-chip[href^="#term-"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.open = true;
                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            }
        });
    });
    
    // Category dropdown
    document.getElementById('filter-category').addEventListener('change', (e) => {
        const shortcutBtn = document.getElementById('btn-shortcut-spelling');
        if (shortcutBtn) {
            if (e.target.value === 'spelling_similar_meaning_different') {
                shortcutBtn.classList.add('active');
            } else {
                shortcutBtn.classList.remove('active');
            }
        }
        renderApiExamples();
    });
    
    // Relation dropdown
    document.getElementById('filter-relation').addEventListener('change', () => {
        renderApiExamples();
    });

    // Local Search inputs
    const searchInput = document.getElementById('search-examples');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim().length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        renderApiExamples();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        renderApiExamples();
    });

    // Shortcut button Spelling similar, meaning different
    const shortcutBtn = document.getElementById('btn-shortcut-spelling');
    if (shortcutBtn) {
        shortcutBtn.addEventListener('click', () => {
            const categorySelect = document.getElementById('filter-category');
            const isActive = shortcutBtn.classList.contains('active');
            if (isActive) {
                shortcutBtn.classList.remove('active');
                categorySelect.value = '';
            } else {
                shortcutBtn.classList.add('active');
                categorySelect.value = 'spelling_similar_meaning_different';
            }
            renderApiExamples();
        });
    }
}

// Load Categories
async function loadApiCategories() {
    try {
        const data = await window.VectorSimilarityAPI.fetchVectorCategories();
        semanticApiCategories = (data && data.categories) ? data.categories : [];
        
        const categorySelect = document.getElementById('filter-category');
        // Clear all except first
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        
        semanticApiCategories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.name;
            const friendlyName = cat.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            opt.textContent = `${friendlyName} (${cat.count})`;
            categorySelect.appendChild(opt);
        });

        // Sync spelling shortcut count label
        const spellingCat = semanticApiCategories.find(c => c.name === 'spelling_similar_meaning_different');
        if (spellingCat) {
            const badge = document.querySelector('#btn-shortcut-spelling .badge-count');
            if (badge) {
                badge.textContent = `${spellingCat.count} pairs`;
            }
        }
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// Load Examples
async function loadApiExamples() {
    const loadingEl = document.getElementById('api-examples-loading');
    const containerEl = document.getElementById('api-presets-container');
    
    loadingEl.style.display = 'block';
    containerEl.style.display = 'none';
    
    try {
        // Since the remote Render API enforces a maximum limit of 200 items per request,
        // and our dataset has 372 items total across 14 categories, we bypass this ceiling
        // by requesting examples for each category in parallel.
        if (semanticApiCategories.length === 0) {
            await loadApiCategories();
        }
        
        if (semanticApiCategories.length > 0) {
            const categoryPromises = semanticApiCategories.map(cat => 
                window.VectorSimilarityAPI.fetchVectorExamples({ category: cat.name, limit: 100 })
            );
            const results = await Promise.all(categoryPromises);
            // Combine all arrays
            semanticApiExamples = results.flat();
        } else {
            // Fallback to basic limit-constrained fetch if categories loading failed
            const examples = await window.VectorSimilarityAPI.fetchVectorExamples({ limit: 200 });
            semanticApiExamples = examples || [];
        }
        
        renderApiExamples();
        
        // Pick and execute default comparison
        let defaultEx = semanticApiExamples.find(ex => ex.textA.toLowerCase() === 'car' && ex.textB.toLowerCase() === 'vehicle');
        if (!defaultEx) {
            defaultEx = semanticApiExamples.find(ex => ex.relation === 'very_similar');
        }
        if (!defaultEx && semanticApiExamples.length > 0) {
            defaultEx = semanticApiExamples[0];
        }
        if (defaultEx) {
            applyExampleValues(defaultEx.textA, defaultEx.textB);
        }
    } catch (err) {
        console.error('Error loading examples:', err);
        const isCors = err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'));
        const errorText = isCors 
            ? 'CORS or Connection Error: The browser blocked the request. The Render API server needs CORS headers configured to allow requests from local origins.'
            : 'Failed to load preset examples.';
        
        loadingEl.innerHTML = `
            <div style="color: var(--danger); font-size: 0.85rem; padding: 10px; line-height: 1.4;">
                <span class="material-symbols-outlined" style="font-size: 1.5rem; display:block; margin-bottom:4px;">warning</span>
                ${errorText}<br>
                <button id="btn-retry-examples" class="btn-action-secondary" style="margin-top: 8px; padding: 4px 8px; font-size: 0.75rem;">Retry</button>
            </div>
        `;
        document.getElementById('btn-retry-examples').addEventListener('click', loadApiExamples);
    }
}

// Render filtered presets
function renderApiExamples() {
    const categoryFilter = document.getElementById('filter-category').value;
    const relationFilter = document.getElementById('filter-relation').value;
    const searchQuery = document.getElementById('search-examples').value.toLowerCase().trim();
    const containerEl = document.getElementById('api-presets-container');
    const loadingEl = document.getElementById('api-examples-loading');
    
    containerEl.innerHTML = '';
    
    const filtered = semanticApiExamples.filter(ex => {
        const matchCategory = !categoryFilter || ex.category === categoryFilter;
        const matchRelation = !relationFilter || ex.relation === relationFilter;
        
        let matchSearch = true;
        if (searchQuery) {
            const textA = ex.textA.toLowerCase();
            const textB = ex.textB.toLowerCase();
            const explanation = (ex.explanation || '').toLowerCase();
            const category = ex.category.toLowerCase().replace(/_/g, ' ');
            const relation = ex.relation.toLowerCase().replace(/_/g, ' ');
            
            matchSearch = textA.includes(searchQuery) || 
                          textB.includes(searchQuery) || 
                          explanation.includes(searchQuery) ||
                          category.includes(searchQuery) ||
                          relation.includes(searchQuery);
        }
        
        return matchCategory && matchRelation && matchSearch;
    });
    
    if (filtered.length === 0) {
        containerEl.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">
                No examples match selected filters.
            </div>
        `;
    } else {
        filtered.forEach(ex => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.dataset.textA = ex.textA;
            btn.dataset.textB = ex.textB;
            
            const catFriendly = ex.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const relFriendly = ex.relation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // Sync active visual class
            const currentTextA = document.getElementById('selected-text-a').textContent;
            const currentTextB = document.getElementById('selected-text-b').textContent;
            if (currentTextA === ex.textA && currentTextB === ex.textB) {
                btn.classList.add('active');
            }
            
            const expSnippet = ex.explanation 
                ? `<div style="font-size: 0.8rem; color: var(--text-secondary); text-align: left; line-height: 1.3; font-style: italic; white-space: normal; margin-top: 6px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${ex.explanation}</div>` 
                : '';
                
            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; width: 100%; margin-bottom: 4px;">
                    <span class="preset-name" style="font-weight: 700; color: var(--text-primary); text-align: left; font-size: 0.85rem;">"${ex.textA}" vs "${ex.textB}"</span>
                    <span class="relation-badge-inline rel-${ex.relation}">${relFriendly}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-align: left;">Category: ${catFriendly}</div>
                ${expSnippet}
            `;
            
            btn.addEventListener('click', () => {
                applyExampleValues(ex.textA, ex.textB);
            });
            
            containerEl.appendChild(btn);
        });
    }
    
    loadingEl.style.display = 'none';
    containerEl.style.display = 'block';
}

// Highlight currently compared card preset
function updateActivePresetHighlight(textA, textB) {
    const buttons = document.querySelectorAll('#api-presets-container .preset-btn');
    buttons.forEach(btn => {
        if (btn.dataset.textA === textA && btn.dataset.textB === textB) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Apply example values to display and fields
function applyExampleValues(textA, textB) {
    document.getElementById('selected-text-a').textContent = textA;
    document.getElementById('selected-text-b').textContent = textB;
    
    document.getElementById('text-input-a').value = textA;
    document.getElementById('text-input-b').value = textB;
    
    runComparison();
    updateActivePresetHighlight(textA, textB);
}

// Apply random preset example
function applyRandomExample() {
    if (semanticApiExamples.length === 0) return;
    const randomIdx = Math.floor(Math.random() * semanticApiExamples.length);
    const ex = semanticApiExamples[randomIdx];
    applyExampleValues(ex.textA, ex.textB);
}

// Call POST /compare
async function runComparison() {
    const textA = document.getElementById('text-input-a').value.trim();
    const textB = document.getElementById('text-input-b').value.trim();
    
    if (!textA || !textB) {
        alert('Please select or enter both Text A and Text B to compare.');
        return;
    }
    
    // Sync UI elements
    document.getElementById('selected-text-a').textContent = textA;
    document.getElementById('selected-text-b').textContent = textB;
    updateActivePresetHighlight(textA, textB);
    
    // Show loading state
    document.getElementById('results-empty-state').style.display = 'none';
    document.getElementById('results-error-state').style.display = 'none';
    document.getElementById('results-success-content').style.display = 'none';
    
    const loadingState = document.getElementById('results-loading-state');
    const wakingUpMessage = document.getElementById('waking-up-message');
    
    loadingState.style.display = 'block';
    wakingUpMessage.style.display = 'none';
    
    // Reset wake up timer
    if (wakingUpTimer) clearTimeout(wakingUpTimer);
    wakingUpTimer = setTimeout(() => {
        wakingUpMessage.style.display = 'block';
    }, 1500);
    
    try {
        const response = await window.VectorSimilarityAPI.compareVectorTexts(textA, textB);
        if (wakingUpTimer) clearTimeout(wakingUpTimer);
        loadingState.style.display = 'none';
        
        renderCompareResult(response);
    } catch (err) {
        if (wakingUpTimer) clearTimeout(wakingUpTimer);
        loadingState.style.display = 'none';
        
        showCompareError(err);
    }
}

// Show error state (educational unsupported / CORS / connection)
function showCompareError(err) {
    const errorState = document.getElementById('results-error-state');
    const errorTitle = document.getElementById('error-title');
    const errorDesc = document.getElementById('error-desc');
    const suggestionsBox = document.getElementById('unsupported-suggestions-box');
    const suggestionsList = document.getElementById('suggestions-list');
    
    errorState.style.display = 'block';
    suggestionsBox.style.display = 'none';
    
    const isCors = err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'));
    
    if (err.status === 422) {
        errorTitle.textContent = "This pair is not in the demo dataset";
        errorDesc.textContent = "This sandbox only supports predefined examples so it can stay free and avoid paid embedding API calls.";
        
        // Render suggestions if any
        if (err.data && err.data.supportedExamples && err.data.supportedExamples.length > 0) {
            suggestionsList.innerHTML = '';
            err.data.supportedExamples.forEach(sug => {
                const chip = document.createElement('button');
                chip.className = 'suggestion-chip';
                chip.innerHTML = `<span class="material-symbols-outlined" style="font-size: 0.95rem; vertical-align: middle;">subdirectory_arrow_right</span> "${sug.textA}" vs "${sug.textB}"`;
                chip.addEventListener('click', () => {
                    applyExampleValues(sug.textA, sug.textB);
                });
                suggestionsList.appendChild(chip);
            });
            suggestionsBox.style.display = 'block';
        }
    } else if (isCors) {
        errorTitle.textContent = "CORS or Connection Error";
        errorDesc.textContent = "Failed to connect to the Render API. The remote server needs CORS headers configured to allow requests from your origin (http://localhost:8080).";
    } else {
        errorTitle.textContent = "Comparison Failed";
        errorDesc.textContent = err.message || "A network or server error occurred. Please verify your connection or try again.";
    }
}

// Render Comparison Results
function renderCompareResult(res) {
    const successContent = document.getElementById('results-success-content');
    
    // Values
    const cosine = res.metrics.cosineSimilarity;
    const dot = res.metrics.dotProduct;
    const euclidean = res.metrics.euclideanDistance;
    
    document.getElementById('compare-val-cosine').textContent = cosine.toFixed(3);
    document.getElementById('compare-val-dot').textContent = dot.toFixed(3);
    document.getElementById('compare-val-euclidean').textContent = euclidean.toFixed(3);
    
    // Progress fill bars
    const cosinePercent = Math.max(0, Math.min(100, ((cosine + 1) / 2) * 100));
    document.getElementById('compare-bar-cosine').style.width = `${cosinePercent}%`;
    
    const euclideanPercent = Math.max(0, Math.min(100, (1 - (euclidean / 2.5)) * 100));
    document.getElementById('compare-bar-euclidean').style.width = `${euclideanPercent}%`;
    
    // Badges & Labels
    const cosineBadge = document.getElementById('compare-badge-cosine');
    const dotBadge = document.getElementById('compare-badge-dot');
    const euclideanBadge = document.getElementById('compare-badge-euclidean');
    
    cosineBadge.className = 'interpretation-badge';
    dotBadge.className = 'interpretation-badge';
    euclideanBadge.className = 'interpretation-badge';
    
    // Cosine status styling
    if (cosine > 0.7) {
        cosineBadge.textContent = 'Highly Similar';
        cosineBadge.classList.add('status-similar');
    } else if (cosine > 0.2) {
        cosineBadge.textContent = 'Similar';
        cosineBadge.classList.add('status-similar-weak');
    } else if (cosine > -0.2) {
        cosineBadge.textContent = 'Orthogonal';
        cosineBadge.classList.add('status-neutral');
    } else if (cosine > -0.7) {
        cosineBadge.textContent = 'Opposite-Weak';
        cosineBadge.classList.add('status-opposite-weak');
    } else {
        cosineBadge.textContent = 'Opposite / Contradictory';
        cosineBadge.classList.add('status-opposite');
    }
    
    // Dot status styling
    if (dot > 1.0) {
        dotBadge.textContent = 'Strongly Aligned';
        dotBadge.classList.add('status-similar');
    } else if (dot > 0) {
        dotBadge.textContent = 'Aligned';
        dotBadge.classList.add('status-similar-weak');
    } else if (dot === 0) {
        dotBadge.textContent = 'Orthogonal';
        dotBadge.classList.add('status-neutral');
    } else {
        dotBadge.textContent = 'Opposed';
        dotBadge.classList.add('status-opposite');
    }
    
    // Euclidean status styling
    if (euclidean < 0.5) {
        euclideanBadge.textContent = 'Very Close';
        euclideanBadge.classList.add('status-similar');
    } else if (euclidean < 1.5) {
        euclideanBadge.textContent = 'Moderate Distance';
        euclideanBadge.classList.add('status-neutral');
    } else {
        euclideanBadge.textContent = 'Far Apart';
        euclideanBadge.classList.add('status-opposite');
    }

    // Dynamic interpretations and sentences
    let cosineInterpretation = '';
    let cosineDynamicText = '';
    if (cosine > 0.7) {
        cosineInterpretation = 'Strongly Related';
        cosineDynamicText = `This score of ${cosine.toFixed(3)} means these two terms are strongly related and close in meaning.`;
    } else if (cosine > 0.2) {
        cosineInterpretation = 'Fairly Related';
        cosineDynamicText = `This score of ${cosine.toFixed(3)} means these two terms are related, but not extremely close.`;
    } else if (cosine > -0.2) {
        cosineInterpretation = 'Weakly Related / Unrelated';
        cosineDynamicText = `This score of ${cosine.toFixed(3)} suggests the two terms have weak or no relation.`;
    } else {
        cosineInterpretation = 'Opposite Direction';
        cosineDynamicText = `This score of ${cosine.toFixed(3)} indicates the terms point in conceptually opposite directions.`;
    }
    document.getElementById('compare-summary-cosine').textContent = cosineInterpretation;
    document.getElementById('compare-dynamic-cosine').textContent = cosineDynamicText;

    let euclideanInterpretation = '';
    let euclideanDynamicText = '';
    if (euclidean < 0.5) {
        euclideanInterpretation = 'Very Close Distance';
        euclideanDynamicText = `A distance of ${euclidean.toFixed(3)} means the two demo vectors are extremely close to each other.`;
    } else if (euclidean < 1.5) {
        euclideanInterpretation = 'Moderate Distance';
        euclideanDynamicText = `A distance of ${euclidean.toFixed(3)} means the two demo vectors are moderately far from each other.`;
    } else {
        euclideanInterpretation = 'Far Apart';
        euclideanDynamicText = `A distance of ${euclidean.toFixed(3)} indicates the two demo vectors are far apart in space.`;
    }
    document.getElementById('compare-summary-euclidean').textContent = euclideanInterpretation;
    document.getElementById('compare-dynamic-euclidean').textContent = euclideanDynamicText;

    let dotInterpretation = '';
    let dotDynamicText = '';
    if (dot > 0.1) {
        dotInterpretation = 'Positive Alignment';
        dotDynamicText = `This positive value suggests the two vectors point in a broadly similar direction.`;
    } else if (dot >= -0.1) {
        dotInterpretation = 'Weak Alignment';
        dotDynamicText = `This value near zero indicates weak or no alignment between the vectors.`;
    } else {
        dotInterpretation = 'Negative Alignment';
        dotDynamicText = `This negative value suggests the vectors point in conceptually opposite tendencies.`;
    }
    document.getElementById('compare-summary-dot').textContent = dotInterpretation;
    document.getElementById('compare-dynamic-dot').textContent = dotDynamicText;

    // Summary top box
    document.getElementById('compare-summary-top-label').textContent = res.interpretation.label;
    document.getElementById('compare-summary-top-text').textContent = res.interpretation.summary;

    // Recommended takeaway
    let takeaway = 'For semantic comparison, cosine similarity is usually the most useful metric here. ';
    if (cosine > 0.7) {
        takeaway += `In this case, the pair looks strongly related, indicating a very close semantic match.`;
    } else if (cosine > 0.2) {
        takeaway += `In this case, the pair looks related, but not nearly identical.`;
    } else if (cosine > -0.2) {
        takeaway += `In this case, the pair appears mostly unrelated, showing little semantic connection.`;
    } else {
        takeaway += `In this case, the pair points in opposite directions in this demo, indicating opposite context.`;
    }
    document.getElementById('takeaway-text').textContent = takeaway;
    
    // Text labels
    document.getElementById('compare-category').textContent = res.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('compare-relation').textContent = res.relation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('compare-label').textContent = res.interpretation.label;
    document.getElementById('compare-summary').textContent = res.interpretation.summary;
    document.getElementById('compare-explanation').textContent = res.explanation;
    document.getElementById('compare-disclaimer').textContent = res.disclaimer;
    
    successContent.style.display = 'block';
}

// Copy Compare Results to Clipboard
async function copyCompareResults() {
    const textA = document.getElementById('selected-text-a').textContent;
    const textB = document.getElementById('selected-text-b').textContent;
    
    const cosine = document.getElementById('compare-val-cosine').textContent;
    const dot = document.getElementById('compare-val-dot').textContent;
    const euclidean = document.getElementById('compare-val-euclidean').textContent;
    
    const category = document.getElementById('compare-category').textContent;
    const relation = document.getElementById('compare-relation').textContent;
    const label = document.getElementById('compare-label').textContent;
    const summary = document.getElementById('compare-summary').textContent;
    const explanation = document.getElementById('compare-explanation').textContent;
    
    const textToCopy = `Vector Similarity Comparison Result
-----------------------------------------
Input A: "${textA}"
Input B: "${textB}"

Metrics:
- Cosine Similarity: ${cosine}
- Dot Product: ${dot}
- Euclidean Distance: ${euclidean}

Classification:
- Category: ${category}
- Relation: ${relation}
- Interpretation: ${label} - ${summary}

Explanation:
"${explanation}"

Generated via LiDa Vector Sandbox (Predefined Demo Mode)`;

    try {
        await navigator.clipboard.writeText(textToCopy);
        const btn = document.getElementById('btn-copy-compare-results');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.15rem;">done</span> Copied Result!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy results:', err);
    }
}

// Expose filter helper for Spelling section CTA
window.filterSpellingExamples = function() {
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
        categorySelect.value = 'spelling_similar_meaning_different';
        categorySelect.dispatchEvent(new Event('change'));
    }
    const sandboxTitle = document.getElementById('sandbox-workspace');
    if (sandboxTitle) {
        sandboxTitle.scrollIntoView({ behavior: 'smooth' });
    }
};

