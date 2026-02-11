// Environment Variable Validator PRO - v2.0
// Built by LiDa Software
// Bulletproof version with comprehensive error handling

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // ============================================
        // UTILITY FUNCTIONS (Hoisted first)
        // ============================================
        
        function loadHistory() {
            try {
                const saved = localStorage.getItem('env_validator_history');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.warn('Failed to load history:', e);
                return [];
            }
        }
        
        function saveToHistory(name, data) {
            try {
                const entry = {
                    id: Date.now(),
                    name: name || `Validation ${new Date().toLocaleString()}`,
                    timestamp: new Date().toISOString(),
                    data: data
                };
                
                state.history.unshift(entry);
                if (state.history.length > 20) state.history.pop();
                
                localStorage.setItem('env_validator_history', JSON.stringify(state.history));
            } catch (e) {
                console.warn('Failed to save history:', e);
            }
        }
        
        function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            if (!toast) return;
            
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }
        
        async function copyToClipboard(text) {
            if (!text || !navigator.clipboard) {
                showToast('❌ Clipboard not available');
                return false;
            }
            
            try {
                await navigator.clipboard.writeText(text);
                showToast('✓ Copied to clipboard!');
                return true;
            } catch (err) {
                showToast('❌ Failed to copy');
                return false;
            }
        }
        
        function parseEnvFile(content) {
            if (!content) return { vars: {}, comments: [] };
            
            const lines = content.split('\n');
            const vars = {};
            const comments = [];
            
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                
                if (trimmed.startsWith('#')) {
                    comments.push({ line: index + 1, text: trimmed });
                    return;
                }
                
                if (!trimmed) return;
                
                const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    const cleanValue = value.replace(/^["']|["']$/g, '');
                    
                    vars[key] = {
                        value: cleanValue,
                        raw: value,
                        line: index + 1,
                        hasValue: cleanValue.length > 0,
                        type: inferType(cleanValue)
                    };
                }
            });
            
            return { vars, comments };
        }
        
        function inferType(value) {
            if (!value) return 'empty';
            if (value === 'true' || value === 'false') return 'boolean';
            if (!isNaN(value) && value.trim() !== '') return 'number';
            if (/^\d{1,5}$/.test(value) && parseInt(value) <= 65535) return 'port';
            
            try { new URL(value); return 'url'; } catch {}
            
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
            if (/^[./~]|^[A-Za-z]:\\/.test(value)) return 'path';
            if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return 'ip';
            if (value.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(value)) return 'secret';
            
            return 'string';
        }
        
        function detectSecrets(vars) {
            if (!vars || typeof vars !== 'object') return [];
            
            const warnings = [];
            const SECRET_PATTERNS = {
                password: { regex: /password|passwd|pwd/i, severity: 'high' },
                secret: { regex: /secret|private/i, severity: 'high' },
                apiKey: { regex: /api[_-]?key|apikey/i, severity: 'critical' },
                token: { regex: /token|auth/i, severity: 'critical' },
                credential: { regex: /credential|cred/i, severity: 'medium' },
                aws: { regex: /^AWS_/i, severity: 'critical' },
                stripe: { regex: /^STRIPE_/i, severity: 'critical' },
                sendgrid: { regex: /^SENDGRID_/i, severity: 'critical' },
                database: { regex: /database[_-]?url|connection[_-]?string|db[_-]?url/i, severity: 'high' },
                jwt: { regex: /^eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/, severity: 'critical' },
                awsAccessKey: { regex: /^AKIA[0-9A-Z]{16}$/, severity: 'critical' },
                githubToken: { regex: /^gh[ps]_[A-Za-z0-9]{36}$/, severity: 'critical' },
                slackToken: { regex: /xox[baprs]-[0-9a-zA-Z-]+/, severity: 'critical' }
            };
            
            Object.entries(vars).forEach(([key, data]) => {
                if (!data || !data.value) return;
                
                for (const [patternName, pattern] of Object.entries(SECRET_PATTERNS)) {
                    const matchesKey = pattern.regex.test(key);
                    const matchesValue = pattern.regex.test(data.value);
                    
                    if (matchesKey || matchesValue) {
                        const value = data.value;
                        const looksReal = value.length > 5 && !/your[-_]|example|sample|placeholder|xxx|123|test|demo/i.test(value);
                        
                        if (looksReal) {
                            warnings.push({
                                key,
                                value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
                                severity: pattern.severity,
                                pattern: patternName,
                                message: `${pattern.severity.toUpperCase()}: ${patternName} detected`
                            });
                            break;
                        }
                    }
                }
            });
            
            return warnings.sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 };
                return (order[a.severity] || 999) - (order[b.severity] || 999);
            });
        }
        
        function calculateHealthScore(comparison, secrets) {
            if (!comparison || !secrets) return { score: 0, feedback: [] };
            
            let score = 100;
            const feedback = [];
            
            if (comparison.missing && comparison.missing.length > 0) {
                const penalty = Math.min(comparison.missing.length * 10, 40);
                score -= penalty;
                feedback.push(`-${penalty} pts: ${comparison.missing.length} missing variables`);
            }
            
            const critical = secrets.filter(s => s.severity === 'critical').length;
            if (critical > 0) {
                const penalty = Math.min(critical * 20, 50);
                score -= penalty;
                feedback.push(`-${penalty} pts: ${critical} critical secrets`);
            }
            
            const high = secrets.filter(s => s.severity === 'high').length;
            if (high > 0) {
                const penalty = Math.min(high * 10, 30);
                score -= penalty;
                feedback.push(`-${penalty} pts: ${high} high-risk secrets`);
            }
            
            if (comparison.emptyInActual && comparison.emptyInActual.length > 0) {
                const penalty = Math.min(comparison.emptyInActual.length * 5, 20);
                score -= penalty;
                feedback.push(`-${penalty} pts: ${comparison.emptyInActual.length} empty values`);
            }
            
            return { score: Math.max(0, Math.min(100, score)), feedback };
        }
        
        function updateVarCount(textareaId, countId) {
            const textarea = document.getElementById(textareaId);
            const countEl = document.getElementById(countId);
            
            if (!textarea || !countEl) return;
            
            const content = textarea.value || '';
            const parsed = parseEnvFile(content);
            const count = Object.keys(parsed.vars).length;
            
            countEl.textContent = `${count} variable${count !== 1 ? 's' : ''}`;
            countEl.style.color = count > 0 ? 'var(--primary)' : 'var(--text-muted)';
        }
        
        // ============================================
        // STATE MANAGEMENT
        // ============================================
        
        const state = {
            currentMode: 'simple',
            currentView: 'overview',
            environments: [],
            validationResults: null,
            searchQuery: '',
            activeFilter: 'all',
            history: loadHistory()
        };
        
