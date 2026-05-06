# Phase 4: Detail View + Library Search - Research

**Researched:** 2026-03-20
**Domain:** Next.js 14 dynamic routes + cinematic CSS layout, Supabase FTS, debounced search
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DETAIL-01 | User can open a detail view showing poster, metadata, genre tags, synopsis | Dynamic route `/items/[id]` or `/movies/[id]` reading from `media_items`; genre stored as comma-separated text, parsed into pill tags on render |
| DETAIL-02 | Detail view shows cinematic backdrop — poster fills background with blur overlay | `next/image` with `fill` + `object-cover` in absolute-positioned container; Tailwind `backdrop-blur-*` on overlay div + gradient-to-transparent bottom fade; `remotePatterns` in `next.config.js` for OMDB/OL image domains |
| SRCH-01 | User can search their own library by title, author, director, or genre | Supabase FTS with generated `fts tsvector` column across `title \|\| author \|\| director \|\| genre`; or client-side `.filter()` on library data already in state |
| SRCH-02 | Search results update in real time as user types | `useDebouncedCallback` (300 ms) from `use-debounce`; updates URL param via `router.replace`; Server Component re-fetches on param change; OR pure client filter with `useState` — no network round-trip |
</phase_requirements>

---

## Summary

Phase 4 has two distinct technical problems: (1) a cinematic full-screen backdrop detail page and (2) real-time library search. They share no implementation surface and are cleanly separable into plans 04-01 and 04-02.

The detail page (DETAIL-01, DETAIL-02) is a standard Next.js dynamic route reading an existing `media_items` row from Supabase. The cinematic backdrop is pure CSS: a `next/image` with `fill` and `object-cover` in a fixed/absolute-positioned container, covered by a Tailwind backdrop-blur overlay and a gradient overlay that fades to the dark background color. No special libraries are needed. The main risk is external image domain configuration in `next.config.js` — OMDB and Open Library poster URLs are external origins, and Next.js Image Optimization requires `remotePatterns` allowlisting. Also: `priority` prop was deprecated in Next.js 16 in favor of `preload`, so use `loading="eager"` for the above-fold backdrop image.

For library search (SRCH-01, SRCH-02), there is a genuine architecture decision: Supabase FTS vs. client-side filtering. At personal-library scale (typically <500 items), **client-side filtering is simpler and faster** — no DB roundtrip, no FTS column migration, instant response. However, since Supabase was specifically chosen over Firebase partly for its FTS capability (per STATE.md), and the `media_items` table schema is established in Phase 3 with a migration, adding a generated tsvector column is a clean, low-cost addition that will serve well if libraries grow. The recommendation is: **add the FTS column in Phase 3's migration (or a Phase 4 migration), then use client-side filtering on page load data as the real-time layer** — best of both worlds. For the "My Library" search tab on the `/search` page, the approach is: load the user's library into memory on tab focus, filter client-side with 300 ms debounce.

**Primary recommendation:** Use `next/image fill` + Tailwind `backdrop-blur-xl` + gradient overlay for the cinematic backdrop. Use client-side array filtering with `useDebouncedCallback(300)` from `use-debounce` for real-time search. Optionally add a Supabase FTS generated column for future server-side search capability.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/image | built-in (Next.js 14) | Full-screen backdrop poster, detail poster | Automatic optimization, fill mode for cover backgrounds, remotePatterns allowlisting |
| use-debounce | ^4.0 | `useDebouncedCallback` for search input | Official Next.js Learn curriculum uses this; zero-dependency; maintained |
| @supabase/ssr | ^0.6.x | DB query for detail page item fetch | Same client established in Phase 2/3 |
| tailwindcss | project-locked | backdrop-blur-*, gradient overlays, glass pills | Design system already established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | ^2.x | Typed URL search params | If URL state for search needs more than basic URLSearchParams — optional, not required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side filter | Supabase FTS server query per keystroke | Server query adds ~100-200ms latency per keystroke even with debounce; client filter is instant once data is loaded |
| Supabase FTS textSearch | pg_trgm trigram similarity | trigram is better for typo-tolerance/fuzzy match; FTS is better for natural language phrase search; for a title/author/genre search, FTS is sufficient and simpler |
| next/image fill backdrop | CSS `background-image` with blur filter | CSS background-image bypasses Next.js image optimization (no srcset, no WebP, no lazy); `next/image` is the correct path |
| Dedicated detail page route | Intercepting routes modal | Intercepting routes add complexity (parallel routes + `@slot` folders); for this project a dedicated page `/movies/[id]` is simpler and shareable via URL with zero extra files |

