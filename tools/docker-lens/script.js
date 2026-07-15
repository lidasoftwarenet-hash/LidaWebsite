document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const modeDockerfileBtn = document.getElementById('mode-dockerfile');
    const modeComposeBtn = document.getElementById('mode-compose');
    const editor = document.getElementById('dl-editor');
    const editorContainer = document.querySelector('.dl-editor-container');
    const btnLoadExample = document.getElementById('btn-load-example');
    const btnClear = document.getElementById('btn-clear');
    const btnValidate = document.getElementById('btn-validate');
    const fileUpload = document.getElementById('file-upload');
    const uploadLabel = document.querySelector('.dl-file-upload');
    
    const countErrors = document.getElementById('count-errors');
    const countWarnings = document.getElementById('count-warnings');
    const countSuggestions = document.getElementById('count-suggestions');

    const tabGroupDf = document.getElementById('tab-group-dockerfile');
    const tabGroupComp = document.getElementById('tab-group-compose');
    const tabDfIssues = document.getElementById('tab-df-issues');
    const tabDfStages = document.getElementById('tab-df-stages');
    const tabDfRecs = document.getElementById('tab-df-recs');
    const tabDfImproved = document.getElementById('tab-df-improved');
    const tabCompIssues = document.getElementById('tab-comp-issues');
    const tabCompArch = document.getElementById('tab-comp-arch');
    const tabCompImproved = document.getElementById('tab-comp-improved');
    const tabDfExpert = document.getElementById('tab-df-expert');
    const tabCompExpert = document.getElementById('tab-comp-expert');

    const viewIssues = document.getElementById('dl-issues-view');
    const viewStages = document.getElementById('dl-stages-view');
    const viewRecs = document.getElementById('dl-recs-view');
    const viewArch = document.getElementById('dl-arch-view');
    const viewImproved = document.getElementById('dl-improved-view');
    const viewExpert = document.getElementById('dl-expert-view');
    const expertLoading = document.getElementById('expert-loading');
    const expertContent = document.getElementById('expert-content');
    
    const stagesContainer = document.getElementById('stages-container');
    const btnStagesExpand = document.getElementById('btn-stages-expand');
    const btnStagesCollapse = document.getElementById('btn-stages-collapse');

    const issuesCounters = document.getElementById('issues-counters');
    const archControls = document.getElementById('arch-controls');

    const cyContainer = document.getElementById('cy');
    const detailPanel = document.getElementById('dl-service-details');
    const detailTitle = document.getElementById('detail-title');
    const detailContent = document.getElementById('detail-content');
    const btnCloseDetails = document.getElementById('btn-close-details');

    const btnExportPng = document.getElementById('btn-export-png');
    const btnExportSvg = document.getElementById('btn-export-svg');
    const btnExportMermaid = document.getElementById('btn-export-mermaid');

    const archZoomIn = document.getElementById('arch-zoom-in');
    const archZoomOut = document.getElementById('arch-zoom-out');
    const archFit = document.getElementById('arch-fit');
    const archReset = document.getElementById('arch-reset');

    const toggleDeps = document.getElementById('toggle-deps');
    const toggleNets = document.getElementById('toggle-nets');
    const toggleVols = document.getElementById('toggle-vols');

    const importErrorBox = document.getElementById('dl-import-error');
    const importErrorMsg = document.getElementById('dl-import-error-msg');
    const btnCloseError = document.getElementById('btn-close-error');

    // Improved View Elements
    const improvedPreValidate = document.getElementById('improved-pre-validate');
    const improvedNoChanges = document.getElementById('improved-no-changes');
    const improvedContent = document.getElementById('improved-content');
    const btnSelectSafe = document.getElementById('btn-select-safe');
    const btnSelectAll = document.getElementById('btn-select-all');
    const btnClearSelection = document.getElementById('btn-clear-selection');
    const btnCopyImproved = document.getElementById('btn-copy-improved');

    // X-Ray controls
    const btnViewArch = document.getElementById('view-arch');
    const btnViewSecurity = document.getElementById('view-security');
    const btnViewFailure = document.getElementById('view-failure');
    const archSummary = document.getElementById('arch-summary');
    const xrayLegend = document.getElementById('xray-legend');
    
    let archViewMode = 'architecture'; // 'architecture', 'security', 'failure'
    let selectedFailureService = null;
    let archSecurityFindings = {};
    let archDependencies = { direct: {}, inverse: {} };
    let archInferredDependencies = { direct: {}, inverse: {} };

    const btnDownloadImproved = document.getElementById('btn-download-improved');
    const btnResetImproved = document.getElementById('btn-reset-improved');
    const improvedSummaryText = document.getElementById('improved-summary-text');
    const improvedRulesList = document.getElementById('improved-rules-list');
    const improvedOriginalEditor = document.getElementById('improved-original-editor');
    const improvedSuggestedEditor = document.getElementById('improved-suggested-editor');
    const suggestedHighlights = document.getElementById('suggested-highlights');
    const improvedValidationStatus = document.getElementById('improved-validation-status');

    // --- State ---
    let generatedChanges = [];
    let currentMode = 'dockerfile'; // 'dockerfile' or 'compose'
    let currentDoc = null; // Parsed YAML object
    let currentParsedDf = null; // Parsed Dockerfile object
    let cy = null; // Cytoscape instance
    let currentMermaidCode = '';
    let savedDockerfileContent = '';
    let savedComposeContent = '';

    // Register cytoscape-svg if available
    if (typeof cytoscapeSvg !== 'undefined' && typeof cytoscape !== 'undefined') {
        cytoscape.use(cytoscapeSvg);
    }

    // --- Editor Auto-Resize ---
    function resizeEditor() {
        editor.style.height = 'auto';
        editor.style.height = editor.scrollHeight + 'px';
    }
    editor.addEventListener('input', resizeEditor);

    // --- Examples ---
    const examples = {
        dockerfile: `FROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nENV API_KEY=secret_token_1234\n# Avoid broad copy if possible\nCOPY --from=builder /app/dist /usr/share/nginx/html\nRUN apt-get update\nRUN apt-get install -y curl\n\nHEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1\nUSER root\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`,
        compose: `version: '3.8'\n\nservices:\n  web:\n    image: node:latest\n    ports:\n      - "8080:8080"\n    environment:\n      - DB_PASSWORD=secret123\n    depends_on:\n      - db\n      - cache\n    networks:\n      - frontend\n      - backend\n\n  db:\n    image: postgres:14\n    ports:\n      - "5432:5432"\n    volumes:\n      - db_data:/var/lib/postgresql/data\n      - /var/run/docker.sock:/var/run/docker.sock\n    networks:\n      - backend\n\n  cache:\n    image: redis:alpine\n    networks:\n      - backend\n\n  api:\n    build: ./api\n    privileged: true\n    network_mode: host\n    depends_on:\n      - web\n\nvolumes:\n  db_data:\n\nnetworks:\n  frontend:\n  backend:`
    };

    const validInstructions = ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];

    // --- Event Listeners ---
    modeDockerfileBtn.addEventListener('click', () => switchMode('dockerfile'));
    modeComposeBtn.addEventListener('click', () => switchMode('compose'));
    btnLoadExample.addEventListener('click', () => { 
        clearImportError();
        editor.value = examples[currentMode]; 
        resizeEditor();
    });
    let clearConfirm = false;
    btnClear.addEventListener('click', () => { 
        if (editor.value.trim() !== '') {
            if (!clearConfirm) {
                clearConfirm = true;
                const orig = btnClear.textContent;
                btnClear.textContent = 'Sure?';
                btnClear.style.color = '#f87171';
                setTimeout(() => {
                    clearConfirm = false;
                    btnClear.textContent = orig;
                    btnClear.style.color = '';
                }, 3000);
                return;
            }
        }
        clearConfirm = false;
        btnClear.textContent = 'Clear';
        btnClear.style.color = '';
        editor.value = ''; 
        resizeEditor();
        renderEmptyState(); 
    });
    btnValidate.addEventListener('click', validate);
    fileUpload.addEventListener('change', handleFileUpload);
    
    if (btnCloseError) {
        btnCloseError.addEventListener('click', clearImportError);
    }

    // Progressive enhancement: File System Access API
    uploadLabel.addEventListener('click', async (e) => {
        if (currentMode === 'compose' && window.showOpenFilePicker) {
            e.preventDefault(); // Stop native <input type="file">
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    multiple: false,
                    excludeAcceptAllOption: true,
                    types: [{
                        description: 'Docker Compose YAML',
                        accept: {
                            'application/x-yaml': ['.yml', '.yaml']
                        }
                    }]
                });
                const file = await fileHandle.getFile();
                processFile(file);
            } catch (err) {
                if (err && err.name === 'AbortError') {
                    return; // User cancelled, do nothing
                }
                rejectImportedFile('The file picker could not open. Please try again.');
            }
        }
    });

    // Drag and Drop support
    editorContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        editorContainer.style.border = '2px dashed #3b82f6';
    });
    editorContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        editorContainer.style.border = 'none';
    });
    editorContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        editorContainer.style.border = 'none';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    tabDfIssues.addEventListener('click', () => switchTab('df-issues'));
    tabDfStages.addEventListener('click', () => switchTab('df-stages'));
    tabDfRecs.addEventListener('click', () => switchTab('df-recs'));
        tabDfImproved.addEventListener('click', () => switchTab('df-improved'));
    tabDfExpert.addEventListener('click', () => switchTab('df-expert'));
    tabCompExpert.addEventListener('click', () => switchTab('comp-expert'));
    tabCompIssues.addEventListener('click', () => switchTab('comp-issues'));
    tabCompArch.addEventListener('click', () => switchTab('comp-arch'));
    tabCompImproved.addEventListener('click', () => switchTab('comp-improved'));

    const issuesFilters = document.getElementById('issues-filters');
    if (issuesFilters) {
        issuesFilters.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.hasAttribute('data-filter')) {
                const buttons = issuesFilters.querySelectorAll('button');
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.getAttribute('data-filter');
                const issuesList = document.getElementById('issues-list') || viewIssues;
                const items = issuesList.querySelectorAll('.dl-issue');
                items.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else if (item.getAttribute('data-category') === filter || item.getAttribute('data-severity') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    // Improved view events
    btnSelectSafe.addEventListener('click', () => {
        generatedChanges.forEach(c => c.enabled = c.confidence === 'Safe');
        renderImprovedView(false);
    });
    btnSelectAll.addEventListener('click', () => {
        generatedChanges.forEach(c => c.enabled = true);
        renderImprovedView(false);
    });
    btnClearSelection.addEventListener('click', () => {
        generatedChanges.forEach(c => c.enabled = false);
        renderImprovedView(false);
    });
    btnCopyImproved.addEventListener('click', () => {
        if (btnCopyImproved.disabled) return;
        navigator.clipboard.writeText(improvedSuggestedEditor.value).then(() => {
            const originalText = btnCopyImproved.textContent;
            btnCopyImproved.textContent = 'Copied!';
            setTimeout(() => btnCopyImproved.textContent = originalText, 2000);
        });
    });
    btnDownloadImproved.addEventListener('click', () => {
        if (btnDownloadImproved.disabled) return;
        const text = improvedSuggestedEditor.value;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        let filename = 'improved';
        if (currentMode === 'dockerfile') {
            const uploadedName = fileUpload && fileUpload.files[0] ? fileUpload.files[0].name.replace(/[^a-zA-Z0-9.\-_]/g, '') : 'Dockerfile';
            filename = uploadedName.endsWith('.improved') ? uploadedName : uploadedName + '.improved';
        } else {
            filename = 'compose.improved.yaml';
        }
        downloadURI(url, filename);
        URL.revokeObjectURL(url);
    });
    btnResetImproved.addEventListener('click', () => {
        generateImprovements();
    });
    improvedRulesList.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            if (!isNaN(index)) {
                generatedChanges[index].enabled = e.target.checked;
                updateDiffView();
            }
        }
    });
    improvedSuggestedEditor.addEventListener('scroll', () => {
        suggestedHighlights.scrollTop = improvedSuggestedEditor.scrollTop;
        suggestedHighlights.scrollLeft = improvedSuggestedEditor.scrollLeft;
    });
    improvedSuggestedEditor.addEventListener('input', () => {
        const origLines = editor.value.split('\n');
        const suggLines = improvedSuggestedEditor.value.split('\n');
        const diffs = simpleDiff(origLines, suggLines);
        let hlHtml = '';
        diffs.forEach(d => {
            if (d.type === 'equal') {
                hlHtml += `<div>${escapeHtml(d.value) || ' '}</div>`;
            } else if (d.type === 'add') {
                hlHtml += `<div style="background:rgba(52,211,153,0.2); border-radius:2px;">${escapeHtml(d.value) || ' '}</div>`;
            }
        });
        suggestedHighlights.innerHTML = hlHtml;
    });

    btnStagesExpand.addEventListener('click', () => toggleAllStages(true));
    btnStagesCollapse.addEventListener('click', () => toggleAllStages(false));

    btnCloseDetails.addEventListener('click', () => detailPanel.style.display = 'none');

    // Architecture Controls
    archZoomIn.addEventListener('click', () => { if(cy) cy.zoom(cy.zoom() * 1.2); });
    archZoomOut.addEventListener('click', () => { if(cy) cy.zoom(cy.zoom() * 0.8); });
    archFit.addEventListener('click', () => { if(cy) cy.fit(); });
    archReset.addEventListener('click', () => { 
        if(cy) {
            cy.layout({ name: 'cose', padding: 30, animate: true }).run();
        } 
    });

    toggleDeps.addEventListener('change', updateVisibility);
    toggleNets.addEventListener('change', updateVisibility);
    toggleVols.addEventListener('change', updateVisibility);

    btnExportPng.addEventListener('click', () => {
        if (!cy) return;
        const png64 = cy.png({ bg: '#0f172a', full: true });
        downloadURI(png64, 'docker-architecture.png');
    });
    btnExportSvg.addEventListener('click', () => {
        if (!cy || !cy.svg) {
            showError('SVG export is not fully loaded.');
            return;
        }
        const svgContent = cy.svg({ scale: 1, full: true });
        const blob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        downloadURI(url, 'docker-architecture.svg');
        URL.revokeObjectURL(url);
    });
    btnExportMermaid.addEventListener('click', () => {
        navigator.clipboard.writeText(currentMermaidCode).then(() => {
            const originalText = btnExportMermaid.textContent;
            btnExportMermaid.textContent = 'Copied!';
            setTimeout(() => btnExportMermaid.textContent = originalText, 2000);
        });
    });

    // Delegated event for copying snippets
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('dl-copy-btn')) {
            const snippet = e.target.getAttribute('data-snippet');
            if (snippet) {
                navigator.clipboard.writeText(snippet).then(() => {
                    const og = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    setTimeout(() => e.target.textContent = og, 2000);
                });
            }
        }
    });

    // --- Utilities ---
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showError(msg) {
        let toast = document.getElementById('dl-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dl-toast';
            toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#ef4444; color:#fff; padding:12px 20px; border-radius:6px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition: opacity 0.3s; font-family: Inter, sans-serif; max-width: 400px; line-height: 1.5;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 4000);
    }
    
    function clearImportError() {
        if (importErrorBox) {
            importErrorBox.style.display = 'none';
            if (importErrorMsg) importErrorMsg.textContent = '';
        }
    }

    function rejectImportedFile(msg) {
        if (importErrorBox && importErrorMsg) {
            importErrorMsg.textContent = msg;
            importErrorBox.style.display = 'flex';
        }
        showError(msg);
        if (fileUpload) {
            fileUpload.value = '';
        }
        return false;
    }

    // --- File Validation ---
    function validateFile(file) {
        if (!file) return { valid: false, msg: 'No file selected.' };
        if (file.name.length > 255) return { valid: false, msg: 'Filename is too long.' };
        if (file.size > 1024 * 1024) return { valid: false, msg: 'The selected file is too large. Maximum size: 1 MB.' };
        
        const badExts = ['.exe', '.js', '.html', '.svg', '.php', '.zip', '.sh', '.bat', '.cmd', '.png', '.jpg', '.jpeg', '.gif', '.mp3', '.mp4', '.pdf', '.wav', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.txt', '.rtf'];
        const lowerName = file.name.toLowerCase();
        
        if (badExts.some(ext => lowerName.endsWith(ext))) {
            const isCompose = currentMode === 'compose';
            return { valid: false, msg: isCompose ? 'Unsupported file type. Choose a Docker Compose YAML file.' : 'Unsupported file type. Choose a Dockerfile.' };
        }
        
        return { valid: true };
    }

    function validateFileContent(text, mode) {
        if (text.includes('\x00')) {
            return { valid: false, msg: 'The selected file appears to contain binary or unsupported content.' };
        }
        
        const trimmed = text.trim();
        if (trimmed.startsWith('<html') || trimmed.startsWith('<?xml') || trimmed.startsWith('{') || trimmed.startsWith('<!DOCTYPE')) {
            return { valid: false, msg: 'The selected file appears to contain binary or unsupported content.' };
        }

        if (mode === 'dockerfile') {
            const lines = text.split('\n').map(l => l.trim().toUpperCase());
            const hasInstruction = lines.some(l => validInstructions.some(inst => l.startsWith(inst + ' ') || l === inst));
            if (!hasInstruction) {
                 return { valid: false, msg: 'The selected file does not appear to be a valid Dockerfile.' };
            }
        } else {
            try {
                const doc = jsyaml.load(text);
                if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { valid: false, msg: 'This YAML file is valid, but it is not a Docker Compose configuration.' };
                if (!doc.services || typeof doc.services !== 'object' || Object.keys(doc.services).length === 0) {
                     return { valid: false, msg: 'This YAML file is valid, but it is not a Docker Compose configuration.' };
                }
            } catch (e) {
                return { valid: false, msg: 'Invalid YAML format.' };
            }
        }
        return { valid: true };
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        processFile(file);
        // Do not clear the fileUpload.value here manually, it is handled centrally by rejectImportedFile or after success.
    }

    function processFile(file) {
        if (!file) return;

        const nameCheck = validateFile(file);
        if (!nameCheck.valid) {
            return rejectImportedFile(nameCheck.msg);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            
            // Auto-detect mode based on content
            const lines = text.split('\n').map(l => l.trim().toUpperCase());
            const hasDockerfileInstruction = lines.some(l => validInstructions.some(inst => l.startsWith(inst + ' ') || l === inst));
            const isYaml = text.includes('services:') || text.includes('version:');
            
            if (hasDockerfileInstruction && !isYaml) {
                if (currentMode !== 'dockerfile') switchMode('dockerfile');
            } else if (isYaml && !hasDockerfileInstruction) {
                if (currentMode !== 'compose') switchMode('compose');
            } else {
                // Fallback to filename heuristic
                const lowerName = file.name.toLowerCase();
                if (currentMode === 'dockerfile' && (lowerName.endsWith('.yml') || lowerName.endsWith('.yaml'))) {
                    switchMode('compose');
                } else if (currentMode === 'compose' && lowerName.includes('dockerfile')) {
                    switchMode('dockerfile');
                }
            }

            const contentCheck = validateFileContent(text, currentMode);
            if (!contentCheck.valid) {
                return rejectImportedFile(contentCheck.msg);
            }
            
            // Success
            if (fileUpload) fileUpload.value = '';
            clearImportError();
            editor.value = text;
            resizeEditor();
            validate();
        };
        reader.onerror = () => {
             return rejectImportedFile("Error reading file.");
        };
        reader.readAsText(file);
    }

    // --- Core UI Functions ---
    function switchMode(mode) {
        if (currentMode === mode) return;

        if (currentMode === 'dockerfile') {
            savedDockerfileContent = editor.value;
        } else {
            savedComposeContent = editor.value;
        }

        currentMode = mode;
        if (mode === 'dockerfile') {
            modeDockerfileBtn.classList.add('active');
            modeDockerfileBtn.setAttribute('aria-pressed', 'true');
            modeComposeBtn.classList.remove('active');
            modeComposeBtn.setAttribute('aria-pressed', 'false');
            editor.placeholder = "Paste your Dockerfile here...";
            tabGroupDf.style.display = 'flex';
            tabGroupComp.style.display = 'none';
            editor.value = savedDockerfileContent;
            resizeEditor();
            switchTab('df-issues');
        } else {
            modeComposeBtn.classList.add('active');
            modeComposeBtn.setAttribute('aria-pressed', 'true');
            modeDockerfileBtn.classList.remove('active');
            modeDockerfileBtn.setAttribute('aria-pressed', 'false');
            editor.placeholder = "Paste your docker-compose.yml here...";
            tabGroupDf.style.display = 'none';
            tabGroupComp.style.display = 'flex';
            editor.value = savedComposeContent;
            resizeEditor();
            switchTab('comp-issues');
        }
        renderEmptyState();
        clearImportError();
    }

    
    if (btnViewArch) {
        btnViewArch.addEventListener('click', () => setArchMode('architecture'));
        btnViewSecurity.addEventListener('click', () => setArchMode('security'));
        btnViewFailure.addEventListener('click', () => setArchMode('failure'));
    }

    function setArchMode(mode) {
        archViewMode = mode;
        [btnViewArch, btnViewSecurity, btnViewFailure].forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        if (mode === 'architecture') {
            btnViewArch.classList.add('active');
            btnViewArch.setAttribute('aria-pressed', 'true');
            xrayLegend.style.display = 'none';
            selectedFailureService = null;
        } else if (mode === 'security') {
            btnViewSecurity.classList.add('active');
            btnViewSecurity.setAttribute('aria-pressed', 'true');
            xrayLegend.style.display = 'flex';
            xrayLegend.innerHTML = `
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#ef4444;"></span> Critical Risk</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#f97316;"></span> High Risk</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#eab308;"></span> Medium Risk</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#3b82f6;"></span> No Risks</span>
            `;
            selectedFailureService = null;
        } else if (mode === 'failure') {
            btnViewFailure.classList.add('active');
            btnViewFailure.setAttribute('aria-pressed', 'true');
            xrayLegend.style.display = 'flex';
            xrayLegend.innerHTML = `
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#ef4444;"></span> Failed Service</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#f97316;"></span> Directly Affected</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#fbbf24;"></span> Indirectly Affected</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#3b82f6;"></span> Unaffected</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:24px; height:2px; background:repeating-linear-gradient(to right, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 8px);"></span> Inferred Relationship</span>
                <span style="margin-left:auto; font-style:italic;">Impact analysis is based on declared and inferred configuration relationships, not live runtime traffic.</span>
            `;
        }
        
        if (currentDoc) renderArchitecture(currentDoc);
    }

    function switchTab(tab) {
        [viewIssues, viewArch, viewStages, viewRecs, viewImproved, viewExpert].forEach(v => {
            if (v) v.style.display = 'none';
        });
        [tabDfIssues, tabDfStages, tabDfRecs, tabDfImproved, tabDfExpert, tabCompIssues, tabCompArch, tabCompImproved, tabCompExpert].forEach(t => {
            if (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            }
        });
        
        issuesCounters.style.display = 'none';
        if (archControls) archControls.style.display = 'none';

        if (tab === 'df-issues' || tab === 'comp-issues') {
            if (viewIssues) viewIssues.style.display = 'flex';
            if (issuesCounters) issuesCounters.style.display = 'flex';
            if (tab === 'df-issues' && tabDfIssues) {
                tabDfIssues.classList.add('active');
                tabDfIssues.setAttribute('aria-selected', 'true');
            }
            else if (tabCompIssues) {
                tabCompIssues.classList.add('active');
                tabCompIssues.setAttribute('aria-selected', 'true');
            }
        } else if (tab === 'comp-arch') {
            if (tabCompArch) {
                tabCompArch.classList.add('active');
                tabCompArch.setAttribute('aria-selected', 'true');
            }
            if (viewArch) viewArch.style.display = 'flex';
            if (archControls) archControls.style.display = 'flex';
            if (cy) { cy.resize(); cy.fit(); }
            else if (currentDoc && currentDoc.services) renderArchitecture(currentDoc);
            else if (document.getElementById('arch-empty-state')) document.getElementById('arch-empty-state').style.display = 'flex';
        } else if (tab === 'df-stages') {
            if (tabDfStages) {
                tabDfStages.classList.add('active');
                tabDfStages.setAttribute('aria-selected', 'true');
            }
            if (viewStages) viewStages.style.display = 'flex';
            if (currentParsedDf) renderBuildStages(currentParsedDf);
        } else if (tab === 'df-recs') {
            if (tabDfRecs) {
                tabDfRecs.classList.add('active');
                tabDfRecs.setAttribute('aria-selected', 'true');
            }
            if (viewRecs) viewRecs.style.display = 'flex';
            if (currentParsedDf) renderRecommendations(currentParsedDf);
        } else if (tab === 'df-improved') {
            if (tabDfImproved) {
                tabDfImproved.classList.add('active');
                tabDfImproved.setAttribute('aria-selected', 'true');
            }
            if (viewImproved) viewImproved.style.display = 'flex';
            if (currentParsedDf || editor.value.trim() !== '') renderImprovedView(false);
        } else if (tab === 'comp-improved') {
            if (tabCompImproved) {
                tabCompImproved.classList.add('active');
                tabCompImproved.setAttribute('aria-selected', 'true');
            }
            if (viewImproved) viewImproved.style.display = 'flex';
            if (currentDoc || editor.value.trim() !== '') renderImprovedView(false);
        } else if (tab === 'df-expert' || tab === 'comp-expert') {
            if (viewExpert) viewExpert.style.display = 'flex';
            if (tab === 'df-expert' && tabDfExpert) {
                tabDfExpert.classList.add('active');
                tabDfExpert.setAttribute('aria-selected', 'true');
            } else if (tabCompExpert) {
                tabCompExpert.classList.add('active');
                tabCompExpert.setAttribute('aria-selected', 'true');
            }
            
            // Reset loading spinner content in case it was replaced by a previous "validate first" message
            if (expertLoading) {
                expertLoading.innerHTML = `<div style="font-size:2rem; margin-bottom:12px; animation:spin 2s linear infinite;">⚙️</div><h3 style="color:#f8fafc; margin-bottom:8px;">Running local expert analysis...</h3><p style="color:#94a3b8; font-size:0.9rem;">Explainable rule-based analysis. No AI API. Your configuration stays in your browser.</p>`;
                expertLoading.style.display = 'flex';
            }
            if (expertContent) expertContent.style.display = 'none';
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    runExpertAnalysis(currentMode === 'compose' ? currentDoc : null, currentMode === 'dockerfile' ? currentParsedDf : null, currentMode);
                });
            });
        }
    }

    function downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function renderEmptyState() {
        currentDoc = null;
        currentParsedDf = null;
        generatedChanges = [];
        destroyCy();
        stagesContainer.innerHTML = `
            <div class="dl-empty-state">
                <span style="font-size: 3rem;">📦</span>
                <h3>No Stages</h3>
                <p>Validate a Dockerfile to visualize its build stages.</p>
            </div>
        `;
        viewRecs.innerHTML = `
            <div class="dl-empty-state">
                <span style="font-size: 3rem;">💡</span>
                <h3>No Recommendations</h3>
                <p>Optimization recommendations will appear after validation.</p>
            </div>
        `;
        // For Architecture, it is inside cyContainer, but when empty, we should show an empty state.
        // I will add a div for arch empty state when cy is not initialized.
        // Actually, cyContainer is hidden or cleared. Let's create an empty state div for it.
        // We'll handle Architecture empty state inside renderArchitecture or here if we assume it is blank.
        
        improvedPreValidate.querySelector('p').textContent = 'Validate your configuration to generate safe improvement suggestions.';
        improvedPreValidate.style.display = 'flex';
        improvedNoChanges.style.display = 'none';
        improvedContent.style.display = 'none';
        countErrors.textContent = '0';
        countWarnings.textContent = '0';
        countSuggestions.textContent = '0';
        
        // Hide filters on empty state
        const issuesFilters = document.getElementById('issues-filters');
        if (issuesFilters) issuesFilters.style.display = 'none';

        const issuesList = document.getElementById('issues-list') || viewIssues;
        issuesList.innerHTML = `
            <div class="dl-empty-state">
                <span style="font-size: 3rem;">🔍</span>
                <h3>Ready to validate</h3>
                <p>Validate your configuration to see syntax, security, and best-practice findings.</p>
            </div>
        `;
        
        // Ensure we are on issues tab when emptying
        if (currentMode === 'compose' && tabCompArch.classList.contains('active')) switchTab('comp-issues');
        if (currentMode === 'dockerfile' && !tabDfIssues.classList.contains('active')) switchTab('df-issues');
    }

    function validate() {
        if (btnValidate.disabled) return;
        
        // Reset expert view
        expertLoading.style.display = 'flex';
        expertContent.style.display = 'none';
        
        const text = editor.value.trim();

        if (!text) {
            renderEmptyState();
            return;
        }

        clearImportError();
        
        btnValidate.disabled = true;
        const origText = btnValidate.textContent;
        btnValidate.textContent = 'Validating...';

        setTimeout(() => {
            try {
                currentDoc = null;
                currentParsedDf = null;
                let issues = [];
                
                if (currentMode === 'dockerfile') {
                    const result = validateDockerfile(text);
                    issues = result.issues;
                    currentParsedDf = result.parsed;
                } else {
                    const result = validateCompose(text);
                    issues = result.issues;
                    if (result.doc && result.doc.services && typeof result.doc.services === 'object') {
                        currentDoc = result.doc;
                    }
                }

                renderIssues(issues);
                generateImprovements();
                
                // Re-render active tabs
                if (currentMode === 'compose' && tabCompArch.classList.contains('active')) {
                    if (currentDoc) renderArchitecture(currentDoc);
                    else destroyCy();
                } else if (currentMode === 'dockerfile') {
                    if (tabDfStages.classList.contains('active') && currentParsedDf) renderBuildStages(currentParsedDf);
                    if (tabDfRecs.classList.contains('active') && currentParsedDf) renderRecommendations(currentParsedDf);
                }
                
                if (tabDfImproved.classList.contains('active') || tabCompImproved.classList.contains('active')) {
                    renderImprovedView(false);
                }

                if (tabDfExpert.classList.contains('active') || tabCompExpert.classList.contains('active')) {
                    runExpertAnalysis(currentMode === 'compose' ? currentDoc : null, currentMode === 'dockerfile' ? currentParsedDf : null, currentMode);
                }
            } finally {
                btnValidate.disabled = false;
                btnValidate.textContent = origText;
            }
        }, 10);
    }

    function renderIssues(issues) {
        let errors = 0, warnings = 0, suggestions = 0, securityFindings = 0;

        issues.forEach(i => {
            if (i.severity === 'error') errors++;
            else if (i.severity === 'warning') warnings++;
            else if (i.severity === 'suggestion') suggestions++;

            if (i.category === 'Security') securityFindings++;
        });

        countErrors.textContent = errors;
        countWarnings.textContent = warnings;
        countSuggestions.textContent = suggestions;

        const issuesFilters = document.getElementById('issues-filters');
        if (issuesFilters) {
            issuesFilters.style.display = 'flex';
            const buttons = issuesFilters.querySelectorAll('button');
            buttons.forEach(b => b.classList.remove('active'));
            if (buttons.length > 0) buttons[0].classList.add('active'); // reset to all
        }

        let summaryText = `Validation completed with ${errors} error${errors !== 1 ? 's' : ''} and ${warnings} warning${warnings !== 1 ? 's' : ''}.`;
        if (errors === 0) {
            if (securityFindings > 0) summaryText = `No blocking syntax errors were found, but review the security recommendations.`;
            else summaryText = `No blocking syntax errors were found.`;
        }

        if (issues.length === 0) {
            const issuesList = document.getElementById('issues-list') || viewIssues;
            issuesList.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
                    <h3 style="margin-top:0; font-size:1.1rem; color: #f8fafc;">Validation Summary</h3>
                    <p style="margin:0; font-size: 0.9rem; color: #cbd5e1;">${summaryText}</p>
                </div>
                <div class="dl-success-state">
                    <span class="dl-icon">✅</span>
                    <h3>Looks Good!</h3>
                    <p>No configuration risks were found.</p>
                </div>
            `;
            return;
        }

        issues.sort((a, b) => {
            const sevOrder = { 'error': 0, 'warning': 1, 'suggestion': 2 };
            return sevOrder[a.severity] - sevOrder[b.severity];
        });

        const issuesList = document.getElementById('issues-list') || viewIssues;
        issuesList.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
                <h3 style="margin-top:0; font-size:1.1rem; color: #f8fafc;">Validation Summary</h3>
                <p style="margin:0; font-size: 0.9rem; color: #cbd5e1;">${summaryText}</p>
            </div>
            ${issues.map(issue => {
                const badgeClass = `dl-badge-${issue.severity}`;
                const issueClass = `dl-issue-${issue.severity}`;
                let lineHtml = issue.line ? `<span style="color:#94a3b8; font-size:0.8rem;">Line ${escapeHtml(issue.line.toString())}</span>` : '';
                return `
                    <div class="dl-issue ${issueClass}" data-severity="${escapeHtml(issue.severity)}" data-category="${escapeHtml(issue.category)}">
                        <div class="dl-issue-header">
                            <div class="dl-issue-meta">
                                <span class="dl-issue-badge ${badgeClass}">${escapeHtml(issue.severity)}</span>
                                <span style="color:#94a3b8; font-weight:600;">${escapeHtml(issue.category)}</span>
                            </div>
                            ${lineHtml}
                        </div>
                        <div class="dl-issue-title">${escapeHtml(issue.title)}</div>
                        <div class="dl-issue-desc">${escapeHtml(maskSecret(issue.description))}</div>
                        ${issue.fix ? `<div class="dl-issue-fix">${escapeHtml(maskSecret(issue.fix))}</div>` : ''}
                    </div>
                `;
            }).join('')}
        `;
    }

    // --- Dockerfile Parsing & Logic ---
    function parseDockerfile(text) {
        const lines = text.split('\n');
        const stages = [];
        let currentStage = null;
        let globalArgs = [];
        
        // Handle continuations
        const logicalLines = [];
        let currentLine = '';
        let startNum = 1;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.endsWith('\\')) {
                currentLine += line.slice(0, -1) + ' ';
            } else {
                currentLine += line;
                if (currentLine.trim() && !currentLine.trim().startsWith('#')) {
                    logicalLines.push({ text: currentLine.trim(), lineNum: startNum });
                }
                currentLine = '';
                startNum = i + 2;
            }
        }
        
        logicalLines.forEach(({ text, lineNum }) => {
            const parts = text.split(/\s+/);
            const instruction = parts[0].toUpperCase();
            const args = parts.slice(1).join(' ');
            
            if (instruction === 'ARG' && !currentStage) {
                globalArgs.push(args);
                return;
            }
            
            if (instruction === 'FROM') {
                const match = args.match(/^([^\s]+)(?:\s+AS\s+([^\s]+))?/i);
                const image = match ? match[1] : args;
                const alias = match && match[2] ? match[2] : `stage-${stages.length}`;
                
                currentStage = {
                    id: `stage-${stages.length}`,
                    alias: alias,
                    image: image,
                    instructions: [],
                    env: [],
                    arg: [],
                    expose: [],
                    user: 'root',
                    workdir: '/',
                    cmd: null,
                    entrypoint: null,
                    copiesFrom: []
                };
                stages.push(currentStage);
            }
            
            if (currentStage) {
                currentStage.instructions.push({ instruction, args, lineNum, raw: text });
                
                if (instruction === 'ENV') {
                     let maskedArgs = args;
                     if (args.toUpperCase().match(/(PASSWORD|SECRET|KEY|TOKEN)=/)) maskedArgs = args.replace(/=(.*)/, '=********');
                     currentStage.env.push(maskedArgs);
                }
                if (instruction === 'ARG') {
                     let maskedArgs = args;
                     if (args.toUpperCase().match(/(PASSWORD|SECRET|KEY|TOKEN)=/)) maskedArgs = args.replace(/=(.*)/, '=********');
                     currentStage.arg.push(maskedArgs);
                }
                if (instruction === 'EXPOSE') currentStage.expose.push(args);
                if (instruction === 'USER') currentStage.user = args;
                if (instruction === 'WORKDIR') currentStage.workdir = args;
                if (instruction === 'CMD') currentStage.cmd = args;
                if (instruction === 'ENTRYPOINT') currentStage.entrypoint = args;
                if (instruction === 'COPY') {
                    const fromMatch = args.match(/--from=([^\s]+)/);
                    if (fromMatch) currentStage.copiesFrom.push(fromMatch[1]);
                }
            }
        });
        
        return { stages, globalArgs };
    }

    function validateDockerfile(text) {
        const issues = [];
        const parsed = parseDockerfile(text);
        let hasFrom = false, hasUser = false, hasHealthcheck = false;

        parsed.stages.forEach(stage => {
            if (stage.image) hasFrom = true;
            if (stage.user && stage.user !== 'root') hasUser = true;
            
            stage.instructions.forEach(inst => {
                const { instruction, args, lineNum, raw } = inst;
                const trimmed = raw.trim();

                if (!validInstructions.includes(instruction)) {
                    issues.push({ severity: 'warning', category: 'Syntax', line: lineNum, title: `Unknown instruction: ${instruction}`, description: 'Not a recognized Dockerfile instruction.', fix: 'Check for typos.' });
                }

                if (instruction === 'FROM' && (args.includes(':latest') || !args.includes(':'))) {
                    issues.push({ severity: 'warning', category: 'Best Practice', line: lineNum, title: `Using 'latest' tag for base image`, description: `Image '${args}' uses latest or no tag.`, fix: 'Pin a specific version.' });
                }

                if (instruction === 'USER' && (args === 'root' || args === '0')) {
                    issues.push({ severity: 'warning', category: 'Security', line: lineNum, title: `Running as root`, description: 'Running as root is discouraged.', fix: 'Use a non-root user.' });
                }

                if ((instruction === 'ENV' || instruction === 'ARG') && (args.toUpperCase().includes('PASSWORD') || args.toUpperCase().includes('SECRET') || args.toUpperCase().includes('KEY') || args.toUpperCase().includes('TOKEN'))) {
                    issues.push({ severity: 'error', category: 'Security', line: lineNum, title: `Potential secret`, description: `Found sensitive keyword in '${args}'.`, fix: 'Use runtime secrets instead.' });
                }

                if (instruction === 'ADD' && !args.includes('.tar') && !args.includes('http://') && !args.includes('https://')) {
                    issues.push({ severity: 'suggestion', category: 'Best Practice', line: lineNum, title: `Use COPY instead of ADD`, description: 'COPY is preferred for local files.', fix: 'Change ADD to COPY.' });
                }

                if ((instruction === 'CMD' || instruction === 'ENTRYPOINT') && !trimmed.includes('[')) {
                    issues.push({ severity: 'suggestion', category: 'Best Practice', line: lineNum, title: `Using shell form`, description: `Breaks signal handling.`, fix: `Use exec form: ${instruction} ["cmd"]` });
                }

                if (instruction === 'RUN') {
                    if (args.includes('apt-get update') && !args.includes('apt-get install')) {
                        issues.push({ severity: 'warning', category: 'Best Practice', line: lineNum, title: `Separate apt-get update`, description: 'Can cause cache issues.', fix: 'Combine with apt-get install.' });
                    }
                    if (args.includes('apt-get install') && !args.includes('rm -rf /var/lib/apt/lists/*')) {
                        issues.push({ severity: 'warning', category: 'Optimization', line: lineNum, title: `Cache not cleaned`, description: 'Leaves unnecessary files.', fix: 'Append rm -rf /var/lib/apt/lists/*.' });
                    }
                    if (args.includes('npm install ') && !args.includes('@')) {
                        issues.push({ severity: 'suggestion', category: 'Reliability', line: lineNum, title: `Missing version pinning`, description: 'Unpredictable builds.', fix: 'Pin versions: npm install package@1.2.3' });
                    }
                }

                if (instruction === 'COPY' && (args === '. .' || args === '. /app')) {
                    issues.push({ severity: 'suggestion', category: 'Optimization', line: lineNum, title: `Broad COPY`, description: 'Might include secrets or modules.', fix: 'Use specific paths or .dockerignore.' });
                }

                if (instruction === 'HEALTHCHECK') hasHealthcheck = true;
            });
        });

        if (!hasFrom) issues.push({ severity: 'error', category: 'Syntax', title: `Missing FROM`, description: 'Must start with FROM.', fix: 'Add FROM image:tag.' });
        if (!hasUser && issues.length > 0) issues.push({ severity: 'warning', category: 'Security', title: `Missing USER`, description: 'Containers run as root by default.', fix: 'Add USER command.' });
        if (!hasHealthcheck && issues.length > 0) issues.push({ severity: 'suggestion', category: 'Reliability', title: `No HEALTHCHECK`, description: 'Docker cannot know if app is ready.', fix: 'Add HEALTHCHECK.' });

        return { issues, parsed };
    }

    // --- Build Stages View ---
    function renderBuildStages(parsedDf) {
        if (!parsedDf || parsedDf.stages.length === 0) {
            stagesContainer.innerHTML = '<div style="padding: 20px; color: #f87171;">No stages found to visualize.</div>';
            return;
        }

        let html = '';
        parsedDf.stages.forEach((stage, idx) => {
            const isFinal = idx === parsedDf.stages.length - 1;
            
            let instHtml = '';
            stage.instructions.forEach(inst => {
                instHtml += `
                    <div class="dl-instruction">
                        <span class="dl-inst-name">${escapeHtml(inst.instruction)}</span>
                        <span class="dl-inst-args">${escapeHtml(maskSecret(inst.args))}</span>
                    </div>
                `;
            });

            let depHtml = '';
            if (stage.copiesFrom.length > 0) {
                depHtml = `<div style="margin-top: 8px; font-size: 0.8rem; color: #fcd34d;">↳ Copies from: ${escapeHtml(stage.copiesFrom.join(', '))}</div>`;
            }

            html += `
                <div class="dl-stage-node">
                    <div class="dl-stage-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'flex' : 'none'">
                        <div class="dl-stage-title">
                            <span>📦 Stage ${idx + 1}: ${escapeHtml(stage.alias)}</span>
                            ${isFinal ? '<span class="dl-stage-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">FINAL</span>' : ''}
                        </div>
                        <div style="font-size: 0.85rem; color: #94a3b8;">${escapeHtml(stage.image)} • ${stage.instructions.length} steps</div>
                    </div>
                    <div class="dl-stage-body">
                        ${instHtml}
                        ${depHtml}
                    </div>
                </div>
            `;
        });

        stagesContainer.innerHTML = html;
    }

    function toggleAllStages(expand) {
        const bodies = stagesContainer.querySelectorAll('.dl-stage-body');
        bodies.forEach(b => b.style.display = expand ? 'flex' : 'none');
    }

    // --- Recommendations View ---
    function generateRecommendations(parsedDf) {
        const recs = [];
        if (!parsedDf || !parsedDf.stages) return recs;

        if (parsedDf.stages.length === 1 && parsedDf.stages[0].instructions.length > 5) {
            recs.push({
                title: 'Use multi-stage builds',
                category: 'Optimization',
                impact: 'High',
                explanation: 'Multi-stage builds allow you to compile your application in one stage and copy only the compiled artifacts to a smaller runtime stage, drastically reducing final image size.',
                example: `FROM node:18 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html`
            });
        }
        
        parsedDf.stages.forEach(stage => {
            if (stage.image.includes('latest') || !stage.image.includes(':')) {
                recs.push({
                    title: 'Pin image versions',
                    category: 'Reliability',
                    impact: 'High',
                    explanation: `Stage '${stage.alias}' uses '${stage.image}' which resolves to 'latest'. This can break your build if a new version introduces incompatible changes.`,
                    example: `FROM ${stage.image.replace(':latest', '')}:1.2.3`
                });
            }
            
            if (stage.user === 'root') {
                recs.push({
                    title: 'Run as a non-root user',
                    category: 'Security',
                    impact: 'High',
                    explanation: `Stage '${stage.alias}' runs as root. If a vulnerability is exploited, the attacker gains root privileges inside the container.`,
                    example: `RUN useradd -m myuser\nUSER myuser`
                });
            }
            
            const hasAptUpdate = stage.instructions.some(i => i.instruction === 'RUN' && i.args.includes('apt-get update'));
            if (hasAptUpdate) {
                const hasAptClean = stage.instructions.some(i => i.instruction === 'RUN' && i.args.includes('rm -rf /var/lib/apt/lists/*'));
                if (!hasAptClean) {
                    recs.push({
                        title: 'Clean package manager caches',
                        category: 'Optimization',
                        impact: 'Medium',
                        explanation: 'Package managers cache index files. Removing them after installation reduces image size.',
                        example: `RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*`
                    });
                }
            }
            
            if (stage.cmd && !stage.cmd.startsWith('[')) {
                 recs.push({
                    title: 'Prefer JSON-form CMD',
                    category: 'Reliability',
                    impact: 'Medium',
                    explanation: `Shell-form CMD ('${stage.cmd}') runs wrapped in 'sh -c', which does not pass Unix signals (like SIGTERM) to your app.`,
                    example: `CMD ["node", "server.js"]`
                });
            }
            
            const hasBroadCopy = stage.instructions.some(i => i.instruction === 'COPY' && (i.args === '. .' || i.args === '. /app'));
            if (hasBroadCopy) {
                 recs.push({
                    title: 'Avoid broad COPY . .',
                    category: 'Optimization',
                    impact: 'Low',
                    explanation: 'A broad COPY copies everything, including local secrets, tests, and build artifacts. Use .dockerignore or copy specific files.',
                    example: `COPY package.json .\nCOPY src/ src/`
                });
            }
        });
        
        return recs;
    }

    function renderRecommendations(parsedDf) {
        const recs = generateRecommendations(parsedDf);
        
        if (recs.length === 0) {
            viewRecs.innerHTML = `
                <div class="dl-empty-state">
                    <span style="font-size: 3rem;">🌟</span>
                    <h3>Fully Optimized</h3>
                    <p>No actionable optimization recommendations found.</p>
                </div>
            `;
            return;
        }

        let html = '';
        recs.forEach(rec => {
            html += `
                <div class="dl-rec-card dl-rec-impact-${rec.impact}">
                    <div class="dl-rec-header">
                        <div class="dl-rec-title">${escapeHtml(maskSecret(rec.title))}</div>
                        <div class="dl-rec-meta">
                            <span class="dl-rec-badge" style="background:rgba(255,255,255,0.1); color:#cbd5e1;">${escapeHtml(rec.category)}</span>
                            <span class="dl-rec-badge" style="background:rgba(0,0,0,0.3);">${escapeHtml(rec.impact)} Impact</span>
                        </div>
                    </div>
                    <div class="dl-rec-desc">${escapeHtml(rec.explanation)}</div>
                    ${rec.example ? `
                        <div class="dl-rec-snippet-container">
                            <button class="dl-copy-btn" data-snippet="${escapeHtml(rec.example)}">Copy</button>
                            <pre class="dl-rec-snippet">${escapeHtml(rec.example)}</pre>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        viewRecs.innerHTML = html;
    }

    // --- Compose Validation Logic ---
    function validateCompose(text) {
        const issues = [];
        let doc;
        
        try {
            doc = jsyaml.load(text);
        } catch (e) {
            issues.push({ severity: 'error', category: 'Syntax', line: e.mark ? e.mark.line + 1 : null, title: `Invalid YAML`, description: e.message, fix: 'Fix formatting.' });
            return { issues, doc: null };
        }

        if (!doc) {
            issues.push({ severity: 'error', category: 'Syntax', title: `Empty Document`, description: 'Parsed YAML is empty.', fix: 'Add configuration.' });
            return { issues, doc: null };
        }

        if (!doc.services || typeof doc.services !== 'object') {
            issues.push({ severity: 'error', category: 'Syntax', title: `Missing 'services'`, description: 'Must define a services block.', fix: 'Add services: section.' });
            return { issues, doc };
        }

        const services = Object.keys(doc.services);
        const definedNetworks = doc.networks ? Object.keys(doc.networks) : [];
        const definedVolumes = doc.volumes ? Object.keys(doc.volumes) : [];
        const usedHostPorts = {};

        for (const [serviceName, service] of Object.entries(doc.services)) {
            if (!service) continue;

            if (!service.image && !service.build) issues.push({ severity: 'error', category: 'Syntax', title: `Service '${serviceName}' missing image/build`, description: 'Must specify image or build.', fix: 'Add image: or build:.' });
            if (service.image && service.image.endsWith(':latest')) issues.push({ severity: 'warning', category: 'Reliability', title: `Service '${serviceName}' uses 'latest'`, description: 'Can cause unexpected breaks.', fix: 'Pin specific version.' });
            if (service.privileged === true) issues.push({ severity: 'warning', category: 'Security', title: `Privileged mode on '${serviceName}'`, description: 'Grants almost all capabilities.', fix: 'Remove if possible.' });
            if (service.network_mode === 'host') issues.push({ severity: 'warning', category: 'Security', title: `Host network on '${serviceName}'`, description: 'Removes network isolation.', fix: 'Use bridge networks.' });

            if (service.volumes && Array.isArray(service.volumes)) {
                service.volumes.forEach(vol => {
                    const volStr = typeof vol === 'string' ? vol : vol.source;
                    if (!volStr) return;
                    if (volStr.includes('/var/run/docker.sock')) issues.push({ severity: 'error', category: 'Security', title: `Docker socket mounted in '${serviceName}'`, description: 'Grants root access to host.', fix: 'Avoid mounting docker.sock.' });
                    if (volStr.startsWith('/') && (volStr === '/' || volStr.startsWith('/etc') || volStr.startsWith('/usr'))) issues.push({ severity: 'warning', category: 'Security', title: `Sensitive path mounted in '${serviceName}'`, description: `Exposes ${volStr}.`, fix: 'Mount specific dirs.' });
                    if (!volStr.startsWith('.') && !volStr.startsWith('/') && !volStr.startsWith('~') && volStr.includes(':')) {
                        const volName = volStr.split(':')[0];
                        if (!definedVolumes.includes(volName)) issues.push({ severity: 'error', category: 'Syntax', title: `Undefined volume '${volName}'`, description: 'Used but not defined in volumes block.', fix: 'Define in top-level volumes:.' });
                    }
                });
            }

            if (service.environment) {
                const envs = Array.isArray(service.environment) ? service.environment : Object.entries(service.environment).map(([k, v]) => `${k}=${v}`);
                envs.forEach(env => {
                    const uEnv = env.toUpperCase();
                    if (uEnv.includes('PASSWORD=') || uEnv.includes('SECRET=') || uEnv.includes('KEY=') || uEnv.includes('TOKEN=')) {
                        issues.push({ severity: 'warning', category: 'Security', title: `Hardcoded secret in '${serviceName}'`, description: `Found secret: ${env.split('=')[0]}`, fix: 'Use .env or secrets.' });
                    }
                });
            }

            if (service.ports && Array.isArray(service.ports)) {
                service.ports.forEach(portObj => {
                    let hostPort = null;
                    if (typeof portObj === 'string') {
                        const parts = portObj.split(':');
                        if (parts.length >= 2) hostPort = parts[0];
                    } else if (portObj.published) hostPort = portObj.published;

                    if (hostPort) {
                        if (usedHostPorts[hostPort]) {
                            issues.push({ severity: 'error', category: 'Syntax', title: `Duplicate host port ${hostPort}`, description: `'${usedHostPorts[hostPort]}' and '${serviceName}' bind to ${hostPort}.`, fix: 'Change published port.' });
                        } else usedHostPorts[hostPort] = serviceName;
                    }
                });
            }

            if (!service.healthcheck) issues.push({ severity: 'suggestion', category: 'Reliability', title: `Missing healthcheck in '${serviceName}'`, description: 'Dependent services might start too early.', fix: 'Add healthcheck:.' });

            if (service.depends_on) {
                const deps = Array.isArray(service.depends_on) ? service.depends_on : Object.keys(service.depends_on);
                deps.forEach(dep => {
                    if (!services.includes(dep)) issues.push({ severity: 'error', category: 'Syntax', title: `Invalid dependency in '${serviceName}'`, description: `Depends on '${dep}' which does not exist.`, fix: 'Ensure it is defined.' });
                });
            }

            if (service.networks) {
                const nets = Array.isArray(service.networks) ? service.networks : Object.keys(service.networks);
                nets.forEach(net => {
                    if (net !== 'default' && !definedNetworks.includes(net)) issues.push({ severity: 'error', category: 'Syntax', title: `Undefined network '${net}'`, description: 'Used but not defined.', fix: 'Define in top-level networks:.' });
                });
            }
        }

        const visited = {}, recStack = {};
        function hasCycle(service, path = []) {
            if (!visited[service]) {
                visited[service] = true;
                recStack[service] = true;
                path.push(service);
                const depsObj = doc.services[service]?.depends_on || [];
                const deps = Array.isArray(depsObj) ? depsObj : Object.keys(depsObj);
                for (let dep of deps) {
                    if (!visited[dep] && hasCycle(dep, [...path])) return true;
                    else if (recStack[dep]) {
                        issues.push({ severity: 'error', category: 'Syntax', title: `Circular dependency`, description: `Cycle: ${path.join(' -> ')} -> ${dep}`, fix: 'Restructure dependencies.' });
                        return true;
                    }
                }
            }
            recStack[service] = false;
            return false;
        }

        for (let service of services) {
            if (!visited[service]) hasCycle(service);
        }

        return { issues, doc };
    }

    // --- Compose Architecture Graph ---
    function destroyCy() {
        if (cy) {
            cy.destroy();
            cy = null;
        }
        detailPanel.style.display = 'none';
        currentMermaidCode = '';
    }

    function renderArchitecture(doc) {
        destroyCy();
        
        if (!doc || !doc.services) {
            cyContainer.innerHTML = '<div style="padding: 20px; color: #f87171;">No valid services found to visualize.</div>';
            return;
        }

        const elements = [];
        let mmd = 'graph TD\n';
        
        const networksUsed = new Set();
        const volumesUsed = new Set();
        
        archSecurityFindings = {};
        archDependencies = { direct: {}, inverse: {} };
        archInferredDependencies = { direct: {}, inverse: {} };
        
        let totalServices = 0;
        let publicEntrypoints = 0;
        let databases = 0;
        let sharedVolumes = 0;
        let highRiskFindings = 0;
        let hasApiDeps = 0;

        const dbImageKeywords = ['postgres', 'mysql', 'mongo', 'redis', 'mariadb', 'cassandra', 'elasticsearch'];

        // Phase 1: Security & Dependencies Analysis
        Object.entries(doc.services).forEach(([name, s]) => {
            totalServices++;
            archDependencies.direct[name] = [];
            archDependencies.inverse[name] = archDependencies.inverse[name] || [];
            archInferredDependencies.direct[name] = [];
            archInferredDependencies.inverse[name] = archInferredDependencies.inverse[name] || [];
            
            const findings = [];
            let isPublic = false;
            let isDb = false;
            
            if (s.image && dbImageKeywords.some(k => s.image.toLowerCase().includes(k))) {
                isDb = true;
                databases++;
            }
            
            if (s.ports && s.ports.length > 0) {
                isPublic = true;
                publicEntrypoints++;
                findings.push({ level: 'High', title: 'Publicly exposed ports', desc: 'Service exposes ports directly. Ensure this is intentional.', rule: 'ports' });
                
                if (isDb) {
                    findings.push({ level: 'Critical', title: 'Database exposed to host', desc: 'A database port is published. This is a severe security risk if the host is public.', rule: 'ports' });
                }
            }
            
            if (s.privileged === true || s.privileged === 'true') {
                findings.push({ level: 'Critical', title: 'Privileged mode', desc: 'Runs with all host capabilities. Highly dangerous.', rule: 'privileged' });
            }
            
            if (s.network_mode === 'host') {
                findings.push({ level: 'High', title: 'Host networking', desc: 'Service shares the host network stack, bypassing Docker isolation.', rule: 'network_mode' });
            }
            
            if (!s.user) {
                findings.push({ level: 'Medium', title: 'Missing non-root configuration', desc: 'No user defined; likely runs as root by default.', rule: 'user' });
            }
            
            if (!s.healthcheck) {
                findings.push({ level: 'Low', title: 'Missing healthchecks', desc: 'No healthcheck defined. Orchestrators cannot monitor application health.', rule: 'healthcheck' });
            }
            
            if (s.volumes) {
                s.volumes.forEach(v => {
                    const volStr = typeof v === 'string' ? v : v.source;
                    if (!volStr) return;
                    if (volStr.includes('/var/run/docker.sock')) {
                        findings.push({ level: 'Critical', title: 'Docker socket mount', desc: 'Container can control the host Docker daemon.', rule: 'volumes' });
                    } else if (volStr === '/etc' || volStr === '/proc' || volStr === '/sys' || volStr.startsWith('/etc/') || volStr.startsWith('/proc/')) {
                        findings.push({ level: 'High', title: 'Sensitive host mount', desc: 'Mounts sensitive host directories.', rule: 'volumes' });
                    }
                });
            }
            
            if (s.environment) {
                const envs = Array.isArray(s.environment) ? s.environment : Object.keys(s.environment).map(k => `${k}=${s.environment[k]}`);
                envs.forEach(env => {
                    const k = env.split('=')[0].toLowerCase();
                    if (k.includes('pass') || k.includes('secret') || k.includes('token') || k.includes('key')) {
                        findings.push({ level: 'High', title: 'Possible secrets in environment variables', desc: `Found suspicious variable '${k}'. Use Docker Secrets or .env files instead.`, rule: 'environment' });
                    }
                    
                    // Inferred dependencies: check if an env var value matches another service name
                    Object.keys(doc.services).forEach(otherName => {
                        if (name !== otherName && env.includes(otherName)) {
                            if (!archInferredDependencies.direct[name].includes(otherName)) {
                                archInferredDependencies.direct[name].push(otherName);
                            }
                        }
                    });
                });
            }
            
            if (s.depends_on) {
                const deps = Array.isArray(s.depends_on) ? s.depends_on : Object.keys(s.depends_on);
                deps.forEach(dep => {
                    archDependencies.direct[name].push(dep);
                });
            }
            
            archSecurityFindings[name] = findings;
            
            findings.forEach(f => {
                if (f.level === 'Critical' || f.level === 'High') highRiskFindings++;
            });
        });
        
        Object.entries(archDependencies.direct).forEach(([src, targets]) => {
            targets.forEach(t => {
                if (!archDependencies.inverse[t]) archDependencies.inverse[t] = [];
                archDependencies.inverse[t].push(src);
                if (t === 'api') hasApiDeps++;
            });
        });
        
        Object.entries(archInferredDependencies.direct).forEach(([src, targets]) => {
            targets.forEach(t => {
                if (!archInferredDependencies.inverse[t]) archInferredDependencies.inverse[t] = [];
                archInferredDependencies.inverse[t].push(src);
            });
        });
        
        if (archSummary) {
            archSummary.innerHTML = `
                <span><strong>${totalServices}</strong> services</span>
                <span><strong>${publicEntrypoints}</strong> public entry points</span>
                <span><strong>${databases}</strong> databases</span>
                <span><strong>${sharedVolumes}</strong> shared volume(s)</span>
                <span><strong>${hasApiDeps}</strong> services depend on the API</span>
                <span style="color:${highRiskFindings > 0 ? '#ef4444' : '#cbd5e1'}"><strong>${highRiskFindings}</strong> high/critical risks</span>
            `;
        }
        
        Object.entries(doc.services).forEach(([name, s]) => {
            let bgColor = '#3b82f6';
            let borderColor = '#2563eb';
            let borderWidth = 0;
            
            if (archViewMode === 'security') {
                const findings = archSecurityFindings[name] || [];
                const hasCritical = findings.some(f => f.level === 'Critical');
                const hasHigh = findings.some(f => f.level === 'High');
                const hasMedium = findings.some(f => f.level === 'Medium');
                
                if (hasCritical) { bgColor = '#ef4444'; borderColor = '#dc2626'; borderWidth = 4; }
                else if (hasHigh) { bgColor = '#f97316'; borderColor = '#ea580c'; borderWidth = 3; }
                else if (hasMedium) { bgColor = '#eab308'; borderColor = '#ca8a04'; borderWidth = 2; }
                else { bgColor = '#3b82f6'; }
            } else if (archViewMode === 'failure' && selectedFailureService) {
                bgColor = '#3b82f6'; // unaffected
                borderColor = '#2563eb';
                
                // BFS for dependencies
                function getAffected(start, depsMap) {
                    const visited = new Set();
                    const queue = [start];
                    while (queue.length > 0) {
                        const curr = queue.shift();
                        (depsMap[curr] || []).forEach(n => {
                            if (!visited.has(n)) {
                                visited.add(n);
                                queue.push(n);
                            }
                        });
                    }
                    return visited;
                }
                
                const directlyAffected = new Set(archDependencies.inverse[selectedFailureService] || []);
                const indirectlyAffected = getAffected(selectedFailureService, archDependencies.inverse);
                directlyAffected.forEach(n => indirectlyAffected.delete(n)); // remove direct from indirect
                
                const inferredAffected = getAffected(selectedFailureService, archInferredDependencies.inverse);
                
                if (name === selectedFailureService) {
                    bgColor = '#ef4444'; // Failed
                    borderWidth = 4;
                    borderColor = '#7f1d1d';
                } else if (directlyAffected.has(name)) {
                    bgColor = '#f97316'; // Directly affected
                    borderWidth = 3;
                    borderColor = '#ea580c';
                } else if (indirectlyAffected.has(name)) {
                    bgColor = '#fbbf24'; // Indirectly affected (chain)
                    borderWidth = 2;
                    borderColor = '#d97706';
                } else if (inferredAffected.has(name)) {
                    bgColor = '#94a3b8'; // Inferred relationship
                    borderWidth = 2;
                    borderColor = '#475569';
                }
            }

            elements.push({ 
                data: { id: `svc_${name}`, label: name, type: 'service', raw: s },
                style: { 'background-color': bgColor, 'border-width': borderWidth, 'border-color': borderColor }
            });
            mmd += `  svc_${name}["${name}"]\n`;
            
            if (s.depends_on) {
                const deps = Array.isArray(s.depends_on) ? s.depends_on : Object.keys(s.depends_on);
                deps.forEach(dep => {
                    elements.push({ data: { id: `dep_${name}_${dep}`, source: `svc_${name}`, target: `svc_${dep}`, type: 'depends' } });
                    mmd += `  svc_${name} --> svc_${dep}\n`;
                });
            }
            
            if (archViewMode === 'failure') {
                (archInferredDependencies.direct[name] || []).forEach(dep => {
                    if (!(s.depends_on && (Array.isArray(s.depends_on) ? s.depends_on.includes(dep) : s.depends_on[dep]))) {
                        elements.push({ data: { id: `inf_${name}_${dep}`, source: `svc_${name}`, target: `svc_${dep}`, type: 'inferred' } });
                    }
                });
            }

            let sNets = ['default'];
            if (s.networks) {
                sNets = Array.isArray(s.networks) ? s.networks : Object.keys(s.networks);
            }
            sNets.forEach(net => {
                networksUsed.add(net);
                elements.push({ data: { id: `net_${name}_${net}`, source: `svc_${name}`, target: `net_${net}`, type: 'connects' } });
                mmd += `  svc_${name} -.-> net_${net}\n`;
            });

            if (s.volumes) {
                s.volumes.forEach((v, idx) => {
                    const volStr = typeof v === 'string' ? v : v.source;
                    if (!volStr) return;
                    if (!volStr.includes('/') && !volStr.includes('\\') && !volStr.startsWith('.')) {
                        const vName = volStr.split(':')[0];
                        volumesUsed.add(vName);
                        elements.push({ data: { id: `vol_${name}_${vName}_${idx}`, source: `svc_${name}`, target: `vol_${vName}`, type: 'mounts' } });
                        mmd += `  svc_${name} === vol_${vName}\n`;
                    }
                });
            }
        });

        networksUsed.forEach(n => {
            elements.push({ data: { id: `net_${n}`, label: n, type: 'network' } });
            mmd += `  net_${n}(("${n}"))\n`;
        });

        volumesUsed.forEach(v => {
            elements.push({ data: { id: `vol_${v}`, label: v, type: 'volume' } });
            mmd += `  vol_${v}[("${v}")]\n`;
        });

        currentMermaidCode = mmd;

        if (typeof cytoscape === 'undefined') {
            cyContainer.innerHTML = '<div style="padding: 20px;">Error: Cytoscape library not loaded.</div>';
            return;
        }

        cy = cytoscape({
            container: cyContainer,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#ffffff',
                        'font-size': '14px',
                        'font-family': 'Inter, sans-serif',
                        'text-outline-width': 2,
                        'text-outline-color': '#0f172a'
                    }
                },
                {
                    selector: 'node[type = "service"]',
                    style: {
                        'shape': 'round-rectangle',
                        'width': 'label',
                        'height': 'label',
                        'padding': '14px'
                    }
                },
                {
                    selector: 'node[type = "network"]',
                    style: {
                        'background-color': '#8b5cf6',
                        'shape': 'ellipse',
                        'width': 'label',
                        'height': 'label',
                        'padding': '12px'
                    }
                },
                {
                    selector: 'node[type = "volume"]',
                    style: {
                        'background-color': '#f59e0b',
                        'shape': 'barrel',
                        'width': 'label',
                        'height': 'label',
                        'padding': '12px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'curve-style': 'bezier'
                    }
                },
                {
                    selector: 'edge[type = "depends"]',
                    style: {
                        'line-color': '#cbd5e1',
                        'target-arrow-color': '#cbd5e1',
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 1.5
                    }
                },
                {
                    selector: 'edge[type = "inferred"]',
                    style: {
                        'line-color': '#94a3b8',
                        'target-arrow-color': '#94a3b8',
                        'target-arrow-shape': 'triangle',
                        'line-style': 'dashed',
                        'arrow-scale': 1.5
                    }
                },
                {
                    selector: 'edge[type = "mounts"]',
                    style: {
                        'line-color': '#fcd34d',
                        'line-style': 'dashed',
                        'target-arrow-color': '#fcd34d',
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 1.2
                    }
                },
                {
                    selector: 'edge[type = "connects"]',
                    style: {
                        'line-color': '#c4b5fd',
                        'line-style': 'dotted'
                    }
                }
            ],
            layout: {
                name: 'cose',
                padding: 40,
                animate: false
            },
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.2
        });

        cy.on('tap', 'node[type="service"]', function(evt){
            const node = evt.target;
            const data = node.data();
            const sName = data.label;
            const raw = data.raw;
            
            if (archViewMode === 'failure') {
                selectedFailureService = sName;
                renderArchitecture(doc);
                return;
            }
            
            showServiceDetails(sName, raw);
        });

        cy.on('tap', function(evt){
            if (evt.target === cy) {
                document.getElementById('dl-service-details').style.display = 'none';
                if (archViewMode === 'failure' && selectedFailureService) {
                    selectedFailureService = null;
                    renderArchitecture(doc);
                }
            }
        });

        updateVisibility();
    }

    function updateVisibility() {
        if (!cy) return;
        const toggleDeps = document.getElementById('toggle-deps');
        const toggleNets = document.getElementById('toggle-nets');
        const toggleVols = document.getElementById('toggle-vols');
        const showDeps = toggleDeps ? toggleDeps.checked : true;
        const showNets = toggleNets ? toggleNets.checked : true;
        const showVols = toggleVols ? toggleVols.checked : true;

        cy.elements().removeClass('hidden');

        if (!showDeps) {
            cy.edges('[type="depends"]').style('display', 'none');
            cy.edges('[type="inferred"]').style('display', 'none');
        } else {
            cy.edges('[type="depends"]').style('display', 'element');
            cy.edges('[type="inferred"]').style('display', 'element');
        }

        if (!showNets) {
            cy.nodes('[type="network"]').style('display', 'none');
            cy.edges('[type="connects"]').style('display', 'none');
        } else {
            cy.nodes('[type="network"]').style('display', 'element');
            cy.edges('[type="connects"]').style('display', 'element');
        }

        if (!showVols) {
            cy.nodes('[type="volume"]').style('display', 'none');
            cy.edges('[type="mounts"]').style('display', 'none');
        } else {
            cy.nodes('[type="volume"]').style('display', 'element');
            cy.edges('[type="mounts"]').style('display', 'element');
        }
    }

    function showServiceDetails(name, raw) {
        document.getElementById('detail-title').textContent = name;
        
        let html = '';
        if (raw.image) html += `<p><strong>Image:</strong> ${escapeHtml(raw.image)}</p>`;
        if (raw.build) html += `<p><strong>Build:</strong> ${escapeHtml(typeof raw.build === 'string' ? raw.build : 'Custom context')}</p>`;
        
        if (archViewMode === 'security') {
            const findings = archSecurityFindings[name] || [];
            if (findings.length > 0) {
                html += `<div><strong>Security Findings:</strong><ul style="margin-top:8px; padding-left:0; list-style:none; display:flex; flex-direction:column; gap:8px;">`;
                findings.forEach(f => {
                    let fColor = '#3b82f6';
                    if (f.level === 'Critical') fColor = '#ef4444';
                    else if (f.level === 'High') fColor = '#f97316';
                    else if (f.level === 'Medium') fColor = '#eab308';
                    html += `<li style="background:rgba(255,255,255,0.05); border-left:3px solid ${fColor}; padding:8px 12px; border-radius:0 4px 4px 0;">
                        <span style="color:${fColor}; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${f.level}</span><br>
                        <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(f.title)}</strong><br>
                        <span style="font-size:0.85rem; color:#cbd5e1; display:block; margin:4px 0;">${escapeHtml(f.desc)}</span>
                        <span style="font-size:0.8rem; color:#94a3b8; font-family:monospace;">Property: ${f.rule}</span>
                    </li>`;
                });
                html += `</ul></div>`;
            } else {
                html += `<div style="color:#34d399; margin-top:12px; padding:12px; background:rgba(52,211,153,0.1); border-radius:4px;">✅ No security risks detected.</div>`;
            }
        } else {
            if (raw.ports) {
                html += `<p><strong>Ports:</strong><br>`;
                raw.ports.forEach(p => html += `- ${escapeHtml(typeof p === 'string' ? p : p.published+':'+p.target)}<br>`);
                html += `</p>`;
            }
            if (raw.environment) {
                const envs = Array.isArray(raw.environment) ? raw.environment : Object.keys(raw.environment).map(k => `${k}=${raw.environment[k]}`);
                html += `<p><strong>Environment:</strong><br>${escapeHtml(maskSecret(envs.join('\n'))).split('\n').join('<br>')}</p>`;
            }
            if (raw.healthcheck) html += `<p><strong>Healthcheck:</strong> Defined</p>`;
            if (raw.privileged) html += `<p><strong style="color:#f87171">⚠️ Privileged Mode</strong></p>`;
            
            let volCount = 0;
            if (raw.volumes) volCount = raw.volumes.length;
            html += `<p><strong>Volumes Mounted:</strong> ${volCount}</p>`;
            
            if (archViewMode === 'architecture') {
                html += `<button class="dl-btn dl-btn-secondary" style="width:100%; margin-top:12px;" onclick="document.getElementById('view-failure').click(); selectedFailureService='${name}'; renderArchitecture(currentDoc);">Simulate Failure</button>`;
            }
        }

        document.getElementById('detail-content').innerHTML = html;
        document.getElementById('dl-service-details').style.display = 'flex';
    }

    // Initialize
    renderEmptyState();

