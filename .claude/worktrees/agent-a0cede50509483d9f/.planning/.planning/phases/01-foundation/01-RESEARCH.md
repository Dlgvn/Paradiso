# Phase 1: Foundation - Research

**Researched:** 2026-03-20
**Domain:** Next.js 14 App Router + Supabase + Tailwind CSS + cinematic design system + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Background treatment:** Dynamic poster backdrop — currently watching/reading item's poster fills the background with subtle blur + strong gradient overlay at the bottom. Poster is loosely visible, gradient fades to solid dark below.
- **Fallback backdrop:** Random watchlist item if no in-progress item; dark gradient only if watchlist also empty.
- **Backdrop transition:** Crossfade animation when switching between Movies/Books/Series sections (like Apple Music).
- **Color palette:** Cooler dark — midnight blue/silver tones. NOT the v2 crimson/gold. Dark base (#0a0a0f range).
- **Accent color:** Midnight blue/silver for buttons, active nav highlights, progress indicators.
- **Typography:** All sans-serif, varied weights (Inter or Geist). No serif. Weight contrast creates hierarchy.
- **Card style:** Frosted glass cards — backdrop blur behind each card, slight transparency, layered premium feel.
- **Card default state:** Poster image only — no text overlay at rest. Clean grid.
- **Card hover/tap:** Dark overlay appears with title, star rating, and quick-action buttons (favorite toggle, status change).
- **Progress indicator:** Thin progress bar at the bottom of cards for in-progress items (series episode progress).
- **Desktop nav:** Icon-only sidebar (no expand on hover, always compact). Tooltips provide labels on hover.
- **Mobile nav:** Bottom tab bar.
- **Sidebar nav items:** Movies | Books | Series | Search | Analytics | Recommendations (icons only, pill for active state).
- **Bottom nav items:** Movies | Books | Series | Search | Profile.
- **Status tabs:** Watchlist | Watching | Completed | Dropped — tabs switch the full grid.
- **Default tab:** Watchlist (first tab, selected on load).
- **Landing page:** No separate home/dashboard. After login, user lands on /movies.
- **Empty state:** Cinematic placeholder — dark background, tagline, "Search" CTA button. No ghost cards.
- **Tech stack (PROJECT.md):** Next.js 14+ App Router, Supabase, TypeScript — no deviations.

### Claude's Discretion

- Exact blur CSS values (backdrop-filter intensity)
- Crossfade animation duration and easing
- Exact gradient stops for the bottom fade
- Frosted glass card border radius and opacity values
- Sidebar icon set (Lucide, Heroicons, or Radix Icons)
- Deployment platform (Vercel recommended for Next.js)
- Tailwind config color token naming convention
- shadcn/ui as component foundation (standard for Next.js + Tailwind)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 1 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | Cinematic immersive design — full poster backgrounds with backdrop blur (Apple TV aesthetic) | Covered by: backdrop image layer pattern, frosted glass Tailwind utilities, framer-motion crossfade, next/image fill pattern |
| UI-02 | App is responsive and usable on mobile screen sizes | Covered by: responsive layout pattern (sidebar on desktop hidden on mobile, bottom nav visible on mobile), Tailwind responsive prefix strategy |
</phase_requirements>

---

## Summary

Phase 1 is a pure foundation phase: scaffold the Next.js 14 App Router project, wire in the Supabase client, implement the cinematic design system (tokens, backdrop, layout shell), and deploy to Vercel with environment variables set. No auth, no data — just the shell every subsequent phase builds inside.

The technical surface is well-understood and stable as of March 2026. Next.js 16.x is current but the project decision locks Next.js 14+; using `create-next-app@14` pins the exact major. Supabase's `@supabase/ssr` package supersedes the legacy `@supabase/auth-helpers-nextjs` — use only the SSR package. Vercel has a native Supabase integration that auto-syncs environment variables, making deployment configuration trivial.

The cinematic design system is the creative core of this phase. It requires a specific layered CSS architecture: a fixed full-bleed poster image layer behind a gradient scrim, with frosted-glass cards floating on top. This pattern is achievable with `next/image fill` + Tailwind `backdrop-blur-*` utilities. The backdrop crossfade animation requires framer-motion `AnimatePresence` + `motion.div` with `opacity` transitions. Phase 1 only needs to demonstrate this on at least one route — the full dynamic poster-switching logic is not required until Phase 3 data exists.

**Primary recommendation:** Scaffold with `create-next-app@14`, install `@supabase/supabase-js` + `@supabase/ssr`, run `shadcn@latest init`, define Tailwind tokens, build the layout shell with placeholder backdrop, and wire Vercel deploy with Supabase integration. Three plans, three waves.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.x (pin via `create-next-app@14`) | Full-stack React framework, App Router | Locked project decision |
| typescript | 5.x (bundled with Next 14) | Type safety across entire codebase | Locked project decision |
| tailwindcss | 4.2.2 (latest) | Utility-first CSS; all layout, blur, glass effects | Industry standard for Next.js |
| @supabase/supabase-js | 2.99.3 (latest) | Supabase database + auth client | Official Supabase JS client |
| @supabase/ssr | 0.9.0 (latest) | Cookie-based auth helpers for App Router SSR | Replaces deprecated auth-helpers |
| lucide-react | 0.577.0 (latest) | Icon set — tree-shakable SVG components | Default shadcn/ui icon library; Claude's discretion |
| framer-motion | 12.x (latest) | Crossfade backdrop transition animation | Gold standard for React declarative animation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | CLI-driven (no pinned version — copies source) | Accessible headless component primitives | Buttons, tooltips, tabs — all interactive UI in Phase 1 shell |
| next-themes | 0.4.6 | Dark mode theme provider | If theme toggle is ever needed; Phase 1 can skip it since app is always dark |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion | CSS `transition` + keyframes | Pure CSS crossfade is simpler but harder to control timing declaratively with React state changes; framer-motion is the standard |
| lucide-react | Heroicons, Radix Icons | All are valid; Lucide is already bundled with shadcn/ui and is tree-shakable |
| shadcn/ui | Radix UI directly | shadcn/ui adds pre-styled Tailwind variants on top; removes hand-styling work |

**Installation:**
```bash
npx create-next-app@14 media-tracker-v3 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd media-tracker-v3
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react framer-motion
npx shadcn@latest init
```

**Version verification (confirmed 2026-03-20):**
- `next`: 16.2.0 is latest Next.js — project pins to 14.x via `create-next-app@14`
- `tailwindcss`: 4.2.2
- `@supabase/supabase-js`: 2.99.3
- `@supabase/ssr`: 0.9.0
- `lucide-react`: 0.577.0
- `framer-motion`: 12.38.0

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout — providers, layout shell
│   ├── page.tsx             # Redirect to /movies
│   ├── movies/
│   │   └── page.tsx         # Movies page (default landing)
│   ├── books/
│   │   └── page.tsx
│   └── series/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # Sidebar + main content area wrapper
│   │   ├── Sidebar.tsx      # Icon-only sidebar (desktop)
│   │   └── BottomNav.tsx    # Bottom tab bar (mobile)
│   ├── backdrop/
│   │   ├── BackdropLayer.tsx  # Fixed full-bleed poster + gradient scrim
│   │   └── BackdropContext.tsx  # React context to set active backdrop URL
│   └── ui/                  # shadcn/ui generated components
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # createBrowserClient (client-side)
│   │   └── server.ts        # createServerClient (server-side)
│   └── design-tokens.ts     # Re-exports token constants if needed in JS
├── styles/
│   └── globals.css          # Tailwind directives + CSS custom properties
└── middleware.ts             # Supabase session refresh middleware
```

### Pattern 1: Supabase Client Initialization (SSR)
**What:** Two client factories — one for Server Components/Actions, one for Client Components.
**When to use:** Always. Never import the same client on both sides.
**Example:**
```typescript
// src/lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Pattern 2: Supabase Middleware (session refresh)
**What:** Middleware that refreshes the Supabase session on every request. Required because Server Components cannot set cookies.
**When to use:** Always — include in Phase 1 even before auth.
```typescript
// src/middleware.ts
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
  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Pattern 3: Cinematic Backdrop Layer
**What:** Fixed full-bleed `next/image` behind all content, with a gradient scrim over it, and frosted glass cards floating on top.
**When to use:** Root layout or per-page backdrop via context.
```tsx
// src/components/backdrop/BackdropLayer.tsx
'use client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  src: string | null  // null = dark gradient fallback
  key: string         // change to trigger crossfade
}

