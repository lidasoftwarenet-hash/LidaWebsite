// ===== UTILITY FUNCTIONS WITH ERROR HANDLING =====

/**
 * Safe localStorage operations with error handling
 */
const SafeStorage = {
    /**
     * Safely set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error(`Failed to save to localStorage (${key}):`, e);
            if (e.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            }
            return false;
        }
    },

    /**
     * Safely get item from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found or error
     * @returns {any} Retrieved value or default
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (e) {
            console.error(`Failed to read from localStorage (${key}):`, e);
            return defaultValue;
        }
    },

    /**
     * Safely remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Failed to remove from localStorage (${key}):`, e);
            return false;
        }
    },

    /**
     * Handle quota exceeded error by clearing old data
     */
    handleQuotaExceeded() {
        try {
            // Clear old prompt history to free up space
            const history = this.getItem('promptHistory', []);
            if (history.length > 3) {
                // Keep only 3 most recent
                const trimmed = history.slice(0, 3);
                this.setItem('promptHistory', trimmed);
                showToast('Storage limit reached. Cleared old prompts.', 'warning');
            }
        } catch (e) {
            console.error('Failed to handle quota exceeded:', e);
            showToast('Storage full. Please clear browser data.', 'error');
        }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * Input validation and sanitization
 */
const InputValidator = {
    /**
     * Sanitize HTML to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Validate and sanitize URL with comprehensive checks
     * @param {string} url - URL to validate
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    validateURL(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, sanitized: '', error: 'URL is required' };
        }

        const trimmed = url.trim();
        
        // Check length
        if (trimmed.length > 2048) {
            return { valid: false, sanitized: trimmed, error: 'URL is too long (max 2048 characters)' };
        }
        
        // Check if starts with http:// or https://
        if (!trimmed.match(/^https?:\/\//i)) {
            return { valid: false, sanitized: trimmed, error: 'URL must start with http:// or https://' };
        }

        // Check for dangerous characters
        const dangerousChars = ['<', '>', '"', "'", '`', '{', '}', '|', '\\', '^', '[', ']'];
        for (const char of dangerousChars) {
            if (trimmed.includes(char)) {
                return { valid: false, sanitized: trimmed, error: 'URL contains invalid characters' };
            }
        }

        // Try to create URL object to validate
        try {
            const urlObj = new URL(trimmed);
            
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, sanitized: trimmed, error: 'Only HTTP and HTTPS protocols are allowed' };
            }
            
            // Check for valid hostname
            if (!urlObj.hostname || urlObj.hostname.length < 1) {
                return { valid: false, sanitized: trimmed, error: 'Invalid hostname' };
            }
            
            // Prevent localhost/private IPs in production (optional security measure)
            const hostname = urlObj.hostname.toLowerCase();
            const privatePatterns = [
                /^localhost$/i,
                /^127\./,
                /^192\.168\./,
                /^10\./,
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
                /^0\.0\.0\.0$/,
                /^\[?::1\]?$/,
                /^\[?fe80:/i
            ];
            
            // Allow localhost in development
            const isDevelopment = window.location.hostname === 'localhost' || 
                                 window.location.hostname === '127.0.0.1';
            
            if (!isDevelopment) {
                for (const pattern of privatePatterns) {
                    if (pattern.test(hostname)) {
                        return { valid: false, sanitized: trimmed, error: 'Private/local URLs are not allowed' };
                    }
                }
            }
            
            return { valid: true, sanitized: urlObj.href, error: null };
        } catch (e) {
            return { valid: false, sanitized: trimmed, error: 'Invalid URL format' };
        }
    },

    /**
     * Validate text length
     * @param {string} text - Text to validate
     * @param {number} maxLength - Maximum allowed length
     * @returns {object} {valid: boolean, length: number, error: string}
     */
    validateLength(text, maxLength = 5000) {
        if (!text) {
            return { valid: true, length: 0, error: null };
        }
        
        const length = text.length;
        if (length > maxLength) {
            return { 
                valid: false, 
                length, 
                error: `Text exceeds maximum length of ${maxLength} characters (current: ${length})` 
            };
        }
        
        return { valid: true, length, error: null };
    },

    /**
     * Validate required field
     * @param {string} value - Value to validate
     * @param {string} fieldName - Field name for error message
     * @returns {object} {valid: boolean, error: string}
     */
    validateRequired(value, fieldName) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, error: `${fieldName} is required` };
        }
        return { valid: true, error: null };
    },

    /**
     * Sanitize text input more thoroughly
     * @param {string} text - Text to sanitize
     * @param {object} options - Sanitization options
     * @returns {string} Sanitized text
     */
    sanitizeText(text, options = {}) {
        if (!text || typeof text !== 'string') return '';
        
        const {
            maxLength = 10000,
            allowNewlines = true,
            trimWhitespace = true,
            removeControlChars = true
        } = options;
        
        let sanitized = text;
        
        // Remove control characters except newlines and tabs
        if (removeControlChars) {
            sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        }
        
        // Remove or replace newlines
        if (!allowNewlines) {
            sanitized = sanitized.replace(/[\r\n]+/g, ' ');
        }
        
        // Trim whitespace
        if (trimWhitespace) {
            sanitized = sanitized.trim();
            // Replace multiple spaces with single space
            sanitized = sanitized.replace(/\s+/g, ' ');
        }
        
        // Truncate to max length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        
        // HTML escape for safety
        sanitized = this.sanitizeHTML(sanitized);
        
        return sanitized;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {object} {valid: boolean, error: string}
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }
        
        const trimmed = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(trimmed)) {
            return { valid: false, error: 'Invalid email format' };
        }
        
        if (trimmed.length > 254) {
            return { valid: false, error: 'Email is too long' };
        }
        
        return { valid: true, error: null };
    },

    /**
     * Character limit configurations for different field types
     */
    LIMITS: {
        SHORT_TEXT: 100,      // Project name, team size, etc.
        MEDIUM_TEXT: 500,     // Technology stack, constraints
        LONG_TEXT: 2000,      // Context, problem description
        VERY_LONG_TEXT: 5000, // Detailed requirements, additional instructions
        URL: 2048             // URLs
    }
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Error logger with user-friendly messages
 */
