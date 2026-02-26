---
phase: 02-extension-scaffold
plan: "01"
status: complete
completed: "2026-02-26"
---

## Summary

Plan 02-01 performed the mandatory Phase 2 tidy-up, installed Oxlint + Oxfmt code quality tooling, and wrote four ADRs documenting architectural decisions before any implementation code.

### Tasks Completed

1. **Tidy-up + Oxc tooling (DEV-05)** — Reviewed codebase (no src files exist yet — only config and docs from Phase 1). Ran `npx tsc --noEmit` (no inputs, trivially clean) and `npm run test` (no test files, passes). Installed `oxlint` and `oxfmt` as devDependencies. Added `lint`, `lint:fix`, `fmt`, `fmt:check` scripts to package.json. Created `.oxfmtrc.json` with ignorePatterns for `.planning/` and `.claude/` directories. Applied oxfmt formatting to existing config files.

2. **ADR-0006 (Playwright/Chromium E2E)** — Wrote `0006-playwright-e2e.org` documenting the 4-tier testing strategy: Vitest unit (Node) -> Vitest browser (Chromium) -> Playwright E2E (Chromium) -> Manual Firefox acceptance. Documents why E2E runs in Chromium (Playwright's Firefox build cannot load extensions). Includes Mermaid test pyramid diagram, SVG generated via mmdc.

3. **ADR-0007 (XState v5)** — Wrote `0007-xstate.org` documenting XState v5 as the state management solution. All stateful logic flows through machines/actors. App machine pattern: loading -> ready -> error. Alternatives considered: useState/useReducer, Zustand, Redux. Includes Mermaid state diagram, SVG generated via mmdc.

4. **ADR-0008 (browser.storage.local)** — Wrote `0008-storage-local.org` documenting browser.storage.local as sole persistence. Single root key `booktab_data` with schemaVersion: 1. TanStack Query wrapper for all access. Never use window.localStorage. Includes Mermaid data flow diagram, SVG generated via mmdc.

5. **ADR-0011 (Oxc linting/formatting)** — Wrote `0011-oxc.org` documenting Oxlint + Oxfmt as the project's linting and formatting tools, replacing ESLint + Prettier. Greenfield decision (no migration). VoidZero ecosystem alignment with Vite. Includes Mermaid tooling flow diagram, SVG generated via mmdc.

6. **ADR tracking updated** — README.org Current ADRs table updated with 0006, 0007, 0008, 0011. STATE.org ADR log updated to mark all four as Written. Stack line updated to include Oxlint + Oxfmt.

### Requirements Satisfied

- ADR-02: ADRs written before implementation (0006, 0007, 0008, 0011)
- ADR-03: ADRs include Mermaid diagrams where applicable
- DEV-05: Tidy-up commit performed before any new Phase 2 work

### Files Created

- `docs/decisions/0006-playwright-e2e.org`
- `docs/decisions/0007-xstate.org`
- `docs/decisions/0008-storage-local.org`
- `docs/decisions/0011-oxc.org`
- `docs/decisions/images/0006-playwright-e2e.svg`
- `docs/decisions/images/0007-xstate-app-machine.svg`
- `docs/decisions/images/0008-storage-data-flow.svg`
- `docs/decisions/images/0011-oxc-tooling-flow.svg`
- `.oxfmtrc.json`

### Files Modified

- `package.json` (oxlint + oxfmt deps, lint/fmt scripts)
- `vitest.config.ts` (oxfmt formatting applied)
- `docs/decisions/README.org` (ADR table updated)
- `.planning/STATE.org` (ADR log, stack, todos, position updated)

### Verification

- All 4 ADRs have `Status: Accepted`
- All 4 ADRs contain `#+begin_src mermaid :file` blocks
- All 4 SVGs generated via mermaid-cli (not placeholders)
- `npm run test` passes (no test files)
- `npm run lint` passes (0 warnings, 0 errors)
- `npm run fmt:check` passes (all files correctly formatted)

### Deviations

- Added ADR-0011 (Oxc) which was not in the original plan — user requested Oxlint + Oxfmt as the linting/formatting toolchain during planning.
- SVGs generated via `@mermaid-js/mermaid-cli` (installed temporarily, then removed) rather than Emacs ob-mermaid. The org-mode source blocks remain correct for Emacs execution.
