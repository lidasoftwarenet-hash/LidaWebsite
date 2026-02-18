/**
 * ProtoStruct - Core JSON to Protobuf Conversion Engine
 * Handles parsing, type inference, and .proto generation
 * FIXED: Added optional support, input sanitization, improved error handling
 */

class ProtoStruct {
    constructor() {
        this.messageDefinitions = new Map();
        this.usedMessageNames = new Set();
        this.imports = new Set();
        this.warnings = [];
        this.useOptionalFields = false;
        this.stats = {
            messagesGenerated: 0,
            fieldsProcessed: 0,
            wellKnownTypesUsed: 0,
            nestedLevels: 0,
            arraysDetected: 0,
            optionalFieldsDetected: 0
        };
        this.circularRefTracker = new Set();
        
        // Protobuf reserved keywords
        this.reservedKeywords = new Set([
            'message', 'service', 'rpc', 'returns', 'option', 'import', 
            'package', 'enum', 'repeated', 'optional', 'required', 
            'reserved', 'extensions', 'extend', 'oneof', 'map', 
            'public', 'syntax', 'true', 'false', 'to', 'max'
        ]);
    }

    /**
     * Main conversion method with enhanced error handling and sanitization
     */
    convert(jsonString, options = {}) {
        this.reset();
        
        try {
            // Sanitize and validate input
            if (!jsonString || jsonString.trim() === '') {
                throw new Error('Input is empty. Please paste your JSON data.');
            }
            
            // Sanitize input to prevent XSS and injection attacks
            const sanitizedInput = this.sanitizeInput(jsonString);
            
            // Parse JSON with detailed error messages
            const jsonData = this.parseJSON(sanitizedInput);
            
            // Extract and validate options with sanitization
            const packageName = this.sanitizePackageName(options.packageName || 'com.example.api');
            const syntaxVersion = options.syntaxVersion || 'proto3';
            const rootMessageName = this.sanitizeMessageName(options.rootMessageName || this.inferRootMessageName(jsonData));
            const autoImport = options.autoImport !== false;
            const serviceName = this.sanitizeServiceName(options.serviceName || '');
            const useOptional = options.useOptional !== false; // proto3 optional support
            
            // Validate package name format
            if (!/^[a-z][a-z0-9_.]*[a-z0-9]$/.test(packageName)) {
                this.warnings.push('Package name should use lowercase letters, numbers, dots, and underscores only');
            }
            
            // Enable optional fields for proto3
            this.useOptionalFields = useOptional && syntaxVersion === 'proto3';
            
            // Build the root message with optional support
            this.buildMessage(rootMessageName, jsonData, 1);
            
            // Generate the complete .proto file
            const protoContent = this.generateProtoFile({
                syntax: syntaxVersion,
                package: packageName,
                autoImport,
                serviceName
            });
            
            return {
                success: true,
                proto: protoContent,
                warnings: this.warnings,
                stats: this.stats,
                messageCount: this.messageDefinitions.size
            };
            
        } catch (error) {
            // Enhanced error handling with detailed information
            console.error('ProtoStruct conversion error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                warnings: this.warnings,
                stats: this.stats
            };
        }
    }

    /**
     * Sanitize input to prevent XSS and injection attacks
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }
        
        // Remove any potential script tags or dangerous content
        // While JSON.parse will handle most issues, this adds an extra layer
        const dangerous = /<script|javascript:|onerror=|onclick=|onload=/gi;
        if (dangerous.test(input)) {
            throw new Error('Input contains potentially dangerous content');
        }
        
        // Limit input size to prevent DoS (10MB limit)
        if (input.length > 10 * 1024 * 1024) {
            throw new Error('Input is too large (max 10MB)');
        }
        
        return input;
    }

    /**
     * Sanitize package name
     */
    sanitizePackageName(packageName) {
        if (!packageName) return 'com.example.api';
        
        // Remove any dangerous characters and validate format
        const sanitized = packageName
            .replace(/[^a-z0-9._]/gi, '')
            .toLowerCase()
            .substring(0, 200); // Limit length
        
        if (!/^[a-z][a-z0-9_.]*[a-z0-9]$/.test(sanitized)) {
            this.warnings.push(`Invalid package name "${packageName}", using default`);
            return 'com.example.api';
        }
        
        return sanitized;
    }

