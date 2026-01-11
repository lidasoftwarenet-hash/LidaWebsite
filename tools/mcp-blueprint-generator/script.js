/**
 * MCP Blueprint Generator - Core Logic
 */

const SECTIONS = {
    TYPE: 'mcpType',
    STATE: 'stateModel',
    CONSUMER: 'consumer',
    EFFECTS: 'sideEffects',
    SIZE: 'expectedSize',
    LANGUAGE: 'language',
    PATTERN: 'pattern'
};

const state = {
    currentStep: 1,
    answers: {
        [SECTIONS.TYPE]: null,
        [SECTIONS.STATE]: null,
        [SECTIONS.CONSUMER]: null,
        [SECTIONS.EFFECTS]: null,
        [SECTIONS.SIZE]: null,
        [SECTIONS.LANGUAGE]: null,
        [SECTIONS.PATTERN]: null
    }
};

// UI Elements
const progressBar = document.getElementById('progressBar');
const stepCards = document.querySelectorAll('.step-card');
const optionCards = document.querySelectorAll('.option-card');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const stepIndicator = document.getElementById('stepIndicator');
const stepDots = document.querySelectorAll('.step-dot');
const resultStep = document.getElementById('resultStep');
const wizardNav = document.getElementById('wizardNav');
const folderTree = document.getElementById('folderTree');
const fileTabs = document.getElementById('fileTabs');
const fileContent = document.getElementById('fileContent');
const restartBtn = document.getElementById('restartBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');

const magicBashCode = document.getElementById('magicBashCode');
const mermaidDiagram = document.getElementById('mermaidDiagram');
const advicePanel = document.getElementById('advicePanel');
const adviceText = document.getElementById('adviceText');
const adviceTags = document.getElementById('adviceTags');
const resultTabs = document.querySelectorAll('.result-tab');
const tabViews = document.querySelectorAll('.tab-view');
const copyBashBtn = document.getElementById('copyBashBtn');
const loadingStep = document.getElementById('loadingStep');
const choiceSummary = document.getElementById('choiceSummary');
const aiMagicInput = document.getElementById('aiMagicInput');
const aiInferBtn = document.getElementById('aiInferBtn');
const aiFeedback = document.getElementById('aiFeedback');
const projectNameInput = document.getElementById('projectNameInput');
const projectAuthorInput = document.getElementById('projectAuthorInput');
const toastContainer = document.getElementById('toastContainer');

let generatedFiles = {};
let currentFile = null;
let isAssembling = false;
let diagramZoom = 1;
let diagramPan = { x: 0, y: 0 };


// Initialization
function init() {
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const step = card.closest('.step-card').dataset.step;
            const value = card.dataset.value;
            selectOption(step, value, card);
        });
    });

    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);
    restartBtn.addEventListener('click', restart);
    copyBtn.addEventListener('click', copyToClipboard);
    if (downloadZipBtn) downloadZipBtn.addEventListener('click', downloadAsZip);
    if (aiInferBtn) aiInferBtn.addEventListener('click', handleAIInference);
    if (aiMagicInput) {
        aiMagicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAIInference();
        });
    }

    if (projectNameInput) projectNameInput.addEventListener('input', () => {
        state.answers.name = projectNameInput.value;
        renderShareButtons();
    });
    if (projectAuthorInput) projectAuthorInput.addEventListener('input', () => {
        state.answers.author = projectAuthorInput.value;
        renderShareButtons();
    });


    copyBashBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(magicBashCode.textContent).then(() => {
            showToast("Bash scaffold command copied!", "success");
        });
    });


    resultTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });

    // Option Card Spotlight & Cursor
    document.addEventListener('mousemove', (e) => {
        optionCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    initDiagramControls();
    handleUrlState();
    renderShareButtons();
    updateUI();
}


/**
 * Share & Persist State via URL
 */
function getShareUrl() {
    const encoded = btoa(JSON.stringify(state.answers));
    const url = new URL(window.location);
    url.hash = `config=${encoded}`;
    return url.href;
}

function shareConfig() {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Shareable URL copied to clipboard!", "success");
    });
}

