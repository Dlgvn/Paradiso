# Phase 3: Library Management - Research

**Researched:** 2026-03-20
**Domain:** Supabase PostgreSQL schema + RLS, OMDB API, Open Library API, Next.js 14 Server Actions, library CRUD UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Search & Add Flow**
- Search location: Dedicated `/search` page (Phase 1 decision — top-level nav destination)
- Search page tabs: Two tabs — "Add New" (queries OMDB/Open Library) and "My Library" (local library search, Phase 4 — scaffold the tab in Phase 3 but it's a placeholder/coming-soon state)
- Type selector: Movies / Books / Series toggle. Searching queries one type at a time — Movies/Series → OMDB, Books → Open Library
- Results display: Poster grid — consistent with library view. Each result card: poster, title, year
- Add flow: Tapping a search result opens a picker with status + rating together (both set at add time). Status: Watchlist / Watching / Completed / Dropped. Rating: 1–10 (optional at add time)
- After adding: Stay on the search page. The result card shows an "Added" badge or checkmark

**Item Edit Interactions (from Library Cards)**
- Card hover overlay covers: Status change + favorite toggle. Rating is NOT editable from the card — it's in the detail view (Phase 4)
- Status change on hover: Tapping the status badge opens a dropdown/popover with all 4 statuses. Intentional selection, not cycle-on-tap
- Favorite toggle on hover: Heart icon toggles directly on tap. No confirmation
- Delete: Only available from the item detail view (Phase 4). No delete action on the library card

**Duplicate Detection**
- Detection method: By external API unique ID — IMDB ID for movies/series, ISBN or Open Library Work ID for books
- Warning style: Soft warning — search result card shows existing status badge ("Already in Watchlist") before tapping. If tapped anyway, a confirmation appears: "This is already in your library as [Status]. Add anyway?"
- Hard block: Not used — user can choose to re-add

**Empty States**
- Per-tab empty state: Same cinematic empty state as the full-library empty state (dark backdrop, tagline, Search CTA) — NOT plain text
- Context-aware copy adapts to the status tab:
  - Watchlist (empty): "Find your next watch" → Search button
  - Watching (empty): "Start something new" → Search button
  - Completed (empty): "Nothing finished yet — keep going" → Search button
  - Dropped (empty): "Nothing dropped yet" → no CTA
- Full library empty state (no items at all, from Phase 1): cinematic placeholder with tagline + Search CTA. Unchanged

### Claude's Discretion
- Exact UI for the status + rating picker at add time (bottom sheet, modal, inline form)
- Exact animation for the "Added" badge appearing on search result cards
- Poster grid column count on mobile vs. desktop
- Loading skeleton for search result cards while API is fetching
- Error state when OMDB or Open Library API returns an error
- "My Library" tab placeholder copy/design in Phase 3

### Deferred Ideas (OUT OF SCOPE)
- Local library full-text search (My Library tab) — tab is scaffolded in Phase 3 but search functionality is Phase 4 (SRCH-01, SRCH-02)
- Rating from card hover — deferred to keep cards clean; rating is in the detail view (Phase 4)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIB-01 | User can search for movies/series via OMDB (server-side key) | OMDB search API: `?s=title&type=movie|series`, IMDB ID returned in results |
| LIB-02 | User can search for books via Open Library | Open Library search API: `/search.json?q=query&fields=key,title,author_name,cover_i,first_publish_year` |
| LIB-03 | User can add a movie/book/series with a status | Server Action: insert into `media_items` with status enum, duplicate pre-check |
| LIB-04 | User can update the status of any item | Server Action: UPDATE media_items SET status WHERE id AND user_id = auth.uid() |
| LIB-05 | User can set a rating (1–10) on any item | Same Server Action as LIB-04, or dedicated updateRating action |
| LIB-06 | User can mark/unmark items as favorites | Server Action: UPDATE media_items SET is_favorite WHERE id AND user_id = auth.uid() |
| LIB-07 | User can delete an item from their library | Server Action: DELETE from media_items WHERE id AND user_id = auth.uid() — UI triggers from detail page (Phase 4), but action lives here |
| LIB-08 | System warns user when adding an item already in library | Pre-add query: SELECT id, status FROM media_items WHERE external_id = ? AND user_id = auth.uid(); show badge on card |
| LIB-09 | User can view library in grid view or list view | Client component with view toggle state, grid CSS grid vs list flex layout |
| LIB-10 | User can filter library by media type and status | media_type column on media_items, filter applied via Supabase query or URL params |
</phase_requirements>

---

## Summary

Phase 3 is the largest single phase in the project — it introduces the database schema, two external API integrations, and the full library UI. The core challenge is building a unified data model that can represent three fundamentally different media types (movies, books, series) in a single Supabase table while keeping queries efficient and the TypeScript types clean.

The OMDB and Open Library APIs are both well-understood and stable. OMDB uses a server-side API key (never client-exposed) accessed through a Next.js Server Action. Open Library is public/keyless and can be called from a Server Action or directly from the client — using a Server Action is preferred for consistency and to enable result caching. A critical January 2025 change to the Open Library search API now requires explicitly specifying `fields=` in requests, as the default field set was restricted for performance.

The key architectural decision is the `media_items` table design. A single polymorphic table (one row per item, `media_type` discriminator column, nullable type-specific columns) is the standard approach and aligns with how Supabase RLS, analytics queries, and migration (Phase 7) all want to work. Separate tables per media type create JOIN complexity in Phase 5 analytics and are harder to import into in Phase 7.

**Primary recommendation:** Single `media_items` table with `media_type` enum column (`movie | book | series`), `external_id` storing IMDB ID or Open Library Work ID, and `user_id uuid` with RLS policies using `(select auth.uid()) = user_id`. Server Actions in `app/actions/library.ts` handle all CRUD. Open Library `fields` parameter is mandatory in 2026.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.6.x | Supabase client for Next.js App Router (SSR-safe) | Replaces deprecated `@supabase/auth-helpers-nextjs` as of mid-2025 |
| next | 14.x | Server Actions, App Router, revalidatePath | Project locked |
| typescript | ^5.x | Type safety, Supabase generated types | Project locked |
| zod | ^3.x | Server Action input validation | Standard Next.js + Server Actions validation layer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supabase CLI | latest | `supabase gen types typescript` for DB types | After each schema migration |
| react-dom/hooks useFormStatus | built-in React 18 | Pending state on form submit buttons | All Server Action forms |
| useOptimistic | built-in React 18 | Optimistic UI for status/favorite toggles | Card hover actions (status, favorite) |
| useTransition | built-in React 18 | isPending state for non-form Server Action calls | Delete, status update event handlers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single media_items table | Separate movies/books/series tables | Separate tables make Phase 5 analytics and Phase 7 migration harder; single table is simpler for RLS, queries, and types |
| Server Action for OMDB | Route Handler (`/api/search`) | Server Action is simpler, no separate endpoint to maintain; Route Handler needed only if external webhook |
| Open Library from Server Action | Open Library from client (direct fetch) | Server Action allows caching with `unstable_cache`, keeps external calls server-side consistently |

**Installation:**
```bash
npm install @supabase/ssr zod
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/types/supabase.ts
```

**Version verification:** `npm view @supabase/ssr version` before using — package moved fast through 2024-2025.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (app)/
│   │   ├── movies/page.tsx          # Library page for movies
│   │   ├── books/page.tsx           # Library page for books
│   │   ├── series/page.tsx          # Library page for series
│   │   └── search/page.tsx          # Search page (Add New + My Library tabs)
│   └── actions/
│       ├── library.ts               # All library CRUD Server Actions
│       └── search.ts                # OMDB + Open Library Server Actions
├── components/
│   ├── library/
│   │   ├── MediaCard.tsx            # Grid card (frosted glass, hover overlay)
│   │   ├── MediaListItem.tsx        # List view row
│   │   ├── LibraryGrid.tsx          # Grid/list view switcher + layout
│   │   ├── StatusFilter.tsx         # Tab bar: Watchlist/Watching/Completed/Dropped
│   │   ├── ViewToggle.tsx           # Grid/list toggle button
│   │   └── EmptyState.tsx           # Cinematic empty state with context-aware copy
│   └── search/
│       ├── SearchResultCard.tsx     # Search result card with Added badge
│       ├── AddItemDialog.tsx        # Status + rating picker (Claude's discretion)
│       └── MediaTypeSelector.tsx    # Movies/Books/Series toggle
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client (from Phase 2)
│   │   └── server.ts                # Server client (from Phase 2)
│   └── api/
│       ├── omdb.ts                  # OMDB fetch helpers (server-only)
│       └── open-library.ts          # Open Library fetch helpers
└── types/
    ├── supabase.ts                  # Generated DB types (supabase gen types)
    └── media.ts                     # Domain types: MediaItem, MediaType, MediaStatus
```

### Pattern 1: Single Polymorphic `media_items` Table
**What:** One table for all media types, discriminated by `media_type` column
**When to use:** Any time different entity types share the same user ownership, status, rating, and favorite semantics

**SQL Migration:**
```sql
-- Source: Supabase docs, RLS pattern: https://supabase.com/docs/guides/database/postgres/row-level-security
create type media_type as enum ('movie', 'book', 'series');
create type media_status as enum ('watchlist', 'watching', 'completed', 'dropped');

create table media_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  media_type  media_type not null,
  external_id text not null,          -- IMDB ID (tt...) or OL Work ID (OL...W)
  title       text not null,
  year        text,
  genre       text,
  director    text,                    -- movies/series only
  author      text,                    -- books only
  plot        text,
  poster_url  text,
  external_rating text,               -- OMDB imdbRating or null
  status      media_status not null default 'watchlist',
  user_rating smallint check (user_rating between 1 and 10),
  is_favorite boolean not null default false,
  date_added  timestamptz not null default now(),
  date_completed timestamptz,
  notes       text,
  -- Unique: one user can have each external item once (soft — duplicate detection warns, doesn't block)
  constraint unique_user_item unique (user_id, external_id)
);

-- Index for RLS performance (critical — without this, RLS scans entire table)
create index on media_items (user_id);
create index on media_items (user_id, media_type);
create index on media_items (user_id, status);

-- Enable RLS
alter table media_items enable row level security;

-- Policies
create policy "Users can view their own items"
  on media_items for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own items"
  on media_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own items"
  on media_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own items"
  on media_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);
