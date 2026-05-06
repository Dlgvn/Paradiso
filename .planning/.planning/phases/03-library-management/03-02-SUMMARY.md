---
phase: 03-library-management
plan: 02
subsystem: api
tags: [omdb, open-library, server-actions, fetch, next-cache]

# Dependency graph
requires:
  - phase: 03-library-management
    provides: Supabase schema and media_items table (plan 01)
provides:
  - OMDB search and detail fetch helpers (server-side API key, N/A sentinel handling)
  - Open Library search fetch helper (mandatory fields= parameter)
  - Four Server Actions: searchMovies, searchSeries, searchBooks, getMovieDetails
affects:
  - 03-library-management (search UI in plans 03+)
  - 04-discovery (search integrations)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OMDB_API_KEY read from process.env server-side only — never NEXT_PUBLIC_ prefixed"
    - "Open Library URL built with encodeURIComponent(query) + literal fields= string (not URLSearchParams, which percent-encodes commas)"
    - "fetch cache via next.revalidate: 300 (search) and 3600 (detail)"
    - "N/A sentinel: all OMDB fields checked !== 'N/A' before returning"
    - "Server Actions in src/app/actions/search.ts with 'use server'; API helpers in src/lib/api/ are plain TS modules"

key-files:
  created:
    - src/lib/api/omdb.ts
    - src/lib/api/open-library.ts
    - src/app/actions/search.ts
  modified: []

key-decisions:
  - "Open Library fields= built as literal URL string, not URLSearchParams — URLSearchParams percent-encodes commas which breaks the Open Library API"
  - "OMDB API key is server-side only (process.env.OMDB_API_KEY) — throws Error if missing rather than silently failing"
  - "OmdbDetailResult uses camelCase fields with null for N/A values, while OmdbSearchResult preserves OMDB's original PascalCase field names for direct passthrough"

patterns-established:
  - "Pattern 1: API helpers in src/lib/api/ are plain TS modules (no 'use server'), imported only by Server Actions — clean separation"
  - "Pattern 2: Search actions validate non-empty query before calling API, return { results: [], error: '...' } shape"
  - "Pattern 3: N/A sentinel filter applied to all OMDB fields — posterUrl=null prevents Next.js Image errors"

requirements-completed: [LIB-01, LIB-02]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 03 Plan 02: API Integrations Summary

**OMDB and Open Library fetch helpers with N/A sentinel handling and server-side API key, wrapped in four typed Server Actions**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-22T05:49:03Z
- **Completed:** 2026-03-22T05:57:00Z
- **Tasks:** 2 of 2
- **Files modified:** 3

## Accomplishments

- OMDB server-side fetch helper with search (5-min cache) and detail (1-hour cache), all fields filtered through N/A sentinel
- Open Library fetch helper with mandatory fields= parameter (January 2025 API requirement) using encodeURIComponent-safe URL construction
- Four Server Actions exported under 'use server' boundary: searchMovies, searchSeries, searchBooks, getMovieDetails

## Task Commits

1. **Task 1: Create OMDB API helper and Server Actions** - `bb116a6` (feat)
2. **Task 2: Create Open Library API helper and searchBooks Server Action** - `c1c24fe` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `src/lib/api/omdb.ts` - OMDB search and detail fetch helpers with OmdbSearchResult, OmdbDetailResult types
- `src/lib/api/open-library.ts` - Open Library search, cover URL builder, work ID extractor with OlSearchResult type
- `src/app/actions/search.ts` - Server Actions: searchMovies, searchSeries, searchBooks, getMovieDetails

## Decisions Made

- Open Library URL built with literal string concat + `encodeURIComponent` (not URLSearchParams) — URLSearchParams percent-encodes commas in the `fields=` parameter which would break the API
- OMDB API key throws `Error('OMDB_API_KEY not configured')` if missing — fail-fast is better than a silent empty response
- OmdbDetailResult uses camelCase with null values for N/A, while OmdbSearchResult preserves OMDB's original PascalCase for direct array passthrough

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] URLSearchParams encodes commas in fields= parameter**
- **Found during:** Task 2 (Open Library API helper)
- **Issue:** URLSearchParams serializes `fields: 'key,title,...'` as `fields=key%2Ctitle%2C...` — the Open Library API requires unencoded commas in the fields list, so the request would have returned no cover_i or author_name fields
- **Fix:** Replaced URLSearchParams with manual URL string concatenation: `` `?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i` ``
- **Files modified:** src/lib/api/open-library.ts
- **Verification:** `grep -c "fields=key,title"` returns 1 (literal string present)
- **Committed in:** c1c24fe (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Auto-fix essential for correctness — the fields parameter is MANDATORY per January 2025 API change. No scope creep.

## Issues Encountered

None beyond the URLSearchParams bug described above.

## User Setup Required

`OMDB_API_KEY` must be added to `.env.local` and production environment (Vercel). The key is NOT in `.env.local` yet (only Supabase keys are present). Before the search page can be used:
1. Get an API key at https://www.omdbapi.com/apikey.aspx (free tier available)
2. Add `OMDB_API_KEY=your_key` to `.env.local`
3. Add to Vercel project environment variables

## Next Phase Readiness

- Search API helpers are complete and typed — search page UI (plan 03) can import Server Actions directly
- Open Library requires no API key — ready to use immediately
- OMDB requires OMDB_API_KEY env var before the search page will function in development

---
*Phase: 03-library-management*
*Completed: 2026-03-22*
