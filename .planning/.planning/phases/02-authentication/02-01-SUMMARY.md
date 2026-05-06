---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [supabase, next-auth, server-actions, middleware, route-groups, otp]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js App Router project with AppShell layout, Supabase SSR client, middleware skeleton

provides:
  - Route group structure with (app) and (auth) splits
  - Five Supabase Server Actions: signIn, signUp, signOut, resetPassword, updatePassword
  - Middleware route protection redirecting unauthenticated users to /auth
  - OTP token exchange route handler at /auth/confirm

affects:
  - 02-authentication Plan 02 (Supabase project setup)
  - 02-authentication Plan 03 (auth UI)
  - 03-data-layer (protected routes ready)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Route groups (app) and (auth) for layout splitting in Next.js App Router
    - Server Actions with redirect() called outside try/catch (NEXT_REDIRECT compatibility)
    - Error passing via ?error= URL param instead of throwing
    - Middleware using supabase.auth.getUser() for JWT validation on every request

key-files:
  created:
    - media-tracker-v3/src/app/(app)/layout.tsx
    - media-tracker-v3/src/app/(app)/movies/page.tsx
    - media-tracker-v3/src/app/(app)/books/page.tsx
    - media-tracker-v3/src/app/(app)/series/page.tsx
    - media-tracker-v3/src/app/(auth)/layout.tsx
    - media-tracker-v3/src/app/(auth)/auth/page.tsx
    - media-tracker-v3/src/app/(auth)/auth/actions.ts
    - media-tracker-v3/src/app/(auth)/auth/confirm/route.ts
  modified:
    - media-tracker-v3/src/app/layout.tsx
    - media-tracker-v3/src/middleware.ts

key-decisions:
  - "redirect() called outside try/catch in all Server Actions — NEXT_REDIRECT error must not be caught"
  - "Errors passed via ?error= URL param to auth page, not thrown — enables client-side error display without suspense boundaries"
  - "(app) layout wraps pages in AppShell; (auth) layout is standalone full-screen centered — auth pages render without sidebar/nav"
  - "Middleware excludes api routes from matcher — /api/* bypass prevents double-processing"
  - "OTP confirm handler at /auth/confirm reads token_hash+type from query params, not path segments"

patterns-established:
  - "Server Action error pattern: let errorMessage = null; if (error) errorMessage = error.message; if (errorMessage) redirect(...)"
  - "Middleware route protection: getUser() then check pathname.startsWith('/auth') for auth/app routing"
  - "Route group layout split: (app)/layout.tsx = AppShell, (auth)/layout.tsx = standalone"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 02 Plan 01: Auth Backend — Route Groups, Server Actions, and Middleware Summary

**Next.js route group split into (app) with AppShell and (auth) standalone, five Supabase Server Actions for all auth mutations, middleware JWT-based route protection, and OTP confirm route handler**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T10:42:20Z
- **Completed:** 2026-03-21T10:44:22Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Refactored flat app structure into (app) and (auth) route groups — protected pages now render inside AppShell, auth pages render standalone without sidebar
- Created five Server Actions (signIn, signUp, signOut, resetPassword, updatePassword) following the redirect-outside-try/catch pattern required by Next.js NEXT_REDIRECT
- Upgraded middleware from session-refresh-only to full route protection: unauthenticated users redirected to /auth?redirect={path}, authenticated users bounced away from /auth to /movies
- Created OTP confirm route handler at /auth/confirm for email link verification via supabase.auth.verifyOtp

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor to route groups and create auth layout split** - `f73c0cb` (feat)
2. **Task 2: Create auth Server Actions, middleware route protection, and OTP confirm handler** - `f059cfc` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `media-tracker-v3/src/app/layout.tsx` - Removed AppShell; root layout now only wraps in Providers
- `media-tracker-v3/src/app/(app)/layout.tsx` - New: wraps protected pages in AppShell
- `media-tracker-v3/src/app/(app)/movies/page.tsx` - Moved from app/movies/ to (app) route group
- `media-tracker-v3/src/app/(app)/books/page.tsx` - Moved from app/books/ to (app) route group
- `media-tracker-v3/src/app/(app)/series/page.tsx` - Moved from app/series/ to (app) route group
- `media-tracker-v3/src/app/(auth)/layout.tsx` - New: standalone full-screen auth layout
- `media-tracker-v3/src/app/(auth)/auth/page.tsx` - New: placeholder (full UI in Plan 03)
- `media-tracker-v3/src/app/(auth)/auth/actions.ts` - New: five Server Actions for auth mutations
- `media-tracker-v3/src/app/(auth)/auth/confirm/route.ts` - New: OTP token exchange GET handler
- `media-tracker-v3/src/middleware.ts` - Added route protection logic with getUser() + redirect

## Decisions Made

- redirect() is called outside try/catch in all Server Actions — Next.js throws NEXT_REDIRECT internally and catching it breaks navigation
- Errors are propagated to the auth page via ?error= URL search params rather than thrown — allows the UI to read and display them without suspense boundaries
- api routes excluded from middleware matcher to prevent unintended redirect behavior on API calls

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. (Supabase env vars already configured in Phase 01 Vercel deployment.)

## Next Phase Readiness

- Route structure and auth backend complete — ready for Plan 02 (Supabase project configuration) and Plan 03 (auth UI)
- The (auth)/auth/page.tsx placeholder will be replaced by full login/signup UI in Plan 03
- Middleware route protection is live and will guard all app routes once Supabase credentials are set

---
*Phase: 02-authentication*
*Completed: 2026-03-21*