export function BackdropLayer({ src, key }: Props) {
  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence>
        {src && (
          <motion.div
            key={key}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover object-center"
              priority
              quality={60}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Gradient scrim — bottom fade to solid dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-backdrop-top via-backdrop-mid to-backdrop-base" />
    </div>
  )
}
```

### Pattern 4: Tailwind Design Tokens (midnight blue/silver)
**What:** CSS custom properties in globals.css, referenced as Tailwind config extensions.
```typescript
// tailwind.config.ts  (theme.extend section)
colors: {
  base: {
    DEFAULT: '#0a0a0f',  // deepest dark
    surface: '#10101a',  // card backgrounds
    elevated: '#16162a', // elevated surfaces
  },
  accent: {
    DEFAULT: '#4f7cff',  // midnight blue primary
    muted: '#2a3f80',    // muted blue
    silver: '#a8b4cc',   // silver text/borders
  },
  backdrop: {
    top: 'transparent',
    mid: 'rgba(10, 10, 15, 0.6)',
    base: '#0a0a0f',
  },
}
```

### Pattern 5: Frosted Glass Card
**What:** Semi-transparent card with backdrop blur — the cinematic glass look.
```tsx
// Tailwind classes for frosted glass card
<div className="
  bg-base-surface/40
  backdrop-blur-md
  border border-accent-silver/10
  rounded-xl
  overflow-hidden
">
```

### Pattern 6: Responsive Layout (sidebar desktop / bottom nav mobile)
**What:** Sidebar visible on `md:` and above; bottom nav visible below `md:`.
```tsx
// AppShell.tsx
<div className="flex h-screen">
  {/* Desktop sidebar — hidden on mobile */}
  <aside className="hidden md:flex flex-col w-16 shrink-0 ...">
    <Sidebar />
  </aside>

  {/* Main content */}
  <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
    {children}
  </main>

  {/* Mobile bottom nav — hidden on desktop */}
  <nav className="fixed bottom-0 left-0 right-0 md:hidden ...">
    <BottomNav />
  </nav>
</div>
```

### Anti-Patterns to Avoid
- **`use client` on layout/shell components:** Keep AppShell, Sidebar, BackdropLayer as Client Components only where interactivity exists (e.g. active state). Static layout does not need `use client`.
- **Importing server Supabase client in Client Components:** Always import from `@/lib/supabase/client`, never from `server.ts`, in any `'use client'` file.
- **`next/image` without a positioned parent when using `fill`:** Parent must have `position: relative` (or Tailwind `relative`) and explicit dimensions.
- **Hardcoding colors instead of tokens:** All colors go through the Tailwind config — never inline hex values in className strings.
- **Putting sensitive env vars in `NEXT_PUBLIC_` prefix:** Only the Supabase URL and publishable/anon key should be `NEXT_PUBLIC_`; any service role key must never have that prefix.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible tooltips for icon-only sidebar | Custom tooltip CSS/JS | `shadcn/ui Tooltip` (wraps Radix Tooltip) | Radix handles focus, keyboard, ARIA; hand-rolled tooltips miss edge cases |
| Tab switching (status tabs) | State + conditional render | `shadcn/ui Tabs` (wraps Radix Tabs) | Keyboard navigation, ARIA roles handled |
| Crossfade background transition | CSS `transition` + manual class toggling | `framer-motion AnimatePresence` | AnimatePresence handles unmount animation correctly; CSS approach requires keeping both elements in DOM simultaneously with manual cleanup |
| Image optimization for poster backgrounds | `<img>` with CSS background | `next/image` with `fill` + `object-cover` | Automatic WebP conversion, lazy loading, responsive `srcSet`, no layout shift |
| Cookie-based session management | Manual cookie logic | `@supabase/ssr` createServerClient | Handles token refresh, cookie serialization, middleware integration correctly |
| Component primitives (buttons, dialogs, etc.) | Hand-styled HTML | `shadcn/ui` | Accessibility, focus rings, keyboard handling — not worth re-implementing |

**Key insight:** The design system novelty in this phase is CSS composition (tokens + blur + gradients), not primitive components. Use shadcn/ui for all interactive primitives and spend creative effort on the cinematic layer patterns.

---

## Common Pitfalls

### Pitfall 1: Wrong Supabase Key Name
**What goes wrong:** Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` when Supabase now uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for new projects.
**Why it happens:** The official docs are in transition — older tutorials still show `ANON_KEY`.
**How to avoid:** When creating a new Supabase project in 2025+, check the dashboard API settings for the exact variable name. The SSR quickstart now shows `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
**Warning signs:** Auth calls return 401 or "Invalid API key" despite pasting the correct value.

### Pitfall 2: `next/image fill` Without Positioned Parent
**What goes wrong:** Image renders with zero dimensions or overflows outside expected bounds.
**Why it happens:** `fill` positions the image absolutely within its nearest positioned ancestor. If the parent has no `position: relative`, the image fills the viewport or a wrong ancestor.
**How to avoid:** Every `<Image fill>` must have a parent with `relative` class and explicit height (either via Tailwind or CSS). For full-screen backdrop: `<div className="fixed inset-0 relative">`.
**Warning signs:** Image not visible, or white/blank area where backdrop should be.

### Pitfall 3: Backdrop Blur on Unsupported Browsers/Performance
**What goes wrong:** `backdrop-filter: blur()` causes jank on low-end devices or is unsupported in very old browsers (pre-2021 Safari without prefix).
**Why it happens:** Backdrop blur triggers GPU compositing layers per element.
**How to avoid:** Use `backdrop-blur-md` (8px) rather than `backdrop-blur-xl` for cards. Limit simultaneous backdrop-filter elements. Add `supports-[backdrop-filter]:` variant for graceful degradation.
**Warning signs:** Visible frame drops on mobile when scrolling, or fallback needed for no-backdrop-filter path.

### Pitfall 4: Server/Client Component Boundary Violation
**What goes wrong:** Using React hooks (`useState`, `useEffect`) or browser APIs in a Server Component, or trying to serialize non-serializable props across the boundary.
**Why it happens:** App Router components are Server by default. The cinematic backdrop context/state needs to cross the boundary.
**How to avoid:** `BackdropLayer` and `BackdropContext` must be `'use client'`. Keep the root `layout.tsx` as a Server Component but wrap children with a `<Providers>` Client Component that holds the backdrop context.
**Warning signs:** Error "useState is not a function" or "You're importing a component that needs useState" at build time.

### Pitfall 5: Forgetting Middleware for Supabase Session
**What goes wrong:** Auth tokens expire mid-session and the app shows stale/logged-out state without an obvious error.
**Why it happens:** Server Components cannot set cookies; middleware must handle token refresh.
**How to avoid:** Include `middleware.ts` in Phase 1 even before auth UI. The middleware should cover all routes except static assets.
**Warning signs:** Users randomly get logged out or see authenticated pages briefly before redirect loop.

### Pitfall 6: `create-next-app` Installing Latest Next.js (v16) Instead of v14
**What goes wrong:** Running `npx create-next-app@latest` installs Next.js 16.x, not 14.x. APIs and behaviors differ slightly from the locked project decision.
**Why it happens:** `@latest` always resolves to newest major.
**How to avoid:** Use `npx create-next-app@14` explicitly to pin the major version.
**Warning signs:** `package.json` shows `"next": "^16.x.x"` instead of `"^14.x.x"`.

---

## Code Examples

Verified patterns from official sources:

### Supabase Connection Test (Server Component)
```typescript
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
// app/movies/page.tsx — Phase 1 verification route
import { createClient } from '@/lib/supabase/server'

export default async function MoviesPage() {
  const supabase = await createClient()
  // Phase 1: just verify connection, no real table yet
  const { error } = await supabase.from('_dummy_connection_test').select('*').limit(1)
  // error expected (table doesn't exist) but connection must not throw
  return (
    <div>
      <p>Connection: {error?.code === '42P01' ? 'OK (table not found — expected)' : 'ERROR'}</p>
    </div>
  )
}
```

### Tailwind Glassmorphism Card
```tsx
// Source: https://www.epicweb.dev/tips/creating-glassmorphism-effects-with-tailwind-css
// Components can be composed from these classes
<div className="
  relative overflow-hidden rounded-2xl
  bg-white/5 backdrop-blur-md
  border border-white/10
  shadow-[0_8px_32px_rgba(0,0,0,0.4)]
">
  {/* poster image fills card */}
  <Image src={poster} alt={title} fill className="object-cover" />
</div>
```

### shadcn/ui Init Command
```bash
# Source: https://ui.shadcn.com/docs/installation/next
npx shadcn@latest init -t next
# Select: New York style, slate base color, CSS variables: yes
# Adds components.json, updates globals.css, creates src/components/ui/
```

### Environment Variables (.env.local)
```bash
# Required for Phase 1 Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key-from-dashboard>
# NEVER commit this file — must be in .gitignore
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023 → 2024 | auth-helpers is deprecated; SSR package is the only maintained option |
| `next/image layout="fill"` | `next/image fill` (prop) | Next.js 13 | `layout` prop removed; use boolean `fill` prop directly |
| Pages Router `getServerSideProps` | App Router Server Components | Next.js 13+ | Data fetching is now colocated with components, not in separate functions |
| Custom CSS variables for theming | Tailwind CSS v4 CSS-native variables | Tailwind v4 (2025) | Tailwind 4.x uses CSS `@theme` directive; no tailwind.config.ts needed in v4 mode |
| Framer Motion (npm) | Motion (rebranded npm package `motion`) | 2024 | `framer-motion` v11+ is now published as `motion`; both names work, `framer-motion` still valid |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Superseded by `@supabase/ssr`. Do not install.
- `next/image layout="fill"`: Use `fill` boolean prop. Old syntax throws errors in Next.js 14.
- Tailwind `backdrop-filter` utility (separate): Now just `backdrop-blur-*` handles it directly in Tailwind v3+.

---

## Open Questions

1. **Tailwind v4 vs v3 config format**
   - What we know: Tailwind 4.2.2 is the current latest and uses a new CSS-native `@theme` directive instead of `tailwind.config.ts`. `create-next-app@14` may install Tailwind v3.
   - What's unclear: Whether `create-next-app@14` scaffolds with Tailwind v3 or v4, and whether shadcn/ui CLI is compatible with v4 config format in March 2026.
   - Recommendation: Check Tailwind version after scaffold. If v4, use CSS `@theme` block in `globals.css` for tokens instead of `tailwind.config.ts`. If v3, use `tailwind.config.ts`. shadcn/ui has Tailwind v4 support as of early 2025.

2. **Supabase env var name: ANON_KEY vs PUBLISHABLE_KEY**
   - What we know: Supabase documentation transition is in progress. Older projects use `NEXT_PUBLIC_SUPABASE_ANON_KEY`, newer projects use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sb_publishable_xxx format).
   - What's unclear: Whether a newly created project in March 2026 will show the old or new key format in the dashboard.
   - Recommendation: Check the actual Supabase project dashboard API settings when creating the project. Accept whichever key name it shows; ensure the env var name matches exactly.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet established — Wave 0 must scaffold |
