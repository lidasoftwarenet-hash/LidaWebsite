// js/main.js - Entry point and UI logic

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('pipeline-input');
  const pasteBtn = document.getElementById('paste-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const copyLogsBtn = document.getElementById('copy-logs-btn');
  const presetsSelect = document.getElementById('presets');
  const visualizeBtn = document.getElementById('visualize-btn');
  const simulateBtn = document.getElementById('simulate-btn');
  const exportBtn = document.getElementById('export-btn');
  const clearBtn = document.getElementById('clear-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const flowchart = document.getElementById('flowchart');
  const logs = document.getElementById('logs');
  
  let currentAST = null;
  
  // Apply syntax highlighting to textarea
  applySyntaxHighlighting(input);

  // Function to update copy button state
  function updateCopyButtonState() {
    const hasCode = input.value.trim().length > 0;
    copyCodeBtn.disabled = !hasCode;
  }

  // Update copy button state on input
  input.addEventListener('input', updateCopyButtonState);
  
  // Initial state check
  updateCopyButtonState();

  // Copy code button
  copyCodeBtn.addEventListener('click', () => {
    const code = input.value.trim();
    if (!code) {
      showToast('No code to copy', true);
      return;
    }
    copyToClipboard(code, 'Code copied to clipboard!');
  });

  // Copy logs button
  copyLogsBtn.addEventListener('click', () => {
    const logsText = logs.textContent.trim();
    if (!logsText) {
      showToast('No logs to copy', true);
      return;
    }
    copyToClipboard(logsText, 'Logs copied to clipboard!');
  });

  // Paste button functionality
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        input.value = text;
        input.dispatchEvent(new Event('input'));
        showToast('Pasted from clipboard!');
      }
    } catch (err) {
      showToast('Failed to paste. Please use Ctrl+V manually.', true);
    }
  });

  // Populate presets dropdown
  Object.keys(presets).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    presetsSelect.appendChild(option);
  });

  // Load selected preset into textarea
  presetsSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (selected && presets[selected]) {
      input.value = presets[selected].trim();
      // Trigger input event to update syntax highlighting
      input.dispatchEvent(new Event('input'));
      // Clear previous output
      flowchart.innerHTML = '<p style="color:#94a3b8; text-align:center;">Click Visualize to see the flowchart</p>';
      logs.innerHTML = '';
      simulateBtn.disabled = true;
      exportBtn.disabled = true;
      showToast(`Template "${selected}" loaded successfully!`);
    }
  });

  // Visualize button
  visualizeBtn.addEventListener('click', () => {
    const code = input.value.trim();
    if (!code) {
      return;
    }

    try {
      currentAST = parsePipeline(code);
      const svg = visualize(currentAST);
      flowchart.innerHTML = svg;
      simulateBtn.disabled = false;
      exportBtn.disabled = false;
      
      // Add interactive tooltips
      addInteractiveTooltips(currentAST);
      
      // Initialize zoom and pan
      initZoomPan();
    } catch (err) {
      console.error('Parse error:', err);
      flowchart.innerHTML = `<p style="color:#ef4444; text-align:center;">Parse error: ${err.message}</p>`;
      currentAST = null;
      exportBtn.disabled = true;
    }
  });

  // Simulate button
  simulateBtn.addEventListener('click', () => {
    if (!currentAST) {
      showToast('Please visualize a pipeline first', true);
      return;
    }

    try {
      simulate(currentAST, logs);
      // Show copy logs button when logs are generated
      copyLogsBtn.style.display = 'inline-block';
    } catch (err) {
      showToast('Simulation error: ' + err.message, true);
      console.error(err);
    }
  });
  
  // Export button
  exportBtn.addEventListener('click', () => {
    exportAsPNG();
  });
  
  // Zoom controls
  zoomInBtn.addEventListener('click', () => {
    zoomIn();
  });
  
  zoomOutBtn.addEventListener('click', () => {
    zoomOut();
  });
  
  zoomResetBtn.addEventListener('click', () => {
    resetZoom();
  });

  // Clear everything
  clearBtn.addEventListener('click', () => {
    input.value = '';
    presetsSelect.value = '';
    flowchart.innerHTML = '<p style="color:#94a3b8; text-align:center;">Flowchart will appear here</p>';
    logs.innerHTML = '';
    simulateBtn.disabled = true;
    exportBtn.disabled = true;
    copyLogsBtn.style.display = 'none';
    copyCodeBtn.disabled = true;
    currentAST = null;
  });

  // Initial state
  flowchart.innerHTML = '<p style="color:#94a3b8; text-align:center;">Flowchart will appear here</p>';
});
