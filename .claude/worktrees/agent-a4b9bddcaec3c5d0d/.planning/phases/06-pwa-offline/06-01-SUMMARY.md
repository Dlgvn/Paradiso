---
phase: 06-pwa-offline
plan: "01"
subsystem: pwa-shell
tags: [pwa, serwist, manifest, install-prompt, service-worker]
dependency_graph:
  requires: [06-00]
  provides:
    - next.config.mjs (withSerwistInit wrapper)
    - src/app/sw.ts (service worker entry)
    - src/app/manifest.ts (PWA manifest)
    - src/components/pwa/InstallPrompt.tsx
    - tsconfig.sw.json
  affects:
    - src/app/layout.tsx
    - src/components/layout/Providers.tsx
    - tsconfig.json
tech_stack:
  added:
    - "@serwist/next@9.5.11 (dependency)"
    - "serwist@9.5.11 (devDependency)"
  patterns:
    - CacheFirst runtime caching for poster images
    - Serwist precache with __SW_MANIFEST
    - Next.js App Router manifest.ts convention
    - beforeinstallprompt localStorage persistence
key_files:
  created:
    - src/app/sw.ts
    - src/app/manifest.ts
    - src/components/pwa/InstallPrompt.tsx
    - tsconfig.sw.json
  modified:
    - next.config.mjs
    - tsconfig.json
    - src/app/layout.tsx
    - src/components/layout/Providers.tsx
    - src/__tests__/manifest.test.ts
    - package.json
decisions:
  - "reloadOnOnline: false prevents page refresh on network restore (avoids interrupting sync UX in Plan 06-03)"
  - "disable: process.env.NODE_ENV === 'development' avoids Serwist breaking HMR"
  - "tsconfig.sw.json isolates webworker lib from main React build"
  - "mt-install-prompt-dismissed localStorage key persists install prompt dismissal across sessions"
metrics:
  completed_date: "2026-05-07"
  tasks_completed: 3
  files_created: 4
  files_modified: 6
---

# Phase 06 Plan 01: PWA Shell (Serwist + Manifest + InstallPrompt) Summary

Serwist v9.5.11 installed and wired into Next.js App Router via withSerwistInit wrapper, service worker entry at src/app/sw.ts with full-cache strategy (app shell precache + poster image CacheFirst + /~offline navigation fallback), manifest.ts auto-served as /manifest.webmanifest, layout metadata extended for iOS PWA support, and cinematic InstallPrompt component surfaces install button on beforeinstallprompt event.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install Serwist, wire next.config.mjs, create sw.ts | a9b229c |
| fix | Restore Wave 0 files deleted by staged index issue | 516f463 |
| 2 | Create manifest.ts, extend layout metadata, replace manifest test stubs | c8c5a09 |
| 3 | InstallPrompt component + mount in Providers | 3163bb4 |

## Serwist Configuration

**Versions:** @serwist/next@9.5.11, serwist@9.5.11

**next.config.mjs structure:**
- `withSerwistInit` wraps existing `nextConfig`
- `swSrc: 'src/app/sw.ts'` — TypeScript service worker entry
- `swDest: 'public/sw.js'` — gitignored build artifact
- `disable: process.env.NODE_ENV === 'development'` — preserves HMR
- `reloadOnOnline: false` — preserves sync UX continuity
- All three image hostnames preserved: m.media-amazon.com, covers.openlibrary.org, image.tmdb.org

**Service worker (src/app/sw.ts):**
- `precacheEntries: self.__SW_MANIFEST` — app shell precache
- `skipWaiting: true` + `clientsClaim: true` — immediate SW activation on update
- `navigationPreload: true` — parallel network/cache for navigation requests
- CacheFirst runtime cache for poster image CDNs (maxEntries: 500, 30-day expiry)
- Navigation fallback to `/~offline` for document requests
- `...defaultCache` spreads Serwist's default runtime caching rules

**tsconfig.sw.json:** extends main tsconfig, overrides `lib: ["esnext", "webworker"]` and adds `@serwist/next/typings` types. Prevents webworker globals from leaking into main app TypeScript compilation.

## Manifest Fields

