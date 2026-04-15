# Crunchbase Integration & Investor Matching — Analysis & Plan

> Analysis for VenturePilot (`nessgelman.github.io/venturepilot`)  
> April 2026

---

## TL;DR

**Direct Crunchbase integration is not practical on GitHub Pages as-is.** Two hard blockers: API key exposure and CORS. You have three realistic paths — a Vercel migration (cleanest, most powerful), a fully static AI-powered approach (fastest to ship, no backend), or a CORS-friendly data source workaround. All three are detailed below.

---

## Part 1 — Why GitHub Pages Blocks This

### Blocker 1: API Key Security

Crunchbase requires an API key for all calls. On a static site, any key you reference in the code ends up **baked into the JavaScript bundle at build time**. Vite's `import.meta.env.VITE_CRUNCHBASE_KEY` is substituted as a plain string during `npm run build` — meaning it's visible to anyone who opens DevTools → Sources and searches the JS file. This is a guaranteed key leak; Crunchbase would eventually detect abuse, rate-limit, and potentially revoke.

There is no safe way to hide an API key in a purely client-side static site. GitHub Pages has no runtime — there's no server to hold secrets.

### Blocker 2: CORS

The Crunchbase API (`api.crunchbase.com`) does not set CORS response headers that allow browser-origin requests. Even if you added the domain to your `connect-src` CSP, the browser's CORS preflight (`OPTIONS`) would get rejected by Crunchbase before the actual request even fires. This is a hard protocol-level block, not a configuration issue you can work around.

This is consistent with how virtually all commercial data APIs work — they're designed for server-to-server use.

### Blocker 3: No Runtime Environment Variables

GitHub Pages has no server-side runtime at all. Vercel, Netlify, and Railway all have secret vaults that inject env vars server-side. GitHub Pages has none of this. Even the GitHub Actions deploy step only uses secrets during CI build — they aren't available to the running app.

---

## Part 2 — The Three Paths

### Path A — Migrate to Vercel + Crunchbase API (Recommended for Full Feature)

This is the strongest long-term foundation. The migration itself is ~30 minutes; Vite + React deploys to Vercel with zero config changes.

**What changes:**
- GitHub Pages deployment replaced by Vercel (same GitHub repo, auto-deploys on push to `main`)
- `CRUNCHBASE_API_KEY` lives in Vercel's secure env var vault — never touches the browser
- A thin Vercel serverless function (`/api/investors.ts`) proxies all Crunchbase calls
- The frontend calls `/api/investors?stage=Seed&industry=SaaS` — just your own domain, no exposed key

**Migration steps:**

1. Connect GitHub repo to Vercel at `vercel.com/new`. Build command: `npm run build`, output dir: `dist`. Done.
2. Add `CRUNCHBASE_API_KEY=your_key` in Vercel → Settings → Environment Variables.
3. Remove the `base: '/venturepilot/'` from `vite.config.js` (Vercel serves from root). Update `canonical` and `og:url` in `index.html` to your Vercel/custom domain.
4. Update React Router: switch from hash routing to browser history routing (Vercel handles SPA rewrites natively via a `vercel.json` rewrite rule).
5. Retire the GitHub Actions `deploy.yml` and the `docs/` folder — Vercel handles CI/CD automatically.

**The serverless proxy (`/api/investors.ts`):**

```typescript
// api/investors.ts  (~50 lines, runs on Vercel Edge)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE = 'https://api.crunchbase.com/api/v4';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { industry, stage, geography, minCheck, maxCheck } = req.query;

  const params = new URLSearchParams({
    user_key: process.env.CRUNCHBASE_API_KEY!,
    // filter params shaped to Crunchbase's search API
  });

  const upstream = await fetch(`${BASE}/searches/investors?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      field_ids: ['first_name', 'last_name', 'primary_job_title', 'primary_organization',
                  'investor_stage', 'investor_type', 'num_investments', 'website_url'],
      query: [
        { type: 'predicate', field_id: 'facet_ids', operator_id: 'includes', values: ['investor'] },
      ],
      limit: 25,
    }),
  });

  const data = await upstream.json();

  // Shape + cache-control header so browser caches for 24h
  res.setHeader('Cache-Control', 's-maxage=86400');
  res.status(200).json(shapeInvestors(data));
}
```

**Investor matching algorithm (`src/utils/investorMatch.ts`):**

```typescript
export interface MatchScore {
  investor: Investor;
  score: number;           // 0–100
  reasons: string[];       // ["Stage match: Seed", "Sector: SaaS/AI", ...]
}

