// --- APP STATE ---
let currentTab = 'active';
let currentView = 'list'; // 'list' or 'providers'
let inputMode = 'slider'; // 'slider' or 'text'
let currentTokens = 30000;
let currentRuns = 1;
let compareList = [];
let currentExportModel = null;
let currentExportLang = 'curl';

// --- LOGIC ---

const modelEnhancements = {
    "gpt-5-6-sol": { modalities: ["text", "image", "audio", "video"], outModes: ["text", "image", "audio"], openSource: false, cutoff: "Mar 2026", maxOut: "16k", latency: "~1.2s" },
    "gpt-5-6-terra": { modalities: ["text", "image", "audio"], outModes: ["text", "audio"], openSource: false, cutoff: "Mar 2026", maxOut: "16k", latency: "~0.8s" },
    "gpt-5-6-luna": { modalities: ["text", "image"], outModes: ["text"], openSource: false, cutoff: "Mar 2026", maxOut: "8k", latency: "~0.4s" },
    "claude-fable-5": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "Apr 2026", maxOut: "8k", latency: "~1.8s" },
    "claude-opus-4-8": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "Jan 2026", maxOut: "8k", latency: "~1.5s" },
    "claude-sonnet-5": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "May 2026", maxOut: "8k", latency: "~0.7s" },
    "claude-sonnet-4.6": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "Oct 2025", maxOut: "8k", latency: "~0.9s" },
    "claude-haiku-4.5": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "Aug 2025", maxOut: "4k", latency: "~0.3s" },
    "gemini-3-5-flash": { modalities: ["text", "image", "audio", "video"], outModes: ["text", "audio"], openSource: false, cutoff: "Jun 2026", maxOut: "8k", latency: "~0.5s" },
    "gemini-3-1-pro": { modalities: ["text", "image", "audio", "video"], outModes: ["text", "audio"], openSource: false, cutoff: "Feb 2026", maxOut: "8k", latency: "~1.4s" },
    "gemini-3-1-flash-lite": { modalities: ["text", "image"], outModes: ["text"], openSource: false, cutoff: "Feb 2026", maxOut: "8k", latency: "~0.2s" },
    "llama-4-maverick": { modalities: ["text"], outModes: ["text"], openSource: true, cutoff: "Dec 2025", maxOut: "4k", latency: "~0.6s" },
    "llama-4-scout": { modalities: ["text"], outModes: ["text"], openSource: true, cutoff: "Dec 2025", maxOut: "4k", latency: "~0.3s" },
    "mistral-medium-3-5": { modalities: ["text"], outModes: ["text"], openSource: false, cutoff: "Jan 2026", maxOut: "4k", latency: "~0.8s" },
    "mistral-small-4": { modalities: ["text"], outModes: ["text"], openSource: true, cutoff: "Apr 2026", maxOut: "8k", latency: "~0.4s" },
    "mistral-large-3": { modalities: ["text"], outModes: ["text"], openSource: true, cutoff: "Feb 2026", maxOut: "8k", latency: "~1.1s" },
    "codestral-2": { modalities: ["text"], outModes: ["text"], openSource: true, cutoff: "May 2026", maxOut: "8k", latency: "~0.5s" },
    "deepseek-v4-flash": { modalities: ["text", "image"], outModes: ["text"], openSource: true, cutoff: "May 2026", maxOut: "8k", latency: "~0.6s" },
    "deepseek-v4-pro": { modalities: ["text", "image"], outModes: ["text"], openSource: true, cutoff: "May 2026", maxOut: "8k", latency: "~1.5s" },
    "grok-4-5": { modalities: ["text", "image"], outModes: ["text"], openSource: false, cutoff: "Jul 2026", maxOut: "8k", latency: "~1.0s" },
    "grok-4-1-fast": { modalities: ["text"], outModes: ["text"], openSource: false, cutoff: "Mar 2026", maxOut: "8k", latency: "~0.3s" },
    "qwen3-7-max": { modalities: ["text", "image"], outModes: ["text"], openSource: true, cutoff: "May 2026", maxOut: "8k", latency: "~1.2s" },
    "qwen3-7-plus": { modalities: ["text", "image"], outModes: ["text"], openSource: true, cutoff: "May 2026", maxOut: "8k", latency: "~0.7s" },
    "command-a-plus": { modalities: ["text", "image", "pdf"], outModes: ["text"], openSource: false, cutoff: "May 2026", maxOut: "4k", latency: "~1.3s" },
    "perplexity-sonar": { modalities: ["text"], outModes: ["text"], openSource: false, cutoff: "Live", maxOut: "4k", latency: "~1.5s" }
};