function renderShareButtons() {
    const shareContainer = document.getElementById('shareContainer');
    const desktopButtons = document.getElementById('desktop-share-buttons');
    if (!shareContainer || !desktopButtons) return;

    const shareUrl = getShareUrl();
    const shareText = `Check out my customized MCP Server architecture on LiDa MCP Blueprint Generator!`;
    const shareTitle = `MCP Server Blueprint: ${state.answers.name || 'Architecture'}`;

    shareContainer.classList.remove('hidden');
    desktopButtons.innerHTML = `
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" class="social-share-btn share-fb">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" class="social-share-btn share-li">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
        </a>
        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}" target="_blank" class="social-share-btn share-tw">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
        </a>
        <button class="social-share-btn share-copy" id="shareCopyBtn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Copy Link
        </button>
    `;

    document.getElementById('shareCopyBtn').onclick = shareConfig;

    // Mobile support
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'social-share-btn bg-gradient-to-r from-blue-600 to-indigo-600';
        mobileBtn.innerHTML = `<span>↗️</span> Mobile Share`;
        mobileBtn.onclick = async () => {
            try {
                await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
            } catch (err) { if (err.name !== 'AbortError') console.error(err); }
        };
        desktopButtons.prepend(mobileBtn);
    }
}


function handleUrlState() {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
        try {
            const encoded = hash.split('=')[1];
            const decoded = JSON.parse(atob(encoded));
            state.answers = decoded;

            // Apply visual selection to all steps
            Object.entries(state.answers).forEach(([key, value]) => {
                if (value) {
                    const card = document.querySelector(`.option-card[data-value="${value}"]`);
                    if (card) card.classList.add('selected');
                }
            });

            if (state.answers.name && projectNameInput) projectNameInput.value = state.answers.name;
            if (state.answers.author && projectAuthorInput) projectAuthorInput.value = state.answers.author;

            showToast("Configuration loaded from URL", "success");

        } catch (e) {
            console.error("Failed to decode URL state", e);
        }
    }
}