export function scoreInvestors(
  investors: Investor[],
  startup: { stage: string; industry: string; targetRaise: number; geography?: string }
): MatchScore[] {
  return investors
    .map(inv => {
      let score = 0;
      const reasons: string[] = [];

      // Stage fit (40 pts)
      if (inv.stages.includes(startup.stage)) { score += 40; reasons.push(`Stage match: ${startup.stage}`); }
      
      // Sector fit (35 pts)
      const sectorOverlap = inv.sectors.filter(s => 
        startup.industry.toLowerCase().includes(s.toLowerCase())
      );
      if (sectorOverlap.length) { score += 35; reasons.push(`Sector: ${sectorOverlap.join(', ')}`); }

      // Check size fit (15 pts)
      if (startup.targetRaise >= inv.checkMin && startup.targetRaise <= inv.checkMax) {
        score += 15; reasons.push('Check size aligned');
      }

      // Geography fit (10 pts)
      if (!startup.geography || inv.geography.includes('Global') || 
          inv.geography.includes(startup.geography)) {
        score += 10; reasons.push('Geography match');
      }

      return { investor: inv, score, reasons };
    })
    .filter(m => m.score >= 40)           // discard poor fits
    .sort((a, b) => b.score - a.score);   // best first
}
```

**Updated InvestorMatch.tsx flow:**

```
User clicks "Find Matching Investors"
  → reads stage/industry/raise from AppState
  → fetch('/api/investors?stage=Seed&industry=SaaS&raise=500000')
  → Vercel function calls Crunchbase server-side
  → returns 25 candidates
  → scoreInvestors() ranks them
  → results render in existing InvestorCard component
  → user clicks "Add to CRM" → dispatch({ type: 'UPSERT_INVESTOR', ... })
  → saved to localStorage as usual
