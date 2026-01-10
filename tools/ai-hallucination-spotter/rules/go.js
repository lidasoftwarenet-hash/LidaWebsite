export const goRules = {
    // API & Syntax Misuse
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
        },
        {
            pattern: /\.push\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 90,
            message: "Go slices use `append()`, not `.push()` (JavaScript pattern)",
            quickFix: "Use: slice = append(slice, item)",
            example: "s = append(s, val)"
        },
        {
            pattern: /\.pop\(\)/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 85,
            message: "Go slices don't have a `.pop()` method. Use slicing: `s = s[:len(s)-1]`",
            quickFix: "Use: s = s[:len(s)-1]",
            example: "stack = stack[:len(stack)-1]"
        }
    ],

    // Logic & Runtime Errors
    logicErrors: [
        {
            pattern: /json\.Unmarshal\(.*,\s*[^&]\w+\)/,
            category: 'logic_error',
            severity: 'critical',
            confidence: 95,
            message: "`json.Unmarshal` requires a pointer to the destination variable",
            quickFix: "Pass as pointer: json.Unmarshal(data, &myVar)",
            example: "err := json.Unmarshal(data, &result)"
        },
        {
            pattern: /if\s+\w+\s*==\s*nil\s*{\s*return\s+nil,\s+nil\s*}/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Consider returning an error instead of double nil when a value is missing",
            quickFix: "Use: return nil, fmt.Errorf(\"not found\")",
            example: "return nil, errors.New(\"not found\")"
        },
        {
            pattern: /for\s+i,\s+v\s*:=\s*range\s+\w+\s*{\s*go\s+func\(\)\s*{\s*.*v.*/s,
            multiLine: true,
            category: 'logic_error',
            severity: 'critical',
            confidence: 90,
            message: "Loop variable captured in goroutine. Pass it as an argument or re-declare in loop",
            quickFix: "Pass v to goroutine: go func(v Type) { ... }(v)",
            example: "for _, v := range items {\n  go func(item string) {\n    fmt.Println(item)\n  }(v)\n}"
        }
    ],

    // Hallucinated Keywords
    hallucinatedKeywords: [
        {
            pattern: /\btry\s*\{/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Go does not have `try/catch`. Use error checking `if err != nil`",
            quickFix: "Check errors manually",
            example: "if err := doWork(); err != nil { return err }"
        },
        {
            pattern: /\bwhile\s*\(/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Go does not have a `while` keyword. Use `for` for all loops",
            quickFix: "Replace with: for",
            example: "for i < 10 { i++ }"
        },
        {
            pattern: /\bpublic\s+func\b|\bprivate\s+func\b/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Go uses capitalization for visibility, not keywords. Upper = Public, Lower = Private",
            quickFix: "Remove public/private and capitalize appropriately",
            example: "func MyPublicFunc() { } // Exported"
        },
        {
            pattern: /\bclass\s+\w+/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Go does not have classes. Use `struct` and methods",
            quickFix: "Use: type MyStruct struct { }",
            example: "type User struct { Name string }"
        },
        {
            pattern: /\bextends\s+\w+/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Go does not have inheritance. Use composition (embedding struct)",
            quickFix: "Embed the struct instead",
            example: "type Admin struct { User }"
        }
    ],

    // Map Misuse
    mapIssues: [
        {
            pattern: /\.exists\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 95,
            message: "Go maps don't have `.exists()`. Use comma-ok idiom: `val, ok := m[key]`",
            quickFix: "Use: _, ok := m[key]",
            example: "if _, ok := myMap[key]; ok { }"
        },
        {
            pattern: /\.has\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 95,
            message: "Go maps don't have `.has()`. Use `_, ok := m[key]`",
            quickFix: "Use: _, ok := m[key]",
            example: "if _, ok := myMap[key]; ok { }"
        },
        {
            pattern: /\.keys\(\)/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "Go maps don't have a `.keys()` method. Use a loop over the map",
            quickFix: "Use: for k := range m",
            example: "for key := range myMap { }"
        }
    ],

    // Concurrency Hallucinations
    concurrencyIssues: [
        {
            pattern: /sync\.WaitGroup\{\}/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 85,
            message: "WaitGroups should be initialized as `var wg sync.WaitGroup` or `wg := &sync.WaitGroup{}`",
            quickFix: "Use: var wg sync.WaitGroup",
            example: "var wg sync.WaitGroup"
        }
    ],

    // Error Handling Patterns
    errorHandling: [
        {
            pattern: /errors\.New\(fmt\.Sprintf\(/,
            category: 'style',
            severity: 'low',
            confidence: 80,
            message: "Use `fmt.Errorf()` instead of `errors.New(fmt.Sprintf())`",
            quickFix: "Use: fmt.Errorf(\"msg %s\", arg)",
            example: "return fmt.Errorf(\"failed: %w\", err)"
        },
        {
            pattern: /panic\("error"\)/,
            category: 'style',
            severity: 'medium',
            confidence: 60,
            message: "Use error returns instead of `panic()` for recoverable errors",
            quickFix: "Return an error object",
            example: "if err != nil { return err }"
        },
        {
            pattern: /if\s*err\s*!=\s*nil\s*{\s*panic\(err\)\s*}/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "In production code, handle errors instead of panicking",
            quickFix: "Return or log the error",
            example: "if err != nil { return fmt.Errorf(\"critical: %w\", err) }"
        }
    ]
};
