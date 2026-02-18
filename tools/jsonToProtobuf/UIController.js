/**
 * UIController - UI Management and Event Handling
 * Manages user interface, events, and exports
 */

class UIController {
    constructor() {
        this.protoStruct = new ProtoStruct();
        this.generators = new Generators(this.protoStruct);
        this.validator = new ProtoValidator();
        this.currentProto = '';
        this.debounceTimers = {};
        this.initializeElements();
        this.attachEventListeners();
        this.updateLineNumbers();
        this.updateInputStats();
        this.showWelcomeMessage();
    }

    initializeElements() {
        // Inputs
        this.jsonInput = document.getElementById('json-input');
        this.packageNameInput = document.getElementById('package-name');
        this.syntaxVersionSelect = document.getElementById('syntax-version');
        this.rootMessageInput = document.getElementById('root-message');
        this.serviceNameInput = document.getElementById('service-name');
        this.autoImportCheckbox = document.getElementById('auto-import');
        
        // Outputs
        this.protoOutput = document.getElementById('proto-output');
        this.inputStatus = document.getElementById('input-status');
        this.outputStatus = document.getElementById('output-status');
        this.outputMessage = document.getElementById('output-message');
        this.analysisPanel = document.getElementById('analysis-panel');
        this.analysisContent = document.getElementById('analysis-content');
        
        // Stats
        this.linesCount = document.getElementById('lines-count');
        this.sizeCount = document.getElementById('size-count');
        this.messagesCount = document.getElementById('messages-count');
        this.fieldsCount = document.getElementById('fields-count');
        
        // Buttons
        this.clearInputBtn = document.getElementById('clear-input');
        this.loadExampleBtn = document.getElementById('load-example');
        this.formatInputBtn = document.getElementById('format-input');
        this.copyOutputBtn = document.getElementById('copy-output');
        this.validateOutputBtn = document.getElementById('validate-output');
        this.exportBtn = document.getElementById('export-btn');
        this.downloadOutputBtn = document.getElementById('download-output');
        
        // New buttons
        this.templatesBtn = document.getElementById('templates-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.toggleAdvancedBtn = document.getElementById('toggle-advanced');
        this.saveConfigBtn = document.getElementById('save-config');
        this.loadConfigBtn = document.getElementById('load-config');
        this.resetConfigBtn = document.getElementById('reset-config');
        
        // Modals
        this.templatesModal = document.getElementById('templates-modal');
        this.helpModal = document.getElementById('help-modal');
        this.exportMenu = document.getElementById('export-menu');
        
        // Other
        this.toast = document.getElementById('toast');
        this.lineNumbers = document.getElementById('input-line-numbers');
        this.advancedOptions = document.getElementById('advanced-options');
    }

    attachEventListeners() {
        if (!this.jsonInput) return;
        
        // Real-time conversion with debouncing
        this.jsonInput.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateInputStats();
            this.debounce('conversion', () => this.performConversion(), 500);
        });
        
        // Config changes
        if (this.packageNameInput) {
            this.packageNameInput.addEventListener('input', () => {
                this.debounce('conversion', () => this.performConversion(), 300);
            });
        }
        
        if (this.syntaxVersionSelect) {
            this.syntaxVersionSelect.addEventListener('change', () => {
                this.performConversion();
            });
        }
        
        if (this.rootMessageInput) {
            this.rootMessageInput.addEventListener('input', () => {
                this.debounce('conversion', () => this.performConversion(), 300);
            });
        }
        
        if (this.serviceNameInput) {
            this.serviceNameInput.addEventListener('input', () => {
                this.debounce('conversion', () => this.performConversion(), 300);
            });
        }
        
        if (this.autoImportCheckbox) {
            this.autoImportCheckbox.addEventListener('change', () => {
                this.performConversion();
            });
        }
        
        // Button actions
        if (this.clearInputBtn) {
            this.clearInputBtn.addEventListener('click', () => this.clearInput());
        }
        
        if (this.loadExampleBtn) {
            this.loadExampleBtn.addEventListener('click', () => this.loadExample());
        }
        
        if (this.formatInputBtn) {
            this.formatInputBtn.addEventListener('click', () => this.formatJSON());
        }
        
