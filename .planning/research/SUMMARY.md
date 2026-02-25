# Project Research Summary

**Project:** BookTab — Firefox New Tab Book Tracker Extension
**Domain:** Firefox browser extension / personal book tracker
**Researched:** 2026-02-25
**Confidence:** HIGH

## Executive Summary

BookTab occupies a completely unoccupied competitive niche: a local-first, no-account, offline-capable book tracker that surfaces your current read on every new tab open. Every major competitor (Goodreads, StoryGraph, Hardcover, Literal.club) is a social discovery platform requiring accounts and online access — none integrates with the browser new tab. The recommended approach is a Firefox Manifest V3 extension using vanilla TypeScript + CSS (no UI framework), with all data stored in `browser.storage.local` and book metadata fetched from the Open Library API (no API key required). The architecture is intentionally minimal: a single privileged extension page (the new tab) that reads/writes storage directly — no background script, no content scripts, no backend.

The key engineering discipline is **schema-first development**. Because all user data lives in local extension storage and the primary backup mechanism is JSON export/import, the data schema must be versioned and migration-ready from day one. The build order follows a clear dependency graph: manifest + shell → data layer + schema → core UI (current book display) → book search + add → queue/notes/history → import/export. This ordering ensures the core value proposition ("see your current book on every new tab") is deliverable and testable before building surrounding features.

The most dangerous pitfalls are subtle and hard to retrofit: using `window.localStorage` instead of `browser.storage.local` (data wiped on privacy clears), inline JavaScript or CDN scripts (silently blocked by extension CSP), and a flat unversioned export schema (import breaks on first schema change). All three must be addressed in Phase 1 before any feature code is written. Google Books API should be avoided in favor of Open Library — there is no server-side to hide an API key, so any key embedded in the extension source is publicly exposed to anyone who unzips the `.xpi`.

---

## Key Findings

### Recommended Stack