function getEnhancements(id) {
    return modelEnhancements[id] || { modalities: ["text"], outModes: ["text"], openSource: false, cutoff: "N/A", maxOut: "4k", latency: "N/A" };
}

function toggleView(view) {
    currentView = view;
    document.getElementById('btn-view-list').classList.toggle('active', view === 'list');
    document.getElementById('btn-view-providers').classList.toggle('active', view === 'providers');
    
    // Animate Toggle
    const toggle = document.getElementById('viewToggle');
    if (view === 'providers') toggle.classList.add('right');
    else toggle.classList.remove('right');

    runScanner();
}

function toggleInput(mode) {
    inputMode = mode;
    document.getElementById('btn-slider').classList.toggle('active', mode === 'slider');
    document.getElementById('btn-text').classList.toggle('active', mode === 'text');
    
    // Animate Toggle
    const toggle = document.getElementById('inputToggle');
    if (mode === 'text') toggle.classList.add('right');
    else toggle.classList.remove('right');

    document.getElementById('input-slider-group').classList.toggle('hidden', mode !== 'slider');
    document.getElementById('input-text-group').classList.toggle('hidden', mode !== 'text');
    
    updateInputs();
}

function applyPreset(type) {
    const wIntel = document.getElementById('weightIntel');
    const wSpeed = document.getElementById('weightSpeed');
    const wCost = document.getElementById('weightCost');

    if (type === 'coding') {
        wIntel.value = 90; wSpeed.value = 40; wCost.value = 20;
    } else if (type === 'chatbot') {
        wIntel.value = 60; wSpeed.value = 90; wCost.value = 50;
    } else if (type === 'rag') {
        wIntel.value = 70; wSpeed.value = 70; wCost.value = 40;
    } else if (type === 'cheap') {
        wIntel.value = 30; wSpeed.value = 50; wCost.value = 100;
    }
    updateInputs();
}

function updateInputs() {
    // 1. Calculate Tokens
    if (inputMode === 'slider') {
        const loc = document.getElementById('locInput').value;
        document.getElementById('locDisplay').innerText = parseInt(loc).toLocaleString() + ' lines';
        currentTokens = Math.floor(loc * 12);
        document.getElementById('tokenDisplay').innerText = (currentTokens / 1000).toFixed(1) + "k tokens";
    } else {
        const text = document.getElementById('textInput').value;
        // Approx 4 chars per token
        currentTokens = Math.ceil(text.length / 4);
        document.getElementById('realTokenDisplay').innerText = currentTokens.toLocaleString() + " tokens";
        currentRuns = parseInt(document.getElementById('runsInput').value) || 1;
    }

    // 2. Update Weight Labels
    const wIntel = document.getElementById('weightIntel').value;
    const wSpeed = document.getElementById('weightSpeed').value;
    const wCost = document.getElementById('weightCost').value;
    
    document.getElementById('val-intel').innerText = wIntel + '%';
    document.getElementById('val-speed').innerText = wSpeed + '%';
    document.getElementById('val-cost').innerText = wCost + '%';

    runScanner();
}

function calculateCost(model, tokens) {
    // Assume 80% input, 20% output
    const inTok = tokens * 0.8;
    const outTok = tokens * 0.2;
    const singleRunCost = ((inTok/1e6)*model.priceIn) + ((outTok/1e6)*model.priceOut);
    return singleRunCost * currentRuns;
}

