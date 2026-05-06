# Phase 4: Detail View + Library Search - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Two capabilities delivered together: (1) a cinematic bottom-sheet detail view for any library item, and (2) real-time client-side search of the user's own library from the My Library tab on /search. The detail sheet shows poster, metadata, genre tags, synopsis, and allows rating edit + delete. Library search filters per media type using client-side data. Recommendations, analytics, PWA/offline, and data migration are all separate phases.

</domain>

<decisions>
## Implementation Decisions

### Detail Page Navigation

- **Pattern:** Bottom sheet overlay (NOT a full page / no URL change)
- **Entry:** Clicking any `MediaCard` or `MediaListItem` opens the sheet by sliding up from the bottom
- **Height:** ~85–90% of viewport height — leaves a small strip of the library visible at top for depth/context
- **Dismiss:** Tap the visible strip at top or drag down to close
- **Implementation:** `MediaCard` root div needs an `onClick` wired to open the sheet with the item's data

### Detail Sheet Layout & Backdrop

- **Background:** Poster image fills the sheet background with strong blur + dark overlay — same cinematic approach as the established `BackdropContext` pattern, but scoped to the sheet (not the global backdrop)
- **Poster display:** A sharp, un-blurred poster thumbnail (~120×180px) sits in the sheet header alongside title and year — gives a reference point while blurred version fills the background
- **Header area:** Poster card + title + year + external rating, laid out side by side at the top of the sheet
- **Metadata fields shown:**
  - Genre tags as pill components (parse comma-separated `genre` field)
  - Director (movies/series) or Author (books)
  - Plot / synopsis as a text block
  - External rating (IMDB or Open Library, stored in `external_rating`)
- **Status and favorite:** Displayed as read-only indicators in the sheet — not interactive (change via card hover overlay)

### Detail Sheet Actions

- **Rating edit:** 10-star tap selector — a row of 10 star icons, tap to set (1–10 scale). Tapping an already-filled star clears the rating (set to null). Updates optimistically, same pattern as card interactions.
- **Delete:** Inline confirm within the sheet — tapping a Delete button reveals a confirmation row: "Remove from library? [Cancel] [Remove]". No separate dialog. Sheet closes after deletion, library revalidates.
- **Status/favorite:** Read-only in sheet. No status dropdown or favorite toggle in the detail view — user changes those via card hover.

### Library Search

- **Location:** My Library tab on `/search` page only. Replaces `MyLibraryPlaceholder.tsx` with functional search. No search added to individual media type pages (/movies, /books, /series).
- **Scope:** Per-type filtered — user selects Movies / Books / Series (reuse existing `MediaTypeSelector` component), then searches within that type. Results are filtered from the fetched collection for that type.
- **Implementation:** Client-side filter on loaded data (fetch all items for selected type, filter in JS as user types). No DB calls per keystroke — works offline, instant results.
- **Fields searched:** `title`, `genre`, `director` (movies/series), `author` (books) — case-insensitive substring match
- **Results display:** Same grid/list view as library pages — reuse `MediaCard` and `MediaListItem` components. Grid by default, respects the view toggle if included.
- **Empty state:** "No results for '[query]'" — distinct from the no-items empty state

### Claude's Discretion

- Exact debounce timing for search input (suggest 200–300ms)
- Sheet open/close animation timing and easing
- How the sheet is triggered technically (React state, Vaul/shadcn Sheet component, or custom)
- Exact padding and typography within the sheet
- Loading skeleton for when sheet opens before data is confirmed

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 14 App Router, Supabase, TypeScript, cinematic design mandate)
- `.planning/REQUIREMENTS.md` — DETAIL-01, DETAIL-02, SRCH-01, SRCH-02 (all Phase 4 requirements)
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, plan breakdown (04-01, 04-02)

### Prior phase decisions that affect Phase 4
- `.planning/phases/01-foundation/01-CONTEXT.md` — BackdropContext pattern, design tokens, navigation structure, card pattern
- `.planning/phases/03-library-management/03-CONTEXT.md` — Phase 3 deferred rating edit and delete to detail view; My Library tab scaffolded as placeholder; card hover overlay only handles status + favorite

### Existing code to read before implementing
- `src/components/library/MediaCard.tsx` — Has cursor-pointer but no onClick; Phase 4 wires it to open sheet
- `src/components/library/MediaListItem.tsx` — Same: needs onClick for sheet
- `src/components/search/MyLibraryPlaceholder.tsx` — Will be replaced by functional search
- `src/types/media.ts` — All MediaItem fields (plot, genre, director, author, external_rating, etc.)
- `src/app/actions/library.ts` — Existing Server Actions (updateItemStatus, toggleFavorite) — Phase 4 adds updateRating, deleteItem

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MediaCard` — already renders status badge, rating stars, favorite heart. Needs onClick added to open detail sheet.
- `MediaListItem` — list view counterpart, also needs onClick for sheet.
- `MediaTypeSelector` — exists in `/search/page.tsx` already, can be reused for My Library tab type filter
- `LibraryGrid` — renders MediaCard grid; can be reused to display search results
- `BackdropContext.setBackdrop(src, key)` — established pattern for blur backdrop; Phase 4 replicates this approach scoped to the sheet
- `updateItemStatus`, `toggleFavorite` in `src/app/actions/library.ts` — pattern for rating and delete Server Actions

### Established Patterns
- Optimistic updates via `useOptimistic` + `useTransition` (established in MediaCard Phase 3)
- Toast errors via `sonner` on failed Server Actions
- Supabase server client via `createClient()` from `@/lib/supabase/server`
- RLS uses `(select auth.uid()) = user_id` pattern (Phase 3 decision)
- Status colors defined in MediaCard — reuse `STATUS_COLORS` record

### Integration Points
- `MediaCard` onClick → open sheet (pass `MediaItem` as sheet data)
- `/search` page My Library tab → replace `MyLibraryPlaceholder` with type selector + search input + filtered `LibraryGrid`
- Sheet delete action → calls new `deleteItem` Server Action → closes sheet, revalidates library path
- Sheet rating action → calls new `updateRating` Server Action → optimistic update within sheet

</code_context>

<specifics>
## Specific Ideas

- The bottom sheet should feel like pulling up a theater curtain — the blur backdrop behind the sheet content makes it feel like a cinema poster blown up behind you
- Rating stars should be generous touch targets on mobile — 44px minimum
- The sharp poster thumbnail in the header acts as an anchor while all the blurred background is the same image

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-detail-view-library-search*
*Context gathered: 2026-03-22*
