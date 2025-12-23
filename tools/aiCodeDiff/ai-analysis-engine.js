/**
 * AI Code Analysis Engine
 * Advanced pattern detection for code changes
 * Detects security issues, sensitive data, best practices, and more
 */

class AIAnalysisEngine {
    constructor() {
        this.patterns = {
            security: [],
            credentials: [],
            dataExposure: [],
            typesSafety: [],
            errorHandling: [],
            modernization: [],
            performance: [],
            bestPractices: [],
            configuration: [],
            apiChanges: [],
            dataFlow: []
        };
    }

    /**
     * Main analysis function
     */
    analyze(originalCode, newCode) {
        this.patterns = {
            security: [],
            credentials: [],
            dataExposure: [],
            typesSafety: [],
            errorHandling: [],
            modernization: [],
            performance: [],
            bestPractices: [],
            configuration: [],
            apiChanges: [],
            dataFlow: []
        };

        // Run all analysis modules
        this.analyzeSecurityVulnerabilities(originalCode, newCode);
        this.analyzeCredentialsAndSecrets(originalCode, newCode);
        this.analyzeDataExposure(originalCode, newCode);
        this.analyzeTypeSafety(originalCode, newCode);
        this.analyzeErrorHandling(originalCode, newCode);
        this.analyzeModernization(originalCode, newCode);
        this.analyzePerformance(originalCode, newCode);
        this.analyzeBestPractices(originalCode, newCode);
        this.analyzeConfiguration(originalCode, newCode);
        this.analyzeAPIChanges(originalCode, newCode);
        this.analyzeDataFlow(originalCode, newCode);

        return this.patterns;
    }

    /**
     * Security Vulnerabilities Detection
     */
    analyzeSecurityVulnerabilities(original, modified) {
        // SQL Injection
        if (this.hasSQLInjection(original) && !this.hasSQLInjection(modified)) {
            this.patterns.security.push({
                severity: 'critical',
                message: '🛡️ Fixed SQL injection vulnerability with parameterized queries'
            });
        }

        // XSS Prevention
        if (original.includes('innerHTML') && modified.includes('textContent')) {
            this.patterns.security.push({
                severity: 'high',
                message: '🛡️ Prevented XSS by using textContent instead of innerHTML'
            });
        }

        // Dangerous functions
        if (original.includes('eval(') && !modified.includes('eval(')) {
            this.patterns.security.push({
                severity: 'critical',
                message: '🛡️ Removed dangerous eval() function'
            });
        }

        // Command injection
        if (this.hasCommandInjection(original) && !this.hasCommandInjection(modified)) {
            this.patterns.security.push({
                severity: 'critical',
                message: '🛡️ Fixed command injection vulnerability'
            });
        }

        // Path traversal
        if (this.hasPathTraversal(original) && !this.hasPathTraversal(modified)) {
            this.patterns.security.push({
                severity: 'high',
                message: '🛡️ Fixed path traversal vulnerability'
            });
        }

        // CSRF protection
        if (!original.includes('csrf') && modified.includes('csrf')) {
            this.patterns.security.push({
                severity: 'medium',
                message: '🛡️ Added CSRF protection'
            });
        }

        // Input sanitization
        if (!original.includes('sanitize') && modified.includes('sanitize')) {
            this.patterns.security.push({
                severity: 'medium',
                message: '🛡️ Added input sanitization'
            });
        }
    }

    /**
     * Credentials and Secrets Detection
     */
    analyzeCredentialsAndSecrets(original, modified) {
        const credentialPatterns = [
            { regex: /password\s*=\s*["'][^"']+["']/gi, name: 'password' },
            { regex: /api[_-]?key\s*=\s*["'][^"']+["']/gi, name: 'API key' },
            { regex: /secret\s*=\s*["'][^"']+["']/gi, name: 'secret' },
            { regex: /token\s*=\s*["'][^"']+["']/gi, name: 'token' },
            { regex: /private[_-]?key\s*=\s*["'][^"']+["']/gi, name: 'private key' },
            { regex: /aws[_-]?access[_-]?key/gi, name: 'AWS access key' },
            { regex: /database[_-]?url\s*=\s*["'][^"']+["']/gi, name: 'database URL' }
        ];

        credentialPatterns.forEach(pattern => {
            const inOriginal = original.match(pattern.regex);
            const inModified = modified.match(pattern.regex);

            // Hardcoded credentials removed
            if (inOriginal && !inModified) {
                this.patterns.credentials.push({
                    severity: 'critical',
                    message: `🔐 Removed hardcoded ${pattern.name} (moved to environment variables)`
                });
            }

            // Hardcoded credentials added (BAD!)
            if (!inOriginal && inModified) {
                this.patterns.credentials.push({
                    severity: 'critical',
                    message: `⚠️ WARNING: Hardcoded ${pattern.name} detected! Use environment variables instead`
                });
            }
        });

        // Environment variable usage
        if (!original.includes('process.env') && modified.includes('process.env')) {
            this.patterns.credentials.push({
                severity: 'good',
                message: '🔐 Using environment variables for sensitive data'
            });
        }

        // .env file references
        if (!original.includes('.env') && modified.includes('.env')) {
            this.patterns.configuration.push({
                severity: 'good',
                message: '⚙️ Added .env file configuration'
            });
        }
    }

