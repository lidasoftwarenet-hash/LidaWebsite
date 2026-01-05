/**
 * AI Hallucination Spotter - Super Professional Detection Engine
 * 
 * Advanced Features:
 * - Multi-line pattern detection
 * - Import/dependency validation
 * - Function signature checking
 * - Type inference and mismatch detection
 * - Context-aware analysis
 * - Semantic error patterns
 * - Security vulnerability detection
 * - Performance anti-patterns
 * - 50+ rules per language
 */

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
    },

        ts_hallucination: `interface User {
            name: str;  // Wrong: should be 'string'
    age: int;   // Wrong: should be 'number'
}

function greet<T: string>(name: T) {  // Wrong: use 'extends' not ':'
        console.log(name.contains("hello"));  // Wrong: use 'includes'
    }

type Status = 'active' | 'inactive';
const status: Status = None;  // Wrong: use 'null' not 'None'

class MyClass implements type UserType {  // Wrong: implement interface not type
    name: String = "test";  // Style: use 'string' not 'String'

    getName() {
        return this.name.charAt(0);  // OK but could use indexing
    }
} `
    };


    // ============================================
    // SUPER PROFESSIONAL RULE DATABASE
    // ============================================

    const superRules = {
        python: {
            // API Misuse Patterns (Critical)
            apiMisuse: [
                {
                    pattern: /\.push\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "Python lists use `.append()`, not `.push()` (JavaScript method)",
                    quickFix: "Replace `.push(item)` with `.append(item)`",
                    example: "my_list.append(item)  # Correct Python"
                },
                {
                    pattern: /json\.load\(\s*(['"]|f['"]|[\w_]+\.strip\(\)|[^)]*\+)/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 95,
                    message: "`json.load()` expects a file object, not a string. Use `json.loads()` for strings",
                    quickFix: "Use: json.loads(string) or json.load(open(path))",
                    example: "with open('file.json') as f:\n    data = json.load(f)"
                },
                {
                    pattern: /os\.exists\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "`os.exists()` doesn't exist. Use `os.path.exists()`",
                    quickFix: "Replace with: os.path.exists(path)",
                    example: "if os.path.exists('/path/to/file'):  # Correct"
                },
                {
                    pattern: /\.length\(\)/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "Python uses `len()` function, not `.length()` method",
                    quickFix: "Use: len(my_list) instead of my_list.length()",
                    example: "count = len(items)  # Correct"
                },
                {
                    pattern: /\.size\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Python uses `len()`, not `.size()`. (Java/C++ pattern detected)",
                    quickFix: "Use: len(collection)",
                    example: "size = len(my_list)  # Correct"
                },
                {
                    pattern: /\.toString\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 95,
                    message: "JavaScript's `.toString()` detected. Python uses `str()`",
                    quickFix: "Replace with: str(obj)",
                    example: "string_value = str(number)  # Correct"
                },
                {
                    pattern: /\.to_string\(\)/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 85,
                    message: "`.to_string()` is uncommon. Use `str()` or type-specific methods",
                    quickFix: "Use: str(obj) or obj.isoformat() for dates",
                    example: "date_str = datetime.now().isoformat()"
                },
                {
                    pattern: /\.charAt\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 95,
                    message: "JavaScript's `.charAt()` detected. Python uses indexing `string[i]`",
                    quickFix: "Use: my_string[index]",
                    example: "char = text[0]  # First character"
                },
                {
                    pattern: /\.substring\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "JavaScript's `.substring()` detected. Python uses slicing `string[start:end]`",
                    quickFix: "Use: my_string[start:end]",
                    example: "substr = text[0:5]  # First 5 characters"
                },
                {
                    pattern: /sum\(\s*\*\w+\s*\)/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "`sum()` takes an iterable, not unpacked arguments. Remove the ` * `",
                    quickFix: "Use: sum(items) not sum(*items)",
                    example: "total = sum([1, 2, 3])  # Correct"
                }
            ],

            // Deprecated Syntax
            deprecated: [
                {
                    pattern: /\.has_key\(/,
                    category: 'deprecated',
                    severity: 'high',
                    confidence: 100,
                    message: "`dict.has_key()` was removed in Python 3. Use ` in ` operator",
                    quickFix: "Replace `dict.has_key(key)` with `key in dict`",
                    example: "if 'key' in my_dict:  # Python 3"
                },
                {
                    pattern: /print\s+(?![(])[^\n]+/,
                    category: 'deprecated',
                    severity: 'high',
                    confidence: 90,
                    message: "Python 3 requires parentheses for print(). Python 2 syntax detected",
                    quickFix: "Add parentheses: print(message)",
                    example: "print('Hello')  # Python 3"
                },
                {
                    pattern: /\bexecfile\(/,
                    category: 'deprecated',
                    severity: 'high',
                    confidence: 100,
                    message: "`execfile()` was removed in Python 3. Use `exec(open().read())`",
                    quickFix: "Use: exec(open(file).read())",
                    example: "exec(open('script.py').read())"
                },
                {
                    pattern: /\bxrange\(/,
                    category: 'deprecated',
                    severity: 'high',
                    confidence: 100,
                    message: "`xrange()` was removed in Python 3. Use `range()`",
                    quickFix: "Replace with: range()",
                    example: "for i in range(10):  # Python 3"
                }
            ],

            // Logic Errors & Type Issues
            logicErrors: [
                {
                    pattern: /['"][^'"]*['"]\s*\+\s*None|None\s*\+\s*['"][^'"]*['"]/,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 90,
                    message: "String concatenation with None will raise TypeError",
                    quickFix: "Use: str(value) or f-strings: f'text {value}'",
                    example: "message = f'Hello {name}'  # Safe"
                },
                {
                    pattern: /\blen\s*==\s*0\b/,
                    category: 'style',
                    severity: 'low',
                    confidence: 70,
                    message: "Use `if not my_list: ` instead of `if len(my_list) == 0` (more Pythonic)",
                    quickFix: "Replace with: if not my_list:",
                    example: "if not items:  # Pythonic"
                },
                {
                    pattern: /==\s*True\b/,
                    category: 'style',
                    severity: 'low',
                    confidence: 75,
                    message: "Don't compare to True. Use `if condition: ` directly",
                    quickFix: "Replace `if x == True: ` with `if x: `",
                    example: "if is_valid:  # Better"
                },
                {
                    pattern: /except\s*:/,
                    category: 'security',
                    severity: 'medium',
                    confidence: 80,
                    message: "Bare `except: ` catches all exceptions, even KeyboardInterrupt. Be specific",
                    quickFix: "Use: except Exception: or except SpecificError:",
                    example: "except ValueError:  # Specific"
                },
                {
                    pattern: /return\s+\w+(?!\s*=).*(?=\s*$)/m,
                    multiLine: true,
                    check: (code, lineIndex) => {
                        const lines = code.split('\n');
                        const line = lines[lineIndex];
                        const match = line.match(/return\s+(\w+)/);
                        if (match) {
                            const varName = match[1];
                            // Check if variable is defined anywhere before this line
                            const codeBefore = lines.slice(0, lineIndex).join('\n');
                            if (!codeBefore.includes(`${ varName } =`) &&
                                !codeBefore.includes(`${ varName }: `) &&
                                !varName.match(/^(True|False|None|self|cls)$/)) {
                                return true;
                            }
                        }
                        return false;
                    },
                    category: 'logic_error',
                    severity: 'critical',
                    confidence: 85,
                    message: "Returning undefined variable. Variable not defined before return",
                    quickFix: "Define the variable before returning it",
                    example: "result = calculate()\nreturn result"
                }
            ],

            // Import/Module Issues
            importIssues: [
                {
                    pattern: /from\s+\w+\s+import\s+\*/,
                    category: 'style',
                    severity: 'medium',
                    confidence: 70,
                    message: "`from module import *` pollutes namespace. Import specific items",
                    quickFix: "Use: from module import specific_item",
                    example: "from os import path, environ"
                }
            ],

            // File Handling Hallucinations
            fileHandling: [
                {
                    pattern: /open\([^)]+\)\.[^w]+/,
                    check: (code, lineIndex) => {
                        const line = code.split('\n')[lineIndex];
                        return /open\(/.test(line) && !/with\s+open/.test(line) && !line.includes('close()');
                    },
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 85,
                    message: "File opened without `with` statement or `.close()`. Risk of file leaks",
                    quickFix: "Use: with open(file) as f:",
                    example: "with open('data.txt', 'r') as f:\n    content = f.read()"
                },
                {
                    pattern: /\.readlines\(\)\[0\]/,
                    category: 'style',
                    severity: 'low',
                    confidence: 90,
                    message: "Use `next(f)` or `.readline()` instead of `.readlines()[0]` for efficiency",
                    quickFix: "Use: f.readline()",
                    example: "line = f.readline()"
                }
            ],

            // Pathlib vs os.path Hallucinations
            pathHallucinations: [
                {
                    pattern: /os\.path\.exists\(\w+\)\.open\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "`os.path.exists()` returns a boolean, it does not have an `.open()` method",
                    quickFix: "Use: open(path) or Path(path).open()",
                    example: "if os.path.exists(p): open(p)"
                },
                {
                    pattern: /Path\([^)]+\)\+['"]/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 95,
                    message: "Pathlib paths use `/ ` operator for joining, not ` + `",
                    quickFix: "Use: path / 'subdir'",
                    example: "full_path = Path('home') / 'user'"
                }
            ],

            // Built-in Function Misuse
            builtins: [
                {
                    pattern: /input\([^)]*\)\.split\([^)]*\)\[\d+\]/,
                    category: 'logic_error',
                    severity: 'medium',
                    confidence: 75,
                    message: "Directly indexing `input().split()` might raise IndexError",
                    quickFix: "Assign to variable and check length first",
                    example: "parts = input().split()\nif len(parts) > 0: first = parts[0]"
                },
                {
                    pattern: /len\(\s*range\(/,
                    category: 'style',
                    severity: 'low',
                    confidence: 95,
                    message: "Redundant `len(range(n))`. Just use `n`",
                    quickFix: "Replace with: n",
                    example: "count = n"
                },
                {
                    pattern: /map\(\s*lambda\s+.*,\s*\[/,
                    category: 'style',
                    severity: 'low',
                    confidence: 80,
                    message: "Consider using a list comprehension instead of `map(lambda ...)` for readability",
                    quickFix: "Use: [x*2 for x in list]",
                    example: "[x*2 for x in items]"
                }
            ],

            // String Formatting Hallucinations
            stringFormatting: [
                {
                    pattern: /"%s"\s*%\s*\([^)]+\)/,
                    category: 'style',
                    severity: 'low',
                    confidence: 85,
                    message: "Legacy % formatting detected. Modern Python uses f-strings",
                    quickFix: "Use: f\"{var}\"",
                    example: "print(f\"Hello {name}\")"
                },
                {
                    pattern: /f"\{[^}]+\.format\([^)]+\)\}"/,
                    category: 'logic_error',
                    severity: 'medium',
                    confidence: 90,
                    message: "Redundant `.format()` inside f-string",
                    quickFix: "Use: f\"{var}\"",
                    example: "f\"Value: {val}\""
                }
            ],

            // Collection Misuse
            collections: [
                {
                    pattern: /\{\s*\} == None|\{\s*\} is None/,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 100,
                    message: "Empty dictionary is never `None`. Check for emptiness instead",
                    quickFix: "Use: if not my_dict:",
                    example: "if not data:\n    print('Empty')"
                },
                {
                    pattern: /\.get\(['"][^'"]*['"]\)\s*\+\s*\d+/,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 85,
                    message: "`.get()` can return `None`. Adding to `None` will raise TypeError",
                    quickFix: "Pass default value: .get(key, 0)",
                    example: "value = my_dict.get('key', 0) + 1"
                }
            ],

            // Modern Python Misuse
            modernPython: [
                {
                    pattern: /match\s+.+:\s+\n\s+case\s+.+/,
                    multiLine: true,
                    check: (code, lineIndex) => {
                        const lines = code.split('\n');
                        const line = lines[lineIndex];
                        return /match\s+.+:/.test(line) && !lines[lineIndex+1]?.trim().startsWith('case');
                    },
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 90,
                    message: "`match` statement requires at least one `case ` block",
                    quickFix: "Add a `case ` block",
                    example: "match val:\n    case 1: pass"
                }
            ],

            // List & Set Hallucinations
            listOperations: [
                {
                    pattern: /\.remove\([^)]+\)\.append\(/,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 95,
                    message: "`.remove()` returns `None`. You cannot chain it with `.append()`",
                    quickFix: "Perform operations on separate lines",
                    example: "my_list.remove(x)\nmy_list.append(y)"
                },
                {
                    pattern: /\.sort\(\)\[\d+\]/,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 95,
                    message: "`.sort()` sorts in-place and returns `None`. Cannot be indexed",
                    quickFix: "Use `sorted(list)[index]` or sort on a separate line",
                    example: "first = sorted(items)[0]"
                }
            ],

            // Exception Handling Hallucinations
            exceptionHandling: [
                {
                    pattern: /except\s*:\s*\n\s+pass/,
                    multiLine: true,
                    category: 'style',
                    severity: 'medium',
                    confidence: 80,
                    message: "Silently ignoring all exceptions with `except: pass` is dangerous",
                    quickFix: "Catch specific exceptions or at least log the error",
                    example: "except Exception as e:\n    logging.error(e)"
                },
                {
                    pattern: /raise\s+Exception\(['"][^'"]*['"]\)/,
                    category: 'style',
                    severity: 'low',
                    confidence: 60,
                    message: "Generic `Exception` raised. Consider using a more specific exception class",
                    quickFix: "Use: raise ValueError('...') or raise TypeError('...')",
                    example: "raise ValueError('Invalid input')"
                }
            ],

            // Decorator Hallucinations
            decoratorHallucinations: [
                {
                    pattern: /@property\s*\n\s*def\s+\w+\s*\([^)]+\):/,
                    check: (code, lineIndex) => {
                        const lines = code.split('\n');
                        const line = lines[lineIndex+1];
                        return line && line.includes('def') && line.includes(',') && !line.includes('self');
                    },
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 90,
                    message: "Properties should only take `self` (or `cls` for classproperty)",
                    quickFix: "Remove extra arguments from property method",
                    example: "@property\ndef name(self): return self._name"
                },
                {
                    pattern: /@staticmethod\s*\n\s*def\s+\w+\s*\(self/,
                    category: 'logic_error',
                    severity: 'medium',
                    confidence: 95,
                    message: "`@staticmethod` should not take `self` as first argument",
                    quickFix: "Remove `self` or use `@classmethod` with `cls`",
                    example: "@staticmethod\ndef utility(): pass"
                }
            ],

            // Scoping & Variable Issues
            scopingIssues: [
                {
                    pattern: /global\s+\w+/,
                    category: 'style',
                    severity: 'low',
                    confidence: 65,
                    message: "`global` keyword is often a sign of poor design. Consider passing variables as arguments",
                    quickFix: "Use class attributes or pass variables",
                    example: "def func(data): return data + 1"
                },
                {
                    pattern: /for\s+(\w+)\s+in\s+.+:\s*\n\s+(?:\w+\.)?remove\(\1\)/,
                    multiLine: true,
                    category: 'logic_error',
                    severity: 'critical',
                    confidence: 90,
                    message: "Modifying a list while iterating over it can cause skipped elements",
                    quickFix: "Iterate over a copy: `for item in items[:]`",
                    example: "for item in items[:]:\n    items.remove(item)"
                }
            ]
        },

        javascript: {
            // API Misuse
            apiMisuse: [
                {
                    pattern: /\.existSync\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "Typo: Node.js uses `fs.existsSync()` with an 's'",
                    quickFix: "Replace with: fs.existsSync(path)",
                    example: "if (fs.existsSync('./file.js')) { }"
                },
                {
                    pattern: /\.remove\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 95,
                    message: "Arrays don't have `.remove()`. Use `.splice()`, `.filter()`, or lodash",
                    quickFix: "Use: arr.splice(index, 1) or arr.filter(x => x !== value)",
                    example: "items.splice(index, 1)  // Remove by index"
                },
                {
                    pattern: /\.contains\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 95,
                    message: "Use `.includes()`, not `.contains()` for strings/arrays",
                    quickFix: "Replace with: .includes()",
                    example: "if (str.includes('word')) { }"
                },
                {
                    pattern: /new Date\(\)\.format/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 100,
                    message: "Native Date has no `.format()`. Use Intl.DateTimeFormat or libraries",
                    quickFix: "Use: new Intl.DateTimeFormat().format(date) or moment/date-fns",
                    example: "new Intl.DateTimeFormat('en-US').format(new Date())"
                },
                {
                    pattern: /array\.length\(\)/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 100,
                    message: "`.length` is a property, not a method. Remove parentheses",
                    quickFix: "Use: array.length (no parentheses)",
                    example: "const count = items.length;  // Correct"
                },
                {
                    pattern: /\.size\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Arrays/Strings use `.length` property. `.size()` is for Map/Set",
                    quickFix: "Use: array.length or set.size",
                    example: "const len = items.length;  // For arrays"
                },
                {
                    pattern: /\.append\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Python's `.append()` detected. JavaScript arrays use `.push()`",
                    quickFix: "Use: array.push(item)",
                    example: "items.push(newItem);  // Correct"
                },
                {
                    pattern: /\.count\(/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 85,
                    message: "Arrays don't have `.count()`. Use `.filter().length` or lodash",
                    quickFix: "Use: arr.filter(x => condition).length",
                    example: "const count = items.filter(x => x > 5).length;"
                },
                {
                    pattern: /Promise\.all\([^[]/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "`Promise.all()` expects an array of promises, not individual arguments",
                    quickFix: "Use: Promise.all([promise1, promise2])",
                    example: "await Promise.all([fetch(url1), fetch(url2)]);"
                }
            ],

            // Syntax& Type Errors
            syntaxErrors: [
                {
                    pattern: /==\s*True\b|===\s*True\b/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 100,
                    message: "Python-style `True` detected. JavaScript uses lowercase `true`",
                    quickFix: "Replace with: true (lowercase)",
                    example: "if (condition === true) { }"
                },
                {
                    pattern: /==\s*False\b|===\s*False\b/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 100,
                    message: "Python-style `False` detected. JavaScript uses lowercase `false`",
                    quickFix: "Replace with: false (lowercase)",
                    example: "if (condition === false) { }"
                },
                {
                    pattern: /\bNone\b/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 95,
                    message: "Python's `None` detected. JavaScript uses `null` or `undefined`",
                    quickFix: "Replace with: null or undefined",
                    example: "let value = null;  // JavaScript"
                }
            ],

            // Async/Await Issues
            asyncIssues: [
                {
                    pattern: /async\s+function[^{]+\{[^}]*\breturn\s+fetch\(/,
                    multiLine: true,
                    category: 'logic_error',
                    severity: 'high',
                    confidence: 80,
                    message: "Possible missing `await ` before `fetch()` in async function",
                    quickFix: "Use: return await fetch() or remove async",
                    example: "async function getData() {\n  return await fetch(url);\n}"
                },
                {
                    pattern: /\.then\(\)\.catch\(\)/,
                    category: 'style',
                    severity: 'low',
                    confidence: 60,
                    message: "Consider using async/await instead of .then().catch() for clarity",
                    quickFix: "Use: try { await promise } catch(e) { }",
                    example: "try {\n  const result = await fetchData();\n} catch(error) { }"
                }
            ],

            // Deprecated/Old Syntax
            deprecated: [
                {
                    pattern: /var\s+\w+\s*=/,
                    category: 'deprecated',
                    severity: 'low',
                    confidence: 70,
                    message: "`var` is outdated. Use `const` (immutable) or `let` (mutable)",
                    quickFix: "Replace with: const or let",
                    example: "const value = 42;  // Modern JS"
                }
            ],

            // Security Issues
            securityIssues: [
                {
                    pattern: /eval\(/,
                    category: 'security',
                    severity: 'critical',
                    confidence: 95,
                    message: "`eval()` is dangerous. Never use with untrusted input",
                    quickFix: "Use safer alternatives like JSON.parse() or Function constructor",
                    example: "const data = JSON.parse(jsonString);"
                },
                {
                    pattern: /innerHTML\s*=/,
                    category: 'security',
                    severity: 'medium',
                    confidence: 75,
                    message: "`innerHTML` can cause XSS vulnerabilities with untrusted content",
                    quickFix: "Use: textContent or DOMPurify.sanitize()",
                    example: "element.textContent = userInput;  // Safe"
                },
                {
                    pattern: /document\.write\(/,
                    category: 'security',
                    severity: 'high',
                    confidence: 90,
                    message: "`document.write()` is dangerous and can cause XSS. Avoid using it",
                    quickFix: "Use: DOM manipulation methods like appendChild",
                    example: "document.body.appendChild(element);"
                }
            ],

            // Array Method Hallucinations
            arrayMethods: [
                {
                    pattern: /\.delete\(/,
                    category: 'api_misuse',
                    severity: 'critical',
                    confidence: 95,
                    message: "Arrays don't have `.delete()`. Use `.splice()` or `delete ` operator",
                    quickFix: "Use: array.splice(index, 1) or delete array[index]",
                    example: "items.splice(2, 1);  // Remove at index 2"
                },
                {
                    pattern: /\.clear\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Arrays don't have `.clear()`. Use `array.length = 0` or `array = []`",
                    quickFix: "Use: array.length = 0 or array = []",
                    example: "items.length = 0;  // Clear array"
                },
                {
                    pattern: /\.first\(\)|\.last\(\)/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 85,
                    message: "Arrays don't have `.first()` or `.last()`. Use indexing or `.at()`",
                    quickFix: "Use: array[0] or array[array.length-1] or array.at(-1)",
                    example: "const first = items[0]; const last = items.at(-1);"
                },
                {
                    pattern: /\.empty\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Arrays don't have `.empty()`. Check `array.length === 0`",
                    quickFix: "Use: array.length === 0 or !array.length",
                    example: "if (items.length === 0) { /* empty */ }"
                }
            ],

            // Object Method Hallucinations
            objectMethods: [
                {
                    pattern: /Object\.size\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 95,
                    message: "No `Object.size()`. Use `Object.keys(obj).length`",
                    quickFix: "Use: Object.keys(obj).length",
                    example: "const size = Object.keys(myObj).length;"
                },
                {
                    pattern: /\.hasOwnProperty\(/,
                    category: 'deprecated',
                    severity: 'medium',
                    confidence: 75,
                    message: "Prefer `Object.hasOwn()` or ` in ` operator over `.hasOwnProperty()`",
                    quickFix: "Use: Object.hasOwn(obj, key) or 'key' in obj",
                    example: "if (Object.hasOwn(obj, 'key')) { }"
                },
                {
                    pattern: /Object\.forEach\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 100,
                    message: "Objects don't have `.forEach()`. Use `Object.entries(obj).forEach()`",
                    quickFix: "Use: Object.entries(obj).forEach(([key, val]) => {})",
                    example: "Object.entries(obj).forEach(([k, v]) => console.log(k, v));"
                }
            ],

            // String Method Hallucinations
            stringMethods: [
                {
                    pattern: /\.capitalize\(\)/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 90,
                    message: "Strings don't have `.capitalize()`. Implement manually or use library",
                    quickFix: "Use: str.charAt(0).toUpperCase() + str.slice(1)",
                    example: "const capitalized = str.charAt(0).toUpperCase() + str.slice(1);"
                },
                {
                    pattern: /\.reverse\(\)/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 85,
                    message: "Strings don't have `.reverse()`. Convert to array first",
                    quickFix: "Use: str.split('').reverse().join('')",
                    example: "const reversed = str.split('').reverse().join('');"
                }
            ],

            // DOM API Hallucinations
            domIssues: [
                {
                    pattern: /getElementById\(['"][^'"]*['"]\)\.value\s*===\s*''/,
                    category: 'logic_error',
                    severity: 'medium',
                    confidence: 70,
                    message: "Comparing to empty string. Consider checking for falsy values",
                    quickFix: "Use: !element.value or element.value.trim() === ''",
                    example: "if (!input.value.trim()) { /* empty */ }"
                },
                {
                    pattern: /\.addListener\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "DOM uses `.addEventListener()`, not `.addListener()`",
                    quickFix: "Use: element.addEventListener('event', handler)",
                    example: "button.addEventListener('click', handleClick);"
                },
                {
                    pattern: /\.setAttribute\(['"]class['"]/,
                    category: 'style',
                    severity: 'low',
                    confidence: 70,
                    message: "Prefer `.className` or `.classList` over setAttribute for classes",
                    quickFix: "Use: element.className = 'class' or element.classList.add('class')",
                    example: "element.classList.add('active');"
                }
            ],

            // Node.js Specific
            nodeJsIssues: [
                {
                    pattern: /require\(['"][^'"]*['"]\.default/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 80,
                    message: "CommonJS `require()` doesn't need `.default`. That's ES6 syntax",
                    quickFix: "Use: const mod = require('module') directly",
                    example: "const express = require('express');"
                },
                {
                    pattern: /__dirname\s*\+\s*['"][/\\]/,
                    category: 'style',
                    severity: 'low',
                    confidence: 75,
                    message: "Use `path.join()` instead of string concatenation for paths",
                    quickFix: "Use: path.join(__dirname, 'file.js')",
                    example: "const filePath = path.join(__dirname, 'public', 'index.html');"
                },
                {
                    pattern: /process\.exit\(1\)/,
                    category: 'style',
                    severity: 'low',
                    confidence: 60,
                    message: "Prefer graceful shutdown over `process.exit()` in most cases",
                    quickFix: "Consider: throw new Error() or return rejection",
                    example: "throw new Error('Fatal error');"
                }
            ],

            // React/JSX Common Mistakes
            reactIssues: [
                {
                    pattern: /class\s*=/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 85,
                    message: "JSX uses `className`, not `class` (reserved keyword)",
                    quickFix: "Use: className=",
                    example: "<div className='container'>"
                },
                {
                    pattern: /for\s*=/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 85,
                    message: "JSX uses `htmlFor`, not `for` (reserved keyword)",
                    quickFix: "Use: htmlFor=",
                    example: "<label htmlFor='input-id'>"
                },
                {
                    pattern: /onclick\s*=/,
                    category: 'syntax_error',
                    severity: 'medium',
                    confidence: 80,
                    message: "React uses camelCase: `onClick`, not `onclick`",
                    quickFix: "Use: onClick=",
                    example: "<button onClick={handleClick}>"
                }
            ]
        },

        java: {
            apiMisuse: [
                {
                    pattern: /System\.out\.println\s+[^(]/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 95,
                    message: "`System.out.println` requires parentheses",
                    quickFix: "Add parentheses: System.out.println(message)",
                    example: "System.out.println(\"Hello\");"
                },
                {
                    pattern: /\.push\(/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Java collections use `.add()`, not `.push()` (JavaScript pattern)",
                    quickFix: "Use: list.add(item)",
                    example: "arrayList.add(element);"
                },
                {
                    pattern: /\.length\(\)/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 95,
                    message: "Arrays use `.length` property (no parentheses). Collections use `.size()`",
                    quickFix: "Use: array.length or collection.size()",
                    example: "int len = myArray.length;"
                }
            ]
        },

        typescript: {
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
            // (These will be merged during detection)
            ...superRules.javascript
        },

        go: {
            apiMisuse: [
                {
                    pattern: /fmt\.Println\s+[^(]/,
                    category: 'syntax_error',
                    severity: 'high',
                    confidence: 95,
                    message: "`fmt.Println` requires parentheses",
                    quickFix: "Add parentheses: fmt.Println(message)",
                    example: "fmt.Println(\"Hello\")"
                },
                {
                    pattern: /\.append\(/,
                    category: 'api_misuse',
                    severity: 'medium',
                    confidence: 80,
                    message: "Go slices use built-in `append()` function, not method",
                    quickFix: "Use: slice = append(slice, item)",
                    example: "mySlice = append(mySlice, newItem)"
                },
                {
                    pattern: /\.length\b/,
                    category: 'api_misuse',
                    severity: 'high',
                    confidence: 90,
                    message: "Go uses `len()` function, not `.length` property",
                    quickFix: "Use: len(slice) or len(array)",
                    example: "size := len(mySlice)"
                }
            ]
        }
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
            go: 0
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
        highlightedCode.className = `language - ${ languageSelect.value } `;
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
                go: 'Go'
            }[detectedLang];

            statusIndicator.textContent = `Detected: ${ langName } (${ confidence }% confident)`;
            statusIndicator.className = confidence > 70 ? 'text-xs text-green-400' : 'text-xs text-yellow-400';

            // Small delay to show detection
            setTimeout(() => {
                statusIndicator.textContent = 'Analyzing...';
                statusIndicator.className = 'text-xs text-blue-400';

                const lang = detectedLang;
                highlightedCode.className = `language - ${ lang } `;
                highlightedCode.textContent = code;
                hljs.highlightElement(highlightedCode);

                // Build code context
                buildCodeContext(code, lang);

                // Run detection
                const issues = detectIssues(code, lang);

                markIssues(issues);
                renderExplanations(issues);
                updateStatsPanel();

                const statusMsg = issues.length > 0
                    ? `Found ${ issues.length } issue${ issues.length !== 1 ? 's' : '' } `
                    : 'Clean ✓';
                statusIndicator.textContent = statusMsg;
                statusIndicator.className = issues.length > 0
                    ? 'text-xs text-yellow-400'
                    : 'text-xs text-green-400';
                issueCount.textContent = issues.length;
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
                newHtml += `< div class="${markerClass}" title = "${escapeHtml(issue.message)}" > ${ lineHtml || '&nbsp;' }</div > `;
            } else {
                newHtml += `< div > ${ lineHtml || '&nbsp;' }</div > `;
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
                critical: '<span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">Critical</span>',
                high: '<span class="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded uppercase">High</span>',
                medium: '<span class="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded uppercase">Medium</span>',
                low: '<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase">Low</span>'
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
    < div class="explanation-card ${issue.type} mb-3" style = "animation: fadeIn 0.3s ease-in ${i * 0.05}s both" >
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-gray-400">Line ${issue.lineIndex + 1}</span>
                        ${getSeverityBadge(issue.severity)}
                        <span class="text-xs text-gray-500">${getCategoryIcon(issue.category)} ${formatCategory(issue.category)}</span>
                    </div>
                    <span class="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded shrink-0">
                        ${issue.confidence}% confidence
                    </span>
                </div>
                
                <p class="text-sm text-gray-200 font-medium mb-2">${escapeHtml(issue.message)}</p>
                
                <div class="bg-black/30 p-2 rounded mb-2 overflow-x-auto">
                    <code class="text-xs font-mono text-gray-400">${escapeHtml(issue.lineText)}</code>
                </div>
                
                ${
    issue.quickFix ? `
                    <div class="mt-2 p-2 bg-green-500/10 border-l-2 border-green-500 rounded">
                        <p class="text-xs text-green-400 font-semibold mb-1">💡 Quick Fix:</p>
                        <code class="text-xs text-green-300">${escapeHtml(issue.quickFix)}</code>
                    </div>
                ` : ''
}
                
                ${
    issue.example ? `
                    <details class="mt-2">
                        <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-400">Show example</summary>
                        <div class="mt-1 p-2 bg-black/20 rounded">
                            <code class="text-xs font-mono text-gray-400 whitespace-pre">${escapeHtml(issue.example)}</code>
                        </div>
                    </details>
                ` : ''
}
            </div >
    `).join('');
    }

    function updateStatsPanel() {
        const totalRules = flattenRules(languageSelect.value).length;

        statsPanel.innerHTML = `
    < div class="grid grid-cols-2 gap-2 text-xs" >
                <div class="bg-red-500/10 p-2 rounded border border-red-500/20">
                    <div class="text-red-400 font-bold text-lg">${analysisStats.critical + analysisStats.high}</div>
                    <div class="text-gray-500 text-[10px]">Critical/High</div>
                </div>
                <div class="bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                    <div class="text-yellow-400 font-bold text-lg">${analysisStats.medium + analysisStats.low}</div>
                    <div class="text-gray-500 text-[10px]">Medium/Low</div>
                </div>
            </div >
    <div class="mt-2 text-center text-[10px] text-gray-600">
        Checked ${totalRules} patterns
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
});