/**
 * Professional Toast System
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast animate-fade-in-right';
    const icon = type === 'success' ? '✨' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initDiagramControls() {
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    const diagram = document.getElementById('mermaidDiagram');

    if (!zoomIn) return;

    zoomIn.onclick = () => { diagramZoom += 0.1; applyDiagramTransform(); };
    zoomOut.onclick = () => { diagramZoom = Math.max(0.2, diagramZoom - 0.1); applyDiagramTransform(); };
    zoomReset.onclick = () => { diagramZoom = 1; diagramPan = { x: 0, y: 0 }; applyDiagramTransform(); };

    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    diagram.parentElement.onmousedown = (e) => {
        isDragging = true;
        lastPos = { x: e.clientX, y: e.clientY };
    };

    window.onmousemove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        diagramPan.x += dx;
        diagramPan.y += dy;
        lastPos = { x: e.clientX, y: e.clientY };
        applyDiagramTransform();
    };

    window.onmouseup = () => isDragging = false;
}

function applyDiagramTransform() {
    const diagram = document.getElementById('mermaidDiagram');
    if (diagram) {
        diagram.style.transform = `translate(${diagramPan.x}px, ${diagramPan.y}px) scale(${diagramZoom})`;
    }
}


function selectOption(step, value, card) {
    const sectionKey = Object.values(SECTIONS)[step - 1];
    state.answers[sectionKey] = value;

    // UI Feedback
    card.closest('.step-card').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    nextBtn.disabled = false;
    renderShareButtons(); // Update share URL with new choice
}


function nextStep() {
    if (state.currentStep < 7) {
        state.currentStep++;
        updateUI();
    } else {
        generateBlueprint();
    }
}

function prevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateUI();
    }
}

function updateUI() {
    const isResult = state.currentStep > 7;

    // Progress
    const totalSteps = 7;
    const progress = (Math.min(state.currentStep, totalSteps) / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;

    // Cards
    stepCards.forEach(card => {
        const step = parseInt(card.dataset.step);
        if (!isNaN(step)) {
            card.classList.toggle('active', step === state.currentStep);
        }
    });

    // Buttons
    if (state.currentStep === 1) {
        prevBtn.classList.add('opacity-0', 'pointer-events-none');
    } else {
        prevBtn.classList.remove('opacity-0', 'pointer-events-none');
    }

    if (state.currentStep === 7) {
        nextBtn.textContent = 'Generate Blueprint';
    } else {
        nextBtn.textContent = 'Next';
    }

    // Dots
    stepDots.forEach((dot, idx) => {
        dot.classList.remove('active', 'completed');
        if (idx + 1 === state.currentStep) dot.classList.add('active');
        if (idx + 1 < state.currentStep) dot.classList.add('completed');
    });

    const sectionKey = Object.values(SECTIONS)[state.currentStep - 1];
    nextBtn.disabled = !state.answers[sectionKey];

    stepIndicator.textContent = `Step ${state.currentStep} of ${totalSteps}`;

    if (isResult && !isAssembling && resultStep && !resultStep.classList.contains('active')) {
        isAssembling = true;
        if (wizardNav) wizardNav.classList.add('hidden');

        // Show loading simulation
        if (loadingStep) {
            loadingStep.classList.add('active');
            const activeSteps = document.querySelectorAll('.step-card.active');
            activeSteps.forEach(s => { if (s && s.id !== 'loadingStep') s.classList.remove('active'); });
        }

        setTimeout(() => {
            if (loadingStep) loadingStep.classList.remove('active');
            if (resultStep) resultStep.classList.add('active');
            renderChoiceSummary();
            renderShareButtons();
            // Final dot state

            stepDots.forEach(dot => { if (dot) dot.classList.add('completed'); });
            isAssembling = false;
        }, 1200);
    }
}

function restart() {
    state.currentStep = 1;
    Object.keys(state.answers).forEach(key => state.answers[key] = null);
    optionCards.forEach(c => c.classList.remove('selected'));
    resultStep.classList.remove('active');
    wizardNav.classList.remove('hidden');
    updateUI();
}

// Blueprint Generation Logic
function generateBlueprint() {
    const { mcpType, stateModel, consumer, sideEffects, expectedSize, language, pattern } = state.answers;
    const projectMeta = {
        name: projectNameInput.value.trim() || 'mcp-server-blueprint',
        author: projectAuthorInput.value.trim() || 'LiDa Architect'
    };

    const tree = buildTreeStructure(language, mcpType, expectedSize);
    folderTree.textContent = tree;

    generatedFiles = buildFileTemplates(language, { ...state.answers, ...projectMeta });

    // New Pro Features
    renderAdvice(state.answers);
    renderMagicBash(generatedFiles);
    renderDiagram(state.answers);

    renderTabs();
    state.currentStep = 8; // Show result
    updateUI();
    showToast("Architecture Blueprint Finalized", "success");
}


function switchTab(tabName) {
    resultTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    tabViews.forEach(v => {
        v.classList.toggle('active', v.id === tabName + 'View' || (tabName === 'files' && v.id === 'structureView'));
        if (v.id.includes('View')) {
            v.classList.toggle('hidden', !(v.id === tabName + 'View'));
        }
    });

    // StructureView visibility management
    document.getElementById('structureView').classList.toggle('hidden', tabName !== 'files');
}

function renderAdvice(answers) {
    advicePanel.classList.remove('hidden');
    let advice = "";
    let tags = [];

    if (answers.pattern === 'rest-bridge') {
        advice = "Since you're bridging an existing API, focus on robust error handling for network timeouts. Agents hate ambiguous status codes.";
        tags = ["Resilience", "Mapping", "Caching"];
    } else if (answers.pattern === 'librarian') {
        advice = "RAG systems live or die by chunking quality. Use the resources capability to provide 'raw' document context alongside search tools.";
        tags = ["Context", "Retrieval", "Metadata"];
    } else if (answers.pattern === 'executor') {
        advice = "Side-effect heavy tools should always support a 'preview' or 'dry-run' parameter to let the LLM check its intent before commitment.";
        tags = ["Safety", "Audit Trail", "Dry-Run"];
    } else {
        advice = "Stateless logic is the easiest to scale. Keep your functions pure and use Zod to strictly validate all incoming parameters.";
        tags = ["Purity", "Validation", "Speed"];
    }

    adviceText.textContent = advice;
    adviceTags.innerHTML = tags.map(t => `<span class="px-2 py-1 rounded-md bg-blue-500/20 text-[10px] text-blue-300 font-bold border border-blue-500/30">${t}</span>`).join('');
}

function renderMagicBash(files) {
    let script = "#!/bin/bash\n# MCP Project Scaffolder\n\n";
    script += `mkdir -p mcp-server\ncd mcp-server\n\n`;

    Object.entries(files).forEach(([filename, content]) => {
        const dir = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : '';
        if (dir) script += `mkdir -p "${dir}"\n`;

        // Use a safe heredoc for cat
        script += `cat << 'EOF' > "${filename}"\n${content}\nEOF\n\n`;
    });

    magicBashCode.textContent = script;
}

async function renderDiagram(answers) {
    const isStateful = answers.stateModel === 'stateful';
    const hasTools = answers.mcpType !== 'data-only';
    const hasResources = answers.mcpType !== 'action-only';

    let code = `graph TD
    Client[Claude Desktop/Agent] -->|stdio/SSE| Server[MCP Server Entry]
    Server --> Core[Core Context]
    ${isStateful ? 'Core --> State[State Layer]' : ''}
    ${hasTools ? 'Core --> Tools[Tools Folder]' : ''}
    ${hasResources ? 'Core --> Res[Resources Folder]' : ''}
    ${hasTools ? 'Tools --> Domain[Domain Logic]' : ''}
    ${hasResources ? 'Res --> Data[Data Source]' : ''}
    
    classDef main fill:#3b82f6,stroke:#fff,color:#fff;
    classDef data fill:#10b981,stroke:#fff,color:#fff;
    class Server,Core main;
    class Tools,Res,Data data;`;

    if (!window.mermaid) {
        console.warn('Mermaid.js not yet loaded, skipping diagram rendering');
        return;
    }

    try {
        const { svg } = await window.mermaid.render('mermaid-svg', code);
        if (mermaidDiagram) mermaidDiagram.innerHTML = svg;
    } catch (e) {
        console.error('Mermaid rendering failed:', e);
    }
}

function buildTreeStructure(lang, type, size) {
    const isTS = lang === 'typescript';
    const projName = projectNameInput.value.trim() || 'mcp-server';
    const root = `${projName}/`;
    let lines = [root];

    lines.push('├─ .cursorrules');
    lines.push('├─ .devcontainer/');
    lines.push('│  └─ devcontainer.json');


    if (isTS) {
        lines.push('├─ src/');
        lines.push('│  ├─ core/');
        if (state.answers.stateModel === 'stateful') lines.push('│  │  ├─ state/');
        lines.push('│  │  └─ context.ts');
        if (type !== 'action-only') lines.push('│  ├─ resources/');
        if (type !== 'data-only') lines.push('│  ├─ tools/');
        lines.push('│  └─ server.ts');
        lines.push('├─ package.json');
        lines.push('├─ tsconfig.json');
    } else {
        // Python
        lines.push('├─ app/');
        lines.push('│  ├─ core/');
        lines.push('│  │  └─ config.py');
        if (type !== 'action-only') lines.push('│  ├─ resources.py');
        if (type !== 'data-only') lines.push('│  ├─ tools.py');
        lines.push('│  └─ main.py');
        lines.push('├─ Dockerfile');
        lines.push('├─ requirements.txt');
    }

    lines.push('├─ MCP_RULES.md');
    lines.push('└─ README.md');

    return lines.join('\n');
}

function buildFileTemplates(lang, answers) {
    const isTS = lang === 'typescript';
    const files = {};

    // MCP_RULES.md (Critical)
    files['MCP_RULES.md'] = generateRulesDoc(answers);

    // README.md
    files['README.md'] = generateReadme(answers);

    // Infrastructure & Ops
    files['Dockerfile'] = generateDockerfile(lang);
    files['.env.example'] = generateEnv(answers);
    files['mcp-config.json'] = generateClaudeConfig(answers);
    files['.cursorrules'] = generateCursorRules(answers);
    files['.devcontainer/devcontainer.json'] = JSON.stringify({
        name: answers.name,
        build: { dockerfile: "../Dockerfile" },
        customizations: {
            vscode: {
                extensions: [
                    isTS ? "dbaeumer.vscode-eslint" : "ms-python.python",
                    "esbenp.prettier-vscode"
                ]
            }
        }
    }, null, 2);


    if (isTS) {
        files['package.json'] = generatePackageJson(answers);
        files['tsconfig.json'] = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}`;
        files['src/server.ts'] = `/**
 * MCP Server Entry Point
 * Patterns: ${answers.pattern}
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "mcp-server",
  version: "1.0.0",
}, {
  capabilities: {
    ${answers.mcpType !== 'action-only' ? 'resources: {},' : ''}
    ${answers.mcpType !== 'data-only' ? 'tools: {},' : ''}
    prompts: {},
  },
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});`;

        if (answers.mcpType !== 'data-only') {
            files['src/tools/example.ts'] = generateToolTemplate(answers);
        }
    } else {
        // Python Templates
        files['app/main.py'] = `\"\"\"
MCP Server Entry Point (Python)
Pattern: ${answers.pattern}
\"\"\"
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My Server")

${answers.mcpType !== 'data-only' ? `
@mcp.tool()
def example_tool(name: str) -> str:
    \"\"\"Example tool description for ${answers.consumer}.\"\"\"
    return f"Hello {name}"
` : ''}

if __name__ == "__main__":
    mcp.run()`;
        files['requirements.txt'] = `mcp>=0.1.0\nfastapi\nuvicorn\n${answers.pattern === 'rest-bridge' ? 'httpx' : ''}`;
    }

    return files;
}

function generateDockerfile(lang) {
    if (lang === 'typescript') {
        return `FROM node:20-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nENTRYPOINT ["node", "dist/server.js"]`;
    }
    return `FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nENTRYPOINT ["python", "app/main.py"]`;
}

function generateEnv(answers) {
    let env = "# Configuration\nLOG_LEVEL=info\n";
    if (answers.pattern === 'rest-bridge') env += "API_BASE_URL=https://api.example.com\nAPI_KEY=your_key_here\n";
    if (answers.stateModel === 'stateful') env += "DATABASE_URL=sqlite:///./mcp.db\n";
    return env;
}

function generateClaudeConfig(answers) {
    const config = {
        "mcpServers": {
            "custom-mcp": {
                "command": answers.language === 'typescript' ? "node" : "python",
                "args": [answers.language === 'typescript' ? "/path/to/server/dist/server.js" : "/path/to/server/app/main.py"],
                "env": {
                    "API_KEY": "..."
                }
            }
        }
    };
    return JSON.stringify(config, null, 2);
}

function generatePackageJson(answers) {
    return JSON.stringify({
        name: answers.name.toLowerCase().replace(/\s+/g, '-'),
        author: answers.author,
        version: "1.0.0",

        type: "module",
        scripts: {
            build: "tsc",
            dev: "tsc --watch",
            start: "node dist/server.js"
        },
        dependencies: {
            "@modelcontextprotocol/sdk": "^0.6.0",
            "zod": "^3.23.0"
        },
        devDependencies: {
            "typescript": "^5.4.0",
            "@types/node": "^20.12.0"
        }
    }, null, 2);
}

function generateToolTemplate(answers) {
    return `import { z } from "zod";

/**
 * Pattern: ${answers.pattern}
 */