```

### Pattern 2: Server Action for OMDB Search (Server-Side Key)
**What:** A `'use server'` file that holds the OMDB API key in `process.env.OMDB_API_KEY` (no NEXT_PUBLIC_ prefix)
**When to use:** Any external API call requiring a secret key

```typescript
// Source: Next.js 14 Server Actions docs + OMDB API docs
// src/app/actions/search.ts
'use server'

export interface OmdbSearchResult {
  imdbID: string
  Title: string
  Year: string
  Type: 'movie' | 'series'
  Poster: string   // URL or "N/A"
}

export async function searchOmdb(
  title: string,
  type: 'movie' | 'series'
): Promise<{ results: OmdbSearchResult[]; error?: string }> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) throw new Error('OMDB_API_KEY not configured')

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('s', title)
  url.searchParams.set('type', type)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  const data = await res.json()

  if (data.Response === 'False') {
    if (data.Error === 'Movie not found!' || data.Error === 'Series not found!') {
      return { results: [] }
    }
    return { results: [], error: data.Error }
  }

  return { results: data.Search ?? [] }
}
```

### Pattern 3: Open Library Search (Explicit Fields Parameter — Required 2025)
**What:** Open Library `/search.json` with mandatory `fields=` parameter after January 2025 breaking change
**When to use:** All book searches

```typescript
// Source: Open Library Search API docs + January 2025 breaking change
// https://openlibrary.org/dev/docs/api/search
'use server'

