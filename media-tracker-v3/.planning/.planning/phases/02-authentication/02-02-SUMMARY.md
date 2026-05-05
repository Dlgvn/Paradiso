---
phase: 02-authentication
plan: 02
subsystem: auth
tags: [next-auth, server-actions, framer-motion, lucide-react, useFormStatus, tailwind, frosted-glass]

# Dependency graph
requires:
  - phase: 02-authentication
    plan: 01
    provides: Five Supabase Server Actions (signIn, signUp, signOut, resetPassword, updatePassword), route groups, auth page placeholder

provides:
  - Five auth UI components in media-tracker-v3/src/components/auth/
  - AuthCard: frosted glass container managing view state and error display with framer-motion transitions
  - LoginView: email/password form with eye toggle, redirect support, useFormStatus spinner
  - SignupView: email/password/confirm form with client-side password match validation
  - ResetView: reset request form and Check your inbox confirmation state
  - UpdatePasswordView: new password form with client-side password match validation
  - Auth page: Server Component rendering logo + tagline + AuthCard, reads searchParams for view/error/redirect

affects:
  - 02-authentication Plan 03 (Supabase project config — auth UI now complete and testable)
  - 03-data-layer (protected auth pages ready for real Supabase credentials)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useFormStatus from react-dom for pending state — SubmitButton reads pending to show Loader2 spinner and disable inputs
    - framer-motion AnimatePresence mode="wait" for smooth view transitions (opacity+y, 0.15s)
    - Client-side password confirmation via onSubmit + event.preventDefault() before Server Action fires
    - Error propagation via ?error= URL param read by Server Component searchParams, passed to AuthCard as prop

key-files:
  created:
    - media-tracker-v3/src/components/auth/AuthCard.tsx
    - media-tracker-v3/src/components/auth/LoginView.tsx
    - media-tracker-v3/src/components/auth/SignupView.tsx
    - media-tracker-v3/src/components/auth/ResetView.tsx
    - media-tracker-v3/src/components/auth/UpdatePasswordView.tsx
  modified:
    - media-tracker-v3/src/app/(auth)/auth/page.tsx

key-decisions:
  - "AuthCard uses useState initialized from view prop — login/signup/reset toggling is client-side, no page navigation"
  - "SubmitButton is an inline function component inside each view file — useFormStatus must be called in a child of the form"
  - "SignupView onViewChange prop kept in interface for API contract consistency — toggle is managed by AuthCard not the sub-view"
  - "eslint-disable for SignupView onViewChange — prop is part of required interface, not called in component body"

patterns-established:
  - "Auth sub-view pattern: 'use client' + useFormStatus + form action={serverAction} + SubmitButton child component"
  - "View switching pattern: AuthCard holds currentView state, sub-views receive onViewChange callback"
  - "Password visibility toggle: useState showPassword, toggles input type between password/text"
  - "Confirm password pattern: onSubmit handler checks match before Server Action fires; mismatch sets local error state"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 02 Plan 02: Auth UI — Frosted Glass Form Card with Animated Sub-Views Summary

**Five auth UI components with frosted glass container, framer-motion view transitions, useFormStatus spinners, and password visibility toggles — wired to Supabase Server Actions**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-21T10:46:59Z
- **Completed:** 2026-03-21T10:49:49Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Built four auth sub-view components (LoginView, SignupView, ResetView, UpdatePasswordView) each wired directly to their Supabase Server Action via form action prop
- Created AuthCard frosted glass container (backdrop-blur-md, bg-base-surface/60, border-white/10) with AnimatePresence view transitions — login/signup/reset toggles without page navigation
- Updated auth page to Server Component reading searchParams, rendering Media Tracker logo + tagline + AuthCard; error banners display from ?error= URL param

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth form sub-view components** - `e1d5a04` (feat)
2. **Task 2: Create AuthCard container and wire auth page** - `04ddb7d` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `media-tracker-v3/src/components/auth/AuthCard.tsx` - Frosted glass container with AnimatePresence view transitions and error banner
- `media-tracker-v3/src/components/auth/LoginView.tsx` - Email/password form with eye toggle, useFormStatus, hidden redirect input, forgot password link
- `media-tracker-v3/src/components/auth/SignupView.tsx` - Signup form with client-side password match validation via onSubmit
- `media-tracker-v3/src/components/auth/ResetView.tsx` - Reset request form + Check your inbox confirmation state
- `media-tracker-v3/src/components/auth/UpdatePasswordView.tsx` - New password form with client-side match validation
- `media-tracker-v3/src/app/(auth)/auth/page.tsx` - Replaced placeholder: Server Component reading searchParams, renders logo + tagline + AuthCard

## Decisions Made

- AuthCard owns currentView state initialized from the view prop — sub-views get an onViewChange callback but the toggle logic lives in AuthCard, keeping sub-views simpler
- SubmitButton is declared as an inline component inside each view file so useFormStatus (which must be called in a child of the form) works correctly
- SignupView and UpdatePasswordView use onSubmit to intercept the form before the Server Action fires — if passwords mismatch, event.preventDefault() stops submission and sets local error state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint unused-vars for SignupView onViewChange prop**
- **Found during:** Task 2 build verification
- **Issue:** ESLint `@typescript-eslint/no-unused-vars` failed build — SignupView receives onViewChange as an interface contract prop but AuthCard handles toggling; the prop is not called inside the component
- **Fix:** Added eslint-disable-next-line comment — prop is part of shared interface, not a dead variable
- **Files modified:** media-tracker-v3/src/components/auth/SignupView.tsx
- **Verification:** npm run build exits 0
- **Committed in:** `04ddb7d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — build fix)
**Impact on plan:** Minimal — ESLint stricter than expected on interface-contract props. Fix is accurate and non-invasive.

## Issues Encountered

None beyond the ESLint deviation noted above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete auth UI is live — AuthCard, all four sub-views, and auth page wired end-to-end
- Plan 03 (Supabase project configuration) can now be tested with real credentials
- All AUTH-01 through AUTH-04 requirements have UI representation

## Self-Check: PASSED

All files exist and all commits verified.

---
*Phase: 02-authentication*
*Completed: 2026-03-21*