    /**
     * Data Exposure Detection
     */
    analyzeDataExposure(original, modified) {
        // Logging sensitive data
        const sensitiveDataPatterns = [
            'password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn', 'email'
        ];

        sensitiveDataPatterns.forEach(dataType => {
            const logPattern = new RegExp(`console\\.log\\([^)]*${dataType}[^)]*\\)`, 'gi');
            
            if (original.match(logPattern) && !modified.match(logPattern)) {
                this.patterns.dataExposure.push({
                    severity: 'high',
                    message: `🔒 Removed logging of sensitive data: ${dataType}`
                });
            }

            if (!original.match(logPattern) && modified.match(logPattern)) {
                this.patterns.dataExposure.push({
                    severity: 'critical',
                    message: `⚠️ WARNING: Logging sensitive data: ${dataType}`
                });
            }
        });

        // Error messages exposing data
        if (original.includes('error.stack') && !modified.includes('error.stack')) {
            this.patterns.dataExposure.push({
                severity: 'medium',
                message: '🔒 Removed stack trace from error responses'
            });
        }

        // PII handling
        if (!original.includes('encrypt') && modified.includes('encrypt')) {
            this.patterns.dataExposure.push({
                severity: 'good',
                message: '🔒 Added encryption for sensitive data'
            });
        }
    }

    /**
     * Type Safety Analysis
     */
    analyzeTypeSafety(original, modified) {
        // TypeScript interfaces
        if (!original.includes('interface') && modified.includes('interface')) {
            const interfaceCount = (modified.match(/interface\s+\w+/g) || []).length;
            this.patterns.typesSafety.push({
                severity: 'good',
                message: `📘 Added ${interfaceCount} TypeScript interface${interfaceCount > 1 ? 's' : ''} for type safety`
            });
        }

        // Optional chaining
        if (!original.includes('?.') && modified.includes('?.')) {
            this.patterns.typesSafety.push({
                severity: 'good',
                message: '📘 Using optional chaining for safer property access'
            });
        }

        // Nullish coalescing
        if (!original.includes('??') && modified.includes('??')) {
            this.patterns.typesSafety.push({
                severity: 'good',
                message: '📘 Using nullish coalescing operator for default values'
            });
        }

        // Type assertions
        if ((original.match(/as\s+any/g) || []).length > (modified.match(/as\s+any/g) || []).length) {
            this.patterns.typesSafety.push({
                severity: 'good',
                message: '📘 Replaced "any" type assertions with specific types'
            });
        }

        // Generic types
        if (!original.includes('<T>') && modified.includes('<T>')) {
            this.patterns.typesSafety.push({
                severity: 'good',
                message: '📘 Added generic types for better type flexibility'
            });
        }

        // Optional types in Java
        if (!original.includes('Optional<') && modified.includes('Optional<')) {
            this.patterns.typesSafety.push({
                severity: 'good',
                message: '📘 Using Optional to handle null values safely'
            });
        }
    }

