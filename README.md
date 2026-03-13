
# VenturePilot v1.4

An interactive, founder-facing “venture OS” that models runway, decks, strategy, benchmarks, and investor CRM in one SPA. Metrics live in the left sidebar; every module updates in real time.

## Highlights
- Live financial model: runway, burn, growth, LTV/CAC, Monte Carlo risk, alerts.
- Scenario lab: recommended strategies, one-click apply, fine-tune sliders, undo/redo history.
- Deck + plan generators: personalized slides, team/stage, problem/industry narrative, export TXT/MD.
- Benchmarks: sector-aware comparisons with cycling through All/SaaS/AI/Fintech/Health/Infra.
- Investor CRM: filters, follow-up dates, intro-template copy, positioning snapshot.
- Presets & snapshots: save/load presets, daily auto-snapshots, local undo/redo, toasts.
- Optional GitHub input: drop a repo URL to auto-inject narrative cues (client-side fetch of README; works on GitHub Pages).

## Quick start
```bash
npm install
npm run dev   # local
npm run build # production
```

## Deploy (GitHub Pages)
1) Set `homepage` in `package.json` to your Pages URL.  
2) `npm run build` then `npm run deploy` (uses `gh-pages`).  
3) Your site appears at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`.

## Controls & tips
- Sidebar autosaves; use Undo `⌘/Ctrl+Z`, Redo `⌘/Ctrl+Shift+Z` or `⌘/Ctrl+Y`.
- Use presets to jump between scenarios; snapshots collect last 30 days automatically.
- “Analyze Repo” is optional; it fetches the README from raw.githubusercontent (no backend) so it remains GitHub Pages-compatible. If the repo is private, skip or paste text manually.

## Tech
React 18 + Vite, framer-motion, lucide-react, recharts. No backend required; all state in `localStorage`.
