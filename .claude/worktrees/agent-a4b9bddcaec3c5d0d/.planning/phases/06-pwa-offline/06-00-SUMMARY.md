---
phase: 06-pwa-offline
plan: "00"
subsystem: pwa-foundation
tags: [pwa, foundation, dexie, serwist, jest, supabase, fake-indexeddb]
dependency_graph:
  requires: []
  provides:
    - supabase/migrations/002_media_items_updated_at.sql
    - src/app/~offline/page.tsx
    - public/icons/icon-{192,512,192-maskable,512-maskable}.png
    - src/__tests__/manifest.test.ts
    - src/__tests__/lib/db/schema.test.ts
    - src/__tests__/lib/db/sync-queue.test.ts
    - src/__tests__/lib/sync/sync-engine.test.ts
  affects:
    - jest.setup.ts
    - .gitignore
    - package.json
tech_stack:
  added:
    - fake-indexeddb@^6 (devDependency — IndexedDB polyfill for jsdom Jest)
  patterns:
    - it.todo stubs (Jest pending tests for future plans to implement)
    - force-static Next.js route for Serwist offline fallback
key_files:
  created:
    - supabase/migrations/002_media_items_updated_at.sql
    - src/app/~offline/page.tsx
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/icon-192-maskable.png
    - public/icons/icon-512-maskable.png
    - src/__tests__/manifest.test.ts
    - src/__tests__/lib/db/schema.test.ts
    - src/__tests__/lib/db/sync-queue.test.ts
    - src/__tests__/lib/sync/sync-engine.test.ts
  modified:
    - jest.setup.ts
    - .gitignore
    - package.json
    - package-lock.json
decisions:
  - "fake-indexeddb@^6 chosen as devDependency; imported via fake-indexeddb/auto side-effect in jest.setup.ts"
  - "PWA icons generated programmatically with Node zlib — solid #0a0a0f RGBA PNGs; visual polish deferred to later plan"
  - "it.todo stubs used so tests are pending (not failing) while real implementations land in Wave 1/2"
  - "~offline page uses force-static + no AppShell so it serves without JS hydration"
metrics:
  completed_date: "2026-05-07"
  tasks_completed: 3
  files_created: 10
  files_modified: 4
---

# Phase 06 Plan 00: PWA Foundation (Wave 0 Prerequisites) Summary

Wave 0 foundation establishing every prerequisite needed by Phase 6 parallel plans: the `updated_at` Supabase migration for last-write-wins sync (D-02), fake-indexeddb installed for Jest/jsdom Dexie testing, four Jest stub files mapped to PWA-01/02/03/04 requirements, four PWA PNG icons, Serwist offline fallback page, and .gitignore exclusions for generated service worker artifacts.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | updated_at migration + fake-indexeddb install + jest.setup.ts | 65e360d |
| 2 | Wave 0 Jest test stubs (manifest, schema, sync-queue, sync-engine) | d9da0f2 |
| 3 | PWA icons, offline fallback page, .gitignore Serwist artifacts | 9f4e74d |

## Migration Details

**File:** `supabase/migrations/002_media_items_updated_at.sql`

**Exact column added:** `updated_at timestamptz not null default now()`

**User action required:** Before Plan 06-02 seeds IndexedDB from production data, apply the migration:
```bash
supabase db push
# or paste 002_media_items_updated_at.sql into Supabase SQL editor
```

The migration is idempotent (`add column if not exists`, `drop trigger if exists`, `create index if not exists`).

## fake-indexeddb Installation

- Package: `fake-indexeddb@^6.0.0` in `devDependencies`
- Registration: `jest.setup.ts` imports `fake-indexeddb/auto` as a side-effect
- Effect: Polyfills `indexedDB`, `IDBKeyRange`, etc. on the jsdom global — Dexie code runs in Jest without `ReferenceError`

## Test Stub Files

| File | Requirement | Todos |
|------|-------------|-------|
| `src/__tests__/manifest.test.ts` | PWA-01 | 3 it.todo + 1 active probe |
| `src/__tests__/lib/db/schema.test.ts` | PWA-02 | 4 it.todo |
| `src/__tests__/lib/db/sync-queue.test.ts` | PWA-03 | 3 it.todo |
| `src/__tests__/lib/sync/sync-engine.test.ts` | PWA-04 + D-02 | 4 + 2 it.todo |

`npm test` exits 0 with 16 todos reported as pending (not failures).

## PWA Icons

Generated programmatically via Node zlib — solid `#0a0a0f` (cinematic dark base) RGBA PNGs. All four files verified as valid PNG image data by `file` command. Visual/branded polish can be replaced in a later plan without breaking the manifest reference.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing TypeScript build errors preventing npm run build**

- **Found during:** Task 3 verification (`npm run build`)
- **Issue:** Multiple components called server actions with 3 arguments when the action signatures only accept 2: `updateItemStatus(id, status)` and `toggleFavorite(id, isFavorite)`. Also `DuplicateWarningDialog` received an undeclared `mediaType` prop.
- **Files modified:**
  - `src/components/detail/ItemDetailSheet.tsx` — removed extra `item.media_type` arg from `updateItemStatus`
  - `src/components/library/MediaCard.tsx` — removed extra `item.media_type` arg from both `updateItemStatus` and `toggleFavorite`
  - `src/components/library/MediaListItem.tsx` — same as MediaCard
  - `src/components/search/SearchPageClient.tsx` — removed `mediaType` prop from `DuplicateWarningDialogLazy`
- **Commit:** 9f4e74d (included in Task 3 commit)

## Verification Results

```
npm test: 8 suites, 16 todo, 5 passed — EXIT 0
npm run build: compiled successfully — EXIT 0
ls public/icons/: 4 PNG files
grep fake-indexeddb: found in package.json + jest.setup.ts
```

## Self-Check: PASSED

- [x] supabase/migrations/002_media_items_updated_at.sql exists
- [x] public/icons/icon-192.png, icon-512.png, icon-192-maskable.png, icon-512-maskable.png exist
- [x] src/app/~offline/page.tsx exists
- [x] src/__tests__/manifest.test.ts, schema.test.ts, sync-queue.test.ts, sync-engine.test.ts exist
- [x] Commits 65e360d, d9da0f2, 9f4e74d exist
- [x] npm test exits 0
- [x] npm run build exits 0
