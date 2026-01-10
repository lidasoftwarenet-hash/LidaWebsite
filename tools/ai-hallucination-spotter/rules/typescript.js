import { javascriptRules } from './javascript.js';

export const typescriptRules = {
    // TypeScript extends all JavaScript rules, plus TS-specific patterns

    // Type Syntax Errors
    typeSyntax: [
        {
            pattern: /:\s*str\b|:\s*int\b|:\s*float\b|:\s*bool\b/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "Python type syntax detected. TypeScript uses `string`, `number`, `boolean`",
            quickFix: "Use: string, number, boolean (lowercase)",
            example: "function greet(name: string): void { }"
        },
        {
            pattern: /:\s*String\b|:\s*Number\b|:\s*Boolean\b(?!\()/,
            category: 'style',
            severity: 'medium',
            confidence: 85,
            message: "Use primitive types `string`, `number`, `boolean` instead of wrapper types",
            quickFix: "Use: string, number, boolean (lowercase)",
            example: "let name: string = 'John';"
        },
        {
            pattern: /:\s*array\b|\[\s*\]/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 70,
            message: "Check array type syntax. Use `Type[]` or `Array < Type > `",
            quickFix: "Use: number[] or Array<number>",
            example: "const items: string[] = [];"
        },
        {
            pattern: /\bAny\b/,
            category: 'style',
            severity: 'low',
            confidence: 80,
            message: "TypeScript `any` type should be lowercase",
            quickFix: "Use: any (lowercase)",
            example: "let value: any = 123;"
        },
        {
            pattern: /function\s+\w+\s*\([^)]*\)\s*:\s*void\s*=>/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 90,
            message: "Arrow functions don't use `function` keyword. Remove 'function'",
            quickFix: "Use: const name = (params): type => { }",
            example: "const greet = (name: string): void => { };"
        },
        {
            pattern: /:\s*any\b.*\s*=>|=>\s*any\b/,
            category: 'style',
            severity: 'medium',
            confidence: 75,
            message: "Avoid using `any` as a return type. It bypasses type safety for callers",
            quickFix: "Use a specific type or `unknown`",
            example: "function getData(): Promise<Data> { }"
        }
    ],

    // Interface & Type Issues
    interfaceIssues: [
        {
            pattern: /interface\s+\w+\s*\{[^}]*\}/,
            multiLine: true,
            check: (code, lineIndex) => {
                const line = code.split('\n')[lineIndex];
                // Check if using = instead of extending
                return /interface\s+\w+\s*=/.test(line);
            },
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Interfaces use `extends `, not ` = `. Use `type` for type aliases",
            quickFix: "Use: interface Name extends Base { } or type Name = { }",
            example: "interface User extends BaseUser { name: string; }"
        },
        {
            pattern: /class\s+\w+\s+implements\s+type\s+/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Classes implement `interface`, not `type`. Define as interface",
            quickFix: "Change type to interface",
            example: "class User implements IUser { }"
        }
    ],

    // Generic Syntax
    genericIssues: [
        {
            pattern: /<\s*T\s*extends\s+\w+\s*>/,
            multiLine: true,
            check: (code, lineIndex) => {
                const line = code.split('\n')[lineIndex];
                // Check for wrong generic syntax like <T: Type>
                return /<[A-Z]\s*:\s*\w+>/.test(line);
            },
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "Generic constraints use `extends `, not `: ` (Python/Java pattern)",
            quickFix: "Use: <T extends Type>",
            example: "function identity<T extends object>(arg: T): T { }"
        },
        {
            pattern: /Array<>/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Generic `Array <> ` requires a type parameter",
            quickFix: "Use: Array<Type> or Type[]",
            example: "const items: Array<string> = [];"
        }
    ],

    // Decorator Issues
    decoratorIssues: [
        {
            pattern: /@\w+\s*\(/,
            multiLine: true,
            check: (code, lineIndex) => {
                const lines = code.split('\n');
                const line = lines[lineIndex];
                // Check if decorator is not on its own line
                return /@\w+/.test(line) && /\w+\s*\(/.test(line) && !line.trim().startsWith('@');
            },
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Decorators should be on their own line above the declaration",
            quickFix: "Move decorator to separate line",
            example: "@Component()\nclass MyClass { }"
        }
    ],

    // Enum Issues
    enumIssues: [
        {
            pattern: /enum\s+\w+\s*\{[^}]*=\s*['"][^'"]*['"]/,
            category: 'style',
            severity: 'low',
            confidence: 75,
            message: "Consider using string literal union types instead of string enums",
            quickFix: "Use: type Status = 'active' | 'inactive';",
            example: "type Status = 'pending' | 'approved' | 'rejected';"
        }
    ],

    // Nullable/Undefined Issues
    nullableIssues: [
        {
            pattern: /:\s*\w+\s*\|\s*null\s*\|\ s*undefined/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Use optional chaining `? ` for potentially undefined values",
            quickFix: "Consider: Type | null or Type | undefined or Type?",
            example: "let value: string | undefined;"
        },
        {
            pattern: /\bNone\b/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "Python's `None` detected. TypeScript uses `null` or `undefined`",
            quickFix: "Replace with: null or undefined",
            example: "let value: string | null = null;"
        }
    ],

    // Type Assertion Errors
    typeAssertions: [
        {
            pattern: /as\s+any\b/,
            category: 'style',
            severity: 'medium',
            confidence: 80,
            message: "Avoid `as any` - defeats TypeScript's type safety",
            quickFix: "Use proper types or `unknown` if absolutely necessary",
            example: "const value = data as MyType;"
        },
        {
            pattern: /<any>/,
            category: 'style',
            severity: 'medium',
            confidence: 85,
            message: "Avoid `< any > ` - defeats TypeScript's type safety",
            quickFix: "Use proper types or `unknown` if absolutely necessary",
            example: "const value = <MyType>data;"
        },
        {
            pattern: /!\s*\.\s*\w+/,
            category: 'style',
            severity: 'medium',
            confidence: 70,
            message: "Non-null assertion `!` bypasses type checking. Use cautiously",
            quickFix: "Prefer type guards or optional chaining",
            example: "if (value) { value.property }"
        }
    ],

    // Utility Type Hallucinations
    utilityTypes: [
        {
            pattern: /Readonly<\s*\[/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 75,
            message: "For readonly arrays, use `readonly Type[]` or `ReadonlyArray < Type > `",
            quickFix: "Use: readonly string[] or ReadonlyArray<string>",
            example: "const items: readonly string[] = ['a', 'b'];"
        },
        {
            pattern: /Optional</,
            category: 'syntax_error',
            severity: 'high',
            confidence: 90,
            message: "No `Optional < T > ` in TypeScript. Use `T | undefined` or `T ? `",
            quickFix: "Use: Type | undefined or optional property: field?: Type",
            example: "interface User { name?: string }"
        },
        {
            pattern: /Nullable</,
            category: 'syntax_error',
            severity: 'high',
            confidence: 90,
            message: "No `Nullable < T > ` utility. Use `T | null`",
            quickFix: "Use: Type | null",
            example: "let value: string | null = null;"
        }
    ],

    // Type Guard Issues
    typeGuards: [
        {
            pattern: /typeof\s+\w+\s*===\s*['"]object['"]/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 75,
            message: "`typeof null === 'object'` is true. Check for null separately",
            quickFix: "Use: typeof x === 'object' && x !== null",
            example: "if (typeof value === 'object' && value !== null) { }"
        },
        {
            pattern: /instanceof\s+Object\b/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Almost everything is `instanceof Object`. Be more specific",
            quickFix: "Use: instanceof SpecificClass or typeof",
            example: "if (value instanceof MyClass) { }"
        }
    ],

    // Advanced Type Patterns
    advancedTypes: [
        {
            pattern: /:\s*\(\s*\)\s*=>/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 75,
            message: "Function type syntax: use `() => ReturnType` not just `() => `",
            quickFix: "Add return type: () => void or () => Type",
            example: "const callback: () => void = () => { };"
        },
        {
            pattern: /type\s+\w+\s*=\s*\{[^}]*\}\s*\|\s*\{/,
            category: 'style',
            severity: 'low',
            confidence: 65,
            message: "Consider using discriminated unions for complex type unions",
            quickFix: "Add discriminant property: { kind: 'A', ... } | { kind: 'B', ... }",
            example: "type Shape = { kind: 'circle', radius: number } | { kind: 'square', size: number }"
        }
    ],

    // Module/Import Patterns
    moduleIssues: [
        {
            pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"]\.\.?\/.+\.ts['"]/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Don't include `.ts` extension in imports",
            quickFix: "Remove .ts extension from import path",
            example: "import * as utils from './utils';"
        },
        {
            pattern: /export\s+default\s+function\s*\(/,
            category: 'style',
            severity: 'low',
            confidence: 60,
            message: "Named exports are more refactor-friendly than default exports",
            quickFix: "Consider: export function name() { }",
            example: "export function greet() { }"
        }
    ],

    // All JavaScript rules also apply to TypeScript
    ...javascriptRules
};
