export const rustRules = {
    // API & Syntax Misuse
    apiMisuse: [
        {
            pattern: /\.push\(/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 80,
            message: "Calling `.push()` on a slice or array? Rust arrays are fixed size. Use `Vec` if you need to grow.",
            quickFix: "Use: `vec.push(item)`",
            example: "let mut v = vec![1, 2];\nv.push(3);"
        },
        {
            pattern: /panic!\s+[^(]/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "`panic!` is a macro and requires parentheses",
            quickFix: "Add parentheses: `panic!(\"error\")`",
            example: "panic!(\"something went wrong\");"
        },
        {
            pattern: /\.unwrap\(\)/,
            category: 'style',
            severity: 'low',
            confidence: 60,
            message: "Using `.unwrap()` can cause panics. Consider handling the error with `match` or `if let`",
            quickFix: "Use: `.expect(\"msg\")` or error handling",
            example: "let val = result.expect(\"Failed to parse\");"
        },
        {
            pattern: /try\s*\{/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust does not have `try/catch`. Use `Result` and the `?` operator",
            quickFix: "Use `?` for error propagation",
            example: "let file = File::open(\"foo.txt\")?;"
        },
        {
            pattern: /catch\s*\{/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust does not have `catch`. Handle `Result` values instead",
            quickFix: "Use `match result { Ok(v) => ..., Err(e) => ... }`",
            example: "match result {\n    Ok(v) => println!(\"{}\", v),\n    Err(e) => eprintln!(\"{}\", e),\n}"
        }
    ],

    // Ownership & Lifetimes
    ownershipIssues: [
        {
            pattern: /&\s*mut\s+&\s*mut/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 95,
            message: "Multiple mutable references (`&mut &mut`) are rarely what you want and often a syntax error",
            quickFix: "Simplify the reference level",
            example: "let x = &mut value;"
        },
        {
            pattern: /'\w+\s+[^:]/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 70,
            message: "Lifetime syntax error. Lifetimes are usually used in type definitions or function signatures like `<'a>`",
            quickFix: "Check lifetime placement",
            example: "struct Buffer<'a> { data: &'a [u8] }"
        }
    ],

    // Keyword & Core Hallucinations
    hallucinatedKeywords: [
        {
            pattern: /\bclass\s+\w+/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust does not have classes. Use `struct` and `impl`",
            quickFix: "Use: `struct Name { }` and `impl Name { }`",
            example: "struct User {\n    name: String,\n}\n\nimpl User {\n    fn new() -> Self { ... }\n}"
        },
        {
            pattern: /\bextends\b|\bpublic\b|\bprivate\b/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Hallucinated OOP keywords. Rust uses `pub` for visibility and traits for shared behavior",
            quickFix: "Use `pub` or traits",
            example: "pub struct MyStruct;"
        },
        {
            pattern: /\bnull\b/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust does not have `null`. Use `Option<T>` (Some/None)",
            quickFix: "Use `Option::None`",
            example: "let x: Option<i32> = None;"
        },
        {
            pattern: /\bvirtual\b|\boverride\b/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust does not use `virtual` or `override`. Use traits",
            quickFix: "Define and implement a trait",
            example: "trait MyTrait { fn do_sth(&self); }\nimpl MyTrait for MyStruct { ... }"
        }
    ],

    // String Misuse
    stringIssues: [
        {
            pattern: /"(\\"|[^"])*"\s*\.\s*push\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 95,
            message: "Cannot call `.push()` on a string literal (`&str`). Use `String::from()` first",
            quickFix: "Use: `String::from(\"...\").push(char)`",
            example: "let mut s = String::from(\"hello\");\ns.push('!');"
        },
        {
            pattern: /"(\\"|[^"])*"\s*\+\s*"\w+"/,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 85,
            message: "Cannot concatenate string literals with `+`. Use `format!` macro",
            quickFix: "Use: `format!(\"{}{}\", s1, s2)`",
            example: "let s = format!(\"{}{}\", \"a\", \"b\");"
        },
        {
            pattern: /\.length\b/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 90,
            message: "Rust uses `.len()`, not `.length`",
            quickFix: "Use: `.len()`",
            example: "let size = v.len();"
        }
    ],

    // Pattern Matching Hallucinations
    matchingIssues: [
        {
            pattern: /match\s+.+\{\s*(?![^}]*=>)/s,
            multiLine: true,
            category: 'syntax_error',
            severity: 'high',
            confidence: 90,
            message: "Match arms require `=>`. Are you mixing with Switch syntax?",
            quickFix: "Use: `pattern => expression`",
            example: "match val {\n    1 => println!(\"one\"),\n    _ => println!(\"other\"),\n}"
        },
        {
            pattern: /case\s+.*:/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Rust does not use `case`. Use `match` blocks",
            quickFix: "Use `match` arms",
            example: "1 => println!(\"one\"),"
        }
    ],

    // Module & Import Hallucinations
    moduleIssues: [
        {
            pattern: /import\s+/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "Rust uses `use`, not `import`",
            quickFix: "Replace `import` with `use`",
            example: "use std::collections::HashMap;"
        },
        {
            pattern: /use\s+std\.\w+/,
            category: 'syntax_error',
            severity: 'high',
            confidence: 100,
            message: "Rust module paths use `::`, not `.`",
            quickFix: "Use: `std::path::Path`",
            example: "use std::io;"
        },
        {
            pattern: /std::io::println\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 100,
            message: "There is no `std::io::println`. Use the `println!` macro",
            quickFix: "Use: `println!(\"...\")`",
            example: "println!(\"Hello\");"
        }
    ],

    // Collection Hallucinations
    collectionIssues: [
        {
            pattern: /\.has\(|\.contains_key\b(?!\()/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 90,
            message: "HashMaps use `.contains_key(key)`, not `.has()`",
            quickFix: "Use: `.contains_key(&key)`",
            example: "if map.contains_key(&key) { }"
        },
        {
            pattern: /\.get\(\w+\)\s*\+\s*\d+/,
            category: 'logic_error',
            severity: 'high',
            confidence: 85,
            message: "`.get()` returns an `Option`. You must handle it before adding to it",
            quickFix: "Use: `map.get(&key).unwrap_or(&0) + 1`",
            example: "let val = *map.get(&k).unwrap_or(&0) + 1;"
        }
    ]
};
