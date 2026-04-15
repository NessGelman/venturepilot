# Investor Discovery Feature — Implementation Plan

## Overview

Add a **Discover** tab to the existing `/investors` page. It surfaces real VCs ranked by
how well they match the user's startup profile (industry, stage, raise size, product description).
Matching uses a deterministic weighted-scoring engine with structured tag display — no AI call needed.

Everything runs 100% client-side. No backend, no API keys. Fully compatible with GitHub Pages.

---

## 1. Data Strategy

### Why no live API
No free VC data API is CORS-enabled and unauthenticated. Crunchbase, PitchBook, Mattermark all
require keys — which can't be safely embedded in a public static site. The right approach for
GitHub Pages is a **curated static JSON file** committed to the repo.

### The file: `public/investors-db.json`
A hand-curated list of ~200 real investors served from GitHub Pages at:
`https://nessgelman.github.io/venturepilot/investors-db.json`

Fetched once on mount, cached in `sessionStorage` so it only loads once per browser session.

### What's in it — per investor record

```jsonc
{
  "id": "elad-gil",
  "name": "Elad Gil",
  "firm": "Elad Gil / Angel",
  "title": "Angel Investor & Advisor",
  "tier": "Angel",

  // Contact & presence
  "linkedin": "https://www.linkedin.com/in/eladgil/",
  "twitter": "https://twitter.com/eladgil",
  "website": "https://blog.eladgil.com",
  "email": null,                       // only included if publicly listed on their site
  "contactForm": "https://eladgil.com/contact",

  // Investment profile
  "sectors": ["AI/ML", "SaaS", "Infrastructure", "Biotech", "Fintech"],
  "stages": ["Pre-Seed", "Seed", "Series A"],
  "geographies": ["US", "Global"],
  "checkSizeMin": 500000,              // in USD
  "checkSizeMax": 5000000,

  // For matching
  "portfolioKeywords": ["airbnb", "coinbase", "stripe", "instacart", "square", "pinterest"],
  "thesisKeywords": ["high-growth", "marketplace", "network-effects", "b2b-saas", "developer"],

  // Display
  "bio": "Author of the High Growth Handbook. Invested in Airbnb, Coinbase, Stripe at early stages.",
  "notablePortfolio": ["Airbnb", "Coinbase", "Stripe", "Instacart"],
  "boardMember": false
}
```

### Coverage plan (~200 investors across 8 categories)

| Category | Count | Examples |
|---|---|---|
| Tier 1 VC partners | 40 | a16z, Sequoia, Benchmark, Greylock, Bessemer |
| Growth / Multi-stage | 20 | Tiger Global, Coatue, General Catalyst |
| Specialist (AI/ML) | 25 | AIX Ventures, Radical Ventures, Theory Ventures |
| Specialist (Fintech) | 20 | Ribbit Capital, QED Investors, Nyca Partners |
| Specialist (B2B SaaS) | 20 | Craft Ventures, Accel, Insight Partners |
| Specialist (Dev Tools / Infra) | 15 | Heavybit, boldstart, Work-Bench |
| Micro VC / Pre-Seed | 30 | Hustle Fund, Precursor, Pear VC |
| Notable Angels | 30 | Elad Gil, Naval Ravikant, Lenny Rachitsky, etc. |

### LinkedIn URLs
All 200 records include real LinkedIn profile URLs sourced from public firm websites and
professional profiles. Email is only included when explicitly published on the investor's own
site or firm bio page.

### Updating the database
The JSON file is version-controlled. To add investors: edit `public/investors-db.json` and redeploy.
No code changes required. A GitHub Action could automate periodic refreshes if desired later.

---

## 2. Matching Engine

### File: `src/utils/investorMatch.ts`

A pure TypeScript function — no network calls, runs in ~5ms for 200 records.

```ts
scoreInvestor(investor: InvestorDBRecord, profile: StartupProfile): MatchResult
```

Where `StartupProfile` is derived from `AppState`:
```ts
interface StartupProfile {
  industry: string;        // e.g. "B2B SaaS"
  stage: string;           // e.g. "Seed"
  targetRaise: number;     // e.g. 2000000
  idea: string;            // free text
  productDescription: string;
  competitors: string;
  traction: string;
}
```

### Scoring weights (total = 100 points)

