# Stack Research

**Domain:** Firefox browser extension — new tab page replacement, local-only book tracker
**Researched:** 2026-02-25
**Confidence:** HIGH (all core decisions verified against official Mozilla docs and npm registry)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Manifest V3 | 3 | Extension manifest format | GA in Firefox since v109; the forward standard. MV2 still works but MV3 is where Mozilla's docs now point. Firefox MV3 intentionally diverges from Chrome (keeps event pages instead of service workers, keeps `browser.*` promises). No reason to start new projects on MV2. |
| TypeScript | 5.9.3 | Type-safe JavaScript | `@types/webextension-polyfill` gives you typed `browser.*` APIs — catches storage shape mistakes at compile time, which matters when data structure is the entire app. |
| Vite | 7.3.1 | Build tool | Multi-entry bundling (one entry per extension page), fast HMR in dev, first-class TypeScript support, ESM output. Extension pages are separate HTML entrypoints — Vite handles this pattern naturally. |
| `vite-plugin-web-extension` | 4.5.0 | Extension-aware Vite plugin | Reads `manifest.json` as build config, auto-discovers HTML/JS entrypoints, runs `web-ext` for live reload during dev, produces correct output structure. Supports Vite 4–7 and both MV2/MV3. This eliminates the complex manual Vite config that extension multi-entry would otherwise require. |
| `webextension-polyfill` | 0.12.0 | Promise-based `browser.*` API | Firefox's native `browser.*` API already returns Promises — this polyfill is included by `vite-plugin-web-extension` as a peer dep and adds cross-browser safety. Use `browser.*` everywhere, never `chrome.*`. |

### Browser APIs (No External Libraries)

| API | Purpose | Notes |
|-----|---------|-------|
| `browser.storage.local` | Persist all book data | Quota: IndexedDB limits (~unlimited in practice for personal data). Add `"unlimitedStorage"` permission to be safe. Never use `window.localStorage` in extensions — Firefox clears it on privacy wipes. |
| `chrome_url_overrides.newtab` | Replace new tab page | Manifest key, confirmed working MV2+MV3. The HTML file is bundled with the extension — no remote URLs allowed. |
| Fetch API | Book metadata lookups (Open Library / Google Books) | Available in extension pages. Requires `host_permissions` in the manifest for external domains. |

### UI Approach

**Recommendation: Vanilla TypeScript + CSS (no UI framework)**

Rationale: The PROJECT.md constraint is "clean and minimal — no heavy frameworks if avoidable." This is a single-page new tab — no routing, no complex component tree, no server state. The UI is a handful of views (current read, queue, book detail, history). Vanilla TS with a small hand-rolled view switcher is faster to load, simpler to debug in extension devtools, and produces smaller bundles (important for extension review). If you want reactive binding, use a lightweight reactive library (see below) rather than React/Vue.

**If you want reactivity without a framework:**

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Preact | 10.x | Minimal React-compatible UI | If UI grows complex enough to need components; ~3KB vs React 45KB |
| `@preact/signals` | 1.x | Fine-grained reactivity | If you need reactive state without a full component model |

**Verdict:** Start vanilla. Add Preact only if the UI complexity justifies it. The PROJECT.md says "no heavy frameworks if avoidable" — take that seriously.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/webextension-polyfill` | 0.12.5 | TypeScript types for `browser.*` | Always — gives typed `browser.storage.local.get/set` |
| `web-ext` | 9.3.0 | CLI: run, lint, build, sign | Dev workflow; `vite-plugin-web-extension` wraps it internally, but install separately for `npx web-ext lint` and signing |
| `zod` | 3.x | Runtime schema validation | For validating imported JSON files — a badly-shaped import can corrupt storage. Validate at the import boundary. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `web-ext` CLI | Live reload in Firefox, linting, packaging | `web-ext run` auto-reloads on file changes. `web-ext lint` catches manifest errors before AMO submission. |
| Firefox DevTools | Debug extension pages | Open `about:debugging` → "This Firefox" → Inspect the extension's pages. Background scripts also inspectable here. |
| `addons-linter` | Validate before submission | Bundled inside `web-ext lint`. Catches MV3-incompatible patterns, policy violations. |
| TypeScript strict mode | Catch bugs early | Set `"strict": true` in `tsconfig.json`. Extension storage is untyped by default — TypeScript + Zod at boundaries is your safety net. |

---

## Installation

```bash
# Core project setup
npm create vite@latest booktab -- --template vanilla-ts