```

**CSP update needed in `index.html`:** Remove `api.crunchbase.com` (no longer needed). The frontend only calls your own domain. No CSP change required.

**Crunchbase pricing note:** The Basic API (free) gives very limited access. The Pro API ($299+/month) has full investor search. For a lean MVP, consider starting with Path B below and migrating to Crunchbase only once you have paying users.

---

### Path B — Stay on GitHub Pages + AI-Powered Static Matching (Fastest to Ship)

No backend required. Fully compatible with GitHub Pages. Ships in a day.

**Approach:** Bundle a curated JSON dataset of ~400 well-known investors. Use the **already-integrated Pollinations AI** (which you already use for pitch deck/strategy generation) to do intelligent matching from the startup's AppState context.

**Dataset file (`src/data/investors.json`):**

```json
[
  {
    "id": "a16z",
    "firm": "Andreessen Horowitz",
    "website": "https://a16z.com",
    "stages": ["Seed", "Series A", "Series B", "Growth"],
    "sectors": ["SaaS", "AI/ML", "Crypto", "Consumer", "Enterprise"],
    "checkMin": 500000,
    "checkMax": 50000000,
    "geography": ["US", "Global"],
    "thesis": "Network effects, viral distribution, winner-take-all markets",
    "portfolio": ["GitHub", "Lyft", "Airbnb", "Coinbase"],
    "partners": ["Marc Andreessen", "Ben Horowitz", "Andrew Chen", "a16z Bio"]
  }
]
```

Build this out to ~400 investors covering Tier 1 VCs, active Tier 2 funds, prolific angels, and notable micro-VCs. This is a one-time 2–3 hour research investment, updated quarterly.

**Matching flow:**

1. User opens `/investors` page, clicks "Find AI Matches"
2. Frontend builds context from `AppState`: stage, industry, `targetRaise`, geography, problem, traction
3. **First pass (local, instant):** Filter `investors.json` by stage range + check size overlap → narrows ~400 → ~40–60 candidates
4. **Second pass (AI):** Send filtered candidates + startup context to Pollinations `chatStreaming()`
5. AI scores each investor 0–100, writes a one-sentence "why this is a fit" blurb per match
6. Results render with match score badges + AI rationale
7. User clicks "Add to CRM" → appended to their existing localStorage investor list

**Prompt to Pollinations (in `src/utils/investorMatch.ts`):**

```typescript
const prompt = `
You are a fundraising analyst. Score each investor for fit with this startup:

STARTUP:
- Stage: ${state.stage}
- Industry: ${state.industry}  
- MRR: $${state.revenue.toLocaleString()} | Growth: ${state.growth}%/mo
- Target raise: $${state.targetRaise.toLocaleString()}
- Problem: ${state.problem}
- Traction: ${state.traction}

CANDIDATES (return a JSON array with id, score 0-100, reason):
${JSON.stringify(candidates.map(i => ({ id: i.id, firm: i.firm, thesis: i.thesis, stages: i.stages, sectors: i.sectors })))}

Return ONLY valid JSON: [{"id":"a16z","score":87,"reason":"Strong SaaS/AI thesis, check size aligned"}]
`;
```

**What you gain:** No API key, no backend, works offline after first load, costs nothing. The dataset is VenturePilot's own moat — it can be curated, community-updated, and differentiated (e.g., add "founder-friendly" tags, warm intro network flags, recent fund vintage).

**What you give up:** Data is as fresh as your last update (quarterly is fine for a seed-stage audience). Coverage is limited to your curated 400 vs. Crunchbase's 500k+.

---

### Path C — CORS-Friendly Data Source (Middle Ground)

If you want live data without a backend, a few options bypass the CORS problem:

**Option C1: Airtable as Investor CMS**
Build a public Airtable base with investor records. Airtable's API returns CORS headers that allow browser requests, and a read-only API token is safe to expose (read-only, no write risk). You maintain the dataset in Airtable's spreadsheet UI; the app fetches on demand.

```typescript
// Safe to expose — read-only Airtable token
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_READ_TOKEN;
const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Investors?filterByFormula=...`, {
  headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
});
```

CSP addition: `connect-src https://api.airtable.com`

**Option C2: Public Google Sheet**
Maintain a public Google Sheet of investors → access via the Sheets API with no auth (public sheets require no key). Parse the response client-side. Google's API is CORS-safe from the browser.

**Option C3: Crunchbase CSV Import**
Crunchbase Pro users can export investor lists as CSV. Add an "Import Crunchbase CSV" button to InvestorMatch.tsx — user downloads their own export from Crunchbase.com and uploads it. Parse client-side with PapaParse (or built-in `FileReader`), map columns to your `Investor` type, run `scoreInvestors()`. Zero API calls, zero cost, Crunchbase data quality.

This is actually a compelling UX for power users: they bring their own data slice from Crunchbase, you provide the intelligence layer.

---

## Part 3 — Crunchbase Alternatives

If Crunchbase's Pro API pricing ($299+/month) doesn't fit the current stage, here are the realistic alternatives:

