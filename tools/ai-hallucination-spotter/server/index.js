const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to analyze code
app.post('/api/analyze', async (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Missing code or language' });
    }

    // Security: Limit length
    if (code.length > 10000) {
        return res.status(400).json({ error: 'Code too long (max 10k chars)' });
    }

    try {
        const results = await runAnalyzers(code, language);
        res.json({ results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

async function runAnalyzers(code, language) {
    const tempFile = path.join(os.tmpdir(), `analyze_${Date.now()}.${getExtension(language)}`);

    try {
        await fs.promises.writeFile(tempFile, code);

        // Mocking the analyzer run - in production this would run pylint/eslint
        // We return a mock response for now as we don't assume tools are installed in this environment
        return [
            {
                line: 1,
                message: "Backend Analysis: This is where Pylint/ESLint results would appear.",
                type: "info"
            }
        ];

        /* Real Implementation Example:
        if (language === 'python') {
            return await runCommand(`pylint ${tempFile} --output-format=json`);
        }
        */

    } finally {
        // Cleanup
        try { await fs.promises.unlink(tempFile); } catch (e) { }
    }
}

function getExtension(lang) {
    const map = { python: 'py', javascript: 'js', java: 'java', go: 'go' };
    return map[lang] || 'txt';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