The stack is lean by design. Vite 7 with `vite-plugin-web-extension` handles multi-entry bundling and live reload, eliminating the complex manual configuration that extension development would otherwise require. TypeScript 5.9 with `@types/webextension-polyfill` provides typed `browser.*` APIs, catching storage shape mistakes at compile time — critical when the data structure is the entire application. The UI stays vanilla TypeScript and CSS; there is no routing, no complex component tree, and no server state. Preact is the upgrade path if UI complexity justifies it (~3KB vs React's 45KB), but the PROJECT.md constraint ("no heavy frameworks if avoidable") should be taken seriously.

**Core technologies:**
- **Manifest V3** (Firefox 109+): GA standard since Feb 2023; forward-compatible; no service workers needed (Firefox MV3 uses event pages)
- **TypeScript 5.9.3**: Typed `browser.*` APIs via `@types/webextension-polyfill`; strict mode required
- **Vite 7.3.1** + **`vite-plugin-web-extension` 4.5.0**: Multi-entry bundling, live reload, extension-aware output structure
- **`webextension-polyfill` 0.12.0**: Promise-based `browser.*` API; use this everywhere, never `chrome.*`
- **`browser.storage.local`**: IndexedDB-backed, survives privacy wipes; the only safe storage mechanism for extensions
- **`zod` 3.x**: Runtime schema validation at import boundaries; catches malformed JSON before it corrupts storage
- **`web-ext` 9.3.0**: Live reload, linting, packaging, AMO signing

**What NOT to use:** `window.localStorage` (wiped on privacy clears), `chrome.*` namespace, React (45KB runtime overhead), CDN scripts (blocked by CSP), `eval()` or dynamic code (banned in MV3).

### Expected Features

The new tab constraint reshapes every feature decision. The UI is seen for ~2 seconds before navigation — value must be ambient and instant. Complex management flows belong in modals, not multi-page navigations. The core loop is: see current book → manage queue → take notes → finish → see history.

**Must have (table stakes):**
- New tab override — the entire product premise
- Status tracking (Want to Read / Reading / Read) — universal primitive across all competitors
- Add book via search (Open Library) + manual entry fallback — auto-fill with 20M+ record coverage
- Current book hero display — dominant visual; the differentiator by context, not feature
- To-read queue — ordered backlog management
- Reading notes — per-book notes field during Reading status
- Review + star rating — unlocked on Mark as Read
- Finished books history — chronological timeline with finish dates
- JSON export + import — data ownership; the only backup mechanism; must be safe

**Should have (differentiators):**
- Tags on books — free-form organization; competitors have this but it's not universally implemented well
- "Why I want to read this" note — unique intention-capture field; no major competitor has this
- Queue priority reordering — drag or up/down; Goodreads shelves are unordered; this is whitespace

**Defer to v2+:**
- Cover image caching (storage budget complexity)
- Multiple reading statuses (DNF, Paused) — wait for real user demand
- Markdown rendering in notes — low-cost later but out of v1 scope
- "Next up" on new tab — complicates hero layout

**Anti-features (do not build):**
- Page/percentage progress tracking — encourages interaction every tab-open; status-only is intentional
- Social features — antithetical to local-only architecture
- Reading stats/analytics dashboard — stats are for dedicated sessions, not new tab glances
- Cloud sync / cross-device — requires backend; JSON export is the escape hatch
- Browser popup / toolbar button — second UI surface explicitly out of scope

### Architecture Approach

BookTab uses Architecture A: a single privileged extension page (the new tab) with direct access to `browser.storage.local` — no background script, no message passing, no content scripts. All data lives under one storage key (`booktab_data`) as a versioned JSON object with a `version` field enabling migrations. The `storage.js` module is the sole point of contact with `browser.storage.local`; UI modules receive data as parameters and return mutations to `app.js`. `browser.storage.local.onChanged` provides reactive re-render across multiple open tabs.

**Major components:**
1. **`manifest.json`** — declares extension; `chrome_url_overrides.newtab` points to the app; requests `storage` + `host_permissions`
2. **`storage.js`** — sole abstraction over `browser.storage.local`; owns all reads, writes, and error handling
3. **`schema.js`** — single source of truth for data shape, defaults, and migration logic; `version` field required from day 1
4. **`api.js`** — stateless Open Library fetch wrapper; debounced search, `User-Agent` header, cover domain handling
5. **`app.js`** — orchestrator; loads data on mount, handles user actions, coordinates UI re-render
6. **`ui/` modules** — `currentBook.js`, `queue.js`, `notes.js`, `history.js`, `bookForm.js`, `importExport.js` — each maps to one product feature

**Data schema (locked in Phase 1):**
```typescript
interface BookTabData {
  version: number;          // Migration key
  books: Record<string, BookRecord>;  // Object (not array) — O(1) lookup
  settings: UserSettings;
}
interface BookRecord {
  id, title, authors, coverUrl, isbn, externalId,
  status: 'want_to_read' | 'reading' | 'read',
  addedAt, startedAt?, finishedAt?,
  tags, priority,
  queueNote?, readingNotes?, review?
}
```

### Critical Pitfalls

1. **CSP blocks all inline JS and CDN scripts** — Silent failures (buttons do nothing, scripts load but don't run). Fix in Phase 1: all JS in `.js` files, all handlers via `addEventListener()`, no CDN dependencies. Verify at `about:debugging` before writing any feature code.

2. **`window.localStorage` data wiped on privacy clear** — MDN explicitly documents this. User loses entire book library. Fix in Phase 1: use `browser.storage.local` exclusively; grep for `localStorage` must return zero results.

3. **Async storage race conditions on new tab open** — UI renders with empty state before storage read resolves; user action on stale state can overwrite real data. Fix in Phase 1: show loading state until first `storage.get()` resolves; gate all writes behind `storageReady = true`.

4. **Flat unversioned export schema** — Import breaks on first schema change; users lose notes when importing old backups. Fix in Phase 1: embed `schemaVersion: 1` from day one; write migration layer before any schema change ships.

5. **Open Library API rate limits + missing cover domain** — No debounce = rate limited quickly; missing `covers.openlibrary.org` host permission breaks cover display. Fix in Phase 2: 400–600ms debounce, `User-Agent` header, cache results per session, add both `openlibrary.org` and `covers.openlibrary.org` to `host_permissions`.

6. **Import destroys data without warning** — Replace-on-import is catastrophic and unrecoverable. Fix in Phase 3: auto-backup before import, strict schema validation, confirmation dialog, offer merge vs. replace.

---

## Implications for Roadmap

Based on research, the architecture's dependency graph dictates a clear build order. Phases 1 through 4 align with the technical dependency chain; Phases 5–6 add depth after the core loop is validated.

### Phase 1: Foundation & Data Layer
**Rationale:** Nothing else can work without a valid extension loading, storage abstraction in place, and the schema locked in. All 5 critical pitfalls have roots in this phase — CSP, localStorage, async patterns, schema versioning, and extension ID must all be addressed here before any feature code is written.
**Delivers:** A working Firefox extension that overrides the new tab, loads/saves data correctly, and has a tested schema with versioning.
**Addresses:** Extension scaffold, `manifest.json`, `storage.js`, `schema.js`, `app.js` skeleton, install welcome page (new tab conflict notice).
**Avoids:** Pitfalls 1 (CSP), 2 (localStorage), 3 (async race), 4 (schema versioning), 7 (extension ID stability).
**Research flag:** Standard — well-documented Firefox extension patterns; no `/gsd-research-phase` needed.

### Phase 2: Core Value Proposition (Current Book Display)
**Rationale:** The product's entire value proposition is "see your current book on every new tab." This must be deliverable and testable before any other feature. Requires at least one book in storage, so the add-book flow (search + manual entry) must also ship in this phase.
**Delivers:** New tab showing current book hero (cover, title, author), status management (Want/Reading/Read), and the ability to add books via Open Library search or manual entry.
**Implements:** `ui/currentBook.js`, `ui/bookForm.js`, `api.js` (Open Library search with debounce + User-Agent + cover domain handling).
**Avoids:** Pitfalls 4 (API key — use Open Library), 5 (rate limits + debounce + host permissions).
**Research flag:** Standard for UI; minor research may help for Open Library API response normalization.

### Phase 3: Reading Depth (Queue, Notes, History)
**Rationale:** Once the add + status loop works, the remaining depth features (queue, notes, history) share no cross-dependencies and can ship together. Each maps to one `ui/` module and reads from the same storage object.
**Delivers:** To-read queue with ordering, reading notes per book, post-read review + star rating, finished books timeline with finish dates.
**Implements:** `ui/queue.js`, `ui/notes.js`, `ui/history.js`.
**Avoids:** No new pitfalls introduced; `finishedAt` timestamp must be auto-set when status changes to `read` (history depends on this).
**Research flag:** Standard — straightforward DOM + storage patterns.

### Phase 4: Data Safety (Import / Export)
**Rationale:** Import/export is last because it requires the full schema to be stable — shipping export before Phase 3 features are complete risks breaking format changes that invalidate user backups. However, it must ship in v1 because it's the only data ownership mechanism.
**Delivers:** JSON export (full library as downloadable file), JSON import with schema validation, confirmation dialog, auto-backup before replace, merge option.
**Implements:** `ui/importExport.js`, schema migration layer in `schema.js`.
**Avoids:** Pitfall 6 (flat schema), Pitfall 10 (destructive import without warning).
**Research flag:** Standard — no external dependencies; patterns are well-documented.

### Phase 5: Differentiators (Tags, Queue Priority, Intention Notes) [v1.x]
**Rationale:** These are differentiators, not table stakes. Ship after v1 is validated with real users. Tags and priority ordering are low-complexity and high-value once the core loop is proven.
**Delivers:** Free-form tags on books, manual queue priority reordering, "why I want to read this" field.
**Implements:** Tag input with autocomplete (prevents proliferation), drag-or-arrows priority reorder on `ui/queue.js`.
**Research flag:** Standard — no new external dependencies.

### Phase 6: Polish & Distribution [v1.x → AMO]
**Rationale:** AMO submission requires passing `web-ext lint`, setting correct extension ID, and handling the install/onboarding experience. Signing and distribution have their own requirements.
**Delivers:** AMO-ready extension: linted, signed, with install welcome page, tested persistence across browser restarts and privacy wipes.
**Uses:** `web-ext sign`, `addons-linter`, Firefox `about:debugging` verification checklist.
**Research flag:** Standard — AMO process is documented; `web-ext lint` catches most issues automatically.

### Phase Ordering Rationale

- **Schema must be locked before export ships** — once users have backups, breaking schema changes require migration tooling. Any schema change after Phase 4 ships must be accompanied by a migration in `schema.js`.
- **Core display before search is illogical** — but search must coexist with display (Phase 2) because you need books to display. The two are co-dependent; manual entry is the minimal path to get a book in storage.
- **No background script needed** — this simplifies the architecture significantly. No message passing, no event page lifecycle management. All complexity is in the new tab page itself.
- **Open Library over Google Books** — firmly decided by the security pitfall: no server-side means no safe key storage. This is not a tradeoff — it's the only viable choice.

### Research Flags

Phases likely needing `/gsd-research-phase` during planning:
- **None identified** — all phases use well-documented Firefox extension patterns, standard DOM/storage APIs, and the Open Library API which has clear documentation. The architecture is deliberate simple.

Phases with standard patterns (skip research-phase):
- **All phases** — Mozilla MDN docs are authoritative and current (updated 2025–2026), Context7 sources verified against npm registry, Open Library API documentation is current (Feb 2026). The stack choices are conservative and proven.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry Feb 2026; MDN docs verified Jul–Aug 2025; Firefox Extension Workshop MV3 guide confirmed |
| Features | MEDIUM-HIGH | Goodreads, Hardcover, Literal.club accessed directly; StoryGraph returned 403 but cross-referenced via Hardcover import docs and community sources |
| Architecture | HIGH | All structural patterns sourced from MDN official docs (updated Jan–Aug 2025); no inferences required |
| Pitfalls | HIGH | All critical pitfalls verified against official MDN documentation and Open Library API docs; CSP pitfall confirmed against Firefox Extension Workshop |

**Overall confidence:** HIGH

### Gaps to Address

- **StoryGraph feature parity**: Site returned 403 during research. Cross-referenced via Hardcover (which imports from StoryGraph) and community sources. Confidence MEDIUM on StoryGraph-specific features. If competitive parity with StoryGraph matters, verify directly when access is available.
- **AMO review time and requirements**: `web-ext lint` catches many issues, but AMO human review has undocumented acceptance criteria (e.g., `unlimitedStorage` permission may require justification). Plan for 1–2 week review iteration during Phase 6.
- **Open Library rate limit enforcement in practice**: Documented as 1 req/sec unauthenticated, 3 req/sec with `User-Agent`. Actual enforcement behavior for a single-user extension is not documented. The 400–600ms debounce + `User-Agent` header is the recommended mitigation; confirm via live testing in Phase 2.
- **`unlimitedStorage` permission UX impact**: MDN notes this permission may require justification for AMO; unclear if it triggers a user-facing warning. Evaluate whether to include it by default or make it optional. For most users (<500 books), default quota is sufficient.

---

## Sources

### Primary (HIGH confidence)
- **MDN — `chrome_url_overrides`** (Jul 17, 2025) — new tab override mechanism confirmed MV2+MV3
- **MDN — `manifest_version`** (Jul 17, 2025) — MV3 current standard; MV2 still supported
- **MDN — `storage.local`** (Aug 1, 2025) — IndexedDB-backed; explicit `localStorage` warning
- **MDN — Anatomy of an extension** (Jan 16, 2026) — privileged page API access confirmed
- **MDN — Background scripts** (Jul 17, 2025) — confirms no background script needed for this architecture
- **MDN — Content Security Policy for extensions** (Jan 2, 2026) — CSP defaults confirmed
- **MDN — Storage quotas and eviction criteria** (Jan 5, 2026) — quota behavior confirmed
- **Firefox Extension Workshop — MV3 Migration Guide** — MV3 GA in Firefox 109; event pages not service workers
- **Open Library API documentation** (Feb 13, 2026) — rate limits, search endpoint, cover domain
- **Context7 — `/mozilla/webextension-polyfill`** — storage patterns
- **Context7 — `/mozilla/web-ext`** — CLI workflow
- **Context7 — `/aklinker1/vite-plugin-web-extension`** — Vite config for extensions
- **npm registry** (Feb 2026) — all package versions verified current

### Secondary (MEDIUM confidence)
- **Goodreads** (goodreads.com/about/us) — feature discovery via navigation
- **Literal.club** (literal.club) — feature list direct observation
- **Hardcover** (hardcover.app) — feature list direct observation; StoryGraph cross-reference via import docs
- **Firefox Add-ons AMO search** — confirmed no competing book-tracker new-tab extension exists

### Tertiary (LOW confidence)
- **StoryGraph** — 403 during research; features inferred from Hardcover import compatibility and community cross-references; needs direct verification if competitive feature parity is critical

---
*Research completed: 2026-02-25*
*Ready for roadmap: yes*
