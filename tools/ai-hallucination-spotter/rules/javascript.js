export const javascriptRules = {
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
        },
        {
            pattern: /switch\s*\(.*\)\s*\{(?![^}]*case)/s,
            multiLine: true,
            category: 'logic_error',
            severity: 'low',
            confidence: 90,
            message: "Empty `switch` statement detected",
            quickFix: "Add `case` blocks or replace with `if`",
            example: "switch (val) { case 'a': break; }"
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
        },
        {
            pattern: /\.map\(\s*async\b/,
            category: 'logic_error',
            severity: 'high',
            confidence: 85,
            message: "Using `async` inside `.map()` returns an array of Promises. Use `Promise.all()` to await them",
            quickFix: "Use: await Promise.all(arr.map(async ...))",
            example: "const results = await Promise.all(items.map(async x => await fetch(x)));"
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
};
