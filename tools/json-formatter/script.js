document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Helper: Show status message
    function showStatus(message, type = 'success') {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.remove('hidden');

        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 3000);
    }

    // Helper: Parse JSON safely
    function parseJSON() {
        const raw = jsonInput.value.trim();
        if (!raw) {
            showStatus('Please input some JSON first.', 'error');
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            showStatus(`Invalid JSON: ${e.message}`, 'error');
            return null;
        }
    }

    // Action: Format JSON
    formatBtn.addEventListener('click', () => {
        const jsonObj = parseJSON();
        if (jsonObj) {
            jsonOutput.textContent = JSON.stringify(jsonObj, null, 4);
            showStatus('JSON Formatted Successfully!');
        }
    });

    // Action: Minify JSON
    minifyBtn.addEventListener('click', () => {
        const jsonObj = parseJSON();
        if (jsonObj) {
            jsonOutput.textContent = JSON.stringify(jsonObj);
            showStatus('JSON Minified Successfully!');
        }
    });

    // Action: Clear Input
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.textContent = '';
        jsonInput.focus();
        showStatus('Cleared!', 'success');
    });

    // Action: Paste from Clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            jsonInput.value = text;
            showStatus('Pasted from clipboard!', 'success');
        } catch (err) {
            showStatus('Failed to access clipboard. Please paste manually.', 'error');
        }
    });

    // Action: Copy Output
    copyBtn.addEventListener('click', async () => {
        const text = jsonOutput.textContent;
        if (!text) {
            showStatus('Nothing to copy!', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showStatus('Copied to clipboard!', 'success');
        } catch (err) {
            showStatus('Failed to copy.', 'error');
        }
    });

    // Optional: Auto-format on paste (debounced? maybe later, keep it simple for now)
});
