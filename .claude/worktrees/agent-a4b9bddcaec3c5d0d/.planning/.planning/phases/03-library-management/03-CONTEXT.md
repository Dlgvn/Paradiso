# Phase 3: Library Management - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build and manage the full media library. Users can search external APIs (OMDB for movies/series, Open Library for books) to find items, add them with status and rating, update status/favorite from library cards, delete items, filter by status, and toggle between grid and list views. Duplicate detection warns before re-adding. This phase does NOT include the item detail page (Phase 4) or local library full-text search implementation (Phase 4) — though the /search page scaffolds the "My Library" tab as a placeholder.

</domain>

<decisions>
## Implementation Decisions

### Search & Add Flow

- **Search location:** Dedicated `/search` page (Phase 1 decision — top-level nav destination).
- **Search page tabs:** Two tabs: **"Add New"** (queries OMDB/Open Library APIs) and **"My Library"** (local library search, implemented in Phase 4 — scaffold the tab in Phase 3 but it can be a placeholder/coming-soon state).
- **Type selector:** Search page has a Movies / Books / Series toggle/tab. Searching queries one type at a time — Movies/Series → OMDB, Books → Open Library.
- **Results display:** Poster grid — consistent with library view. Each result card: poster, title, year.
- **Add flow:** Tapping a search result opens a picker with **status + rating together** (both set at add time). Status: Watchlist / Watching / Completed / Dropped. Rating: 1–10 (optional at add time — can be skipped/set later).
- **After adding:** Stay on the search page. The result card shows an "Added" badge or checkmark. User can keep searching and add more without navigating away.

### Item Edit Interactions (from Library Cards)

- **Card hover overlay covers:** Status change + favorite toggle. Rating is NOT editable from the card — it's set in the detail view (Phase 4).
- **Status change on hover:** Tapping the status badge on the hover overlay opens a **dropdown/popover** with all 4 statuses (Watchlist / Watching / Completed / Dropped). User selects one. Intentional, not a cycle-on-tap.
- **Favorite toggle on hover:** Heart icon toggles directly on tap. No confirmation needed.
- **Delete:** Only available from the item detail view (Phase 4). No delete action on the library card. Reduces accidental deletions.

### Duplicate Detection

- **Detection method:** By external API unique ID — IMDB ID for movies/series, ISBN or Open Library Work ID for books. Most accurate, avoids false positives from remakes or common-title books.
- **Warning style:** Soft warning — the search result card shows the existing status badge ("Already in Watchlist") so the user knows before tapping. If user taps anyway, a confirmation appears: "This is already in your library as [Status]. Add anyway?" User can proceed or cancel.
- **Hard block:** Not used — user can choose to re-add (e.g., re-reading a book).

### Empty States

- **Per-tab empty state:** Same cinematic empty state as the full-library empty state (dark backdrop, tagline, Search CTA) — NOT a plain text message.
- **Context-aware copy:** The tagline and CTA text adapt to the status tab:
  - Watchlist (empty): "Find your next watch" → Search button
  - Watching (empty): "Start something new" → Search button
  - Completed (empty): "Nothing finished yet — keep going" → Search button (or no CTA if that feels odd)
  - Dropped (empty): "Nothing dropped yet" → no CTA needed
- **Full library empty state** (no items at all, from Phase 1): Cinematic placeholder with general tagline + prominent Search CTA. Unchanged.

### Claude's Discretion

- Exact UI for the status + rating picker at add time (bottom sheet, modal, inline form)
- Exact animation for the "Added" badge appearing on search result cards
- Poster grid column count on mobile vs. desktop
- Loading skeleton for search result cards while API is fetching
- Error state when OMDB or Open Library API returns an error
- "My Library" tab placeholder copy/design in Phase 3

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 14 App Router, Supabase, TypeScript, server-side OMDB key)
- `.planning/REQUIREMENTS.md` — LIB-01 through LIB-10 (all library management requirements)
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, plan breakdown (03-01 through 03-05)

### Prior phase decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — Card design (frosted glass, hover overlay), navigation structure, status tabs, empty state pattern — all carry forward into Phase 3
- `.planning/phases/02-authentication/02-CONTEXT.md` — Auth/RLS pattern; Phase 3 DB schema must use `auth.uid()` for row ownership

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

Phase 1 will establish (consumed by Phase 3):
- Frosted glass card component — library grid cards use this
- Design system tokens — all Phase 3 UI uses Phase 1 tokens
- Supabase client — all library mutations and queries go through this

Phase 2 will establish (consumed by Phase 3):
- `auth.uid()` RLS pattern — Phase 3 DB schema uses this for `media_items` table ownership
- Session/middleware infrastructure — library pages are protected routes

### Established Patterns

- Cards: poster-only at rest, hover overlay with status dropdown + favorite toggle (Phase 1)
- Grid/list toggle: both views supported (Phase 1)
- Status tabs: Watchlist | Watching | Completed | Dropped within each media type page (Phase 1)
- Media type pages: `/movies`, `/books`, `/series` as separate top-level routes (Phase 1)
- Progress bar: thin bar at bottom of cards for in-progress series (Phase 1)

### Integration Points

- `/search` page: added as a nav destination in Phase 1 layout shell — Phase 3 implements its content
- `media_items` table: created in Phase 3 (03-01), used by all subsequent phases
- OMDB key is server-side (Next.js Server Action or Route Handler) — never exposed to client
- Open Library is keyless/public — can be called from Server Action or client

</code_context>

<specifics>
## Specific Ideas

- Search result cards that are already in the library should visually distinguish themselves (status badge overlay on the poster) — consistent with the library card hover behavior
- The add flow (status + rating picker) should feel native to the cinematic aesthetic — think a bottom sheet or floating panel, not a jarring modal

</specifics>

<deferred>
## Deferred Ideas

- **Local library full-text search** (My Library tab) — the tab is scaffolded in Phase 3 but the search functionality is Phase 4 (SRCH-01, SRCH-02)
- **Rating from card hover** — user wanted rating on hover but this was deferred to keep cards clean; rating is in the detail view (Phase 4)

</deferred>

---

*Phase: 03-library-management*
*Context gathered: 2026-03-20*
