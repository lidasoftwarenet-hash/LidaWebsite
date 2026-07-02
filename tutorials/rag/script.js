/**
 * LiDa Software - Understanding RAG (Retrieval-Augmented Generation) Tutorial
 * JavaScript Sandbox Simulation Logic
 */

// Predefined Demo Data
const demoData = {
    "hr": {
        name: "Company HR Policy",
        chunks: [
            { id: "c1", text: "Employees receive 20 days of paid vacation per year, accruing monthly." },
            { id: "c2", text: "Sick leave allowance is 10 days per year. A doctor's note is required after 3 days." },
            { id: "c3", text: "Remote work is permitted up to 2 days per week with manager approval." },
            { id: "c4", text: "Employees can expense up to $500 for home office equipment setup." },
            { id: "c5", text: "Core working hours are 10:00 AM to 3:00 PM in the employee's local time zone." }
        ],
        questions: [
            {
                text: "How much vacation time do I get?",
                scores: { "c1": 0.95, "c2": 0.42, "c3": 0.20, "c5": 0.15, "c4": 0.05 },
                coreChunk: "c1",
                idealAnswer: "According to the HR policy, you receive 20 days of paid vacation per year, which accrues on a monthly basis."
            },
            {
                text: "Can I buy a desk for working from home?",
                scores: { "c4": 0.88, "c3": 0.75, "c5": 0.10, "c1": 0.05, "c2": 0.02 },
                coreChunk: "c4",
                idealAnswer: "Yes, you can expense up to $500 for home office equipment setup."
            }
        ]
    },
    "it": {
        name: "IT Support Docs",
        chunks: [
            { id: "c1", text: "To reset your password, click 'Forgot Password' on the login screen and follow the email link." },
            { id: "c2", text: "Passwords must be at least 12 characters long and contain a symbol." },
            { id: "c3", text: "Guest Wi-Fi is available on the 'Corp-Guest' network. The password changes weekly on Mondays." },
            { id: "c4", text: "To request a software license, submit a ticket via the IT Service Desk portal." },
            { id: "c5", text: "VPN access requires two-factor authentication via the Duo Mobile app." }
        ],
        questions: [
            {
                text: "How do I reset my password?",
                scores: { "c1": 0.94, "c2": 0.65, "c4": 0.30, "c5": 0.20, "c3": 0.05 },
                coreChunk: "c1",
                idealAnswer: "You can reset your password by clicking 'Forgot Password' on the login screen and following the link sent to your email."
            },
            {
                text: "How do I connect to the VPN?",
                scores: { "c5": 0.96, "c3": 0.40, "c1": 0.15, "c2": 0.10, "c4": 0.05 },
                coreChunk: "c5",
                idealAnswer: "To access the VPN, you must use two-factor authentication through the Duo Mobile app."
            }
        ]
    },
    "ecom": {
        name: "E-commerce FAQ",
        chunks: [
            { id: "c1", text: "Standard shipping takes 3-5 business days. Expedited takes 1-2 business days." },
            { id: "c2", text: "Items can be returned within 30 days of delivery in their original packaging." },
            { id: "c3", text: "Refunds are processed within 5-7 business days to the original payment method." },
            { id: "c4", text: "We accept Visa, Mastercard, PayPal, and Apple Pay." },
            { id: "c5", text: "If an item arrives damaged, contact support within 48 hours for a free replacement." }
        ],
        questions: [
            {
                text: "How long until I get my money back for a return?",
                scores: { "c3": 0.96, "c2": 0.75, "c4": 0.20, "c1": 0.15, "c5": 0.10 },
                coreChunk: "c3",
                idealAnswer: "Refunds are processed within 5 to 7 business days to your original payment method."
            },
            {
                text: "My package was broken when I opened it.",
                scores: { "c5": 0.98, "c2": 0.60, "c3": 0.30, "c1": 0.10, "c4": 0.05 },
                coreChunk: "c5",
                idealAnswer: "Since your item arrived damaged, please contact support within 48 hours to arrange a free replacement."
            }
        ]
    },
    "java": {
        name: "Backend Engineering Notes",
        chunks: [
            { id: "c1", text: "Spring Boot auto-configuration attempts to guess and configure beans you are likely to need." },
            { id: "c2", text: "Java Streams process collections in a declarative way, supporting operations like map, filter, and reduce." },
            { id: "c3", text: "The G1 Garbage Collector partitions the heap into regions and prioritizes regions with the most garbage." },
            { id: "c4", text: "CompletableFuture allows writing asynchronous, non-blocking code in Java." }
        ],
        questions: [
            {
                text: "How does G1 GC work?",
                scores: { "c3": 0.94, "c1": 0.20, "c2": 0.15, "c4": 0.10 },
                coreChunk: "c3",
                idealAnswer: "The G1 (Garbage-First) Garbage Collector partitions the memory heap into regions and prioritizes cleaning up the regions that contain the most garbage."
            }
        ]
    }
};

