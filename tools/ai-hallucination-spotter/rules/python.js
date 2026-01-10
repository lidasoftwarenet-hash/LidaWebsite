export const pythonRules = {
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
            pattern: /\.add\(/,
            category: 'api_misuse',
            severity: 'critical',
            confidence: 90,
            message: "Python lists use `.append()`, not `.add()` (Set method)",
            quickFix: "Use: .append(item) for lists",
            example: "my_list.append(x)"
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
            pattern: /\w+\s+is\s+['"]|['"]\s+is\s+\w+/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 90,
            message: "Use `==` for string comparison, not `is` (which compares object identity)",
            quickFix: "Replace `is` with `==`",
            example: "if name == 'Admin':"
        },
        {
            pattern: /\w+\s+is\s+\d+|\d+\s+is\s+\w+/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 90,
            message: "Use `==` for numeric comparison, not `is`",
            quickFix: "Replace `is` with `==`",
            example: "if count == 0:"
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
                    if (!codeBefore.includes(`${varName} =`) &&
                        !codeBefore.includes(`${varName}: `) &&
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
                return /match\s+.+:/.test(line) && !lines[lineIndex + 1]?.trim().startsWith('case');
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
                const line = lines[lineIndex + 1];
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
};