# Install Vite extension plugin and browser API polyfill
npm install webextension-polyfill
npm install -D vite-plugin-web-extension

# TypeScript types for browser APIs
npm install -D @types/webextension-polyfill

# Runtime validation (for JSON import)
npm install zod

# Dev/build/lint/sign CLI
npm install -D web-ext

# TypeScript (usually included by Vite template, verify version)
npm install -D typescript@^5.9.0
```

---

## Manifest V3 Key Specifics for This Project

```json
{
  "manifest_version": 3,
  "name": "BookTab",
  "version": "1.0.0",
  "chrome_url_overrides": {
    "newtab": "src/newtab/index.html"
  },
  "permissions": [
    "storage",
    "unlimitedStorage"
  ],
  "host_permissions": [
    "https://openlibrary.org/*",
    "https://www.googleapis.com/*"
  ],
  "browser_specific_settings": {
    "gecko": {
      "id": "booktab@yourdomain.com",
      "strict_min_version": "109.0"
    }
  }
}
```

**Notes:**
- `browser_specific_settings.gecko.id` is required for `web-ext sign` and persistent storage in development profiles
- `strict_min_version: "109.0"` = when Firefox MV3 became GA (Feb 2023); any current Firefox will exceed this
- `unlimitedStorage` prevents quota errors for users with large libraries / long notes
- No `background` needed for this app — all logic runs in the new tab page itself

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| MV3 | MV2 | Only if you need to support Firefox < 109 (rare, outdated) |
| Vanilla TS | React | Only if UI complexity requires a component ecosystem (not the case here) |
| Vanilla TS | Vue 3 | Same — overkill for a single-page extension with no routing |
| `vite-plugin-web-extension` | Webpack + web-ext-webpack-plugin | If your team is Webpack-only; Vite is faster, simpler, and officially recommended by Mozilla Extension Workshop tooling docs |
| `browser.storage.local` | IndexedDB directly | Only if you exceed storage.local's API capabilities (you won't — books + notes fit comfortably) |
| `zod` | `ajv` | If you need JSON Schema validation instead of TypeScript-first; for this project Zod's TypeScript integration is cleaner |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `window.localStorage` | Firefox clears it during privacy/history wipes, even though it's "accessible" in extension pages. MDN explicitly warns against this. | `browser.storage.local` |
| `chrome.*` namespace | Callbacks-based; inconsistent with Firefox's Promise-based `browser.*` API; creates maintenance burden. | `browser.*` namespace via webextension-polyfill |
| React | 45KB+ runtime is heavy for an extension page that loads on every new tab; adds complexity for no gain at this scale. | Vanilla TS, or Preact if reactivity needed |
| Remote scripts / CDN links | Blocked by MV3's CSP — `'self'` only in script-src. AMO also flags them. | Bundle everything. Vite handles this. |
| `eval()` or dynamic code execution | Banned in MV3 CSP. `addons-linter` will reject the extension. | Static imports only |
| Persistent background page | Removed in MV3. Firefox uses event pages (non-persistent) instead. | Either no background at all (this app doesn't need one) or an event page |
| Service workers as background | Chrome's MV3 approach — Firefox MV3 uses event pages, not service workers, for background scripts. Don't follow Chrome tutorials blindly. | Firefox event page background (or no background) |

---

## Stack Patterns by Variant

**If UI stays simple (recommended):**
- Vanilla TypeScript, plain CSS, no framework
- One HTML page (`newtab/index.html`), hand-rolled view switcher
- All storage access direct via `browser.storage.local`

**If UI grows complex (Preact path):**
- Add `preact` + `@preact/signals` for reactive state
- Keep same build setup — `vite-plugin-web-extension` handles any framework
- Still no router — just conditional rendering per view state

**If you want Open Library search (recommended over Google Books):**
- No API key required, open access
- `host_permissions`: `"https://openlibrary.org/*"`
- Fallback: manual entry form (already in requirements)

---

## Firefox-Specific Nuances

1. **MV3 vs Chrome MV3 are different.** Firefox MV3 keeps event pages (not service workers), keeps `browser.*` promises natively, and has a more relaxed CSP than Chrome. Do not follow Chrome extension tutorials verbatim.

2. **`browser.*` is native in Firefox — always prefer it.** The webextension-polyfill is belt-and-suspenders for future cross-browser compatibility, but Firefox already exposes the full Promise-based `browser.*` API.

3. **Extension ID matters.** Without `browser_specific_settings.gecko.id`, Firefox assigns a random ID each time you temporarily install — this resets storage in development. Set a stable ID early.

4. **Temporary installs vs signed installs.** During development via `web-ext run`, the extension is unsigned (OK). For distribution, Firefox requires AMO signing unless self-distributing. `web-ext sign` handles AMO upload and returns a signed `.xpi`.

5. **New tab override requires user confirmation.** When installed from AMO, Firefox may prompt the user to confirm the new tab override. This is expected behavior — not a bug.

6. **storage.local is IndexedDB-backed in Firefox**, not localStorage. Data survives browser restarts and privacy wipes (unlike `window.localStorage` in extension contexts).

7. **No `browser_style` in MV3.** The manifest key was deprecated in MV3 — don't use it. Style the extension yourself.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `vite-plugin-web-extension@4.5.0` | `vite@^4\|^5\|^6\|^7` | All current Vite | Explicitly supports Vite 4–7 per package.json |
| `webextension-polyfill@0.12.0` | Firefox 109+ | Firefox MV3 | Current as of Feb 2026 |
| `@types/webextension-polyfill@0.12.5` | TypeScript 5.2+ | Latest TS 5.9 | DefinitelyTyped, maintained |
| `web-ext@9.3.0` | Node ≥18 | Current LTS (Node 20/22) | Requires Node 18+ |
| `vite@7.3.1` | Node ≥20.19 or ≥22.12 | Current LTS | Vite 7 requires newer Node — use Node 20 LTS |
| `typescript@5.9.3` | Node ≥14.17 | All | Latest stable |

---

## Sources

- **MDN — `chrome_url_overrides`** (last modified Jul 17, 2025) — Confirms MV2+MV3 support for new tab override: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides — HIGH confidence
- **MDN — `manifest_version`** (last modified Jul 17, 2025) — MV3 is current standard: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/manifest_version — HIGH confidence
- **MDN — `storage.local`** (last modified Aug 1, 2025) — Confirmed IndexedDB-backed, warning against localStorage: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local — HIGH confidence
- **Firefox Extension Workshop — MV3 Migration Guide** — MV3 GA in Firefox 109, event pages (not service workers), confirmed divergence from Chrome: https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/ — HIGH confidence
- **Context7 — `/mozilla/webextension-polyfill`** — Promise-based browser.* storage usage patterns — HIGH confidence
- **Context7 — `/mozilla/web-ext`** — CLI usage for run/build/sign workflows — HIGH confidence
- **Context7 — `/aklinker1/vite-plugin-web-extension`** — Multi-browser manifest template, Vite config for extensions — HIGH confidence
- **npm registry — `webextension-polyfill@0.12.0`** — Verified current version Feb 2026 — HIGH confidence
- **npm registry — `web-ext@9.3.0`** — Verified current version Feb 2026 — HIGH confidence
- **npm registry — `vite-plugin-web-extension@4.5.0`** — Verified current version Feb 2026 — HIGH confidence
- **npm registry — `vite@7.3.1`** — Verified current version Feb 2026 — HIGH confidence
- **npm registry — `typescript@5.9.3`** — Verified current version Feb 2026 — HIGH confidence
- **npm registry — `@types/webextension-polyfill@0.12.5`** — Verified current version Feb 2026 — HIGH confidence

---

*Stack research for: Firefox new tab extension book tracker (BookTab)*
*Researched: 2026-02-25*