// DOM Elements Holder
let ui = {};

// Initialization
function init() {
    ui = {
        kbSelect: document.getElementById('kbSelect'),
        qSelect: document.getElementById('qSelect'),
        topK: document.getElementById('topK'),
        topKValue: document.getElementById('topKValue'),
        threshold: document.getElementById('threshold'),
        thresholdValue: document.getElementById('thresholdValue'),
        promptBudget: document.getElementById('promptBudget'),
        runBtn: document.getElementById('runBtn'),
        resultsArea: document.getElementById('resultsArea'),
        pipelineVis: document.getElementById('pipelineVis'),
        summaryPanel: document.getElementById('summaryPanel'),
        summaryText: document.getElementById('summaryText'),
        hintPanel: document.getElementById('hintPanel'),
        hintList: document.getElementById('hintList'),
        chunksContainer: document.getElementById('chunksContainer'),
        promptContainer: document.getElementById('promptContainer'),
        answerContainer: document.getElementById('answerContainer')
    };

    if (!ui.kbSelect) return; // Guard for pages without sandbox

    // Populate KB Dropdown
    ui.kbSelect.innerHTML = '';
    for (const key in demoData) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = demoData[key].name;
        ui.kbSelect.appendChild(opt);
    }
    updateQuestions();

    // Event Listeners
    ui.kbSelect.addEventListener('change', updateQuestions);
    
    ui.topK.addEventListener('input', (e) => {
        ui.topKValue.textContent = `${e.target.value} Chunks`;
    });
    
    ui.threshold.addEventListener('input', (e) => {
        ui.thresholdValue.textContent = parseFloat(e.target.value).toFixed(2);
    });

    ui.runBtn.addEventListener('click', executePipelineAnimation);
}

function updateQuestions() {
    ui.qSelect.innerHTML = '';
    const kb = demoData[ui.kbSelect.value];
    kb.questions.forEach((q, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `"${q.text}"`;
        ui.qSelect.appendChild(opt);
    });
}

// Pipeline Execution Logic
const pipelineSteps = ['step-query', 'step-search', 'step-filter', 'step-prompt', 'step-generate'];

async function executePipelineAnimation() {
    // Reset UI
    ui.resultsArea.classList.remove('hidden');
    ui.summaryPanel.classList.add('hidden');
    ui.hintPanel.classList.add('hidden');
    ui.chunksContainer.innerHTML = '';
    ui.promptContainer.innerHTML = '<span class="processing-text">Processing simulation...</span>';
    ui.answerContainer.innerHTML = '';
    ui.answerContainer.className = 'answer-box'; // reset class
    
    pipelineSteps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    // Animate Steps
    for (let i = 0; i < pipelineSteps.length; i++) {
        const el = document.getElementById(pipelineSteps[i]);
        if (el) el.classList.add('active');
        if (i > 0) {
            const prevEl = document.getElementById(pipelineSteps[i - 1]);
            if (prevEl) prevEl.classList.remove('active');
        }
        await new Promise(r => setTimeout(r, 400)); // 400ms delay per step
    }
    
    // Execute actual logic
    runRAGLogic();
    
    // Turn off last step animation state
    setTimeout(() => {
        const lastEl = document.getElementById(pipelineSteps[pipelineSteps.length - 1]);
        if (lastEl) lastEl.classList.remove('active');
    }, 600);
}

