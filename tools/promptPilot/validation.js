// ===== FORM VALIDATION AND CHARACTER COUNTERS =====

/**
 * Character counter manager
 */
const CharacterCounter = {
    /**
     * Initialize character counters for all inputs with maxlength
     */
    initAll() {
        // Define field limits
        const fieldLimits = {
            // Short text fields
            'projectName': InputValidator.LIMITS.SHORT_TEXT,
            'teamSize': InputValidator.LIMITS.SHORT_TEXT,
            'timeframe': InputValidator.LIMITS.SHORT_TEXT,
            'deadline': InputValidator.LIMITS.SHORT_TEXT,
            
            // Medium text fields
            'projectType': InputValidator.LIMITS.MEDIUM_TEXT,
            'technology': InputValidator.LIMITS.MEDIUM_TEXT,
            'teamExperience': InputValidator.LIMITS.MEDIUM_TEXT,
            'stakeholders': InputValidator.LIMITS.MEDIUM_TEXT,
            'technicalConstraints': InputValidator.LIMITS.MEDIUM_TEXT,
            'businessConstraints': InputValidator.LIMITS.MEDIUM_TEXT,
            'budget': InputValidator.LIMITS.MEDIUM_TEXT,
            'resources': InputValidator.LIMITS.MEDIUM_TEXT,
            'successMetrics': InputValidator.LIMITS.MEDIUM_TEXT,
            'outputFormat': InputValidator.LIMITS.MEDIUM_TEXT,
            
            // Long text fields
            'context': InputValidator.LIMITS.LONG_TEXT,
            'currentProblem': InputValidator.LIMITS.LONG_TEXT,
            'desiredOutcome': InputValidator.LIMITS.LONG_TEXT,
            'mustHave': InputValidator.LIMITS.LONG_TEXT,
            'niceToHave': InputValidator.LIMITS.LONG_TEXT,
            
            // Very long text fields
            'additionalInstructions': InputValidator.LIMITS.VERY_LONG_TEXT
        };
        
        // Apply limits and counters to each field
        Object.keys(fieldLimits).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                this.addCounter(field, fieldLimits[fieldId]);
            }
        });
    },
    
    /**
     * Add character counter to a field
     * @param {HTMLElement} field - Input or textarea element
     * @param {number} maxLength - Maximum character length
     */
    addCounter(field, maxLength) {
        // Set maxlength attribute
        field.setAttribute('maxlength', maxLength);
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.dataset.fieldId = field.id;
        
        // Insert counter after the field
        field.parentNode.insertBefore(counter, field.nextSibling);
        
        // Update counter on input
        const updateCounter = () => {
            const length = field.value.length;
            const remaining = maxLength - length;
            const percentage = (length / maxLength) * 100;
            
            counter.textContent = `${length} / ${maxLength} characters`;
            
            // Update styling based on usage
            counter.classList.remove('warning', 'danger');
            field.classList.remove('near-limit', 'at-limit');
            
            if (percentage >= 100) {
                counter.classList.add('danger');
                field.classList.add('at-limit');
            } else if (percentage >= 90) {
                counter.classList.add('warning');
                field.classList.add('near-limit');
            }
        };
        
        // Initial update
        updateCounter();
        
        // Update on input
        field.addEventListener('input', updateCounter);
        field.addEventListener('change', updateCounter);
    },
    
    /**
     * Get counter element for a field
     * @param {string} fieldId - Field ID
     * @returns {HTMLElement|null} Counter element
     */
    getCounter(fieldId) {
        return document.querySelector(`.char-counter[data-field-id="${fieldId}"]`);
    }
};

/**
 * Form validation manager
 */
