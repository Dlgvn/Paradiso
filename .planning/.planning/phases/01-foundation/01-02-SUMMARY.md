---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [nextjs, framer-motion, tailwind, shadcn, lucide-react, react-context]

requires:
  - phase: 01-01
    provides: "Next.js 14.2.35 scaffold, Tailwind design tokens, shadcn/ui components (button, tabs, tooltip), framer-motion installed"

provides:
  - "BackdropContext: React context for setting cinematic backdrop poster URL with crossfade key"
  - "BackdropLayer: fixed full-bleed next/image backdrop with AnimatePresence crossfade + gradient scrim"
  - "Providers: client component wrapping BackdropProvider and TooltipProvider"
  - "Sidebar: icon-only w-16 desktop nav with 6 items, active bg-accent/20 pill, Tooltip (side=right)"
  - "BottomNav: fixed bottom-0 md:hidden mobile tab bar with 5 items"
  - "AppShell: responsive layout — hidden md:flex sidebar + main content + BottomNav"
  - "EmptyState: frosted glass card with tagline, body copy, Search CTA button linking to /search"
  - "StatusTabs: 4-tab component (Watchlist/Watching/Completed/Dropped) defaulting to watchlist"
  - "/movies, /books, /series routes with StatusTabs and EmptyState"

affects:
  - 01-03
  - all-subsequent-phases

tech-stack:
  added: []
  patterns:
    - "BackdropContext pattern: React context in Providers.tsx, consumed by BackdropLayer.tsx — future phases call setBackdrop(src, key) to drive crossfade"
    - "Responsive layout: hidden md:flex sidebar + md:hidden bottom nav via single AppShell component"
    - "Frosted glass card: bg-white/5 backdrop-blur-md border-white/10 rounded-2xl shadow"
    - "Underline tab variant: overrides shadcn TabsTrigger defaults with data-[state=active]:border-b-2 border-accent"

key-files:
  created:
    - "media-tracker-v3/src/components/backdrop/BackdropContext.tsx"
    - "media-tracker-v3/src/components/backdrop/BackdropLayer.tsx"
    - "media-tracker-v3/src/components/layout/Providers.tsx"
    - "media-tracker-v3/src/components/layout/AppShell.tsx"
    - "media-tracker-v3/src/components/layout/Sidebar.tsx"
    - "media-tracker-v3/src/components/layout/BottomNav.tsx"
    - "media-tracker-v3/src/components/media/EmptyState.tsx"
    - "media-tracker-v3/src/components/media/StatusTabs.tsx"
    - "media-tracker-v3/src/app/books/page.tsx"
    - "media-tracker-v3/src/app/series/page.tsx"
  modified:
    - "media-tracker-v3/src/app/layout.tsx — wraps children with Providers > AppShell"
    - "media-tracker-v3/src/app/movies/page.tsx — replaced Supabase probe with StatusTabs"

key-decisions:
  - "AppShell renders BackdropLayer as a sibling before the flex container (not inside) since BackdropLayer uses fixed positioning"
  - "EmptyState accepts mediaType prop for future differentiation but uses ESLint suppress since phase 1 content is generic"
  - "StatusTabs overrides shadcn TabsList/TabsTrigger defaults with underline-only active style matching design spec"

patterns-established:
  - "Pattern 5: Frosted glass card — bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
  - "Pattern 6: Responsive layout — hidden md:flex sidebar / md:hidden bottom nav in AppShell"
  - "Pattern 7: BackdropContext — setBackdrop(src, key) from any client component triggers crossfade in BackdropLayer"

requirements-completed: [UI-01, UI-02]

duration: 3min
completed: 2026-03-21
---

# Phase 01 Plan 02: Cinematic Design System Summary