function calculateWeightedScore(model, cost, maxCost) {
    const wIntel = parseInt(document.getElementById('weightIntel').value) / 100;
    const wSpeed = parseInt(document.getElementById('weightSpeed').value) / 100;
    const wCost = parseInt(document.getElementById('weightCost').value) / 100;

    // Normalize Cost (Lower is better) -> 0 to 100
    // If cost is 0, score is 100. If cost is maxCost, score is 0.
    let costScore = 100;
    if (maxCost > 0) {
        costScore = 100 * (1 - (cost / (maxCost * 1.2))); // 1.2 buffer
        if (costScore < 0) costScore = 0;
    }

    // Weighted Average
    // Total weight sum
    const totalWeight = wIntel + wSpeed + wCost || 1; // avoid div by 0

    const score = (
        (model.intelligence * wIntel) +
        (model.speed * wSpeed) +
        (costScore * wCost)
    ) / totalWeight;

    return Math.round(score);
}

function runScanner() {
    const container = document.getElementById('resultsArea');
    container.innerHTML = '';

    // Filter by Tab
    let models = db.filter(m => m.status === currentTab);

    if (currentTab === 'active') {
        // 1. Calculate Costs first to find Max Cost for normalization
        models = models.map(m => ({ ...m, estCost: calculateCost(m, currentTokens) }));
        const maxCost = Math.max(...models.map(m => m.estCost));

        // 2. Calculate Scores
        models = models.map(m => {
            const finalScore = calculateWeightedScore(m, m.estCost, maxCost);
            return { ...m, finalScore };
        });

        // 3. Sort
        if (currentView === 'providers') {
            models.sort((a, b) => {
                if (a.provider < b.provider) return -1;
                if (a.provider > b.provider) return 1;
                return b.finalScore - a.finalScore; // secondary sort by score
            });
            document.getElementById('chartArea').style.display = 'none';
        } else {
            models.sort((a, b) => b.finalScore - a.finalScore);
            // 4. Render Chart (Top 5)
            renderChart(models.slice(0, 5), maxCost);
        }
    } else {
        document.getElementById('chartArea').style.display = 'none';
        
        // For legacy, if grouping by provider, sort by provider
        if (currentView === 'providers') {
            models.sort((a, b) => {
                if (a.provider < b.provider) return -1;
                if (a.provider > b.provider) return 1;
                return 0;
            });
        }
    }

    if (models.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:4rem; color:var(--text-muted); border:1px dashed var(--border); border-radius:var(--radius-lg)">No models found.</div>`;
        return;
    }

    let lastProvider = null;

    models.forEach((model, index) => {
        const isTopPick = index === 0 && currentTab === 'active' && currentView === 'list';
        
        if (currentView === 'providers' && model.provider !== lastProvider) {
            const providerCount = models.filter(m => m.provider === model.provider).length;
            container.innerHTML += `
                <div style="margin-top: ${lastProvider ? '2.5rem' : '0'}; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        ${model.provider}
                    </h2>
                    <span style="font-size: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; color: var(--text-muted); font-weight: 600;">
                        ${providerCount} Model${providerCount > 1 ? 's' : ''}
                    </span>
                </div>
            `;
            lastProvider = model.provider;
        }

        const costClass = 'cost'; // Simplified for now

        // Format Cost Display
        let costDisplay = '$' + (model.estCost ? model.estCost.toFixed(4) : '0.0000');
        if (model.estCost > 0 && model.estCost < 0.0001) {
            costDisplay = '< $0.0001';
        }

        // Generate Badge HTML
        let badges = '';
        if (isTopPick) badges += `<span class="badge badge-pro" style="background:var(--primary); color:white; border:none;">#1 Match</span>`;
        if (model.priceIn <= 0.30) badges += `<span class="badge badge-cheap">Budget King</span>`;
        if (model.speed > 90) badges += `<span class="badge badge-fast">Blazing Fast</span>`;
        if (['gpt-5-6-sol', 'claude-fable-5', 'claude-opus-4-8', 'deepseek-v4-pro', 'grok-4-5', 'qwen3-7-max'].includes(model.id)) badges += `<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3);">Reasoning</span>`;
        if (['llama-4-scout', 'claude-fable-5', 'claude-opus-4-8', 'gemini-3-5-flash', 'gemini-3-1-pro', 'gemini-3-1-flash-lite', 'llama-4-maverick', 'grok-4-1-fast', 'qwen3-7-max', 'qwen3-7-plus', 'mistral-large-3', 'mistral-medium-3-5'].includes(model.id)) badges += `<span class="badge" style="background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.25);">Large Context</span>`;
        if (model.context === '10M') badges += `<span class="badge" style="background:rgba(16,185,129,0.2); color:#10d399; border:1px solid rgba(16,185,129,0.4); font-weight:700;">10M Context</span>`;

        // Generate Pros/Cons Lists with Icons
        const checkIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        const xIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

        let prosHtml = model.pros.map(p => `<li class="pro">${checkIcon} ${p}</li>`).join('');
        let consHtml = model.cons.map(c => `<li class="con">${xIcon} ${c}</li>`).join('');

        const extra = getEnhancements(model.id);
        let modalityIcons = '';
        if (extra.modalities.includes('text')) modalityIcons += `<span title="Text Input" style="font-size:14px; margin-right:4px;">📝</span>`;
        if (extra.modalities.includes('image')) modalityIcons += `<span title="Image Input" style="font-size:14px; margin-right:4px;">🖼️</span>`;
        if (extra.modalities.includes('audio')) modalityIcons += `<span title="Audio Input" style="font-size:14px; margin-right:4px;">🔊</span>`;
        if (extra.modalities.includes('video')) modalityIcons += `<span title="Video Input" style="font-size:14px; margin-right:4px;">📹</span>`;
        if (extra.modalities.includes('pdf')) modalityIcons += `<span title="PDF Input" style="font-size:14px; margin-right:4px;">📄</span>`;

        let openSourceBadge = extra.openSource ? `<span style="font-size:0.65rem; background:rgba(16,185,129,0.1); color:#10b981; border: 1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:4px; font-weight:700;">OPEN WEIGHTS</span>` : '';

        const techStrip = `
            <div style="display:flex; flex-wrap:wrap; gap:16px; margin-top:1.5rem; padding-top:1rem; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.75rem; color:var(--text-muted); align-items:center;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <strong>In:</strong> <div style="display:flex;">${modalityIcons}</div>
                </div>
                <div style="display:flex; align-items:center; gap:4px;">
                    <strong>Max Out:</strong> <span style="font-family:var(--font-mono); color:var(--text-main); background:rgba(255,255,255,0.05); padding:1px 6px; border-radius:4px;">${extra.maxOut}</span>
                </div>
                <div style="display:flex; align-items:center; gap:4px;">
                    <strong>Latency:</strong> <span style="font-family:var(--font-mono); color:var(--text-main); background:rgba(255,255,255,0.05); padding:1px 6px; border-radius:4px;">${extra.latency}</span>
                </div>
                <div style="display:flex; align-items:center; gap:4px;">
                    <strong>Cutoff:</strong> <span style="color:var(--text-main);">${extra.cutoff}</span>
                </div>
                ${openSourceBadge}
            </div>
        `;

        // Action Button
        let actionBtn = '';
        if (model.status === 'active') {
            actionBtn = `<button class="btn btn-primary" onclick="openApiModal('${model.id}')">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Get API Config
            </button>`;
        } else {
            actionBtn = `<button class="btn" disabled style="opacity:0.5; cursor:not-allowed">Unavailable</button>`;
        }

        const isChecked = compareList.includes(model.id) ? 'checked' : '';

        const html = `
            <div class="model-card ${model.status === 'legacy' ? 'graveyard-section' : ''}" id="card-${model.id}">
                <div class="card-identity">
                    <div class="model-name">${model.name}</div>
                    <div class="model-provider">
                        <svg class="icon" style="width:12px; height:12px; color:var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        ${model.provider}
                    </div>
                    <div class="badge-list">${badges}</div>
                    ${model.status === 'active' ? `
                    <label class="compare-check">
                        <input type="checkbox" onchange="toggleCompare('${model.id}')" ${isChecked}>Compare
                    </label>` : ''}
                </div>
                
                <div class="card-stats">
                    <div class="stat-row">
                        <div class="stat-item">
                            <div class="stat-label">Est. Cost</div>
                            <div class="stat-val ${costClass}">${costDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Context</div>
                            <div class="stat-val">${model.context}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Match Score</div>
                            <div class="stat-val" style="color:var(--primary)">${model.finalScore !== undefined ? model.finalScore : model.intelligence}<span style="font-size:0.7em; color:var(--text-muted)">/100</span></div>
                        </div>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-list">
                            <h4>Advantages</h4>
                            <ul>${prosHtml}</ul>
                        </div>
                        <div class="detail-list">
                            <h4>Drawbacks</h4>
                            <ul>${consHtml}</ul>
                        </div>
                    </div>
                    ${techStrip}
                </div>

                <div class="card-actions">
                    ${actionBtn}
                    <a href="${model.apiUrl}" target="_blank" class="btn btn-link">Read Documentation ↗</a>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderChart(models, maxCost) {
    const chartArea = document.getElementById('chartArea');
    const chartBars = document.getElementById('chartBars');
    chartArea.style.display = 'block';
    chartBars.innerHTML = '';

    models.forEach(m => {
        // Calculate width percentage relative to max cost
        // If cost is very low, give it at least 1% width
        let widthPct = (m.estCost / maxCost) * 100;
        if (widthPct < 1) widthPct = 1;

        const html = `
            <div class="chart-row" onclick="scrollToModel('${m.id}')">
                <div class="chart-label">${m.name}</div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${widthPct}%;"></div>
                </div>
                <div class="chart-value">$${m.estCost.toFixed(4)}</div>
            </div>
        `;
        chartBars.innerHTML += html;
    });
}

function scrollToModel(id) {
    const el = document.getElementById('card-' + id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 1500);
    }
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    runScanner();
}

// --- COMPARE LOGIC ---
function toggleCompare(id) {
    if (compareList.includes(id)) {
        compareList = compareList.filter(i => i !== id);
    } else {
        if (compareList.length >= 3) {
            showToast("Comparison limit reached. You can only compare up to 3 models at a time.", "warning");
            // Uncheck the box visually
            event.target.checked = false;
            return;
        }
        compareList.push(id);
    }
    updateCompareBar();
}

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    document.getElementById('compareCount').innerText = compareList.length;
    if (compareList.length > 0) {
        bar.classList.add('visible');
    } else {
        bar.classList.remove('visible');
    }
}

function clearCompare() {
    compareList = [];
    updateCompareBar();
    runScanner(); // Re-render to uncheck boxes
}

function openCompareModal() {
    const modal = document.getElementById('compareModal');
    const content = document.getElementById('compareContent');
    modal.style.display = 'flex';
    
    const models = db.filter(m => compareList.includes(m.id));

    if (models.length === 0) {
        closeCompareModal();
        return;
    }
    
    let html = `
    <div class="compare-grid-wrapper">
        <table class="premium-compare-table">
            <thead>
                <tr>
                    <th style="width:180px; background:transparent;"></th>
                    ${models.map(m => `
                    <th>
                        <div class="compare-model-header">
                            <span class="compare-provider">${m.provider}</span>
                            <h3 class="compare-name">${m.name}</h3>
                            <button class="btn btn-secondary" style="margin-top:12px; padding:6px 12px; font-size:0.75rem; border-color:var(--border);" onclick="toggleCompare('${m.id}'); openCompareModal();">Remove</button>
                        </div>
                    </th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="row-label">Match Score</td>
                    ${models.map(m => `<td><div class="score-pill score-${m.finalScore >= 90 ? 'high' : 'med'}">${m.finalScore || m.intelligence}</div></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Intelligence</td>
                    ${models.map(m => `<td><span style="font-weight:700; color:#e2e8f0;">${m.intelligence}/100</span></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Speed</td>
                    ${models.map(m => `<td><span style="font-weight:700; color:#e2e8f0;">${m.speed}/100</span></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Context Window</td>
                    ${models.map(m => `<td><span class="context-badge">${m.context}</span></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Input Cost (1M)</td>
                    ${models.map(m => `<td><span class="cost-val">$${m.priceIn.toFixed(2)}</span></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Output Cost (1M)</td>
                    ${models.map(m => `<td><span class="cost-val">$${m.priceOut.toFixed(2)}</span></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Key Advantages</td>
                    ${models.map(m => `<td style="vertical-align:top;"><ul class="compare-list pros">${m.pros.map(p => `<li>${p}</li>`).join('')}</ul></td>`).join('')}
                </tr>
                <tr>
                    <td class="row-label">Drawbacks</td>
                    ${models.map(m => `<td style="vertical-align:top;"><ul class="compare-list cons">${m.cons.map(c => `<li>${c}</li>`).join('')}</ul></td>`).join('')}
                </tr>
            </tbody>
        </table>
    </div>`;
    
    content.innerHTML = html;
}

function closeCompareModal() {
    document.getElementById('compareModal').style.display = 'none';
}

// --- EXPORT LOGIC ---
function openApiModal(modelId) {
    const model = db.find(m => m.id === modelId);
    currentExportModel = model;
    document.getElementById('modalModelName').innerText = model.name;
    document.getElementById('apiModal').style.display = 'flex';
    switchExport('curl'); // Default
}

function switchExport(lang) {
    currentExportLang = lang;
    document.querySelectorAll('.export-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const model = currentExportModel;
    const codeBlock = document.getElementById('modalCode');
    codeBlock.setAttribute('data-lang', lang.toUpperCase());
    
    let snippet = '';
    
    if (lang === 'curl') {
        snippet = `curl ${model.apiUrl} \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer $API_KEY" \\
-d '{
"model": "${model.id}",
"messages": [{"role": "user", "content": "Hello!"}]
}'`;
    } else if (lang === 'python') {
        snippet = `import requests

url = "${model.apiUrl}"
headers = {
"Content-Type": "application/json",
"Authorization": "Bearer YOUR_API_KEY"
}
data = {
"model": "${model.id}",
"messages": [{"role": "user", "content": "Hello!"}]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`;
    } else if (lang === 'node') {
        snippet = `const response = await fetch("${model.apiUrl}", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer YOUR_API_KEY"
},
body: JSON.stringify({
model: "${model.id}",
messages: [{role: "user", content: "Hello!"}]
})
});

const data = await response.json();
console.log(data);`;
    } else if (lang === 'env') {
        snippet = `LLM_PROVIDER="${model.provider}"
LLM_MODEL="${model.id}"
LLM_API_KEY="sk-..."
LLM_BASE_URL="${model.apiUrl}"`;
    }
    
    codeBlock.innerText = snippet;
}

function closeModal() {
    document.getElementById('apiModal').style.display = 'none';
}

function copyToClipboard() {
    const code = document.getElementById('modalCode').innerText;
    navigator.clipboard.writeText(code);
    const btn = document.querySelector('.modal .btn-primary');
    const originalHtml = btn.innerHTML;
    event.target.innerText = 'Copied!';
    setTimeout(() => {
        event.target.innerText = 'Copy';
    }, 2000);
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger reflow to ensure the transition runs
    void toast.offsetWidth;
    toast.classList.add('toast-show');

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400); // Wait for transition
    }, 4000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Populate stats bar from live db data
    const activeModels = db.filter(m => m.status === 'active');
    const legacyModels = db.filter(m => m.status === 'legacy');
    const providers = new Set(activeModels.map(m => m.provider)).size;

    document.getElementById('stat-active').textContent = activeModels.length;
    document.getElementById('stat-providers').textContent = providers;
    document.getElementById('stat-legacy').textContent = legacyModels.length;
    document.getElementById('tab-active-count').textContent = '(' + activeModels.length + ')';
    document.getElementById('tab-legacy-count').textContent = '(' + legacyModels.length + ')';

    updateInputs();
    
    if (window.initShareButton) {
        window.initShareButton({
            title: 'ModelScanner Pro - Compare AI Models for Devs',
            text: 'Check out this AI model comparison tool for developers. Compare costs, context windows, and capabilities.',
            url: window.location.href
        });
    }
});