| Source | Cost | Coverage | CORS OK | Notes |
|--------|------|----------|---------|-------|
| **Crunchbase Pro API** | $299+/mo | ★★★★★ | No (needs proxy) | Best coverage, requires backend |
| **Harmonic.ai** | $49+/mo | ★★★★ | Limited | Growing fast, strong on recent rounds |
| **Dealroom** | Enterprise | ★★★★ | No | Europe-focused, strong there |
| **Tracxn** | Enterprise | ★★★ | No | Good for emerging markets |
| **Pitchbook** | Enterprise | ★★★★★ | No | Most comprehensive but most expensive |
| **AngelList/Wellfound API** | Free | ★★ | Partial | Good for angels + seed, limited VC data |
| **Airtable (custom DB)** | Free–$20/mo | ★★ (curated) | ✅ Yes | You control the data, CORS safe, read token OK to expose |
| **Google Sheets** | Free | ★★ (curated) | ✅ Yes | Simplest to maintain, zero cost |
| **Static JSON bundle** | Free | ★★★ (curated) | N/A | Path B above — no network call at all |

**Recommendation for VenturePilot's current stage:** Start with Path B (static JSON + AI matching). It ships fastest, costs nothing, and is genuinely differentiated from "just querying Crunchbase." When you have paying users justifying the API cost and want richer real-time data, do the Vercel migration and layer in Crunchbase or Harmonic.ai.

---

## Part 4 — Recommended Execution Path

### Phase 1 — Ship Now (Path B, ~1–2 days)

1. Create `src/data/investors.json` — seed with ~400 curated records (VC funds, angels, micro-VCs) covering stages Seed through Series B, major sectors (SaaS, AI, Fintech, Consumer, Health, Dev Tools)
2. Create `src/utils/investorMatch.ts` — local filter + Pollinations AI scoring function
3. Add "Find AI Matches" button + results panel to `InvestorMatch.tsx`
4. Cache results in localStorage for 24 hours (same pattern as `useGitHubStats.ts`)
5. Keep GitHub Pages deployment untouched

**Output:** A differentiated investor matching feature that's live today, free forever, and works offline.

### Phase 2 — Scale Up (Path A, ~1 week, when ready)

1. Migrate deployment from GitHub Pages to Vercel (30 min)
2. Switch to browser routing + add `vercel.json` SPA rewrite
3. Add `/api/investors.ts` Vercel serverless function
4. Connect Crunchbase Pro API (or Harmonic.ai as a cheaper alternative)
5. Replace static JSON with live API results; keep static data as offline fallback
6. Add rate-limit caching (Redis on Vercel KV, or simple in-memory cache)

**Output:** Real-time investor data, auto-refreshed, with your AI matching layer on top.

---

## Part 5 — Files to Create/Modify

### New files
| File | Purpose |
|------|---------|
| `src/data/investors.json` | Curated investor dataset (~400 records) |
| `src/utils/investorMatch.ts` | Filter + AI scoring logic |
| `api/investors.ts` *(Phase 2 only)* | Vercel serverless Crunchbase proxy |
| `vercel.json` *(Phase 2 only)* | SPA rewrite rule + headers |

### Modified files
| File | Change |
|------|--------|
| `src/pages/InvestorMatch.tsx` | Add "Find AI Matches" button + results panel + "Add to CRM" |
| `src/context/AppContext.tsx` | Add `matchResults: MatchScore[]` to state (or keep local to page) |
| `index.html` | *(Phase 2)* Update canonical URL, CSP for new domain |
| `vite.config.js` | *(Phase 2)* Remove `base: '/venturepilot/'` |

### Unchanged
Everything else. The AppContext reducer, localStorage persistence, AI session, routing, all existing pages — none of it needs to change for Phase 1.

---

## Summary

| | Path A (Vercel + Crunchbase) | Path B (Static + AI) | Path C (CORS workaround) |
|--|--|--|--|
| **Ships in** | 1 week | 1–2 days | 2–3 days |
| **Cost** | $0 (Vercel free) + $299/mo Crunchbase | $0 | $0–$20/mo |
| **Data quality** | Live, 500k+ investors | Curated ~400, quarterly updates | Depends on source |
| **GitHub Pages** | No (moves to Vercel) | ✅ Yes | ✅ Yes |
| **Backend needed** | Yes (Vercel function) | No | No |
| **Recommended** | Phase 2 | **Phase 1 — start here** | Niche use |