**Installation:**
```bash
npm install use-debounce
```

**Version verification:**
```bash
npm view use-debounce version
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── (app)/
│       ├── movies/
│       │   ├── page.tsx             # Library grid page (Phase 3)
│       │   └── [id]/
│       │       └── page.tsx         # Movie detail page (Phase 4)
│       ├── books/
│       │   └── [id]/page.tsx        # Book detail page
│       ├── series/
│       │   └── [id]/page.tsx        # Series detail page
│       └── search/
│           └── page.tsx             # Search page — "My Library" tab now active (Phase 4)
├── components/
│   ├── detail/
│   │   ├── CinematicBackdrop.tsx    # Backdrop image + blur + gradient overlay
│   │   ├── DetailMetadata.tsx       # Title, year, rating, director/author, runtime
│   │   ├── GenrePills.tsx           # Parse genre string → pill tags
│   │   ├── SynopsisBlock.tsx        # Plot/synopsis text
│   │   └── DetailActions.tsx        # Rating edit, status change, favorite, delete
│   └── search/
│       ├── LibrarySearchInput.tsx   # Debounced input, updates URL param
│       └── LibrarySearchResults.tsx # Filtered results display
└── lib/
    └── search/
        └── filter.ts                # Client-side filter function (title, author, director, genre)
```

### Pattern 1: Cinematic Backdrop Detail Page
**What:** Fixed-position poster image behind the page content, covered by a blurred + gradient overlay, with content floating on top
**When to use:** Any item detail page in this project

```tsx
// Source: Next.js docs https://nextjs.org/docs/app/api-reference/components/image
// src/components/detail/CinematicBackdrop.tsx
'use client'

import Image from 'next/image'

interface CinematicBackdropProps {
  posterUrl: string | null
  alt: string
}

export function CinematicBackdrop({ posterUrl, alt }: CinematicBackdropProps) {
  if (!posterUrl) {
    // Fallback: solid dark gradient, no image
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
    )
  }

  return (
    <div className="fixed inset-0 -z-10">
      {/* Poster image: fill the entire viewport, cropped to cover */}
      <Image
        src={posterUrl}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        loading="eager"   // above-fold LCP — do NOT lazy-load
        quality={60}      // backdrop doesn't need sharp quality; saves bandwidth
      />
      {/* Blur overlay: sits on top of the image */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/50" />
      {/* Bottom gradient: fades to the app's background color */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </div>
  )
}
```

**next.config.js remotePatterns (required):**
```js
// Source: Next.js docs https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',   // OMDB posters
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',  // Open Library covers
      },
    ],
  },
}
module.exports = nextConfig
```

**Detail page Server Component:**
```tsx
// src/app/(app)/movies/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CinematicBackdrop } from '@/components/detail/CinematicBackdrop'

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  const { data: item } = await supabase
    .from('media_items')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!item) notFound()

  return (
    <>
      <CinematicBackdrop posterUrl={item.poster_url} alt={item.title} />
      <main className="relative z-10 min-h-screen px-6 pt-16 pb-24">
        {/* Poster thumbnail + metadata side by side */}
        {/* ... */}
      </main>
    </>
  )
}
```

### Pattern 2: Genre Pill Tags
**What:** Genre stored as a comma-separated string (e.g. "Action, Drama, Thriller") in `media_items.genre`; split and rendered as styled span pills
**When to use:** Detail page genre display; also usable on card overlays

```tsx
// src/components/detail/GenrePills.tsx
interface GenrePillsProps {
  genre: string | null
}

export function GenrePills({ genre }: GenrePillsProps) {
  if (!genre) return null

  const tags = genre.split(',').map((g) => g.trim()).filter(Boolean)

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 rounded-full text-xs font-medium
                     bg-white/10 backdrop-blur-sm border border-white/20
                     text-white/80"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
```

