# GitHub Pages Node.js Deprecation Fix TODO

## Approved Plan Steps:
- [x] 1. Update package.json: Downgrade React/react-dom to stable 18.3.1, add "engines": {"node": ">=20.0.0"}
- [x] 2. Run `npm install` to update dependencies and lockfile
- [x] 3. Run `npm run lint:fix && npm run format` to clean code

- [x] 4. Run `npm run build` to verify no issues
- [x] 5. Kill preview if running (`Ctrl+C`), then `npm run preview` to test dist/
- [x] 6. Run `npm run deploy` to update GitHub Pages gh-pages branch
- [ ] 7. Verify https://nessgelman.github.io/venturepilot loads without deprecation warnings in console
- [x] Previous steps (tsconfig, vite.config, initial build/preview) completed