    /**
     * Error Handling Analysis
     */
    analyzeErrorHandling(original, modified) {
        // Try-catch blocks
        const origTryCatch = (original.match(/try\s*{/g) || []).length;
        const modTryCatch = (modified.match(/try\s*{/g) || []).length;
        
        if (modTryCatch > origTryCatch) {
            this.patterns.errorHandling.push({
                severity: 'good',
                message: `🚨 Added ${modTryCatch - origTryCatch} try-catch block${modTryCatch - origTryCatch > 1 ? 's' : ''} for error handling`
            });
        }

        // Error logging
        if (!original.includes('console.error') && modified.includes('console.error')) {
            this.patterns.errorHandling.push({
                severity: 'good',
                message: '🚨 Added proper error logging'
            });
        }

        // Custom error classes
        if (!original.includes('extends Error') && modified.includes('extends Error')) {
            this.patterns.errorHandling.push({
                severity: 'good',
                message: '🚨 Created custom error classes for better error handling'
            });
        }

        // Error boundaries (React)
        if (!original.includes('componentDidCatch') && modified.includes('componentDidCatch')) {
            this.patterns.errorHandling.push({
                severity: 'good',
                message: '🚨 Added React error boundary'
            });
        }

        // Validation
        if (!original.includes('validate') && modified.includes('validate')) {
            this.patterns.errorHandling.push({
                severity: 'good',
                message: '🚨 Added input validation'
            });
        }
    }

    /**
     * Modernization Analysis
     */
    analyzeModernization(original, modified) {
        // Async/await
        if (!original.includes('async') && modified.includes('async')) {
            this.patterns.modernization.push({
                severity: 'good',
                message: '⚡ Converted to async/await pattern'
            });
        }

        // Arrow functions
        const origArrow = (original.match(/=>/g) || []).length;
        const modArrow = (modified.match(/=>/g) || []).length;
        if (modArrow > origArrow) {
            this.patterns.modernization.push({
                severity: 'good',
                message: '⚡ Using modern arrow functions'
            });
        }

        // Const/let instead of var
        if (original.includes('var ') && !modified.includes('var ')) {
            this.patterns.modernization.push({
                severity: 'good',
                message: '⚡ Replaced var with const/let'
            });
        }

        // Template literals
        if ((original.match(/\+\s*["']/g) || []).length > (modified.match(/\+\s*["']/g) || []).length) {
            if (modified.includes('`')) {
                this.patterns.modernization.push({
                    severity: 'good',
                    message: '⚡ Using template literals instead of string concatenation'
                });
            }
        }

        // Destructuring
        if (!original.includes('const {') && modified.includes('const {')) {
            this.patterns.modernization.push({
                severity: 'good',
                message: '⚡ Using destructuring for cleaner code'
            });
        }

        // Spread operator
        if (!original.includes('...') && modified.includes('...')) {
            this.patterns.modernization.push({
                severity: 'good',
                message: '⚡ Using spread operator'
            });
        }
    }

    /**
     * Performance Analysis
     */
    analyzePerformance(original, modified) {
        // Memoization
        if (!original.includes('useMemo') && modified.includes('useMemo')) {
            this.patterns.performance.push({
                severity: 'good',
                message: '🚀 Added memoization for performance optimization'
            });
        }

        // Lazy loading
        if (!original.includes('lazy(') && modified.includes('lazy(')) {
            this.patterns.performance.push({
                severity: 'good',
                message: '🚀 Implemented lazy loading'
            });
        }

        // Debouncing/Throttling
        if (!original.includes('debounce') && modified.includes('debounce')) {
            this.patterns.performance.push({
                severity: 'good',
                message: '🚀 Added debouncing for performance'
            });
        }

        // Caching
        if (!original.includes('cache') && modified.includes('cache')) {
            this.patterns.performance.push({
                severity: 'good',
                message: '🚀 Implemented caching mechanism'
            });
        }

        // Database indexing
        if (!original.includes('index') && modified.includes('CREATE INDEX')) {
            this.patterns.performance.push({
                severity: 'good',
                message: '🚀 Added database indexes for faster queries'
            });
        }
    }

    /**
     * Best Practices Analysis
     */
    analyzeBestPractices(original, modified) {
        // Comments and documentation
        const origComments = (original.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        const modComments = (modified.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (modComments > origComments) {
            this.patterns.bestPractices.push({
                severity: 'good',
                message: '✨ Added JSDoc comments for better documentation'
            });
        }

        // Strict equality
        if ((original.match(/==/g) || []).length > (modified.match(/==/g) || []).length) {
            this.patterns.bestPractices.push({
                severity: 'good',
                message: '✨ Using strict equality (===) instead of loose equality (==)'
            });
        }

        // Default parameters
        if (!original.includes('= ') && modified.match(/\w+\s*=\s*[^=]/)) {
            this.patterns.bestPractices.push({
                severity: 'good',
                message: '✨ Added default parameter values'
            });
        }

        // Immutability
        if (!original.includes('Object.freeze') && modified.includes('Object.freeze')) {
            this.patterns.bestPractices.push({
                severity: 'good',
                message: '✨ Using Object.freeze for immutability'
            });
        }

        // Single responsibility
        const origFunctions = (original.match(/function\s+\w+/g) || []).length;
        const modFunctions = (modified.match(/function\s+\w+/g) || []).length;
        if (modFunctions > origFunctions * 1.5) {
            this.patterns.bestPractices.push({
                severity: 'good',
                message: '✨ Refactored into smaller, focused functions (Single Responsibility Principle)'
            });
        }
    }

    /**
     * Configuration Changes Analysis
     */
    analyzeConfiguration(original, modified) {
        // Port changes
        const origPort = original.match(/port[:\s]*=?\s*(\d+)/i);
        const modPort = modified.match(/port[:\s]*=?\s*(\d+)/i);
        if (origPort && modPort && origPort[1] !== modPort[1]) {
            this.patterns.configuration.push({
                severity: 'medium',
                message: `⚙️ Changed port from ${origPort[1]} to ${modPort[1]}`
            });
        }

        // Timeout changes
        const origTimeout = original.match(/timeout[:\s]*=?\s*(\d+)/i);
        const modTimeout = modified.match(/timeout[:\s]*=?\s*(\d+)/i);
        if (origTimeout && modTimeout && origTimeout[1] !== modTimeout[1]) {
            this.patterns.configuration.push({
                severity: 'medium',
                message: `⚙️ Changed timeout from ${origTimeout[1]}ms to ${modTimeout[1]}ms`
            });
        }

        // CORS configuration
        if (!original.includes('cors') && modified.includes('cors')) {
            this.patterns.configuration.push({
                severity: 'good',
                message: '⚙️ Added CORS configuration'
            });
        }

        // Rate limiting
        if (!original.includes('rateLimit') && modified.includes('rateLimit')) {
            this.patterns.configuration.push({
                severity: 'good',
                message: '⚙️ Added rate limiting'
            });
        }
    }

    /**
     * API Changes Analysis
     */
    analyzeAPIChanges(original, modified) {
        // REST endpoints
        const origEndpoints = original.match(/['"]\/api\/[\w\/]+['"]/g) || [];
        const modEndpoints = modified.match(/['"]\/api\/[\w\/]+['"]/g) || [];
        
        const newEndpoints = modEndpoints.filter(e => !origEndpoints.includes(e));
        const removedEndpoints = origEndpoints.filter(e => !modEndpoints.includes(e));

        if (newEndpoints.length > 0) {
            this.patterns.apiChanges.push({
                severity: 'medium',
                message: `🔌 Added ${newEndpoints.length} new API endpoint${newEndpoints.length > 1 ? 's' : ''}`
            });
        }

        if (removedEndpoints.length > 0) {
            this.patterns.apiChanges.push({
                severity: 'high',
                message: `🔌 Removed ${removedEndpoints.length} API endpoint${removedEndpoints.length > 1 ? 's' : ''} (breaking change)`
            });
        }

        // HTTP methods
        if (!original.includes('PUT') && modified.includes('PUT')) {
            this.patterns.apiChanges.push({
                severity: 'medium',
                message: '🔌 Added PUT method support'
            });
        }

        // Authentication
        if (!original.includes('auth') && modified.includes('auth')) {
            this.patterns.apiChanges.push({
                severity: 'good',
                message: '🔌 Added authentication to API'
            });
        }
    }

    /**
     * Data Flow Analysis
     */
    analyzeDataFlow(original, modified) {
        // State management
        if (!original.includes('useState') && modified.includes('useState')) {
            this.patterns.dataFlow.push({
                severity: 'good',
                message: '📊 Added state management with useState'
            });
        }

        if (!original.includes('useReducer') && modified.includes('useReducer')) {
            this.patterns.dataFlow.push({
                severity: 'good',
                message: '📊 Implemented useReducer for complex state logic'
            });
        }

        // Props changes
        const origProps = (original.match(/props\.\w+/g) || []).length;
        const modProps = (modified.match(/props\.\w+/g) || []).length;
        if (modProps > origProps * 1.5) {
            this.patterns.dataFlow.push({
                severity: 'medium',
                message: '📊 Significant increase in prop usage - consider prop drilling optimization'
            });
        }

        // Context API
        if (!original.includes('createContext') && modified.includes('createContext')) {
            this.patterns.dataFlow.push({
                severity: 'good',
                message: '📊 Implemented Context API for state sharing'
            });
        }
    }

    // Helper methods
    hasSQLInjection(code) {
        return /SELECT.*\+|query\(.*\+|execute\(.*\+/.test(code);
    }

    hasCommandInjection(code) {
        return /exec\(.*\+|system\(.*\+|spawn\(.*\+/.test(code);
    }

    hasPathTraversal(code) {
        return /\.\.\/|\.\.\\/.test(code) && !/node_modules/.test(code);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAnalysisEngine;
}
