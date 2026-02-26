---
phase: 03-library-crud
plan: "04"
status: complete
started: 2026-02-26
completed: 2026-02-26
---

## Summary

Plan 03-04 wired all Phase 3 components and machines into a working CRUD flow.
The user can now add books, see them in a list, edit details, change reading
status, and delete books — with all changes persisted to browser.storage.local.
Storybook stories were updated for all UI states and a Playwright E2E test
verifies the full add-list-delete flow.

## What was done

### Task 1: Extend appMachine with ready sub-states (TDD)
- Extended the `ready` state with compound sub-states:
  - `ready.viewing` (default): shows book list
  - `ready.adding`: shows empty BookForm
  - `ready.editing`: shows pre-filled BookForm
- New events: `START_ADD`, `START_EDIT` (with `bookId`), `CANCEL_FORM`, `BOOK_SAVED`
- Added `editingBookId` to context (set on `START_EDIT`, cleared on exit)
- 6 new tests in `tests/unit/appMachine.test.ts` (total: 13)
- Updated 2 existing tests to use `.matches()` for compound state checking

### Task 2: Wire App.tsx with full CRUD flow
- App renders `BookList` in `ready.viewing` with "Add Book" button
- App renders `BookForm` in `ready.adding` (empty) and `ready.editing` (pre-filled)
- Library machine actor persisted via `useRef` (initialized once on data load)
- All CRUD callbacks wired:
  - Add: `createBookRecord()` → `ADD_BOOK` → persist → `BOOK_SAVED`
  - Edit: `UPDATE_BOOK` → persist → `BOOK_SAVED`
  - Delete: `DELETE_BOOK` → persist
  - Status change: `SET_STATUS` → persist
- Persistence: reconstruct `BookTabData`, call `saveBookTabData()`, invalidate query cache
- Updated `App.css` with styles for form, card, and list layout

### Task 3: Update Storybook stories
- Updated `App.stories.tsx`: Loading, Empty, WithBooks, ErrorState
- Created `BookForm.stories.tsx`: AddMode, EditMode
- Created `BookCard.stories.tsx`: WantToRead, Reading, Read, MultipleAuthors
- Created `BookList.stories.tsx`: Empty, WithBooks
- Fixed vitest storybook project: added `optimizeDeps.include` for `storybook/test`
- 12 storybook tests passing (up from 3)

### Task 4: Playwright E2E test for CRUD flow
- Added CRUD E2E test: empty state → add book → verify in list → delete → empty state
- Existing smoke test preserved
- 2 E2E tests passing

## Test results

- 81 total tests passing:
  - 46 unit tests (13 appMachine + 11 libraryMachine + 16 schema + 6 storage)
  - 20 browser tests (8 BookForm + 8 BookCard + 4 BookList)
  - 12 storybook tests (4 App + 2 BookForm + 4 BookCard + 2 BookList)
  - 2 E2E tests (smoke + CRUD flow)
  - 1 lint check clean (0 warnings, 0 errors)
- Build succeeds

## Deviations

- Library machine actor managed via `useRef` rather than XState's `spawn()` —
  simpler integration since the library machine is synchronous and doesn't
  need parent-child actor communication
- Added `optimizeDeps.include: ["storybook/test"]` to vitest storybook project
  config to prevent dynamic import reload failures

## Files modified

- `src/machines/appMachine.ts` (extended with ready sub-states)
- `tests/unit/appMachine.test.ts` (6 new tests, 2 updated)
- `src/newtab/App.tsx` (rewired with full CRUD flow)
- `src/newtab/App.css` (updated with component styles)
- `src/newtab/App.stories.tsx` (updated with new stories)
- `src/components/BookForm.stories.tsx` (new file)
- `src/components/BookCard.stories.tsx` (new file)
- `src/components/BookList.stories.tsx` (new file)
- `vitest.config.ts` (storybook optimizeDeps fix)
- `tests/e2e/newtab.spec.ts` (added CRUD E2E test)