function runRAGLogic() {
    const kb = demoData[ui.kbSelect.value];
    const q = kb.questions[ui.qSelect.value];
    
    const topKLimit = parseInt(ui.topK.value);
    const thresholdLimit = parseFloat(ui.threshold.value);
    const budgetType = ui.promptBudget.value;
    
    // Map budget string to character limit
    let charLimit = 500;
    if(budgetType === 'small') charLimit = 150;
    if(budgetType === 'large') charLimit = 2000;

    // 1. Vector Search Simulation (Score & Sort)
    let rankedChunks = kb.chunks.map(chunk => {
        return {
            ...chunk,
            score: q.scores[chunk.id] || 0.0
        };
    }).sort((a, b) => b.score - a.score);

    // 2. Filtering Logic
    let selectedChunks = [];
    let currentChars = 0;
    let budgetDrops = 0;

    ui.chunksContainer.innerHTML = '';

    rankedChunks.forEach((chunk, index) => {
        let isSelected = false;
        let reason = "";

        if (chunk.score < thresholdLimit) {
            reason = `Rejected: Score ${chunk.score.toFixed(2)} is below threshold ${thresholdLimit.toFixed(2)}`;
        } else if (selectedChunks.length >= topKLimit) {
            reason = `Rejected: Exceeds Top-K limit of ${topKLimit}`;
        } else if (currentChars + chunk.text.length > charLimit) {
            reason = `Rejected: Dropped due to prompt budget limit (${budgetType})`;
            budgetDrops++;
        } else {
            isSelected = true;
            reason = `Selected: Score ${chunk.score.toFixed(2)} meets all criteria.`;
            currentChars += chunk.text.length;
            selectedChunks.push(chunk);
        }

        // Render Chunk Card
        renderChunkCard(chunk, index + 1, isSelected, reason);
    });

    // 3. Prompt Assembly
    let contextText = selectedChunks.length > 0 
        ? selectedChunks.map((c, i) => `[Doc ${i+1}] ${c.text}`).join('\n\n')
        : "[No documents retrieved matching criteria]";
    
    ui.promptContainer.innerHTML = `<span class="p-sys">System:
You are an AI assistant. Answer the user's question using ONLY the provided context below. If the answer is not in the context, output exactly "I do not have enough information to answer that."</span>

<span class="p-ctx">Context:
${contextText}</span>

<span class="p-usr">Question:
${q.text}</span>`;

    // 4. Generation Simulation
    const hasCoreChunk = selectedChunks.some(c => c.id === q.coreChunk);
    const lowestSelectedScore = selectedChunks.length > 0 ? selectedChunks[selectedChunks.length - 1].score : 1.0;
    
    if (selectedChunks.length === 0) {
        ui.answerContainer.innerHTML = `<p>I do not have enough information to answer that.</p>`;
        ui.answerContainer.classList.add('failed');
    } else if (!hasCoreChunk) {
        ui.answerContainer.innerHTML = `<p>I do not have enough information to answer that based on the provided documents.</p>
        <span class="warning-text">⚠️ The AI refused because the correct chunk was filtered out by your settings.</span>`;
        ui.answerContainer.classList.add('failed');
    } else {
        let html = `<p>${q.idealAnswer}</p>`;
        if (lowestSelectedScore < 0.50) {
            html += `<span class="warning-text">⚠️ Warning: A low-relevance chunk (Score < 0.50) was included in the prompt. In a real app, this increases hallucination risk.</span>`;
        }
        ui.answerContainer.innerHTML = html;
    }

    // 5. Update Feedback Panels
    generateFeedback(rankedChunks.length, selectedChunks.length, topKLimit, thresholdLimit, budgetType, budgetDrops);
}

