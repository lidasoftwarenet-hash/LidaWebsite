import { superRules } from './rules/index.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const languageSelect = document.getElementById('languageSelect');
    const exampleSelect = document.getElementById('exampleSelect');
    const highlightContainer = document.getElementById('highlightContainer');
    const highlightedCode = document.getElementById('highlightedCode');
    const explanationList = document.getElementById('explanationList');
    const emptyState = document.getElementById('emptyState');
    const statusIndicator = document.getElementById('statusIndicator');
    const issueCount = document.getElementById('issueCount');
    const statsPanel = document.getElementById('statsPanel');
    const statusBox = document.getElementById('statusBox');
    const statusPulse = document.getElementById('statusPulse');

    // Statistics tracking
    let analysisStats = {
        totalIssues: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        categories: {}
    };

    // Code context for cross-line analysis
    let codeContext = {
        imports: [],
        functions: [],
        variables: [],
        classes: []
    };

    // Example Code
    const examples = {
        py_hallucination: `import os
import json
import datetime
from typing import List

def process_data(file_path):
    # Hallucination: json.load with string
    data = json.load(file_path) 
    
    # Hallucination: list.push
    results = []
    results.push(data['value'])
    
    # Hallucination: dict.has_key (Python 2)
    if data.has_key('timestamp'):
        print(datetime.datetime.now().to_string())
        
    # Hallucination: os.exists
    if os.exists('log.txt'):
        print("Log found")
        
    # Potential runtime error: string + None
    name = None
    message = "Hello " + name
    
    # Hallucination: using undefined variable
    return final_result  # Not defined
    
def calculate_total(items: List[int]):
    # Hallucination: sum() takes iterable, not *args
    return sum(*items)`,

        js_hallucination: `const fs = require('fs');
const path = require('path');

function saveData(data) {
    // Hallucination: typo in fs method
    if (fs.existSync('./data.json')) {
        console.log('File exists');
    }

    const items = ['a', 'b', 'c'];
    
    // Hallucination: Array.remove
    items.remove('b');
    
    // Hallucination: String.contains
    if ("hello world".contains("world")) {
        console.log("Found it");
    }
    
    // Hallucination: Date.format
    console.log(new Date().format("YYYY-MM-DD"));
    
    // Async without await
    async function getData() {
        return fetch('/api/data');  // Missing await
    }
    
    // Wrong Promise handling
    Promise.all(item1, item2, item3);  // Should be array
    
    // Using undefined variable
    console.log(undefinedVar);
}`,
        ts_hallucination: `interface User {
    name: string;
    age: number;
}

function greet<T extends string>(name: T) {
    console.log(name.includes("hello"));
}

type Status = 'active' | 'inactive';
const status: Status = 'active';

class MyClass implements User {
    name: string = "test";
    age: number = 30;
} `,
        rust_hallucination: `use std::io;
fn main() {
    let mut v = [1, 2, 3];
    v.push(4); // Fixed size array

    let s = "hello";
    s.push('!'); // Use String::from()

    match v[0] {
        1 => println!("one"),
        _ => println!("other"),
    }
}`,
        csharp_hallucination: `using System;
using System.Collections.Generic;

public class DataProcessor {
    public void ProcessData(List<string> items) {
        if (items.push("new")) { // Use .Add()
            Console.log("Added"); // Use Console.WriteLine
        }

        var dict = new Dictionary<string, int>();
        if (dict.HasKey("test")) { // Use ContainsKey
             bool found = true; // Use bool
        }
    }
}`
    };

    // ============================================
    // AUTOMATIC LANGUAGE DETECTION
    // ============================================

    /**
     * Detects programming language from code patterns
     * Returns: { language: 'python'|'javascript'|'java'|'go', confidence: 0-100 }
     */
    function detectLanguage(code) {
        const scores = {
            python: 0,
            javascript: 0,
            typescript: 0,
            java: 0,
            go: 0,
            rust: 0,
            csharp: 0
        };

        const lines = code.split('\n');
        const codeStr = code.toLowerCase();

        // Python indicators
        if (/^\s*def\s+\w+/m.test(code)) scores.python += 15;
        if (/^\s*class\s+\w+.*:/m.test(code)) scores.python += 10;
        if (/^\s*import\s+\w+|^\s*from\s+\w+\s+import/m.test(code)) scores.python += 12;
        if (/print\s*\(/.test(code)) scores.python += 8;
        if (/if\s+.*:\s*$/m.test(code)) scores.python += 10;
        if (/elif\s+/.test(code)) scores.python += 15;
        if (/\.append\(|\.extend\(/.test(code)) scores.python += 10;
        if (/self\.\w+/.test(code)) scores.python += 12;
        if (/__init__|__str__|__repr__/.test(code)) scores.python += 15;
        if (/:\s*$/m.test(code)) scores.python += 5; // Colons at end of lines

        // TypeScript-specific indicators (checked before JavaScript)
        if (/:\s*string|:\s*number|:\s*boolean|:\s*void/.test(code)) scores.typescript += 20;
        if (/interface\s+\w+|type\s+\w+\s*=/.test(code)) scores.typescript += 20;
        if (/<[A-Z]\w*>/.test(code)) scores.typescript += 15; // Generics
        if (/as\s+\w+|as\s+const/.test(code)) scores.typescript += 12;
        if (/enum\s+\w+/.test(code)) scores.typescript += 15;
        if (/implements\s+\w+|extends\s+\w+/.test(code)) scores.typescript += 10;
        if (/@\w+\(/.test(code)) scores.typescript += 12; // Decorators
        if (/\?\s*:/.test(code)) scores.typescript += 8; // Ternary with types
        if (/public\s+\w+\s*:|private\s+\w+\s*:|protected\s+\w+\s*:/.test(code)) scores.typescript += 15;

        // JavaScript/Node.js indicators (also apply to TypeScript)
        if (/function\s+\w+\s*\(/.test(code)) {
            scores.javascript += 10;
            scores.typescript += 8; // TS can use functions too
        }
        if (/const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/.test(code)) {
            scores.javascript += 12;
            scores.typescript += 10;
        }
        if (/require\s*\(|import\s+.*\s+from/.test(code)) {
            scores.javascript += 15;
            scores.typescript += 12;
        }
        if (/=>\s*{|=>\s*\w/.test(code)) {
            scores.javascript += 15;
            scores.typescript += 12;
        }
        if (/console\.log|console\.error/.test(code)) {
            scores.javascript += 12;
            scores.typescript += 10;
        }
        if (/async\s+function|await\s+/.test(code)) {
            scores.javascript += 15;
            scores.typescript += 12;
        }
        if (/\.then\(|\.catch\(|Promise\./.test(code)) {
            scores.javascript += 10;
            scores.typescript += 8;
        }
        if (/===|!==/.test(code)) {
            scores.javascript += 8;
            scores.typescript += 6;
        }
        if (/\{[\s\S]*\}/.test(code) && /;/.test(code)) {
            scores.javascript += 5;
            scores.typescript += 5;
        }

        // Java indicators
        if (/public\s+(class|static|void)|private\s+|protected\s+/.test(code)) scores.java += 20;
        if (/System\.out\.println/.test(code)) scores.java += 15;
        if (/import\s+java\./.test(code)) scores.java += 20;
        if (/new\s+\w+\s*\(/.test(code) && /;/.test(code)) scores.java += 10;
        if (/String\s+\w+|int\s+\w+|boolean\s+\w+/.test(code)) scores.java += 12;
        if (/@Override|@Deprecated/.test(code)) scores.java += 15;

        // Go indicators  
        if (/package\s+main|package\s+\w+/.test(code)) scores.go += 20;
        if (/import\s+\([\s\S]*\)|import\s+"/.test(code)) scores.go += 15;
        if (/func\s+\w+\s*\(/.test(code)) scores.go += 15;
        if (/fmt\.Print|fmt\.Scan/.test(code)) scores.go += 15;
        if (/:=/.test(code)) scores.go += 12; // Short variable declaration
        if (/go\s+func/.test(code)) scores.go += 15; // Goroutines
        if (/defer\s+|range\s+/.test(code)) scores.go += 10;

        // Rust indicators
        if (/fn\s+\w+\s*\(/.test(code)) scores.rust += 15;
        if (/let\s+mut\s+|let\s+\w+\s*:/.test(code)) scores.rust += 12;
        if (/match\s+\w+\s*\{/.test(code) && /=>/.test(code)) scores.rust += 15;
        if (/impl\s+\w+|trait\s+\w+/.test(code)) scores.rust += 15;
        if (/println!\s*\(|panic!\s*\(/.test(code)) scores.rust += 15;
        if (/#!\[.*\]/.test(code)) scores.rust += 20;

        // C# indicators
        if (/using\s+System(\.?\w+)*;/.test(code)) scores.csharp += 20;
        if (/namespace\s+\w+|public\s+class\s+\w+/.test(code)) scores.csharp += 15;
        if (/Console\.WriteLine|Console\.ReadLine/.test(code)) scores.csharp += 15;
        if (/(public|private|protected|internal)\s+\w+\s+\w+\s*\(/.test(code)) scores.csharp += 12;
        if (/\w+\?/.test(code)) scores.csharp += 8; // Nullable types
        if (/\[\s*Array\s*\]/.test(code)) scores.csharp += 5;

        // Penalty for conflicting patterns
        // If has semicolons but also Python colons, reduce Python score
        const semicolonCount = (code.match(/;/g) || []).length;
        const colonCount = (code.match(/:\s*$/gm) || []).length;

        if (semicolonCount > 5) {
            scores.python -= 10;
        }
        if (colonCount > 3 && semicolonCount < 3) {
            scores.javascript -= 5;
            scores.java -= 5;
        }

        // Find the language with highest score
        let maxScore = 0;
        let detectedLang = 'python'; // Default

        for (const [lang, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                detectedLang = lang;
            }
        }

        // Calculate confidence (0-100)
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 0;

        return {
            language: detectedLang,
            confidence: confidence,
            scores: scores
        };
    }

    // Flatten rules for easier processing
    function flattenRules(lang) {
        const langRules = superRules[lang] || {};
        return Object.values(langRules).flat();
    }

    // Initialize
    highlightedCode.textContent = '';

    // Event Listeners
    analyzeBtn.addEventListener('click', runAnalysis);

    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        resetAnalysis();
    });

    exampleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (examples[val]) {
            codeInput.value = examples[val];
            // set language
            if (val.includes('py')) languageSelect.value = 'python';
            if (val.includes('js')) languageSelect.value = 'javascript';
            if (val.includes('ts')) languageSelect.value = 'typescript';
            runAnalysis();
        }
    });

    languageSelect.addEventListener('change', () => {
        if (codeInput.value.trim()) runAnalysis();
    });

    function resetAnalysis() {
        emptyState.classList.remove('hidden');
        highlightedCode.textContent = '';
        explanationList.innerHTML = '<p class="text-sm text-gray-500 italic text-center mt-4">No issues detected... yet.</p>';
        issueCount.textContent = '0';
        statusIndicator.className = 'text-xs text-gray-500';
        statusIndicator.textContent = 'Ready';
        highlightedCode.className = `language-${languageSelect.value}`;
        delete highlightedCode.dataset.highlighted;

        // Reset stats
        analysisStats = {
            totalIssues: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            categories: {}
        };
        updateStatsPanel();

        // Hide highlighted code container on reset
        highlightContainer.classList.add('hidden');
        statusPulse.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
    }

    function runAnalysis() {
        const code = codeInput.value;
        if (!code.trim()) return;

        emptyState.classList.add('hidden');
        statusIndicator.textContent = 'Detecting language...';
        statusIndicator.className = 'text-xs text-blue-400';

        // Reset stats
        analysisStats = {
            totalIssues: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            categories: {}
        };

        setTimeout(() => {
            // Auto-detect language
            const detection = detectLanguage(code);
            const detectedLang = detection.language;
            const confidence = detection.confidence;

            // Update language selector to detected language
            languageSelect.value = detectedLang;

            // Show detection result
            const langName = {
                python: 'Python',
                javascript: 'JavaScript',
                typescript: 'TypeScript',
                java: 'Java',
                go: 'Go',
                rust: 'Rust',
                csharp: 'C#'
            }[detectedLang];

            statusIndicator.textContent = `Detected: ${langName} (${confidence}% confident)`;
            statusIndicator.className = confidence > 70 ? 'text-xs text-green-400' : 'text-xs text-yellow-400';

            // Small delay to show detection
            setTimeout(() => {
                statusIndicator.textContent = 'Analyzing...';
                statusIndicator.className = 'text-xs text-blue-400';

                const lang = detectedLang;
                highlightedCode.className = `language-${lang}`;
                highlightedCode.textContent = code;

                // Show highlighted code container
                highlightContainer.classList.remove('hidden');

                hljs.highlightElement(highlightedCode);

                // Build code context
                buildCodeContext(code, lang);

                // Run detection
                const issues = detectIssues(code, lang);

                markIssues(issues);
                renderExplanations(issues);
                updateStatsPanel();

                const statusMsg = issues.length > 0
                    ? `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} `
                    : 'Clean ✓';
                statusIndicator.textContent = statusMsg;
                statusIndicator.className = issues.length > 0
                    ? 'text-xs text-amber-400 font-medium'
                    : 'text-xs text-emerald-400 font-medium';

                statusPulse.className = issues.length > 0
                    ? 'w-2 h-2 rounded-full bg-amber-500 animate-pulse'
                    : 'w-2 h-2 rounded-full bg-emerald-500';

                issueCount.textContent = issues.length;

                // Scroll results into view
                explanationList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500); // Show detection for 500ms
        }, 100);
    }

    function buildCodeContext(code, lang) {
        codeContext = {
            imports: [],
            functions: [],
            variables: [],
            classes: []
        };

        const lines = code.split('\n');

        if (lang === 'python') {
            lines.forEach(line => {
                if (line.match(/^import\s+|^from\s+\w+\s+import/)) {
                    codeContext.imports.push(line.trim());
                }
                const funcMatch = line.match(/^def\s+(\w+)/);
                if (funcMatch) codeContext.functions.push(funcMatch[1]);

                const varMatch = line.match(/^(\w+)\s*=/);
                if (varMatch) codeContext.variables.push(varMatch[1]);
            });
        } else if (lang === 'javascript') {
            lines.forEach(line => {
                if (line.match(/^(import|const|require)/)) {
                    codeContext.imports.push(line.trim());
                }
                const funcMatch = line.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/);
                if (funcMatch) codeContext.functions.push(funcMatch[1] || funcMatch[2]);

                const varMatch = line.match(/^(?:const|let|var)\s+(\w+)\s*=/);
                if (varMatch) codeContext.variables.push(varMatch[1]);
            });
        }
    }

    function detectIssues(code, lang) {
        const lines = code.split('\n');
        const issues = [];
        const rules = flattenRules(lang);

        lines.forEach((line, index) => {
            rules.forEach(rule => {
                // Check for multi-line custom check
                if (rule.multiLine && rule.check) {
                    if (rule.check(code, index)) {
                        addIssue(issues, index, line, rule);
                    }
                } else if (rule.pattern && rule.pattern.test(line)) {
                    addIssue(issues, index, line, rule);
                }
            });
        });

        return issues;
    }

    function addIssue(issues, lineIndex, line, rule) {
        issues.push({
            lineIndex: lineIndex,
            lineText: line.trim(),
            message: rule.message,
            type: getSeverityType(rule.severity),
            severity: rule.severity,
            confidence: rule.confidence,
            category: rule.category,
            quickFix: rule.quickFix,
            example: rule.example
        });

        // Update stats
        analysisStats.totalIssues++;
        analysisStats[rule.severity]++;
        analysisStats.categories[rule.category] = (analysisStats.categories[rule.category] || 0) + 1;
    }

    function getSeverityType(severity) {
        return severity === 'critical' || severity === 'high' ? 'error' : 'warning';
    }

    function markIssues(issues) {
        const lines = highlightedCode.innerHTML.split(/\r\n|\r|\n/);
        let newHtml = '';

        lines.forEach((lineHtml, idx) => {
            const issue = issues.find(i => i.lineIndex === idx);
            if (issue) {
                const markerClass = issue.type === 'error' ? 'hallucination-marker' : 'suspicious-marker';
                newHtml += `< div class="${markerClass}" title = "${escapeHtml(issue.message)}" > ${lineHtml || '&nbsp;'}</div > `;
            } else {
                newHtml += `< div > ${lineHtml || '&nbsp;'}</div > `;
            }
        });

        highlightedCode.innerHTML = newHtml;
    }

    function renderExplanations(issues) {
        if (issues.length === 0) {
            explanationList.innerHTML = `
    < div class="text-center py-8" >
                    <div class="text-green-400 text-5xl mb-4">✨</div>
                    <p class="text-lg text-green-400 font-semibold mb-2">No hallucinations detected!</p>
                    <p class="text-sm text-gray-500">Passed ${flattenRules(languageSelect.value).length}+ pattern checks</p>
                    <p class="text-xs text-gray-600 mt-3">Note: Always test code in a safe environment</p>
                </div >
    `;
            return;
        }

        const getSeverityBadge = (severity) => {
            const badges = {
                critical: '<span class="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded-lg border border-red-500/30 uppercase tracking-wider">Critical</span>',
                high: '<span class="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-bold rounded-lg border border-orange-500/30 uppercase tracking-wider">High Risk</span>',
                medium: '<span class="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded-lg border border-amber-500/30 uppercase tracking-wider">Medium</span>',
                low: '<span class="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded-lg border border-blue-500/30 uppercase tracking-wider">Minor</span>'
            };
            return badges[severity] || badges.medium;
        };

        const getCategoryIcon = (category) => {
            const icons = {
                syntax_error: '🔴',
                api_misuse: '⚠️',
                deprecated: '⏰',
                logic_error: '🐛',
                style: '💅',
                security: '🔒'
            };
            return icons[category] || '📋';
        };

        explanationList.innerHTML = issues.map((issue, i) => `
            <div class="glass border border-white/5 rounded-2xl p-5 mb-4 hover-lift animate-fade-in" style="animation-delay: ${i * 0.1}s">
                <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono font-bold bg-white/5 px-2 py-1 rounded text-muted uppercase tracking-wider">Line ${issue.lineIndex + 1}</span>
                        ${getSeverityBadge(issue.severity)}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-muted font-medium">
                        <span>${getCategoryIcon(issue.category)}</span>
                        <span>${formatCategory(issue.category)}</span>
                        <span class="w-1 h-1 rounded-full bg-white/20"></span>
                        <span class="text-[10px] opacity-70">${issue.confidence}% Confidence</span>
                    </div>
                </div>
                
                <h5 class="text-sm font-semibold text-white mb-3 leading-relaxed">${escapeHtml(issue.message)}</h5>
                
                <div class="bg-black/40 rounded-xl p-3 mb-4 border border-white/5 overflow-x-auto">
                    <code class="text-xs font-mono text-slate-400 whitespace-pre">${escapeHtml(issue.lineText)}</code>
                </div>
                
                ${issue.quickFix ? `
                    <div class="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 mb-3">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs">💡</span>
                            <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Recommended Fix</span>
                        </div>
                        <code class="text-xs text-emerald-300 font-mono">${escapeHtml(issue.quickFix)}</code>
                    </div>
                ` : ''}
                
                ${issue.example ? `
                    <details class="group">
                        <summary class="text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center gap-1 list-none">
                            <span class="group-open:rotate-90 transition-transform">▸</span> Show Reference Example
                        </summary>
                        <div class="mt-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                            <code class="text-xs font-mono text-slate-500 whitespace-pre italic leading-loose">${escapeHtml(issue.example)}</code>
                        </div>
                    </details>
                ` : ''}
            </div>
        `).join('');
    }

    function updateStatsPanel() {
        const totalRules = flattenRules(languageSelect.value).length;

        statsPanel.innerHTML = `
            <div class="bg-red-500/5 border border-red-500/10 p-3 rounded-2xl">
                <div class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Critical & High</div>
                <div class="text-xl font-bold flex items-baseline gap-1">${analysisStats.critical + analysisStats.high} <span class="text-[10px] text-red-400/50">⚠️</span></div>
            </div>
            <div class="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl">
                <div class="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Medium & Low</div>
                <div class="text-xl font-bold flex items-baseline gap-1">${analysisStats.medium + analysisStats.low} <span class="text-[10px] text-amber-400/50">💡</span></div>
            </div>
        `;
    }

    function formatCategory(category) {
        return category.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Auto-run on paste (with debounce)
    let pasteTimeout;
    codeInput.addEventListener('paste', () => {
        clearTimeout(pasteTimeout);
        pasteTimeout = setTimeout(runAnalysis, 200);
    });

    // Keyboard shortcut: Ctrl+Enter to analyze
    codeInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runAnalysis();
        }
    });

    // ============================================
    // SHARE FUNCTIONALITY
    // ============================================
    const shareUrl = window.location.href;
    const shareTitle = 'AI Hallucination Spotter | Premium Code Verification';
    const shareText = 'Check out this premium AI Hallucination Spotter tool to catch AI code lies!';

    // Facebook
    document.getElementById('share-facebook')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    });

    // LinkedIn
    document.getElementById('share-linkedin')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    });

    // Twitter/X
    document.getElementById('share-twitter')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    });

    // Copy Link
    document.getElementById('share-copy')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            const btn = document.getElementById('share-copy');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    // Mobile Share
    document.getElementById('share-tool-button')?.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed:', err);
            }
        } else {
            // Fallback to copy
            document.getElementById('share-copy')?.click();
        }
    });
});