| Field | Value |
|-------|-------|
| name | Media Tracker |
| short_name | MediaTracker |
| display | standalone |
| start_url | / |
| theme_color | #0a0a0f |
| background_color | #0a0a0f |
| orientation | any |

**Icons inventory:**
- /icons/icon-192.png — 192x192, purpose: any
- /icons/icon-512.png — 512x512, purpose: any
- /icons/icon-192-maskable.png — 192x192, purpose: maskable
- /icons/icon-512-maskable.png — 512x512, purpose: maskable

## InstallPrompt Component

**File:** src/components/pwa/InstallPrompt.tsx

**Dismissal mechanism:** localStorage key `mt-install-prompt-dismissed = "1"` persists across sessions. On mount, checks localStorage before setting up event listener. On dismiss button click, sets key and hides button permanently.

**Event handling:** Listens to `beforeinstallprompt` (stashes deferred event, renders button) and `appinstalled` (clears deferred state, hides button). Removes listeners on unmount.

**Installation flow:** Click "Install app" → `await deferred.prompt()` → `await deferred.userChoice` → clear deferred state regardless of accept/dismiss.

**Mount point:** Inside `Providers.tsx` within TooltipProvider tree, after `{children}`, before `<Toaster />`.

## Verification Results

```
npm run build: ✓ Compiled successfully, Serwist bundled SW at /sw.js
public/sw.js: EXISTS (gitignored build artifact)
npm test: 9 passed, 13 todo — EXIT 0
manifest tests: 5/5 passing
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing TypeScript 3-arg call errors (repeat from Wave 0)**

- **Found during:** Task 1 (npm run build verification)
- **Issue:** Wave 0 fixed these errors in commit 9f4e74d, but the worktree's base commit (050958c) was a "restore" commit that re-introduced the unfixed versions of ItemDetailSheet.tsx, MediaCard.tsx, MediaListItem.tsx, SearchPageClient.tsx in `media-tracker-v3/` subdirectory (wrong path). The actual working tree files still had the 3-arg errors.
- **Fix:** Removed extra `item.media_type` argument from `updateItemStatus` calls in ItemDetailSheet and MediaCard/MediaListItem; removed `mediaType` prop from DuplicateWarningDialogLazy in SearchPageClient.
- **Files modified:** src/components/detail/ItemDetailSheet.tsx, src/components/library/MediaCard.tsx, src/components/library/MediaListItem.tsx, src/components/search/SearchPageClient.tsx

**2. [Rule 3 - Blocking] Wave 0 files deleted by staged index during Task 1 commit**

- **Found during:** Post-Task 1 commit review
- **Issue:** The base commit 050958c had added Wave 0 files at wrong `media-tracker-v3/` path prefix. When git add staged those paths, the commit also deleted the correctly-pathed files. Result: public/icons/, src/app/~offline/page.tsx, src/__tests__/ stubs, and supabase migration were deleted.
- **Fix:** Checked out those files from their original Wave 0 commits (9f4e74d, d9da0f2, 65e360d) and committed as restoration fix.
- **Commit:** 516f463

## Self-Check: PASSED

- [x] src/app/sw.ts exists, contains `new Serwist(`, `poster-images`, `/~offline`, `skipWaiting: true`, `clientsClaim: true`
- [x] next.config.mjs contains `withSerwistInit`, `reloadOnOnline: false`, all 3 image hostnames
- [x] tsconfig.sw.json exists with `webworker`
- [x] tsconfig.json excludes `src/app/sw.ts`
- [x] src/app/manifest.ts exists with `MetadataRoute.Manifest`, standalone, all 4 icons
- [x] src/app/layout.tsx contains `appleWebApp`, `manifest: "/manifest.webmanifest"`, `Viewport` export
- [x] src/__tests__/manifest.test.ts has no `it.todo`, all 5 tests pass
- [x] src/components/pwa/InstallPrompt.tsx exists with `beforeinstallprompt`, `appinstalled`, `mt-install-prompt-dismissed`, `bg-accent/20`
- [x] src/components/layout/Providers.tsx imports and renders `<InstallPrompt />`
- [x] public/sw.js exists on disk (gitignored)
- [x] Commits a9b229c, 516f463, c8c5a09, 3163bb4 exist
- [x] npm run build exits 0
- [x] npm test: 9 passed, EXIT 0