| Signal | Weight | Logic |
|---|---|---|
| **Sector match** | 40 pts | User's `industry` tags vs. investor's `sectors[]`. Exact match = 40, partial = 20, none = 0. |
| **Stage alignment** | 25 pts | User's `stage` in investor's `stages[]`. Exact = 25, adjacent stage = 12, miss = 0. |
| **Check size fit** | 20 pts | `targetRaise` within `checkSizeMin`–`checkSizeMax` = 20. Within 2× = 10. Outside = 0. |
| **Keyword overlap** | 15 pts | `idea + productDescription + competitors` tokenized against `thesisKeywords[]`. 3 pts per match, cap 15. |

Score range: 0–100. Displayed as a colored badge (≥75 = green, 50–74 = amber, <50 = gray).

### Match tag generation

For each investor, generate 2–4 structured tags explaining the score:

```ts
// Example output for a B2B SaaS / Seed / $2M raise:
tags: [
  { label: "Invests in B2B SaaS", type: "sector", matched: true },
  { label: "Seed stage",          type: "stage",  matched: true },
  { label: "$1M–$5M checks",      type: "check",  matched: true },
  { label: "Network effects",     type: "thesis", matched: false }  // gray, not matched
]
```

These replace the AI rationale — instant, deterministic, always accurate.

---

## 3. UI — Discovery Tab

### Tab structure (inside existing `InvestorMatch.tsx`)

```
[ Pipeline ]  [ Discover ]          ← tab toggle, top of page
```

`Pipeline` = existing CRM (unchanged)
`Discover` = new section

### Discover tab layout

```
┌─────────────────────────────────────────────────────┐
│  Matching against: "VenturePilot · Seed · B2B SaaS  │
│  · $2M raise"                      [Refresh matches] │
├──────────────────┬──────────────────────────────────┤
│  Filters         │  Results (ranked by match score)  │
│  ─────────────── │                                   │
│  Stage           │  [Card] [Card] [Card]              │
│  Sector          │  [Card] [Card] [Card]              │
│  Check size      │  ...                               │
│  Geography       │                                   │
│  Tier            │                                   │
└──────────────────┴──────────────────────────────────┘
```

### Investor discovery card

Each card shows:
- Name, firm, title, tier badge
- Match score (colored, prominent)
- Match tags (2–4 structured chips, green = matched, gray = not)
- Notable portfolio (3 logos / names)
- Check size range
- 3 action buttons:
  - `LinkedIn` → opens `investor.linkedin` in new tab
  - `Website` → opens firm site or contact form
  - `+ Add to Pipeline` → calls `upsertInvestor()`, switches to Pipeline tab, shows toast

### "Profile changed" nudge

If user edits `industry`, `stage`, or `targetRaise` in the InputSidebar while on the Discover tab,
show a subtle banner: *"Your profile changed — refresh matches"* with a one-click refresh button.

### Empty / loading states

- **Loading**: skeleton cards while `investors-db.json` fetches (one-time, ~50KB)
- **No results**: "No investors match your current filters — try broadening your sector or stage"
- **No profile**: "Add your industry and stage in the sidebar to see personalized matches"

---

## 4. Files to Create / Modify

### New files

| File | Purpose |
|---|---|
| `public/investors-db.json` | ~200 investor records (the database) |
| `src/utils/investorMatch.ts` | Scoring engine + tag generator |
| `src/hooks/useInvestorDB.ts` | Fetch + cache `investors-db.json`, expose loading state |

### Modified files

| File | Change |
|---|---|
| `src/pages/InvestorMatch.tsx` | Add tab toggle, import/render new `DiscoverTab` component |
| `index.html` | Ensure `https://nessgelman.github.io` is in CSP (for the JSON fetch — likely already fine since same origin) |

The `DiscoverTab` component lives inside `InvestorMatch.tsx` to avoid a new route.

---

## 5. Build Order

1. **`public/investors-db.json`** — write the 200-record database with real names, LinkedIn URLs, sectors, stages, check sizes
2. **`src/utils/investorMatch.ts`** — scoring function + tag generator, with unit-testable pure functions
3. **`src/hooks/useInvestorDB.ts`** — fetch hook with sessionStorage cache
4. **`DiscoverTab` component** — filter panel + card grid, wired to the scoring engine
5. **Tab toggle in `InvestorMatch.tsx`** — add the two-tab header, lazy-load DiscoverTab
6. **Smoke test** — load the page, verify matches update when sidebar inputs change

---

## 6. Scope Not Included (future ideas)

- Email finder integration (Hunter.io) — needs a user-supplied API key
- "Request intro" workflow — would need a backend or mailto: fallback
- Community-contributed investor additions — GitHub PR flow or Airtable embed
- Saved searches / alerts — straightforward addition to localStorage later