    /**
     * Sanitize message name
     */
    sanitizeMessageName(name) {
        if (!name) return '';
        
        // Remove dangerous characters and ensure valid format
        const sanitized = name
            .replace(/[^a-zA-Z0-9_]/g, '')
            .substring(0, 100); // Limit length
        
        if (sanitized && !/^[A-Z][A-Za-z0-9]*$/.test(sanitized)) {
            return this.toPascalCase(sanitized);
        }
        
        return sanitized;
    }

    /**
     * Sanitize service name
     */
    sanitizeServiceName(name) {
        if (!name) return '';
        return this.sanitizeMessageName(name);
    }

    /**
     * Reset internal state
     */
    reset() {
        this.messageDefinitions.clear();
        this.usedMessageNames.clear();
        this.imports.clear();
        this.warnings = [];
        this.useOptionalFields = false;
        this.stats = {
            messagesGenerated: 0,
            fieldsProcessed: 0,
            wellKnownTypesUsed: 0,
            nestedLevels: 0,
            arraysDetected: 0,
            optionalFieldsDetected: 0
        };
        this.circularRefTracker.clear();
    }

    /**
     * Parse and validate JSON with detailed error messages
     */
    parseJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            
            // Ensure root is an object
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Root must be an object, not a primitive value');
            }
            
            if (Array.isArray(parsed)) {
                throw new Error('Root cannot be an array. Wrap it in an object like: { "items": [...] }');
            }
            
            // Check for empty object
            if (Object.keys(parsed).length === 0) {
                throw new Error('JSON object is empty. Add some fields to generate a schema.');
            }
            
            return parsed;
            
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Enhanced JSON error messages
                const match = error.message.match(/position (\d+)/);
                if (match) {
                    const pos = parseInt(match[1]);
                    const context = jsonString.substring(Math.max(0, pos - 20), pos + 20);
                    throw new Error(`Invalid JSON at position ${pos}. Near: "${context}..."`);
                }
                throw new Error(`Invalid JSON: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Enhanced root message name inference with smarter heuristics
     */
    inferRootMessageName(jsonData) {
        const keys = Object.keys(jsonData);
        
        // Smart detection based on common API patterns
        const patterns = [
            { keys: ['order', 'orderId', 'orderNumber'], name: 'Order' },
            { keys: ['user', 'userId', 'username'], name: 'User' },
            { keys: ['product', 'productId', 'productName'], name: 'Product' },
            { keys: ['transaction', 'transactionId'], name: 'Transaction' },
            { keys: ['invoice', 'invoiceId', 'invoiceNumber'], name: 'Invoice' },
            { keys: ['customer', 'customerId'], name: 'Customer' },
            { keys: ['event', 'eventId', 'eventType'], name: 'Event' },
            { keys: ['payment', 'paymentId'], name: 'Payment' },
            { keys: ['account', 'accountId'], name: 'Account' },
            { keys: ['session', 'sessionId'], name: 'Session' }
        ];
        
        for (const pattern of patterns) {
            if (pattern.keys.some(k => keys.includes(k))) {
                return pattern.name;
            }
        }
        
        // Fallback: Use first key if it looks like an entity
        if (keys.length > 0) {
            const firstKey = keys[0];
            if (firstKey.endsWith('Id') || firstKey.endsWith('Name')) {
                const entity = firstKey.replace(/Id$|Name$/, '');
                if (entity.length > 0) {
                    return this.toPascalCase(entity);
                }
            }
        }
        
        return 'RootMessage';
    }

    /**
     * Recursive message builder with depth tracking and optional support
     */
    buildMessage(messageName, jsonData, depth = 1) {
        // Track max nesting
        if (depth > this.stats.nestedLevels) {
            this.stats.nestedLevels = depth;
        }
        
        // Circular reference detection
        const refKey = `${messageName}_${depth}`;
        if (this.circularRefTracker.has(refKey)) {
            this.warnings.push(`Circular reference detected for message: ${messageName}`);
            return messageName;
        }
        
        // Prevent excessive nesting
        if (depth > 20) {
            this.warnings.push(`Deep nesting (${depth} levels) detected at message: ${messageName}. Consider flattening your structure.`);
        }
        
        if (depth > 50) {
            this.warnings.push(`Maximum nesting depth (50) exceeded. Using Any type for: ${messageName}`);
            this.imports.add('google/protobuf/any.proto');
            return 'google.protobuf.Any';
        }
        
        this.circularRefTracker.add(refKey);
        
        // Ensure unique message name
        const uniqueName = this.ensureUniqueMessageName(messageName);
        
        // Skip if already defined
        if (this.messageDefinitions.has(uniqueName)) {
            this.circularRefTracker.delete(refKey);
            return uniqueName;
        }
        
        const fields = [];
        let fieldNumber = 1;
        
        for (const [key, value] of Object.entries(jsonData)) {
            const fieldName = this.sanitizeFieldName(key);
            const fieldType = this.inferType(value, this.toPascalCase(fieldName), depth + 1);
            
            // Apply optional modifier if needed (proto3 support)
            let finalType = fieldType.type;
            if (fieldType.isOptional && this.useOptionalFields) {
                finalType = `optional ${fieldType.type}`;
            }
            
            fields.push({
                name: fieldName,
                type: finalType,
                number: fieldNumber++,
                comment: fieldType.comment,
                originalKey: key,
                isOptional: fieldType.isOptional || false
            });
            
            this.stats.fieldsProcessed++;
        }
        
        // Store message definition
        this.messageDefinitions.set(uniqueName, {
            name: uniqueName,
            fields: fields,
            depth: depth
        });
        
        this.stats.messagesGenerated++;
        this.circularRefTracker.delete(refKey);
        
        return uniqueName;
    }

    /**
     * Enhanced type inference with optional field support and Well-Known Types
     */
    inferType(value, contextName, depth) {
        // Handle null - mark field as optional in proto3
        if (value === null) {
            if (this.useOptionalFields) {
                this.stats.optionalFieldsDetected++;
                return {
                    type: 'string', // Default to string for null values
                    comment: '// Nullable field - was null in sample',
                    isOptional: true
                };
            } else {
                this.imports.add('google/protobuf/struct.proto');
                this.stats.wellKnownTypesUsed++;
                return {
                    type: 'google.protobuf.NullValue',
                    comment: '// Null value',
                    isOptional: false
                };
            }
        }
        
        // Handle arrays (repeated keyword)
        if (Array.isArray(value)) {
            this.stats.arraysDetected++;
            return this.inferArrayType(value, contextName, depth);
        }
        
        // Handle objects (nested messages)
        if (typeof value === 'object') {
            const nestedMessageName = contextName || 'NestedMessage';
            this.buildMessage(nestedMessageName, value, depth);
            return { type: nestedMessageName, isOptional: false };
        }
        
        // Handle primitives
        return this.inferPrimitiveType(value, contextName);
    }

    /**
     * Enhanced primitive type inference
     */
    inferPrimitiveType(value, contextName = '') {
        const valueType = typeof value;
        
        switch (valueType) {
            case 'boolean':
                return { type: 'bool', isOptional: false };
                
            case 'number':
                if (Number.isInteger(value)) {
                    // Smart int sizing based on value
                    if (value >= 0 && value <= 4294967295) {
                        if (value <= 2147483647) {
                            return { type: 'int32', isOptional: false };
                        }
                        return { type: 'uint32', comment: '// Unsigned integer', isOptional: false };
                    } else if (value >= -2147483648 && value <= 2147483647) {
                        return { type: 'int32', isOptional: false };
                    } else {
                        return { type: 'int64', comment: '// Large integer', isOptional: false };
                    }
                } else {
                    // Use float for smaller decimals, double for precision
                    if (Math.abs(value) < 3.4e38) {
                        return { type: 'float', comment: '// Decimal number', isOptional: false };
                    }
                    return { type: 'double', comment: '// High-precision decimal', isOptional: false };
                }
                
            case 'string':
                // Enhanced pattern matching for Well-Known Types
                
                // Timestamp patterns
                if (this.isTimestamp(value)) {
                    this.imports.add('google/protobuf/timestamp.proto');
                    this.stats.wellKnownTypesUsed++;
                    return {
                        type: 'google.protobuf.Timestamp',
                        comment: '// ISO 8601 timestamp',
                        isOptional: false
                    };
                }
                
                // Duration patterns
                if (this.isDuration(value)) {
                    this.imports.add('google/protobuf/duration.proto');
                    this.stats.wellKnownTypesUsed++;
                    return {
                        type: 'google.protobuf.Duration',
                        comment: '// Duration (e.g., "300s")',
                        isOptional: false
                    };
                }
                
                // UUID pattern
                if (this.isUUID(value)) {
                    return {
                        type: 'string',
                        comment: '// UUID',
                        isOptional: false
                    };
                }
                
                // URL pattern
                if (this.isURL(value)) {
                    return {
                        type: 'string',
                        comment: '// URL',
                        isOptional: false
                    };
                }
                
                // Email pattern
                if (this.isEmail(value)) {
                    return {
                        type: 'string',
                        comment: '// Email address',
                        isOptional: false
                    };
                }
                
                // Large text (potential bytes)
                if (value.length > 1000) {
                    return {
                        type: 'bytes',
                        comment: '// Large text content',
                        isOptional: false
                    };
                }
                
                return { type: 'string', isOptional: false };
                
            default:
                return { type: 'string', comment: '// Fallback type', isOptional: false };
        }
    }

    /**
     * Enhanced array type inference with better heterogeneous handling (repeated keyword)
     */
    inferArrayType(array, contextName, depth) {
        // Handle empty array
        if (array.length === 0) {
            this.warnings.push(`Empty array for field "${this.toSnakeCase(contextName)}". Defaulted to string.`);
            return {
                type: 'repeated string',
                comment: '// Empty array - verify type',
                isOptional: false
            };
        }
        
        // Sample first few elements for type detection
        const sampleSize = Math.min(array.length, 10);
        const sample = array.slice(0, sampleSize);
        
        // Get types of sampled elements
        const elementTypes = sample.map(item => {
            const inferredType = this.inferType(item, contextName, depth);
            return inferredType.type;
        });
        
        // Check for heterogeneous types
        const uniqueTypes = [...new Set(elementTypes)];
        
        if (uniqueTypes.length > 1) {
            this.warnings.push(
                `Mixed types in array "${this.toSnakeCase(contextName)}": ${uniqueTypes.join(', ')}. Using Any type.`
            );
            this.imports.add('google/protobuf/any.proto');
            this.stats.wellKnownTypesUsed++;
            return {
                type: 'repeated google.protobuf.Any',
                comment: '// Heterogeneous array',
                isOptional: false
            };
        }
        
        // Uniform array - use repeated keyword
        const elementType = uniqueTypes[0];
        
        // Special handling for arrays of objects with same structure
        if (array[0] && typeof array[0] === 'object' && !Array.isArray(array[0])) {
            return {
                type: `repeated ${elementType}`,
                comment: array.length > 1 ? `// Array of ${array.length} items` : '',
                isOptional: false
            };
        }
        
        return { type: `repeated ${elementType}`, isOptional: false };
    }

    /**
     * Enhanced pattern detection methods
     */
    isTimestamp(str) {
        const patterns = [
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?$/, // ISO 8601
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // SQL timestamp
        ];
        return patterns.some(pattern => pattern.test(str));
    }

    isDuration(str) {
        return /^\d+(\.\d+)?s$/.test(str) || /^PT\d+H\d+M\d+S$/.test(str);
    }

    isUUID(str) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    }

    isURL(str) {
        try {
            new URL(str);
            return str.startsWith('http://') || str.startsWith('https://');
        } catch {
            return false;
        }
    }

    isEmail(str) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    }

    /**
     * Ensure unique message name with counter
     */
    ensureUniqueMessageName(name) {
        let uniqueName = name;
        let counter = 1;
        
        while (this.usedMessageNames.has(uniqueName)) {
            uniqueName = `${name}${counter}`;
            counter++;
        }
        
        this.usedMessageNames.add(uniqueName);
        return uniqueName;
    }

    /**
     * Sanitize field name - convert to snake_case and handle reserved keywords
     */
    sanitizeFieldName(name) {
        let sanitized = this.toSnakeCase(name);
        
        // Handle reserved keywords
        if (this.reservedKeywords.has(sanitized)) {
            const original = sanitized;
            sanitized = `${sanitized}_field`;
            this.warnings.push(`Reserved keyword "${original}" renamed to "${sanitized}"`);
        }
        
        // Ensure starts with letter
        if (!/^[a-z]/.test(sanitized)) {
            sanitized = 'field_' + sanitized;
        }
        
        return sanitized;
    }

    /**
     * Convert string to snake_case
     */
    toSnakeCase(str) {
        return str
            .replace(/([A-Z])/g, '_$1')
            .replace(/^_/, '')
            .replace(/\s+/g, '_')
            .replace(/-+/g, '_')
            .toLowerCase()
            .replace(/_+/g, '_')
            .replace(/[^a-z0-9_]/g, '_');
    }

    /**
     * Convert string to PascalCase
     */
    toPascalCase(str) {
        return str
            .replace(/[_-](.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (_, char) => char.toUpperCase())
            .replace(/[_-]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '');
    }

    /**
     * Generate complete .proto file with professional formatting
     */
    generateProtoFile(options) {
        let output = [];
        
        // File header comment
        output.push('// Generated by LiDa ProtoStruct PRO');
        output.push(`// Generated at: ${new Date().toISOString()}`);
        output.push('');
        
        // Syntax declaration
        output.push(`syntax = "${options.syntax}";`);
        output.push('');
        
        // Package declaration
        if (options.package) {
            output.push(`package ${options.package};`);
            output.push('');
        }
        
        // Imports (sorted alphabetically)
        if (options.autoImport && this.imports.size > 0) {
            const sortedImports = Array.from(this.imports).sort();
            sortedImports.forEach(imp => {
                output.push(`import "${imp}";`);
            });
            output.push('');
        }
        
        // Message definitions (sorted by depth for better readability)
        const messageArray = Array.from(this.messageDefinitions.values())
            .sort((a, b) => (a.depth || 0) - (b.depth || 0));
        
        messageArray.forEach((message, index) => {
            output.push(this.generateMessageDefinition(message));
            if (index < messageArray.length - 1) {
                output.push('');
            }
        });
        
        // Add service definition if serviceName is provided
        if (options.serviceName && options.serviceName.trim()) {
            const mainMessage = messageArray[0];
            if (mainMessage) {
                output.push('');
                output.push(this.generateServiceDefinition(options.serviceName.trim(), mainMessage.name));
            }
        }
        
        return output.join('\n');
    }

    /**
     * Generate service definition for main .proto output
     */
    generateServiceDefinition(serviceName, entityName) {
        let output = [];
        
        output.push(`// gRPC Service Definition`);
        output.push(`service ${serviceName} {`);
        output.push(`  // Create a new ${entityName}`);
        output.push(`  rpc Create${entityName}(${entityName}) returns (${entityName});`);
        output.push('');
        output.push(`  // Get ${entityName} by ID`);
        output.push(`  rpc Get${entityName}ById(GetByIdRequest) returns (${entityName});`);
        output.push('');
        output.push(`  // List ${entityName}s`);
        output.push(`  rpc List${entityName}s(ListRequest) returns (List${entityName}sResponse);`);
        output.push('}');
        
        return output.join('\n');
    }

    /**
     * Generate a single message definition with professional formatting
     */
    generateMessageDefinition(message) {
        let output = [];
        
        output.push(`message ${message.name} {`);
        
        message.fields.forEach(field => {
            const indent = '  ';
            const comment = field.comment ? ` ${field.comment}` : '';
            const line = `${indent}${field.type} ${field.name} = ${field.number};${comment}`;
            output.push(line);
        });
        
        output.push('}');
        
        return output.join('\n');
    }

    /**
     * Generate professional analysis insights
     */
    generateAnalysis() {
        const insights = [];
        
        // Overview
        insights.push({
            type: 'success',
            title: '✓ Schema Generated Successfully',
            content: `Created ${this.stats.messagesGenerated} message definition${this.stats.messagesGenerated > 1 ? 's' : ''} with ${this.stats.fieldsProcessed} field${this.stats.fieldsProcessed > 1 ? 's' : ''}`
        });
        
        // Complexity metrics
        if (this.stats.nestedLevels > 1) {
            insights.push({
                type: 'info',
                title: '📊 Nesting Complexity',
                content: `Maximum nesting depth: ${this.stats.nestedLevels} level${this.stats.nestedLevels > 1 ? 's' : ''}`
            });
        }
        
        // Arrays detected
        if (this.stats.arraysDetected > 0) {
            insights.push({
                type: 'info',
                title: '📋 Repeated Fields',
                content: `Detected ${this.stats.arraysDetected} array field${this.stats.arraysDetected > 1 ? 's' : ''} (using "repeated" keyword)`
            });
        }
        
        // Optional fields detected
        if (this.stats.optionalFieldsDetected > 0) {
            insights.push({
                type: 'success',
                title: '❓ Optional Fields',
                content: `Detected ${this.stats.optionalFieldsDetected} optional/nullable field${this.stats.optionalFieldsDetected > 1 ? 's' : ''} (using "optional" keyword in proto3)`
            });
        }
        
        // Well-Known Types
        if (this.stats.wellKnownTypesUsed > 0) {
            insights.push({
                type: 'success',
                title: '⚡ Well-Known Types',
                content: `Auto-detected ${this.stats.wellKnownTypesUsed} Well-Known Type${this.stats.wellKnownTypesUsed > 1 ? 's' : ''} (Timestamp, Duration, etc.)`
            });
        }
        
        // Imports
        if (this.imports.size > 0) {
            insights.push({
                type: 'info',
                title: '📥 Imports Required',
                content: Array.from(this.imports).map(imp => `• ${imp}`).join('\n')
            });
        }
        
        // Warnings
        if (this.warnings.length > 0) {
            insights.push({
                type: 'warning',
                title: `⚠️ ${this.warnings.length} Warning${this.warnings.length > 1 ? 's' : ''}`,
                content: this.warnings.map((w, i) => `${i + 1}. ${w}`).join('\n')
            });
        }
        
        // Best practices tip
        if (this.stats.messagesGenerated > 0) {
            insights.push({
                type: 'info',
                title: '💡 Next Steps',
                content: '1. Review field numbers and types\n2. Test with protoc compiler\n3. Consider adding comments and documentation\n4. Define enum types if needed'
            });
        }
        
        return insights;
    }
}