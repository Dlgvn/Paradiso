---
phase: 04-detail-view-library-search
plan: "00"
subsystem: testing
tags: [jest, rtl, testing-infrastructure, test-stubs]
dependency_graph:
  requires: []
  provides: [jest-config, test-stubs-detail, test-stubs-search]
  affects: [04-01, 04-02]
tech_stack:
  added: [jest, ts-jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jest-environment-jsdom]
  patterns: [next/jest createJestConfig, jsdom test environment, RTL]
key_files:
  created:
    - media-tracker-v3/jest.config.ts
    - media-tracker-v3/jest.setup.ts
    - media-tracker-v3/src/__tests__/components/detail/CinematicBackdrop.test.tsx
    - media-tracker-v3/src/__tests__/components/detail/ItemDetailPage.test.tsx
    - media-tracker-v3/src/__tests__/lib/search/filter.test.ts
    - media-tracker-v3/src/__tests__/components/search/LibrarySearchInput.test.tsx
  modified:
    - media-tracker-v3/package.json
decisions:
  - "Used next/jest.js (explicit .js extension) instead of next/jest — required for ESM module resolution in Jest 30"
  - "setupFilesAfterEnv is the correct Jest config key for running setup after the test framework is installed"
  - "testPathPattern replaced by testPathPatterns in Jest 30"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-16"
  tasks_completed: 1
  files_created: 6
  files_modified: 2
---

# Phase 04 Plan 00: Jest + RTL Test Infrastructure Summary

**One-liner:** Jest 30 + React Testing Library configured with next/jest and 4 passing test stubs for the detail view and library search features.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install Jest + RTL, create jest.config.ts, jest.setup.ts, 4 test stubs | 3f84d6d |

## Verification Results

- `npx jest --testPathPatterns="detail|filter|LibrarySearch" --passWithNoTests` — 4 suites, 4 tests passed
- `npx jest` (full suite) — 4 suites, 4 tests passed
- jest.config.ts uses `nextJest` from `next/jest.js` with jsdom environment and `@/*` path alias
- jest.setup.ts imports `@testing-library/jest-dom`
- package.json has `"test": "jest"` script

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESM module resolution for next/jest**
- **Found during:** Task 1 verification
- **Issue:** `import nextJest from 'next/jest'` failed with ERR_MODULE_NOT_FOUND in Jest 30 ESM context
- **Fix:** Changed import to `'next/jest.js'` (explicit extension required for ESM resolution)
- **Files modified:** jest.config.ts
- **Commit:** 3f84d6d

**2. [Rule 1 - Bug] Fixed deprecated Jest CLI flag**
- **Found during:** Task 1 verification
- **Issue:** `--testPathPattern` was replaced by `--testPathPatterns` in Jest 30
- **Fix:** Updated verification command; no config change needed
- **Commit:** N/A (CLI-only, not in config files)

## Known Stubs

| File | Stub Description |
|------|-----------------|
| src/__tests__/components/detail/CinematicBackdrop.test.tsx | Placeholder `expect(true).toBe(true)` — real assertions added in Plan 01 |
| src/__tests__/components/detail/ItemDetailPage.test.tsx | Placeholder `expect(true).toBe(true)` — real assertions added in Plan 01 |
| src/__tests__/lib/search/filter.test.ts | Placeholder `expect(true).toBe(true)` — real assertions added in Plan 02 |
| src/__tests__/components/search/LibrarySearchInput.test.tsx | Placeholder `expect(true).toBe(true)` — real assertions added in Plan 02 |

Note: All stubs are intentional — they satisfy the Nyquist sampling contract defined in VALIDATION.md Wave 0. They will be filled with real assertions in Plans 01 and 02.

## Threat Flags

None — this plan only adds test infrastructure with no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- jest.config.ts: FOUND
- jest.setup.ts: FOUND
- CinematicBackdrop.test.tsx: FOUND
- ItemDetailPage.test.tsx: FOUND
- filter.test.ts: FOUND
- LibrarySearchInput.test.tsx: FOUND
- Commit 3f84d6d: FOUND