**Framer-motion crossfade backdrop, responsive AppShell (icon sidebar + mobile bottom nav), frosted glass EmptyState, and status tabs across three media routes — visual language fully established**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T09:42:22Z
- **Completed:** 2026-03-21T09:44:36Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Cinematic backdrop layer with AnimatePresence crossfade wired through React context — future phases call `setBackdrop(src, key)` to drive transitions
- Responsive AppShell: 64px icon-only sidebar with Tooltip labels (desktop md+), bottom tab bar (mobile below md), Tailwind hidden/flex breakpoint pattern
- Frosted glass EmptyState and underline-variant StatusTabs (Watchlist/Watching/Completed/Dropped) on /movies, /books, /series — all build as static pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create backdrop system and responsive layout shell** - `447e96f` (feat)
2. **Task 2: Create media type pages with status tabs and cinematic empty state** - `df16bf3` (feat)

## Files Created/Modified

- `media-tracker-v3/src/components/backdrop/BackdropContext.tsx` — React context with BackdropProvider and useBackdrop hook
- `media-tracker-v3/src/components/backdrop/BackdropLayer.tsx` — fixed inset-0 backdrop with AnimatePresence crossfade + gradient scrim
- `media-tracker-v3/src/components/layout/Providers.tsx` — client component wrapping BackdropProvider and TooltipProvider
- `media-tracker-v3/src/components/layout/AppShell.tsx` — responsive shell: BackdropLayer + hidden md:flex sidebar + main + BottomNav
- `media-tracker-v3/src/components/layout/Sidebar.tsx` — 6-item icon-only sidebar with Tooltip side=right, active bg-accent/20 pill
- `media-tracker-v3/src/components/layout/BottomNav.tsx` — 5-item fixed bottom-0 md:hidden mobile tab bar
- `media-tracker-v3/src/components/media/EmptyState.tsx` — frosted glass card with "Your library is empty" heading, body, Search CTA
- `media-tracker-v3/src/components/media/StatusTabs.tsx` — 4-tab shadcn Tabs with underline active style, EmptyState per tab
- `media-tracker-v3/src/app/layout.tsx` — updated to wrap children in Providers > AppShell
- `media-tracker-v3/src/app/movies/page.tsx` — replaced Supabase probe with StatusTabs mediaType="movies"
- `media-tracker-v3/src/app/books/page.tsx` — new: StatusTabs mediaType="books"
- `media-tracker-v3/src/app/series/page.tsx` — new: StatusTabs mediaType="series"

## Decisions Made

- **BackdropLayer placement:** Rendered as sibling before the flex div in AppShell (not inside main), because it uses `fixed` positioning which escapes the flex container anyway. Keeps structure clear.
- **ESLint suppress for mediaType:** EmptyState accepts the prop for future use (Phase 3 will differentiate by media type) but phase 1 content is generic. Added `eslint-disable-next-line` rather than removing the prop contract.
- **StatusTabs underline style:** Overrode shadcn TabsList/TabsTrigger defaults with `bg-transparent`, `rounded-none`, `border-b-2 border-accent` for active — matches design spec's underline variant without touching the shared shadcn source.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint unused parameter causing build failure**
- **Found during:** Task 2 (EmptyState creation)
- **Issue:** `mediaType: _mediaType` pattern caused `@typescript-eslint/no-unused-vars` ESLint error, failing `npm run build`
- **Fix:** Changed to standard destructuring with `eslint-disable-next-line` comment since the prop is intentional (forward contract for Phase 3)
- **Files modified:** `media-tracker-v3/src/components/media/EmptyState.tsx`
- **Verification:** `npm run build` exits 0 after fix
- **Committed in:** `df16bf3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (build error from ESLint unused var)
**Impact on plan:** Single line fix. No scope creep or design change.

## Issues Encountered

- ESLint `@typescript-eslint/no-unused-vars` caught underscore-prefixed destructuring (`_mediaType`) — Next.js build runs ESLint as part of the compile step, so this failed the build. Fixed immediately.

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- Visual language fully established: backdrop context, responsive nav, frosted glass cards, status tabs, empty states
- All three media routes exist and build clean
- BackdropContext is wired and ready — Phase 3 can call `setBackdrop(posterUrl, mediaId)` to drive crossfade transitions
- AppShell is extensible: search, analytics, recommendations routes can be added without touching the shell
- Supabase credentials still required for any server-side data fetching (see 01-01 USER SETUP notes)

---
*Phase: 01-foundation*
*Completed: 2026-03-21*
