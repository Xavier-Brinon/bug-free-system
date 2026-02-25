# Pitfalls Research

**Domain:** Firefox browser extension / new tab book tracker
**Researched:** 2026-02-25
**Confidence:** HIGH (all critical pitfalls verified against official MDN documentation and Open Library API docs)

---

## Critical Pitfalls

### Pitfall 1: Inline JavaScript and eval() Silently Blocked by CSP

**What goes wrong:**
The extension UI renders blank or partially broken with no visible error. Event handlers like `onclick="doThing()"` in HTML do nothing. CDN-loaded scripts like `<script src="https://cdn.jsdelivr.net/...">` are silently dropped. Developers spend hours debugging "why isn't my button working?"

**Why it happens:**
Firefox extensions have a strict default Content Security Policy applied to all extension pages (including the new tab override):
- **MV2 default:** `"script-src 'self'; object-src 'self';"`
- **MV3 default:** `"script-src 'self'; upgrade-insecure-requests;"`

This means: no inline `<script>` blocks, no inline event handlers (`onclick`, `onload`), no `eval()`, `setTimeout("string")`, or `new Function("...")`, and no remote CDN scripts. All of these fail **silently** in many cases — no console error on the extension page itself unless you open the extension's background inspector.

**How to avoid:**
- All JavaScript must be in `.js` files bundled with the extension and loaded via `<script src="./newtab.js">`.
- All event handlers must be attached via `addEventListener()` in JS, never inline HTML attributes.
- No CDN scripts — bundle everything. Vendor dependencies (if used) must be bundled locally.
- Never use `eval()`, `setTimeout` with string argument, or `new Function()`.
- Test immediately after scaffolding: open browser console for the new tab page (`about:debugging`) and verify no CSP violations.

**Warning signs:**
- Clicking buttons does nothing with no console error on the page.
- Scripts that work in a regular HTML page don't work in the extension.
- Loading a CDN script appears to succeed in editor but book search does nothing.

**Phase to address:** Phase 1 (scaffolding/foundation). Must be established before writing any feature code.

---

### Pitfall 2: Using `window.localStorage` Instead of `browser.storage.local`

**What goes wrong:**
Data stored with `localStorage` gets silently wiped when the user clears browser history, cookies, or site data — even though the extension is not a "site." The user loses their entire book library. This is documented behavior: Firefox intentionally treats `localStorage` in extensions as associated with browsing data and clears it alongside site data.

**Why it happens:**
`localStorage` is familiar, synchronous, and works in extension pages during development. It seems equivalent. But MDN explicitly warns: "Firefox clears data stored by extensions using the localStorage API in various scenarios where users clear their browsing history and data for privacy reasons." `browser.storage.local` is correctly persisted in those scenarios.

**How to avoid:**
Use `browser.storage.local` exclusively. It:
- Persists correctly through history/cookie clears
- Requires the `"storage"` permission in manifest.json
- Is async (returns Promises) — plan for this in all data access code
- Has quota subject to IndexedDB limits (see Pitfall 3), but is stable