export const Schema = z.object({
  query: z.string().describe("What to look for")
});

export async function execute(args: z.infer<typeof Schema>) {
  ${answers.pattern === 'rest-bridge' ? '// Call fetch() here' : '// Logic here'}
  return { result: "Done" };
}`;
}

function generateCursorRules(answers) {
    return `/**
 * Cursor Rules for ${answers.name}
 */
// MCP Development Context
// 1. Always check types in src/core/context.ts
// 2. New tools must be registered in server.ts
// 3. Documentation must follow MCP_RULES.md
// 4. This is a ${answers.pattern} architecture.

// Preferred Patterns
${answers.language === 'typescript' ? '- Use Zod for all inputs\n- Prefer functional components' : '- Use Pydantic for validation\n- Use FastMCP decorators'}
`;
}

function generateRulesDoc(answers) {
    return `# MCP Architecture Rules: ${answers.name}
By ${answers.author}

## Core Principles
1. **Contract First**: Tools and resources are public contracts. Do not break schemas.
2. **Separation of Concerns**: Glue code (MCP handlers) must be separate from domain logic.
3. **No Hidden State**: ${answers.stateModel === 'stateless' ? 'The server is STATELESS. All context must be passed in the request.' : 'State is explicitly managed in the /core/state/ layer.'}
4. **Agent UX**: ${answers.consumer === 'agent' ? 'Responses must be structured for programmatic consumption. Avoid conversational filler in tools.' : 'Responses should be readable for human developers.'}

