export const javaRules = {
    // API Misuse Patterns
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
        },
        {
            pattern: /\.size\b(?![(])/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 90,
            message: "Collections use `.size()` method, not property",
            quickFix: "Use: list.size()",
            example: "if (list.size() > 0) { }"
        },
        {
            pattern: /List\.of\(.*\)\.add\(/,
            category: 'logic_error',
            severity: 'critical',
            confidence: 95,
            message: "`List.of()` creates an immutable list. Calling `.add()` will throw UnsupportedOperationException",
            quickFix: "Use: new ArrayList<>(List.of(...))",
            example: "List<String> list = new ArrayList<>(List.of(\"a\", \"b\"));\nlist.add(\"c\");"
        },
        {
            pattern: /Arrays\.contains\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 100,
            message: "`Arrays` class does not have a `contains` method. Use `Arrays.asList(arr).contains()` or a loop",
            quickFix: "Use: Arrays.asList(array).contains(value)",
            example: "if (Arrays.asList(myArray).contains(\"target\")) { }"
        }
    ],

    // Logic & Style Errors
    logicErrors: [
        {
            pattern: /==\s*['"]/,
            category: 'logic_error',
            severity: 'high',
            confidence: 85,
            message: "Comparing strings with `==` compares references. Use `.equals()` for content comparison",
            quickFix: "Use: str1.equals(str2)",
            example: "if (\"admin\".equals(role)) { }"
        },
        {
            pattern: /Optional<.*>\s+\w+\s*=\s*.*\.get\(\)/,
            category: 'logic_error',
            severity: 'high',
            confidence: 80,
            message: "Calling `.get()` on Optional without `isPresent()` or `ifPresent()` check is dangerous",
            quickFix: "Use: optional.orElse(defaultValue) or ifPresent()",
            example: "String val = opt.orElse(\"default\");"
        },
        {
            pattern: /Thread\.sleep\(\d+\)(?!.*catch\s*\(\s*InterruptedException)/s,
            multiLine: true,
            category: 'syntax_error',
            severity: 'medium',
            confidence: 75,
            message: "`Thread.sleep()` throws InterruptedException and must be caught or thrown",
            quickFix: "Wrap in try-catch block",
            example: "try { Thread.sleep(1000); } catch (InterruptedException e) { ... }"
        },
        {
            pattern: /new\s+ArrayList<>\(\d+\)\.add\(/,
            category: 'style',
            severity: 'low',
            confidence: 60,
            message: "Initializing ArrayList with capacity and immediately adding might be unnecessary. Just use default constructor",
            quickFix: "Use: new ArrayList<>()",
            example: "List<String> list = new ArrayList<>();"
        }
    ],

    // Map Misuse
    mapIssues: [
        {
            pattern: /\.has\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 95,
            message: "Java Maps use `.containsKey()`, not `.has()` (JavaScript pattern)",
            quickFix: "Use: map.containsKey(key)",
            example: "if (myMap.containsKey(\"key\")) { }"
        },
        {
            pattern: /\.keys\(\)/,
            category: 'api_misuse',
            severity: 'medium',
            confidence: 90,
            message: "Java Maps use `.keySet()`, not `.keys()`",
            quickFix: "Use: map.keySet()",
            example: "for (String key : map.keySet()) { }"
        }
    ],

    // String Hallucinations
    stringMethods: [
        {
            pattern: /\.split\(['"][.*+?^${}()|[\]\\]['"]\)/,
            category: 'logic_error',
            severity: 'high',
            confidence: 90,
            message: "`.split()` takes a regex. Special characters like '.' must be escaped",
            quickFix: "Use: .split(\"\\\\.\")",
            example: "String[] parts = str.split(\"\\\\.\");"
        },
        {
            pattern: /\.substr\(/,
            category: 'api_misuse',
            severity: 'high',
            confidence: 100,
            message: "Java uses `.substring(start, end)`, not `.substr()`",
            quickFix: "Use: .substring(start, end)",
            example: "String sub = str.substring(0, 5);"
        }
    ],

    // Modern Java vs Legacy
    modernJava: [
        {
            pattern: /\bvar\b/,
            category: 'style',
            severity: 'low',
            confidence: 50,
            message: "`var` is only available in Java 10+. Ensure your target version supports it",
            quickFix: "Use explicit types for older Java versions",
            example: "String name = \"John\"; // instead of var name = \"John\";"
        }
    ],

    // Exception Handling
    exceptions: [
        {
            pattern: /catch\s*\(\s*Exception\s+e\s*\)\s*\{\s*\}/,
            category: 'security',
            severity: 'medium',
            confidence: 85,
            message: "Swallowing generic exceptions is dangerous. Log the exception or handle it",
            quickFix: "Add logging: e.printStackTrace()",
            example: "catch (Exception e) { logger.error(e); }"
        },
        {
            pattern: /throw\s+new\s+Exception\(/,
            category: 'style',
            severity: 'low',
            confidence: 70,
            message: "Prefer throwing specific exceptions (e.g., IllegalArgumentException) over generic Exception",
            quickFix: "Use a more specific exception class",
            example: "throw new IllegalArgumentException(\"Invalid input\");"
        }
    ],

    // Misc Hallucinations
    misc: [
        {
            pattern: /public\s+static\s+void\s+main\s*\{\s*\}/,
            category: 'syntax_error',
            severity: 'critical',
            confidence: 100,
            message: "`main` method is missing `String[] args` parameter",
            quickFix: "Use: public static void main(String[] args)",
            example: "public static void main(String[] args) { }"
        },
        {
            pattern: /import\s+static\s+java\.lang\.Math\.\*/,
            category: 'style',
            severity: 'low',
            confidence: 80,
            message: "Static imports can make code harder to read. Consider importing specific methods",
            quickFix: "import static java.lang.Math.max;",
            example: "import static java.lang.Math.PI;"
        },
        {
            pattern: /new\s+String\(['"][^'"]*['"]\)/,
            category: 'style',
            severity: 'low',
            confidence: 90,
            message: "`new String(\"literal\")` is almost always unnecessary. Just use the literal",
            quickFix: "Use: \"literal\"",
            example: "String s = \"hello\";"
        },
        {
            pattern: /\.equals\(null\)/,
            category: 'logic_error',
            severity: 'medium',
            confidence: 95,
            message: "Using `.equals(null)` is unnecessary. Use `obj == null`",
            quickFix: "Use: obj == null",
            example: "if (myObj == null) { }"
        }
    ]
};