export interface OlSearchResult {
  key: string         // "/works/OL...W"
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number    // internal cover ID for cover URL
}

export async function searchOpenLibrary(
  query: string
): Promise<{ results: OlSearchResult[]; error?: string }> {
  const params = new URLSearchParams({
    q: query,
    limit: '20',
    // REQUIRED since Jan 2025: default fields now restricted
    fields: 'key,title,author_name,first_publish_year,cover_i',
  })

  const res = await fetch(
    `https://openlibrary.org/search.json?${params}`,
    { next: { revalidate: 300 } }
  )

  if (!res.ok) return { results: [], error: 'Open Library unavailable' }

  const data = await res.json()
  return { results: data.docs ?? [] }
}

// Cover URL from cover_i (internal cover ID)
export function getOlCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
}

// Cover URL from OLID (Open Library work ID)
export function getOlCoverUrlByOlid(olid: string, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`
}
```

### Pattern 4: Library CRUD Server Actions
**What:** All library mutations in a single `'use server'` file; each action verifies auth, validates input with zod, then calls Supabase
**When to use:** All library state changes

```typescript
// Source: Next.js 14 docs, Supabase RLS docs
// src/app/actions/library.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const AddItemSchema = z.object({
  externalId: z.string().min(1),
  mediaType: z.enum(['movie', 'book', 'series']),
  title: z.string().min(1),
  status: z.enum(['watchlist', 'watching', 'completed', 'dropped']),
  userRating: z.number().int().min(1).max(10).optional(),
  // ... other fields
})

export async function addMediaItem(input: z.infer<typeof AddItemSchema>) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = AddItemSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { error } = await supabase.from('media_items').insert({
    user_id: user.id,
    external_id: parsed.data.externalId,
    media_type: parsed.data.mediaType,
    title: parsed.data.title,
    status: parsed.data.status,
    user_rating: parsed.data.userRating ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/${parsed.data.mediaType}s`)
  return { success: true }
}

