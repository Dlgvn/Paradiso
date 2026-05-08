# Phase 6: PWA + Offline - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the app installable as a PWA and support full offline read/write — users can browse, update status, and rate items without internet. All changes sync automatically when connection is restored. Analytics, migration, and new library features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Service Worker Library

- **D-01:** Claude's discretion — pick the best fit for Next.js 14 App Router. Serwist (modern App Router-native fork of next-pwa, built on Workbox) is the recommended default, but Claude may choose differently if research reveals a better option.

### Conflict Resolution

- **D-02:** Last-write-wins using timestamps. Whichever change (client or server) carries the latest timestamp wins on sync. No conflict UI needed — this is a single-user personal tracker and edge cases are rare.

### Sync Status UX

- **D-03:** Combination approach — subtle offline indicator in the navbar/header (small badge or dot, not intrusive) while offline, plus a toast notification when sync completes after reconnect. No inline per-item badges.

### Cache Scope

- **D-04:** Full cache — app shell (JS/CSS/routes) + library data (synced to IndexedDB on install/update) + poster images (all cached, not just on-demand). Accept the storage tradeoff for full offline fidelity.

### Claude's Discretion

- Exact service worker library (see D-01 — Serwist recommended)
- IndexedDB abstraction layer (raw API, Dexie.js, or idb wrapper)
- Storage quota handling if poster cache exceeds device limits
- Background sync API vs. online event listener for reconnect detection
- Visual design of the offline nav indicator (within cinematic dark theme)
- Toast copy for sync completion message

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 14 App Router, Supabase, TypeScript, cinematic design mandate)
- `.planning/REQUIREMENTS.md` — PWA-01, PWA-02, PWA-03, PWA-04 (all Phase 6 requirements)
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, plan breakdown (06-01, 06-02, 06-03)

### Prior phase decisions that affect Phase 6
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design tokens, cinematic dark theme, nav/sidebar structure (offline indicator must fit here)
- `.planning/phases/03-library-management/03-CONTEXT.md` — Library data schema and Supabase table structure (IndexedDB schema must mirror this)

### No external specs
No external ADRs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `media-tracker-v3/next.config.mjs` — Clean config, no PWA setup yet; service worker plugin wraps this file
- `media-tracker-v3/src/lib/` — Supabase client utilities; sync engine reads/writes through these
- Sidebar/BottomNav components (Phase 2) — offline indicator attaches here

### Established Patterns
- Server Actions pattern (Phase 3+) — offline writes queue to IndexedDB, replay as Server Actions on reconnect
- Cinematic dark theme — offline badge and sync toast must use existing color tokens (crimson/gold accents)

### Integration Points
- `next.config.mjs` — wrap with PWA plugin (Serwist or chosen library)
- `public/` — manifest.json and SW registration assets go here
- Library data fetch layer — intercept with IndexedDB read when offline, queue writes to sync queue
- Nav/Sidebar — mount offline status indicator component

</code_context>

<specifics>
## Specific Ideas

No specific references or "I want it like X" moments — open to standard approaches within the cinematic theme.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-pwa-offline*
*Context gathered: 2026-05-05*
