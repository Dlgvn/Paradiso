---
phase: 05-analytics-recommendations
plan: "03"
subsystem: analytics
tags: [recommendations, server-action, omdb, open-library, ui]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [getRecommendations Server Action, RecommendationCard, RecommendationsSection]
  affects: [analytics page]
tech_stack:
  added: []
  patterns: [Server Action, dynamic import, discriminated union, Promise.allSettled]
key_files:
  created:
    - src/app/actions/recommendations.ts
    - src/components/analytics/RecommendationCard.tsx
    - src/components/analytics/RecommendationsSection.tsx
  modified:
    - src/app/(app)/analytics/AnalyticsClient.tsx
decisions:
  - Used dynamic import with ssr:false for AddItemDialog to avoid heavy sheet/dialog on SSR
  - Capped recommendations at 5 via .slice(0, 5) per D-06
  - Parallel OMDB + Open Library fetch via Promise.allSettled for resilience
  - Fetch-once-on-mount pattern (reloadKey increment only on explicit "Try again")
metrics:
  duration: ~25 minutes
  completed: 2026-05-07T02:34:00Z
  tasks_completed: 2
  tasks_total: 3
  files_created: 3
  files_modified: 5
---

# Phase 5 Plan 03: Recommendations Layer Summary

**One-liner:** Server Action fetches OMDB movies + Open Library books by top genre, dedupes against library, returns 3-5 typed candidates rendered as cinematic recommendation cards with Add-to-Library CTA.

## Tasks Completed

| Task | Status | Commit | Description |
|------|--------|--------|-------------|
| 1 | Done | 292cd42 | getRecommendations Server Action |
| 2 | Done | 784dbf8 | RecommendationCard + RecommendationsSection + AnalyticsClient integration |
| 3 | Checkpoint | — | Human-verify /analytics page (pending) |

## What Was Built

### Task 1: getRecommendations Server Action (`src/app/actions/recommendations.ts`)
- `'use server'` directive at top (OMDB key never reaches browser bundle)
- Auth check via `supabase.auth.getUser()` — returns `UNAUTHORIZED` error if not logged in
- Fetches user's full library, derives top genre via `topGenreWithReason()` from analytics.ts
- `Promise.allSettled` parallel fetch: up to 3 OMDB movie results + up to 2 Open Library book results
- Dedupes against existing `external_id` set
- Hard cap: `.slice(0, 5)` total candidates
- Returns discriminated union: `{ recommendations, error: null }` or `{ recommendations: [], error: 'UNAUTHORIZED' | 'NO_DATA' | 'API_ERROR' }`

### Task 2: UI Components + Integration
- **RecommendationCard**: 80px poster (or Film icon placeholder), title, year, reason string, "Add to Library" button
- **RecommendationsSection**: Four LoadStates (loading/empty/error/ready), dynamic AddItemDialog import with `ssr: false`, fetch once on mount via `useEffect([reloadKey])`, "Try again" increments reloadKey
- **AnalyticsClient**: Added `import { RecommendationsSection }` + `<RecommendationsSection />` below the chart grid

### UI-SPEC Copy (all present)
- "Recommended for You" (section title)
- "Based on your top genres and highest-rated titles" (subtitle)
- "Not enough data yet" (empty heading)
- "Complete or rate a few items to unlock recommendations." (empty body)
- "Could not load recommendations. Check your connection and try again." (error)
- "Try again" (retry CTA)
- "Add to Library" (card CTA)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing type errors blocking build**
- **Found during:** Task 2 build verification
- **Issue:** Three call sites passed 3 arguments to `updateItemStatus(id, status)` and `toggleFavorite(id, bool)` which accept 2; one call site passed `mediaType` prop to `DuplicateWarningDialog` which doesn't declare it
- **Fix:** Removed extra `item.media_type` argument from `ItemDetailSheet.tsx`, `MediaCard.tsx`, `MediaListItem.tsx`; removed `mediaType={selectedItem.mediaType}` from `SearchPageClient.tsx`
- **Files modified:** src/components/detail/ItemDetailSheet.tsx, src/components/library/MediaCard.tsx, src/components/library/MediaListItem.tsx, src/components/search/SearchPageClient.tsx
- **Commit:** 784dbf8

**2. [Rule 3 - Blocking] `recharts` not installed in worktree**
- **Found during:** Task 2 build — `Module not found: Can't resolve 'recharts'`
- **Fix:** `npm install recharts` in the worktree (the original media-tracker-v3 has it; worktree had its own node_modules)
- **Commit:** 784dbf8

## Checkpoint Status

Task 3 is a `checkpoint:human-verify` gate. The dev server can be started with `npm run dev` and the `/analytics` page verified visually per the 9-step checklist in the plan.

## Known Stubs

None — recommendations are fetched from live OMDB and Open Library APIs.

## Threat Surface Scan

No new network endpoints beyond those covered in the plan's threat model. The `'use server'` directive on `recommendations.ts` ensures OMDB key isolation is enforced by Next.js bundler.

## Self-Check
## Self-Check: PASSED