## Tooling Rules
- Tools must include Zod/JSONSchema validation.
- Tools must NEVER hide side effects. ${answers.sideEffects === 'none' ? 'This server is read-only.' : 'Side effects must be logged and controlled.'}
- If a tool takes more than 5 seconds, it must be decomposed.

## Resource Rules
- Resources are for DATA, not actions.
- Resources must be READ-ONLY by default.
`;
}


function generateReadme(answers) {
    return `# ${answers.name}

Generated by LiDa MCP Blueprint Generator for ${answers.language}.

## Objective
This MCP server is designed for a **${answers.mcpType}** use case, serving **${answers.consumer}**.

## Architectural Decisions
- **Hierarchy**: Optimized for a **${answers.expectedSize}** project size.
- **State**: ${answers.stateModel.toUpperCase()} architecture.
- **Strictness**: High. All tools must follow the patterns in \`MCP_RULES.md\`.

## Getting Started
1. Install dependencies: \`${answers.language === 'typescript' ? 'npm install' : 'pip install -r requirements.txt'}\`
2. Run development: \`${answers.language === 'typescript' ? 'npm run dev' : 'python app/main.py'}\`

## Adding a new tool
1. Define the schema in \`${answers.language === 'typescript' ? 'tools/your-tool.ts' : 'app/tools.py'}\`.
2. Implement validation.
3. Register in the server entry point.
`;
}

