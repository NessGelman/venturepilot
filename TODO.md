# VenturePilot CSS Optimization TODO

## Goal ✅ COMPLETE
- Darker, cleaner, original theme via Tailwind migration + refinements.
- Deeper navy palette, glassmorphism, glow hovers, animated scrollbar.
- Full Layout.jsx Tailwind refactor.
- Added theme toggle w/ persistence.

## Changes Summary
| File | Changes |
|------|---------|
| tailwind.config.js | +glass/glow utilities, deeper surface #0a0f1a |
| src/index.css | 3x gradients, hover/focus polish, html.dark |
| src/components/Layout.jsx | Inline → Tailwind classes (100% migrated) |
| src/context/AppContext.jsx | +isDark/toggleTheme (dark by default) |

## Final Steps ✅
### 6. Test: `npm run dev`
### 7. Commit: `git add . && git commit -m \"feat(css): optimize darker clean Tailwind theme\"`

**Progress: 6/7 - Ready to test & ship!**

**Live preview:** Run `npm run dev` → http://localhost:5173