export async function updateItemStatus(id: string, status: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('media_items')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)   // Belt-and-suspenders: RLS also enforces this

  if (error) return { error: error.message }
  revalidatePath('/movies')
  revalidatePath('/books')
  revalidatePath('/series')
  return { success: true }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('media_items')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/movies')
  revalidatePath('/books')
  revalidatePath('/series')
  return { success: true }
}
```

### Pattern 5: Duplicate Detection Pre-Check
**What:** Before rendering the add dialog, query `media_items` for the external ID. Pass the existing status (if any) to the search result card as a prop.

```typescript
// In the Server Component that renders search results:
// After fetching OMDB/OL results, do a single batch lookup for all external IDs
const externalIds = results.map(r => r.imdbID || r.key.replace('/works/', ''))

const { data: existing } = await supabase
  .from('media_items')
  .select('external_id, status')
  .eq('user_id', userId)
  .in('external_id', externalIds)

// Build a Map<externalId, status> and pass to cards
const existingMap = new Map(existing?.map(e => [e.external_id, e.status]) ?? [])
```

### Pattern 6: Optimistic UI for Card Hover Actions
**What:** Use `useOptimistic` to immediately reflect status and favorite changes before Server Action completes
**When to use:** Status dropdown and heart toggle on card hover overlay

```typescript
// Source: Next.js 14 docs, useOptimistic pattern
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleFavorite } from '@/app/actions/library'

