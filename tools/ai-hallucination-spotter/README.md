# AI Hallucination Spotter

A free, client-side tool to catch common hallucinations and errors in AI-generated code (Python, JavaScript, Java, Go).

## What It Does

Paste AI-generated code from ChatGPT, Claude, Copilot, or any other AI assistant, and this tool will:

- ✅ Detect **fake imports** that don't exist
- ✅ Catch **made-up function names** 
- ✅ Spot **wrong argument order** or types
- ✅ Identify **deprecated syntax** from old language versions
- ✅ Flag **impossible logic** patterns

## How It Works

The tool runs **fast static checks** using pattern matching and a database of common AI hallucinations:

1. **Client-Side**: All analysis runs in your browser. No code is sent to any server.
2. **Fast**: Results appear in under 2 seconds.
3. **Color-Coded**: Red = likely hallucination (error), Yellow = suspicious (warning).

## Examples

### Python Hallucinations Detected

```python
# ERROR: json.load() expects a file object, not a filename
data = json.load('data.json')

# ERROR: Python lists use .append(), not .push()
results.push(item)

# ERROR: os.exists doesn't exist (it's os.path.exists)
if os.exists('file.txt'):
    pass
```

### JavaScript Hallucinations Detected

```javascript
// ERROR: Should be fs.existsSync (with an 's')
fs.existSync('./file.txt')

// ERROR: Arrays don't have .remove() (use .splice() or .filter())
items.remove('item')

// ERROR: Strings use .includes(), not .contains()
"hello".contains("world")
```

## Files

- `ai-hallucination-spotter.html` - Main tool interface
- `script.js` - Client-side detection logic
- `server/` - Optional Node.js backend (currently uses client-side only)

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, Highlight.js
- **Backend (Optional)**: Node.js, Express (for future integration with Pylint/ESLint)
- **Analysis**: Regex patterns + rule-based matching

## Usage

1. Open `ai-hallucination-spotter.html`
2. Select your language (Python, JavaScript, Java, Go)
3. Paste AI-generated code
4. Click **Analyze Code**
5. Review highlighted issues and explanations

## Limitations

This tool is **not**:

- A full linter replacement (use Pylint, ESLint, etc. for comprehensive checks)
- A code runner (it never executes your code for safety)
- Perfect (it catches common patterns, not all semantic bugs)

## Future Enhancements

- [ ] Backend integration with Pylint, MyPy, ESLint
- [ ] More language support (Rust, C++, TypeScript)
- [ ] Custom rule configuration
- [ ] Export analysis reports

## License

MIT License - Free to use and modify.