        if (this.copyOutputBtn) {
            this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard());
        }
        
        if (this.validateOutputBtn) {
            this.validateOutputBtn.addEventListener('click', () => this.validateOutput());
        }
        
        if (this.downloadOutputBtn) {
            this.downloadOutputBtn.addEventListener('click', () => this.downloadProto());
        }
        
        // New button handlers
        if (this.templatesBtn) {
            this.templatesBtn.addEventListener('click', () => this.showTemplates());
        }
        
        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', () => this.showHelp());
        }
        
        if (this.toggleAdvancedBtn) {
            this.toggleAdvancedBtn.addEventListener('click', () => this.toggleAdvanced());
        }
        
        if (this.saveConfigBtn) {
            this.saveConfigBtn.addEventListener('click', () => this.saveConfig());
        }
        
        if (this.loadConfigBtn) {
            this.loadConfigBtn.addEventListener('click', () => this.loadConfig());
        }
        
        if (this.resetConfigBtn) {
            this.resetConfigBtn.addEventListener('click', () => this.resetConfig());
        }
        
        // Export dropdown
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExportMenu();
            });
        }
        
        // Export menu items
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.export;
                this.handleExport(format);
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (this.exportMenu) {
                this.exportMenu.classList.remove('show');
            }
        });
        
        // Modal close handlers
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // Scroll sync for line numbers
        if (this.lineNumbers && this.jsonInput) {
            this.jsonInput.addEventListener('scroll', () => {
                this.lineNumbers.scrollTop = this.jsonInput.scrollTop;
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: Generate/Copy output
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.copyOutputBtn.disabled) {
                    this.copyToClipboard();
                } else {
                    this.performConversion();
                }
            }
            
            // Ctrl/Cmd + L: Load example
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                this.loadExample();
            }
            
            // Ctrl/Cmd + K: Clear
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.clearInput();
            }
            
            // Ctrl/Cmd + F: Format JSON
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.formatJSON();
            }
            
            // Ctrl/Cmd + T: Templates
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.showTemplates();
            }
            
            // Ctrl/Cmd + S: Save config
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveConfig();
            }
            
            // ?: Show help
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.showHelp();
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    debounce(key, func, wait) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(func, wait);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('💡 Press Ctrl+L to load an example or ? for help', 'info');
        }, 1000);
    }

    updateInputStats() {
        const value = this.jsonInput?.value || '';
        const lines = value.split('\n').length;
        const bytes = new Blob([value]).size;
        
        if (this.linesCount) {
            this.linesCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
        }
        if (this.sizeCount) {
            this.sizeCount.textContent = `${bytes} byte${bytes !== 1 ? 's' : ''}`;
        }
    }

    updateOutputStats(stats) {
        if (this.messagesCount) {
            this.messagesCount.textContent = `${stats.messagesGenerated} message${stats.messagesGenerated !== 1 ? 's' : ''}`;
        }
        if (this.fieldsCount) {
            this.fieldsCount.textContent = `${stats.fieldsProcessed} field${stats.fieldsProcessed !== 1 ? 's' : ''}`;
        }
    }

    performConversion() {
        const jsonString = this.jsonInput?.value?.trim() || '';
        
        if (!jsonString) {
            if (this.inputStatus) this.inputStatus.textContent = 'Ready - Paste your JSON';
            if (this.protoOutput) {
                this.protoOutput.innerHTML = '<code>// Your Protobuf schema will appear here...</code>';
            }
            this.hideOutputStatus();
            this.disableButtons();
            this.hideAnalysis();
            this.updateOutputStats({ messagesGenerated: 0, fieldsProcessed: 0 });
            return;
        }
        
        if (this.inputStatus) this.inputStatus.textContent = 'Processing...';
        
        const options = {
            packageName: this.packageNameInput?.value?.trim() || 'com.example.api',
            syntaxVersion: this.syntaxVersionSelect?.value || 'proto3',
            rootMessageName: this.rootMessageInput?.value?.trim() || '',
            serviceName: this.serviceNameInput?.value?.trim() || '',
            autoImport: this.autoImportCheckbox?.checked !== false,
            useOptional: document.getElementById('use-optional')?.checked !== false
        };
        
        const result = this.protoStruct.convert(jsonString, options);
        
        if (result.success) {
            this.displaySuccess(result);
        } else {
            this.displayError(result);
        }
    }

    displaySuccess(result) {
        this.currentProto = result.proto;
        
        // Update output with syntax highlighting
        if (this.protoOutput) {
            this.protoOutput.innerHTML = `<code>${this.escapeHtml(result.proto)}</code>`;
            this.syntaxHighlight();
        }
        
        // Update status
        if (this.inputStatus) this.inputStatus.textContent = '✓ Valid JSON';
        this.showOutputStatus('success', `Generated ${result.messageCount} message${result.messageCount > 1 ? 's' : ''}`);
        
        // Update stats
        this.updateOutputStats(result.stats);
        
        // Enable buttons
        this.enableButtons();
        
        // Show analysis
        this.displayAnalysis(result);
        
        // Populate field customization panel
        this.populateCustomizationPanel();
    }

    populateCustomizationPanel() {
        const customizationContent = document.getElementById('customization-content');
        const customizationPanel = document.getElementById('customization-panel');
        
        if (!customizationContent || !this.protoStruct.messageDefinitions.size) {
            return;
        }
        
        let html = '<div class="customization-container">';
        
        // Add a button to show/hide customization
        html += `
            <div class="customization-intro">
                <p>Customize field types, names, and properties for each message.</p>
                <button class="btn-secondary" id="apply-customizations">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13 4l-7 7-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Apply Changes & Regenerate
                </button>
            </div>
        `;
        
        // Iterate through messages
        const messageArray = Array.from(this.protoStruct.messageDefinitions.values())
            .sort((a, b) => (a.depth || 0) - (b.depth || 0));
        
        messageArray.forEach((message, msgIndex) => {
            html += `
                <div class="message-customization" data-message="${message.name}">
                    <div class="message-header-custom">
                        <h4>📦 Message: ${message.name}</h4>
                        <span class="field-count">${message.fields.length} field${message.fields.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="fields-table">
            `;
            
            // Table header
            html += `
                <div class="fields-row fields-header">
                    <div class="field-col">Field Name</div>
                    <div class="field-col">Type</div>
                    <div class="field-col">Number</div>
                    <div class="field-col">Modifier</div>
                    <div class="field-col-actions">Actions</div>
                </div>
            `;
            
            // Table rows for each field
            message.fields.forEach((field, fieldIndex) => {
                const fieldId = `${message.name}_${fieldIndex}`;
                html += `
                    <div class="fields-row" data-field-id="${fieldId}">
                        <div class="field-col">
                            <input type="text" 
                                   class="field-input field-name" 
                                   value="${field.name}" 
                                   data-original="${field.name}"
                                   placeholder="field_name">
                        </div>
                        <div class="field-col">
                            <select class="field-input field-type">
                                ${this.getTypeOptions(field.type)}
                            </select>
                        </div>
                        <div class="field-col">
                            <input type="number" 
                                   class="field-input field-number" 
                                   value="${field.number}" 
                                   min="1" 
                                   max="536870911">
                        </div>
                        <div class="field-col">
                            <select class="field-input field-modifier">
                                <option value="" ${!field.type.includes('repeated') && !field.type.includes('optional') ? 'selected' : ''}>none</option>
                                <option value="optional" ${field.type.includes('optional') ? 'selected' : ''}>optional</option>
                                <option value="repeated" ${field.type.includes('repeated') ? 'selected' : ''}>repeated</option>
                            </select>
                        </div>
                        <div class="field-col-actions">
                            <button class="btn-icon-small delete-field" title="Delete field" data-field-id="${fieldId}">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 3.5h10M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M11.5 3.5v8a1 1 0 01-1 1h-7a1 1 0 01-1-1v-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <button class="btn-text add-field-btn" data-message="${message.name}">
                        + Add Field
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        customizationContent.innerHTML = html;
        
        // Show the customization panel
        if (customizationPanel) {
            customizationPanel.style.display = 'block';
        }
        
        // Attach event listeners
        this.attachCustomizationListeners();
    }

    getTypeOptions(currentType) {
        const baseType = currentType.replace('repeated ', '').replace('optional ', '');
        
        const types = [
            'string', 'int32', 'int64', 'uint32', 'uint64',
            'bool', 'bytes', 'float', 'double',
            'google.protobuf.Timestamp', 'google.protobuf.Duration',
            'google.protobuf.Any'
        ];
        
        // Add custom message types from definitions
        const messageTypes = Array.from(this.protoStruct.messageDefinitions.keys());
        
        let options = '';
        types.forEach(type => {
            const selected = type === baseType ? 'selected' : '';
            options += `<option value="${type}" ${selected}>${type}</option>`;
        });
        
        messageTypes.forEach(type => {
            if (!types.includes(type)) {
                const selected = type === baseType ? 'selected' : '';
                options += `<option value="${type}" ${selected}>${type} (message)</option>`;
            }
        });
        
        return options;
    }

    attachCustomizationListeners() {
        // Apply changes button
        const applyBtn = document.getElementById('apply-customizations');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyCustomizations());
        }
        
        // Delete field buttons
        document.querySelectorAll('.delete-field').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldRow = e.currentTarget.closest('.fields-row');
                if (fieldRow && confirm('Delete this field?')) {
                    fieldRow.remove();
                }
            });
        });
        
        // Add field buttons
        document.querySelectorAll('.add-field-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageName = e.currentTarget.dataset.message;
                this.addNewField(messageName);
            });
        });
        
        // Close customization panel button
        const closeBtn = document.getElementById('close-customization');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const panel = document.getElementById('customization-panel');
                if (panel) panel.style.display = 'none';
            });
        }
    }

    addNewField(messageName) {
        const messageDiv = document.querySelector(`[data-message="${messageName}"]`);
        const fieldsTable = messageDiv?.querySelector('.fields-table');
        
        if (!fieldsTable) return;
        
        const existingFields = fieldsTable.querySelectorAll('.fields-row:not(.fields-header)');
        const nextNumber = existingFields.length + 1;
        const fieldId = `${messageName}_new_${Date.now()}`;
        
        const newRow = document.createElement('div');
        newRow.className = 'fields-row';
        newRow.dataset.fieldId = fieldId;
        newRow.innerHTML = `
            <div class="field-col">
                <input type="text" 
                       class="field-input field-name" 
                       value="new_field_${nextNumber}" 
                       placeholder="field_name">
            </div>
            <div class="field-col">
                <select class="field-input field-type">
                    ${this.getTypeOptions('string')}
                </select>
            </div>
            <div class="field-col">
                <input type="number" 
                       class="field-input field-number" 
                       value="${nextNumber}" 
                       min="1" 
                       max="536870911">
            </div>
            <div class="field-col">
                <select class="field-input field-modifier">
                    <option value="" selected>none</option>
                    <option value="optional">optional</option>
                    <option value="repeated">repeated</option>
                </select>
            </div>
            <div class="field-col-actions">
                <button class="btn-icon-small delete-field" title="Delete field" data-field-id="${fieldId}">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5h10M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M11.5 3.5v8a1 1 0 01-1 1h-7a1 1 0 01-1-1v-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;
        
        fieldsTable.appendChild(newRow);
        
        // Attach delete listener
        newRow.querySelector('.delete-field').addEventListener('click', (e) => {
            if (confirm('Delete this field?')) {
                newRow.remove();
            }
        });
        
        this.showToast('✓ Field added', 'success');
    }

    applyCustomizations() {
        // Collect all customizations
        const customizations = new Map();
        
        document.querySelectorAll('.message-customization').forEach(messageDiv => {
            const messageName = messageDiv.dataset.message;
            const fields = [];
            
            messageDiv.querySelectorAll('.fields-row:not(.fields-header)').forEach(row => {
                const name = row.querySelector('.field-name')?.value.trim();
                const type = row.querySelector('.field-type')?.value;
                const number = parseInt(row.querySelector('.field-number')?.value);
                const modifier = row.querySelector('.field-modifier')?.value;
                
                if (name && type && number) {
                    const fullType = modifier ? `${modifier} ${type}` : type;
                    fields.push({ name, type: fullType, number });
                }
            });
            
            if (fields.length > 0) {
                customizations.set(messageName, fields);
            }
        });
        
        // Update message definitions with customizations
        customizations.forEach((fields, messageName) => {
            const message = this.protoStruct.messageDefinitions.get(messageName);
            if (message) {
                message.fields = fields.map((field, index) => ({
                    ...field,
                    originalKey: field.name,
                    comment: message.fields[index]?.comment || ''
                }));
            }
        });
        
        // Regenerate proto with customizations
        const options = {
            packageName: this.packageNameInput?.value?.trim() || 'com.example.api',
            syntaxVersion: this.syntaxVersionSelect?.value || 'proto3',
            autoImport: this.autoImportCheckbox?.checked !== false
        };
        
        const protoContent = this.protoStruct.generateProtoFile(options);
        this.currentProto = protoContent;
        
        // Update output
        if (this.protoOutput) {
            this.protoOutput.innerHTML = `<code>${this.escapeHtml(protoContent)}</code>`;
            this.syntaxHighlight();
        }
        
        this.showToast('✓ Customizations applied!', 'success');
    }

    displayError(result) {
        if (this.protoOutput) {
            this.protoOutput.innerHTML = `<code class="error">// Error: ${this.escapeHtml(result.error)}\n\n// Please fix the JSON and try again.</code>`;
        }
        
        if (this.inputStatus) this.inputStatus.textContent = '✗ ' + result.error;
        this.showOutputStatus('error', result.error);
        this.disableButtons();
        this.updateOutputStats({ messagesGenerated: 0, fieldsProcessed: 0 });
        
        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
            this.displayAnalysis(result);
        } else {
            this.hideAnalysis();
        }
    }

    displayAnalysis(result) {
        const insights = this.protoStruct.generateAnalysis();
        
        if (!insights || insights.length === 0 || !this.analysisContent || !this.analysisPanel) {
            this.hideAnalysis();
            return;
        }
        
        const iconMap = {
            'info': '📊',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        
        let html = '';
        insights.forEach(insight => {
            html += `
                <div class="insight-item ${insight.type}">
                    <div class="insight-header">
                        <span class="insight-icon">${iconMap[insight.type] || '📌'}</span>
                        <strong>${insight.title}</strong>
                    </div>
                    <div class="insight-body">${this.formatContent(insight.content)}</div>
                </div>
            `;
        });
        
        this.analysisContent.innerHTML = html;
        this.analysisPanel.style.display = 'block';
        
        setTimeout(() => {
            this.analysisPanel.classList.add('visible');
        }, 10);
    }

    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    hideAnalysis() {
        if (!this.analysisPanel) return;
        
        this.analysisPanel.classList.remove('visible');
        setTimeout(() => {
            this.analysisPanel.style.display = 'none';
        }, 300);
    }

    syntaxHighlight() {
        const code = this.protoOutput?.querySelector('code');
        if (!code || code.classList.contains('error')) return;
        
        let html = code.textContent;
        
        // Keywords (proto-specific)
        html = html.replace(/\b(syntax|package|import|message|enum|repeated|optional|required|oneof|map|service|rpc|returns|stream)\b/g, 
            '<span class="keyword">$1</span>');
        
        // Primitive types
        html = html.replace(/\b(string|int32|int64|uint32|uint64|sint32|sint64|fixed32|fixed64|sfixed32|sfixed64|bool|bytes|double|float)\b/g, 
            '<span class="type">$1</span>');
        
        // Well-Known Types
        html = html.replace(/\b(google\.protobuf\.\w+)\b/g, '<span class="well-known-type">$1</span>');
        
        // Comments
        html = html.replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
        
        // Strings
        html = html.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
        
        // Numbers
        html = html.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        
        code.innerHTML = html;
    }

    showOutputStatus(type, message) {
        if (!this.outputStatus || !this.outputMessage) return;
        
        this.outputStatus.style.display = 'flex';
        this.outputStatus.className = `info-badge ${type}`;
        this.outputMessage.textContent = message;
    }

    hideOutputStatus() {
        if (this.outputStatus) {
            this.outputStatus.style.display = 'none';
        }
    }

    enableButtons() {
        if (this.copyOutputBtn) this.copyOutputBtn.disabled = false;
        if (this.validateOutputBtn) this.validateOutputBtn.disabled = false;
        if (this.exportBtn) this.exportBtn.disabled = false;
        if (this.downloadOutputBtn) this.downloadOutputBtn.disabled = false;
    }

    disableButtons() {
        if (this.copyOutputBtn) this.copyOutputBtn.disabled = true;
        if (this.validateOutputBtn) this.validateOutputBtn.disabled = true;
        if (this.exportBtn) this.exportBtn.disabled = true;
        if (this.downloadOutputBtn) this.downloadOutputBtn.disabled = true;
    }

    updateLineNumbers() {
        if (!this.jsonInput || !this.lineNumbers) return;
        
        const lines = this.jsonInput.value.split('\n').length;
        const lineNumbersHtml = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
        this.lineNumbers.textContent = lineNumbersHtml;
    }

    clearInput() {
        if (this.jsonInput) {
            this.jsonInput.value = '';
            this.updateLineNumbers();
            this.updateInputStats();
            this.performConversion();
            this.showToast('✓ Input cleared', 'success');
        }
    }

    formatJSON() {
        if (!this.jsonInput) return;
        
        const value = this.jsonInput.value.trim();
        if (!value) {
            this.showToast('No JSON to format', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(value);
            this.jsonInput.value = JSON.stringify(parsed, null, 2);
            this.updateLineNumbers();
            this.updateInputStats();
            this.performConversion();
            this.showToast('✓ JSON formatted', 'success');
        } catch (error) {
            this.showToast('❌ Invalid JSON', 'error');
        }
    }

    loadExample() {
        const example = {
            "userId": 12345,
            "userName": "john_doe",
            "email": "john@example.com",
            "createdAt": "2024-02-12T10:30:00Z",
            "isActive": true,
            "profile": {
                "firstName": "John",
                "lastName": "Doe",
                "age": 30,
                "bio": null,
                "address": {
                    "street": "123 Main St",
                    "city": "Springfield",
                    "zipCode": "12345",
                    "country": "USA"
                },
                "preferences": {
                    "theme": "dark",
                    "notifications": true
                }
            },
            "orders": [
                {
                    "orderId": 1001,
                    "amount": 299.99,
                    "currency": "USD",
                    "status": "SHIPPED",
                    "items": ["item1", "item2", "item3"]
                },
                {
                    "orderId": 1002,
                    "amount": 149.99,
                    "currency": "USD",
                    "status": "PENDING",
                    "items": []
                }
            ],
            "tags": ["premium", "verified", "early-adopter"],
            "lastLoginAt": "2024-02-12T09:15:00Z",
            "metadata": {
                "source": "web",
                "version": "2.1.0"
            }
        };
        
        if (this.jsonInput) {
            this.jsonInput.value = JSON.stringify(example, null, 2);
            this.updateLineNumbers();
            this.updateInputStats();
            this.performConversion();
            this.showToast('✓ Example loaded', 'success');
        }
    }

    async copyToClipboard() {
        if (!this.currentProto) {
            this.showToast('Nothing to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentProto);
            this.showToast('✓ Copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('❌ Failed to copy', 'error');
        }
    }

    validateOutput() {
        if (!this.currentProto) {
            this.showToast('Nothing to validate', 'error');
            return;
        }
        
        // Perform comprehensive validation
        const results = this.validator.validate(this.currentProto);
        
        // Show validation modal with detailed results
        this.showValidationResults(results);
    }

    showValidationResults(results) {
        // Create or get validation modal
        let validationModal = document.getElementById('validation-modal');
        
        if (!validationModal) {
            // Create modal if it doesn't exist
            validationModal = document.createElement('div');
            validationModal.id = 'validation-modal';
            validationModal.className = 'modal';
            validationModal.innerHTML = `
                <div class="modal-content validation-modal-content">
                    <div class="modal-header">
                        <h3>🔍 Validation Results</h3>
                        <button class="modal-close" id="close-validation">✕</button>
                    </div>
                    <div class="modal-body" id="validation-body">
                        <!-- Content will be populated -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="copy-validation-report">📋 Copy Report</button>
                        <button class="btn-primary" id="close-validation-btn">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(validationModal);
            
            // Add event listeners
            validationModal.querySelector('#close-validation').addEventListener('click', () => {
                validationModal.classList.remove('show');
            });
            
            validationModal.querySelector('#close-validation-btn').addEventListener('click', () => {
                validationModal.classList.remove('show');
            });
            
            validationModal.querySelector('#copy-validation-report').addEventListener('click', async () => {
                const report = this.validator.generateReport();
                try {
                    await navigator.clipboard.writeText(report);
                    this.showToast('✓ Validation report copied!', 'success');
                } catch (error) {
                    this.showToast('❌ Failed to copy report', 'error');
                }
            });
            
            validationModal.addEventListener('click', (e) => {
                if (e.target === validationModal) {
                    validationModal.classList.remove('show');
                }
            });
        }
        
        // Populate validation body
        const validationBody = document.getElementById('validation-body');
        if (!validationBody) return;
        
        let html = `
            <div class="validation-summary ${results.valid ? 'valid' : 'invalid'}">
                <div class="validation-summary-icon">
                    ${results.valid ? '✅' : '❌'}
                </div>
                <div class="validation-summary-text">
                    <h4>${results.summary}</h4>
                    <div class="validation-stats">
                        ${results.errors.length > 0 ? `<span class="stat-error">${results.errors.length} Error${results.errors.length > 1 ? 's' : ''}</span>` : ''}
                        ${results.warnings.length > 0 ? `<span class="stat-warning">${results.warnings.length} Warning${results.warnings.length > 1 ? 's' : ''}</span>` : ''}
                        ${results.info.length > 0 ? `<span class="stat-info">${results.info.length} Info</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Add errors
        if (results.errors.length > 0) {
            html += `
                <div class="validation-section error-section">
                    <h4>❌ Errors (${results.errors.length})</h4>
                    <ul class="validation-list">
                        ${results.errors.map(err => `<li>${this.escapeHtml(err)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add warnings
        if (results.warnings.length > 0) {
            html += `
                <div class="validation-section warning-section">
                    <h4>⚠️ Warnings (${results.warnings.length})</h4>
                    <ul class="validation-list">
                        ${results.warnings.map(warn => `<li>${this.escapeHtml(warn)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add info
        if (results.info.length > 0) {
            html += `
                <div class="validation-section info-section">
                    <h4>💡 Information (${results.info.length})</h4>
                    <ul class="validation-list">
                        ${results.info.map(info => `<li>${this.escapeHtml(info)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        validationBody.innerHTML = html;
        
        // Show modal
        validationModal.classList.add('show');
        
        // Also show toast with summary
        if (results.valid) {
            this.showToast('✓ Schema validation passed!', 'success');
        } else {
            this.showToast(`❌ ${results.errors.length} validation error${results.errors.length > 1 ? 's' : ''} found`, 'error');
        }
    }

    downloadProto() {
        if (!this.currentProto) {
            this.showToast('Nothing to download', 'error');
            return;
        }
        
        const packageName = this.packageNameInput?.value?.trim() || 'output';
        const filename = `${packageName.split('.').pop()}.proto`;
        
        const blob = new Blob([this.currentProto], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`✓ Downloaded ${filename}`, 'success');
    }

    toggleExportMenu() {
        if (this.exportMenu) {
            this.exportMenu.classList.toggle('show');
        }
    }

    handleExport(format) {
        if (this.exportMenu) {
            this.exportMenu.classList.remove('show');
        }
        
        switch (format) {
            case 'proto':
                this.downloadProto();
                break;
            case 'typescript':
                this.exportTypeScript();
                break;
            case 'grpc':
                this.exportGRPCService();
                break;
            case 'json-schema':
                this.exportJSONSchema();
                break;
            case 'all':
                this.exportAll();
                break;
        }
    }

    exportTypeScript() {
        if (!this.currentProto) {
            this.showToast('Nothing to export', 'error');
            return;
        }
        
        const typescript = this.generators.generateTypeScriptDefinitions();
        const packageName = this.packageNameInput?.value?.trim() || 'output';
        const filename = `${packageName.split('.').pop()}.d.ts`;
        
        const blob = new Blob([typescript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`✓ Downloaded ${filename}`, 'success');
    }

    exportGRPCService() {
        if (!this.currentProto) {
            this.showToast('Nothing to export', 'error');
            return;
        }
        
        const serviceName = this.packageNameInput?.value?.split('.').pop() || 'MyService';
        const grpcProto = this.generators.generateGRPCService(
            serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
        );
        const filename = `${serviceName.toLowerCase()}_service.proto`;
        
        const blob = new Blob([grpcProto], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`✓ Downloaded ${filename}`, 'success');
    }

    exportJSONSchema() {
        if (!this.currentProto) {
            this.showToast('Nothing to export', 'error');
            return;
        }
        
        const jsonSchema = this.generators.generateJSONSchema();
        const packageName = this.packageNameInput?.value?.trim() || 'output';
        const filename = `${packageName.split('.').pop()}.schema.json`;
        
        const blob = new Blob([JSON.stringify(jsonSchema, null, 2)], { 
            type: 'application/json;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`✓ Downloaded ${filename}`, 'success');
    }

    async exportAll() {
        if (!this.currentProto) {
            this.showToast('Nothing to export', 'error');
            return;
        }
        
        try {
            const packageName = this.packageNameInput?.value?.trim() || 'output';
            const baseName = packageName.split('.').pop();
            
            // Generate all formats
            const proto = this.currentProto;
            const typescript = this.generators.generateTypeScriptDefinitions();
            const serviceName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
            const grpcProto = this.generators.generateGRPCService(serviceName);
            const jsonSchema = JSON.stringify(this.generators.generateJSONSchema(), null, 2);
            
            // Create a text file with all exports
            const allContent = `
=================================
FILE: ${baseName}.proto
=================================

${proto}

=================================
FILE: ${baseName}.d.ts
=================================

${typescript}

=================================
FILE: ${baseName}_service.proto
=================================

${grpcProto}

=================================
FILE: ${baseName}.schema.json
=================================

${jsonSchema}

=================================
EXPORT COMPLETE
=================================

Extract each section above into separate files with the names shown.
`;
            
            const blob = new Blob([allContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}_all_exports.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`✓ Downloaded all exports as ${baseName}_all_exports.txt`, 'success');
        } catch (error) {
            this.showToast('❌ Export failed', 'error');
            console.error('Export error:', error);
        }
    }

    toggleAdvanced() {
        if (this.advancedOptions && this.toggleAdvancedBtn) {
            const isVisible = this.advancedOptions.style.display !== 'none';
            this.advancedOptions.style.display = isVisible ? 'none' : 'block';
            this.toggleAdvancedBtn.classList.toggle('active');
        }
    }

    saveConfig() {
        const config = {
            packageName: this.packageNameInput?.value || '',
            syntaxVersion: this.syntaxVersionSelect?.value || 'proto3',
            rootMessage: this.rootMessageInput?.value || '',
            autoImport: this.autoImportCheckbox?.checked !== false
        };
        
        try {
            localStorage.setItem('protostructConfig', JSON.stringify(config));
            this.showToast('✓ Configuration saved', 'success');
        } catch (error) {
            this.showToast('❌ Failed to save config', 'error');
        }
    }

    loadConfig() {
        try {
            const configStr = localStorage.getItem('protostructConfig');
            if (!configStr) {
                this.showToast('No saved configuration found', 'info');
                return;
            }
            
            const config = JSON.parse(configStr);
            if (this.packageNameInput) this.packageNameInput.value = config.packageName || '';
            if (this.syntaxVersionSelect) this.syntaxVersionSelect.value = config.syntaxVersion || 'proto3';
            if (this.rootMessageInput) this.rootMessageInput.value = config.rootMessage || '';
            if (this.autoImportCheckbox) this.autoImportCheckbox.checked = config.autoImport !== false;
            
            this.performConversion();
            this.showToast('✓ Configuration loaded', 'success');
        } catch (error) {
            this.showToast('❌ Failed to load config', 'error');
        }
    }

    resetConfig() {
        if (this.packageNameInput) this.packageNameInput.value = 'com.example.api';
        if (this.syntaxVersionSelect) this.syntaxVersionSelect.value = 'proto3';
        if (this.rootMessageInput) this.rootMessageInput.value = '';
        if (this.autoImportCheckbox) this.autoImportCheckbox.checked = true;
        
        this.performConversion();
        this.showToast('✓ Configuration reset', 'success');
    }

    showTemplates() {
        if (this.templatesModal) {
            this.templatesModal.classList.add('show');
            this.loadTemplateData();
        }
    }

    loadTemplateData() {
        const templatesGrid = document.getElementById('templates-grid');
        if (!templatesGrid) return;
        
        const templates = [
            {
                name: 'Simple User',
                description: 'Basic user profile with ID, name, and email',
                json: { userId: 1, name: "John Doe", email: "john@example.com" }
            },
            {
                name: 'E-commerce Order',
                description: 'Order with items, pricing, and status',
                json: {
                    orderId: 1001,
                    items: [{ productId: 1, quantity: 2, price: 29.99 }],
                    total: 59.98,
                    status: "PENDING"
                }
            },
            {
                name: 'API Response',
                description: 'Standard API response with data and meta',
                json: {
                    success: true,
                    data: { id: 1, value: "test" },
                    meta: { timestamp: "2024-02-12T10:30:00Z" }
                }
            }
        ];
        
        let html = '';
        templates.forEach(template => {
            html += `
                <div class="template-card" data-template='${JSON.stringify(template.json)}'>
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
            `;
        });
        
        templatesGrid.innerHTML = html;
        
        // Add click handlers
        templatesGrid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateJson = JSON.parse(card.dataset.template);
                if (this.jsonInput) {
                    this.jsonInput.value = JSON.stringify(templateJson, null, 2);
                    this.updateLineNumbers();
                    this.updateInputStats();
                    this.performConversion();
                }
                this.closeAllModals();
                this.showToast('✓ Template loaded', 'success');
            });
        });
    }

    showHelp() {
        if (this.helpModal) {
            this.helpModal.classList.add('show');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;
        
        const toastMessage = document.getElementById('toast-message');
        if (toastMessage) toastMessage.textContent = message;
        
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}