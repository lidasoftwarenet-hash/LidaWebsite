export const csharpRules = {
    // API & Syntax Misuse
    apiMisuse: [
        {
            pattern: /\.push\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 95,
            message: "C# Lists use `.Add()`, not `.push()` (JavaScript pattern)",
            quickFix: "Use: `.Add(item)`",
            example: "myList.Add(item);"
        },
        {
            pattern: /\.length\b(?!\()/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "C# Strings use `.Length`, but Lists/Collections use `.Count`",
            quickFix: "Use: `.Length` (strings) or `.Count` (lists)",
            example: "int count = list.Count;"
        },
        {
            pattern: /Dictionary<.*>\.HasKey\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 100,
            message: "Dictionaries use `.ContainsKey()`, not `.HasKey()`",
            quickFix: "Use: `.ContainsKey(key)`",
            example: "if (dict.ContainsKey(\"id\")) { }"
        },
        {
            pattern: /\.Size\(\)/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 90,
            message: "C# collections use `.Count`, not `.Size()` (Java pattern)",
            quickFix: "Use: `.Count`",
            example: "if (list.Count > 0) { }"
        },
        {
            pattern: /Console\.log\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 100,
            message: "C# uses `Console.WriteLine()`, not `Console.log()`",
            quickFix: "Use: `Console.WriteLine()`",
            example: "Console.WriteLine(\"Hello\");"
        },
        {
            pattern: /\.contains\(/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "C# uses `.Contains()`, not `.contains()` (lowercase)",
            quickFix: "Use: `.Contains()`",
            example: "if (text.Contains(\"search\")) { }"
        },
        {
            pattern: /\.remove\(/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "C# uses `.Remove()`, not `.remove()` (lowercase)",
            quickFix: "Use: `.Remove()`",
            example: "list.Remove(item);"
        }
    ],

    // PascalCase vs camelCase Hallucinations
    namingIssues: [
        {
            pattern: /void\s+[a-z]\w*\(/,
            category: 'style',
            severity: 'low',
            confidence: 60,
            message: "C# methods typically use PascalCase. AI often uses camelCase (Java/JS pattern)",
            quickFix: "Use: `void MyMethod()`",
            example: "public void ProcessData() { }"
        },
        {
            pattern: /\.[a-z]\w*\(/,
            category: 'style',
            severity: 'low',
            confidence: 50,
            message: "Public methods in C# use PascalCase. Did you mean to capitalize this?",
            quickFix: "Capitalize method name",
            example: "string.IsNullOrWhiteSpace(str)"
        }
    ],

    // Keyword & Core Hallucinations
    hallucinatedKeywords: [
        {
            pattern: /\bNone\b/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "Python's `None` detected. C# uses `null`",
            quickFix: "Replace with: `null`",
            example: "string s = null;"
        },
        {
            pattern: /\bboolean\b/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Java/JS `boolean` detected. C# use `bool`",
            quickFix: "Replace with: `bool`",
            example: "bool isValid = true;"
        },
        {
            pattern: /\bstring\s+\w+\s*\[\s*\]/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 80,
            message: "Array syntax: `string[] arr` is preferred over `string arr[]`",
            quickFix: "Use: `string[] items;`",
            example: "string[] names = new string[10];"
        }
    ],

    // Async/Await Hallucinations
    asyncIssues: [
        {
            pattern: /async\s+void\s+\w+\(/,
            category: 'logic_error',
            severity: 'high',
            confidence: 85,
            message: "`async void` should only be used for event handlers. Use `async Task` instead",
            quickFix: "Use: `async Task MyMethod()`",
            example: "public async Task DoWorkAsync() { }"
        },
        {
            pattern: /\.Result\b/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 70,
            message: "Accessing `.Result` can cause deadlocks. Prefer `await`",
            quickFix: "Use: `await task` instead of `.Result`",
            example: "var data = await task;"
        },
        {
            pattern: /Task\.Run\(\s*async\b/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 75,
            message: "Avoid `Task.Run(async ...)` if possible. Task.Run already handles async lambdas",
            quickFix: "Simplify the lambda",
            example: "Task.Run(() => DoWork())"
        }
    ],

    // String Hallucinations
    stringMethods: [
        {
            pattern: /\.equals\(/,
            category: 'style',
            severity: 'low',
            confidence: 60,
            message: "C# can use `==` for string content comparison. `.Equals()` is also valid but less common for literals",
            quickFix: "Use: `str1 == str2`",
            example: "if (name == \"admin\") { }"
        },
        {
            pattern: /\.substring\(/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "C# uses `.Substring(startIndex, length)`, not `.substring()` (lowercase)",
            quickFix: "Use: `.Substring()`",
            example: "string sub = s.Substring(0, 5);"
        }
    ],

    // Exception Handling
    exceptions: [
        {
            pattern: /catch\s*\(\s*Exception\s+e\s*\)\s*\{\s*\}/,
            category: 'security',
            severity: 'medium',
            confidence: 85,
            message: "Swallowing generic exceptions is dangerous. Log the error",
            quickFix: "Add logging or rethrow",
            example: "catch (Exception ex) { _logger.LogError(ex); }"
        }
    ],

    // Modern C# features
    modernFeatures: [
        {
            pattern: /:\s*string\s+\w+\s*=\s*null\b/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "In Nullable Reference Types context, use `string?` for nullable strings",
            quickFix: "Use: `string? name = null;`",
            example: "string? middleName = null;"
        }
    ],

    // Misc
    misc: [
        {
            pattern: /foreach\s*\(\s*var\s+\w+\s+in\s+\w+\s*\)\s*\{(?![^}]*yield)/s,
            category: 'style',
            severity: 'low',
            confidence: 50,
            message: "Just a reminder: `foreach` is great. No issue here, just checking your code! 😉",
            quickFix: "",
            example: ""
        }
    ]
};
