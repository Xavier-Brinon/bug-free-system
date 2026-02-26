---
phase: 02-extension-scaffold
plan: "02"
status: complete
completed: "2026-02-26"
---

## Summary

Plan 02-02 created the Firefox extension shell — manifest, Vite build pipeline, and minimal React app — so the extension loads as the new tab page.

### Tasks Completed

1. **manifest.json** — Created MV3 manifest at project root with `chrome_url_overrides.newtab` pointing to `src/newtab/index.html`, `storage` + `unlimitedStorage` permissions, host permissions for `openlibrary.org` and `covers.openlibrary.org`, gecko ID and strict_min_version 109.0.

2. **Vite config with vite-plugin-web-extension** — Created `vite.config.ts` with `@vitejs/plugin-react` and `vite-plugin-web-extension` plugins. Installed `@vitejs/plugin-react` as devDependency. Vitest continues to work with the existing `vitest.config.ts` — no conflicts.

3. **src/newtab/ files** — Created `index.html` (CSP-safe, no inline JS), `main.tsx` (React entry point), `App.tsx` (minimal placeholder component), `App.css` (basic centered layout styling).

4. **Build scripts and verification** — Added `build`, `dev`, `lint:ext` scripts to package.json. `npm run build` produces `dist/` with bundled extension files. `web-ext lint --source-dir dist` passes with zero errors/warnings.

### Requirements Satisfied

- CORE-01: Extension replaces Firefox new tab via chrome_url_overrides.newtab
- CORE-02: All scripts CSP-safe — no inline JS, no CDN scripts, everything bundled by Vite

### Files Created

- `manifest.json`
- `vite.config.ts`
- `src/newtab/index.html`
- `src/newtab/main.tsx`
- `src/newtab/App.tsx`
- `src/newtab/App.css`

### Files Modified

- `package.json` (build/dev/lint:ext scripts, @vitejs/plugin-react dep)

### Verification

- `npm run build` exits 0, produces dist/ with manifest.json + index.html + JS + CSS
- `web-ext lint --source-dir dist` reports zero errors and zero CSP warnings
- `npm run test` still passes (no test files)
- `npm run lint` passes (0 warnings, 0 errors)
- `npm run fmt:check` passes
- No inline JS or inline event handlers in index.html
- Extension can be manually loaded in Firefox via about:debugging

### Deviations

None.