const FormValidator = {
    /**
     * Validate all required fields in current step
     * @param {number} step - Current wizard step
     * @returns {boolean} True if all validations pass
     */
    validateStep(step) {
        const requiredFields = {
            1: [
                { id: 'projectName', name: 'Project Name' },
                { id: 'projectType', name: 'Project Type' }
            ],
            3: [
                { id: 'currentProblem', name: 'Current Problem' }
            ],
            4: [
                { id: 'desiredOutcome', name: 'Desired Outcome' }
            ]
        };
        
        const fieldsToValidate = requiredFields[step] || [];
        let isValid = true;
        let firstInvalidField = null;
        
        for (const fieldInfo of fieldsToValidate) {
            const field = document.getElementById(fieldInfo.id);
            if (!field) continue;
            
            const validation = InputValidator.validateRequired(field.value, fieldInfo.name);
            
            if (!validation.valid) {
                this.showFieldError(field, validation.error);
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            } else {
                this.clearFieldError(field);
            }
        }
        
        // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return isValid;
    },
    
    /**
     * Show error message for a field
     * @param {HTMLElement} field - Input element
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('field-error');
        
        // Create error message element
        const error = document.createElement('div');
        error.className = 'field-error-message';
        error.textContent = message;
        error.dataset.fieldId = field.id;
        
        // Insert after field (or after counter if exists)
        const counter = CharacterCounter.getCounter(field.id);
        const insertAfter = counter || field;
        insertAfter.parentNode.insertBefore(error, insertAfter.nextSibling);
        
        // Announce to screen readers
        if (typeof A11y !== 'undefined') {
            A11y.announce(message, 'assertive');
        }
    },
    
    /**
     * Clear error message for a field
     * @param {HTMLElement} field - Input element
     */
    clearFieldError(field) {
        field.classList.remove('field-error');
        
        const error = document.querySelector(`.field-error-message[data-field-id="${field.id}"]`);
        if (error) {
            error.remove();
        }
    },
    
    /**
     * Validate custom URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    validateCustomURL(url) {
        const validation = InputValidator.validateURL(url);
        
        if (!validation.valid) {
            if (typeof showToast === 'function') {
                showToast(validation.error, 'error');
            }
            return false;
        }
        
        return true;
    },
    
    /**
     * Sanitize all form data before submission
     * @param {object} data - Form data object
     * @returns {object} Sanitized data
     */
    sanitizeFormData(data) {
        const sanitized = {};
        
        // Define sanitization rules for each field type
        const shortTextFields = ['projectName', 'teamSize', 'timeframe', 'deadline'];
        const mediumTextFields = ['projectType', 'technology', 'teamExperience', 'stakeholders', 
                                   'technicalConstraints', 'businessConstraints', 'budget', 
                                   'resources', 'successMetrics', 'outputFormat'];
        const longTextFields = ['context', 'currentProblem', 'desiredOutcome', 'mustHave', 'niceToHave'];
        const veryLongTextFields = ['additionalInstructions'];
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            
            if (typeof value !== 'string') {
                sanitized[key] = value;
                return;
            }
            
            let maxLength;
            if (shortTextFields.includes(key)) {
                maxLength = InputValidator.LIMITS.SHORT_TEXT;
            } else if (mediumTextFields.includes(key)) {
                maxLength = InputValidator.LIMITS.MEDIUM_TEXT;
            } else if (longTextFields.includes(key)) {
                maxLength = InputValidator.LIMITS.LONG_TEXT;
            } else if (veryLongTextFields.includes(key)) {
                maxLength = InputValidator.LIMITS.VERY_LONG_TEXT;
            } else {
                maxLength = 10000; // Default
            }
            
            sanitized[key] = InputValidator.sanitizeText(value, {
                maxLength,
                allowNewlines: true,
                trimWhitespace: true,
                removeControlChars: true
            });
        });
        
        return sanitized;
    },
    
    /**
     * Add real-time validation to a field
     * @param {HTMLElement} field - Input element
     * @param {Function} validator - Validation function
     */
    addRealtimeValidation(field, validator) {
        const validate = debounce(() => {
            const result = validator(field.value);
            if (result.valid) {
                this.clearFieldError(field);
            } else if (field.value.length > 0) {
                // Only show error if field has content
                this.showFieldError(field, result.error);
            }
        }, 500);
        
        field.addEventListener('input', validate);
        field.addEventListener('blur', validate);
    }
};

/**
 * Initialize validation on page load
 */
function initializeValidation() {
    // Initialize character counters
    CharacterCounter.initAll();
    
    // Add custom URL validation
    const customUrlInput = document.getElementById('customUrlInput');
    if (customUrlInput) {
        FormValidator.addRealtimeValidation(customUrlInput, (value) => {
            if (!value) return { valid: true };
            return InputValidator.validateURL(value);
        });
    }
    
    console.log('✅ Validation initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeValidation);
} else {
    initializeValidation();
}
