# AI Hallucination Spotter Backend

This directory contains the backend code for the AI Hallucination Spotter tool.

## Setup

1. Install dependencies:
   ```bash
   npm install express cors
   ```

2. Run the server:
   ```bash
   node index.js
   ```

3. Configure static analyzers:
   - For Python: Install `pylint`, `mypy`.
   - For JS: Install `eslint`.
   - Update `index.js` to uncomment the `runCommand` logic.

## Deployment

This is a standard Node.js app. You can deploy it to:
- Vercel (as Serverless Functions)
- Netlify Functions
- Heroku / DigitalOcean / Railway

## Note

The frontend `ai-hallucination-spotter.html` is currently configured to run in **Client-Side Mode** using Regex patterns. To use this backend, you would need to update `script.js` to `fetch('/api/analyze')` instead of running `detectIssues` locally.