**Warning signs:**
- Using `localStorage.setItem()` anywhere in extension code.
- Failing to declare `"storage"` in manifest permissions (causes silent failures).
- Storage calls that appear synchronous (they aren't with `browser.storage.local`).

**Phase to address:** Phase 1 (data layer). Must be the first storage decision made — retrofitting is expensive.

---

### Pitfall 3: Storing Large Text (Notes/Reviews) Without Monitoring Storage Quota

**What goes wrong:**
For a book tracker with rich notes and reviews, `browser.storage.local` data can grow. Firefox imposes a quota based on IndexedDB limits (10% of total disk size or 10 GiB in best-effort mode). Individual `storage.local.set()` calls that exceed the quota throw a `QuotaExceededError` — if uncaught, this silently drops the save and the user loses their notes.

More subtly: `browser.storage.local` has an implied per-item size consideration. While Firefox doesn't impose a per-key limit like Chrome (Chrome caps each item at ~8KB in `storage.sync`), stuffing massive JSON blobs into a single key degrades get/set performance and risks silent truncation on slow devices.

**Why it happens:**
Developers test with small data sets (5 books, short notes). The storage works fine. A power user with 500 books and multi-page reviews hits issues only after months of use, when debugging is hard.

**How to avoid:**
- Wrap all `browser.storage.local.set()` calls in try/catch and surface errors to the user ("Could not save — storage full").
- Structure data with books as individual storage keys (e.g., `book_${id}`) rather than one giant `books[]` array. This enables partial reads and avoids re-writing the entire dataset on every change.
- For notes/reviews specifically: consider storing them in separate keys from book metadata to allow independent access.
- Use `browser.storage.local.getBytesInUse()` to monitor quota during development.
- If heavy notes usage is expected: use `"unlimitedStorage"` permission (note: this permission may reduce user trust and requires justification on AMO).

**Warning signs:**
- All books stored under a single `"books"` key as a giant JSON array.
- No error handling on `storage.local.set()` calls.
- `getBytesInUse()` never called during testing.

**Phase to address:** Phase 1 (data schema design). Structural decisions here are hard to change later.

---

### Pitfall 4: Book Search API CORS — Not Actually a Problem for Extensions (But Easily Misunderstood)

**What goes wrong:**
Developers read about CORS, assume external API calls from extensions require complex workarounds, implement convoluted background-script message-passing, or give up and bundle no search at all.

**Why it happens:**
CORS restrictions apply to regular web pages. In a Firefox extension, declaring a host permission in the manifest grants the extension cross-origin `fetch()` access to that origin — CORS is bypassed for extension pages. This is not widely understood.

For MV2:
```json
"permissions": ["*://openlibrary.org/*"]
```

For MV3:
```json
"host_permissions": ["*://openlibrary.org/*"]
```

Once declared, `fetch("https://openlibrary.org/search.json?q=...")` from the new tab page works without CORS issues.

**The real problem:** Not declaring the host permission — which causes the request to fail with a CORS error even though the fix is trivial.

**How to avoid:**
- Declare all required API origins in `permissions` (MV2) or `host_permissions` (MV3) from day one.
- For Open Library: `"*://openlibrary.org/*"` and `"*://covers.openlibrary.org/*"` (for cover images).
- For Google Books: `"*://www.googleapis.com/*"` (requires an API key embedded in the extension — see security pitfall below).
- Test API fetch from the extension page directly (not from a background script unless needed).

**Warning signs:**
- CORS errors in extension page console despite no page-level CORS restrictions.
- Missing `permissions` or `host_permissions` for external APIs.
- API calls routed through background script for no architectural reason.

**Phase to address:** Phase 2 (book search feature). Manifest permissions must be added before writing the search code.

---

### Pitfall 5: Google Books API Key Exposed in Extension Source Code

**What goes wrong:**
If Google Books is chosen as the book search API, it requires an API key. Browser extensions are distributed as ZIP files that users can unzip — any API key in the source is publicly visible. A scraped key gets abused, exceeds quota limits, or gets revoked, breaking the extension for all users.

**Why it happens:**
Web developers are accustomed to keeping API keys in `.env` files. Extensions have no equivalent — there's no server-side to hide keys behind, and the extension package is fully readable.

**How to avoid:**
Use **Open Library instead** — it's free, has no API key requirement, and supports the project's offline-first/no-backend philosophy. Open Library's search API (`https://openlibrary.org/search.json`) works without authentication. Rate limits are generous for a single-user tool (3 req/sec with `User-Agent` header).

If Google Books is chosen anyway: accept that the key is exposed, restrict the key in Google Cloud Console to specific referrers (though this is imperfect for extensions), and set a billing quota ceiling.

**Warning signs:**
- Any `apiKey`, `api_key`, or `GOOGLE_API_KEY` string in the extension source files.
- Using Google Books when Open Library covers the use case.

**Phase to address:** Phase 2 (book search). API choice must be made before search is implemented.

---

### Pitfall 6: Flat Storage Schema That Makes Import/Export Fragile

**What goes wrong:**
The extension stores all data in a single large JSON object or array. When the schema evolves (new fields like `queueNote`, `tags`, `readDate`), imported data from older exports breaks because required fields are missing. The import silently discards or crashes on old data. Users who export → import (the primary backup mechanism) lose notes.

**Why it happens:**
Developers design schema for current features without versioning. Import code assumes the latest schema. When the schema changes in v2 of the extension, v1 exports become invalid.

**How to avoid:**
- Embed a `schemaVersion: 1` field in the root of every export file from day one.
- Write an import migration layer: `migrate(data, fromVersion, toVersion)` that transforms old schemas to current.
- Use sensible defaults when fields are missing — never crash on missing optional fields.
- Test import with a v1 export every time the schema changes.
- Canonical schema example:
```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-02-25T...",
  "books": [
    {
      "id": "uuid",
      "title": "...",
      "status": "reading",
      "tags": [],
      "notes": "",
      "review": "",
      "queueNote": "",
      "addedAt": "...",
      "finishedAt": null
    }
  ]
}
```

**Warning signs:**
- No `schemaVersion` field in export format.
- Import code that crashes on `undefined` field access.
- No tests for importing old export files.
- Schema fields added without migration logic.

**Phase to address:** Phase 1 (data layer) and Phase 3 (import/export). Schema versioning must be in the initial design, not retrofitted.

---

### Pitfall 7: `chrome_url_overrides` Conflict With Other Installed Extensions

**What goes wrong:**
If the user has another extension that also overrides the new tab page, only one wins — the last installed. BookTab will silently "disappear" as the new tab for some users, with no error message. Firefox gives no warning that another extension has taken over the override.

**Why it happens:**
Firefox documentation states: "If two or more extensions both define custom new tab pages, then the last one to be installed or enabled gets to use its value." There is no conflict resolution UI — the user must manually identify and disable conflicting extensions.

**How to avoid:**
- This cannot be prevented programmatically — it's a browser policy.
- In onboarding/documentation: inform the user that BookTab requires being the only new-tab-overriding extension, and tell them how to check (`about:addons`).
- Use `browser.runtime.openOptionsPage()` or a dedicated install welcome page to surface this guidance immediately after install.
- Do not try to detect or fight other extensions — this is against AMO policies and impossible to do reliably.

**Warning signs:**
- No user-facing documentation about new tab conflict.
- No install/onboarding flow to guide the user.

**Phase to address:** Phase 1 (extension scaffolding) and Phase 4 (onboarding). Document in the install welcome page.

---

### Pitfall 8: `browser.storage.local` is Async — Race Conditions on New Tab Open

**What goes wrong:**
The new tab page loads and immediately reads from `browser.storage.local` to display the current book. If the read hasn't resolved yet, the UI renders with no book, then "flickers" as data arrives. Worse: if the user takes an action before data loads (clicking a status button), the action runs with stale/empty state and potentially overwrites real data with empty state.

**Why it happens:**
`browser.storage.local.get()` returns a Promise. Developers who don't await it or handle the async gap correctly render the empty initial state. Since the new tab opens frequently, even a 20ms delay is visible.

**How to avoid:**
- Show a loading state (even a spinner or blank intentional UI) until the first storage read resolves.
- Never write to storage until the initial read has completed.
- Structure the app with a single "data loaded" gate before rendering interactive elements.
- Use the `storage.onChanged` event for reactive updates rather than polling.

**Warning signs:**
- `browser.storage.local.get()` called without `.then()` or `await`.
- Interactive elements rendered before `storageReady = true`.
- Flickering or empty current-book display on new tab open.

**Phase to address:** Phase 1 (data layer architecture). Must be in the initial design.

---

### Pitfall 9: Open Library API Rate Limits and Unreliable Book Coverage

**What goes wrong:**
Book searches work in testing but fail intermittently in production due to rate limiting. Or, less popular books (especially non-English, older, or niche titles) return no results, forcing users to manual entry — but the manual entry form is minimal and the fallback UX is poor.

**Why it happens:**
Open Library's default rate limit is 1 request/second for unauthenticated requests. A user typing quickly triggers multiple rapid searches. The API also has incomplete coverage: many books exist only by ISBN, not by title/author metadata.

Additionally, Open Library cover images come from `covers.openlibrary.org` on a separate domain — forgetting to add this to `host_permissions` breaks cover display even when search works.

**How to avoid:**
- Implement debounced search: wait 400–600ms after the user stops typing before firing the request.
- Set the `User-Agent` header to identify the app and get the 3x rate limit (3 req/sec identified vs 1 req/sec unidentified). Per Open Library docs: `User-Agent: BookTab (contact@example.org)`.
- Cache search results in memory (within the session) to avoid re-fetching identical queries.
- Design the manual entry form as a first-class experience, not an afterthought — users will need it for ~20% of books.
- Add `"*://covers.openlibrary.org/*"` to host_permissions alongside `"*://openlibrary.org/*"`.

**Warning signs:**
- No debounce on search input — fires on every keystroke.
- No `User-Agent` header set on fetch calls.
- Cover images fail for books that show correct metadata.
- Manual entry form is a single text field with no metadata editing.

**Phase to address:** Phase 2 (book search feature).

---

### Pitfall 10: Import Overwrites All Data Without Merge or Backup

**What goes wrong:**
User imports a JSON file. The import silently replaces all existing data with the imported data. If the user imported an old backup by mistake (or a partial export), they permanently lose their current library. There is no undo.

**Why it happens:**
Import is often implemented as: "parse JSON, call `storage.local.set(parsedData)`, done." Simple and fast to write, catastrophic if the user imports the wrong file.

**How to avoid:**
- Before any import, export the current data to a timestamped file automatically, or warn the user explicitly: "This will replace your current library. Export your current data first?"
- Offer "merge" as an alternative to "replace" — add imported books that don't already exist (by ID or ISBN) without touching existing ones.
- Validate the import file strictly: check `schemaVersion`, validate required fields, reject malformed JSON with a clear error message before touching storage.
- Show a preview of what will be imported ("47 books found in this file") before confirming.

**Warning signs:**
- Import calls `storage.local.set()` immediately without validation.
- No confirmation dialog before destructive import.
- No export offered as part of the import flow.

**Phase to address:** Phase 3 (import/export feature).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single `"books"` key storing entire array | Simple reads/writes | Full array re-serialized on every change; harder to migrate schema | MVP only if book count is expected to stay <100 |
| Inline event handlers (`onclick`) in HTML | Familiar syntax | Blocked by CSP — silent failure | Never |
| No schema versioning in export | Simpler initial export | Import breaks on first schema change | Never |
| `localStorage` instead of `browser.storage.local` | Synchronous API | Data wiped on browser data clear | Never |
| Google Books API key in source | Access to richer metadata | Key exposed, subject to abuse/revocation | Never — use Open Library |
| No debounce on book search | Search responds instantly | Rate limit exceeded; Open Library may block the extension | Never |
| No error handling on `storage.set()` | Simpler code | Silent data loss on quota exceeded | Never for any save operation |
| Hardcoded cover image URLs | Faster to build | URLs change; Open Library cover API is the stable interface | Never — always use Covers API endpoint |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Open Library Search API | Fetching without `User-Agent` header | Set `User-Agent: BookTab (contact@example.org)` on every request to get 3x rate limit |
| Open Library Search API | Searching on every keystroke | Debounce 400–600ms; cache results per session |
| Open Library Covers API | Forgetting separate host permission | Add `"*://covers.openlibrary.org/*"` to `host_permissions` |
| Open Library Book Data | Assuming complete metadata | Many fields are absent; always provide null-safe defaults for author, description, cover |
| browser.storage.local | Not awaiting Promises | All reads/writes are async — always use `await` or `.then()` |
| browser.storage.local | Calling `.set()` without try/catch | Quota errors are thrown, not returned — must be caught explicitly |
| manifest permissions | Putting host permissions in wrong key | MV2: `"permissions"` array. MV3: `"host_permissions"` key (separate from `"permissions"`) |
| chrome_url_overrides | Remote URL for newtab override | Must be a local bundled HTML file — remote URLs are not allowed |

---

## Performance Traps

Patterns that work at small scale but degrade as the user's library grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing all books under one storage key | Full serialization delay on every save | Use per-book keys: `book_${id}` | ~50+ books with long notes |
| Synchronous-style storage assumptions | UI freezes waiting for data | Always use async patterns; show loading states | Immediately — all storage is async |
| Fetching cover images without caching | New tab flickers as covers load on every open | Cache cover blob URLs in session or use `browser.storage.local` for cover URLs | Any number of books on slow connections |
| No debounce on book search | Rate limits hit; API may start returning 429s | 400–600ms debounce | Fast typists after ~10 searches/minute |
| Re-rendering entire book list on any state change | Noticeable lag on library tab | Targeted DOM updates or virtual list for 100+ books | ~100+ books in queue view |

---

## Security Mistakes

Domain-specific security issues for this extension.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Embedding Google Books API key in source | Key exposed in unzipped extension; abuse/billing/revocation | Use Open Library (no key needed); if Google Books chosen, accept exposure and set quotas |
| Rendering user note/review content as innerHTML | XSS from malicious import file | Always use `textContent` or sanitize; never `innerHTML` with user data |
| Accepting arbitrary JSON in import without validation | Malformed import corrupts storage state | Validate schema strictly; reject unknown fields; check `schemaVersion` |
| Overly broad host permissions (`<all_urls>`) | Permission warnings scare users; AMO rejection | Request only specific origins needed (`*://openlibrary.org/*`) |
| Storing extension data in `localStorage` | Data wiped by user in normal privacy flows | Use `browser.storage.local` exclusively |

---

## UX Pitfalls

Common user experience mistakes specific to new tab extensions and book trackers.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| New tab takes >200ms to show content | Every new tab feels slow; extension feels broken | Show skeleton/placeholder immediately; load data into it async |
| No current book displayed (empty state) | First-time user confused about what to do | Clear onboarding empty state with "Add your first book" CTA |
| Import destroys data without warning | Catastrophic and unrecoverable data loss | Warn, show preview, offer merge, auto-backup before import |
| Book search fails silently on no results | User thinks search is broken | Explicit "No results for X — add manually?" with quick-add link |
| Tags with no UI to manage them | Tag proliferation ("sci-fi", "SciFi", "science fiction") | Show existing tags as autocomplete suggestions when tagging |
| Notes tied to reading session without dates | Can't track reading timeline in notes | Auto-timestamp note entries or at least record when note was last edited |
| No visual feedback when saving | User unsure if their note/status was saved | Brief save confirmation toast or auto-save indicator |

---

## "Looks Done But Isn't" Checklist

Things that appear complete in demos but are missing critical pieces.

- [ ] **New Tab Override:** Does the new tab actually load in Firefox after a browser restart (not just during dev with `about:debugging`)? Temporary installations lose the override on restart.
- [ ] **Storage Persistence:** Verify data survives: browser restart, Firefox update, clearing cookies/history, profile backup/restore.
- [ ] **Book Search:** Are cover images appearing (requires separate `covers.openlibrary.org` host permission)? Do results render for books with no cover?
- [ ] **CSP compliance:** Open extension console at `about:debugging` — are there any CSP violation errors? Inline scripts often appear to work in dev but don't.
- [ ] **Import/Export round-trip:** Export data → import into fresh extension profile → verify all books, notes, tags, statuses are intact.
- [ ] **Error handling:** What happens when Open Library is down/slow? Is there a timeout and user-facing message?
- [ ] **Manual entry:** Can a user add a book that Open Library doesn't have (with title, author, optional cover URL)?
- [ ] **Storage permission:** Is `"storage"` in the manifest `permissions` array? Missing it causes silent failure on all storage calls.
- [ ] **Manifest version:** Is `browser_specific_settings.gecko.id` set? Without an extension ID, storage data is lost on reinstall during development.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSP violations breaking UI | LOW | Move inline scripts to `.js` files; switch inline handlers to `addEventListener()` |
| localStorage used instead of browser.storage.local | MEDIUM | Migrate by reading from localStorage, writing to browser.storage.local, prompting user to "upgrade" storage |
| Flat storage schema that needs versioning | HIGH | Add schema migration layer; test all existing exports; provide migration guide in changelog |
| Google Books API key exposed and abused | HIGH | Switch to Open Library; force extension update; key cannot be recalled from already-distributed versions |
| Import destroyed user data | CRITICAL | Cannot recover unless user has a previous export; add auto-backup before import in next release |
| Open Library rate limits triggered | MEDIUM | Add debounce (400–600ms), add User-Agent header, add result caching; release patch |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSP violations / inline JS | Phase 1 (Scaffolding) | Open extension console in `about:debugging`, confirm zero CSP errors |
| `localStorage` vs `browser.storage.local` | Phase 1 (Data Layer) | Grep codebase for `localStorage` — must return zero results |
| Async storage race conditions | Phase 1 (Data Layer) | Test new tab load: UI never renders with empty data when books exist |
| Storage quota + error handling | Phase 1 (Data Schema) | Call `getBytesInUse()` in tests; verify `set()` errors are caught and displayed |
| Flat schema / no versioning | Phase 1 (Data Schema) | Export file contains `schemaVersion: 1`; import handles missing optional fields |
| API key security / Open Library choice | Phase 2 (Book Search) | No API keys in source; Open Library fetch works from extension page |
| Host permissions for Open Library + covers | Phase 2 (Book Search) | Cover images load; no CORS errors |
| API rate limit + debounce | Phase 2 (Book Search) | Search only fires after 400ms idle; User-Agent header set |
| Import without validation/backup | Phase 3 (Import/Export) | Import rejects malformed JSON; warns user before replacing data |
| Import/export round-trip schema integrity | Phase 3 (Import/Export) | Export from v1, import to fresh profile, all data matches exactly |
| New tab conflict with other extensions | Phase 1 (Scaffolding) + Onboarding | Install welcome page mentions new tab conflict scenario |
| Destructive import UX | Phase 3 (Import/Export) | Confirmation dialog shown; merge option available |

---

## Sources

- **MDN: storage.local** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local
- **MDN: Content Security Policy for extensions** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_Security_Policy (updated Jan 2, 2026)
- **MDN: chrome_url_overrides** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides (updated Jul 17, 2025)
- **MDN: permissions (unlimitedStorage)** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions (updated Jan 27, 2026)
- **MDN: Storage quotas and eviction criteria** — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria (updated Jan 5, 2026)
- **MDN: Differences between API implementations** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Differences_between_API_implementations
- **Open Library API documentation** — https://openlibrary.org/developers/api (updated Feb 13, 2026)
- **Extension Workshop: Build a secure extension** — https://extensionworkshop.com/documentation/develop/build-a-secure-extension/

---
*Pitfalls research for: Firefox extension / new tab book tracker (BookTab)*
*Researched: 2026-02-25*
