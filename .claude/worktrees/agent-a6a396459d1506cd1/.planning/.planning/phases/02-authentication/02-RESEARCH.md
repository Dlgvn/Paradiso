# Phase 2: Authentication - Research

**Researched:** 2026-03-21
**Domain:** Supabase Auth SSR + Next.js 14 App Router middleware + frosted glass auth UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Auth Page Visual Design**
- Layout: Standalone full-screen layout — no sidebar, no bottom nav. Auth pages are completely separate from the app shell.
- Background: App logo + tagline hero on a dark cinematic background (midnight blue palette from design system). No user-specific imagery.
- Form placement: Logo and tagline in the upper portion; frosted glass form card centered in the lower half. Vertical flow: logo → tagline → form.
- Form card: Frosted glass card consistent with Phase 1 design system (backdrop blur, slight transparency).

**Login vs. Signup Flow**
- Route structure: Single route `/auth` — Login and Sign Up are views toggled within the same page. No separate `/login` or `/signup` routes.
- Toggle: Tab toggle or link-based switch between Login and Sign Up views within the form card.
- After login: User lands on `/movies`.
- After signup: User lands on `/movies` (same as login — onboarding deferred).
- Password reset: "Forgot password?" link opens a sub-view inline on `/auth`. Form card transitions to show email input. After submitting, sub-view shows "Check your inbox" confirmation with "Back to login" link. No separate page.

**Protected Route Behavior**
- Enforcement: Next.js `middleware.ts` — single centralized auth check on every request before the page renders.
- Unauthenticated access: Redirect to `/auth` with the original destination URL stored (e.g., `?redirect=/movies`). After successful login, redirect back to original destination.
- Public routes: Only `/auth` is public. Everything else requires authentication.
- Authenticated user on /auth: Redirect to `/movies`.

**Error & Feedback UX**
- Auth errors: Banner above the form inside the glass card. Single message at a time. Does not shift form layout.
- Loading state: Submit button shows spinner, all inputs disabled while request in flight. Prevents double-submit.
- Password reset confirmation: After email sent, sub-view replaces email input with "Check your inbox" + "Back to login" link. Stays on `/auth`.

### Claude's Discretion
- Exact tagline copy and logo treatment
- Specific CSS animation for the Login ↔ Sign Up toggle transition
- Banner error color and styling details (within the midnight blue palette)
- Supabase Auth cookie vs. localStorage session strategy (use Supabase SSR helpers — standard for Next.js App Router)
- RLS policy scaffolding details (rows owned by `auth.uid()`)

### Deferred Ideas (OUT OF SCOPE)
- Onboarding step after signup — brief welcome/onboarding after first account creation. Candidate for future phase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create an account with email and password | Supabase `signUp()` Server Action; `signUp` → redirect `/movies`; email confirmation config in Supabase dashboard |
| AUTH-02 | User can log in with email and password and stay logged in across sessions | `signInWithPassword()` Server Action; `@supabase/ssr` cookie-based session; middleware refreshes token on every request |
| AUTH-03 | User can log out from any page | `signOut()` Server Action called from any page; redirects to `/auth` |
| AUTH-04 | User can reset password via email link | `resetPasswordForEmail()` with `redirectTo`; `/auth/confirm` Route Handler for token exchange; `updateUser()` for new password |
</phase_requirements>

---

## Summary

Phase 2 implements email/password authentication using Supabase Auth with the `@supabase/ssr` package. This is the standard, officially supported approach for Next.js App Router. Both packages are already installed in the project (`@supabase/ssr@0.9.0`, `@supabase/supabase-js@2.99.3`) and the Supabase client helpers (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`) are already scaffolded from Phase 1. The middleware skeleton is also in place but lacks route protection logic.

The key architectural pattern is: Server Actions handle all auth mutations (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`), the middleware handles session refresh and route protection on every request, and a single `/auth` page hosts all auth sub-views (login / signup / forgot-password) as toggled client-side states with no page navigation between them. The auth page uses a standalone full-screen layout — it must NOT render inside `AppShell` (no sidebar, no bottom nav).

The largest implementation risk is the `layout.tsx` currently wraps all children in `AppShell`. The auth route at `/auth` must escape the `AppShell`. The standard Next.js App Router pattern for this is a route group with its own layout: `app/(auth)/auth/page.tsx` with a minimal layout that has no sidebar, while `app/(app)/` keeps `AppShell`. Alternatively, the root layout conditionally renders `AppShell` based on the route — but route groups are cleaner and more idiomatic.