// ============================================
        // SAMPLE DATA
        // ============================================
        
        const SAMPLES = {
            example: `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=
DB_PASSWORD=

# API Configuration
API_KEY=
API_SECRET=
STRIPE_KEY=
SENDGRID_API_KEY=

# Application Settings
NODE_ENV=development
PORT=3000
DEBUG=false
LOG_LEVEL=info

# External Services
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
GITHUB_TOKEN=`,

            actual: `# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=production_db
DB_USER=admin
DB_PASSWORD=super_secret_password_123

# API Configuration
API_KEY=sk_live_EXAMPLE_KEY_DO_NOT_USE
API_SECRET=whsec_EXAMPLE_SECRET_12345
STRIPE_KEY=sk_test_EXAMPLE_KEY_12345
SENDGRID_API_KEY=SG.EXAMPLE_KEY_1234567890

# Application Settings
NODE_ENV=production
PORT=8080
DEBUG=true
LOG_LEVEL=verbose
EXTRA_FEATURE=enabled

# External Services
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=AKIA_EXAMPLE_KEY_123
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI_EXAMPLE_KEY_bPxRfiCY
GITHUB_TOKEN=ghp_EXAMPLE_TOKEN_1234567890`,

            docker: `version: '3.8'
services:
  web:
    image: node:16
    environment:
      - NODE_ENV=\${NODE_ENV}
      - DB_HOST=\${DB_HOST}
      - DB_PORT=\${DB_PORT}
      - API_KEY=\${API_KEY}
      - REDIS_URL=\${REDIS_URL}
    ports:
      - "\${PORT}:3000"
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_DB=\${DB_NAME}`
        };
        
        // ============================================
        // GENERATORS
        // ============================================
        
        function generateEnvExample(envContent) {
            if (!envContent) return '';
            
            const safeDefaults = ['localhost', '127.0.0.1', 'development', 'true', 'false', '3000', '8080', '5432'];
            let output = `# Generated .env.example\n# Created: ${new Date().toLocaleDateString()}\n\n`;
            
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                
                if (trimmed.startsWith('#')) {
                    output += line + '\n';
                    return;
                }
                
                if (!trimmed) {
                    output += '\n';
                    return;
                }
                
                const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    const cleanValue = value.replace(/^["']|["']$/g, '');
                    
                    if (safeDefaults.includes(cleanValue.toLowerCase()) || safeDefaults.includes(cleanValue)) {
                        output += `${key}=${cleanValue}\n`;
                    } else {
                        output += `${key}=\n`;
                    }
                }
            });
            
            return output;
        }
        
        function generateReadmeTable(vars) {
            if (!vars || Object.keys(vars).length === 0) {
                return '## Environment Variables\n\nNo variables found.';
            }
            
            let output = `## Environment Variables\n\n`;
            output += `| Variable | Type | Required | Description |\n`;
            output += `|----------|------|----------|-------------|\n`;
            
            Object.entries(vars).forEach(([key, data]) => {
                const required = data.hasValue ? 'Yes' : 'No';
                const type = data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : 'String';
                output += `| \`${key}\` | ${type} | ${required} | - |\n`;
            });
            
            return output;
        }
        
        function generatePreCommitHook(requiredVars) {
            if (!requiredVars || requiredVars.length === 0) {
                return '#!/bin/bash\necho "No required variables specified"\nexit 0';
            }
            
            return `#!/bin/bash
# Generated by Environment Variable Validator Pro

echo "🔍 Validating environment variables..."

if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found"
  exit 1
fi

required_vars=(${requiredVars.map(v => `"${v}"`).join(' ')})
missing=()

for var in "\${required_vars[@]}"; do
  if ! grep -q "^\$var=" .env; then
    missing+=("\$var")
  fi
done

if [ \${#missing[@]} -gt 0 ]; then
  echo "❌ Missing required variables:"
  printf '  - %s\\n' "\${missing[@]}"
  exit 1
fi

echo "✓ All required environment variables present"
exit 0`;
        }
        
        function generateGitHubAction(requiredVars) {
            return `name: Validate Environment Variables

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  validate-env:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Validate required variables
      run: |
        required_vars=(${(requiredVars || []).map(v => `"${v}"`).join(' ')})
        for var in "\${required_vars[@]}"; do
          if ! grep -q "^\$var=" .env.example 2>/dev/null; then
            echo "❌ Missing: \$var"
            exit 1
          fi
        done
        echo "✓ All required variables documented"`;
        }
        
        function parseDockerCompose(content) {
            if (!content) return [];
            
            const envVars = new Set();
            const regex = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
            let match;
            
            while ((match = regex.exec(content)) !== null) {
                envVars.add(match[1]);
            }
            
            return Array.from(envVars);
        }
        
        function compareTwo(exampleContent, actualContent) {
            const example = parseEnvFile(exampleContent);
            const actual = parseEnvFile(actualContent);
            
            const missing = [];
            const extra = [];
            const matching = [];
            const emptyInActual = [];
            
            Object.keys(example.vars).forEach(key => {
                if (!actual.vars[key]) {
                    missing.push(key);
                } else {
                    matching.push(key);
                    if (!actual.vars[key].hasValue) {
                        emptyInActual.push(key);
                    }
                }
            });
            
            Object.keys(actual.vars).forEach(key => {
                if (!example.vars[key]) extra.push(key);
            });
            
            return {
                missing,
                extra,
                matching,
                emptyInActual,
                exampleVars: example.vars,
                actualVars: actual.vars
            };
        }
        
        // ============================================
        // RENDERING FUNCTIONS
        // ============================================
        
        function renderHealthScore(comparison, secrets) {
            const scoreEl = document.getElementById('health-score');
            const progressEl = document.getElementById('score-progress');
            const breakdownEl = document.getElementById('health-breakdown');
            const recsEl = document.getElementById('health-recommendations');
            
            if (!scoreEl || !progressEl) return;
            
            const { score, feedback } = calculateHealthScore(comparison, secrets);
            
            scoreEl.textContent = score;
            const offset = 283 - (283 * score) / 100;
            progressEl.style.strokeDashoffset = offset;
            
            let color = score >= 90 ? 'var(--success)' : score >= 70 ? 'var(--warning)' : 'var(--danger)';
            progressEl.style.stroke = color;
            scoreEl.style.background = `linear-gradient(135deg, ${color}, #a78bfa)`;
            scoreEl.style.webkitBackgroundClip = 'text';
            scoreEl.style.webkitTextFillColor = 'transparent';
            
            if (breakdownEl) {
                breakdownEl.innerHTML = feedback.map(f => `
                    <div class="health-item"><span class="health-item-label">${f}</span></div>
                `).join('');
            }
            
            if (recsEl) {
                const recs = [];
                if (score < 100) recs.push('Review and fix issues to improve score');
                if (secrets.length > 0) recs.push('Remove or encrypt sensitive values');
                if (comparison.missing && comparison.missing.length > 0) recs.push('Add missing variables');
                
                recsEl.innerHTML = recs.length > 0 ? `
                    <div style="margin-top:1rem;padding:1rem;background:var(--info-bg);border-radius:8px;">
                        <strong>💡 Recommendations:</strong><br>${recs.map(r => `• ${r}`).join('<br>')}
                    </div>
                ` : '';
            }
        }
        
        function renderStats(comparison, secrets) {
            const statsEl = document.getElementById('stats-grid');
            if (!statsEl || !comparison) return;
            
            statsEl.innerHTML = `
                <div class="stat-card matching">
                    <div class="stat-value">${comparison.matching.length}</div>
                    <div class="stat-label">Matching</div>
                </div>
                <div class="stat-card missing">
                    <div class="stat-value">${comparison.missing.length}</div>
                    <div class="stat-label">Missing</div>
                </div>
                <div class="stat-card extra">
                    <div class="stat-value">${comparison.extra.length}</div>
                    <div class="stat-label">Extra</div>
                </div>
                <div class="stat-card secrets">
                    <div class="stat-value">${secrets.length}</div>
                    <div class="stat-label">Security Issues</div>
                </div>
            `;
        }
        
        function renderDeploymentReadiness(comparison, secrets) {
            const readinessEl = document.getElementById('deployment-readiness');
            if (!readinessEl || !comparison) return;
            
            const checks = [];
            
            checks.push({
                status: comparison.missing.length === 0 ? 'pass' : 'fail',
                icon: comparison.missing.length === 0 ? '✓' : '❌',
                title: 'All required variables present',
                desc: comparison.missing.length === 0 ? 
                    'All variables defined' :
                    `Missing ${comparison.missing.length} variable${comparison.missing.length > 1 ? 's' : ''}`
            });
            
            const criticalSecrets = secrets.filter(s => s.severity === 'critical').length;
            checks.push({
                status: secrets.length === 0 ? 'pass' : criticalSecrets > 0 ? 'fail' : 'warning',
                icon: secrets.length === 0 ? '✓' : criticalSecrets > 0 ? '❌' : '⚠️',
                title: 'Security check',
                desc: secrets.length === 0 ? 'No secrets detected' : `Found ${secrets.length} potential secret${secrets.length > 1 ? 's' : ''}`
            });
            
            const hasEmpty = comparison.emptyInActual && comparison.emptyInActual.length > 0;
            checks.push({
                status: !hasEmpty ? 'pass' : 'warning',
                icon: !hasEmpty ? '✓' : '⚠️',
                title: 'All values populated',
                desc: !hasEmpty ? 'No empty values' : `${comparison.emptyInActual.length} empty value${comparison.emptyInActual.length > 1 ? 's' : ''}`
            });
            
            if (comparison.actualVars) {
                const debugVar = comparison.actualVars.DEBUG || comparison.actualVars.debug;
                const nodeEnv = comparison.actualVars.NODE_ENV || comparison.actualVars.node_env;
                
                if (debugVar && nodeEnv && nodeEnv.value === 'production' && debugVar.value === 'true') {
                    checks.push({
                        status: 'warning',
                        icon: '⚠️',
                        title: 'DEBUG enabled in production',
                        desc: 'Consider setting DEBUG=false'
                    });
                }
            }
            
            readinessEl.innerHTML = `
                <h3>🚀 Deployment Readiness Check</h3>
                <div class="checklist">
                    ${checks.map(c => `
                        <div class="checklist-item ${c.status}">
                            <div class="checklist-icon">${c.icon}</div>
                            <div class="checklist-text">
                                <div class="checklist-title">${c.title}</div>
                                <div class="checklist-desc">${c.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        function renderSecurityWarnings(secrets) {
            const warningsEl = document.getElementById('security-warnings');
            if (!warningsEl) return;
            
            if (!secrets || secrets.length === 0) {
                warningsEl.innerHTML = '<div class="success-message">🔒 No obvious secrets detected!</div>';
                return;
            }
            
            warningsEl.innerHTML = `
                <h3>🚨 Security Warnings (${secrets.length})</h3>
                ${secrets.map(s => `
                    <div class="warning-item">
                        <strong>${s.key}</strong>: ${s.message}
                        <br><small style="opacity:0.8;font-family:var(--mono-font);margin-top:0.5rem;display:block;">
                            Preview: ${s.value}
                        </small>
                    </div>
                `).join('')}
            `;
        }
        
        function renderComparison(comparison) {
            const compEl = document.getElementById('comparison-results');
            if (!compEl || !comparison) return;
            
            let html = '';
            
            if (comparison.missing.length > 0) {
                html += `
                    <div class="comp-box missing-col">
                        <h4>❌ Missing (${comparison.missing.length})</h4>
                        <ul class="comp-list">${comparison.missing.map(k => `<li>${k}</li>`).join('')}</ul>
                    </div>
                `;
            }
            
            if (comparison.extra.length > 0) {
                html += `
                    <div class="comp-box extra-col">
                        <h4>➕ Extra (${comparison.extra.length})</h4>
                        <ul class="comp-list">${comparison.extra.map(k => `<li>${k}</li>`).join('')}</ul>
                    </div>
                `;
            }
            
            if (comparison.matching.length > 0) {
                html += `
                    <div class="comp-box matching-col">
                        <h4>✓ Matching (${comparison.matching.length})</h4>
                        <ul class="comp-list">
                            ${comparison.matching.slice(0, 15).map(k => `<li>${k}</li>`).join('')}
                            ${comparison.matching.length > 15 ? `<li style="opacity:0.6;">... and ${comparison.matching.length - 15} more</li>` : ''}
                        </ul>
                    </div>
                `;
            }
            
            compEl.innerHTML = html;
        }
        
        function renderDiffView(comparison) {
            const diffContainer = document.getElementById('diff-container');
            if (!diffContainer || !comparison) return;
            
            let html = '<h3 style="margin-bottom:1.5rem;">Line-by-Line Comparison</h3>';
            
            comparison.extra.forEach(key => {
                const value = comparison.actualVars[key]?.value || '';
                html += `<div class="diff-line added"><div class="diff-marker">+</div><div>${key}=${value}</div></div>`;
            });
            
            comparison.missing.forEach(key => {
                html += `<div class="diff-line removed"><div class="diff-marker">-</div><div>${key}=</div></div>`;
            });
            
            comparison.matching.forEach(key => {
                const exampleVal = comparison.exampleVars[key]?.value;
                const actualVal = comparison.actualVars[key]?.value;
                
                if (exampleVal && actualVal && exampleVal !== actualVal) {
                    html += `
                        <div class="diff-line changed">
                            <div class="diff-marker">~</div>
                            <div>${key}: <span style="color:var(--danger);text-decoration:line-through;">${exampleVal}</span> → <span style="color:var(--success);">${actualVal}</span></div>
                        </div>
                    `;
                }
            });
            
            if (!comparison.extra.length && !comparison.missing.length) {
                html += '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No differences found</p>';
            }
            
            diffContainer.innerHTML = html;
        }
        
        function renderMatrixView(environments) {
            const matrixTable = document.getElementById('matrix-table');
            if (!matrixTable) return;
            
            if (!environments || environments.length < 2) {
                matrixTable.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--text-muted);">Matrix view requires at least 2 environments.</p>';
                return;
            }
            
            const allVars = new Set();
            environments.forEach(env => {
                if (env.vars) Object.keys(env.vars).forEach(key => allVars.add(key));
            });
            
            let html = '<thead><tr><th>Variable</th>';
            environments.forEach(env => html += `<th>${env.name || 'Environment'}</th>`);
            html += '</tr></thead><tbody>';
            
            Array.from(allVars).sort().forEach(varName => {
                html += `<tr><td style="font-weight:700;">${varName}</td>`;
                
                environments.forEach(env => {
                    const varData = env.vars ? env.vars[varName] : null;
                    if (varData) {
                        const value = varData.value || '(empty)';
                        const cellClass = varData.hasValue ? 'present' : 'missing';
                        html += `<td class="matrix-cell ${cellClass}">${value.substring(0, 30)}${value.length > 30 ? '...' : ''}</td>`;
                    } else {
                        html += `<td class="matrix-cell missing">❌ Missing</td>`;
                    }
                });
                
                html += '</tr>';
            });
            
            matrixTable.innerHTML = html + '</tbody>';
        }
        
        function renderInsights(comparison, secrets) {
            const insightsEl = document.getElementById('insights-content');
            if (!insightsEl || !comparison) return;
            
            const insights = [];
            const total = comparison.missing.length + comparison.matching.length;
            const completeness = total > 0 ? ((comparison.matching.length / total) * 100).toFixed(1) : 100;
            
            insights.push({
                icon: completeness >= 90 ? '✅' : '⚠️',
                title: 'Completeness',
                desc: `${completeness}% of required variables present`
            });
            
            if (secrets.length > 0) {
                insights.push({
                    icon: '🚨',
                    title: 'Security Concerns',
                    desc: `${secrets.length} potential secret${secrets.length > 1 ? 's' : ''} detected`
                });
            }
            
            if (comparison.actualVars) {
                const types = new Set(Object.values(comparison.actualVars).map(v => v.type));
                insights.push({
                    icon: '🎯',
                    title: 'Value Types',
                    desc: `${types.size} types: ${Array.from(types).join(', ')}`
                });
            }
            
            insightsEl.innerHTML = insights.map(i => `
                <div class="insight-item">
                    <div class="insight-icon">${i.icon}</div>
                    <div class="insight-content">
                        <div class="insight-title">${i.title}</div>
                        <div class="insight-desc">${i.desc}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // ============================================
        // VALIDATION
        // ============================================
        
        async function validate() {
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            const viewTabs = document.getElementById('view-tabs');
            
            if (!loading || !results || !viewTabs) return;
            
            loading.style.display = 'block';
            results.style.display = 'none';
            viewTabs.style.display = 'none';
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            try {
                let comparison, secrets, environments;
                
                if (state.currentMode === 'simple') {
                    const input1 = document.getElementById('input-1');
                    const input2 = document.getElementById('input-2');
                    
                    if (!input1 || !input2 || !input1.value.trim() || !input2.value.trim()) {
                        showToast('⚠️ Please provide both files');
                        loading.style.display = 'none';
                        return;
                    }
                    
                    comparison = compareTwo(input1.value, input2.value);
                    secrets = detectSecrets(comparison.actualVars);
                    
                } else if (state.currentMode === 'docker') {
                    const dockerInput = document.getElementById('docker-input');
                    const envInput = document.getElementById('docker-env-input');
                    
                    if (!dockerInput || !envInput || !dockerInput.value.trim() || !envInput.value.trim()) {
                        showToast('⚠️ Please provide both files');
                        loading.style.display = 'none';
                        return;
                    }
                    
                    const dockerVars = parseDockerCompose(dockerInput.value);
                    const envVars = parseEnvFile(envInput.value).vars;
                    
                    comparison = {
                        missing: dockerVars.filter(v => !envVars[v]),
                        matching: dockerVars.filter(v => envVars[v]),
                        extra: Object.keys(envVars).filter(k => !dockerVars.includes(k)),
                        exampleVars: {},
                        actualVars: envVars,
                        emptyInActual: []
                    };
                    
                    secrets = detectSecrets(envVars);
                    
                } else if (state.currentMode === 'multi') {
                    environments = validateMultiEnv();
                    if (!environments) {
                        loading.style.display = 'none';
                        return;
                    }
                    
                    const allVars = new Set();
                    environments.forEach(env => Object.keys(env.vars).forEach(k => allVars.add(k)));
                    
                    const reference = environments[0];
                    const missing = [];
                    const matching = [];
                    const different = [];
                    
                    Array.from(allVars).forEach(varName => {
                        const refVar = reference.vars[varName];
                        let allHave = true;
                        let allSame = true;
                        
                        environments.forEach(env => {
                            if (!env.vars[varName]) allHave = false;
                            if (refVar && env.vars[varName] && env.vars[varName].value !== refVar.value) allSame = false;
                        });
                        
                        if (!allHave) missing.push(varName);
                        else if (!allSame) different.push(varName);
                        else matching.push(varName);
                    });
                    
                    let allSecrets = [];
                    environments.forEach(env => {
                        const envSecrets = detectSecrets(env.vars);
                        allSecrets = allSecrets.concat(envSecrets.map(s => ({...s, env: env.name})));
                    });
                    
                    comparison = {
                        missing,
                        matching,
                        extra: different,
                        emptyInActual: [],
                        exampleVars: reference.vars,
                        actualVars: environments[environments.length - 1].vars
                    };
                    
                    secrets = allSecrets;
                }
                
                loading.style.display = 'none';
                results.style.display = 'block';
                viewTabs.style.display = 'flex';
                
                state.validationResults = { comparison, secrets, environments };
                
                renderHealthScore(comparison, secrets);
                renderStats(comparison, secrets);
                renderDeploymentReadiness(comparison, secrets);
                renderSecurityWarnings(secrets);
                renderComparison(comparison);
                renderDiffView(comparison);
                if (environments) renderMatrixView(environments);
                renderInsights(comparison, secrets);
                
                saveToHistory(null, { comparison, secrets, mode: state.currentMode });
                results.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Validation error:', error);
                showToast('❌ Validation failed. Please check your input.');
                loading.style.display = 'none';
            }
        }
        
        function validateMultiEnv() {
            const container = document.getElementById('multi-env-container');
            if (!container) return null;
            
            const panels = container.querySelectorAll('.file-panel');
            
            if (panels.length < 2) {
                showToast('⚠️ Add at least 2 environments');
                return null;
            }
            
            const environments = [];
            panels.forEach(panel => {
                const id = panel.id.split('-').pop();
                const nameInput = document.getElementById(`env-name-${id}`);
                const contentInput = document.getElementById(`input-multi-${id}`);
                
                if (nameInput && contentInput && contentInput.value.trim()) {
                    const parsed = parseEnvFile(contentInput.value);
                    environments.push({
                        name: nameInput.value,
                        vars: parsed.vars,
                        id
                    });
                }
            });
            
            if (environments.length < 2) {
                showToast('⚠️ At least 2 environments must have content');
                return null;
            }
            
            return environments;
        }
        
        // ============================================
        // EVENT HANDLERS
        // ============================================
        
        function setupFileUpload(inputId, textareaId, countId) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;
            
            inputEl.addEventListener('change', e => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = evt => {
                    const textarea = document.getElementById(textareaId);
                    if (textarea) {
                        textarea.value = evt.target.result;
                        if (countId) updateVarCount(textareaId, countId);
                        showToast(`✓ Loaded ${file.name}`);
                    }
                };
                reader.onerror = () => showToast('❌ Failed to read file');
                reader.readAsText(file);
            });
        }
        
        // ============================================
        // INITIALIZATION
        // ============================================
        
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (!mode) return;
                
                state.currentMode = mode;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.mode-content').forEach(c => c.classList.remove('active'));
                
                const modeEl = document.getElementById(`${mode}-mode`);
                if (modeEl) modeEl.classList.add('active');
                
                const results = document.getElementById('results');
                const viewTabs = document.getElementById('view-tabs');
                if (results) results.style.display = 'none';
                if (viewTabs) viewTabs.style.display = 'none';
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (!view) return;
                
                state.currentView = view;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                const viewEl = document.getElementById(`${view}-view`);
                if (viewEl) viewEl.classList.add('active');
            });
        });
        
        // Validate button
        const validateBtn = document.getElementById('validate-btn');
        if (validateBtn) validateBtn.addEventListener('click', validate);
        
        // Clear button
        const clearBtn = document.getElementById('clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.querySelectorAll('textarea').forEach(ta => ta.value = '');
                document.querySelectorAll('.var-count').forEach(vc => vc.textContent = '0 variables');
                const results = document.getElementById('results');
                const viewTabs = document.getElementById('view-tabs');
                if (results) results.style.display = 'none';
                if (viewTabs) viewTabs.style.display = 'none';
                showToast('✓ Cleared');
            });
        }
        
        // Sample button
        const sampleBtn = document.getElementById('sample-btn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                if (state.currentMode === 'simple') {
                    const input1 = document.getElementById('input-1');
                    const input2 = document.getElementById('input-2');
                    if (input1) input1.value = SAMPLES.example;
                    if (input2) input2.value = SAMPLES.actual;
                    updateVarCount('input-1', 'count-1');
                    updateVarCount('input-2', 'count-2');
                } else if (state.currentMode === 'docker') {
                    const dockerInput = document.getElementById('docker-input');
                    const dockerEnvInput = document.getElementById('docker-env-input');
                    if (dockerInput) dockerInput.value = SAMPLES.docker;
                    if (dockerEnvInput) dockerEnvInput.value = SAMPLES.actual;
                }
                showToast('✓ Sample loaded');
            });
        }
        
        // File uploads
        setupFileUpload('file-1', 'input-1', 'count-1');
        setupFileUpload('file-2', 'input-2', 'count-2');
        setupFileUpload('docker-file', 'docker-input', null);
        setupFileUpload('docker-env-file', 'docker-env-input', null);
        
        // Real-time counting
        ['input-1', 'input-2'].forEach((id, idx) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => updateVarCount(id, `count-${idx + 1}`));
        });
        
        // Mini buttons
        document.querySelectorAll('.mini-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const target = btn.dataset.target;
                const el = document.getElementById(target);
                
                if (!el) return;
                
                if (action === 'clear') {
                    el.value = '';
                    showToast('✓ Cleared');
                } else if (action === 'copy' && el.value.trim()) {
                    copyToClipboard(el.value);
                }
            });
        });
        
        // Template generators
        const genEnvBtn = document.getElementById('gen-env-example-btn');
        if (genEnvBtn) {
            genEnvBtn.addEventListener('click', () => {
                const input = state.currentMode === 'simple' ? 
                    document.getElementById('input-2')?.value :
                    document.getElementById('docker-env-input')?.value;
                
                if (!input || !input.trim()) {
                    showToast('⚠️ No content to generate from');
                    return;
                }
                
                const template = generateEnvExample(input);
                showTemplate('.env.example', template, '.env.example');
            });
        }
        
        const genReadmeBtn = document.getElementById('gen-readme-btn');
        if (genReadmeBtn) {
            genReadmeBtn.addEventListener('click', () => {
                if (!state.validationResults) {
                    showToast('⚠️ Run validation first');
                    return;
                }
                const table = generateReadmeTable(state.validationResults.comparison.actualVars);
                showTemplate('README.md - Environment Variables', table, 'env-variables.md');
            });
        }
        
        const genHookBtn = document.getElementById('gen-hook-btn');
        if (genHookBtn) {
            genHookBtn.addEventListener('click', () => {
                if (!state.validationResults) {
                    showToast('⚠️ Run validation first');
                    return;
                }
                const required = Object.keys(state.validationResults.comparison.exampleVars || {});
                const hook = generatePreCommitHook(required);
                showTemplate('Pre-Commit Hook', hook, 'pre-commit');
            });
        }
        
        const genCIBtn = document.getElementById('gen-ci-btn');
        if (genCIBtn) {
            genCIBtn.addEventListener('click', () => {
                if (!state.validationResults) {
                    showToast('⚠️ Run validation first');
                    return;
                }
                const required = Object.keys(state.validationResults.comparison.exampleVars || {});
                const workflow = generateGitHubAction(required);
                showTemplate('GitHub Actions Workflow', workflow, 'validate-env.yml');
            });
        }
        
        function showTemplate(title, content, filename) {
            const modal = document.getElementById('template-modal');
            const titleEl = document.getElementById('template-modal-title');
            const output = document.getElementById('template-output');
            
            if (!modal || !titleEl || !output) return;
            
            titleEl.textContent = title;
            output.value = content;
            modal.style.display = 'flex';
            modal.dataset.filename = filename;
        }
        
        // Modal handlers
        window.closeTemplateModal = () => {
            const modal = document.getElementById('template-modal');
            if (modal) modal.style.display = 'none';
        };
        
        window.closeHistory = () => {
            const modal = document.getElementById('history-modal');
            if (modal) modal.style.display = 'none';
        };
        
        window.closeShortcuts = () => {
            const modal = document.getElementById('shortcuts-modal');
            if (modal) modal.style.display = 'none';
        };
        
        window.closeExportPanel = () => {
            const panel = document.getElementById('export-panel');
            if (panel) panel.style.display = 'none';
        };
        
        const copyTemplateBtn = document.getElementById('copy-template-btn');
        if (copyTemplateBtn) {
            copyTemplateBtn.addEventListener('click', () => {
                const output = document.getElementById('template-output');
                if (output) copyToClipboard(output.value);
            });
        }
        
        const downloadTemplateBtn = document.getElementById('download-template-btn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                const output = document.getElementById('template-output');
                const modal = document.getElementById('template-modal');
                if (!output || !modal) return;
                
                const content = output.value;
                const filename = modal.dataset.filename || 'output.txt';
                
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                showToast('✓ Downloaded');
            });
        }
        
        // History
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                const modal = document.getElementById('history-modal');
                const listEl = document.getElementById('history-list');
                if (!modal || !listEl) return;
                
                if (state.history.length === 0) {
                    listEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">No history yet</p>';
                } else {
                    listEl.innerHTML = state.history.map(item => `
                        <div class="history-item">
                            <div class="history-item-header">
                                <div class="history-item-name">${item.name}</div>
                                <div class="history-item-date">${new Date(item.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="history-item-stats">
                                ${item.data.comparison.missing.length} missing • ${item.data.secrets.length} secrets
                            </div>
                        </div>
                    `).join('');
                }
                
                modal.style.display = 'flex';
            });
        }
        
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                state.history = [];
                localStorage.removeItem('env_validator_history');
                showToast('✓ History cleared');
                const modal = document.getElementById('history-modal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        // FAB
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.getElementById('fab-menu');
        if (fabMain && fabMenu) {
            fabMain.addEventListener('click', e => {
                e.stopPropagation();
                fabMenu.classList.toggle('active');
            });
            
            document.addEventListener('click', e => {
                if (!fabMain.contains(e.target) && !fabMenu.contains(e.target)) {
                    fabMenu.classList.remove('active');
                }
            });
        }
        
        document.querySelectorAll('.fab-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const action = opt.dataset.action;
                
                if (action === 'save-snapshot' && state.validationResults) {
                    const name = prompt('Snapshot name:', `Snapshot ${new Date().toLocaleString()}`);
                    if (name) {
                        saveToHistory(name, state.validationResults);
                        showToast('✓ Snapshot saved');
                    }
                } else if (action === 'export') {
                    const panel = document.getElementById('export-panel');
                    if (panel) panel.style.display = 'block';
                } else if (action === 'shortcuts') {
                    const modal = document.getElementById('shortcuts-modal');
                    if (modal) modal.style.display = 'flex';
                }
                
                if (fabMenu) fabMenu.classList.remove('active');
            });
        });
        
        // Multi-env
        const addEnvBtn = document.getElementById('add-env-btn');
        let envCounter = 0;
        
        if (addEnvBtn) {
            addEnvBtn.addEventListener('click', () => {
                envCounter++;
                const container = document.getElementById('multi-env-container');
                if (!container) return;
                
                const envPanel = document.createElement('div');
                envPanel.className = 'file-panel';
                envPanel.id = `env-panel-${envCounter}`;
                envPanel.innerHTML = `
                    <div class="panel-header">
                        <input type="text" id="env-name-${envCounter}" 
                               value=".env.${envCounter === 1 ? 'dev' : envCounter === 2 ? 'staging' : envCounter === 3 ? 'prod' : 'env' + envCounter}"
                               style="background:var(--bg-dark);border:1px solid var(--border);color:var(--text-main);padding:6px 12px;border-radius:6px;font-weight:600;width:150px;">
                        <div>
                            <label for="file-multi-${envCounter}" class="upload-btn">📁 Upload</label>
                            <input type="file" id="file-multi-${envCounter}" accept=".env,.txt" hidden>
                            <button class="mini-btn" onclick="removeEnv(${envCounter})" style="margin-left:8px;">🗑️</button>
                        </div>
                    </div>
                    <div class="textarea-container">
                        <textarea id="input-multi-${envCounter}" placeholder="Paste .env content..." spellcheck="false"></textarea>
                    </div>
                    <div class="var-count" id="count-multi-${envCounter}">0 variables</div>
                `;
                
                container.appendChild(envPanel);
                setupFileUpload(`file-multi-${envCounter}`, `input-multi-${envCounter}`, `count-multi-${envCounter}`);
                
                const newTextarea = document.getElementById(`input-multi-${envCounter}`);
                if (newTextarea) {
                    newTextarea.addEventListener('input', () => {
                        updateVarCount(`input-multi-${envCounter}`, `count-multi-${envCounter}`);
                    });
                }
                
                showToast(`✓ Environment ${envCounter} added`);
            });
        }
        
        window.removeEnv = function(id) {
            const panel = document.getElementById(`env-panel-${id}`);
            if (panel) {
                panel.remove();
                showToast('✓ Environment removed');
            }
        };
        
        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                validate();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                const btn = document.getElementById('sample-btn');
                if (btn) btn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                const btn = document.getElementById('history-btn');
                if (btn) btn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const btn = document.getElementById('clear-all-btn');
                if (btn) btn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const search = document.getElementById('global-search');
                if (search) search.focus();
            }
        });
        
        // Share functionality
        const shareBtn = document.getElementById('share-tool-button');
        const desktopShare = document.getElementById('desktop-share-buttons');
        const shareUrl = window.location.href;
        const shareTitle = 'Environment Variable Validator Pro | LiDa Software';
        const shareText = 'Check out this powerful env validator!';
        
        if (shareBtn && desktopShare) {
            if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                shareBtn.style.display = 'inline-flex';
                shareBtn.addEventListener('click', async () => {
                    try {
                        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
                    } catch (err) {
                        if (err.name !== 'AbortError') console.log('Share failed');
                    }
                });
            } else {
                desktopShare.style.display = 'flex';
                
                const fbBtn = document.getElementById('share-facebook');
                if (fbBtn) {
                    fbBtn.addEventListener('click', e => {
                        e.preventDefault();
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                    });
                }
                
                const liBtn = document.getElementById('share-linkedin');
                if (liBtn) {
                    liBtn.addEventListener('click', e => {
                        e.preventDefault();
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                    });
                }
                
                const tBtn = document.getElementById('share-twitter');
                if (tBtn) {
                    tBtn.addEventListener('click', e => {
                        e.preventDefault();
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                    });
                }
                
                const copyBtn = document.getElementById('share-copy');
                if (copyBtn) {
                    copyBtn.addEventListener('click', async () => {
                        const success = await copyToClipboard(shareUrl);
                        if (success) {
                            copyBtn.innerHTML = '✓ Copied!';
                            setTimeout(() => copyBtn.innerHTML = '📋 Copy Link', 2000);
                        }
                    });
                }
            }
        }
        
        // Onboarding
        function showOnboarding() {
            if (localStorage.getItem('env_validator_onboarding_seen')) return;
            
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
            overlay.innerHTML = `
                <div style="background:linear-gradient(135deg,#1a1a2e,#2a2a4e);border-radius:24px;padding:3rem;max-width:700px;width:90%;border:2px solid var(--primary);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                    <h2 style="font-size:2rem;background:linear-gradient(135deg,#667eea,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1.5rem;text-align:center;">
                        Welcome to EnvValidator Pro! 🚀
                    </h2>
                    <div style="color:var(--text-main);font-size:1.05rem;line-height:1.8;margin-bottom:2rem;">
                        <p><strong>Quick Start:</strong></p>
                        <ol style="margin:1rem 0 0 1.5rem;color:var(--text-muted);">
                            <li style="margin-bottom:0.75rem;">Choose a mode</li>
                            <li style="margin-bottom:0.75rem;">Press Ctrl+L to load sample</li>
                            <li style="margin-bottom:0.75rem;">Click Validate & Analyze</li>
                            <li>Explore tabs and generators</li>
                        </ol>
                    </div>
                    <div style="text-align:center;">
                        <button onclick="closeOnboarding()" style="background:linear-gradient(135deg,var(--primary),#764ba2);color:white;border:none;padding:14px 40px;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(102,126,234,0.4);">
                            Got it! Let's start 🎯
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }
        
        window.closeOnboarding = function() {
            const overlay = document.querySelector('[style*="z-index:9999"]');
            if (overlay) overlay.remove();
            localStorage.setItem('env_validator_onboarding_seen', 'true');
        };
        
        // Initialize
        updateVarCount('input-1', 'count-1');
        updateVarCount('input-2', 'count-2');
        
        setTimeout(showOnboarding, 500);
        
        if (localStorage.getItem('env_validator_onboarding_seen')) {
            setTimeout(() => showToast('💡 Press Ctrl+L to load sample data', 4000), 1000);
        }
    }
})();