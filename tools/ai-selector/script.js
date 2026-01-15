// --- APP STATE ---
let currentTab = 'active';
let inputMode = 'slider'; // 'slider' or 'text'
let currentTokens = 30000;
let currentRuns = 1;
let compareList = [];
let currentExportModel = null;
let currentExportLang = 'curl';

// --- LOGIC ---
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

        // 3. Sort by Final Score
        models.sort((a, b) => b.finalScore - a.finalScore);

        // 4. Render Chart (Top 5)
        renderChart(models.slice(0, 5), maxCost);
    } else {
        document.getElementById('chartArea').style.display = 'none';
    }

    if (models.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:4rem; color:var(--text-muted); border:1px dashed var(--border); border-radius:var(--radius-lg)">No models found.</div>`;
        return;
    }

    models.forEach((model, index) => {
        const isTopPick = index === 0 && currentTab === 'active';
        const costClass = 'cost'; // Simplified for now

        // Format Cost Display
        let costDisplay = '$' + (model.estCost ? model.estCost.toFixed(4) : '0.0000');
        if (model.estCost > 0 && model.estCost < 0.0001) {
            costDisplay = '< $0.0001';
        }

        // Generate Badge HTML
        let badges = '';
        if (isTopPick) badges += `<span class="badge badge-pro" style="background:var(--primary); color:white; border:none;">#1 Match</span>`;
        if (model.priceIn < 0.5) badges += `<span class="badge badge-cheap">Budget King</span>`;
        if (model.speed > 90) badges += `<span class="badge badge-fast">Blazing Fast</span>`;

        // Generate Pros/Cons Lists with Icons
        const checkIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        const xIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

        let prosHtml = model.pros.map(p => `<li class="pro">${checkIcon} ${p}</li>`).join('');
        let consHtml = model.cons.map(c => `<li class="con">${xIcon} ${c}</li>`).join('');

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
            <div class="model-card ${model.status === 'legacy' ? 'graveyard-section' : ''}" id="card-${model.id}" style="${isTopPick ? 'border-color:var(--primary); box-shadow:0 0 20px rgba(59,130,246,0.15);' : ''}">
                <div class="card-identity">
                    <div class="model-name">${model.name}</div>
                    <div class="model-provider">
                        <svg class="icon" style="width:12px; height:12px; color:var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        ${model.provider}
                    </div>
                    <div class="badge-list">${badges}</div>
                    ${model.status === 'active' ? `
                    <label class="compare-check">
                        <input type="checkbox" onchange="toggleCompare('${model.id}')" ${isChecked}> Compare
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
            alert("You can compare up to 3 models.");
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
    
    let html = `<table class="compare-table">
        <thead>
            <tr>
                <th>Feature</th>
                ${models.map(m => `<th>${m.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Provider</strong></td>
                ${models.map(m => `<td>${m.provider}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Context</strong></td>
                ${models.map(m => `<td>${m.context}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Input Price</strong></td>
                ${models.map(m => `<td>$${m.priceIn}/1M</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Output Price</strong></td>
                ${models.map(m => `<td>$${m.priceOut}/1M</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Intelligence</strong></td>
                ${models.map(m => `<td>${m.intelligence}/100</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Speed</strong></td>
                ${models.map(m => `<td>${m.speed}/100</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Pros</strong></td>
                ${models.map(m => `<td>${m.pros.join('<br>• ')}</td>`).join('')}
            </tr>
        </tbody>
    </table>`;
    
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
    btn.innerHTML = "Copied!";
    setTimeout(() => btn.innerHTML = originalHtml, 2000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateInputs();
    
    if (window.initShareButton) {
        window.initShareButton({
            title: 'ModelScanner Pro - Compare AI Models for Devs',
            text: 'Check out this AI model comparison tool for developers. Compare costs, context windows, and capabilities.',
            url: window.location.href
        });
    }
});
