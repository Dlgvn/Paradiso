---
phase: 04-detail-view-library-search
plan: 01
subsystem: detail-view
tags: [detail-sheet, bottom-sheet, cinematic, rating, delete, library-grid]
dependency_graph:
  requires: ["04-00"]
  provides: ["ItemDetailSheet", "CinematicSheetBackdrop", "GenrePills", "RatingEditor", "DeleteConfirmRow"]
  affects: ["LibraryGrid", "MediaCard", "MediaListItem"]
tech_stack:
  added: ["shadcn Skeleton"]
  patterns: ["useOptimistic + useTransition for rating", "inline delete confirmation", "bottom sheet via shadcn Sheet"]
key_files:
  created:
    - src/components/detail/ItemDetailSheet.tsx
    - src/components/detail/CinematicSheetBackdrop.tsx
    - src/components/detail/GenrePills.tsx
    - src/components/detail/RatingEditor.tsx
    - src/components/detail/DeleteConfirmRow.tsx
    - src/components/ui/skeleton.tsx
  modified:
    - src/components/library/MediaCard.tsx
    - src/components/library/MediaListItem.tsx
    - src/components/library/LibraryGrid.tsx
decisions:
  - "Used shadcn Sheet side=bottom for native drag-to-dismiss behavior"
  - "LibraryGrid owns sheet state to keep MediaCard/MediaListItem stateless"
  - "DeleteConfirmRow calls onDeleted() optimistically before Server Action resolves"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 3
---

# Phase 04 Plan 01: Cinematic Detail Sheet Summary

**One-liner:** Cinematic bottom-sheet detail view with blurred poster backdrop, 10-star rating editor, and inline delete confirmation wired to all library cards.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create detail sheet components (backdrop, genre pills, rating editor, delete row, sheet container) | 777823f | 6 new files in src/components/detail/ + skeleton.tsx |
| 2 | Wire onClick on MediaCard and MediaListItem to open the detail sheet from LibraryGrid | 40fd2b5 | MediaCard.tsx, MediaListItem.tsx, LibraryGrid.tsx |

## What Was Built

### Task 1: Detail Sheet Components

Five new components in `src/components/detail/`:

- **CinematicSheetBackdrop** — Renders the poster as a `next/image fill` behind sheet content with `backdrop-blur-xl bg-black/60` overlay and a bottom-to-transparent gradient. Falls back to `bg-gradient-to-b from-[#16162a] via-[#0a0a0f] to-black` when no poster URL.
- **GenrePills** — Splits comma-separated genre string into pill-shaped `<span>` tags with `rounded-full text-xs bg-white/10` styling.
- **RatingEditor** — 10 star buttons at 44px touch targets (`w-11 h-11`), optimistic updates via `useOptimistic`, hover preview, tap-to-clear at current rating, "Tap to rate" hint when unrated.
- **DeleteConfirmRow** — Single "Remove from library" button that expands inline to "Remove from library? [Cancel] [Remove]" confirmation. Calls `onDeleted()` optimistically before Server Action.
- **ItemDetailSheet** — shadcn `Sheet` at `side="bottom"` occupying `h-[85vh]`. Assembles all sub-components with cinematic backdrop, poster thumbnail, title/year/external-rating/status badge, genre pills, director/author grid, synopsis, rating editor, and delete row. Guards against null item during close animation.

### Task 2: Library Grid Wiring

- **MediaCard** — Added optional `onItemClick?: (item: MediaItem) => void` prop; root div `onClick` calls it. Status dropdown and favorite button already had `e.stopPropagation()`.
- **MediaListItem** — Added `onItemClick` prop; root div gets `onClick` and `cursor-pointer`. Added `e.stopPropagation()` to status dropdown trigger button and favorite toggle button (previously missing).
- **LibraryGrid** — Imports `ItemDetailSheet`, manages `selectedItem` and `sheetOpen` state, passes `onItemClick={handleItemClick}` to all cards, renders `<ItemDetailSheet>` after the grid/list div.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all components render real data from `MediaItem`.

## Threat Flags

None — no new network endpoints or auth paths introduced. Components call existing Server Actions (`updateItemRating`, `deleteMediaItem`) with RLS-scoped Supabase queries.

## Self-Check: PASSED

- src/components/detail/ItemDetailSheet.tsx: FOUND
- src/components/detail/CinematicSheetBackdrop.tsx: FOUND
- src/components/detail/GenrePills.tsx: FOUND
- src/components/detail/RatingEditor.tsx: FOUND
- src/components/detail/DeleteConfirmRow.tsx: FOUND
- src/components/ui/skeleton.tsx: FOUND
- Commit 777823f: FOUND
- Commit 40fd2b5: FOUND
- TypeScript: compiles without errors (npx tsc --noEmit exits 0)
