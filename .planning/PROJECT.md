# BookTab

## What This Is

A Firefox browser extension that replaces the new tab page with a personal book tracker. Designed for a single user who wants to see their current read front and center every time they open a new tab, while also managing a tagged, prioritized reading queue and capturing notes and reflections on books.

## Core Value

Every new tab is a reminder of what you're reading and what's next — keeping your reading life visible without leaving the browser.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] New tab page replaces Firefox's default with book tracker UI
- [ ] Current book is displayed prominently on the new tab page
- [ ] User can set a book's status: Want to Read / Reading / Read
- [ ] User can add books via search (metadata auto-filled) or manual entry
- [ ] User can tag books and prioritize the to-read queue
- [ ] User can take notes while reading and write a review after finishing
- [ ] User can record why they want to read a book (queue notes)
- [ ] User can view a basic history (timeline of finished books)
- [ ] User can export all data as a JSON file
- [ ] User can import data from a JSON file
- [ ] All data is stored locally in browser storage (no backend, works offline)

### Out of Scope

- Multi-user / accounts — personal tool only
- Cloud sync or cross-device sync — local browser storage only
- Page/percentage progress tracking — status-only tracking
- Reading stats or analytics — basic history only
- Firefox popup or context menu — new tab page only
- Mobile or desktop app — web extension only

## Context

- Delivered as a Firefox browser extension (WebExtension API)
- Data lives in browser.storage.local — no server, no auth, works offline
- Book metadata sourced via search API (e.g. Open Library or Google Books) with manual entry as fallback
- Import/export as JSON for portability and backup
- UI should be clean and minimal — content-focused, no clutter

## Constraints

- **Platform**: Firefox extension only — WebExtension manifest v2/v3
- **Storage**: browser.storage.local only — no backend, no external accounts
- **UI**: Clean and minimal — no heavy frameworks if avoidable
- **Data portability**: JSON import/export must preserve all book data and notes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Firefox extension (new tab) | User wants it as their default new tab page | — Pending |
| Browser-local storage only | No backend complexity, works offline, data stays private | — Pending |
| JSON for import/export | Structured, re-importable, human-inspectable | — Pending |
| Status-only progress tracking | Simpler UX, user didn't need page-level granularity | — Pending |

---
*Last updated: 2026-02-25 after initialization*