const ErrorLogger = {
    /**
     * Log error and show user-friendly message
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     * @param {boolean} showToUser - Whether to show toast to user
     */
    log(error, context, showToUser = true) {
        // Log to console for debugging
        console.error(`[${context}]`, error);
        
        // Show user-friendly message
        if (showToUser && typeof showToast === 'function') {
            const userMessage = this.getUserMessage(error, context);
            showToast(userMessage, 'error');
        }
        
        // In production, you could send to error tracking service
        // e.g., Sentry.captureException(error, { tags: { context } });
    },

    /**
     * Get user-friendly error message
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     * @returns {string} User-friendly message
     */
    getUserMessage(error, context) {
        const messages = {
            'localStorage': 'Failed to save data. Please check your browser storage settings.',
            'network': 'Network error. Please check your internet connection.',
            'validation': 'Please check your input and try again.',
            'generation': 'Failed to generate prompt. Please try again.',
            'default': 'An error occurred. Please try again.'
        };
        
        return messages[context] || messages.default;
    }
};

/**
 * Loading state manager
 */
const LoadingManager = {
    activeLoaders: new Set(),

    /**
     * Show loading state
     * @param {string} id - Unique identifier for this loading state
     * @param {HTMLElement} element - Element to show loading on
     */
    show(id, element) {
        this.activeLoaders.add(id);
        if (element) {
            element.disabled = true;
            element.classList.add('loading');
            
            // Store original content
            if (!element.dataset.originalContent) {
                element.dataset.originalContent = element.innerHTML;
            }
            
            // Show loading spinner
            element.innerHTML = '<span class="material-symbols-outlined spinning">progress_activity</span> Loading...';
        }
    },

    /**
     * Hide loading state
     * @param {string} id - Unique identifier for this loading state
     * @param {HTMLElement} element - Element to hide loading from
     */
    hide(id, element) {
        this.activeLoaders.delete(id);
        if (element) {
            element.disabled = false;
            element.classList.remove('loading');
            
            // Restore original content
            if (element.dataset.originalContent) {
                element.innerHTML = element.dataset.originalContent;
                delete element.dataset.originalContent;
            }
        }
    },

    /**
     * Check if any loaders are active
     * @returns {boolean} True if any loaders are active
     */
    isLoading() {
        return this.activeLoaders.size > 0;
    }
};

/**
 * Browser compatibility helpers
 */
const BrowserCompat = {
    /**
     * Check if browser supports required features
     * @returns {object} Support status for various features
     */
    checkSupport() {
        return {
            localStorage: SafeStorage.isAvailable(),
            clipboard: !!navigator.clipboard,
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined'
        };
    },

    /**
     * Add vendor prefixes for CSS properties
     * @param {HTMLElement} element - Element to apply styles to
     * @param {string} property - CSS property name
     * @param {string} value - CSS property value
     */
    addVendorPrefix(element, property, value) {
        const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
        prefixes.forEach(prefix => {
            element.style[prefix + property] = value;
        });
    }
};

/**
 * Accessibility helpers
 */
const A11y = {
    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('a11y-announcer') || this.createAnnouncer();
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    },

    /**
     * Create screen reader announcer element
     * @returns {HTMLElement} Announcer element
     */
    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'a11y-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
        return announcer;
    },

    /**
     * Trap focus within an element (for modals)
     * @param {HTMLElement} element - Element to trap focus in
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        // Focus first element
        firstFocusable?.focus();
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SafeStorage,
        InputValidator,
        debounce,
        throttle,
        ErrorLogger,
        LoadingManager,
        BrowserCompat,
        A11y
    };
}
