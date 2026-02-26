---
phase: 03-library-crud
plan: "01"
status: complete
started: 2026-02-26
completed: 2026-02-26
---

## Summary

Plan 03-01 delivered the foundational logic layer for Phase 3 (Library CRUD):
a `createBookRecord()` factory and an XState v5 library machine handling all
four CRUD operations.

## What was done

### Task 1: Phase 3 tidy-up
- Ran lint, format check, and tests
- Fixed formatting issue in `package.json` (from engines field added earlier)
- Tidy-up commit created

### Task 2: createBookRecord() factory (TDD)
- Added `BookStatus` type export to `src/schema.ts`
- Implemented `createBookRecord()` with:
  - `crypto.randomUUID()` for unique ids
  - Default status: `want_to_read`
  - ISO timestamp for `addedAt`
  - Empty `tags: []` and `priority: 0`
  - Optional `coverUrl` and `status` overrides
- 6 new tests in `tests/unit/schema.test.ts`

### Task 3: libraryMachine (TDD)
- Created `src/machines/libraryMachine.ts` with:
  - Single `idle` state (CRUD ops are synchronous context mutations)
  - `ADD_BOOK`: adds BookRecord keyed by id
  - `UPDATE_BOOK`: merges partial updates into existing book (no-op for missing id)
  - `DELETE_BOOK`: removes book by id (no-op for missing id)
  - `SET_STATUS`: changes status + auto-populates `startedAt` (on reading) and `finishedAt` (on read)
  - `emit("SAVE_NEEDED")` after every mutation for parent persistence signalling
- 11 new tests in `tests/unit/libraryMachine.test.ts`

## Test results

- 43 total tests passing (40 unit + 3 storybook)
- 17 new tests added in this plan (6 schema + 11 library machine)
- Lint: 0 warnings, 0 errors
- Format: clean

## Deviations

- Plan specified 11 library machine tests; implemented exactly 11
- Used XState v5 `emit()` action for SAVE_NEEDED instead of `sendParent()` —
  `emit()` is more flexible and doesn't require the machine to be spawned as
  a child actor

## Files modified

- `package.json` (formatting fix)
- `src/schema.ts` (added `BookStatus` type, `createBookRecord()` factory)
- `tests/unit/schema.test.ts` (6 new tests)
- `src/machines/libraryMachine.ts` (new file)
- `tests/unit/libraryMachine.test.ts` (new file)
