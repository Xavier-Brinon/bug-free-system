---
phase: 02-extension-scaffold
plan: "03"
status: complete
completed: "2026-02-26"
---

## Summary

Plan 02-03 created the data schema and storage layer using TDD, locking the data shape with schemaVersion: 1 and wiring TanStack Query into the React tree.

### Tasks Completed

1. **src/schema.ts with TDD** — 10 unit tests covering getDefaultData(), STORAGE_KEY, Zod validation (valid objects, missing schemaVersion, invalid status, all enum values). Types (BookTabData, BookRecord, UserSettings) derived from Zod schemas for single source of truth. getDefaultData() returns `{ schemaVersion: 1, books: {}, settings: { defaultView: 'current' } }`.

2. **src/storage.ts with TDD** — 6 unit tests covering createQueryClient(), loadBookTabData() (empty storage, valid data, invalid data), saveBookTabData() (write + round-trip). browser.storage.local mocked via vi.mock('webextension-polyfill'). Validates stored data with Zod schema; returns defaults on invalid data. Wraps storage.set() in try/catch for quota errors.

3. **QueryClientProvider wired into main.tsx** — main.tsx updated to wrap `<App />` in `<QueryClientProvider>` using createQueryClient() from storage module. Build and tests pass.

### Requirements Satisfied

- CORE-03: Data schema includes schemaVersion field from day one

### Files Created

- `src/schema.ts`
- `src/storage.ts`
- `tests/unit/schema.test.ts`
- `tests/unit/storage.test.ts`

### Files Modified

- `src/newtab/main.tsx` (QueryClientProvider wrapper)

### Verification

- `npm run test -- --project unit` passes all 16 tests (10 schema + 6 storage)
- `npm run build` succeeds
- `npm run lint` passes (0 warnings, 0 errors)
- `npm run fmt:check` passes
- getDefaultData().schemaVersion === 1
- storage.ts is the only module that calls browser.storage.local

### Deviations

- TanStack Query hooks (useBookTabData, useAddBook, etc.) are not yet exported from storage.ts — they will be added when needed in later phases. The current API exports the lower-level functions (loadBookTabData, saveBookTabData) which are sufficient for the app machine integration in Plan 02-04.