function renderTabs() {
    fileTabs.innerHTML = '';
    const filenames = Object.keys(generatedFiles);

    filenames.forEach((filename, index) => {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 text-xs font-bold rounded-lg border border-white/10 transition-all whitespace-nowrap ${index === 0 ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 text-muted hover:text-white'}`;
        btn.textContent = filename;
        btn.onclick = () => selectFile(filename, btn);
        fileTabs.appendChild(btn);

        if (index === 0) selectFile(filename, btn);
    });
}

function selectFile(filename, btn) {
    currentFile = filename;
    document.querySelectorAll('#fileTabs button').forEach(b => {
        b.className = 'px-4 py-2 text-xs font-bold rounded-lg border border-white/10 transition-all whitespace-nowrap bg-white/5 text-muted hover:text-white';
    });
    btn.className = 'px-4 py-2 text-xs font-bold rounded-lg border border-blue-500/50 transition-all whitespace-nowrap bg-blue-500/20 text-blue-300';

    fileContent.textContent = generatedFiles[filename];
    fileContent.className = filename.endsWith('.ts') ? 'language-typescript' : (filename.endsWith('.py') ? 'language-python' : 'language-markdown');
    hljs.highlightElement(fileContent);
}

function copyToClipboard() {
    if (!currentFile) return;
    navigator.clipboard.writeText(generatedFiles[currentFile]).then(() => {
        showToast(`Copied ${currentFile} to clipboard`, "success");
    });
}


/**
 * ZIP Export Feature
 */
async function downloadAsZip() {
    if (!window.JSZip) {
        alert("JSZip not loaded yet. Please try again in a moment.");
        return;
    }

    const zip = new JSZip();
    const projectFolder = zip.folder("mcp-server");

    // Add all generated files to the zip
    Object.entries(generatedFiles).forEach(([filename, content]) => {
        projectFolder.file(filename, content);
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mcp-server-blueprint-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // UI Feedback
        const original = downloadZipBtn.innerHTML;
        downloadZipBtn.innerHTML = "✅ Downloaded!";
        setTimeout(() => downloadZipBtn.innerHTML = original, 3000);
    } catch (err) {
        console.error("ZIP Generation Errors:", err);
        alert("Failed to generate ZIP. Check console for details.");
    }
}

/**
 * AI Intent Inference
 */
function handleAIInference() {
    const text = aiMagicInput.value.toLowerCase();
    if (!text.trim()) return;

    aiFeedback.style.opacity = '1';
    aiFeedback.textContent = "✨ Analyzing intent patterns...";

    setTimeout(() => {
        const recommendations = {
            language: text.match(/python|py|fastapi/) ? 'python' : (text.match(/typescript|ts|node|javascript|js/) ? 'typescript' : null),
            mcpType: text.match(/read-only|fetch|data|resource/) ? 'data-only' : (text.match(/action|write|post|tool|exec/) ? 'action-only' : (text.match(/hybrid|both/) ? 'hybrid' : null)),
            stateModel: text.match(/stateful|memory|remember|db|database/) ? 'stateful' : (text.match(/stateless|pure|lambda/) ? 'stateless' : null),
            pattern: text.match(/bridge|api|rest|graphql/) ? 'rest-bridge' : (text.match(/rag|search|docs|retrieval|context|librarian/) ? 'librarian' : (text.match(/exec|task|job|loop/) ? 'executor' : (text.match(/logic|pure|math/) ? 'pure-logic' : null))),
            consumer: text.match(/agent|autonomous|programmatic/) ? 'agent' : (text.match(/human|chat|developer/) ? 'human' : null),
            expectedSize: text.match(/large|enterprise|complex|ddd/) ? 'large' : (text.match(/small|mvp|tiny/) ? 'small' : (text.match(/medium|standard/) ? 'medium' : null))
        };

        // UI Feedback: Show badges
        document.querySelectorAll('.ai-pick-badge').forEach(b => b.remove());

        let foundAny = false;
        Object.entries(recommendations).forEach(([section, value]) => {
            if (!value) return;
            foundAny = true;

            const card = document.querySelector(`.option-card[data-value="${value}"]`);
            if (card) {
                const badge = document.createElement('div');
                badge.className = 'ai-pick-badge';
                badge.innerHTML = '<span>✨</span> AI Pick';
                card.appendChild(badge);

                // Auto-select and move to that step? No, let user confirm, but maybe auto-select
                const step = card.closest('.step-card').dataset.step;
                selectOption(parseInt(step), value, card);
            }
        });

        aiFeedback.textContent = foundAny ? "✨ Configuration optimized for your intent!" : "✨ Hint: Specify language (Python/TS) or pattern (RAG/API).";
        setTimeout(() => aiFeedback.style.opacity = '0', 3000);
    }, 800);
}

document.addEventListener('DOMContentLoaded', init);

function renderChoiceSummary() {
    choiceSummary.innerHTML = '';
    choiceSummary.classList.remove('hidden');

    Object.entries(state.answers).forEach(([key, value]) => {
        if (!value) return;
        const tag = document.createElement('div');
        tag.className = 'px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2';
        tag.innerHTML = `<span class="opacity-50">${key.toLowerCase()}:</span> <span class="text-blue-400">${value}</span>`;
        choiceSummary.appendChild(tag);
    });
}