**Primary recommendation:** Use route groups — `(auth)` for the auth page with its own layout, `(app)` for protected pages with `AppShell`. Middleware enforces protection. Server Actions handle all mutations.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.9.0 | Cookie-based session management for SSR | Official Supabase package for Next.js App Router; replaces deprecated `@supabase/auth-helpers-nextjs` |
| `@supabase/supabase-js` | 2.99.3 | Auth API (`signUp`, `signInWithPassword`, etc.) | Official Supabase JS client |
| `next` | 14.2.35 | Server Actions, middleware, route groups | Already in use; Server Actions are the standard auth mutation pattern |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tailwindcss` | ^3.4.1 | Frosted glass card, form styling | All UI styling; `backdrop-blur-*` for glass effect |
| `framer-motion` | ^12.38.0 | Login/signup toggle transition animation | Smooth sub-view transitions within the form card |
| `lucide-react` | ^0.577.0 | Form icons (eye toggle, email, lock) | Consistent with Phase 1 icon set |

### No new packages required

All required libraries are already installed. No `npm install` needed for Phase 2.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions for auth | Route Handlers (API routes) | Server Actions are simpler — no `fetch()` boilerplate, form binding is direct; Route Handlers require client-side fetch |
| Route groups for layout split | Conditional rendering in root layout | Route groups are idiomatic App Router; conditional rendering creates complexity and risks flash of wrong layout |
| `@supabase/ssr` cookie strategy | `localStorage` | Cookie strategy works with SSR and middleware; `localStorage` is client-only and breaks Server Component auth checks |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth route group — no AppShell
│   │   ├── layout.tsx       # Minimal layout: full-screen, dark bg, no sidebar
│   │   └── auth/
│   │       ├── page.tsx     # Auth page — login/signup/reset sub-views
│   │       ├── actions.ts   # Server Actions: signUp, signIn, signOut, resetPassword
│   │       └── confirm/
│   │           └── route.ts # Route Handler: OTP token exchange for password reset
│   ├── (app)/               # Protected route group — has AppShell
│   │   ├── layout.tsx       # Layout with AppShell (sidebar + bottom nav)
│   │   ├── movies/
│   │   ├── books/
│   │   └── series/
│   ├── layout.tsx           # Root layout (font, html, body — no AppShell here)
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── AuthCard.tsx     # Frosted glass form card container
│   │   ├── LoginView.tsx    # Login form sub-view
│   │   ├── SignupView.tsx   # Signup form sub-view
│   │   └── ResetView.tsx   # Forgot password sub-view
│   └── layout/
│       └── AppShell.tsx     # Moved into (app) layout, or kept as-is
├── lib/
│   └── supabase/
│       ├── client.ts        # Already exists — no changes
│       └── server.ts        # Already exists — no changes
└── middleware.ts             # Updated: add route protection logic
```

### Pattern 1: Server Actions for Auth Mutations

**What:** All auth operations are `'use server'` functions that call the Supabase server client, then redirect.
**When to use:** Every form submission — login, signup, signout, reset password request, update password.

```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
// app/(auth)/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}&view=login`)
  }
  // Respect redirect param if present
  const redirectTo = formData.get('redirect') as string | null
  redirect(redirectTo ?? '/movies')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}&view=signup`)
  }
  redirect('/movies')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/auth?view=update-password` }
  )
  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}&view=reset`)
  }
  redirect('/auth?view=reset-sent')
}
```

### Pattern 2: Middleware Route Protection

**What:** Middleware reads the Supabase session, redirects unauthenticated users to `/auth`, redirects authenticated users away from `/auth` to `/movies`.
**When to use:** Every request (enforced centrally, not per-page).

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/advanced-guide
// src/middleware.ts — updated from Phase 1 skeleton
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always use getUser() — validates JWT with auth server
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/auth')

  // Unauthenticated: redirect to /auth with original destination
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated: don't show auth page
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/movies'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

### Pattern 3: OTP Token Exchange Route Handler (Password Reset)

**What:** Supabase sends a reset email with a `token_hash`. A Route Handler at `/auth/confirm` exchanges the token for a session, then redirects to the update-password view.

```typescript
// Source: https://supabase.com/docs/guides/auth/passwords
// app/(auth)/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth?view=update-password'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/auth?error=Invalid+reset+link', request.url))
}
```

### Pattern 4: Route Groups for Layout Isolation