### Pattern 3: Real-Time Debounced Library Search
**What:** Input debounced 300 ms via `useDebouncedCallback`; updates URL param `q`; Server Component re-fetches library filtered by that query — OR purely client-side filter on pre-loaded data
**Approach A (URL param + server re-fetch):** Works with SSR, shareable URLs, but has 100-300ms server RTT
**Approach B (client-side filter on pre-loaded data):** Zero latency after initial load; recommended for personal-library scale

```tsx
// Approach B: Client-side filter (recommended)
// src/components/search/LibrarySearchInput.tsx
'use client'

import { useDebouncedCallback } from 'use-debounce'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function LibrarySearchInput() {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <input
      type="search"
      placeholder="Search your library..."
      defaultValue={searchParams.get('q') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
      className="w-full rounded-xl bg-white/10 backdrop-blur-sm
                 border border-white/20 px-4 py-3 text-white
                 placeholder:text-white/40 outline-none
                 focus:border-white/40 transition-colors"
    />
  )
}
```

```ts
// src/lib/search/filter.ts
// Client-side filter — runs on the already-fetched library array
import type { Database } from '@/types/supabase'

type MediaItem = Database['public']['Tables']['media_items']['Row']

export function filterLibrary(items: MediaItem[], query: string): MediaItem[] {
  if (!query.trim()) return items

  const q = query.toLowerCase()

  return items.filter((item) => {
    return (
      item.title?.toLowerCase().includes(q) ||
      item.author?.toLowerCase().includes(q) ||
      item.director?.toLowerCase().includes(q) ||
      item.genre?.toLowerCase().includes(q)
    )
  })
}
```

### Pattern 4: Supabase FTS Column (Optional Enhancement)
**What:** Generated tsvector column for server-side full-text search; useful if user library grows large or for offline-search URL sharing
**When to use:** If client-side filter proves insufficient; add as a migration in Wave 0 or Plan 04-02

```sql
-- Source: Supabase FTS docs https://supabase.com/docs/guides/database/full-text-search
-- Migration: add FTS column to media_items
alter table media_items
  add column fts tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(author, '') || ' ' ||
      coalesce(director, '') || ' ' ||
      coalesce(genre, '')
    )
  ) stored;

create index media_items_fts on media_items using gin (fts);
```

```ts
// Supabase textSearch query (server-side, if using FTS)
// Source: Supabase docs
const { data } = await supabase
  .from('media_items')
  .select('*')
  .textSearch('fts', query, { type: 'websearch' })
  // RLS automatically scopes to current user
```