export function FavoriteButton({ itemId, initialFavorite }: {
  itemId: string
  initialFavorite: boolean
}) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(initialFavorite)
  const [, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticFav(!optimisticFav)
      await toggleFavorite(itemId, !optimisticFav)
    })
  }

  return (
    <button onClick={handleToggle}>
      {optimisticFav ? '♥' : '♡'}
    </button>
  )
}
```

### Anti-Patterns to Avoid
- **Expose OMDB key with NEXT_PUBLIC_ prefix:** Key is visible in client bundle. Always use bare `process.env.OMDB_API_KEY` in Server Actions only.
- **Skip the user_id check in Server Actions:** RLS handles it at DB level, but explicit `eq('user_id', user.id)` in queries is a belt-and-suspenders defense-in-depth practice.
- **Skip `fields=` on Open Library search:** Since January 2025, omitting `fields` returns a restricted default set that may miss `cover_i` and `author_name`.
- **Use auth.uid() without select wrapper in RLS policies:** `(select auth.uid())` is the performant form per Supabase docs. Plain `auth.uid()` evaluates per row; wrapped `(select auth.uid())` evaluates once per query — 100x performance difference on large tables.
- **Forget indexes on media_items(user_id):** Without this index, every RLS SELECT scans the entire table.
- **revalidatePath inside try/catch:** `revalidatePath` must be called after `try/catch` resolves or it won't execute. Keep it after the error check.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input validation in Server Actions | Custom type-checking logic | zod `safeParse` | Type coercion, missing field errors, union types — all handled |
| Auth check in every action | Custom session reading | `supabase.auth.getUser()` from `@supabase/ssr` | Handles cookie refresh, edge cases |
| TypeScript types for DB | Manually typed interfaces | `supabase gen types typescript` CLI | Auto-generated from schema — always in sync |
| Cover image fallback | Custom broken-image handler | Next.js `<Image>` with `onError` + placeholder | Next.js Image handles broken URLs natively |
| RLS "user sees only their own rows" | Manual WHERE user_id filter | Supabase RLS policy | DB-level enforcement; manual filters are defense-in-depth, not the primary guard |
| Open Library result caching | In-memory cache or Redis | `fetch(..., { next: { revalidate: 300 } })` | Built into Next.js fetch — zero setup |

**Key insight:** The Next.js + Supabase combination makes the custom middleware layer obsolete. Authentication, authorization, and row-level access control are handled at the framework and database layers respectively.

---

## Common Pitfalls

### Pitfall 1: Open Library `fields` Parameter (Breaking Change January 2025)
**What goes wrong:** Calling `/search.json` without `fields=` returns a restricted field set. `author_name` and `cover_i` may be absent, causing null reference errors and broken cover images.
**Why it happens:** Open Library deployed a performance optimization on January 21, 2025 that reduced the default fields returned.
**How to avoid:** Always include `fields=key,title,author_name,first_publish_year,cover_i` in every Open Library search request.
**Warning signs:** Search results have titles but no authors and no covers even though the books have them on the website.

### Pitfall 2: `@supabase/auth-helpers-nextjs` is Deprecated
**What goes wrong:** Using the old package causes SSR session handling bugs in Next.js 14 App Router — session available in Server Components but missing in Client Components or vice versa.
**Why it happens:** Supabase deprecated `@supabase/auth-helpers-nextjs` in mid-2025. The replacement is `@supabase/ssr`.
**How to avoid:** Use `@supabase/ssr` and follow the Supabase Next.js quickstart (2025 version). Create separate `createBrowserClient` and `createServerClient` helpers.
**Warning signs:** `supabase.auth.getUser()` returns null in Server Actions even though the user is logged in.

### Pitfall 3: RLS Without `user_id` Index
**What goes wrong:** Library pages load slowly as the user's library grows. A SELECT with `WHERE user_id = auth.uid()` requires a full table scan without an index.
**Why it happens:** Supabase doesn't automatically add indexes for RLS policies.
**How to avoid:** Add `create index on media_items (user_id)` in the migration. Add composite indexes for common queries: `(user_id, media_type)` and `(user_id, status)`.
**Warning signs:** Library page load times increase linearly with the number of total users.

### Pitfall 4: OMDB Poster URL "N/A" String
**What goes wrong:** OMDB returns the literal string `"N/A"` for poster_url when no poster exists. Passing `"N/A"` to `<Image src>` causes a broken image or Next.js error.
**Why it happens:** OMDB uses `"N/A"` as a null sentinel for all missing fields.
**How to avoid:** Map OMDB results before storing: `poster_url: data.Poster !== 'N/A' ? data.Poster : null`. Apply this to all OMDB fields (imdbRating, Year, Genre, Director, Plot).
**Warning signs:** Broken image placeholders on movie cards, or Next.js image optimization errors.

### Pitfall 5: Duplicate Detection Race Condition
**What goes wrong:** User rapidly taps "Add" on a result while the pre-check query is still in-flight. Two concurrent inserts succeed, creating a duplicate despite the warning.
**Why it happens:** Soft warning relies on a pre-check query, not a DB constraint.
**How to avoid:** Add a `unique (user_id, external_id)` constraint at the DB level (included in schema above). The Server Action insert will fail with a constraint violation, which is caught and surfaced as "Already in your library."
**Warning signs:** Duplicate items appearing in the library for power users who click quickly.

### Pitfall 6: Status Dropdown Popover Flickers on Hover Leave
**What goes wrong:** The card hover overlay disappears when moving the cursor from the card to the status dropdown popover.
**Why it happens:** The popover is a separate DOM element; cursor briefly leaves the card hitbox.
**How to avoid:** Use a CSS-only approach (`:hover` on a wrapper that includes both the card and the overlay) or use a Radix UI `Popover` / `DropdownMenu` which handles focus and hover trapping. Do not use pure CSS hover if the dropdown needs to extend outside the card bounds.
**Warning signs:** Users report the status dropdown "flashing" closed before they can select.

### Pitfall 7: `revalidatePath` Not Firing
**What goes wrong:** After a status update, the library page still shows the old status.
**Why it happens:** `revalidatePath` called inside a `try/catch` block doesn't execute when no error is thrown (control flow issue), or it's called before the mutation is confirmed.
**How to avoid:** Call `revalidatePath` after the error check block, never inside try/catch. Alternatively use `revalidateTag`.
**Warning signs:** Library UI shows stale data after card interactions.

---

## Code Examples

### Full OMDB Detail Fetch (for Add Dialog)
```typescript
// Source: OMDB API docs (https://www.omdbapi.com/)
// Called when user taps a search result to open the add dialog
export async function getOmdbDetails(imdbId: string) {
  'use server'
  const apiKey = process.env.OMDB_API_KEY
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=short`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  if (data.Response === 'False') throw new Error(data.Error)

  return {
    imdbId: data.imdbID,
    title: data.Title,
    year: data.Year !== 'N/A' ? data.Year : null,
    genre: data.Genre !== 'N/A' ? data.Genre : null,
    director: data.Director !== 'N/A' ? data.Director : null,
    plot: data.Plot !== 'N/A' ? data.Plot : null,
    posterUrl: data.Poster !== 'N/A' ? data.Poster : null,
    imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
  }
}
```

### Library Page Data Fetch (Server Component)
```typescript
// src/app/(app)/movies/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { status?: string; view?: 'grid' | 'list' }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const status = searchParams.status ?? 'watchlist'
  const { data: items } = await supabase
    .from('media_items')
    .select('*')
    .eq('media_type', 'movie')
    .eq('status', status)
    .order('date_added', { ascending: false })

  // items automatically scoped to user by RLS — no explicit user_id filter needed
  return <LibraryGrid items={items ?? []} view={searchParams.view ?? 'grid'} />
}
```

### Supabase Type Generation Command
```bash
# Run after every schema migration
npx supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_ID" \
  > src/types/supabase.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Mid-2025 | Server Component session reading works correctly in App Router |
| Open Library `/search.json` (all fields default) | `/search.json?fields=key,title,...` (explicit) | January 21, 2025 | Must specify fields or lose cover_i and author_name |
| `useFormState` (react-dom) | `useActionState` (react) | React 19 | In Next.js 14 still use `useFormState` from `react-dom` |
| `auth.uid()` in RLS (per-row eval) | `(select auth.uid())` in RLS | Supabase docs update 2024+ | 100x+ performance on large tables |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: deprecated mid-2025, replaced by `@supabase/ssr`
- Open Library `fields=*` workaround: use explicit field list instead (more performant)
- OMDB HTTP URL (`http://`): use `https://` — the API supports both but HTTPS is standard

---

## Open Questions

1. **`@supabase/ssr` exact version in Phase 2**
   - What we know: Phase 2 establishes the Supabase client pattern; Phase 3 extends it
   - What's unclear: Whether Phase 2 used `@supabase/ssr` or a different pattern — this affects import paths in Phase 3
   - Recommendation: When implementing Plan 03-01, confirm `@supabase/ssr` is already installed from Phase 2 before reinstalling

2. **OMDB rate limits**
   - What we know: OMDB free tier is 1,000 requests/day; paid tier is 100,000/day
   - What's unclear: The v3 project's OMDB tier — determines whether to add request-level caching
   - Recommendation: Add `next: { revalidate: 300 }` to all OMDB fetches regardless of tier (5-minute cache). Treat this as a constant in `lib/api/omdb.ts`

3. **V2 status name mapping**
   - What we know: v2 uses `watched/want_to_watch/watching` (movies), `read/want_to_read/reading` (books); v3 uses `watchlist/watching/completed/dropped` for all types
   - What's unclear: Whether Phase 7 migration mapping is a Phase 3 concern
   - Recommendation: Phase 3 defines the v3 status enum. Phase 7 handles the mapping. No action needed in Phase 3 beyond establishing the clean enum.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + React Testing Library (expected — to be confirmed in Wave 0) |
| Config file | `jest.config.ts` — Wave 0 gap if not present |
| Quick run command | `npm test -- --testPathPattern=library --passWithNoTests` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIB-01 | OMDB search returns results with imdbID | unit | `npm test -- --testPathPattern=omdb` | Wave 0 |
| LIB-02 | Open Library search returns results with key and cover_i | unit | `npm test -- --testPathPattern=open-library` | Wave 0 |
| LIB-03 | addMediaItem inserts row with correct user_id + status | integration | `npm test -- --testPathPattern=library.actions` | Wave 0 |
| LIB-04 | updateItemStatus changes status and revalidates | integration | same | Wave 0 |
| LIB-05 | updateItemStatus accepts rating 1-10, rejects 0 and 11 | unit | same | Wave 0 |
| LIB-06 | toggleFavorite flips is_favorite | integration | same | Wave 0 |
| LIB-07 | deleteItem removes row owned by user, rejects other user's row | integration | same | Wave 0 |
| LIB-08 | Duplicate detection returns existing status for known external_id | unit | `npm test -- --testPathPattern=duplicate` | Wave 0 |
| LIB-09 | LibraryGrid renders grid layout; ViewToggle switches to list | unit | `npm test -- --testPathPattern=LibraryGrid` | Wave 0 |
| LIB-10 | Library query filters by media_type and status | integration | `npm test -- --testPathPattern=library.actions` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=library --passWithNoTests`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/actions/library.test.ts` — covers LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-10
- [ ] `src/__tests__/api/omdb.test.ts` — covers LIB-01
- [ ] `src/__tests__/api/open-library.test.ts` — covers LIB-02
- [ ] `src/__tests__/lib/duplicate-detection.test.ts` — covers LIB-08
- [ ] `src/__tests__/components/LibraryGrid.test.tsx` — covers LIB-09
- [ ] `jest.config.ts` — if not established in Phase 1 or 2

---

## Sources

### Primary (HIGH confidence)
- [OMDB API official docs](https://www.omdbapi.com/) — search parameters, detail lookup, imdbID format, "N/A" sentinel behavior
- [Open Library Search API docs](https://openlibrary.org/dev/docs/api/search) — query parameters, fields parameter, response structure
- [Open Library Covers API docs](https://openlibrary.org/dev/docs/api/covers) — cover URL patterns for cover_i and OLID
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — CREATE POLICY syntax, `(select auth.uid())` performance pattern
- [Next.js 14 Server Actions docs](https://nextjs.org/docs/14/app/building-your-application/data-fetching/server-actions-and-mutations) — `'use server'`, useOptimistic, useFormStatus, revalidatePath patterns

### Secondary (MEDIUM confidence)
- [Open Library Blog: API search.json performance tuning](https://blog.openlibrary.org/2025/01/16/api-search-json-performance-tuning/) — January 2025 breaking change on default fields
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — index on user_id for 100x performance
- [Supabase deprecation: auth-helpers-nextjs replaced by @supabase/ssr](https://github.com/orgs/supabase/discussions/30739) — mid-2025 deprecation confirmed

### Tertiary (LOW confidence)
- General community patterns for single polymorphic table vs separate tables in Supabase — multiple sources agree; no single authoritative reference

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Supabase and Next.js docs; deprecation of auth-helpers confirmed via GitHub discussion
- Architecture: HIGH — RLS policy syntax and index patterns verified directly from Supabase docs
- OMDB API: HIGH — stable API verified from official docs; v2 code confirms "N/A" sentinel behavior
- Open Library API: HIGH — official docs + January 2025 breaking change confirmed from OL blog
- Pitfalls: HIGH — most verified from official documentation; hover popover pitfall is MEDIUM (community knowledge)
- Test framework: LOW — Next.js project not yet initialized; Jest assumption based on Next.js 14 standard; confirm in Wave 0

**Research date:** 2026-03-20
**Valid until:** 2026-06-20 (stable APIs; re-verify if Open Library or Supabase release major changes)
