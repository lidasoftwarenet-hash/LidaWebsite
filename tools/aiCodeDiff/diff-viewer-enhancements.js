/**
 * AI Code Diff Viewer - Premium Enhancements
 * Advanced features for the ultimate diff viewing experience
 */

class DiffViewerEnhancements {
    constructor() {
        this.history = this.loadHistory();
        this.currentTheme = localStorage.getItem('diffTheme') || 'dark';
        this.searchResults = [];
        this.currentSearchIndex = 0;
    }

    // ==================== HISTORY & STORAGE ====================
    
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('diffHistory') || '[]');
        } catch {
            return [];
        }
    }

    saveToHistory(original, modified, title = null) {
        const entry = {
            id: Date.now(),
            title: title || `Comparison ${new Date().toLocaleString()}`,
            original,
            modified,
            timestamp: new Date().toISOString(),
            stats: this.calculateQuickStats(original, modified)
        };

        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('diffHistory', JSON.stringify(this.history));
        return entry;
    }

    loadFromHistory(id) {
        return this.history.find(entry => entry.id === id);
    }

    deleteFromHistory(id) {
        this.history = this.history.filter(entry => entry.id !== id);
        localStorage.setItem('diffHistory', JSON.stringify(this.history));
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('diffHistory');
    }

    calculateQuickStats(original, modified) {
        const origLines = original.split('\n').length;
        const modLines = modified.split('\n').length;
        return {
            originalLines: origLines,
            modifiedLines: modLines,
            difference: modLines - origLines
        };
    }

    // ==================== EXPORT FEATURES ====================

    exportToPDF(title, originalCode, modifiedCode, insights, stats) {
        // Create a printable HTML version
        const printWindow = window.open('', '_blank');
        const content = this.generatePrintableHTML(title, originalCode, modifiedCode, insights, stats);
        
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    generatePrintableHTML(title, originalCode, modifiedCode, insights, stats) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
        .stat-box { border: 1px solid #ddd; padding: 10px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .code-section { margin: 20px 0; }
        .code-title { font-weight: bold; margin-bottom: 10px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .insights { margin: 20px 0; }
        .insight-item { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #667eea; }
        @media print {
            .no-print { display: none; }
            pre { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="stats">
        <div class="stat-box">
            <div class="stat-value" style="color: #22c55e;">${stats.added}</div>
            <div>Lines Added</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" style="color: #ef4444;">${stats.deleted}</div>
            <div>Lines Deleted</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" style="color: #3b82f6;">${stats.changes}</div>
            <div>Total Changes</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" style="color: #a855f7;">${stats.similarity}%</div>
            <div>Similarity</div>
        </div>
    </div>

    <div class="insights">
        <h2>AI Analysis</h2>
        ${insights.map(i => `<div class="insight-item">${i}</div>`).join('')}
    </div>

    <div class="code-section">
        <div class="code-title">Original Code:</div>
        <pre>${this.escapeHtml(originalCode)}</pre>
    </div>

    <div class="code-section">
        <div class="code-title">Modified Code:</div>
        <pre>${this.escapeHtml(modifiedCode)}</pre>
    </div>

    <button class="no-print" onclick="window.print()" style="padding: 10px 20px; margin: 20px 0;">Print / Save as PDF</button>
</body>
</html>`;
    }

    exportToMarkdown(title, originalCode, modifiedCode, insights, stats) {
        const markdown = `# ${title}

**Generated:** ${new Date().toLocaleString()}

## Statistics

| Metric | Value |
|--------|-------|
| Lines Added | ${stats.added} |
| Lines Deleted | ${stats.deleted} |
| Total Changes | ${stats.changes} |
| Similarity | ${stats.similarity}% |

## AI Analysis

${insights.map(i => `- ${i}`).join('\n')}

## Original Code

\`\`\`
${originalCode}
\`\`\`

## Modified Code

\`\`\`
${modifiedCode}
\`\`\`

---
*Generated by AI Code Diff Viewer - lidasoftware.online*
`;

        this.downloadFile(markdown, `${title.replace(/[^a-z0-9]/gi, '_')}.md`, 'text/markdown');
    }

    exportToJSON(title, originalCode, modifiedCode, insights, stats, patterns) {
        const data = {
            title,
            timestamp: new Date().toISOString(),
            statistics: stats,
            insights,
            patterns,
            code: {
                original: originalCode,
                modified: modifiedCode
            }
        };

        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, `${title.replace(/[^a-z0-9]/gi, '_')}.json`, 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== SEARCH & FILTER ====================

    searchInDiff(query, diffText) {
        if (!query) {
            this.searchResults = [];
            return [];
        }

        const lines = diffText.split('\n');
        this.searchResults = [];
        
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
                this.searchResults.push({
                    lineNumber: index + 1,
                    content: line,
                    context: this.getLineContext(lines, index)
                });
            }
        });

        this.currentSearchIndex = 0;
        return this.searchResults;
    }

    getLineContext(lines, index, contextLines = 2) {
        const start = Math.max(0, index - contextLines);
        const end = Math.min(lines.length, index + contextLines + 1);
        return lines.slice(start, end).join('\n');
    }

    nextSearchResult() {
        if (this.searchResults.length === 0) return null;
        this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        return this.searchResults[this.currentSearchIndex];
    }

    previousSearchResult() {
        if (this.searchResults.length === 0) return null;
        this.currentSearchIndex = (this.currentSearchIndex - 1 + this.searchResults.length) % this.searchResults.length;
        return this.searchResults[this.currentSearchIndex];
    }

    filterByCategory(insights, category) {
        if (category === 'all') return insights;
        return insights.filter(i => i.type === category);
    }

    // ==================== COMPLEXITY METRICS ====================

    calculateComplexityMetrics(code) {
        const metrics = {
            cyclomaticComplexity: this.calculateCyclomaticComplexity(code),
            linesOfCode: code.split('\n').filter(line => line.trim()).length,
            commentDensity: this.calculateCommentDensity(code),
            functionCount: (code.match(/function\s+\w+|=>\s*{|^\s*\w+\s*\(/gm) || []).length,
            maxNestingDepth: this.calculateMaxNesting(code),
            duplicateLines: this.findDuplicateLines(code)
        };

        metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics);
        
        return metrics;
    }

    calculateCyclomaticComplexity(code) {
        // Count decision points
        const patterns = [
            /\bif\b/g,
            /\belse\s+if\b/g,
            /\bfor\b/g,
            /\bwhile\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\b\?\s*.*\s*:/g, // ternary
            /&&/g,
            /\|\|/g
        ];

        let complexity = 1; // Base complexity
        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) complexity += matches.length;
        });

        return complexity;
    }

    calculateCommentDensity(code) {
        const totalLines = code.split('\n').length;
        const commentLines = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
        return totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0;
    }

    calculateMaxNesting(code) {
        let maxDepth = 0;
        let currentDepth = 0;

        for (let char of code) {
            if (char === '{' || char === '(') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (char === '}' || char === ')') {
                currentDepth--;
            }
        }

        return maxDepth;
    }

    findDuplicateLines(code) {
        const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 10);
        const lineCount = {};
        
        lines.forEach(line => {
            lineCount[line] = (lineCount[line] || 0) + 1;
        });

        return Object.values(lineCount).filter(count => count > 1).length;
    }

    calculateMaintainabilityIndex(metrics) {
        // Simplified maintainability index (0-100, higher is better)
        const volumeScore = Math.max(0, 100 - (metrics.linesOfCode / 10));
        const complexityScore = Math.max(0, 100 - (metrics.cyclomaticComplexity * 5));
        const commentScore = metrics.commentDensity;
        const nestingScore = Math.max(0, 100 - (metrics.maxNestingDepth * 10));

        return Math.round((volumeScore + complexityScore + commentScore + nestingScore) / 4);
    }

    getComplexityRating(index) {
        if (index >= 80) return { rating: 'Excellent', color: '#22c55e', icon: '🌟' };
        if (index >= 60) return { rating: 'Good', color: '#3b82f6', icon: '✅' };
        if (index >= 40) return { rating: 'Fair', color: '#f59e0b', icon: '⚠️' };
        return { rating: 'Needs Improvement', color: '#ef4444', icon: '🔴' };
    }

    // ==================== THEMES ====================

    applyTheme(themeName) {
        this.currentTheme = themeName;
        localStorage.setItem('diffTheme', themeName);
        
        const themes = {
            dark: {
                bg: 'linear-gradient(135deg, #0d1117 0%, #1a1e2e 100%)',
                text: '#c9d1d9',
                accent: '#667eea'
            },
            light: {
                bg: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                text: '#212529',
                accent: '#667eea'
            },
            ocean: {
                bg: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
                text: '#8892b0',
                accent: '#64ffda'
            },
            sunset: {
                bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                text: '#e94560',
                accent: '#f39c12'
            }
        };

        const theme = themes[themeName] || themes.dark;
        document.body.style.background = theme.bg;
        document.body.style.color = theme.text;
        
        return theme;
    }

    // ==================== AI SUGGESTIONS ====================

    generateFixSuggestions(patterns) {
        const suggestions = [];

        // Security fixes
        if (patterns.security && patterns.security.length > 0) {
            patterns.security.forEach(issue => {
                if (issue.message.includes('SQL injection')) {
                    suggestions.push({
                        category: 'Security',
                        issue: 'SQL Injection vulnerability',
                        suggestion: 'Use parameterized queries or prepared statements',
                        code: `// Instead of:\ndb.query("SELECT * FROM users WHERE id = " + userId);\n\n// Use:\ndb.query("SELECT * FROM users WHERE id = ?", [userId]);`
                    });
                }
            });
        }

        // Credentials fixes
        if (patterns.credentials && patterns.credentials.length > 0) {
            suggestions.push({
                category: 'Security',
                issue: 'Hardcoded credentials detected',
                suggestion: 'Move sensitive data to environment variables',
                code: `// Instead of:\nconst apiKey = "sk-1234567890";\n\n// Use:\nconst apiKey = process.env.API_KEY;`
            });
        }

        // Type safety improvements
        if (patterns.typesSafety && patterns.typesSafety.length > 0) {
            suggestions.push({
                category: 'Type Safety',
                issue: 'Missing type definitions',
                suggestion: 'Add TypeScript interfaces for better type safety',
                code: `interface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nfunction getUser(id: string): User { ... }`
            });
        }

        return suggestions;
    }

    // ==================== PERFORMANCE ANALYSIS ====================

    analyzePerformance(originalCode, modifiedCode) {
        const analysis = {
            original: this.getPerformanceScore(originalCode),
            modified: this.getPerformanceScore(modifiedCode)
        };

        analysis.improvement = analysis.modified.score - analysis.original.score;
        analysis.recommendation = this.getPerformanceRecommendation(analysis);

        return analysis;
    }

    getPerformanceScore(code) {
        let score = 100;
        const issues = [];

        // Check for performance anti-patterns
        if (code.includes('for (') && code.includes('.push(')) {
            score -= 10;
            issues.push('Consider using map() instead of for-loop with push()');
        }

        if ((code.match(/\.forEach/g) || []).length > 3) {
            score -= 5;
            issues.push('Multiple forEach loops - consider combining operations');
        }

        if (code.includes('JSON.parse(JSON.stringify(')) {
            score -= 15;
            issues.push('Deep cloning with JSON - use structured clone or library');
        }

        if ((code.match(/await\s+/g) || []).length > 5 && !code.includes('Promise.all')) {
            score -= 10;
            issues.push('Sequential awaits - consider Promise.all for parallel execution');
        }

        return { score: Math.max(0, score), issues };
    }

    getPerformanceRecommendation(analysis) {
        if (analysis.improvement > 10) {
            return '🚀 Great performance improvements!';
        } else if (analysis.improvement > 0) {
            return '✅ Minor performance gains';
        } else if (analysis.improvement < -10) {
            return '⚠️ Performance may have degraded';
        }
        return '➡️ No significant performance change';
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiffViewerEnhancements;
}