**What:** Next.js App Router route groups `(auth)` and `(app)` share the root layout but have their own nested layouts. The `(auth)` layout is full-screen with no `AppShell`; the `(app)` layout has `AppShell`.

```typescript
// app/(auth)/layout.tsx — no AppShell
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center relative overflow-hidden">
      {children}
    </div>
  )
}

// app/(app)/layout.tsx — has AppShell
import AppShell from '@/components/layout/AppShell'
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

**Critical:** The root `app/layout.tsx` must be stripped of `AppShell` — move it into `app/(app)/layout.tsx`. Root layout keeps only: `<html>`, `<body>`, `Providers`, fonts, `globals.css`.

### Pattern 5: Frosted Glass Auth Card

**What:** Tailwind `backdrop-blur-md` + semi-transparent background on a dark cinematic background.
**Color tokens to use:** `bg-base-surface/60` (midnight blue + 60% opacity), `backdrop-blur-md`, `border border-white/10`.

```typescript
// Glassmorphism card using existing Tailwind tokens
// Source: established design tokens in tailwind.config.ts
<div className="
  backdrop-blur-md
  bg-base-surface/60
  border border-white/10
  rounded-2xl
  p-8
  w-full max-w-md
  shadow-2xl
">
  {/* auth form content */}
</div>
```

### Anti-Patterns to Avoid

- **`getSession()` for protection:** Use `getUser()` instead — `getSession()` trusts client-side cookies without server validation, which is a security vulnerability. The middleware already uses `getUser()` correctly.
- **Auth logic in page components:** Keep auth mutations in Server Actions (`actions.ts`), not in page/component files. Pages should only call Server Actions.
- **Storing redirect in state:** Store `?redirect=` in the URL (query param), not in `useState` or `localStorage`. Middleware sets it, Server Action reads from form hidden input or URL.
- **Wrapping `/auth` in `AppShell`:** The auth page must not render the sidebar or bottom nav. Route groups solve this cleanly.
- **`redirect()` inside try/catch:** Next.js `redirect()` throws a special error; wrapping it in try/catch swallows the redirect. Call `redirect()` outside catch blocks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management | Custom cookie helpers | `@supabase/ssr` `createServerClient` + `createBrowserClient` | HttpOnly cookie handling, token refresh, SSR compatibility are subtle and error-prone |
| JWT verification | Manual JWT decode | `supabase.auth.getUser()` | Sends request to auth server for real validation; manual decode doesn't verify signature freshness |
| Password reset token | Custom tokens + DB table | Supabase built-in `resetPasswordForEmail` + `verifyOtp` | Time-limited, single-use tokens with rate limiting — critical security properties |
| Protected route logic | Per-page auth checks | Centralized `middleware.ts` | Per-page checks are easy to miss; middleware is the single enforcement point |
| Form validation | Custom regex, manual error state | Server Action error returns + URL error params | Supabase returns descriptive errors; HTML5 `required`/`type="email"` handles client-side basics |

**Key insight:** Supabase Auth handles all the cryptographic complexity (token signing, refresh, expiry, rate limiting, email delivery). The implementation is routing logic and UI — not auth primitives.

---

## Common Pitfalls

### Pitfall 1: AppShell wraps the auth page

**What goes wrong:** If the root `layout.tsx` keeps `AppShell` wrapping all children, the `/auth` page renders with the sidebar and bottom nav. This breaks the standalone full-screen design and also shows authenticated UI to unauthenticated users.

**Why it happens:** Phase 1 placed `AppShell` in the root layout for simplicity. Phase 2 requires layout divergence.

**How to avoid:** Refactor to route groups. Move `AppShell` from root layout into `app/(app)/layout.tsx`. Auth route lives in `app/(auth)/auth/page.tsx` with a minimal layout.

**Warning signs:** Sidebar visible on `/auth` route during development.

### Pitfall 2: Middleware redirect loops

**What goes wrong:** Middleware redirects `/auth` → check user → redirect `/movies` → check user → redirect `/auth` → infinite loop.

**Why it happens:** The auth route is not correctly excluded from the protection check, or the `isAuthRoute` check is wrong.

**How to avoid:** Explicitly check `pathname.startsWith('/auth')` and `pathname.startsWith('/auth/confirm')` as public routes. Also exclude `_next/static`, `_next/image`, `favicon.ico` from the matcher.

**Warning signs:** 307 redirect chain in browser network tab; `ERR_TOO_MANY_REDIRECTS`.

### Pitfall 3: Redirect destination lost after login

**What goes wrong:** User tries to access `/books`, gets redirected to `/auth`. After login, user lands on `/movies` instead of `/books`.

**Why it happens:** The `?redirect=` param is set by middleware but not read by the Server Action after successful login.

**How to avoid:** Pass `redirect` as a hidden input in the login form, read it in the `signIn` Server Action, and use it as the post-login destination.

**Warning signs:** User always lands on `/movies` regardless of what they were trying to access.

### Pitfall 4: Email confirmation blocks login (Supabase default)

**What goes wrong:** `signUp()` succeeds but user can't log in because Supabase requires email confirmation by default. User sees no feedback.

**Why it happens:** Supabase Auth project default requires confirming email before login is allowed.

**How to avoid:** Two options: (a) disable email confirmation in Supabase Dashboard > Auth Settings for development, re-enable for production; or (b) handle the `email_not_confirmed` error and show a "Check your inbox to confirm your account" message. Option (b) is correct for production.

**Warning signs:** `signUp()` returns no error, but subsequent `signInWithPassword()` returns `Email not confirmed`.

### Pitfall 5: `redirect()` called inside try/catch

**What goes wrong:** Server Action catches the redirect throw, swallowing it silently. No redirect occurs.

**Why it happens:** Next.js `redirect()` throws a special `NEXT_REDIRECT` error to signal navigation. Catching all errors catches this too.

**How to avoid:** Structure Server Actions to separate error handling from success path. Call `redirect()` only after the try/catch block, or check error outside catch.

**Warning signs:** Server Action completes without error but page doesn't navigate.

### Pitfall 6: Supabase env vars still placeholder in Vercel

**What goes wrong:** Auth fails in production because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are placeholder values in Vercel.

**Why it happens:** STATE.md explicitly notes: "Supabase env vars are placeholder values in Vercel and must be updated before Phase 2 auth work."

**How to avoid:** First task in Phase 2 execution should be updating Vercel env vars with real Supabase project credentials. Also set `NEXT_PUBLIC_SITE_URL` for the password reset `redirectTo`.

**Warning signs:** Supabase client errors in production; auth works locally but not on Vercel.

---

## Code Examples

### Auth page: single-route multi-view with URL-driven view state

```typescript
// Source: pattern derived from official Supabase + Next.js docs
// app/(auth)/auth/page.tsx
import { AuthCard } from '@/components/auth/AuthCard'

