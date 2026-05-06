# Phase 5: Analytics + Recommendations - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Two capabilities delivered together: (1) an analytics dashboard at `/stats` showing completion-by-month, genre breakdown, and rating distribution charts; and (2) a recommendations section below the charts showing 3–5 real title suggestions (sourced from OMDB/Open Library based on top genres) with a visible reason string. PWA/offline and data migration are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Chart Library

- **D-01:** Claude's discretion — pick the best fit for the cinematic dark theme and the existing Next.js/Tailwind stack. Recharts is the recommended default (React-native, composable, dark-theme-friendly, ~180KB) but Claude may choose differently if a better option emerges during research.

### Analytics Page Location

- **D-02:** Dedicated `/stats` route — a new page added to the sidebar nav as a standalone destination. Clean separation from the library pages.

### Analytics Data Scope

- **D-03:** Global view by default, with a media-type toggle (Movies / Books / Series / All). All three charts (completion-by-month, genre breakdown, rating distribution) respond to the toggle. Default is "All" (all types combined).

### Recommendations Source

- **D-04:** Real candidates sourced from external APIs — query OMDB (for movies/series) and Open Library (for books) using the user's top genres, then filter out titles already in the library. Server Action handles the API calls so the OMDB key stays server-side.

### Recommendations Display

- **D-05:** Recommendations appear as a scrollable section **below** the analytics charts on the same `/stats` page — no separate route.
- **D-06:** Show 3–5 recommendation cards at a time. Each card must display a reason string ("Because you rated [genre] highly" or "Because you completed [title]").

### Claude's Discretion

- Exact chart library (see D-01 — Recharts recommended, Claude decides)
- Chart color palette within the dark cinematic theme (crimson/gold accent tones from existing design system preferred)
- Recommendation card visual design (poster thumbnail + title + reason + "Add to library" CTA)
- How the media-type toggle is implemented (reuse `MediaTypeSelector` or a new tab strip)
- Caching strategy for recommendation API calls (avoid re-fetching on every visit)
- Empty state for each chart when user has no data in that category

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 14 App Router, Supabase, TypeScript, cinematic design mandate)
- `.planning/REQUIREMENTS.md` — ANALYTICS-01, ANALYTICS-02, ANALYTICS-03, REC-01, REC-02 (all Phase 5 requirements)
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, plan breakdown (05-01, 05-02)

### Prior phase decisions that affect Phase 5
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design tokens, cinematic dark theme, navigation/sidebar structure
- `.planning/phases/03-library-management/03-CONTEXT.md` — OMDB server-side key pattern, Open Library integration, Server Actions pattern
- `.planning/phases/04-detail-view-library-search/04-CONTEXT.md` — Optimistic updates pattern, existing components inventory

### Existing code to read before implementing
- `src/types/media.ts` — `MediaItem` fields: `date_completed`, `genre`, `user_rating`, `media_type` (all analytics data lives here)
- `src/app/actions/library.ts` — Existing Server Actions — analytics queries extend this file or add a new `analytics.ts`
- `src/app/(app)/layout.tsx` — Sidebar nav — Phase 5 adds a Stats nav item here
- `src/components/search/AddItemDialog.tsx` — Pattern for OMDB + Open Library API calls from Server Actions (recommendation engine reuses this approach)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MediaItem.date_completed` — ISO date string; completion-by-month groups by `date_completed.slice(0, 7)`
- `MediaItem.genre` — comma-separated string (e.g. "Action, Drama"); parse + count for genre breakdown
- `MediaItem.user_rating` — number 1–10 or null; bucket into ranges for distribution chart
- `MediaItem.media_type` — drives the per-type toggle filter
- `MediaTypeSelector` — exists in `/search`; candidate for reuse as the analytics type toggle
- OMDB server-side key pattern — already established in Phase 3 search; recommendation engine reuses same approach
- `sonner` toast — existing error pattern for failed Server Actions

### Established Patterns
- Server Actions in `src/app/actions/` with `createClient()` from `@/lib/supabase/server`
- Optimistic updates via `useOptimistic` + `useTransition`
- Cinematic dark palette: dark backgrounds, crimson/gold accents, backdrop blur

### Integration Points
- `/stats` route → new `src/app/(app)/stats/page.tsx`
- Sidebar nav → add Stats link in `src/app/(app)/layout.tsx`
- Analytics data → Server Action or direct Supabase query on page load (Server Component fetch preferred)
- Recommendation candidates → Server Action calling OMDB + Open Library with top-genre params, filtering out library titles

</code_context>

<specifics>
## Specific Ideas

- Chart colors should use the existing crimson/gold design tokens — not default blue/green library defaults
- Recommendation cards should feel like search result cards (poster + title + reason) with an "Add" CTA that reuses the existing add-item flow

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-analytics-recommendations*
*Context gathered: 2026-05-05*
