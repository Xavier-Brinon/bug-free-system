---
phase: 02-extension-scaffold
plan: "05"
status: complete
completed: "2026-02-26"
---

## Summary

Plan 02-05 set up Storybook for component isolation and Playwright for E2E smoke tests, completing the testing pyramid for Phase 2.

### Tasks Completed

1. **Storybook installed and configured** — Storybook v10 with `@storybook/react-vite` framework, Vite builder. Story discovery pattern: `src/**/*.stories.@(ts|tsx)`. Preview imports App.css for consistent styling. Storybook addon-vitest integration adds a `storybook` project to vitest.config.ts so stories can run as tests. Removed boilerplate `src/stories/` directory and unnecessary addons (onboarding, chromatic).

2. **App component stories** — `src/newtab/App.stories.tsx` with three stories (CSF 3 format):
   - Loading: QueryClient with never-resolving queryFn, machine stays in loading state
   - Ready: QueryClient with immediate resolve to getDefaultData(), machine transitions to ready
   - ErrorState: QueryClient with rejecting queryFn, machine transitions to error

3. **Playwright E2E smoke test** — `@playwright/test` installed, `playwright.config.ts` configured (Chromium only, tests/e2e/). `tests/e2e/newtab.spec.ts` loads the built extension via `chromium.launchPersistentContext()`, navigates to `chrome://newtab`, verifies "BookTab" text is visible. `npm run e2e` script builds the extension then runs the test. Test passes.

### Requirements Satisfied

- Testing pyramid complete for Phase 2:
  - Tier 1: Vitest unit (Node) — 23 tests
  - Tier 2: Vitest browser (Chromium) — available, no component tests yet
  - Tier 3: Playwright E2E (Chromium) — 1 smoke test
  - Tier 4: Manual Firefox (about:debugging) — human step

### Files Created

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `.storybook/vitest.setup.ts`
- `src/newtab/App.stories.tsx`
- `playwright.config.ts`
- `tests/e2e/newtab.spec.ts`

### Files Modified

- `vitest.config.ts` (added storybook project)
- `package.json` (Storybook deps, @playwright/test, e2e script)
- `.gitignore` (test-results/, playwright-report/, storybook entries)

### Verification

- `npm run test -- --project unit` passes all 23 tests
- `npm run e2e` builds extension and Playwright smoke test passes
- `npm run build` succeeds
- `npm run lint` passes (0 warnings, 0 errors)
- `npm run fmt:check` passes
- `.storybook/` directory exists with main.ts and preview.ts
- `playwright.config.ts` configures Chromium only
- No boilerplate Storybook stories remain

### Deviations

- Storybook v10 (not v8 as might have been expected) was installed — auto-detected by `storybook init`. The v10 init command uses different CLI flags and auto-adds addon-vitest integration.
- Removed `@chromatic-com/storybook` and `@storybook/addon-onboarding` addons that were auto-added by Storybook init — not needed for this project.
- Storybook added `@vitest/coverage-v8` and `playwright` as devDependencies during init — kept as they may be useful.
