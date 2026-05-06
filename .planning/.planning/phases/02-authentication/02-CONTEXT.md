# Phase 2: Authentication - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Secure email/password authentication with persistent sessions and password reset. Covers: sign up, login, logout, session persistence, password reset flow, and protected route middleware. No OAuth, no onboarding, no user profile management — just the auth shell that gates the rest of the app.

</domain>

<decisions>
## Implementation Decisions

### Auth Page Visual Design

- **Layout:** Standalone full-screen layout — no sidebar, no bottom nav. Auth pages are completely separate from the app shell.
- **Background:** App logo + tagline hero on a dark cinematic background (midnight blue palette from design system). No user-specific imagery since no library exists at this point.
- **Form placement:** Logo and tagline in the upper portion; frosted glass form card centered in the lower half. Vertical flow: logo → tagline → form.
- **Form card:** Frosted glass card consistent with Phase 1 design system (backdrop blur, slight transparency).

### Login vs. Signup Flow

- **Route structure:** Single route `/auth` — Login and Sign Up are views toggled within the same page. No separate `/login` or `/signup` routes.
- **Toggle:** Tab toggle or link-based switch between Login and Sign Up views within the form card.
- **After login:** User lands on `/movies`.
- **After signup:** User lands on `/movies` (same as login — onboarding step deferred to a future phase).
- **Password reset:** "Forgot password?" link opens a sub-view inline on `/auth` — the form card transitions to show an email input. After submitting, the sub-view shows a "Check your inbox" confirmation with a "Back to login" link. No separate page, no navigation.

### Protected Route Behavior

- **Enforcement:** Next.js `middleware.ts` — single centralized auth check on every request before the page renders.
- **Unauthenticated access:** Redirect to `/auth` with the original destination URL stored (e.g., `?redirect=/movies`). After successful login, user is redirected back to their original destination.
- **Public routes:** Only `/auth` is public. Everything else requires authentication.
- **Authenticated user on /auth:** Redirect to `/movies` — logged-in users should not see the auth page.

### Error & Feedback UX

- **Auth errors** (wrong password, email already in use, etc.): Banner above the form inside the glass card. Single message at a time, clearly visible, does not shift the form layout.
- **Loading state:** Submit button shows a spinner and all form inputs are disabled while the auth request is in flight. Prevents double-submit.
- **Password reset confirmation:** After email is sent, the sub-view replaces the email input with a "Check your inbox" message and a "Back to login" link. Stays on `/auth`, no navigation.

### Claude's Discretion

- Exact tagline copy and logo treatment
- Specific CSS animation for the Login ↔ Sign Up toggle transition
- Banner error color and styling details (within the midnight blue palette)
- Supabase Auth cookie vs. localStorage session strategy (use Supabase SSR helpers — standard for Next.js App Router)
- RLS policy scaffolding details (rows owned by `auth.uid()`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core constraints: email+password only, no OAuth, Supabase Auth required
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-04 (sign up, login/session, logout, password reset)
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and plan breakdown (02-01, 02-02, 02-03)

### Phase 1 design decisions (carry forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Cinematic aesthetic decisions: midnight blue/silver palette, frosted glass cards, design tokens. Auth pages must be consistent with this design system.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

Phase 1 will establish:
- Design system tokens (colors, blur values, spacing) — auth pages use these directly
- Frosted glass card component — the form card is this component
- Supabase client initialization — auth actions use the same client

### Established Patterns

- From Phase 1: Midnight blue/silver palette, no crimson/gold (v2 theme is deprecated)
- From Phase 1: Standalone full-screen layout is consistent with how the app shell was designed (sidebar is post-login only)
- This is a v3 rewrite — no v2 Python auth code is reused

### Integration Points

- Supabase client (from Phase 1) provides `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`, `resetPasswordForEmail()`
- `middleware.ts` reads Supabase session cookie on every request
- After auth, all subsequent phases (Phase 3+) rely on `auth.uid()` for RLS — Phase 2 establishes the RLS scaffolding

</code_context>

<specifics>
## Specific Ideas

- Auth page should feel like a premium app's login screen — think Linear, Vercel, or Apple ID. Clean, confident, not cluttered.
- The form card on `/auth` transitions smoothly between Login / Sign Up / Reset Password sub-views without a page reload.

</specifics>

<deferred>
## Deferred Ideas

- **Onboarding step after signup** — User expressed interest in a brief welcome/onboarding after first account creation. This is a new capability beyond Phase 2's auth scope. Candidate for a future phase (e.g., 2.1 or inserted before Phase 3).

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-03-20*
