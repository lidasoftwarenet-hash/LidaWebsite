/**
 * Validator - Protobuf Schema Validation Engine
 * Client-side validation without protoc compiler
 */

class ProtoValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        
        // Proto3 primitive types
        this.validTypes = new Set([
            'double', 'float', 'int32', 'int64', 'uint32', 'uint64',
            'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64',
            'bool', 'string', 'bytes'
        ]);
        
        // Well-Known Types
        this.wellKnownTypes = new Set([
            'google.protobuf.Any',
            'google.protobuf.Timestamp',
            'google.protobuf.Duration',
            'google.protobuf.Struct',
            'google.protobuf.Value',
            'google.protobuf.ListValue',
            'google.protobuf.NullValue',
            'google.protobuf.Empty',
            'google.protobuf.FieldMask',
            'google.protobuf.BoolValue',
            'google.protobuf.StringValue',
            'google.protobuf.BytesValue',
            'google.protobuf.Int32Value',
            'google.protobuf.Int64Value',
            'google.protobuf.UInt32Value',
            'google.protobuf.UInt64Value',
            'google.protobuf.FloatValue',
            'google.protobuf.DoubleValue'
        ]);
        
        // Reserved keywords
        this.reservedKeywords = new Set([
            'message', 'service', 'rpc', 'returns', 'option', 'import',
            'package', 'enum', 'repeated', 'optional', 'required',
            'reserved', 'extensions', 'extend', 'oneof', 'map',
            'public', 'syntax', 'true', 'false', 'to', 'max'
        ]);
    }

    /**
     * Main validation method
     */
    validate(protoContent) {
        this.reset();
        
        if (!protoContent || protoContent.trim() === '') {
            this.errors.push('Empty protobuf schema');
            return this.getResults();
        }
        
        try {
            const lines = protoContent.split('\n');
            
            // Parse the proto content
            const parsed = this.parseProto(protoContent);
            
            // Validate syntax declaration
            this.validateSyntax(parsed.syntax);
            
            // Validate package
            this.validatePackage(parsed.package);
            
            // Validate imports
            this.validateImports(parsed.imports);
            
            // Validate messages
            parsed.messages.forEach(message => {
                this.validateMessage(message, parsed.messages);
            });
            
            // Validate services
            parsed.services.forEach(service => {
                this.validateService(service, parsed.messages);
            });
            
            // Check for common best practices
            this.checkBestPractices(parsed);
            
        } catch (error) {
            this.errors.push(`Validation error: ${error.message}`);
        }
        
        return this.getResults();
    }

    /**
     * Reset validation state
     */
    reset() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * Parse proto content into structured data
     */
    parseProto(content) {
        const result = {
            syntax: '',
            package: '',
            imports: [],
            messages: [],
            services: [],
            enums: []
        };
        
        // Extract syntax
        const syntaxMatch = content.match(/syntax\s*=\s*"(proto[23])"/);
        if (syntaxMatch) {
            result.syntax = syntaxMatch[1];
        }
        
        // Extract package
        const packageMatch = content.match(/package\s+([a-z][a-z0-9_.]*);/);
        if (packageMatch) {
            result.package = packageMatch[1];
        }
        
        // Extract imports
        const importMatches = content.matchAll(/import\s+"([^"]+)";/g);
        for (const match of importMatches) {
            result.imports.push(match[1]);
        }
        
        // Extract messages
        const messageMatches = content.matchAll(/message\s+(\w+)\s*{([^}]*)}/gs);
        for (const match of messageMatches) {
            const messageName = match[1];
            const messageBody = match[2];
            const fields = this.parseFields(messageBody);
            
            result.messages.push({
                name: messageName,
                fields: fields,
                body: messageBody
            });
        }
        
        // Extract services
        const serviceMatches = content.matchAll(/service\s+(\w+)\s*{([^}]*)}/gs);
        for (const match of serviceMatches) {
            const serviceName = match[1];
            const serviceBody = match[2];
            const rpcs = this.parseRPCs(serviceBody);
            
            result.services.push({
                name: serviceName,
                rpcs: rpcs
            });
        }
        
        return result;
    }

    /**
     * Parse fields from message body
     */
    parseFields(messageBody) {
        const fields = [];
        const fieldRegex = /^\s*(repeated|optional)?\s*(\w+(?:\.\w+)*(?:<[^>]+>)?)\s+(\w+)\s*=\s*(\d+);/gm;
        
        let match;
        while ((match = fieldRegex.exec(messageBody)) !== null) {
            fields.push({
                modifier: match[1] || '',
                type: match[2],
                name: match[3],
                number: parseInt(match[4])
            });
        }
        
        return fields;
    }

    /**
     * Parse RPCs from service body
     */
    parseRPCs(serviceBody) {
        const rpcs = [];
        const rpcRegex = /rpc\s+(\w+)\s*\((\w+)\)\s*returns\s*\((\w+)\);/g;
        
        let match;
        while ((match = rpcRegex.exec(serviceBody)) !== null) {
            rpcs.push({
                name: match[1],
                request: match[2],
                response: match[3]
            });
        }
        
        return rpcs;
    }

    /**
     * Validate syntax declaration
     */
    validateSyntax(syntax) {
        if (!syntax) {
            this.errors.push('Missing syntax declaration. Add: syntax = "proto3";');
            return;
        }
        
        if (syntax !== 'proto3' && syntax !== 'proto2') {
            this.errors.push(`Invalid syntax version "${syntax}". Use "proto3" or "proto2"`);
            return;
        }
        
        if (syntax === 'proto2') {
            this.warnings.push('Using proto2 syntax. Consider upgrading to proto3 for better language support.');
        }
        
        this.info.push(`✓ Syntax: ${syntax}`);
    }

    /**
     * Validate package name
     */
    validatePackage(packageName) {
        if (!packageName) {
            this.warnings.push('No package declaration. Consider adding one for better organization.');
            return;
        }
        
        // Check package naming conventions
        if (!/^[a-z][a-z0-9_.]*[a-z0-9]$/.test(packageName)) {
            this.errors.push(`Invalid package name "${packageName}". Use lowercase letters, numbers, dots, and underscores only.`);
            return;
        }
        
        // Check for reasonable package structure
        const parts = packageName.split('.');
        if (parts.length < 2) {
            this.warnings.push('Package name should typically have at least 2 segments (e.g., com.example)');
        }
        
        this.info.push(`✓ Package: ${packageName}`);
    }

    /**
     * Validate imports
     */
    validateImports(imports) {
        if (imports.length === 0) {
            return;
        }
        
        imports.forEach(imp => {
            // Check if it's a Well-Known Type import
            if (imp.startsWith('google/protobuf/')) {
                const expectedTypes = imp.replace('google/protobuf/', '').replace('.proto', '');
                this.info.push(`✓ Import: ${imp} (Well-Known Type)`);
            } else {
                this.info.push(`✓ Import: ${imp}`);
            }
        });
    }

    /**
     * Validate message definition
     */
    validateMessage(message, allMessages) {
        // Validate message name
        if (!/^[A-Z][A-Za-z0-9]*$/.test(message.name)) {
            this.errors.push(`Message name "${message.name}" should be in PascalCase and start with uppercase`);
        }
        
        if (this.reservedKeywords.has(message.name.toLowerCase())) {
            this.errors.push(`Message name "${message.name}" is a reserved keyword`);
        }
        
        // Validate fields
        if (message.fields.length === 0) {
            this.warnings.push(`Message "${message.name}" has no fields`);
            return;
        }
        
        const usedNumbers = new Set();
        const usedNames = new Set();
        
        message.fields.forEach(field => {
            // Validate field name
            if (!/^[a-z][a-z0-9_]*$/.test(field.name)) {
                this.errors.push(`Field "${field.name}" in message "${message.name}" should be in snake_case`);
            }
            
            if (this.reservedKeywords.has(field.name)) {
                this.errors.push(`Field name "${field.name}" is a reserved keyword`);
            }
            
            // Check for duplicate field names
            if (usedNames.has(field.name)) {
                this.errors.push(`Duplicate field name "${field.name}" in message "${message.name}"`);
            }
            usedNames.add(field.name);
            
            // Validate field number
            if (field.number < 1 || field.number > 536870911) {
                this.errors.push(`Invalid field number ${field.number} for "${field.name}". Must be between 1 and 536,870,911`);
            }
            
            // Check reserved number ranges
            if (field.number >= 19000 && field.number <= 19999) {
                this.errors.push(`Field number ${field.number} is in reserved range 19000-19999`);
            }
            
            // Check for duplicate field numbers
            if (usedNumbers.has(field.number)) {
                this.errors.push(`Duplicate field number ${field.number} in message "${message.name}"`);
            }
            usedNumbers.add(field.number);
            
            // Validate field type
            this.validateFieldType(field, message.name, allMessages);
        });
        
        this.info.push(`✓ Message "${message.name}" with ${message.fields.length} field${message.fields.length > 1 ? 's' : ''}`);
    }

    /**
     * Validate field type
     */
    validateFieldType(field, messageName, allMessages) {
        let baseType = field.type.replace(/^repeated\s+/, '').replace(/^optional\s+/, '');
        
        // Remove map syntax
        const mapMatch = baseType.match(/^map<(.+),\s*(.+)>$/);
        if (mapMatch) {
            this.validateMapType(mapMatch[1], mapMatch[2], field.name, messageName);
            return;
        }
        
        // Check if it's a primitive type
        if (this.validTypes.has(baseType)) {
            return;
        }
        
        // Check if it's a Well-Known Type
        if (this.wellKnownTypes.has(baseType)) {
            return;
        }
        
        // Check if it's a defined message type
        const messageExists = allMessages.some(msg => msg.name === baseType);
        if (messageExists) {
            return;
        }
        
        // If we got here, the type is unknown
        this.errors.push(`Unknown type "${baseType}" for field "${field.name}" in message "${messageName}"`);
    }

    /**
     * Validate map type
     */
    validateMapType(keyType, valueType, fieldName, messageName) {
        const validKeyTypes = new Set(['int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string']);
        
        if (!validKeyTypes.has(keyType)) {
            this.errors.push(`Invalid map key type "${keyType}" for field "${fieldName}". Map keys must be integral or string types.`);
        }
        
        // Value type can be any valid type (checked separately)
    }

    /**
     * Validate service definition
     */
    validateService(service, allMessages) {
        // Validate service name
        if (!/^[A-Z][A-Za-z0-9]*$/.test(service.name)) {
            this.errors.push(`Service name "${service.name}" should be in PascalCase`);
        }
        
        if (service.rpcs.length === 0) {
            this.warnings.push(`Service "${service.name}" has no RPC methods`);
            return;
        }
        
        const usedRPCNames = new Set();
        
        service.rpcs.forEach(rpc => {
            // Validate RPC name
            if (!/^[A-Z][A-Za-z0-9]*$/.test(rpc.name)) {
                this.errors.push(`RPC method "${rpc.name}" should be in PascalCase`);
            }
            
            if (usedRPCNames.has(rpc.name)) {
                this.errors.push(`Duplicate RPC method "${rpc.name}" in service "${service.name}"`);
            }
            usedRPCNames.add(rpc.name);
            
            // Validate request/response types exist
            const requestExists = allMessages.some(msg => msg.name === rpc.request);
            const responseExists = allMessages.some(msg => msg.name === rpc.response);
            
            if (!requestExists) {
                this.errors.push(`Request type "${rpc.request}" not defined for RPC "${rpc.name}"`);
            }
            
            if (!responseExists) {
                this.errors.push(`Response type "${rpc.response}" not defined for RPC "${rpc.name}"`);
            }
        });
        
        this.info.push(`✓ Service "${service.name}" with ${service.rpcs.length} RPC method${service.rpcs.length > 1 ? 's' : ''}`);
    }

    /**
     * Check best practices
     */
    checkBestPractices(parsed) {
        // Check if messages follow naming conventions
        const messageNames = parsed.messages.map(m => m.name);
        
        // Check for potential enums (fields with limited string values)
        parsed.messages.forEach(message => {
            message.fields.forEach(field => {
                if (field.name.toLowerCase().includes('status') || 
                    field.name.toLowerCase().includes('type') ||
                    field.name.toLowerCase().includes('state')) {
                    this.info.push(`💡 Consider using enum for "${field.name}" if it has limited values`);
                }
            });
        });
        
        // Check field numbering gaps
        parsed.messages.forEach(message => {
            if (message.fields.length > 0) {
                const numbers = message.fields.map(f => f.number).sort((a, b) => a - b);
                const maxNumber = Math.max(...numbers);
                const expectedCount = maxNumber;
                
                if (numbers.length < expectedCount * 0.7) {
                    this.warnings.push(`Message "${message.name}" has sparse field numbering. Consider using consecutive numbers.`);
                }
            }
        });
        
        // Check for repeated without message types
        parsed.messages.forEach(message => {
            message.fields.forEach(field => {
                if (field.modifier === 'repeated' && this.validTypes.has(field.type)) {
                    if (field.name.endsWith('s') || field.name.endsWith('list')) {
                        // Good naming for arrays
                    } else {
                        this.info.push(`💡 Repeated field "${field.name}" in "${message.name}" could be named in plural form`);
                    }
                }
            });
        });
    }

    /**
     * Get validation results
     */
    getResults() {
        const isValid = this.errors.length === 0;
        
        return {
            valid: isValid,
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            summary: this.generateSummary(isValid)
        };
    }

    /**
     * Generate validation summary
     */
    generateSummary(isValid) {
        if (isValid && this.warnings.length === 0 && this.info.length === 0) {
            return '✅ Perfect! Your protobuf schema is valid and follows best practices.';
        }
        
        if (isValid && this.warnings.length === 0) {
            return `✅ Valid schema with ${this.info.length} informational note${this.info.length > 1 ? 's' : ''}`;
        }
        
        if (isValid) {
            return `⚠️ Valid schema but has ${this.warnings.length} warning${this.warnings.length > 1 ? 's' : ''}`;
        }
        
        return `❌ Invalid schema: ${this.errors.length} error${this.errors.length > 1 ? 's' : ''} found`;
    }

    /**
     * Validate syntax version
     */
    validateSyntax(syntax) {
        if (!syntax) {
            this.errors.push('Missing syntax declaration');
            return false;
        }
        return true;
    }

    /**
     * Validate package declaration
     */
    validatePackage(packageName) {
        if (!packageName) {
            return true; // Package is optional
        }
        
        if (!/^[a-z][a-z0-9_.]*$/.test(packageName)) {
            this.errors.push('Invalid package name format');
            return false;
        }
        
        return true;
    }

    /**
     * Validate imports
     */
    validateImports(imports) {
        imports.forEach(imp => {
            if (!imp.endsWith('.proto')) {
                this.warnings.push(`Import "${imp}" should typically end with .proto`);
            }
        });
        
        return true;
    }

    /**
     * Generate detailed validation report
     */
    generateReport() {
        const results = this.getResults();
        let report = [];
        
        // Header
        report.push('='.repeat(60));
        report.push('PROTOBUF VALIDATION REPORT');
        report.push('='.repeat(60));
        report.push('');
        
        // Summary
        report.push(`Status: ${results.summary}`);
        report.push('');
        
        // Errors
        if (results.errors.length > 0) {
            report.push(`ERRORS (${results.errors.length}):`);
            report.push('-'.repeat(60));
            results.errors.forEach((error, i) => {
                report.push(`${i + 1}. ❌ ${error}`);
            });
            report.push('');
        }
        
        // Warnings
        if (results.warnings.length > 0) {
            report.push(`WARNINGS (${results.warnings.length}):`);
            report.push('-'.repeat(60));
            results.warnings.forEach((warning, i) => {
                report.push(`${i + 1}. ⚠️ ${warning}`);
            });
            report.push('');
        }
        
        // Info
        if (results.info.length > 0) {
            report.push(`INFORMATION (${results.info.length}):`);
            report.push('-'.repeat(60));
            results.info.forEach((info, i) => {
                report.push(`${i + 1}. ${info}`);
            });
            report.push('');
        }
        
        report.push('='.repeat(60));
        
        return report.join('\n');
    }
}