type View = 'login' | 'signup' | 'reset' | 'reset-sent'

interface AuthPageProps {
  searchParams: { view?: View; error?: string; redirect?: string }
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  const view = searchParams.view ?? 'login'
  const error = searchParams.error
  const redirectTo = searchParams.redirect

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
      {/* Logo + tagline */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Media Tracker</h1>
        <p className="text-accent-silver text-sm">Your entire media library, beautifully presented.</p>
      </div>

      {/* Frosted glass form card */}
      <AuthCard view={view} error={error} redirectTo={redirectTo} />
    </div>
  )
}
```

### RLS scaffolding pattern (SQL, run in Supabase SQL editor)

```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- Phase 2 scaffolds this; Phase 3 adds the actual tables

-- Pattern for every user-owned table Phase 3+ will create:
-- ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "{table_name}: owner access"
-- ON {table_name}
-- FOR ALL
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- Note: auth.uid() returns NULL for unauthenticated requests — anon role is blocked
-- Index is critical for performance on large tables:
-- CREATE INDEX ON {table_name} (user_id);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023 | Official replacement; auth-helpers is deprecated. Project already uses `@supabase/ssr`. |
| `getSession()` for server protection | `getUser()` for server protection | 2024 | `getSession()` doesn't validate JWT server-side; `getUser()` does. Security requirement. |
| Separate `/login` and `/signup` routes | Single `/auth` route with view state | Design decision | Simpler URL structure, smoother UX; view toggled via `?view=` param or client state |
| Per-page auth checks in `getServerSideProps` | Centralized middleware | App Router era | Single enforcement point; middleware runs before any page renders |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated. Do not use. Project uses `@supabase/ssr` correctly.
- `supabase.auth.getSession()` for protection: Do not use server-side. Use `getUser()`.
- Pages Router `getServerSideProps` pattern: Not applicable — project uses App Router.

---

## Open Questions

1. **Email confirmation on/off for MVP**
   - What we know: Supabase requires email confirmation by default; disabling it allows instant login after signup
   - What's unclear: User has not specified whether email confirmation should be enforced at signup
   - Recommendation: Disable in Supabase dashboard for development, enable for production. Show "Check inbox" message post-signup even if confirmation is on — handle `email_not_confirmed` error gracefully.

