# VenturePilot v2.0.0 Refactor TODO

## Phase 1: Critical Fixes (Styling + Responsive) ✅ 80% COMPLETE
- [x] Standardize all styling to Tailwind (remove inline style={{}})
  - Dashboard.jsx (header, grids responsive, profile/alerts/snapshots)
  - InputSidebar.jsx (fix broken textarea)
  - Layout.jsx
  - Shared.jsx (Card/StatCard/SectionHeader)
- [x] Navbar hamburger menu (Layout.jsx)
- [x] Monte Carlo useMemo in Dashboard.jsx
- [x] Dynamic capitalStack in Dashboard.jsx (factors stage/runway/ltv/readiness)

## Phase 1 COMPLETE ✅
- [x] Final Dashboard styling (AI insights, pie legend, all grids responsive)
- [x] Navbar hamburger menu
- [x] Monte Carlo useMemo + dynamic capitalStack

## Phase 2: AppContext Refactor + TypeScript Migration
- [ ] Create types/AppContext.types.ts (State interface)
- [ ] Refactor AppContext.jsx → AppContext.tsx (useReducer, typed, derivedMemo, sessionStorage undo)
- [ ] Migrate App.jsx → App.tsx + create PageLoader.tsx for Suspense
- [ ] Rename components/*.jsx → .tsx + add Prop types
- [ ] Rename pages/*.jsx → .tsx + add Prop types
- [ ] `npm run type-check` + fix

## Phase 3: Remaining
- [ ] InvestorMatch dynamic investors + match score
- [ ] Enhancements A-D

## Phase 2: AppContext Refactor + TypeScript Migration
- [ ] Refactor AppContext.jsx → AppContext.tsx (useReducer, typed State/Actions, useDerivedMetrics)
- [ ] Rename/convert ALL .jsx → .tsx with types (App.tsx, all pages/components)
- [ ] Update ESLint/Vite configs if needed

## Phase 3: Polish + Enhancements
- [ ] Remove dead UI (Log In/Get Started buttons, footer href="#")
- [ ] PageLoader.tsx for Suspense fallback
- [ ] InvestorMatch: Dynamic filtering + match scores
- [ ] Enhancements A-D: sessionStorage undo, Scenario Compare table, shortcuts panel, react-hook-form validation

## Post-Edit Validation
- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Test mobile/undo/redo/charts
- [ ] `npm run preview` for demo