### Anti-Patterns to Avoid
- **CSS `background-image` for the backdrop:** Bypasses Next.js image optimization entirely. Use `next/image fill` instead.
- **`priority` prop on the backdrop image:** Deprecated in Next.js 16 in favor of `preload`. Use `loading="eager"` for above-fold images.
- **`backdrop-filter` without a semi-transparent layer on top:** `backdrop-filter` only works when the element with the filter has a non-opaque background. The `bg-black/50` on the overlay div is required — without it, `backdrop-blur-xl` has no visible effect.
- **Lazy-loading the backdrop image:** The backdrop is the LCP element; use `loading="eager"`. Lazy-loading it causes a visible flash of no-background.
- **Debouncing at 0 ms or no debounce:** Every keystroke fires a search. For client-side filter this is actually fine, but for URL-param-driven server queries, always debounce.
- **Forgetting `remotePatterns` in `next.config.js`:** External poster images (OMDB, Open Library) fail with a Next.js image optimization error if the hostname is not allowlisted. This is a build-time config change, not a runtime one.
- **Storing genres as a PostgreSQL array instead of comma-string:** The Phase 3 schema stores `genre text` as a comma-separated string (matching OMDB's format). Don't introduce an array column in Phase 4. Parse on render.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce logic | Custom `useEffect` + `setTimeout` cleanup | `useDebouncedCallback` from `use-debounce` | Race conditions on rapid input; cleanup on unmount; well-tested; used in official Next.js docs |
| Blur/gradient overlay | WebGL or canvas-based blur | CSS `backdrop-filter: blur()` + Tailwind | Native browser compositing; zero JS; GPU-accelerated; works on all modern browsers |
| Fuzzy search | Levenshtein distance implementation | `.toLowerCase().includes(q)` for substring match, or Supabase `textSearch` with `websearch` type for phrase/word matching | Substring match is sufficient for title/author search at personal-library scale; FTS handles multi-word naturally |
| Image host proxy | Custom Next.js API route to proxy poster URLs | `remotePatterns` in `next.config.js` | Native Next.js feature; proxying externally adds latency and complexity |

**Key insight:** Both the cinematic backdrop and the library search can be built entirely with platform primitives (CSS, Next.js built-ins, Supabase SDK). No additional runtime dependencies are required beyond `use-debounce`.

---

## Common Pitfalls

### Pitfall 1: `backdrop-filter` Has No Effect
**What goes wrong:** The blur overlay renders but the poster is still crisp behind content — blur does nothing.
**Why it happens:** `backdrop-filter` requires the element to have some transparency. A fully opaque `bg-black` div will show black, not a blurred image. The effect only composites what's "behind" a semi-transparent layer.
**How to avoid:** The overlay div must use a semi-transparent background: `bg-black/50` or `bg-black/60`. The blur happens between the overlay's background and the image below.
**Warning signs:** Removing `backdrop-filter` from the class has no visible impact.

### Pitfall 2: `next/image` with External URLs Not in `remotePatterns`
**What goes wrong:** Detail page throws `Error: Invalid src prop ... hostname is not configured under images.remotePatterns`.
**Why it happens:** Next.js Image Optimization requires explicit allowlisting of external domains to prevent open redirect abuse.
**How to avoid:** Add both `m.media-amazon.com` (OMDB) and `covers.openlibrary.org` (Open Library) to `remotePatterns` in `next.config.js` before implementing any detail page. This is a one-time config change.
**Warning signs:** The error appears in development immediately when the detail page first renders; it does not fail silently.

### Pitfall 3: `priority` Prop Deprecated in Next.js 16
**What goes wrong:** Using `priority={true}` on the backdrop image produces a deprecation warning in Next.js 16+.
**Why it happens:** Next.js 16 replaced `priority` with the more explicit `preload` prop. The behavior is the same, but `priority` is now legacy.
**How to avoid:** Use `loading="eager"` for above-fold images instead of `priority`. This works identically in Next.js 14 and 16.
**Warning signs:** Console warning: "`priority` prop is deprecated" — will become an error in a future version.

### Pitfall 4: Search Clears on Navigation
**What goes wrong:** User types in the search box, navigates to a detail page, hits back — search input is empty.
**Why it happens:** Using `useState` for search query means it's not persisted to the URL. Navigation resets component state.
**How to avoid:** Use URL params (`?q=`) as the source of truth for the search query. The `defaultValue={searchParams.get('q') ?? ''}` on the input syncs the field on mount. `router.replace` (not `push`) prevents the URL history from accumulating a new entry per keystroke.
**Warning signs:** User navigates back and has to re-type the search query.

### Pitfall 5: Detail Page `notFound()` with Stale RLS
**What goes wrong:** A user directly navigates to `/movies/[id]` with another user's item ID. The row is not returned by Supabase (RLS filters it), so `item` is null. If `notFound()` is not called, the page renders with all fields as undefined.
**Why it happens:** Supabase RLS silently returns no rows (not an error) when the user doesn't own the row.
**How to avoid:** Always call `notFound()` when `item` is null after the Supabase query. This renders the Next.js 404 page instead of a broken layout.
**Warning signs:** Detail page renders with empty/undefined fields for items not owned by the current user.

### Pitfall 6: Client-Side Filter Is Not Applied on Initial Load
**What goes wrong:** User shares a URL with `?q=action`. Page loads, results show everything (not filtered).
**Why it happens:** The filter is applied client-side after the component mounts, but the initial render uses the full unfiltered list.
**How to avoid:** On the Server Component side, read `searchParams.q` and either (a) pass it as an initial filter prop to the client component, or (b) apply the filter server-side for the initial render, then hand off to client-side filtering.
**Warning signs:** Brief flash of unfiltered results on direct URL load.

---

## Code Examples

### Full Detail Page Layout Structure
```tsx
// Source: Next.js docs (dynamic routes + image fill pattern)
// src/app/(app)/movies/[id]/page.tsx
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GenrePills } from '@/components/detail/GenrePills'
import { CinematicBackdrop } from '@/components/detail/CinematicBackdrop'
import { DetailActions } from '@/components/detail/DetailActions'

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  const { data: item } = await supabase
    .from('media_items')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!item) notFound()

  return (
    <>
      <CinematicBackdrop posterUrl={item.poster_url} alt={item.title} />
      <main className="relative z-10 min-h-screen">
        {/* Hero section: poster thumbnail + title block */}
        <section className="flex gap-8 px-6 pt-20 pb-10">
          {item.poster_url && (
            <div className="relative w-40 h-60 shrink-0 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={item.poster_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-3">
            <h1 className="text-4xl font-bold text-white">{item.title}</h1>
            {item.year && (
              <p className="text-white/60 text-sm">{item.year}</p>
            )}
            <GenrePills genre={item.genre} />
            <DetailActions item={item} />
          </div>
        </section>

        {/* Synopsis */}
        {item.plot && (
          <section className="px-6 pb-8">
            <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">
              Synopsis
            </h2>
            <p className="text-white/80 leading-relaxed">{item.plot}</p>
          </section>
        )}

        {/* Metadata grid */}
        <section className="px-6 grid grid-cols-2 gap-4 pb-16">
          {item.director && (
            <div>
              <dt className="text-white/40 text-xs uppercase tracking-wider">Director</dt>
              <dd className="text-white mt-1">{item.director}</dd>
            </div>
          )}
          {item.author && (
            <div>
              <dt className="text-white/40 text-xs uppercase tracking-wider">Author</dt>
              <dd className="text-white mt-1">{item.author}</dd>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
```

### Library Search (My Library Tab — Client Component)
```tsx
// Source: Next.js Learn — Adding Search and Pagination
// https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// src/app/(app)/search/page.tsx (Server Component wrapper)
import { createServerClient } from '@/lib/supabase/server'
import { LibrarySearchTab } from '@/components/search/LibrarySearchTab'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string }
}) {
  const supabase = createServerClient()

  // Pre-load the full library for client-side filtering
  const { data: library } = await supabase
    .from('media_items')
    .select('id, title, author, director, genre, poster_url, media_type, status')
    .order('date_added', { ascending: false })

  return (
    <div>
      {/* Tab switcher: Add New | My Library */}
      {/* ... */}
      {searchParams.tab === 'library' || !searchParams.tab ? (
        <LibrarySearchTab
          library={library ?? []}
          initialQuery={searchParams.q ?? ''}
        />
      ) : null}
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `priority={true}` on next/image | `loading="eager"` | Next.js 16 | `priority` deprecated; same LCP behavior, no flash |
| `background-image` CSS for full-screen posters | `next/image fill` | Next.js 13+ | Optimization, WebP conversion, srcset, lazy-loading |
| `useFormState` for search state | `useActionState` (React 19) | React 19 / Next.js 15 | In Next.js 14 still use `useFormState` from `react-dom`; in this project stay on Next.js 14 pattern |
| Global CSS `filter: blur()` on image | `backdrop-filter: blur()` on overlay | CSS spec maturity | `backdrop-filter` blurs what's behind; `filter` blurs the element itself — backdrop is correct for this use case |
| Separate `images.domains` config | `images.remotePatterns` | Next.js 13 | `domains` is deprecated; `remotePatterns` is the current API (more granular control) |

**Deprecated/outdated:**
- `images.domains` in `next.config.js`: use `images.remotePatterns` instead
- `priority` prop on `<Image>`: use `loading="eager"` instead (Next.js 16+)
- `images.domains` string list: replaced by `remotePatterns` object with protocol + hostname + pathname + port

---

## Open Questions

1. **Shared detail page vs. per-type routes**
   - What we know: Phase 3 establishes `/movies`, `/books`, `/series` as separate routes. Each would get its own `[id]` sub-route.
   - What's unclear: Whether to use `/movies/[id]`, `/books/[id]`, `/series/[id]` (3 files, same component) vs. a shared `/items/[id]` route
   - Recommendation: Use per-type routes (`/movies/[id]` etc.) — consistent with Phase 3 routing structure, and the planner's ROADMAP says "Cinematic item detail pages" tied to library items. Per-type routes avoid needing to infer the media type from the ID. Extract shared UI into `<ItemDetailLayout>` component.

2. **Delete action location**
   - What we know: Phase 3 CONTEXT.md explicitly says "Delete: Only available from the item detail view (Phase 4). No delete action on the library card."
   - What's unclear: The `deleteItem` Server Action was scoped to Phase 3 (plan 03-05) but the UI trigger is in Phase 4. This means Phase 4 only needs to add the Delete button UI and call the already-existing action.
   - Recommendation: Plan 04-01 adds a Delete button to `DetailActions` that calls the Phase 3 `deleteItem` Server Action. No new server-side logic needed.

3. **Rating edit from detail page**
   - What we know: Phase 3 CONTEXT.md says "Rating is NOT editable from the card — it's set in the detail view (Phase 4)."
   - What's unclear: Exact UI for the rating widget on the detail page
   - Recommendation: Claude's discretion — a 1–10 star selector row or numeric input inline in `DetailActions` is appropriate. Server Action `updateItemRating` already exists from Phase 3.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + React Testing Library (expected — confirm in Wave 0) |
| Config file | `jest.config.ts` — Wave 0 gap if not present |
| Quick run command | `npm test -- --testPathPattern=detail --passWithNoTests` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DETAIL-01 | Detail page renders title, genre pills, synopsis, metadata from item row | unit | `npm test -- --testPathPattern=ItemDetail` | Wave 0 |
| DETAIL-02 | CinematicBackdrop renders next/image with fill + overlay divs; falls back to gradient when posterUrl is null | unit | `npm test -- --testPathPattern=CinematicBackdrop` | Wave 0 |
| SRCH-01 | filterLibrary() matches on title, author, director, genre | unit | `npm test -- --testPathPattern=filter` | Wave 0 |
| SRCH-02 | LibrarySearchInput debounces and updates URL param after 300ms | unit | `npm test -- --testPathPattern=LibrarySearchInput` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=detail|filter|LibrarySearch --passWithNoTests`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/components/detail/CinematicBackdrop.test.tsx` — covers DETAIL-02
- [ ] `src/__tests__/components/detail/ItemDetailPage.test.tsx` — covers DETAIL-01
- [ ] `src/__tests__/lib/search/filter.test.ts` — covers SRCH-01
- [ ] `src/__tests__/components/search/LibrarySearchInput.test.tsx` — covers SRCH-02
- [ ] `jest.config.ts` — if not established in Phases 1–3

---

## Sources

### Primary (HIGH confidence)
- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image) — `fill`, `loading`, `placeholder`, `blurDataURL`, `remotePatterns`, deprecation of `priority` (last updated 2026-03-10)
- [Next.js Intercepting Routes docs](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes) — `(..)` convention, parallel routes + modal pattern (version 16.2.0)
- [Supabase Full Text Search docs](https://supabase.com/docs/guides/database/full-text-search) — `tsvector` generated columns, GIN index, `textSearch` method, multi-column concatenation
- [Next.js Learn: Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) — official `useDebouncedCallback` + URL params pattern
- [Tailwind CSS backdrop-filter-blur docs](https://tailwindcss.com/docs/backdrop-filter-blur) — `backdrop-blur-*` utility classes

### Secondary (MEDIUM confidence)
- [Next.js useSearchParams docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) — client-side URL param reading
- [Supabase textSearch JavaScript API](https://supabase.com/docs/reference/javascript/using-filters) — `type: 'websearch'` query mode
- Phase 3 CONTEXT.md — locked decisions: delete only in detail view, rating edit only in detail view, "My Library" tab scaffolded in Phase 3 as placeholder

### Tertiary (LOW confidence)
- Community patterns for intercepting routes vs. dedicated detail pages at scale — multiple sources agree dedicated pages are simpler; no single authoritative reference

---

## Metadata

**Confidence breakdown:**
- Detail page architecture: HIGH — Next.js official docs confirm fill prop, remotePatterns, loading="eager"
- Cinematic backdrop CSS: HIGH — Tailwind docs + MDN confirm backdrop-filter behavior and requirements
- Client-side filtering approach: HIGH — verified against Next.js Learn official curriculum
- Supabase FTS column: HIGH — official Supabase docs; verified generated column + GIN index syntax
- Test framework: LOW — Next.js project not yet initialized; Jest assumption based on Next.js 14 standard

**Research date:** 2026-03-20
**Valid until:** 2026-06-20 (Next.js Image API stable; re-verify if upgrading to Next.js 15/16)