2. **`NEXT_PUBLIC_SITE_URL` env var**
   - What we know: `resetPasswordForEmail` needs a `redirectTo` URL pointing to `/auth/confirm`; this must be an absolute URL
   - What's unclear: Not yet set in Vercel env vars
   - Recommendation: Add `NEXT_PUBLIC_SITE_URL=https://media-tracker-v3.vercel.app` to Vercel. Use `http://localhost:3000` locally.

3. **Root layout refactor scope**
   - What we know: Current `app/layout.tsx` wraps all children in `AppShell`; route groups require moving `AppShell` to `app/(app)/layout.tsx`
   - What's unclear: Whether the current `movies/`, `books/`, `series/` page files need to move into `(app)/` group
   - Recommendation: Yes — move all protected pages into `app/(app)/`. This is a structural refactor that is the first task of 02-01.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files in `media-tracker-v3/` |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run lint` (currently available) |
| Full suite command | To be established in Wave 0 |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User can create account with email + password | Manual / E2E | Playwright: `npx playwright test auth.spec.ts` | ❌ Wave 0 |
| AUTH-02 | Login persists across browser tab close/reopen | Manual smoke | Browser test: close + reopen, check redirect to /movies | ❌ Manual |
| AUTH-03 | Logout from any page redirects to /auth | Manual / E2E | Playwright: `npx playwright test logout.spec.ts` | ❌ Wave 0 |
| AUTH-04 | Password reset email delivers working link | Manual smoke | Manual: request reset, click email link, update password | ❌ Manual |

**Note on test strategy for auth:** Auth flows involving real email delivery (AUTH-04) and cross-session persistence (AUTH-02) are inherently integration/manual tests. E2E with Playwright against a real Supabase test project is the standard approach. Unit testing Server Actions in isolation is possible with mocked Supabase clients but provides limited signal.

### Sampling Rate
- **Per task commit:** `npm run lint` — catches TypeScript and ESLint errors
- **Per wave merge:** Manual smoke test of full auth flow: signup → login → logout → forgot password
- **Phase gate:** All four AUTH requirements manually verified against production Vercel URL before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth.spec.ts` — Playwright E2E covering AUTH-01, AUTH-03 (if E2E is adopted)
- [ ] `playwright.config.ts` — if E2E framework is added
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install` — if E2E is adopted

*Note: Adding Playwright is Claude's discretion. Manual smoke testing is sufficient for this phase given the small auth surface area. The planner should decide based on project test ambition.*

---

## Sources

### Primary (HIGH confidence)
- [Supabase Auth SSR for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — middleware pattern, client types, `getUser()` vs `getSession()`
- [Supabase Password Reset](https://supabase.com/docs/guides/auth/passwords) — `resetPasswordForEmail`, `verifyOtp`, `updateUser` flow
- [Supabase Next.js Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) — Server Actions code patterns for signIn/signUp/signOut
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — `auth.uid()` policy patterns
- [Supabase Password-Based Auth UI](https://supabase.com/ui/docs/nextjs/password-based-auth) — `/auth/confirm` Route Handler pattern
- Project codebase: `src/middleware.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/app/layout.tsx`, `tailwind.config.ts` — existing Phase 1 scaffolding

### Secondary (MEDIUM confidence)
- [Supabase Advanced SSR Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — `Cache-Control: private, no-store` header recommendation; middleware redirect pattern
- WebSearch results: community confirmation that `getUser()` is correct for protection; route groups are idiomatic for layout split
- [Tailwind Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur) — `backdrop-blur-md` for frosted glass

### Tertiary (LOW confidence — needs validation)
- Specific CSS animation for Login ↔ Signup toggle: Framer Motion `AnimatePresence` is the standard pattern for React view transitions, but exact implementation is Claude's discretion

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are already installed and confirmed via `package.json`
- Architecture: HIGH — route groups, Server Actions, middleware pattern are all official Next.js + Supabase patterns verified against current docs
- Pitfalls: HIGH — `AppShell` in root layout (verified by reading `layout.tsx`), Vercel env var gap (confirmed by `STATE.md`), `redirect()` in try/catch (well-documented Next.js gotcha)
- Validation architecture: MEDIUM — no test infrastructure exists; test strategy recommendation is reasonable but not yet confirmed with user

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable ecosystem — Supabase SSR API unlikely to change significantly within 30 days)
