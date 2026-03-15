# VenturePilot v2.0 Upgrade TODO

## Completed Steps

- [x] Created upgrade plan and got user approval

## Current Plan Steps (Approved - GH Pages Compatible)

**Goal:** Modernize to React 19/TypeScript/Tailwind/Zustand/PWA while ensuring `npm run deploy` works seamlessly for GH Pages (/venturepilot/).

1. ~~✅ Plan/approval~~
2. ~~✅ Update package.json: React 19, Tailwind, Zustand, TypeScript, ESLint/Prettier, Vite PWA. `npm i` + `npm audit fix`.~~
3. ~~✅ Config files: tsconfig.json, tailwind.config.js, postcss.config.js, .eslintrc.cjs, .prettierrc, vite.config update (base: '/venturepilot/', PWA plugin). React 19 RC, npm install done, lint:format running, 9 vulns noted.~~
4. **Styling migration:** Tailwind setup + migrate index.css. Extract inline styles to classes iteratively.
5. **TypeScript conversion:** Rename .jsx→.tsx, add types/interfaces, strict mode.
6. **State refactor:** AppContext → Zustand store (useAppStore.ts).
7. **Core components:** Update App.tsx, Layout.tsx, InputSidebar.tsx, Shared.tsx (Tailwind + types).
8. **Pages migration:** Dashboard.tsx, InvestorMatch.tsx, PitchDeck.tsx, etc. (Tailwind, memo, responsive).
9. **New features:** Theme toggle (dark/light), PWA manifest, URL sharing (searchParams).
10. **Quality:** ESLint/Prettier format all, basic Vitest utils, error boundaries.
11. **Test/Polish:** `npm run dev` (localhost:5173), full feature test (persistence/export/charts), `npm run build && npm run preview`.
12. **Deploy:** `npm run deploy` → verify https://nessgelman.github.io/venturepilot/ works perfectly.
13. **Final:** Bump v2.0.0, update README.md, attempt_completion.

## Next Action

**Step 3:** Run `npm install && npm audit fix && npm run lint:fix && npm run format`. Verify no errors.

**Progress:** 2/13 complete. All changes preserve `base: '/venturepilot/'` for seamless GH Pages deploys.
