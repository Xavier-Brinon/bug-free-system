# Requirements: BookTab

**Defined:** 2026-02-25
**Core Value:** Every new tab is a reminder of what you're reading and what's next — keeping your reading life visible without leaving the browser.

## v1 Requirements

### Extension Core

- [ ] **CORE-01**: Extension replaces Firefox new tab page via `chrome_url_overrides.newtab`
- [ ] **CORE-02**: All scripts are CSP-safe (no inline JS, no CDN scripts, all bundled)
- [ ] **CORE-03**: Data schema includes `schemaVersion` field from day one
- [ ] **CORE-04**: All app state and async flows managed via XState v5 machines/actors

### Library

- [ ] **LIB-01**: User can add a book manually (title, author, optional cover URL)
- [ ] **LIB-02**: User can set a book's status: Want to Read / Reading / Read
- [ ] **LIB-03**: User can edit a book's details after adding
- [ ] **LIB-04**: User can delete a book from the library

### New Tab Display

- [ ] **DISP-01**: Current book (Reading status) is shown prominently on the new tab page
- [ ] **DISP-02**: Empty state shown with a prompt when no book is set to Reading
- [ ] **DISP-03**: To-read count is visible on the new tab page

### Queue

- [ ] **QUEUE-01**: User can view all Want to Read books in a list
- [ ] **QUEUE-02**: User can add a note to a queued book explaining why they want to read it

### Data Safety

- [ ] **DATA-01**: User can export all library data as a JSON file
- [ ] **DATA-02**: User can import library data from a JSON file
- [ ] **DATA-03**: A backup export is auto-created before any import overwrites existing data

### Architecture Documentation

- [ ] **ADR-01**: `docs/decisions/` initialized with MADR 4.0 template
- [ ] **ADR-02**: ADR written before implementing every architecturally significant decision
- [ ] **ADR-03**: Each phase plan includes at least one ADR task

### Developer Practice

- [ ] **DEV-01**: Vitest configured as the test framework
- [ ] **DEV-02**: All features implemented via red-green-refactor vertical slicing (one test → one implementation → repeat)
- [ ] **DEV-03**: No tests written in bulk after implementation
- [ ] **DEV-04**: Tests exercise public interfaces only — no internal mocking, no testing implementation details
- [ ] **DEV-05**: Each phase begins with a mandatory tidy-up step before any new feature code
- [ ] **DEV-06**: ADRs written for test framework and TDD methodology choices before Phase 1 execution

## v2 Requirements

### Book Search

- **SRCH-01**: User can search for a book by title or author via Open Library API
- **SRCH-02**: Search results auto-fill book metadata (cover, author, description)
- **SRCH-03**: User can fall back to manual entry when search yields no results

### Notes & Reviews

- **NOTE-01**: User can take freeform notes while reading a book
- **NOTE-02**: User can write a review/reflection when marking a book as Read
- **NOTE-03**: User can assign a star rating (1–5) when finishing a book

### Queue Management

- **QUEUE-03**: User can tag books with labels (genre, mood, source)
- **QUEUE-04**: User can reorder/prioritize the to-read queue

### History

- **HIST-01**: User can view a chronological timeline of finished books with finish dates

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user / accounts | Personal tool — single user by design |
| Cloud sync / cross-device | Local browser storage only — no backend |
| Page/percentage progress tracking | Status-only is sufficient; pages add UI complexity without value |
| Reading stats / analytics | Basic history only; stats are a different product |
| Firefox popup or context menu | New tab page is the entire surface |
| Mobile or desktop app | Browser extension only |
| Barcode scanning | Camera API not available in new tab extension context |
| Social features (friends, sharing) | Deliberately out of scope — not a social platform |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Pending |
| CORE-02 | Phase 1 | Pending |
| CORE-03 | Phase 1 | Pending |
| CORE-04 | Phase 1 | Pending |
| ADR-01 | Phase 1 | Pending |
| ADR-02 | Phase 1 | Pending |
| ADR-03 | Phase 1 | Pending |
| DEV-01 | Phase 1 | Pending |
| DEV-02 | Phase 1 | Pending |
| DEV-03 | Phase 1 | Pending |
| DEV-04 | Phase 1 | Pending |
| DEV-05 | Phase 1 | Pending |
| DEV-06 | Phase 1 | Pending |
| LIB-01 | Phase 2 | Pending |
| LIB-02 | Phase 2 | Pending |
| LIB-03 | Phase 2 | Pending |
| LIB-04 | Phase 2 | Pending |
| DISP-01 | Phase 2 | Pending |
| DISP-02 | Phase 2 | Pending |
| DISP-03 | Phase 2 | Pending |
| QUEUE-01 | Phase 3 | Pending |
| QUEUE-02 | Phase 3 | Pending |
| DATA-01 | Phase 4 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