function renderChunkCard(chunk, rank, isSelected, reason) {
    const card = document.createElement('div');
    card.className = 'chunk-card';
    card.innerHTML = `
        <div class="chunk-header">
            <span class="chunk-meta">Rank #${rank} | Similarity: ${(chunk.score * 100).toFixed(0)}%</span>
            <span class="badge ${isSelected ? 'badge-selected' : 'badge-rejected'}">${isSelected ? 'Included' : 'Filtered Out'}</span>
        </div>
        <div class="chunk-text">${chunk.text}</div>
        <div class="chunk-reason">
            ${isSelected ? '✅' : '❌'} ${reason}
        </div>
    `;
    ui.chunksContainer.appendChild(card);
}

function generateFeedback(total, selected, topK, threshold, budget, budgetDrops) {
    // Summary Text
    let sumTxt = `Database searched ${total} total chunks. `;
    if (selected === 0) sumTxt += `<strong>All chunks were filtered out.</strong>`;
    else sumTxt += `<strong>${selected} chunk(s)</strong> successfully passed the filters and were injected into the prompt.`;
    
    if(budgetDrops > 0) sumTxt += ` <br><br><em>Note: ${budgetDrops} chunk(s) were dropped because the prompt budget was reached.</em>`;
    
    ui.summaryText.innerHTML = sumTxt;
    ui.summaryPanel.classList.remove('hidden');

    // Hints List
    ui.hintList.innerHTML = '';
    let hints = [];

    if (topK === 1) hints.push("<strong>Top-K = 1:</strong> Very strict. Efficient, but fails if an answer spans multiple documents.");
    if (topK >= 5) hints.push("<strong>Top-K High (≥5):</strong> Lots of context, but consumes more AI tokens (cost) and risks 'lost in the middle' syndrome.");
    if (threshold >= 0.8) hints.push("<strong>High Threshold:</strong> Extreme precision. Often results in empty prompts if the wording isn't a near-perfect match.");
    if (threshold <= 0.3) hints.push("<strong>Low Threshold:</strong> You are allowing weak, potentially irrelevant chunks into the prompt, risking hallucination.");
    if (budget === 'small' && selected > 0) hints.push("<strong>Small Budget:</strong> Context size is highly constrained.");

    if (hints.length > 0) {
        hints.forEach(h => {
            const li = document.createElement('li');
            li.innerHTML = h;
            ui.hintList.appendChild(li);
        });
        ui.hintPanel.classList.remove('hidden');
    }
}

// Scenario Preset Buttons
window.runScenario = function(type) {
    if (!ui.topK) return;
    
    if (type === 'perfect') {
        ui.topK.value = 3;
        ui.threshold.value = 0.50;
        ui.promptBudget.value = "medium";
    } else if (type === 'strict') {
        ui.topK.value = 5;
        ui.threshold.value = 0.95; // Too high
        ui.promptBudget.value = "medium";
    } else if (type === 'lowK') {
        ui.topK.value = 1; // Too low
        ui.threshold.value = 0.10;
        ui.promptBudget.value = "medium";
    } else if (type === 'noise') {
        ui.topK.value = 6;
        ui.threshold.value = 0.05; // Letting garbage in
        ui.promptBudget.value = "large";
    }
    
    // Manually trigger UI updates for ranges
    ui.topKValue.textContent = `${ui.topK.value} Chunks`;
    ui.thresholdValue.textContent = parseFloat(ui.threshold.value).toFixed(2);
    
    // Scroll to top of sandbox and run
    const sandboxEl = document.getElementById('sandbox');
    if (sandboxEl) {
        sandboxEl.scrollIntoView({ behavior: 'smooth' });
    }
    executePipelineAnimation();
};

// Global Nav & Popup handlers
function openWhatsAppPopup() {
    const popup = document.getElementById('whatsappPopup');
    if (popup) popup.style.display = 'block';
}

function closeWhatsAppPopup() {
    const popup = document.getElementById('whatsappPopup');
    if (popup) popup.style.display = 'none';
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Global site layout event listeners
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Scroll to Top Button Visibility
    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        });

        scrollToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
