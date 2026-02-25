# STATE: BookTab

## Project Reference

**Core Value:** Every new tab is a reminder of what you're reading and what's next — keeping your reading life visible without leaving the browser.

**Current Focus:** Phase 1 — Tooling & Practice Foundation

**Stack:** TypeScript + Vite 7 + vite-plugin-web-extension + Vitest + XState v5 + browser.storage.local  
**Target:** Firefox extension (Manifest V3)  
**ADRs live in:** `docs/decisions/` (MADR 4.0 format)

---

## Current Position

| Field | Value |
|-------|-------|
| **Current Phase** | Phase 1: Tooling & Practice Foundation |
| **Current Plan** | None (not started) |
| **Phase Status** | Not started |
| **Overall Progress** | 0/6 phases complete |

```
Progress: [░░░░░░░░░░░░░░░░░░░░] 0%
Phase 1 [░░░░] → Phase 2 [░░░░] → Phase 3 [░░░░] → Phase 4 [░░░░] → Phase 5 [░░░░] → Phase 6 [░░░░]
```

---

## Phase Summary

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Tooling & Practice Foundation | ADR-01–03, DEV-01–06 (9 reqs) | Not started |
| 2 | Extension Scaffold | CORE-01–04 (4 reqs) | Not started |
| 3 | Library CRUD | LIB-01–04 (4 reqs) | Not started |
| 4 | New Tab Display | DISP-01–03 (3 reqs) | Not started |
| 5 | Queue | QUEUE-01–02 (2 reqs) | Not started |
| 6 | Data Safety | DATA-01–03 (3 reqs) | Not started |

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 0 / 6 |
| Requirements met | 0 / 25 |
| Plans executed | 0 |
| ADRs written | 0 |
| Tests passing | 0 |

---

## Accumulated Context

### Architectural Decisions (Pre-ADR)

- **Storage**: `browser.storage.local` only — never `window.localStorage` (wiped on privacy clear)
- **Manifest**: V3 (Firefox 109+) — no service workers; event pages are fine
- **State management**: XState v5 machines/actors for ALL stateful logic — no ad-hoc flags
- **No background script**: Architecture is single privileged page (new tab) with direct storage access
- **Book metadata API**: Open Library only — no API key = no key exposure in extension source
- **Data structure**: `booktab_data` key → `{ schemaVersion, books: Record<id, BookRecord>, settings }`
- **No UI framework**: Vanilla TypeScript + CSS; Preact is upgrade path if justified

### Critical Pitfalls (Pre-empt in Phase 2)

1. **CSP blocks inline JS / CDN scripts** — all handlers via `addEventListener()`, all JS in `.js` files
2. **`window.localStorage` wiped on privacy clear** — use `browser.storage.local` exclusively
3. **Async race on new tab open** — show loading state until `storage.get()` resolves; gate writes behind `storageReady`
4. **Flat unversioned export schema** — `schemaVersion: 1` in schema from day one; migration layer before any schema change ships
5. **Open Library rate limits** — 400–600ms debounce, `User-Agent` header, both `openlibrary.org` + `covers.openlibrary.org` in `host_permissions`
6. **Destructive import without warning** — auto-backup before import; confirmation dialog; schema validation before write

### Developer Practice Rules (Locked in Phase 1)

- Every phase begins with a tidy-up step (refactoring/cleanup before new feature code)
- Every phase plan includes at least one ADR task (written before implementation)
- TDD: red-green-refactor vertical slicing — one test → one implementation → repeat
- No tests written in bulk after implementation
- Tests exercise public interfaces only — no internal mocking, no implementation detail testing

### Open Questions

- `unlimitedStorage` permission: does it trigger user-facing warning in Firefox? Evaluate in Phase 6 before AMO submission.
- Open Library actual rate limit enforcement for single-user extension: test live in Phase 3.

### Todos

- [ ] Initialize `docs/decisions/` with MADR 4.0 template (Phase 1)
- [ ] Write ADR for Vitest choice (Phase 1)
- [ ] Write ADR for TDD methodology (Phase 1)
- [ ] Write ADR for XState v5 choice (Phase 2)
- [ ] Scaffold extension with `vite-plugin-web-extension` (Phase 2)
- [ ] Lock data schema in `schema.ts` before any feature code (Phase 2)

### Blockers

None.

---

## Session Continuity

**Last action:** Roadmap created (2026-02-25)  
**Next action:** `/gsd-plan-phase 1` — plan Tooling & Practice Foundation  
**Context for next session:** Phase 1 is pure setup — no feature code. Focus: ADRs for TDD/Vitest, Vitest config, `docs/decisions/` initialization, CONTRIBUTING.md-equivalent capturing developer practice rules.

---
*STATE initialized: 2026-02-25*  
*Updated: 2026-02-25 after roadmap creation*
