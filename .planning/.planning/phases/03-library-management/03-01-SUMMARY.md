---
phase: 03-library-management
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, server-actions, zod, typescript, next14]

# Dependency graph
requires:
  - phase: 02-authentication
    provides: auth.users table and RLS pattern using auth.uid() for row ownership
provides:
  - media_items PostgreSQL table with RLS enforcing user-scoped access
  - TypeScript domain types MediaItem, MediaType, MediaStatus, AddMediaItemInput
  - Supabase placeholder generated types (to regenerate after migration applied)
  - 6 library CRUD Server Actions: addMediaItem, updateItemStatus, updateItemRating, toggleFavorite, deleteMediaItem, checkDuplicate
affects: [03-02, 03-03, 03-04, 03-05, 04-detail, 05-analytics, 07-migration]

# Tech tracking
tech-stack:
  added: [zod ^3.x]
  patterns:
    - Single polymorphic media_items table with media_type discriminator column
    - RLS policies using (select auth.uid()) = user_id (100x performance vs bare auth.uid())
    - Zod schemas defined at module scope (not inside functions) for Server Actions
    - Server Actions pattern: validate -> auth -> mutate -> revalidatePath (outside try/catch) -> return

key-files:
  created:
    - supabase/migrations/001_media_items.sql
    - src/types/media.ts
    - src/types/supabase.ts
    - src/app/actions/library.ts
  modified: []

key-decisions:
  - "Single polymorphic media_items table chosen over separate per-type tables — simpler RLS, Phase 5 analytics queries, and Phase 7 migration all benefit"
  - "RLS policies use (select auth.uid()) not bare auth.uid() — 100x performance difference per Supabase docs"
  - "unique_user_item constraint on (user_id, external_id) enables fast duplicate detection without a separate lookup"
  - "addMediaItem returns { error: 'DUPLICATE' } on constraint violation — soft warning for re-adding items"
  - "revalidatePath calls placed outside try/catch — NEXT_REDIRECT pattern established in Phase 2 carries forward"
  - "supabase.ts placeholder handwritten with matching types — regenerate after migration applied via supabase gen types"

patterns-established:
  - "Pattern 1: Library Server Action structure — validate (zod, module-scope schema) -> auth (supabase.auth.getUser()) -> mutate (supabase.from()) -> revalidate (revalidatePath outside try/catch) -> return { success } | { error }"
  - "Pattern 2: Belt-and-suspenders user_id check — .eq('user_id', user.id) in every mutation even with RLS active"
  - "Pattern 3: date_completed lifecycle — set to now() when status transitions to 'completed', null otherwise"

requirements-completed: [LIB-03, LIB-04, LIB-05, LIB-06, LIB-07]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 3 Plan 01: Library Management — Database Schema and Server Actions Summary

**PostgreSQL media_items table with row-level security and 6 Supabase Server Actions covering the full library CRUD contract (add, status, rating, favorite, delete, duplicate-check)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-22T05:48:56Z
- **Completed:** 2026-03-22T05:50:38Z
- **Tasks:** 2
- **Files modified:** 4 created, 2 modified (package.json, package-lock.json for zod)

## Accomplishments

- Created migration SQL with media_items table, media_type/media_status enums, 4 RLS policies using performance-optimized `(select auth.uid())` form, 3 composite indexes, and unique_user_item constraint for O(1) duplicate detection
- Exported complete TypeScript domain types (MediaItem, MediaType, MediaStatus, AddMediaItemInput, STATUS_LABELS, MEDIA_TYPE_LABELS) matching SQL schema exactly
- Built 6 Server Actions all following validate -> auth -> mutate -> revalidate -> return pattern with zod validation, belt-and-suspenders user_id equality check, and revalidatePath outside try/catch

## Task Commits

Each task was committed atomically:

1. **Task 1: Create media_items migration and domain types** - `9edd8fe` (feat)
2. **Task 2: Create library CRUD Server Actions** - `a7ea6ce` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `supabase/migrations/001_media_items.sql` - PostgreSQL migration: media_items table, enums, RLS policies, indexes, unique constraint
- `src/types/media.ts` - TypeScript domain types for all library entities and helper constants
- `src/types/supabase.ts` - Handwritten placeholder DB types; regenerate via `supabase gen types typescript` after migration is applied
- `src/app/actions/library.ts` - All 6 library Server Actions with zod validation and Supabase mutations
- `package.json` / `package-lock.json` - Added zod ^3.x dependency

## Decisions Made

- Single polymorphic `media_items` table (not separate movies/books/series tables) — aligns with Phase 5 analytics and Phase 7 import requirements
- `(select auth.uid())` in all RLS policies — Supabase-recommended form for ~100x index scan performance over bare `auth.uid()`
- `unique_user_item unique (user_id, external_id)` constraint — enables duplicate detection at DB layer, `addMediaItem` catches the error and returns `{ error: 'DUPLICATE' }` for soft-warning UX
- `revalidatePath` for /movies, /books, /series on all mutations — since item type is unknown from just an id, all library paths are revalidated
- Supabase types placeholder created manually to match schema — future phases should regenerate after applying migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing zod dependency**
- **Found during:** Task 2 (Create library CRUD Server Actions)
- **Issue:** zod not in package.json; `import { z } from 'zod'` would fail at runtime
- **Fix:** Ran `npm install zod`
- **Files modified:** package.json, package-lock.json
- **Verification:** `node -e "require('zod')"` passes
- **Committed in:** a7ea6ce (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Necessary for functionality. No scope creep.

## Issues Encountered

None — plan executed cleanly with one auto-fix for the missing dependency.

## User Setup Required

**Migration must be applied to Supabase before Phase 3 library UI works.**

After connecting your Supabase project:
1. Apply migration: run `supabase db push` or paste `supabase/migrations/001_media_items.sql` into the Supabase SQL editor
2. Regenerate types: `npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/supabase.ts`

## Next Phase Readiness

- Backend contract for Phase 3 is complete — all Server Actions are ready to consume from library UI and search page
- 03-02 can immediately import from `src/app/actions/library.ts` and `src/types/media.ts`
- Migration must be applied before integration tests against live DB will work

## Self-Check: PASSED

- FOUND: supabase/migrations/001_media_items.sql
- FOUND: src/types/media.ts
- FOUND: src/types/supabase.ts
- FOUND: src/app/actions/library.ts
- FOUND: 03-01-SUMMARY.md
- Commits 9edd8fe and a7ea6ce verified in git log

---
*Phase: 03-library-management*
*Completed: 2026-03-22*
