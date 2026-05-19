# Infra Priority Dashboard

Internal dashboard for objectively scoring and prioritizing infrastructure initiatives across business lines.

## Quick Start

```bash
npm install
npm run dev        # local dev at http://localhost:5173
npm run build      # production build → dist/
```

## Deploy to Vercel (First Time)

1. **Create a private GitHub repo** and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial deploy"
   gh repo create infra-priority-dashboard --private --push
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the GitHub repo
   - Framework: Vite (auto-detected)
   - Deploy

3. **Enable password protection (Vercel Pro):**
   - Project Settings → General → Password Protection → Enable
   - Set a shared password for the team
   - Or use Vercel Authentication to restrict to specific email domains

## Monthly Update Workflow

The only file that changes each month is **`src/data.js`**.

### Option A: Via Claude (recommended)
1. Upload the latest `Shared_services` spreadsheet to Claude
2. Say: "Regenerate the data.js for the infra priority dashboard"
3. Replace `src/data.js` with the output
4. `git commit -am "June 2026 data update" && git push`
5. Vercel auto-deploys in ~30 seconds

### Option B: Manual
1. Open the spreadsheet's "Infra Plan" tab
2. Filter to active statuses (In Progress, New, OnHold, To Do, Blocked)
3. Export the relevant columns as JSON
4. Update the `INITIATIVES` array and `DATA_META` in `src/data.js`
5. Push to GitHub

## Project Structure

```
src/
  data.js      ← ONLY file that changes monthly (initiative data + changelog)
  scoring.js   ← Scoring engine (weights, formulas, tier logic)
  App.jsx      ← Dashboard UI
  main.jsx     ← React entry point
```

## Scoring Model

Each initiative is scored 0-100 on four dimensions:

| Dimension | Default Weight | Signals |
|-----------|---------------|---------|
| Strategic Alignment | 30% | 2026 strategy flag, OKR linkage, status momentum, Q1 plan |
| Risk & Compliance | 25% | Security LoB, SOC2/ISO mentions, DR, supply chain, incidents |
| Business Value | 25% | Business purpose documented, OKR, revenue LoB, cost savings |
| Execution Readiness | 20% | Low effort, in-progress, no dependencies, near-term scheduled |

Weights are adjustable in the UI via sliders. The model intentionally ignores column R (team-assigned priority) as a primary signal to remove LoB self-interest bias.

## Access Control Options

- **Vercel Password Protection** (Pro plan): Simple shared password
- **Vercel Authentication**: Restrict to specific email domains (e.g., @yourcompany.com)
- **GitHub private repo**: Source code stays internal regardless