// --- Improved Version Engine ---
function simpleDiff(oldLines, newLines) {
    const matrix = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));
    for (let i = 1; i <= oldLines.length; i++) {
        for (let j = 1; j <= newLines.length; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }
    let i = oldLines.length, j = newLines.length;
    const diff = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            diff.unshift({ type: 'equal', value: oldLines[i - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            diff.unshift({ type: 'add', value: newLines[j - 1] });
            j--;
        } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
            diff.unshift({ type: 'remove', value: oldLines[i - 1] });
            i--;
        }
    }
    return diff;
}

function maskSecret(str) {
    if (!str) return str;
    return str.replace(/([A-Z0-9_]*(?:PASSWORD|PASS|SECRET|KEY|TOKEN|CREDENTIAL|AUTH)[A-Z0-9_]*)\s*[:=]\s*([^\s"']+)/ig, '$1=********');
}

const TRANSFORMATION_RULES = [
    // Dockerfile Rules
    {
        id: 'df-cmd-json', mode: 'dockerfile',
        title: 'Convert CMD to JSON form', category: 'Reliability', confidence: 'Safe',
        explanation: 'Shell-form CMD breaks Unix signal handling and variable expansion differences.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('CMD ') && !t.includes('[')) {
                    if (/[&|><$`\\]/.test(t) || /(?:'|")/.test(t)) {
                        m.push({ lineIndex: i, original: l, suggested: '# TODO: Convert to JSON array manually. Tokenization is ambiguous.\n' + l, confidence: 'Review recommended' });
                    } else {
                        const p1 = t.replace(/CMD\s+/i, '');
                        m.push({ lineIndex: i, original: l, suggested: `CMD ["${p1.split(/\s+/).filter(x=>x).join('", "')}"]`, confidence: 'Safe' });
                    }
                }
            });
            return m;
        }
    },
    {
        id: 'df-entrypoint-json', mode: 'dockerfile',
        title: 'Convert ENTRYPOINT to JSON form', category: 'Reliability', confidence: 'Safe',
        explanation: 'Shell-form ENTRYPOINT ignores CMD arguments and signals.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('ENTRYPOINT ') && !t.includes('[')) {
                    if (/[&|><$`\\]/.test(t) || /(?:'|")/.test(t)) {
                        m.push({ lineIndex: i, original: l, suggested: '# TODO: Convert to JSON array manually. Tokenization is ambiguous.\n' + l, confidence: 'Review recommended' });
                    } else {
                        const p1 = t.replace(/ENTRYPOINT\s+/i, '');
                        m.push({ lineIndex: i, original: l, suggested: `ENTRYPOINT ["${p1.split(/\s+/).filter(x=>x).join('", "')}"]`, confidence: 'Safe' });
                    }
                }
            });
            return m;
        }
    },
    {
        id: 'df-add-copy', mode: 'dockerfile',
        title: 'Replace ADD with COPY', category: 'Best Practice', confidence: 'Safe',
        explanation: 'COPY is preferred for local files to avoid accidental archive extraction.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('ADD ')) {
                    const args = t.substring(4).trim();
                    if (!args.startsWith('http://') && !args.startsWith('https://') && !/\.tar(?:\.gz|\.bz2|\.xz)?$/.test(args) && !/\s+--chown/i.test(t)) {
                        m.push({ lineIndex: i, original: l, suggested: l.replace(/^ADD/i, 'COPY'), confidence: 'Safe' });
                    } else {
                        m.push({ lineIndex: i, original: l, suggested: '# TODO: Consider COPY if not extracting an archive or downloading a URL\n' + l, confidence: 'Review recommended' });
                    }
                }
            });
            return m;
        }
    },
    {
        id: 'df-apt-cache', mode: 'dockerfile',
        title: 'Clean apt-get cache', category: 'Optimization', confidence: 'Safe',
        explanation: 'Removing package lists after install reduces the final image size.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('RUN ') && t.includes('apt-get install') && !t.includes('rm -rf /var/lib/apt/lists')) {
                    if (t.endsWith('\\') || /&&|\|\||;/.test(t.replace(/apt-get install[^&|;]*/, ''))) {
                        m.push({ lineIndex: i, original: l, suggested: l + ' # TODO: Clean apt cache (rm -rf /var/lib/apt/lists/*)', confidence: 'Review recommended' });
                    } else {
                        m.push({ lineIndex: i, original: l, suggested: l + ' && rm -rf /var/lib/apt/lists/*', confidence: 'Safe' });
                    }
                }
            });
            return m;
        }
    },
    {
        id: 'df-apt-combine', mode: 'dockerfile',
        title: 'Combine apt-get update and install', category: 'Optimization', confidence: 'Safe',
        explanation: 'Running update and install in the same instruction prevents stale cache issues.',
        detect: (lines) => {
            const m = [];
            for (let i = 0; i < lines.length - 1; i++) {
                const cur = lines[i].trim().toUpperCase();
                const nxt = lines[i+1].trim().toUpperCase();
                if (cur.startsWith('RUN APT-GET UPDATE') && !cur.endsWith('\\') && !/&&|\|\||;/.test(cur) && nxt.startsWith('RUN APT-GET INSTALL')) {
                    m.push({ lineIndex: i, original: lines[i], suggested: null, confidence: 'Safe' });
                    m.push({ lineIndex: i+1, original: lines[i+1], suggested: lines[i+1].replace(/RUN\s+/i, 'RUN apt-get update && '), confidence: 'Safe' });
                }
            }
            return m;
        }
    },
    {
        id: 'df-norm-case', mode: 'dockerfile',
        title: 'Normalize instruction casing', category: 'Maintainability', confidence: 'Safe',
        explanation: 'Uppercase instructions improve readability.',
        detect: (lines) => {
            const m = [];
            const insts = ['from', 'run', 'cmd', 'label', 'maintainer', 'expose', 'env', 'add', 'copy', 'entrypoint', 'volume', 'user', 'workdir', 'arg'];
            lines.forEach((l, i) => {
                const t = l.trim();
                const firstWord = t.split(/\s+/)[0];
                if (firstWord && firstWord !== firstWord.toUpperCase() && insts.includes(firstWord.toLowerCase())) {
                    m.push({ lineIndex: i, original: l, suggested: l.replace(firstWord, firstWord.toUpperCase()), confidence: 'Safe' });
                }
            });
            return m;
        }
    },
    {
        id: 'df-dup-expose', mode: 'dockerfile',
        title: 'Remove duplicate EXPOSE', category: 'Maintainability', confidence: 'Safe',
        explanation: 'Multiple EXPOSE instructions for the same port are redundant.',
        detect: (lines) => {
            const m = [];
            const seen = new Set();
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('EXPOSE ')) {
                    const portStr = t.substring(7).trim();
                    const ports = portStr.split(/\s+/);
                    if (ports.length === 1) {
                        const norm = portStr.includes('/') ? portStr.toLowerCase() : portStr + '/tcp';
                        if (seen.has(norm)) m.push({ lineIndex: i, original: l, suggested: null, confidence: 'Safe' });
                        else seen.add(norm);
                    }
                }
            });
            return m;
        }
    },
    {
        id: 'df-user', mode: 'dockerfile',
        title: 'Run as non-root user', category: 'Security', confidence: 'Review recommended',
        explanation: 'Running as root is a security risk. Add a non-root user before executing commands.',
        detect: (lines) => {
            const m = [];
            const hasUser = lines.some(l => l.trim().toUpperCase().startsWith('USER ') && !l.trim().toUpperCase().includes('ROOT'));
            if (!hasUser && lines.length > 0) {
                let insertIdx = lines.length - 1;
                m.push({ lineIndex: insertIdx, original: lines[insertIdx], suggested: lines[insertIdx] + '\n\n# TODO: Replace with the non-root user used by this image\n# USER myuser', confidence: 'Review recommended' });
            }
            return m;
        }
    },
    {
        id: 'df-healthcheck', mode: 'dockerfile',
        title: 'Add HEALTHCHECK', category: 'Reliability', confidence: 'Review recommended',
        explanation: 'Helps Docker know if the container is functioning correctly.',
        detect: (lines) => {
            const m = [];
            const hasHC = lines.some(l => l.trim().toUpperCase().startsWith('HEALTHCHECK '));
            if (!hasHC && lines.length > 0) {
                let insertIdx = lines.length - 1;
                m.push({ lineIndex: insertIdx, original: lines[insertIdx], suggested: lines[insertIdx] + '\n\n# TODO: Add appropriate health check\n# HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1', confidence: 'Review recommended' });
            }
            return m;
        }
    },
    {
        id: 'df-latest-tag', mode: 'dockerfile',
        title: 'Pin specific image tag', category: 'Reliability', confidence: 'Review recommended',
        explanation: 'Using latest tag can cause unpredictable builds when upstream changes.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.toUpperCase().startsWith('FROM ')) {
                    const args = t.substring(5).trim().split(/\s+/)[0];
                    if (args.endsWith(':latest') || !args.includes(':')) {
                        m.push({ lineIndex: i, original: l, suggested: l + ' # TODO: Pin this image to a verified version instead of using latest', confidence: 'Review recommended' });
                    }
                }
            });
            return m;
        }
    },

    // Compose Rules
    {
        id: 'comp-dup-ports', mode: 'compose',
        title: 'Remove duplicate ports', category: 'Maintainability', confidence: 'Safe',
        explanation: 'Duplicate port mappings cause runtime bind errors.',
        detect: (lines) => {
            const m = [];
            const usedHostPorts = {};
            let inPorts = false;
            let indentLevel = 0;
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.startsWith('ports:')) {
                    inPorts = true;
                    indentLevel = l.indexOf('ports:');
                } else if (inPorts && l.startsWith(' '.repeat(indentLevel + 2) + '-')) {
                    const portStr = t.replace('-', '').trim().replace(/['"]/g, '');
                    const hostPort = portStr.split(':')[0];
                    if (usedHostPorts[hostPort]) m.push({ lineIndex: i, original: l, suggested: null, confidence: 'Safe' });
                    else usedHostPorts[hostPort] = true;
                } else if (t.length > 0 && !t.startsWith('#')) {
                    const currentIndent = l.length - l.trimStart().length;
                    if (currentIndent <= indentLevel) inPorts = false;
                }
            });
            return m;
        }
    },
    {
        id: 'comp-env-array', mode: 'compose',
        title: 'Use mapping format for environment', category: 'Maintainability', confidence: 'Safe',
        explanation: 'Mapping format is generally easier to read and merge securely.',
        detect: (lines) => {
            const m = [];
            let inEnv = false;
            let indentLevel = 0;
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.startsWith('environment:')) {
                    inEnv = true;
                    indentLevel = l.indexOf('environment:');
                } else if (inEnv && l.startsWith(' '.repeat(indentLevel + 2) + '-')) {
                    const val = t.substring(1).trim();
                    if (val.includes('=') && !val.includes('*') && !val.includes('&') && !val.startsWith('{') && !val.startsWith('[')) {
                        const parts = val.split('=');
                        const k = parts[0].trim();
                        const v = parts.slice(1).join('=').trim();
                        if (/^[a-zA-Z0-9_]+$/.test(k)) {
                            m.push({ lineIndex: i, original: l, suggested: `${' '.repeat(indentLevel + 2)}${k}: ${v}`, confidence: 'Safe' });
                        }
                    }
                } else if (t.length > 0 && !t.startsWith('#')) {
                    const currentIndent = l.length - l.trimStart().length;
                    if (currentIndent <= indentLevel) inEnv = false;
                }
            });
            return m;
        }
    },
    {
        id: 'comp-privileged', mode: 'compose',
        title: 'Remove privileged mode', category: 'Security', confidence: 'Review recommended',
        explanation: 'Privileged mode bypasses isolation and gives containers full root access to the host.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                if (l.trim().startsWith('privileged: true')) {
                    m.push({ lineIndex: i, original: l, suggested: l + ' # TODO: Consider removing privileged mode and using specific cap_add instead', confidence: 'Review recommended' });
                }
            });
            return m;
        }
    },
    {
        id: 'comp-docker-sock', mode: 'compose',
        title: 'Remove Docker socket mount', category: 'Security', confidence: 'Review recommended',
        explanation: 'Mounting docker.sock grants the container complete control over the host Docker daemon.',
        detect: (lines) => {
            const m = [];
            lines.forEach((l, i) => {
                if (l.includes('/var/run/docker.sock')) {
                    m.push({ lineIndex: i, original: l, suggested: l.replace(l.trim(), '# TODO: Avoid mounting docker.sock. ' + l.trim()), confidence: 'Review recommended' });
                }
            });
            return m;
        }
    },
    {
        id: 'comp-dev-ports', mode: 'compose',
        title: 'Bind ports to localhost', category: 'Security', confidence: 'Review recommended',
        explanation: 'Binding to 127.0.0.1 prevents accidentally exposing the port to external public networks.',
        detect: (lines) => {
            const m = [];
            let inPorts = false;
            let indentLevel = 0;
            lines.forEach((l, i) => {
                const t = l.trim();
                if (t.startsWith('ports:')) {
                    inPorts = true;
                    indentLevel = l.indexOf('ports:');
                } else if (inPorts && l.startsWith(' '.repeat(indentLevel + 2) + '-')) {
                    const portStr = t.replace('-', '').trim().replace(/['"]/g, '');
                    if (!portStr.includes('127.0.0.1:') && portStr.includes(':')) {
                        m.push({ lineIndex: i, original: l, suggested: l + ' # TODO: Bind this port to 127.0.0.1 to prevent external exposure', confidence: 'Review recommended' });
                    }
                } else if (t.length > 0 && !t.startsWith('#')) {
                    const currentIndent = l.length - l.trimStart().length;
                    if (currentIndent <= indentLevel) inPorts = false;
                }
            });
            return m;
        }
    },
    {
        id: 'comp-healthcheck', mode: 'compose',
        title: 'Add healthcheck', category: 'Reliability', confidence: 'Review recommended',
        explanation: 'Services should define health checks so dependents wait for readiness.',
        detect: (lines, doc) => {
            const m = [];
            if (!doc || !doc.services) return m;
            let currentSvc = null;
            let svcLine = -1;
            lines.forEach((l, i) => {
                if (l.match(/^  [a-zA-Z0-9_-]+:/)) {
                    if (currentSvc && (!doc.services[currentSvc] || !doc.services[currentSvc].healthcheck)) {
                        m.push({ lineIndex: svcLine, original: lines[svcLine], suggested: lines[svcLine] + '\n    # TODO: Define a healthcheck for this service\n    # healthcheck:\n    #   test: ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]', confidence: 'Review recommended' });
                    }
                    currentSvc = l.trim().replace(':', '');
                    svcLine = i;
                }
            });
            if (currentSvc && (!doc.services[currentSvc] || !doc.services[currentSvc].healthcheck)) {
                m.push({ lineIndex: svcLine, original: lines[svcLine], suggested: lines[svcLine] + '\n    # TODO: Define a healthcheck for this service\n    # healthcheck:\n    #   test: ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]', confidence: 'Review recommended' });
            }
            return m;
        }
    },
    {
        id: 'comp-restart', mode: 'compose',
        title: 'Add restart policy', category: 'Reliability', confidence: 'Review recommended',
        explanation: 'Ensures the service recovers from crashes or daemon restarts.',
        detect: (lines, doc) => {
            const m = [];
            if (!doc || !doc.services) return m;
            let currentSvc = null;
            let svcLine = -1;
            lines.forEach((l, i) => {
                if (l.match(/^  [a-zA-Z0-9_-]+:/)) {
                    if (currentSvc && (!doc.services[currentSvc] || !doc.services[currentSvc].restart)) {
                        m.push({ lineIndex: svcLine, original: lines[svcLine], suggested: lines[svcLine] + '\n    # TODO: Add a restart policy (e.g., restart: unless-stopped)', confidence: 'Review recommended' });
                    }
                    currentSvc = l.trim().replace(':', '');
                    svcLine = i;
                }
            });
            if (currentSvc && (!doc.services[currentSvc] || !doc.services[currentSvc].restart)) {
                m.push({ lineIndex: svcLine, original: lines[svcLine], suggested: lines[svcLine] + '\n    # TODO: Add a restart policy (e.g., restart: unless-stopped)', confidence: 'Review recommended' });
            }
            return m;
        }
    } 
        // Batch 4 - Security (62-67)
        , { id: 'r62', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.pipedScriptToShell > 0, classification: 'Confirmed finding', ruleName: 'Remote Script Piped to Shell',
          evidence: f => `Found ${f.pipedScriptToShell} instance(s) of curl/wget piped directly to sh/bash.`, rec: 'Download the script, verify its checksum, and then execute it.',
          wording: ['Piping remote scripts directly to a shell bypasses verification.', 'If the remote source is compromised, the attacker gains full build execution.', 'Network interruptions can cause partial, dangerous script execution.', 'Always verify the checksum of downloaded scripts before execution.', 'This is a classic supply-chain vulnerability pattern.', 'Avoid arbitrary remote execution during the build phase.'] }
        , { id: 'r63', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.chmod777 > 0, classification: 'Confirmed finding', ruleName: 'Dangerous Permissions (777)',
          evidence: f => `Found ${f.chmod777} instance(s) of chmod 777.`, rec: 'Use the principle of least privilege (e.g., 755 or 644).',
          wording: ['Granting 777 permissions allows any user to read, write, and execute the file.', 'This breaks fundamental filesystem security boundaries.', 'Attackers can easily tamper with world-writable files.', 'Identify the specific user that needs access and use chown instead.', 'There is almost no valid use case for 777 in a production image.', 'Scope file permissions strictly to the required application user.'] }
        , { id: 'r64', personas: ['sec'], severity: 'Medium', category: 'Security', condition: f => f.useOfSudo > 0, classification: 'Confirmed finding', ruleName: 'Use of sudo in Dockerfile',
          evidence: f => `Found ${f.useOfSudo} instance(s) of sudo execution.`, rec: 'Remove sudo and use the USER instruction to switch contexts.',
          wording: ['Using sudo in a Dockerfile is an anti-pattern that creates bloated layers.', 'It implies the image contains the sudo binary, expanding the attack surface.', 'Use the USER instruction to switch to root, execute commands, and switch back.', 'Privilege escalation tools should not be shipped in production containers.', 'Docker inherently controls user execution contexts without sudo.', 'Remove sudo to adhere to container security best practices.'] }
        , { id: 'r65', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.sensitiveCopy > 0, classification: 'Inferred concern', ruleName: 'Sensitive Files Copied',
          evidence: f => `Inferred risk: ${f.sensitiveCopy} COPY/ADD instruction(s) target potentially sensitive files (.ssh, keys).`, rec: 'Use BuildKit secrets instead of copying credentials into the image.',
          wording: ['Copying SSH keys or cloud credentials bakes them permanently into the image layers.', 'Anyone with access to the Docker registry can extract these secrets.', 'This is an inferred concern based on the filename signature.', 'Use --mount=type=secret to use credentials safely during the build.', 'Secret files should never exist on the container filesystem.', 'Audit the source paths of these copy instructions carefully.'] }
        , { id: 'r66', personas: ['sec', 'sre'], severity: 'Medium', category: 'Security', condition: f => f.sysctlsModified > 0, classification: 'Confirmed finding', ruleName: 'Sysctls Modified',
          evidence: f => `Found ${f.sysctlsModified} service(s) modifying kernel parameters via sysctls.`, rec: 'Ensure sysctl modifications are strictly necessary and understood.',
          wording: ['Modifying sysctls alters the kernel behavior for the container network or IPC.', 'Improper sysctl tuning can cause host-level instability.', 'Verify that these kernel parameters do not weaken network security.', 'Containers should ideally rely on default namespaces.', 'Tuning network stacks is rarely needed for standard applications.', 'Audit these parameters to ensure they do not expose vulnerabilities.'] }
        , { id: 'r67', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.secretBuildArgs > 0, classification: 'Inferred concern', ruleName: 'Secret Build Arguments',
          evidence: f => `Found ${f.secretBuildArgs} suspicious build.args (e.g. tokens, passwords).`, rec: 'Use Docker secrets or environment variables at runtime instead of build arguments.',
          wording: ['Build arguments are visible in the docker history of the image.', 'Injecting secrets via build args permanently leaks them into the image metadata.', 'Use BuildKit secret mounts for build-time credentials.', 'Anyone pulling the image can easily read these values.', 'Move sensitive configuration entirely to the runtime environment.', 'Build arguments should only be used for non-sensitive configuration.'] }

        // Batch 4 - Reliability (68-73)
        , { id: 'r68', personas: ['devops', 'sre'], severity: 'Low', category: 'Reliability', condition: f => f.unpinnedPackages > 0, classification: 'Optional recommendation', ruleName: 'Unpinned Package Installations',
          evidence: f => `Found ${f.unpinnedPackages} package install(s) without explicit version pinning.`, rec: 'Pin package versions (e.g., apt-get install pkg=1.2.3).',
          wording: ['Installing unpinned packages breaks build reproducibility.', 'A build tomorrow might pull a newer, incompatible version.', 'This is an optional recommendation to strictly control dependencies.', 'Version pinning ensures consistent behavior across all environments.', 'Unexpected upstream updates can cause sudden pipeline failures.', 'Always lock down system package versions in production.'] }
        , { id: 'r69', personas: ['devops'], severity: 'High', category: 'Reliability', condition: f => f.invalidCopyFrom > 0, classification: 'Confirmed finding', ruleName: 'Invalid COPY --from',
          evidence: f => `Found ${f.invalidCopyFrom} COPY --from instruction(s) referencing undeclared stages.`, rec: 'Ensure the referenced stage name matches an earlier FROM AS declaration.',
          wording: ['Referencing an undeclared stage will cause the build to fail immediately.', 'The alias provided to --from does not match any prior build stage.', 'Double-check the spelling of the AS alias in the FROM instruction.', 'Multi-stage copies require strict name matching.', 'This explicitly breaks the container build process.', 'Ensure all build dependencies are correctly chained.'] }
        , { id: 'r70', personas: ['sre'], severity: 'Low', category: 'Reliability', condition: f => f.incompleteHealthcheck > 0, classification: 'Optional recommendation', ruleName: 'Incomplete Healthcheck',
          evidence: f => `Found ${f.incompleteHealthcheck} healthcheck(s) missing timeout or retries.`, rec: 'Explicitly define timeout, interval, and retries for healthchecks.',
          wording: ['Relying on default healthcheck intervals can delay failure detection.', 'Explicit timeouts ensure deadlocks are caught quickly.', 'This is an optional recommendation for tighter orchestration control.', 'Unconfigured healthchecks might cause premature container restarts.', 'Define strict boundaries for what constitutes a healthy state.', 'Tailor the retry logic to the startup time of your application.'] }
        , { id: 'r71', personas: ['arch', 'plat'], severity: 'Low', category: 'Reliability', condition: f => f.staticIpConflicts > 0, classification: 'Inferred concern', ruleName: 'Static IP Assignments',
          evidence: f => `Inferred risk: ${f.staticIpConflicts} service(s) assign static IPv4 addresses.`, rec: 'Rely on Docker DNS for service discovery instead of static IPs.',
          wording: ['Hardcoding static IP addresses drastically limits horizontal scaling.', 'It causes network collisions if multiple environments share the engine.', 'This is an inferred concern restricting architectural flexibility.', 'Use the built-in Docker DNS resolver by referencing service names.', 'Static IPs are an anti-pattern in dynamic orchestrators.', 'Abstract network addressing away from the application logic.'] }
        , { id: 'r72', personas: ['sre', 'perf'], severity: 'Medium', category: 'Reliability', condition: f => f.oomKillDisable > 0, classification: 'Confirmed finding', ruleName: 'OOM Kill Disabled',
          evidence: f => `Found ${f.oomKillDisable} service(s) with oom_kill_disable: true.`, rec: 'Remove this flag and set appropriate memory limits instead.',
          wording: ['Disabling the OOM killer allows a leaking container to crash the entire host.', 'This flag prevents the kernel from resolving memory exhaustion safely.', 'It is highly dangerous in multi-tenant environments.', 'Instead of disabling OOM, profile the application and set strict memory limits.', 'Host stability must always take precedence over a single container.', 'This defeats critical Linux resource protection mechanisms.'] }
        , { id: 'r73', personas: ['sec', 'plat'], severity: 'Low', category: 'Reliability', condition: f => f.riskyDevControls > 0, classification: 'Optional recommendation', ruleName: 'Risky Dev Controls (tty/stdin)',
          evidence: f => `Found ${f.riskyDevControls} service(s) with tty or stdin_open enabled.`, rec: 'Remove tty and stdin_open in production environments.',
          wording: ['Keeping stdin open allocates a permanent interactive terminal.', 'These flags are meant for local debugging, not production workloads.', 'This is an optional recommendation to harden the container environment.', 'It unnecessarily consumes host resources to keep the pipe open.', 'Production services should run as detached, headless daemons.', 'Remove interactive debugging flags before deployment.'] },

        // Batch 4 - Optimization (74-81)
        , { id: 'r74', personas: ['arch', 'perf'], severity: 'Medium', category: 'Optimization', condition: f => f.sharedWritableVolume > 0, classification: 'Inferred concern', ruleName: 'Shared Writable Volume',
          evidence: f => `Inferred risk: ${f.sharedWritableVolume} named volume(s) are shared across multiple services without read-only restrictions.`, rec: 'Ensure concurrent writes are handled safely, or mount as :ro for readers.',
          wording: ['Sharing a writable volume across services often leads to race conditions and file corruption.', 'If a service only reads the data, mount the volume with the :ro flag.', 'This is an inferred concern regarding concurrent state management.', 'Applications must be specifically designed to handle shared filesystem writes.', 'Using a dedicated database or object store is safer than shared disk I/O.', 'Strictly scope write permissions to the single authoritative service.'] }
        , { id: 'r75', personas: ['arch', 'sec'], severity: 'Medium', category: 'Optimization', condition: f => f.buildNetworkHost > 0, classification: 'Confirmed finding', ruleName: 'Build Network Host',
          evidence: f => `Found ${f.buildNetworkHost} service(s) using build.network: host.`, rec: 'Avoid host networking during builds to ensure reproducibility.',
          wording: ['Building on the host network breaks the isolation of the build process.', 'The build might succeed locally but fail in isolated CI/CD environments.', 'It exposes the host network stack to potentially untrusted build scripts.', 'Builds should be strictly hermetic and rely only on standard outbound access.', 'This couples the artifact generation to the specific host configuration.', 'Remove this to guarantee portable, repeatable builds.'] }
        , { id: 'r76', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.aptNoRecommends > 0, classification: 'Optional recommendation', ruleName: 'Missing --no-install-recommends',
          evidence: f => `Found ${f.aptNoRecommends} apt-get install(s) without --no-install-recommends.`, rec: 'Add --no-install-recommends to avoid installing unnecessary dependencies.',
          wording: ['By default, apt-get installs recommended but strictly unnecessary packages.', 'This inflates the image size significantly.', 'This is an optional recommendation to keep images lean.', 'Fewer packages mean a smaller attack surface and faster pull times.', 'Always explicitly define the packages your application requires.', 'Trimming recommended packages is a standard Dockerfile optimization.'] }
        , { id: 'r77', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.pipNoCache > 0, classification: 'Optional recommendation', ruleName: 'Missing --no-cache-dir',
          evidence: f => `Found ${f.pipNoCache} pip install(s) without --no-cache-dir.`, rec: 'Add --no-cache-dir to pip commands to reduce layer size.',
          wording: ['Pip caches downloaded wheels locally, which bloats the Docker layer.', 'Because the layer is immutable, this cache is entirely useless at runtime.', 'This is an optional recommendation to save megabytes of space.', 'Disabling the cache ensures the final layer only contains the installed libraries.', 'It speeds up extraction and reduces storage costs.', 'This is a fundamental Python optimization for containers.'] }
        , { id: 'r78', personas: ['perf', 'sre'], severity: 'Low', category: 'Optimization', condition: f => f.npmNonDeterministic > 0, classification: 'Optional recommendation', ruleName: 'Non-Deterministic NPM Install',
          evidence: f => `Found ${f.npmNonDeterministic} use(s) of npm install instead of npm ci.`, rec: 'Use npm ci in automated builds for strict lockfile adherence.',
          wording: ['Using npm install can implicitly update the package-lock.json during the build.', 'This breaks build reproducibility across different environments.', 'This is an optional recommendation to guarantee dependency locking.', 'Using npm ci strictly installs the exact versions from the lockfile.', 'It is significantly faster and safer for production builds.', 'Ensure your CI/CD pipelines always use deterministic installations.'] }
        , { id: 'r79', personas: ['perf', 'arch'], severity: 'Low', category: 'Optimization', condition: f => f.unusedBuildStages > 0, classification: 'Optional recommendation', ruleName: 'Unused Build Stages',
          evidence: f => `Found ${f.unusedBuildStages} intermediate build stage(s) never referenced by COPY --from.`, rec: 'Remove dead stages to speed up the build process.',
          wording: ['Intermediate build stages that are never copied from waste build time.', 'They execute instructions and download dependencies for no reason.', 'This indicates dead code or an incomplete refactor in the Dockerfile.', 'Removing them streamlines the pipeline and reduces build complexity.', 'Keep the Dockerfile focused only on necessary artifact generation.', 'Clean up orphaned stages to maintain a clean configuration.'] }
        , { id: 'r80', personas: ['perf', 'plat'], severity: 'Low', category: 'Optimization', condition: f => f.unusedSecrets > 0, classification: 'Optional recommendation', ruleName: 'Declared Unused Secrets',
          evidence: f => `Found ${f.unusedSecrets} globally declared secret(s) not attached to any service.`, rec: 'Remove unused secrets from the Compose file.',
          wording: ['Declaring secrets that no service uses adds unnecessary complexity.', 'It forces orchestrators to manage cryptographic objects pointlessly.', 'This is an optional recommendation for cleaner file structure.', 'Dead configuration confuses operators and maintainers.', 'Keep the Compose file tightly scoped to active requirements.', 'Audit the secrets block and prune unused entries.'] }
        , { id: 'r81', personas: ['perf', 'plat'], severity: 'Low', category: 'Optimization', condition: f => f.unusedConfigs > 0, classification: 'Optional recommendation', ruleName: 'Declared Unused Configs',
          evidence: f => `Found ${f.unusedConfigs} globally declared config(s) not attached to any service.`, rec: 'Remove unused configs from the Compose file.',
          wording: ['Declaring global configs that no service mounts clutters the configuration.', 'It requires the orchestrator to sync state for unused data.', 'This is an optional recommendation to improve maintainability.', 'Dead configuration payloads should be removed.', 'Ensure all declared resources are actively consumed.', 'Pruning unused configs prevents orchestration overhead.'] }

    ];

function generateImprovements() {
    generatedChanges = [];
    improvedSuggestedEditor.removeAttribute('data-manual-edit');
    const text = editor.value;
    if (!text.trim()) return;
    const lines = text.split('\n');
    
    const allMatches = [];
    TRANSFORMATION_RULES.filter(r => r.mode === currentMode).forEach(rule => {
        const matches = rule.detect(lines, currentMode === 'compose' ? currentDoc : currentParsedDf);
        matches.forEach(m => {
            allMatches.push({
                ...m,
                ruleId: rule.id,
                title: rule.title,
                category: rule.category,
                confidence: m.confidence || rule.confidence,
                explanation: rule.explanation
            });
        });
    });
    
    const lineModifications = {};
    allMatches.forEach(m => {
        if (!lineModifications[m.lineIndex]) {
            lineModifications[m.lineIndex] = m;
            generatedChanges.push({
                ...m,
                enabled: m.confidence === 'Safe'
            });
        }
    });
    
    if (tabDfImproved.classList.contains('active') || tabCompImproved.classList.contains('active')) {
        renderImprovedView(true);
    }
}

function applyChanges() {
    let lines = editor.value.split('\n');
    const activeChanges = generatedChanges.filter(c => c.enabled).sort((a, b) => b.lineIndex - a.lineIndex);
    
    activeChanges.forEach(change => {
        if (change.suggested === null) {
            lines.splice(change.lineIndex, 1);
        } else {
            lines[change.lineIndex] = change.suggested;
        }
    });
    
    return lines.join('\n');
}

function validateSuggestedVersion() {
    const text = improvedSuggestedEditor.value;
    let isValid = true;
    let errorMsg = '';
    
    if (currentMode === 'compose') {
        try {
            const doc = jsyaml.load(text);
            if (!doc || typeof doc !== 'object' || !doc.services || Object.keys(doc.services).length === 0) {
                isValid = false;
                errorMsg = 'Invalid Compose structure';
            }
        } catch (e) {
            isValid = false;
            errorMsg = 'Invalid YAML format';
        }
    } else {
        // Run full Dockerfile parser internally
        const parsed = window.parseDockerfile ? window.parseDockerfile(text) : validateDockerfile(text);
        if (!parsed || !parsed.valid) {
            isValid = false;
            errorMsg = 'Invalid Dockerfile structure';
        }
    }
    
    const manualEdit = improvedSuggestedEditor.getAttribute('data-manual-edit') === 'true';
    
    if (isValid) {
        improvedValidationStatus.textContent = manualEdit ? 'Manually edited (Valid)' : 'Suggested version validated';
        improvedValidationStatus.style.color = '#34d399';
        btnCopyImproved.disabled = false;
        btnDownloadImproved.disabled = false;
        btnCopyImproved.style.opacity = '1';
        btnDownloadImproved.style.opacity = '1';
    } else {
        improvedValidationStatus.textContent = 'Suggested version is invalid: ' + errorMsg;
        improvedValidationStatus.style.color = '#ef4444';
        btnCopyImproved.disabled = true;
        btnDownloadImproved.disabled = true;
        btnCopyImproved.style.opacity = '0.5';
        btnDownloadImproved.style.opacity = '0.5';
    }
}

function updateDiffView() {
    const origText = editor.value;
    const suggText = applyChanges();
    
    const origLines = origText.split('\n');
    const suggLines = suggText.split('\n');
    
    let diffs = [];
    if (origLines.length > 800 || suggLines.length > 800) {
        diffs = suggLines.map(l => ({ type: 'equal', value: l }));
    } else {
        diffs = simpleDiff(origLines, suggLines);
    }
    
    let origHtml = '';
    diffs.forEach(d => {
        if (d.type === 'equal') {
            origHtml += `<div>${escapeHtml(d.value) || ' '}</div>`;
        } else if (d.type === 'remove') {
            origHtml += `<div style="background:rgba(239,68,68,0.2); color:#fca5a5; width:100%; display:inline-block;">${escapeHtml(d.value) || ' '}</div>`;
        }
    });
    improvedOriginalEditor.innerHTML = origHtml;
    
    if (improvedSuggestedEditor.getAttribute('data-manual-edit') !== 'true') {
        improvedSuggestedEditor.value = suggText;
    }
    
    let hlHtml = '';
    diffs.forEach(d => {
        if (d.type === 'equal') {
            hlHtml += `<div>${escapeHtml(d.value) || ' '}</div>`;
        } else if (d.type === 'add') {
            hlHtml += `<div style="background:rgba(52,211,153,0.2); border-radius:2px;">${escapeHtml(d.value) || ' '}</div>`;
        }
    });
    suggestedHighlights.innerHTML = hlHtml;
    
    validateSuggestedVersion();
    if (origLines.length > 800 || suggLines.length > 800) {
        improvedValidationStatus.textContent += ' (Diff disabled for performance)';
    }
}

function renderImprovedView(isNewGeneration) {
    if (generatedChanges.length === 0) {
        improvedPreValidate.style.display = 'none';
        improvedNoChanges.style.display = 'flex';
        improvedContent.style.display = 'none';
        return;
    }
    
    improvedPreValidate.style.display = 'none';
    improvedNoChanges.style.display = 'none';
    improvedContent.style.display = 'flex';
    
    if (isNewGeneration) {
        const total = generatedChanges.length;
        const sec = generatedChanges.filter(c => c.category === 'Security').length;
        const rel = generatedChanges.filter(c => c.category === 'Reliability').length;
        const opt = generatedChanges.filter(c => c.category === 'Optimization').length;
        const main = generatedChanges.filter(c => c.category === 'Maintainability').length;
        const bp = generatedChanges.filter(c => c.category === 'Best Practice').length;
        const manual = generatedChanges.filter(c => c.confidence !== 'Safe').length;
        
        const parts = [];
        if (sec) parts.push(`${sec} security`);
        if (rel) parts.push(`${rel} reliability`);
        if (opt) parts.push(`${opt} optimization`);
        if (main) parts.push(`${main} maintainability`);
        if (bp) parts.push(`${bp} best practice`);
        
        improvedSummaryText.textContent = `${total} proposed changes: ${parts.join(', ')}. ${manual > 0 ? `(${manual} require review)` : ''}`;
        
        const listHtml = generatedChanges.map((c, i) => `
            <div class="dl-issue dl-issue-${c.category === 'Security' ? 'error' : (c.confidence === 'Safe' ? 'suggestion' : 'warning')}" style="padding: 10px; margin-bottom: 0;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <label style="display:flex; gap:8px; align-items:flex-start; cursor:pointer; width:100%;">
                        <input type="checkbox" data-index="${i}" ${c.enabled ? 'checked' : ''} style="margin-top:4px; cursor:pointer;">
                        <div style="flex:1;">
                            <div style="font-weight:600; color:#f8fafc; margin-bottom:4px;">${escapeHtml(c.title)}</div>
                            <div style="font-size:0.85rem; color:#cbd5e1; margin-bottom:4px;">${escapeHtml(c.explanation)}</div>
                            <div style="font-family:'JetBrains Mono', monospace; font-size:0.8rem; background:rgba(239, 68, 68, 0.1); border-left:2px solid #ef4444; padding:6px 8px; color:#fca5a5; word-break:break-all;">
                                - ${escapeHtml(maskSecret(c.original))}
                            </div>
                            ${c.suggested !== null ? `
                            <div style="font-family:'JetBrains Mono', monospace; font-size:0.8rem; background:rgba(16, 185, 129, 0.1); border-left:2px solid #10b981; padding:6px 8px; margin-top:4px; color:#6ee7b7; word-break:break-all;">
                                + ${escapeHtml(maskSecret(c.suggested))}
                            </div>` : ''}
                        </div>
                    </label>
                    <div style="text-align:right; flex-shrink:0; margin-left:12px;">
                        <span class="dl-issue-badge" style="background:rgba(255,255,255,0.1); color:#cbd5e1; display:inline-block; margin-bottom:4px;">${escapeHtml(c.category)}</span><br>
                        <span class="dl-issue-badge" style="background:${c.confidence === 'Safe' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}; color:${c.confidence === 'Safe' ? '#34d399' : '#fbbf24'};">${c.confidence === 'Safe' ? 'Safe' : 'Recommendation'}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        improvedRulesList.innerHTML = listHtml;
    } else {
        const checkboxes = improvedRulesList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            const index = parseInt(cb.getAttribute('data-index'), 10);
            if (!isNaN(index)) {
                cb.checked = generatedChanges[index].enabled;
            }
        });
    }
    
    updateDiffView();
}

    if (btnSelectSafe) {
        btnSelectSafe.addEventListener('click', () => {
            generatedChanges.forEach(c => c.enabled = c.confidence === 'Safe');
            improvedSuggestedEditor.removeAttribute('data-manual-edit');
            renderImprovedView(false);
        });
    }
    
    if (btnSelectAll) {
        btnSelectAll.addEventListener('click', () => {
            generatedChanges.forEach(c => c.enabled = true);
            improvedSuggestedEditor.removeAttribute('data-manual-edit');
            renderImprovedView(false);
        });
    }
    
    if (btnClearSelection) {
        btnClearSelection.addEventListener('click', () => {
            generatedChanges.forEach(c => c.enabled = false);
            improvedSuggestedEditor.removeAttribute('data-manual-edit');
            renderImprovedView(false);
        });
    }
    
    if (btnCopyImproved) {
        btnCopyImproved.addEventListener('click', () => {
            if (btnCopyImproved.disabled) return;
            navigator.clipboard.writeText(improvedSuggestedEditor.value).then(() => {
                const originalText = btnCopyImproved.textContent;
                btnCopyImproved.textContent = 'Copied!';
                setTimeout(() => btnCopyImproved.textContent = originalText, 2000);
            });
        });
    }
    
    if (btnDownloadImproved) {
        btnDownloadImproved.addEventListener('click', () => {
            if (btnDownloadImproved.disabled) return;
            const text = improvedSuggestedEditor.value;
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileUploadEl = document.getElementById('file-upload');
            const origName = (fileUploadEl && fileUploadEl.files && fileUploadEl.files[0]) ? fileUploadEl.files[0].name : 'docker-config';
            const safeName = origName.replace(/[^a-zA-Z0-9.\-_]/g, '');
            a.download = currentMode === 'compose' ? (safeName.endsWith('.yaml') || safeName.endsWith('.yml') ? safeName.replace(/\.ya?ml$/, '.improved.yaml') : 'compose.improved.yaml') : (safeName === 'Dockerfile' ? 'Dockerfile.improved' : safeName + '.improved');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    if (btnResetImproved) {
        btnResetImproved.addEventListener('click', () => {
            improvedSuggestedEditor.removeAttribute('data-manual-edit');
            generateImprovements();
        });
    }

    if (improvedRulesList) {
        improvedRulesList.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                if (!isNaN(index)) {
                    generatedChanges[index].enabled = e.target.checked;
                    improvedSuggestedEditor.removeAttribute('data-manual-edit');
                    updateDiffView();
                }
            }
        });
    }

    if (improvedSuggestedEditor) {
        improvedSuggestedEditor.addEventListener('input', () => {
            improvedSuggestedEditor.setAttribute('data-manual-edit', 'true');
            const origLines = editor.value.split('\n');
            const suggLines = improvedSuggestedEditor.value.split('\n');
            let diffs = [];
            if (origLines.length <= 800 && suggLines.length <= 800) {
                diffs = simpleDiff(origLines, suggLines);
            } else {
                diffs = suggLines.map(l => ({ type: 'equal', value: l }));
            }
            let hlHtml = '';
            diffs.forEach(d => {
                if (d.type === 'equal') {
                    hlHtml += `<div>${escapeHtml(d.value) || ' '}</div>`;
                } else if (d.type === 'add') {
                    hlHtml += `<div style="background:rgba(52,211,153,0.2); border-radius:2px;">${escapeHtml(d.value) || ' '}</div>`;
                }
            });
            if (suggestedHighlights) suggestedHighlights.innerHTML = hlHtml;
            validateSuggestedVersion();
        });
    }

    // Initialize
    if (typeof renderEmptyState === 'function') {
        renderEmptyState();
    }

    // Keyboard support for tabs
    const tabGroups = [tabGroupDf, tabGroupComp];
    tabGroups.forEach(group => {
        if (!group) return;
        group.addEventListener('keydown', (e) => {
            const tabs = Array.from(group.querySelectorAll('.dl-btn-tab'));
            const index = tabs.indexOf(document.activeElement);
            if (index === -1) return;

            let nextIndex = null;
            if (e.key === 'ArrowRight') {
                nextIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = (index - 1 + tabs.length) % tabs.length;
            }

            if (nextIndex !== null) {
                e.preventDefault();
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
            }
        });
    });        // --- Expert Review Engine ---
    const PERSONAS = {
        devops: { name: 'DevOps Engineer', icon: '👷', role: 'CI/CD & Delivery' },
        sec: { name: 'Security Engineer', icon: '🕵️', role: 'Risk & Compliance' },
        arch: { name: 'Software Architect', icon: '📐', role: 'Design & Structure' },
        sre: { name: 'Site Reliability Eng', icon: '🚑', role: 'Uptime & Resilience' },
        plat: { name: 'Platform Engineer', icon: '🏗️', role: 'DevEx & Tooling' },
        perf: { name: 'Performance & Cost', icon: '💰', role: 'Efficiency & Scale' }
    };

            const EXPERT_RULES = [
        { id: 'r1', personas: ['sec'], severity: 'Critical', category: 'Security', condition: f => f.hasRoot, classification: 'Confirmed finding', ruleName: 'User Privileges', 
          evidence: f => `Found ${f.hasRoot} service/stage(s) running as root.`, rec: 'Define a non-root USER.', 
          wording: ['Running as root breaks the principle of least privilege.', 'If compromised, a root container grants significant access.', 'A non-root user is mandatory for a secure baseline.', 'Avoid root execution to pass strict security policies.', 'Root access expands the blast radius of any vulnerability.', 'Dropping root privileges prevents trivial escapes.'] },
        { id: 'r2', personas: ['sec', 'sre'], severity: 'Critical', category: 'Security', condition: f => f.isPrivileged, classification: 'Confirmed finding', ruleName: 'Privileged Mode',
          evidence: f => `Privileged mode is active on ${f.isPrivileged} service(s).`, rec: 'Remove privileged: true and add specific capabilities instead.',
          wording: ['Privileged mode effectively disables container isolation.', 'Never run privileged containers unless building Docker-in-Docker.', 'This is a severe risk; the container has host-level permissions.', 'Replace privileged mode with explicit granular capabilities.', 'Any exploit here grants full host access.', 'Privileged containers are a massive red flag in production.'] },
        { id: 'r3', personas: ['sec', 'arch'], severity: 'High', category: 'Security', condition: f => f.publicDb, classification: 'Confirmed finding', ruleName: 'Database Exposure',
          evidence: f => `Found ${f.publicDb} database(s) with mapped host ports.`, rec: 'Remove port mappings for internal databases.',
          wording: ['Databases should not be reachable from the host network directly.', 'Exposing the DB port creates a direct attack vector.', 'Keep databases sealed within the internal bridge network.', 'Remove the public port mapping to prevent brute-force attacks.', 'Data stores must be isolated from public entry points.', 'A public database is a major data-leakage risk.'] },
        { id: 'r4', personas: ['sec', 'plat'], severity: 'Critical', category: 'Security', condition: f => f.hasSock, classification: 'Confirmed finding', ruleName: 'Docker Socket Mount',
          evidence: f => `docker.sock is mounted in ${f.hasSock} service(s).`, rec: 'Avoid mounting the Docker socket.',
          wording: ['Mounting the Docker socket grants full control over the daemon.', 'This allows the container to start, stop, or delete other containers.', 'It is equivalent to passwordless sudo on the host.', 'Never mount the socket unless strictly necessary for tooling.', 'Socket mounts completely bypass the container security model.', 'An attacker can use the socket to break out of the container.'] },
        { id: 'r5', personas: ['sec', 'perf'], severity: 'High', category: 'Networking', condition: f => f.hostNet, classification: 'Confirmed finding', ruleName: 'Host Network Mode',
          evidence: f => `Host network mode used by ${f.hostNet} service(s).`, rec: 'Use bridge networks with explicit port mappings.',
          wording: ['Host networking removes the network namespace isolation.', 'The container shares the host IP and all port allocations.', 'This can lead to port conflicts and firewall bypasses.', 'Use a custom bridge network for proper segregation.', 'Host mode is generally an anti-pattern unless absolutely required.', 'It makes scaling and multi-tenancy impossible.'] },
        { id: 'r6', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.secretsInEnv, classification: 'Confirmed finding', ruleName: 'Secrets in Environment',
          evidence: f => `Detected ${f.secretsInEnv} suspicious env vars (e.g. PASS, SECRET).`, rec: 'Use Docker Secrets or a secure vault.',
          wording: ['Environment variables are easily leaked in logs and introspection.', 'Injecting secrets via ENV is a poor security practice.', 'Use dedicated secret management tools or file-based secrets.', 'Anyone with access to docker inspect can read these values.', 'Hardcoded or ENV-based credentials are a common breach vector.', 'Migrate sensitive data to secure external stores.'] },
        { id: 'r7', personas: ['sec'], severity: 'Low', category: 'Security', condition: f => f.hasNoNewPrivileges === false, classification: 'Optional recommendation', ruleName: 'Missing no-new-privileges',
          evidence: f => `Security opt 'no-new-privileges' is missing in some services.`, rec: 'Add security_opt: ["no-new-privileges:true"].',
          wording: ['Without no-new-privileges, processes can gain unexpected elevation.', 'This is a crucial defense-in-depth measure.', 'It prevents privilege escalation via setuid/setgid binaries.', 'Adding this flag blocks many container escape techniques.', 'Always restrict privilege escalation systematically.', 'This flag should be part of every secure deployment baseline.'] },
        { id: 'r8', personas: ['sec'], severity: 'Medium', category: 'Security', condition: f => f.sensitiveBindMounts, classification: 'Confirmed finding', ruleName: 'Sensitive Bind Mounts',
          evidence: f => `Found mounts to sensitive host directories (/proc, /etc).`, rec: 'Remove sensitive mounts unless strictly needed for monitoring.',
          wording: ['Mounting host directories like /etc or /proc breaks isolation.', 'This exposes host configuration and secrets to the container.', 'Attackers can manipulate the host system via these mounts.', 'Use read-only mounts if host introspection is truly required.', 'Sensitive mounts are a common route for privilege escalation.', 'Re-evaluate the need for deep host system visibility.'] },
        { id: 'r9', personas: ['sec'], severity: 'Low', category: 'Security', condition: f => f.wildcardBinding, classification: 'Optional recommendation', ruleName: 'Wildcard Host Binding',
          evidence: f => `Ports are bound to 0.0.0.0 (all interfaces).`, rec: 'Bind explicitly to 127.0.0.1 or a specific internal IP.',
          wording: ['Binding to 0.0.0.0 exposes the port to all interfaces on the host.', 'Ensure this public exposure is intentional.', 'If this service is internal, consider binding to 127.0.0.1 instead.', 'Public host exposure is normal for web servers but risky for databases.', 'Evaluate if this port needs to be reachable from outside the host.', 'Network interfaces should be deliberately scoped.'] },
        { id: 'r10', personas: ['sec', 'plat'], severity: 'Medium', category: 'Security', condition: f => f.insecureEnvFile, classification: 'Inferred concern', ruleName: 'Insecure Env-File',
          evidence: f => `Inferred risk from suspicious env_file naming.`, rec: 'Ensure env files are excluded from version control and secure.',
          wording: ['The env_file is named suspiciously (e.g. .prod or .secret) and might contain production secrets.', 'Inferred that this env_file contains sensitive credentials based on its name.', 'Avoid committing this file to version control.', 'If this file contains plain-text secrets, it is an inferred security risk.', 'Make sure this env_file is dynamically injected and not hardcoded in the image.', 'Audit the contents of this specifically named environment file.'] },
        { id: 'r11', personas: ['sec', 'arch'], severity: 'High', category: 'Security', condition: f => f.excessivePorts, classification: 'Confirmed finding', ruleName: 'Excessive Public Ports',
          evidence: f => `Found ${f.excessivePorts} publicly mapped ports.`, rec: 'Use a reverse proxy/API gateway and expose only 80/443.',
          wording: ['Exposing multiple ports directly drastically increases the attack surface.', 'A reverse proxy should handle routing and SSL termination.', 'Direct port mappings skip centralized traffic inspection.', 'Consolidate entry points to simplify firewall rules.', 'Every open port is a potential backdoor.', 'Standardize on standard web ports via a gateway.'] },
        { id: 'r12', personas: ['sec'], severity: 'Low', category: 'Security', condition: f => f.readOnlyRoot === false, classification: 'Optional recommendation', ruleName: 'Writable Root Filesystem',
          evidence: f => `read_only: true is missing.`, rec: 'Make the root filesystem read-only to prevent tampering.',
          wording: ['A writable root filesystem allows attackers to modify binaries.', 'Setting read_only: true prevents downloading malware payloads.', 'You can mount specific tmpfs volumes for necessary writes.', 'Immutable containers are a core tenet of modern security.', 'A read-only root drastically reduces the impact of RCE.', 'Lock down the container image to prevent post-exploitation changes.'] },

        // Reliability (13-20)

        { id: 'r13', personas: ['sre', 'devops'], severity: 'Medium', category: 'Reliability', condition: f => f.latestTags, classification: 'Confirmed finding', ruleName: 'Latest Image Tags',
          evidence: f => `Found ${f.latestTags} images using 'latest' or no tag.`, rec: 'Pin specific image versions.',
          wording: ['The latest tag is a moving target and breaks reproducibility.', 'Updates to latest can introduce sudden breaking changes.', 'Always pin to a specific, immutable version or digest.', 'Your builds might fail unpredictably tomorrow.', 'Using latest violates configuration-as-code principles.', 'Version pinning ensures consistent behavior across environments.'] },
        { id: 'r14', personas: ['sre', 'devops'], severity: 'Low', category: 'Reliability', condition: f => f.noHealth, classification: 'Optional recommendation', ruleName: 'Missing Healthchecks',
          evidence: f => `Missing healthchecks in ${f.noHealth} service(s).`, rec: 'Define a HEALTHCHECK instruction.',
          wording: ['Without healthchecks, orchestrators cannot detect deadlocks.', 'A running container is not necessarily a healthy application.', 'Add healthchecks to enable automatic recovery and safe rollouts.', 'Load balancers rely on healthchecks to route traffic safely.', 'Silent failures will go unnoticed without them.', 'Health monitoring is critical for self-healing systems.'] },
        { id: 'r15', personas: ['sre', 'perf'], severity: 'Low', category: 'Reliability', condition: f => f.noRestart, classification: 'Optional recommendation', ruleName: 'No Restart Policy',
          evidence: f => `${f.noRestart} services lack a restart policy.`, rec: 'Set restart: unless-stopped or always.',
          wording: ['Services will not recover automatically if they crash.', 'A proper restart policy ensures resilience against transient errors.', 'The daemon will not restart the service after a host reboot.', 'Always define how the system handles process failures.', 'Missing restart rules lead to manual intervention during incidents.', 'Automation requires clear recovery instructions.'] },
        { id: 'r16', personas: ['sre', 'arch'], severity: 'High', category: 'Reliability', condition: f => f.missingHealthCondition, classification: 'Confirmed finding', ruleName: 'Missing Dependency Health Condition',
          evidence: f => `depends_on is used without condition: service_healthy.`, rec: 'Use the long syntax for depends_on with service_healthy.',
          wording: ['Simple depends_on only waits for the container to start, not to be ready.', 'This leads to connection refused errors during startup.', 'Use condition: service_healthy to ensure proper boot sequencing.', 'A robust startup requires waiting for upstream dependencies.', 'Race conditions during deployment are easily avoided.', 'Ensure the DB is actually accepting connections before booting the app.'] },
        { id: 'r17', personas: ['sre'], severity: 'Medium', category: 'Reliability', condition: f => f.statefulNoVolume, classification: 'Confirmed finding', ruleName: 'Stateful Without Volume',
          evidence: f => `Database service lacks a named volume.`, rec: 'Mount a named volume to persist database data.',
          wording: ['Databases without volumes will lose data when the container is removed.', 'Persistent data must live outside the container layer.', 'This is acceptable for caching, but fatal for primary datastores.', 'Ensure volumes are explicitly defined for stateful apps.', 'Data durability requires mapped storage.', 'A container restart should not wipe your entire database.'] },
        { id: 'r18', personas: ['sre', 'arch'], severity: 'High', category: 'Architecture', condition: f => f.spof, classification: 'Confirmed finding', ruleName: 'Single Point of Failure',
          evidence: f => `${f.spof} service(s) have 3+ dependents but no redundancy.`, rec: 'Ensure HA for highly dependent services.',
          wording: ['A central service without scaling limits your uptime.', 'If this bottleneck fails, multiple downstream services fail.', 'Critical dependencies must be deployed in highly available setups.', 'Consider decoupling heavily relied-upon components.', 'This structure creates a massive blast radius for a single crash.', 'High traffic will easily overwhelm this singular instance.'] },
        { id: 'r19', personas: ['sre'], severity: 'Medium', category: 'Reliability', condition: f => f.fragileStartup, classification: 'Confirmed finding', ruleName: 'Fragile Startup Ordering',
          evidence: f => `Deep dependency chain without healthchecks.`, rec: 'Implement proper healthchecks and wait-for-it scripts.',
          wording: ['Complex dependency chains fail randomly if healthchecks are missing.', 'You are relying on arbitrary timing for boot sequence.', 'Startup failures are hard to debug without health conditions.', 'Tightly coupled boots are inherently unstable.', 'Design services to tolerate upstream unavailability gracefully.', 'Do not assume a dependency is ready just because it is running.'] },
        { id: 'r20', personas: ['sec', 'arch'], severity: 'Medium', category: 'Security', condition: f => f.addedCapabilities, classification: 'Confirmed finding', ruleName: 'Unnecessary Capabilities',
          evidence: f => 'Found cap_add granting additional kernel capabilities.', rec: 'Avoid adding Linux capabilities unless strictly required.',
          wording: ['Adding capabilities extends the attack surface of the container.', 'Capabilities like SYS_ADMIN are nearly equivalent to root.', 'Only add capabilities that are absolutely necessary for the application.', 'Review if the container truly needs this kernel-level permission.', 'Capabilities can often be bypassed or abused to escape the container.', 'Drop all capabilities by default and selectively add them back.'] },

        // Architecture (21-30)

        { id: 'r21', personas: ['arch'], severity: 'High', category: 'Architecture', condition: f => f.deepDeps, classification: 'Confirmed finding', ruleName: 'Deep Dependency Chains',
          evidence: f => `Found a dependency chain deeper than 3 levels.`, rec: 'Flatten architecture or use event-driven patterns.',
          wording: ['Deep dependency chains increase the risk of cascading failures.', 'Startup sequences become fragile and slow.', 'Tightly coupled services are harder to deploy independently.', 'Consider adopting asynchronous communication (e.g. queues).', 'Long chains indicate potential domain boundary violations.', 'Flattening dependencies improves overall system resilience.'] },
        { id: 'r22', personas: ['perf', 'arch'], severity: 'Medium', category: 'Architecture', condition: f => f.sharedVolumes, classification: 'Confirmed finding', ruleName: 'Shared Data Volumes',
          evidence: f => `${f.sharedVolumes} volume(s) are shared across multiple services.`, rec: 'Avoid sharing state via filesystem; use network protocols.',
          wording: ['Sharing state via filesystems leads to concurrency and locking issues.', 'It breaks the stateless container paradigm.', 'Distributed systems should communicate over APIs, not shared disks.', 'This makes scaling across multiple physical hosts extremely difficult.', 'Shared volumes often cause invisible bottlenecks.', 'Prefer object storage or databases for shared state.'] },
        { id: 'r23', personas: ['plat', 'arch'], severity: 'Medium', category: 'Networking', condition: f => f.noCustomNet, classification: 'Confirmed finding', ruleName: 'Default Network Usage',
          evidence: f => `Using the default network; no custom networks defined.`, rec: 'Define custom bridge networks for service isolation.',
          wording: ['The default network lacks DNS resolution between containers.', 'Custom networks provide automatic service discovery.', 'You cannot easily isolate frontend and backend traffic.', 'Relying on the default bridge is an anti-pattern.', 'Always create explicit networks for predictable communication.', 'Network segmentation is a foundational security practice.'] },
        { id: 'r24', personas: ['arch'], severity: 'Medium', category: 'Architecture', condition: f => f.tooManyServices, classification: 'Confirmed finding', ruleName: 'Monolithic Compose',
          evidence: f => `${f.totalServices} services defined in one file.`, rec: 'Split into multiple compose files or use profiles.',
          wording: ['A massive compose file is difficult to maintain and understand.', 'Consider splitting infrastructure from application services.', 'Use Docker Compose profiles to toggle features.', 'Large files often blend distinct lifecycle boundaries.', 'Separation of concerns applies to infrastructure as code too.', 'Too many services in one place creates deployment friction.'] },
        { id: 'r25', personas: ['arch', 'plat'], severity: 'Low', category: 'Architecture', condition: f => f.isolatedServices, classification: 'Confirmed finding', ruleName: 'Isolated Services',
          evidence: f => `Services detected with no networks or dependencies.`, rec: 'Ensure services are connected to a network or properly integrated.',
          wording: ['An isolated service might be unreachable or redundant.', 'Verify that this service actually communicates with your stack.', 'Disconnected containers often result from configuration drift.', 'Ensure network attachments are correctly specified.', 'If it is a background worker, verify it can reach the queue.', 'An unlinked service serves no external value.'] },
        { id: 'r26', personas: ['arch'], severity: 'Medium', category: 'Architecture', condition: f => f.excessiveCoupling, classification: 'Confirmed finding', ruleName: 'Excessive Service Coupling',
          evidence: f => `A service has 5+ dependencies.`, rec: 'Decouple dependencies via message brokers or events.',
          wording: ['A service relying on 5+ others is highly coupled.', 'This indicates a "God service" anti-pattern.', 'It becomes impossible to test this service in isolation.', 'Consider splitting the service or using a message bus.', 'High coupling destroys independent deployability.', 'This architectural smell points to weak domain boundaries.'] },
        { id: 'r27', personas: ['plat'], severity: 'Low', category: 'Architecture', condition: f => f.orphanNetworks, classification: 'Confirmed finding', ruleName: 'Orphan Networks/Volumes',
          evidence: f => `Defined networks or volumes are not used by any service.`, rec: 'Remove unused declarations to clean up the file.',
          wording: ['Unused configurations create unnecessary confusion.', 'Keeping dead code in Compose files makes maintenance harder.', 'Clean up resources that are no longer actively consumed.', 'This is a clear sign of configuration rot.', 'Orphan resources can lead to deployment warnings.', 'Keep the infrastructure definition as lean as possible.'] },
        { id: 'r28', personas: ['arch'], severity: 'Medium', category: 'Architecture', condition: f => f.unclearBoundaries, classification: 'Confirmed finding', ruleName: 'Unclear Service Boundaries',
          evidence: f => `Multiple apps share the exact same database service.`, rec: 'Use logical databases or separate DB instances per service.',
          wording: ['Sharing a single database instance between distinct apps creates tight data coupling.', 'A schema change in one app can break another.', 'Give each service its own dedicated data store.', 'Shared databases violate microservice principles.', 'It makes scaling individual domains much harder.', 'Data ownership is critical for clean boundaries.'] },
        { id: 'r29', personas: ['arch', 'plat'], severity: 'High', category: 'Architecture', condition: f => f.multipleEntrypoints, classification: 'Confirmed finding', ruleName: 'Multiple Public Entrypoints',
          evidence: f => `More than 2 services bind public ports.`, rec: 'Use a single API Gateway or Reverse Proxy.',
          wording: ['Having multiple services exposed directly makes routing complex.', 'A single entrypoint simplifies TLS termination and auth.', 'An API Gateway provides a unified perimeter.', 'Direct access to multiple backends is an architectural anti-pattern.', 'Centralize edge routing to maintain control over traffic.', 'It is difficult to enforce global policies without a gateway.'] },
        { id: 'r30', personas: ['arch', 'sec'], severity: 'Medium', category: 'Architecture', condition: f => f.excessiveSharedNets, classification: 'Confirmed finding', ruleName: 'Excessive Shared Networks',
          evidence: f => `All services are attached to the same flat network.`, rec: 'Create tier-specific networks (e.g. frontend, backend).',
          wording: ['A single flat network provides zero lateral isolation.', 'If the web app is compromised, the DB is directly accessible.', 'Implement network tiers to restrict lateral movement.', 'The principle of least privilege applies to networking too.', 'Only connect services that explicitly need to talk.', 'Segment traffic to contain potential breaches.'] },

        // Performance & Cost (31-40)

        { id: 'r31', personas: ['plat', 'perf'], severity: 'Low', category: 'Optimization', condition: f => f.noLimits, classification: 'Optional recommendation', ruleName: 'No Resource Limits',
          evidence: f => `Resource limits (cpu/mem) are not defined.`, rec: 'Set deploy.resources limits.',
          wording: ['Unbounded containers can starve the host of resources.', 'A memory leak in one service will crash the entire node.', 'Always define memory and CPU quotas for stability.', 'Without limits, the OOM killer might terminate critical processes.', 'Predictable performance requires strict resource boundaries.', 'Capacity planning is impossible without defining constraints.'] },
        { id: 'r32', personas: ['devops', 'plat'], severity: 'Low', category: 'Optimization', condition: f => !f.multiStage, classification: 'Confirmed finding', ruleName: 'Single Stage Build',
          evidence: f => `Only 1 build stage detected.`, rec: 'Use multi-stage builds to reduce image size.',
          wording: ['Single-stage builds include unnecessary build tools in the final image.', 'The resulting image is bloated and slower to transfer.', 'It increases the attack surface by shipping compilers/toolchains.', 'Multi-stage builds neatly separate the build and runtime environments.', 'A smaller footprint drastically improves deployment speed.', 'You are likely shipping source code instead of just the artifact.'] },
        { id: 'r33', personas: ['sec', 'perf'], severity: 'Medium', category: 'Optimization', condition: f => f.broadCopy, classification: 'Confirmed finding', ruleName: 'Broad COPY Usage',
          evidence: f => `Found ${f.broadCopy} instance(s) of COPY . .`, rec: 'Copy only necessary files (e.g. package.json first).',
          wording: ['Copying the entire directory invalidates the build cache easily.', 'This slows down builds because it forces re-execution of downstream steps.', 'Always copy dependency manifests before the source code.', 'It might accidentally copy local secrets if .dockerignore is missing.', 'Granular copies ensure optimal layer caching.', 'Broad copies are a sign of unoptimized build pipelines.'] },
        { id: 'r34', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.noCacheCleanup, classification: 'Confirmed finding', ruleName: 'Missing Cache Cleanup',
          evidence: f => `Found package installations without cache cleanup.`, rec: 'Run rm -rf /var/lib/apt/lists/* in the same RUN step.',
          wording: ['Leaving package caches bloats the Docker image layer.', 'Cleanup must happen in the exact same RUN instruction.', 'Removing temporary files later does not shrink the underlying layer.', 'This is a simple way to shave megabytes off your image.', 'Unoptimized package managers can leave huge artifacts behind.', 'Efficient layers are key to fast registry pulls.'] },
        { id: 'r35', personas: ['perf'], severity: 'Low', category: 'Optimization', condition: f => f.oversizedBase, classification: 'Optional recommendation', ruleName: 'Oversized Base Image',
          evidence: f => `Base image does not indicate alpine/slim.`, rec: 'Switch to a slim or alpine variant of the base image.',
          wording: ['Consider using an Alpine or Slim variant to reduce the footprint.', 'An unoptimized base image increases pull times.', 'This is an optional recommendation to improve build speed and network transfer.', 'Smaller images naturally have a reduced attack surface.', 'Optimizing the base image is a good practice for production at scale.', 'Evaluate if a lighter base image meets your application needs.'] },
        { id: 'r36', personas: ['perf', 'devops'], severity: 'Medium', category: 'Optimization', condition: f => f.badOrdering, classification: 'Confirmed finding', ruleName: 'Cache-Unfriendly Ordering',
          evidence: f => `RUN commands placed after frequent COPY instructions.`, rec: 'Move unchanging RUN commands to the top of the file.',
          wording: ['Placing RUN after COPY means it reinstalls packages on every code change.', 'Maximize layer caching by placing static instructions first.', 'Install dependencies before copying source code.', 'This order wastes huge amounts of CI/CD pipeline time.', 'Docker cache invalidation happens top-down.', 'Optimize your Dockerfile for caching efficiency.'] },
        { id: 'r37', personas: ['perf'], severity: 'Low', category: 'Optimization', condition: f => f.redundantServices, classification: 'Inferred concern', ruleName: 'Redundant Services',
          evidence: f => `Multiple services share identical image, ports, and environment signatures.`, rec: 'Consolidate redundant services or use replicas.',
          wording: ['Inferred that these services might be redundant based on identical configurations.', 'If these are identical workers, consider using Docker Swarm replicas instead.', 'Duplicate definitions can complicate scaling.', 'This is an inferred concern; they may serve different logical purposes.', 'Consolidating identical services simplifies the compose file.', 'Check if these services can be merged into a single scaled service.'] },
        { id: 'r39', personas: ['perf', 'plat'], severity: 'Low', category: 'Optimization', condition: f => f.repeatedInstalls, classification: 'Confirmed finding', ruleName: 'Repeated Package Installation',
          evidence: f => `Multiple RUN apt-get/apk commands detected.`, rec: 'Chain package installations into a single RUN command.',
          wording: ['Multiple RUN commands create multiple image layers.', 'Each layer adds metadata and size overhead.', 'Chain installations using && to keep layers compact.', 'Consolidation makes cache cleanup easier.', 'Fewer layers mean faster pulls and extraction.', 'It is best practice to group related commands.'] },
        { id: 'r40', personas: ['perf'], severity: 'Low', category: 'Optimization', condition: f => f.cpuArchIssues, classification: 'Confirmed finding', ruleName: 'CPU Architecture Lock-in',
          evidence: f => `Hardcoded platform or specific architecture flags.`, rec: 'Avoid hardcoding platforms to allow multi-arch builds.',
          wording: ['Hardcoding linux/amd64 breaks compatibility with ARM instances.', 'Modern workflows require multi-architecture images.', 'Let the buildx engine determine the architecture dynamically.', 'Locking the architecture limits deployment flexibility.', 'Removing this flag enables deploying on cheaper ARM servers.', 'Avoid tying your Dockerfile to specific hardware.'] },

        // Batch 3 - Security (41-46)

        { id: 'r41', personas: ['sec', 'plat'], severity: 'High', category: 'Security', condition: f => f.ipcHost > 0, classification: 'Confirmed finding', ruleName: 'IPC Namespace Shared',
          evidence: f => `Found ${f.ipcHost} service(s) sharing the host IPC namespace.`, rec: 'Remove ipc: host to maintain memory isolation.',
          wording: ['Sharing the IPC namespace allows containers to access host shared memory.', 'This breaks container isolation fundamentally.', 'Malicious containers can read or write to host memory segments.', 'Only use host IPC for highly specific, trusted performance tooling.', 'It exposes the host to shared memory exploits.', 'Isolate the IPC namespace to prevent inter-process attacks.'] },
        { id: 'r42', personas: ['sec', 'plat'], severity: 'High', category: 'Security', condition: f => f.pidHost > 0, classification: 'Confirmed finding', ruleName: 'PID Namespace Shared',
          evidence: f => `Found ${f.pidHost} service(s) sharing the host PID namespace.`, rec: 'Remove pid: host to prevent host process visibility.',
          wording: ['Sharing the PID namespace allows the container to see and signal host processes.', 'This defeats process isolation.', 'A compromised container could kill critical host services.', 'It allows attackers to monitor host activity easily.', 'Do not use this unless building system-level monitoring agents.', 'Process visibility should be strictly confined to the container.'] },
        { id: 'r43', personas: ['sec', 'plat'], severity: 'High', category: 'Security', condition: f => f.usernsHost > 0, classification: 'Confirmed finding', ruleName: 'User Namespace Shared',
          evidence: f => `Found ${f.usernsHost} service(s) using userns_mode: host.`, rec: 'Avoid disabling user namespace remapping.',
          wording: ['Disabling user namespaces maps container root directly to host root.', 'This nullifies one of the strongest container security features.', 'It drastically increases the risk of privilege escalation.', 'Host user mapping should remain segregated.', 'Only disable user namespaces if strictly required by storage drivers.', 'Retain userns remapping for defense-in-depth.'] },
        { id: 'r44', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.seccompUnconfined > 0, classification: 'Confirmed finding', ruleName: 'Seccomp Unconfined',
          evidence: f => `Found seccomp:unconfined in security_opt.`, rec: 'Use the default seccomp profile or a custom restrictive one.',
          wording: ['Disabling seccomp allows the container to make any syscall to the kernel.', 'The default seccomp profile blocks dozens of dangerous syscalls safely.', 'Running unconfined massively increases the kernel attack surface.', 'Only unconfine seccomp for specific debugging tasks.', 'A confined seccomp profile is a critical security boundary.', 'Do not disable syscall filtering in production.'] },
        { id: 'r45', personas: ['sec'], severity: 'Medium', category: 'Security', condition: f => f.hostDevices > 0, classification: 'Inferred concern', ruleName: 'Host Devices Mapped',
          evidence: f => `Inferred risk: ${f.hostDevices} device(s) are mapped directly into containers.`, rec: 'Audit device mappings to ensure they are strictly necessary.',
          wording: ['Mapping host devices directly can provide direct hardware access.', 'This is an inferred concern; verify the device is not exploitable.', 'Attackers can use block devices to read host filesystems.', 'Limit device mapping to specific, low-risk hardware.', 'Direct hardware access bypasses standard filesystem isolation.', 'Audit the necessity of every mapped device.'] },
        { id: 'r46', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.hardcodedDockerfileSecrets > 0, classification: 'Confirmed finding', ruleName: 'Hardcoded Secrets in Dockerfile',
          evidence: f => `Found ${f.hardcodedDockerfileSecrets} suspicious ENV/ARG instructions in Dockerfile.`, rec: 'Use BuildKit secrets or runtime secret mounts.',
          wording: ['Hardcoding secrets in Dockerfile ENV/ARG bakes them into the image layers.', 'Anyone with the image can extract these credentials.', 'Use --mount=type=secret for build-time secrets.', 'Tokens and passwords should never be committed to the container filesystem.', 'This permanently compromises the leaked credentials.', 'Move secret injection to runtime environment variables or vaults.'] },

        // Batch 3 - Reliability (47-51)

        { id: 'r47', personas: ['sre'], severity: 'Low', category: 'Reliability', condition: f => f.noLogging > 0, classification: 'Optional recommendation', ruleName: 'Missing Logging Configuration',
          evidence: f => `${f.noLogging} service(s) rely on default logging drivers without explicit rotation.`, rec: 'Configure the logging driver with max-size and max-file.',
          wording: ['Default JSON logging without rotation will eventually fill the host disk.', 'Explicitly configure log rotation to prevent outages.', 'This is an optional recommendation for long-running nodes.', 'Disk exhaustion from logs is a common cause of production crashes.', 'Define log limits to maintain stable host storage.', 'Centralized logging drivers are preferred for distributed apps.'] },
        { id: 'r48', personas: ['sre', 'devops'], severity: 'Medium', category: 'Reliability', condition: f => f.deprecatedLinks > 0, classification: 'Confirmed finding', ruleName: 'Deprecated Links Used',
          evidence: f => `Found ${f.deprecatedLinks} service(s) using the legacy 'links' directive.`, rec: 'Use user-defined networks instead of links.',
          wording: ['The links directive is a legacy feature from older Docker versions.', 'It is deprecated and may be removed in future engine updates.', 'User-defined networks provide superior DNS resolution.', 'Migrating to networks ensures long-term compatibility.', 'Links create rigid, hard-to-maintain startup dependencies.', 'Modern Compose files should rely entirely on custom networks.'] },
        { id: 'r49', personas: ['sre', 'arch'], severity: 'Low', category: 'Reliability', condition: f => f.hardcodedContainerName > 0, classification: 'Optional recommendation', ruleName: 'Hardcoded Container Names',
          evidence: f => `Inferred risk: ${f.hardcodedContainerName} service(s) have a hardcoded container_name.`, rec: 'Remove container_name to allow horizontal scaling.',
          wording: ['Hardcoding a container name prevents scaling the service.', 'Docker Compose cannot start multiple replicas if the name is fixed.', 'This is an inferred concern if you intend to scale horizontally.', 'Let Compose generate dynamic names for flexibility.', 'Fixed names can cause deployment conflicts during rolling updates.', 'Avoid naming constraints in scalable architectures.'] },
        { id: 'r50', personas: ['sre', 'perf'], severity: 'Low', category: 'Reliability', condition: f => f.restartAlways > 0, classification: 'Optional recommendation', ruleName: 'Unconditional Restart Always',
          evidence: f => `${f.restartAlways} service(s) use restart: always.`, rec: 'Consider using restart: unless-stopped instead.',
          wording: ['Restart always will boot the container even if it was manually stopped.', 'Unless-stopped respects deliberate administrative shutdowns.', 'This is an optional recommendation for better daemon control.', 'Always restarting can mask crash loops during maintenance.', 'Unless-stopped is generally the preferred best practice.', 'Evaluate if you want containers booting after manual halts.'] },
        { id: 'r51', personas: ['sre', 'plat'], severity: 'Low', category: 'Reliability', condition: f => f.missingInit > 0, classification: 'Optional recommendation', ruleName: 'Missing Init Process',
          evidence: f => `${f.missingInit} service(s) do not define init: true.`, rec: 'Add init: true to properly reap zombie processes.',
          wording: ['Without an init process, zombie processes can accumulate and exhaust PIDs.', 'Adding init: true wraps the process in a lightweight init system.', 'This is an optional recommendation for Node.js or Java apps.', 'Proper signal forwarding requires a valid PID 1.', 'Tini prevents resource leaks from orphaned children.', 'Consider enabling init for long-running worker processes.'] },

        // Batch 3 - Architecture (52-56)

        { id: 'r52', personas: ['arch'], severity: 'Medium', category: 'Architecture', condition: f => f.volumesFrom > 0, classification: 'Confirmed finding', ruleName: 'Deprecated volumes_from',
          evidence: f => `Found ${f.volumesFrom} usage(s) of volumes_from.`, rec: 'Use top-level named volumes instead.',
          wording: ['The volumes_from directive is deprecated in modern Compose specifications.', 'Named volumes provide better portability and management.', 'Relying on volumes_from couples containers too tightly.', 'Top-level volumes are easier to backup and migrate.', 'Modernize your storage architecture using named volumes.', 'Avoid legacy storage patterns.'] },
        { id: 'r53', personas: ['arch', 'plat'], severity: 'Low', category: 'Architecture', condition: f => f.hostBindMounts > 0, classification: 'Optional recommendation', ruleName: 'Host Bind Mounts',
          evidence: f => `Detected ${f.hostBindMounts} host-bound path mount(s).`, rec: 'Use named volumes for persistent data to improve portability.',
          wording: ['Host bind mounts tie the container to specific absolute paths on the server.', 'Named volumes are managed by Docker and are cross-platform.', 'This is an optional recommendation for better environment portability.', 'Bind mounts can suffer from permissions issues across OSes.', 'Use named volumes to abstract storage away from the host filesystem.', 'Avoid hardcoding host paths unless strictly necessary.'] },
        { id: 'r54', personas: ['arch'], severity: 'Low', category: 'Architecture', condition: f => f.oldComposeVersion, classification: 'Optional recommendation', ruleName: 'Legacy Compose Version',
          evidence: f => `Legacy Compose version tag detected.`, rec: 'Evaluate migrating to the version-less Compose Specification.',
          wording: ['Older compose versions lack support for some modern features like deploy resources.', 'The version directive is technically deprecated by the Compose Spec.', 'This is an optional recommendation for long-term compatibility.', 'Legacy versions may limit your architectural options.', 'Consider updating the configuration format to community standards.', 'Modernizing the syntax simplifies the file structure.'] },
        { id: 'r55', personas: ['arch', 'devops'], severity: 'Low', category: 'Architecture', condition: f => f.macAddress > 0, classification: 'Inferred concern', ruleName: 'Hardcoded MAC Address',
          evidence: f => `Inferred risk: ${f.macAddress} service(s) have hardcoded mac_address fields.`, rec: 'Let Docker assign MAC addresses dynamically.',
          wording: ['Hardcoding MAC addresses can lead to layer 2 network collisions.', 'This is an inferred concern for scalable environments.', 'Unless legacy licensing requires it, avoid fixed MACs.', 'Dynamic allocation prevents networking conflicts.', 'Fixed hardware addresses break the portability of the container.', 'Re-evaluate the necessity of rigid network constraints.'] },
        { id: 'r56', personas: ['arch', 'sre'], severity: 'Medium', category: 'Architecture', condition: f => f.shellFormCmd > 0, classification: 'Inferred concern', ruleName: 'Shell Form CMD/ENTRYPOINT',
          evidence: f => `Inferred risk: ${f.shellFormCmd} instruction(s) use shell form (no JSON brackets).`, rec: 'Use the exec form e.g., CMD ["node", "app.js"].',
          wording: ['Shell form executes via /bin/sh -c, which does not pass OS signals to the app.', 'This causes graceful shutdowns (SIGTERM) to fail.', 'This is an inferred concern affecting container lifecycle management.', 'Use the JSON array exec form for predictable behavior.', 'Apps running in shell form cannot be cleanly killed.', 'Ensure your process receives shutdown signals correctly.'] },

        // Batch 3 - Optimization/Performance (57-61)

        { id: 'r57', personas: ['devops', 'sec'], severity: 'Low', category: 'Optimization', condition: f => f.useAdd > 0, classification: 'Optional recommendation', ruleName: 'Avoid ADD Instruction',
          evidence: f => `Found ${f.useAdd} ADD instruction(s).`, rec: 'Use COPY instead of ADD unless you specifically need auto-extraction.',
          wording: ['The ADD instruction automatically extracts archives and fetches remote URLs.', 'COPY is more transparent and predictable.', 'This is an optional recommendation for clearer Dockerfiles.', 'Fetching URLs with ADD prevents layer cache validation.', 'Using COPY ensures you know exactly what enters the image.', 'Only use ADD when unpacking a local tarball.'] },
        { id: 'r58', personas: ['devops', 'arch'], severity: 'Low', category: 'Optimization', condition: f => f.noWorkdir, classification: 'Optional recommendation', ruleName: 'Missing WORKDIR',
          evidence: f => `No WORKDIR instruction defined.`, rec: 'Define a WORKDIR to establish a clear execution context.',
          wording: ['Without WORKDIR, commands run in the root filesystem (/).', 'Setting WORKDIR creates the directory safely and scopes your app.', 'This is an optional recommendation for better filesystem organization.', 'Running applications in root (/) is messy and harder to secure.', 'Establishing a working directory makes relative paths predictable.', 'Keep application code isolated in its own folder.'] },
        { id: 'r59', personas: ['devops', 'perf'], severity: 'Low', category: 'Optimization', condition: f => f.noExpose, classification: 'Optional recommendation', ruleName: 'Missing EXPOSE',
          evidence: f => `No EXPOSE instruction found.`, rec: 'Add EXPOSE to document the intended listening ports.',
          wording: ['EXPOSE serves as vital documentation for network engineers.', 'It helps automated tools understand port requirements.', 'This is an optional recommendation for improved maintainability.', 'Even if ports are mapped in Compose, EXPOSE clarifies image intent.', 'Self-documenting images are easier to integrate into new environments.', 'Always declare the ports your application expects to use.'] },
        { id: 'r60', personas: ['perf'], severity: 'Low', category: 'Optimization', condition: f => f.tooManyRuns, classification: 'Optional recommendation', ruleName: 'Overuse of RUN Instructions',
          evidence: f => `Detected an excessive number of consecutive RUN commands.`, rec: 'Chain consecutive RUN commands using &&.',
          wording: ['Every RUN command creates a new, immutable image layer.', 'If these RUN commands are logically related, consolidating them reduces metadata.', 'This is an optional recommendation to reduce image footprint.', 'Grouping related package installations optimizes the build process.', 'Use multi-line chained commands for complex installations.', 'Keep the layer count efficient by chaining related commands.'] },
        { id: 'r61', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.aptUpgrade > 0, classification: 'Optional recommendation', ruleName: 'Package Upgrades in Dockerfile',
          evidence: f => `Found ${f.aptUpgrade} system upgrade command(s) (e.g. apt-get upgrade).`, rec: 'Rely on the base image for updates; avoid running bulk upgrades.',
          wording: ['Running bulk upgrades creates bloated, non-deterministic layers.', 'It duplicates packages already provided by the base image.', 'If the base is outdated, pull a newer version of the base image instead.', 'Upgrades often invalidate the cache unpredictably.', 'Bulk updates defeat the purpose of controlled container images.', 'Keep images reproducible by avoiding blind system updates.'] },

        // Batch 4 - Security (62-67)
        { id: 'r62', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.pipedScriptToShell > 0, classification: 'Confirmed finding', ruleName: 'Remote Script Piped to Shell',
          evidence: f => `Found ${f.pipedScriptToShell} instance(s) of curl/wget piped directly to sh/bash.`, rec: 'Download the script, verify its checksum, then execute it.',
          wording: ['Piping remote scripts directly to a shell bypasses verification.', 'If the remote source is compromised, the attacker gains full build execution.', 'Network interruptions can cause partial, dangerous script execution.', 'Always verify the checksum of downloaded scripts before execution.', 'This is a classic supply-chain vulnerability pattern.', 'Avoid arbitrary remote execution during the build phase.'] },
        { id: 'r63', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.chmod777 > 0, classification: 'Confirmed finding', ruleName: 'Dangerous Permissions (777)',
          evidence: f => `Found ${f.chmod777} instance(s) of chmod 777.`, rec: 'Use the principle of least privilege (e.g., 755 or 644).',
          wording: ['Granting 777 permissions allows any user to read, write, and execute the file.', 'This breaks fundamental filesystem security boundaries.', 'Attackers can easily tamper with world-writable files.', 'Identify the specific user that needs access and use chown instead.', 'There is almost no valid use case for 777 in a production image.', 'Scope file permissions strictly to the required application user.'] },
        { id: 'r64', personas: ['sec'], severity: 'Medium', category: 'Security', condition: f => f.useOfSudo > 0, classification: 'Confirmed finding', ruleName: 'Use of sudo in Dockerfile',
          evidence: f => `Found ${f.useOfSudo} instance(s) of sudo execution.`, rec: 'Remove sudo and use the USER instruction to switch contexts.',
          wording: ['Using sudo in a Dockerfile is an anti-pattern that creates bloated layers.', 'It implies the image contains the sudo binary, expanding the attack surface.', 'Use the USER instruction to switch to root, execute commands, and switch back.', 'Privilege escalation tools should not be shipped in production containers.', 'Docker inherently controls user execution contexts without sudo.', 'Remove sudo to adhere to container security best practices.'] },
        { id: 'r65', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.sensitiveCopy > 0, classification: 'Inferred concern', ruleName: 'Sensitive Files Copied',
          evidence: f => `Inferred risk: ${f.sensitiveCopy} COPY/ADD instruction(s) target potentially sensitive files (.ssh, .aws keys).`, rec: 'Use BuildKit secrets instead of copying credentials into the image.',
          wording: ['Copying SSH keys or cloud credentials bakes them permanently into the image layers.', 'Anyone with registry access can extract these secrets.', 'This is an inferred concern based on the filename pattern.', 'Use --mount=type=secret to access credentials safely during the build.', 'Secret files should never exist on the container filesystem.', 'Audit the source paths of these copy instructions carefully.'] },
        { id: 'r66', personas: ['sec', 'sre'], severity: 'Medium', category: 'Security', condition: f => f.sysctlsModified > 0, classification: 'Confirmed finding', ruleName: 'Sysctls Modified',
          evidence: f => `Found ${f.sysctlsModified} service(s) modifying kernel parameters via sysctls.`, rec: 'Ensure sysctl modifications are strictly necessary and understood.',
          wording: ['Modifying sysctls alters the kernel behavior for the container network or IPC.', 'Improper sysctl tuning can cause host-level instability.', 'Verify that these kernel parameters do not weaken network security.', 'Containers should ideally rely on default namespaces.', 'Tuning network stacks is rarely needed for standard applications.', 'Audit these parameters to ensure they do not expose vulnerabilities.'] },
        { id: 'r67', personas: ['sec'], severity: 'High', category: 'Security', condition: f => f.secretBuildArgs > 0, classification: 'Inferred concern', ruleName: 'Secret Build Arguments',
          evidence: f => `Found ${f.secretBuildArgs} suspicious build.args name(s) suggesting secrets (e.g. TOKEN, PASSWORD).`, rec: 'Use Docker secrets or runtime environment variables instead of build arguments.',
          wording: ['Build arguments are visible in docker history of the image.', 'Injecting secrets via build args can leak them into image metadata.', 'Use BuildKit secret mounts for build-time credentials.', 'Anyone pulling the image may be able to read these values.', 'Move sensitive configuration entirely to the runtime environment.', 'Build arguments should only be used for non-sensitive configuration.'] },

        // Batch 4 - Reliability (68-73)

        { id: 'r68', personas: ['devops', 'sre'], severity: 'Low', category: 'Reliability', condition: f => f.unpinnedPackages > 0, classification: 'Optional recommendation', ruleName: 'Unpinned Package Installations',
          evidence: f => `Found ${f.unpinnedPackages} package install(s) without explicit version pinning.`, rec: 'Pin package versions (e.g., apt-get install pkg=1.2.3).',
          wording: ['Installing unpinned packages breaks build reproducibility.', 'A build tomorrow might pull a newer, incompatible version.', 'This is an optional recommendation to strictly control dependencies.', 'Version pinning ensures consistent behavior across all environments.', 'Unexpected upstream updates can cause sudden pipeline failures.', 'Always lock down system package versions in production.'] },
        { id: 'r69', personas: ['devops'], severity: 'High', category: 'Reliability', condition: f => f.invalidCopyFrom > 0, classification: 'Confirmed finding', ruleName: 'Invalid COPY --from Reference',
          evidence: f => `Found ${f.invalidCopyFrom} COPY --from instruction(s) referencing a numeric stage index out of range.`, rec: 'Ensure the referenced stage name or index matches an earlier FROM declaration.',
          wording: ['Referencing an out-of-range stage index will cause the build to fail.', 'The numeric index provided to --from exceeds the number of declared stages.', 'Double-check the stage numbering and alias declarations.', 'Multi-stage copies require strict name or index matching.', 'This explicitly breaks the container build process.', 'Ensure all build dependencies are correctly chained.'] },
        { id: 'r70', personas: ['sre'], severity: 'Low', category: 'Reliability', condition: f => f.incompleteHealthcheck > 0, classification: 'Optional recommendation', ruleName: 'Incomplete Healthcheck',
          evidence: f => `Found ${f.incompleteHealthcheck} healthcheck(s) missing timeout or retries.`, rec: 'Explicitly define timeout, interval, and retries for all healthchecks.',
          wording: ['Relying on default healthcheck intervals can delay failure detection.', 'Explicit timeouts ensure deadlocks are caught quickly.', 'This is an optional recommendation for tighter orchestration control.', 'Unconfigured healthchecks might cause premature container restarts.', 'Define strict boundaries for what constitutes a healthy state.', 'Tailor the retry logic to the startup time of your application.'] },
        { id: 'r71', personas: ['arch', 'plat'], severity: 'Low', category: 'Reliability', condition: f => f.staticIpConflicts > 0, classification: 'Inferred concern', ruleName: 'Static IP Assignments',
          evidence: f => `Inferred risk: ${f.staticIpConflicts} service(s) assign static IPv4 addresses.`, rec: 'Rely on Docker DNS for service discovery instead of static IPs.',
          wording: ['Hardcoding static IP addresses drastically limits horizontal scaling.', 'It causes network collisions if multiple environments share the engine.', 'This is an inferred concern restricting architectural flexibility.', 'Use the built-in Docker DNS resolver by referencing service names.', 'Static IPs are an anti-pattern in dynamic orchestrators.', 'Abstract network addressing away from the application logic.'] },
        { id: 'r72', personas: ['sre', 'perf'], severity: 'Medium', category: 'Reliability', condition: f => f.oomKillDisable > 0, classification: 'Confirmed finding', ruleName: 'OOM Kill Disabled',
          evidence: f => `Found ${f.oomKillDisable} service(s) with oom_kill_disable: true.`, rec: 'Remove this flag and set appropriate memory limits instead.',
          wording: ['Disabling the OOM killer allows a leaking container to crash the entire host.', 'This flag prevents the kernel from resolving memory exhaustion safely.', 'It is highly dangerous in multi-tenant environments.', 'Instead of disabling OOM, profile the application and set strict memory limits.', 'Host stability must always take precedence over a single container.', 'This defeats critical Linux resource protection mechanisms.'] },
        { id: 'r73', personas: ['sec', 'plat'], severity: 'Low', category: 'Reliability', condition: f => f.riskyDevControls > 0, classification: 'Optional recommendation', ruleName: 'Development Controls Enabled (tty/stdin)',
          evidence: f => `Found ${f.riskyDevControls} service(s) with tty or stdin_open enabled.`, rec: 'Remove tty and stdin_open in production environments.',
          wording: ['Keeping stdin open allocates a permanent interactive terminal.', 'These flags are meant for local debugging, not production workloads.', 'This is an optional recommendation to harden the container environment.', 'It unnecessarily consumes host resources to keep the pipe open.', 'Production services should run as detached, headless daemons.', 'Remove interactive debugging flags before deployment.'] },

        // Batch 4 - Optimization (74-81)

        { id: 'r74', personas: ['arch', 'perf'], severity: 'Medium', category: 'Optimization', condition: f => f.sharedWritableVolume > 0, classification: 'Inferred concern', ruleName: 'Shared Writable Volume',
          evidence: f => `Inferred risk: ${f.sharedWritableVolume} named volume(s) are writable and shared across multiple services.`, rec: 'Ensure concurrent writes are handled safely, or mount as :ro for readers.',
          wording: ['Sharing a writable volume across services can lead to race conditions and file corruption.', 'If a service only reads the data, mount the volume with the :ro flag.', 'This is an inferred concern regarding concurrent state management.', 'Applications must be specifically designed to handle shared filesystem writes.', 'Using a dedicated database or object store is safer than shared disk I/O.', 'Strictly scope write permissions to the single authoritative service.'] },
        { id: 'r75', personas: ['arch', 'sec'], severity: 'Medium', category: 'Optimization', condition: f => f.buildNetworkHost > 0, classification: 'Confirmed finding', ruleName: 'Build Network Host Mode',
          evidence: f => `Found ${f.buildNetworkHost} service(s) using build.network: host.`, rec: 'Avoid host networking during builds to ensure reproducibility.',
          wording: ['Building on the host network breaks the isolation of the build process.', 'The build might succeed locally but fail in isolated CI/CD environments.', 'It exposes the host network stack to potentially untrusted build scripts.', 'Builds should be strictly hermetic and rely only on standard outbound access.', 'This couples the artifact to the specific host network configuration.', 'Remove this to guarantee portable, repeatable builds.'] },
        { id: 'r76', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.aptNoRecommends > 0, classification: 'Optional recommendation', ruleName: 'Missing --no-install-recommends',
          evidence: f => `Found ${f.aptNoRecommends} apt-get install(s) without --no-install-recommends.`, rec: 'Add --no-install-recommends to avoid installing unnecessary dependencies.',
          wording: ['By default, apt-get installs recommended but unnecessary packages.', 'This inflates the image size significantly.', 'This is an optional recommendation to keep images lean.', 'Fewer packages mean a smaller attack surface and faster pull times.', 'Always explicitly define the packages your application requires.', 'Trimming recommended packages is a standard Dockerfile optimization.'] },
        { id: 'r77', personas: ['perf', 'devops'], severity: 'Low', category: 'Optimization', condition: f => f.pipNoCache > 0, classification: 'Optional recommendation', ruleName: 'Missing pip --no-cache-dir',
          evidence: f => `Found ${f.pipNoCache} pip install(s) without --no-cache-dir.`, rec: 'Add --no-cache-dir to pip commands to reduce layer size.',
          wording: ['Pip caches downloaded wheels locally, which bloats the Docker layer.', 'Because the layer is immutable, this cache is entirely useless at runtime.', 'This is an optional recommendation to save megabytes of space.', 'Disabling the cache ensures the final layer only contains the installed libraries.', 'It speeds up extraction and reduces storage costs.', 'This is a fundamental Python optimization for containers.'] },
        { id: 'r78', personas: ['perf', 'sre'], severity: 'Low', category: 'Optimization', condition: f => f.npmNonDeterministic > 0, classification: 'Optional recommendation', ruleName: 'Non-Deterministic npm install',
          evidence: f => `Found ${f.npmNonDeterministic} use(s) of npm install when a lockfile is present. Consider npm ci.`, rec: 'Use npm ci in automated builds for strict lockfile adherence.',
          wording: ['Using npm install can implicitly update the package-lock.json during the build.', 'This breaks build reproducibility across different environments.', 'This is an optional recommendation to guarantee dependency locking.', 'Using npm ci strictly installs the exact versions from the lockfile.', 'It is significantly faster and safer for production builds.', 'Ensure your CI/CD pipelines always use deterministic installations.'] },
        { id: 'r79', personas: ['perf', 'arch'], severity: 'Low', category: 'Optimization', condition: f => f.unusedBuildStages > 0, classification: 'Optional recommendation', ruleName: 'Potentially Unused Build Stages',
          evidence: f => `Found ${f.unusedBuildStages} intermediate stage(s) with no detected COPY --from reference.`, rec: 'Review whether these stages are actively used, and remove them if not.',
          wording: ['Intermediate build stages that are never referenced may waste build time.', 'They execute instructions and download dependencies unnecessarily.', 'This is an optional recommendation; verify the stages are not used externally.', 'Removing dead stages streamlines the pipeline.', 'Keep the Dockerfile focused only on necessary artifact generation.', 'Clean up orphaned stages to maintain a clear configuration.'] },
        { id: 'r80', personas: ['perf', 'plat'], severity: 'Low', category: 'Optimization', condition: f => f.unusedSecrets > 0, classification: 'Optional recommendation', ruleName: 'Declared Unused Secrets',
          evidence: f => `Found ${f.unusedSecrets} globally declared secret(s) not attached to any service.`, rec: 'Remove unused secrets from the Compose file.',
          wording: ['Declaring secrets that no service uses adds unnecessary complexity.', 'It forces orchestrators to manage cryptographic objects pointlessly.', 'This is an optional recommendation for cleaner file structure.', 'Dead configuration confuses operators and maintainers.', 'Keep the Compose file tightly scoped to active requirements.', 'Audit the secrets block and prune unused entries.'] },
        { id: 'r81', personas: ['perf', 'plat'], severity: 'Low', category: 'Optimization', condition: f => f.unusedConfigs > 0, classification: 'Optional recommendation', ruleName: 'Declared Unused Configs',
          evidence: f => `Found ${f.unusedConfigs} globally declared config(s) not attached to any service.`, rec: 'Remove unused configs from the Compose file.',
          wording: ['Declaring global configs that no service mounts clutters the configuration.', 'It requires the orchestrator to sync state for unused data.', 'This is an optional recommendation to improve maintainability.', 'Dead configuration payloads should be removed.', 'Ensure all declared resources are actively consumed.', 'Pruning unused configs prevents orchestration overhead.'] }
    ]
    const SCENARIOS = [
        { id: 'sc14', priority: 1, cond: (f, res) => res.medium > 2 && f.hardcodedDockerfileSecrets > 0, verdict: 'Compromised Supply Chain', desc: 'Secrets are baked into the image, rendering the artifact permanently compromised.' },
        { id: 'sc19', priority: 2, cond: (f, res) => res.high > 0 && (f.pipedScriptToShell > 0 || f.hardcodedDockerfileSecrets > 0 || f.invalidCopyFrom > 0 || f.secretBuildArgs > 0), verdict: 'Supply-Chain Risks Detected', desc: 'The build configuration introduces severe vulnerabilities via insecure scripts, hardcoded secrets, or broken dependencies.' },
        { id: 'sc20', priority: 3, cond: (f, res) => res.high > 0 && (f.ipcHost > 0 || f.pidHost > 0 || f.usernsHost > 0 || f.seccompUnconfined > 0), verdict: 'Excessive Container Privileges', desc: 'Crucial isolation boundaries are disabled, granting the workload dangerous visibility into the host system.' },
        { id: 'sc13', priority: 4, cond: (f, res) => res.high > 0 && f.ipcHost > 0, verdict: 'Severe Isolation Breakdown', desc: 'Critical isolation mechanisms are disabled, exposing the host directly to the workload.' },
        { id: 'sc1', priority: 5, cond: (f, res) => res.critical > 0 && res.high > 2, verdict: 'High Risk Configuration', desc: 'Severe structural and security flaws. Do not deploy to exposed environments.' },
        { id: 'sc2', priority: 6, cond: (f, res) => res.critical > 0 && f.totalServices <= 2, verdict: 'Development Config with Production Risks', desc: 'A local development setup that contains critical production risks like privileged mode or root access.' },
        { id: 'sc3', priority: 7, cond: (f, res) => res.critical === 0 && res.high > 0 && res.medium > 2, verdict: 'Overexposed Architecture', desc: 'Significant security and architectural exposure. Requires immediate hardening.' },
        { id: 'sc5', priority: 8, cond: (f, res) => f.excessiveCoupling, verdict: 'High Service Coupling', desc: 'Services are tightly entangled. A failure in one domain will likely cascade.' },
        { id: 'sc17', priority: 9, cond: (f, res) => res.high === 0 && f.deprecatedLinks > 0, verdict: 'Fragile Legacy Networking', desc: 'Overall secure, but relies on deprecated linking mechanics instead of modern networks.' },
        { id: 'sc21', priority: 10, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium > 2 && (f.oomKillDisable > 0 || f.restartAlways > 0 || f.sharedWritableVolume > 0), verdict: 'Operationally Fragile Architecture', desc: 'Security is acceptable, but the configuration employs risky operational overrides that threaten host stability.' },
        { id: 'sc7', priority: 11, cond: (f, res) => res.critical === 0 && res.high > 0 && f.totalServices <= 2, verdict: 'Simple with Security Gaps', desc: 'A basic setup that works but contains notable security or architectural risks.' },
        { id: 'sc15', priority: 12, cond: (f, res) => res.medium > 1 && f.oldComposeVersion, verdict: 'Legacy Infrastructure Definition', desc: 'The configuration relies on deprecated syntax and patterns that limit modern capabilities.' },
        { id: 'sc18', priority: 13, cond: (f, res) => res.critical === 0 && res.high === 0 && f.shellFormCmd > 0, verdict: 'Lifecycle Management Risks', desc: 'Functional structure, but improper command formatting prevents graceful container shutdowns.' },
        { id: 'sc16', priority: 14, cond: (f, res) => res.medium === 0 && res.low > 3 && f.tooManyRuns, verdict: 'Unoptimized Build Pipeline', desc: 'Configuration works securely but suffers from severe inefficiencies in build caching and layering.' },
        { id: 'sc4', priority: 15, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium > 2 && f.noHealth, verdict: 'Strong Security Baseline with Reliability Gaps', desc: 'Security is solid, but the setup is fragile due to missing healthchecks and restart policies.' },
        { id: 'sc23', priority: 16, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium === 0 && res.low > 0 && f.totalServices > 3 && f.unusedBuildStages === 0, verdict: 'Strong Build with Weak Runtime Controls', desc: 'The image generation is secure and optimized, but runtime resource limits or healthchecks are missing.' },
        { id: 'sc22', priority: 17, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium === 0 && res.low > 3 && (f.aptNoRecommends > 0 || f.pipNoCache > 0 || f.npmNonDeterministic > 0), verdict: 'Baseline with Bloated Images', desc: 'Functional runtime posture, but the build process ignores fundamental caching and size optimizations.' },
        { id: 'sc8', priority: 18, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium === 0 && res.low > 2, verdict: 'Resilient but Inefficient Configuration', desc: 'Stable and secure, but bloats images and consumes excessive resources.' },
        { id: 'sc6', priority: 19, cond: (f, res) => res.critical === 0 && res.high === 0 && f.spof > 0, verdict: 'Baseline with Bottlenecks', desc: 'Generally safe, but contains a clear single point of failure that impacts uptime.' },
        { id: 'sc10', priority: 20, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium > 2, verdict: 'Baseline but Unoptimized', desc: 'Security is decent, but reliability or performance concerns exist.' },
        { id: 'sc9', priority: 21, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium <= 2 && f.totalServices > 3, verdict: 'Complex Configuration Baseline', desc: 'A well-structured, complex configuration adhering to most best practices.' },
        { id: 'sc24', priority: 22, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium === 0 && res.low === 0, verdict: 'Clean Static Analysis', desc: 'No significant issues were detected by the current static-analysis rules.' },
        { id: 'sc11', priority: 23, cond: (f, res) => res.critical === 0 && res.high === 0 && res.medium === 0 && res.low === 0, verdict: 'Standard Baseline', desc: 'No significant issues were detected by the current static-analysis rules.' },
        { id: 'sc12', priority: 24, cond: (f, res) => true, verdict: 'Standard Setup', desc: 'Standard configuration with a mix of minor improvements available.' }
    ];

    function runExpertAnalysis(composeDoc, dfDoc, mode) {
        if (!expertContent) return;

        // If nothing has been validated yet, show a pre-validation state.
        // For compose: require at least a non-null doc (services check is handled inside generateFacts).
        // For dockerfile: require at least one parsed stage.
        const hasContent = (mode === 'compose' && composeDoc != null) ||
                           (mode === 'dockerfile' && dfDoc != null && dfDoc.stages != null);
        if (!hasContent) {
            if (expertLoading) {
                expertLoading.style.display = 'flex';
                expertLoading.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:0.95rem; padding:20px;">Validate a configuration first to run the expert analysis.</div>`;
            }
            if (expertContent) expertContent.style.display = 'none';
            return;
        }
        
        expertLoading.style.display = 'none';
        expertContent.style.display = 'flex';

        const facts = generateFacts(composeDoc, dfDoc, mode);
        const results = { critical: 0, high: 0, medium: 0, low: 0, rules: [] };
        
        EXPERT_RULES.forEach(rule => {
            const triggered = rule.condition(facts);
            if (triggered) {
                results[rule.severity.toLowerCase()]++;
                results.rules.push(rule);
            }
        });

        // Deduplicate rules based on exact same evidence if necessary, though rule definitions are distinct
        
        let validScenarios = SCENARIOS.filter(s => s.cond(facts, results));
        validScenarios.sort((a, b) => a.priority - b.priority);
        let bestScenario = validScenarios[0];

        renderExpertReview(facts, results, bestScenario, mode === 'compose' ? composeDoc : dfDoc);
    }

    function generateFacts(compose, df, mode) {
        const f = {
            hasRoot: 0, isPrivileged: 0, publicDb: 0, hasSock: 0, hostNet: 0, secretsInEnv: 0,
            latestTags: 0, noTags: 0, noHealth: 0, noRestart: 0, deepDeps: false, spof: 0,
            sharedVolumes: 0, excessivePorts: 0, noCustomNet: true, multiStage: false,
            broadCopy: 0, noCacheCleanup: false, totalServices: 0, noLimits: 0,
            hasNoNewPrivileges: true, sensitiveBindMounts: false, wildcardBinding: false,
            insecureEnvFile: false, excessiveCoupling: false, isolatedServices: false,
            orphanNetworks: false, unclearBoundaries: false, multipleEntrypoints: false,
            excessiveSharedNets: false, oversizedBase: false, badOrdering: false,
            redundantServices: false, unnecessaryContext: false, repeatedInstalls: false,
            cpuArchIssues: false, readOnlyRoot: true, missingHealthCondition: false, addedCapabilities: false,
            statefulNoVolume: false, fragileStartup: false,
            ipcHost: 0, pidHost: 0, usernsHost: 0, seccompUnconfined: 0, hostDevices: 0,
            hardcodedDockerfileSecrets: 0, noLogging: 0, deprecatedLinks: 0, hardcodedContainerName: 0,
            restartAlways: 0, missingInit: 0, volumesFrom: 0, hostBindMounts: 0,
            oldComposeVersion: false, macAddress: 0, shellFormCmd: 0, useAdd: 0,
            noWorkdir: true, noExpose: true, tooManyRuns: false, aptUpgrade: 0,
            pipedScriptToShell: 0, chmod777: 0, useOfSudo: 0, sensitiveCopy: 0,
            unpinnedPackages: 0, invalidCopyFrom: 0, aptNoRecommends: 0, pipNoCache: 0,
            npmNonDeterministic: 0, unusedBuildStages: 0,
            sysctlsModified: 0, secretBuildArgs: 0, sharedWritableVolume: 0, buildNetworkHost: 0,
            incompleteHealthcheck: 0, staticIpConflicts: 0, oomKillDisable: 0, riskyDevControls: 0,
            unusedSecrets: 0, unusedConfigs: 0
        };

        if (mode === 'compose' && compose && compose.services) {
            f.totalServices = Object.keys(compose.services).length;
            const dbKeys = ['postgres', 'mysql', 'mongo', 'redis', 'mariadb', 'elasticsearch'];
            let netCount = compose.networks ? Object.keys(compose.networks).length : 0;
            
            const writableVols = new Set();
            const sharedVols = new Set();
            // sharedWritableVolume is computed at end of volume scan below
            const declSec = compose.secrets ? Object.keys(compose.secrets) : [];
            const declConf = compose.configs ? Object.keys(compose.configs) : [];
            let usedSec = new Set();
            let usedConf = new Set();
            Object.values(compose.services).forEach(s => {
                if (s.secrets) s.secrets.forEach(sec => usedSec.add(typeof sec === 'string' ? sec : sec.source));
                if (s.configs) s.configs.forEach(cfg => usedConf.add(typeof cfg === 'string' ? cfg : cfg.source));
            });
            declSec.forEach(sec => { if (!usedSec.has(sec)) f.unusedSecrets++; });
            declConf.forEach(cfg => { if (!usedConf.has(cfg)) f.unusedConfigs++; });

            if (netCount > 0) f.noCustomNet = false;
            else f.excessiveSharedNets = true;
            
            if (compose.version) {
                const v = compose.version.toString();
                if (v === '1' || v === '2' || v.startsWith('2.')) f.oldComposeVersion = true;
            }

            let pubPorts = 0;
            let publicServices = 0;
            const depCounts = {};
            const netUsage = new Set();
            const volUsage = new Set();
            const imgUsage = new Map();

            Object.entries(compose.services).forEach(([name, s]) => {
                if (!s.user) f.hasRoot++;
                if (s.privileged === true || s.privileged === 'true') f.isPrivileged++;
                if (s.network_mode === 'host') f.hostNet++;
                if (!s.healthcheck) f.noHealth++;
                if (!s.restart) f.noRestart++;
                if (!s.deploy || !s.deploy.resources) f.noLimits++;
                
                if (s.read_only !== true) f.readOnlyRoot = false;
                
                let hasOpt = false;
                if (s.security_opt) {
                    (Array.isArray(s.security_opt) ? s.security_opt : [s.security_opt]).forEach(opt => { if (opt.includes('no-new-privileges')) hasOpt = true; });
                }
                if (!hasOpt) f.hasNoNewPrivileges = false;
                
                

                if (s.ipc === 'host' || s.ipc === 'shareable') f.ipcHost++;
                if (s.pid === 'host') f.pidHost++;
                if (s.userns_mode === 'host') f.usernsHost++;
                if (s.security_opt) {
                    (Array.isArray(s.security_opt) ? s.security_opt : [s.security_opt]).forEach(opt => { 
                        if (opt.includes('seccomp:unconfined') || opt.includes('seccomp=unconfined')) f.seccompUnconfined++;
                    });
                }
                if (s.devices) f.hostDevices += s.devices.length;
                if (!s.logging) f.noLogging++;
                if (s.links) f.deprecatedLinks++;
                if (s.container_name) f.hardcodedContainerName++;
                if (s.restart === 'always') f.restartAlways++;
                if (!s.init) f.missingInit++;
                if (s.volumes_from) f.volumesFrom++;
                if (s.mac_address) f.macAddress++;
                if (s.sysctls) f.sysctlsModified++;
                if (s.oom_kill_disable) f.oomKillDisable++;
                if (s.tty || s.stdin_open) f.riskyDevControls++;
                if (s.healthcheck && (!s.healthcheck.timeout || !s.healthcheck.retries)) f.incompleteHealthcheck++;
                if (s.networks) {
                    Object.values(s.networks).forEach(net => {
                        if (net && net.ipv4_address) f.staticIpConflicts++;
                    });
                }
                if (s.build) {
                    if (s.build.network === 'host') f.buildNetworkHost++;
                    if (s.build.args) {
                        const argsStr = JSON.stringify(s.build.args).toUpperCase();
                        if (argsStr.includes('PASS') || argsStr.includes('SECRET') || argsStr.includes('TOKEN') || argsStr.includes('KEY')) f.secretBuildArgs++;
                    }
                }


                if (s.env_file) {
                    const eFiles = Array.isArray(s.env_file) ? s.env_file : [s.env_file];
                    eFiles.forEach(ef => {
                        const efStr = typeof ef === 'string' ? ef : ef.path;
                        if (efStr && (efStr.includes('.prod') || efStr.includes('.secret') || efStr.includes('credentials'))) {
                            f.insecureEnvFile = true;
                        }
                    });
                }

                if (s.cap_add && s.cap_add.length > 0) f.addedCapabilities = true;

                let isDb = false;
                if (s.image) {
                    if (dbKeys.some(k => s.image.toLowerCase().includes(k))) isDb = true;
                    if (s.image.includes('latest')) f.latestTags++;
                    if (!s.image.includes(':')) f.noTags++;
                    
                    const sigPorts = s.ports ? JSON.stringify(s.ports) : '';
                    const sigEnv = s.environment ? JSON.stringify(s.environment) : '';
                    const sig = s.image + '|' + sigPorts + '|' + sigEnv;
                    if (imgUsage.has(sig)) imgUsage.set(sig, imgUsage.get(sig) + 1);
                    else imgUsage.set(sig, 1);
                }

                if (isDb && !s.volumes) f.statefulNoVolume = true;

                if (s.ports && s.ports.length > 0) {
                    pubPorts += s.ports.length;
                    publicServices++;
                    if (isDb) f.publicDb++;
                    s.ports.forEach(p => {
                        const portStr = typeof p === 'string' ? p : p.published;
                        if (portStr && portStr.toString().includes('0.0.0.0')) f.wildcardBinding = true;
                    });
                }

                if (s.volumes) {
                    s.volumes.forEach(v => {
                        const volStr = typeof v === 'string' ? v : v.source;
                        if (!volStr) return;
                        if (volStr.includes('/var/run/docker.sock')) f.hasSock++;
                        if (volStr.startsWith('/etc') || volStr.startsWith('/proc') || volStr.startsWith('/sys')) f.sensitiveBindMounts = true;
                        if ((volStr.startsWith('./') || volStr.startsWith('/') || volStr.startsWith('~/')) && !volStr.includes('docker.sock')) f.hostBindMounts++;
                        volUsage.add(volStr);
                        const isNamed = !volStr.startsWith('./') && !volStr.startsWith('/') && !volStr.startsWith('~/');
                        const isRo = volStr.endsWith(':ro');
                        if (isNamed && !isRo) {
                            const vName = volStr.split(':')[0];
                            if (writableVols.has(vName)) sharedVols.add(vName);
                            writableVols.add(vName);
                        }
                        f.sharedWritableVolume = sharedVols.size;

                    });
                }

                if (s.networks) {
                    const nets = Array.isArray(s.networks) ? s.networks : Object.keys(s.networks);
                    nets.forEach(n => netUsage.add(n));
                }

                if (s.environment) {
                    const envs = Array.isArray(s.environment) ? s.environment : Object.keys(s.environment).map(k => `${k}=${s.environment[k]}`);
                    envs.forEach(env => {
                        const k = env.split('=')[0].toLowerCase();
                        if (k.includes('pass') || k.includes('secret') || k.includes('token') || k.includes('key')) f.secretsInEnv++;
                    });
                }

                if (s.depends_on) {
                    const depsArray = Array.isArray(s.depends_on) ? s.depends_on : Object.keys(s.depends_on);
                    if (depsArray.length >= 5) f.excessiveCoupling = true;
                    
                    if (!Array.isArray(s.depends_on)) {
                        Object.values(s.depends_on).forEach(cond => {
                            if (cond && cond.condition !== 'service_healthy') f.missingHealthCondition = true;
                        });
                    } else {
                        f.missingHealthCondition = true; // using short syntax which implies service_started
                    }
                    
                    depsArray.forEach(d => { depCounts[d] = (depCounts[d] || 0) + 1; });
                } else if (!s.networks && !s.ports) {
                    f.isolatedServices = true;
                }
            });

            if (pubPorts > 3) f.excessivePorts = pubPorts;
            if (publicServices > 2) f.multipleEntrypoints = true;
            
            imgUsage.forEach((count) => { if (count > 1) f.redundantServices = true; });

            Object.keys(depCounts).forEach(d => {
                if (depCounts[d] >= 3) {
                    const s = compose.services[d];
                    const replicas = (s && s.deploy && s.deploy.replicas) ? s.deploy.replicas : 1;
                    if (replicas < 2) f.spof++;
                }
            });

            const getDepth = (serviceName, visited) => {
                if (visited.has(serviceName)) return 0; 
                visited.add(serviceName);
                const s = compose.services[serviceName];
                if (!s || !s.depends_on) return 1;
                
                let maxChildDepth = 0;
                const deps = Array.isArray(s.depends_on) ? s.depends_on : Object.keys(s.depends_on);
                deps.forEach(d => {
                    maxChildDepth = Math.max(maxChildDepth, getDepth(d, new Set(visited)));
                });
                return maxChildDepth + 1;
            };

            Object.keys(compose.services).forEach(sName => {
                const d = getDepth(sName, new Set());
                if (d > 3) f.deepDeps = true;
                if (d > 3 && f.noHealth > 0) f.fragileStartup = true;
            });

            if (compose.volumes) {
                f.sharedVolumes = Object.keys(compose.volumes).length;
                Object.keys(compose.volumes).forEach(v => {
                    if (!volUsage.has(v)) f.orphanNetworks = true;
                });
            }
            if (compose.networks) {
                Object.keys(compose.networks).forEach(n => {
                    if (n !== 'default' && !netUsage.has(n)) f.orphanNetworks = true;
                });
            }
        }

        if (mode === 'dockerfile' && df && df.stages) {
            f.totalServices = 1;
            if (df.stages.length > 1) f.multiStage = true;
            else f.multiStage = false;
            
            f.unnecessaryContext = true; // Assume true unless we can check context (we can't, so we'll just flag it as optimization recommendation)

            let lockfileVisible = false;
            let declaredStages = new Set();
            let referencedStages = new Set();
            if (df && df.stages) {
                df.stages.forEach(st => { if (st.name) declaredStages.add(st.name); });
            }

            df.stages.forEach(s => {
                if (s.user === 'root') f.hasRoot++;
                if (s.image.includes('latest')) f.latestTags++;
                if (!s.image.includes(':')) f.noTags++;
                
                if (!s.image.includes('alpine') && !s.image.includes('slim')) f.oversizedBase = true;
                if (s.image.includes('linux/amd64')) f.cpuArchIssues = true;

                let hasHealth = false;
                let foundCopy = false;
                let runCount = 0;
                
                s.instructions.forEach(inst => {
                    if (inst.instruction === 'WORKDIR') f.noWorkdir = false;
                    if (inst.instruction === 'EXPOSE') f.noExpose = false;
                    if (inst.instruction === 'ADD') f.useAdd++;
                    if (inst.instruction === 'CMD' || inst.instruction === 'ENTRYPOINT') {
                        if (inst.args && typeof inst.args === 'string' && !inst.args.trim().startsWith('[')) f.shellFormCmd++;
                    }
                    
                    if (inst.instruction === 'COPY' || inst.instruction === 'ADD') {
                        const argLine = (inst.args || '').toLowerCase();
                        if (argLine.includes('package-lock.json') || argLine.includes('yarn.lock') || argLine.includes('pnpm-lock.yaml')) lockfileVisible = true;
                        const argsLower = (inst.args || '').toLowerCase();
                        if (argsLower.includes('id_rsa') || argsLower.includes('.ssh') || argsLower.includes('.aws') || argsLower.includes('secrets.yml')) {
                            f.sensitiveCopy++;
                        }
                        if (inst.flags) {
                            inst.flags.forEach(flag => {
                                if (flag.startsWith('--from=')) {
                                    const stage = flag.split('=')[1];
                                    referencedStages.add(stage);
                                    if (stage !== 'scratch' && !declaredStages.has(stage) && !isNaN(parseInt(stage)) && parseInt(stage) >= df.stages.length) f.invalidCopyFrom++;
                                }
                            });
                        }
                    }
                    if (inst.instruction === 'RUN') {
                        const args = (inst.args || '').toLowerCase();
                        if ((args.includes('curl ') || args.includes('wget ')) && (args.includes('| bash') || args.includes('| sh'))) f.pipedScriptToShell++;
                        if (args.includes('chmod 777') || args.includes('chmod -r 777')) f.chmod777++;
                        if (args.includes('sudo ')) f.useOfSudo++;
                        if (args.includes('apt-get install') || args.includes('apk add')) {
                            if (!args.includes('=')) f.unpinnedPackages++;
                            if (!args.includes('--no-install-recommends') && args.includes('apt-get')) f.aptNoRecommends++;
                        }
                        if (args.includes('pip install') && !args.includes('--no-cache-dir')) f.pipNoCache++;
                        if (args.includes('npm install') && !args.includes('npm ci') && lockfileVisible) f.npmNonDeterministic++;
                    }
                    if (inst.instruction === 'ENV' || inst.instruction === 'ARG') {
                        const argStr = (inst.args || '').toUpperCase();
                        if (argStr.includes('PASS') || argStr.includes('SECRET') || argStr.includes('TOKEN') || argStr.includes('KEY')) {
                            f.hardcodedDockerfileSecrets++;
                        }
                    }
                    if (inst.instruction === 'HEALTHCHECK') hasHealth = true;
                    if (inst.instruction === 'COPY') {
                        foundCopy = true;
                        if (inst.args.startsWith('. .')) f.broadCopy++;
                    }
                    if (inst.instruction === 'RUN') {
                        if (foundCopy) f.badOrdering = true; // RUN after COPY
                        runCount++;
                        if (inst.args.includes('apt-get upgrade') || inst.args.includes('apk upgrade') || inst.args.includes('yum update')) f.aptUpgrade++;
                        if (inst.args.includes('apt-get') || inst.args.includes('apk')) {
                            if (!inst.args.includes('rm -rf') && !inst.args.includes('--no-cache')) f.noCacheCleanup = true;
                        }
                    }
                });
                if (!hasHealth) f.noHealth++;
                if (runCount > 1) f.repeatedInstalls = true;
                if (runCount > 5) f.tooManyRuns = true;
            });

            if (df.stages.length > 1) {
                for (let i = 0; i < df.stages.length - 1; i++) {
                    const stName = df.stages[i].name || i.toString();
                    if (!referencedStages.has(stName)) f.unusedBuildStages++;
                }
            }
        }

        return f;
    }

    function stringHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function renderExpertReview(facts, results, scenario, rawDoc) {
        expertLoading.style.display = 'none';
        expertContent.style.display = 'flex';

        if (!scenario) {
            scenario = { verdict: 'Standard Setup', desc: 'Standard configuration with a mix of minor improvements available.' };
        }

        document.getElementById('expert-verdict-title').textContent = scenario.verdict;
        document.getElementById('expert-verdict-desc').textContent = scenario.desc;

        const looksGood = document.getElementById('expert-looks-good');
        const concerns = document.getElementById('expert-main-concerns');
        const fixFirst = document.getElementById('expert-fix-first');
        const personasGrid = document.getElementById('expert-personas-grid');

        if (!looksGood || !concerns || !fixFirst || !personasGrid) return;
        looksGood.innerHTML = ''; concerns.innerHTML = ''; fixFirst.innerHTML = ''; personasGrid.innerHTML = '';

        if (results.rules.length === 0) {
            looksGood.innerHTML = '<li>No expert findings were triggered for this configuration.</li>';
            concerns.innerHTML = '<li style="color:#cbd5e1; list-style:none;">No significant issues detected by the current static-analysis rules.</li>';
            fixFirst.innerHTML = '<li style="color:#cbd5e1; list-style:none;">No high-priority fixes identified.</li>';
        } else {
            let goodStr = '<li>Standard configuration parsable.</li>';
            if (facts.totalServices > 1 && !facts.spof) goodStr += '<li>No obvious single points of failure.</li>';
            if (!facts.hasRoot) goodStr += '<li>Secure execution context (non-root).</li>';
            looksGood.innerHTML = goodStr;

            results.rules.slice(0, 4).forEach(r => {
                concerns.innerHTML += `<li>${escapeHtml(r.ruleName)} <span class="dl-btn-why" onclick="toggleEvidence('ev-c-${r.id}')">Why?</span>
                    <div id="ev-c-${r.id}" class="dl-evidence-block"><span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:0.7rem; background:rgba(255,255,255,0.1); margin-bottom:8px;">${escapeHtml(r.classification)}</span><br/>${escapeHtml(r.evidence(facts))}</div></li>`;
            });

            const criticals = results.rules.filter(r => r.severity === 'Critical' || r.severity === 'High');
            if (criticals.length > 0) {
                criticals.slice(0, 3).forEach(r => {
                    fixFirst.innerHTML += `<li>${escapeHtml(r.rec)}</li>`;
                });
            } else {
                fixFirst.innerHTML = `<li>Review medium priority recommendations at your convenience.</li>`;
            }
        }

        const docStr = JSON.stringify(rawDoc || {});
        
        Object.entries(PERSONAS).forEach(([pId, pData]) => {
            const myRules = results.rules.filter(r => r.personas.includes(pId));
            
            let reviewsHtml = '';
            if (myRules.length === 0) {
                reviewsHtml = `<div style="font-weight:600; font-size:1.1rem; color:#f8fafc; margin-bottom:8px;">✅ Looks good</div>`;
                reviewsHtml += `<div style="color:#34d399; font-size:0.85rem; margin-top:8px;">No major findings in my domain.</div>`;
            } else {
                // Determine persona verdict based on top severity
                let highestSev = 'Low';
                if (myRules.some(r => r.severity === 'Critical')) highestSev = 'Critical';
                else if (myRules.some(r => r.severity === 'High')) highestSev = 'High';
                else if (myRules.some(r => r.severity === 'Medium')) highestSev = 'Medium';
                
                let pVerdict = 'Needs Optimization';
                let pVerdictColor = '#f8fafc';
                if (highestSev === 'Critical') { pVerdict = 'Critical Issues Detected'; pVerdictColor = '#ef4444'; }
                else if (highestSev === 'High') { pVerdict = 'Major Refactoring Needed'; pVerdictColor = '#f97316'; }
                else if (highestSev === 'Medium') { pVerdict = 'Requires Improvements'; pVerdictColor = '#eab308'; }

                reviewsHtml = `<div style="font-weight:600; font-size:1.1rem; color:${pVerdictColor}; margin-bottom:12px;">${pVerdict}</div>`;
                
                reviewsHtml += `<ul style="margin:8px 0 0 0; padding-left:16px;">`;
                myRules.slice(0, 3).forEach(r => { // up to three important findings
                    const hash = stringHash(docStr + r.id + pId);
                    const wordingIdx = hash % r.wording.length;
                    const text = r.wording[wordingIdx];
                    let sColor = '#3b82f6';
                    if (r.severity === 'Critical') sColor = '#ef4444';
                    else if (r.severity === 'High') sColor = '#f97316';
                    else if (r.severity === 'Medium') sColor = '#eab308';
                    
                    reviewsHtml += `<li style="margin-bottom:8px;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${sColor}; margin-right:4px;"></span>
                        ${escapeHtml(text)} <span class="dl-btn-why" onclick="toggleEvidence('ev-p-${pId}-${r.id}')">Why?</span>
                        <div id="ev-p-${pId}-${r.id}" class="dl-evidence-block"><span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:0.7rem; background:rgba(255,255,255,0.1); margin-bottom:8px;">${escapeHtml(r.classification)}</span><br/>${escapeHtml(r.evidence(facts))}

Rule: ${escapeHtml(r.ruleName)}</div>
                    </li>`;
                });
                reviewsHtml += `</ul>`;
                
                // One first-priority action
                const topRule = myRules.sort((a,b) => {
                    const sev = {Critical:4, High:3, Medium:2, Low:1};
                    return sev[b.severity] - sev[a.severity];
                })[0];
                
                reviewsHtml += `<div style="margin-top:16px; font-size:0.85rem; background:rgba(0,0,0,0.2); padding:10px; border-left:2px solid ${pVerdictColor}; border-radius:0 4px 4px 0;">
                    <div style="color:${pVerdictColor}; font-weight:600; margin-bottom:4px;">🎯 Priority Action</div>
                    ${escapeHtml(topRule.rec)}
                </div>`;
            }

            personasGrid.innerHTML += `
                <div class="dl-expert-card">
                    <div class="dl-expert-header">
                        <div class="dl-expert-avatar">${pData.icon}</div>
                        <div>
                            <div class="dl-expert-name">${pData.name}</div>
                            <div class="dl-expert-role">${pData.role}</div>
                        </div>
                    </div>
                    <div class="dl-expert-body">${reviewsHtml}</div>
                </div>
            `;
        });
    }

    window.toggleEvidence = function(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
    };

});
