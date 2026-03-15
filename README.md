# VenturePilot v1.5

An interactive, founder-facing "venture OS" that models runway, decks, strategy, benchmarks, and investor CRM in one SPA. Metrics live in the left sidebar; every module updates in real time.

## Highlights
- Live financial model: runway, burn, growth, LTV/CAC, Monte Carlo risk, alerts.
- Scenario lab: recommended strategies, one-click apply, fine-tune sliders, undo/redo history.
- Deck + plan generators: personalized slides, team/stage, problem/industry narrative, export TXT/MD.
- Benchmarks: sector-aware comparisons with cycling through All/SaaS/AI/Fintech/Health/Infra.
- Investor CRM: filters, follow-up dates, intro-template copy, positioning snapshot.
- Presets & snapshots: save/load presets, daily auto-snapshots, local undo/redo, toasts.
- Optional GitHub input: drop a repo URL to auto-inject narrative cues.

## Quick start
```bash
npm install
npm run dev   # local dev server
npm run build # production build to dist/
```

## Deploy to GitHub Pages

### Option A — Automatic (recommended)

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys automatically on every push to `main`.

1. Create a GitHub repo named **`venturepilot`** under your account (already configured for `nessgelman`).
2. Push the code:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/nessgelman/venturepilot.git
   git push -u origin main
   ```
3. In your repo go to **Settings → Pages → Source** and select **GitHub Actions**.
4. The Actions tab will show the build running. Site is live at `https://nessgelman.github.io/venturepilot` in ~2 min.

### Option B — Manual deploy

```bash
npm run deploy
```

This runs `npm run build` then pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. Make sure **Settings → Pages → Source** is set to **Deploy from branch → gh-pages / root**.

## Controls & tips
- Sidebar autosaves to localStorage; use Undo `⌘/Ctrl+Z`, Redo `⌘/Ctrl+Shift+Z` or `⌘/Ctrl+Y`.
- Use presets to jump between scenarios; snapshots collect last 30 days automatically.
- "Analyze Repo" fetches the README from raw.githubusercontent (no backend) — GitHub Pages compatible. Skip for private repos.

## Tech
React 18 + Vite 5, framer-motion, lucide-react, recharts. No backend required; all state in `localStorage`.