| Config file | None — see Wave 0 gaps |
| Quick run command | `npm run test -- --passWithNoTests` (after setup) |
| Full suite command | `npm run test` |

**Note:** This is a greenfield Next.js project. No test infrastructure exists yet. The standard for Next.js 14 App Router is Vitest (faster than Jest, native ESM) with `@testing-library/react`.

Recommended test setup:
```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | Cinematic backdrop renders with dark gradient on at least one route | Visual / smoke | `npm run test -- src/__tests__/backdrop.test.tsx` | Wave 0 gap |
| UI-01 | BackdropLayer component renders next/image when src is provided | Unit | `npm run test -- src/__tests__/backdrop.test.tsx` | Wave 0 gap |
| UI-01 | BackdropLayer renders fallback gradient when src is null | Unit | `npm run test -- src/__tests__/backdrop.test.tsx` | Wave 0 gap |
| UI-02 | AppShell shows Sidebar on md+ and BottomNav on mobile | Unit | `npm run test -- src/__tests__/layout.test.tsx` | Wave 0 gap |
| UI-02 | Layout renders correctly at 375px viewport width | Smoke / visual | Manual browser check at 375px | Manual only |

### Sampling Rate
- **Per task commit:** `npm run test -- --passWithNoTests`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `src/__tests__/backdrop.test.tsx` — covers UI-01 BackdropLayer rendering
- [ ] `src/__tests__/layout.test.tsx` — covers UI-02 responsive AppShell
- [ ] `src/__tests__/supabase-connection.test.ts` — covers Supabase env var resolution

---

## Sources

### Primary (HIGH confidence)
- `npm view` registry — package versions verified 2026-03-20 (next, tailwindcss, @supabase/supabase-js, @supabase/ssr, lucide-react, framer-motion, next-themes)
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs — SSR client patterns, env var names, middleware setup
- https://ui.shadcn.com/docs/installation/next — shadcn/ui init CLI command
- https://tailwindcss.com/docs/backdrop-filter-blur — backdrop-blur utility classes

### Secondary (MEDIUM confidence)
- https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them — App Router pitfalls
- https://nextjs.org/docs/app/api-reference/components/image — next/image fill pattern
- https://motion.dev/docs/react-motion-component — framer-motion AnimatePresence crossfade

### Tertiary (LOW confidence, flag for validation)
- Supabase key name `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — extracted from fetched Supabase quickstart page; confirm against actual project dashboard on creation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry 2026-03-20
- Architecture: HIGH — patterns from official Next.js/Supabase docs
- Cinematic patterns: MEDIUM — Tailwind backdrop-blur + framer-motion are verified; exact CSS values (blur intensity, gradient stops) are Claude's discretion
- Pitfalls: HIGH — verified against official Vercel App Router pitfall guide and Supabase docs

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable stack — 30 days; flag if @supabase/ssr minor version changes)
