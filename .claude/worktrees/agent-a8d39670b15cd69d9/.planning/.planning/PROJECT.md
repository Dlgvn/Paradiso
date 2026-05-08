# Media Tracker v3

## What This Is

A personal media tracking web app (movies, books, TV series) rebuilt as a Next.js PWA with Supabase cloud backend. v3 replaces the Python/CustomTkinter desktop app with a cinematic, immersive web experience that works offline and syncs across devices. It is strictly personal — no social features.

## Core Value

Your entire media library, beautifully presented, always available — on any device, online or offline.

## Requirements

### Validated

<!-- Carried forward from v2 — these exist and work today -->

- ✓ Track movies, books, and TV series with status (watchlist / watching / completed / dropped) — v2
- ✓ Star ratings (1–10) per item — v2
- ✓ Favorite marking on items — v2
- ✓ Grid and list view toggle — v2
- ✓ Detail view with metadata, genre tags, poster — v2
- ✓ API-powered search (OMDB for movies/series, Open Library for books) — v2
- ✓ Smart recommendations engine based on genre/rating history — v2
- ✓ Completion statistics dashboard — v2
- ✓ Dark luxury visual theme — v2

### Active

<!-- v3 goals — building toward these -->

- [ ] Next.js 14 web app with App Router, deployed as PWA
- [ ] Supabase backend: PostgreSQL database, Auth, Row-Level Security
- [ ] Email + password authentication via Supabase Auth
- [ ] Full offline support — browse and update library without internet, sync on reconnect
- [ ] Cinematic / immersive UI — full poster backgrounds, blur effects (Apple TV aesthetic)
- [ ] Local library full-text search (search your own collection, not just API)
- [ ] Duplicate detection when adding items (warn if title already in library)
- [ ] One-time v2 JSON import tool (migrate existing data from Python app)
- [ ] Server-side OMDB API key (backend handles all movie/series lookups)
- [ ] Analytics: completion charts by month, genre breakdown, rating distribution
- [ ] Genre breakdown visualization (pie/bar chart of taste profile)
- [ ] Rating pattern visualization
- [ ] Deprecate Python/CustomTkinter desktop app (v3 is the replacement)

### Out of Scope

- Social features (public profiles, followers, sharing) — personal tracker only
- Native mobile app (iOS/Android) — PWA covers mobile use case
- Per-user OMDB keys — server-side key simplifies UX
- Real-time collaborative features — single-user product
- Video playback or streaming integration — tracker only, not a player

## Context

**v2 state:** Python 3 + CustomTkinter desktop app, ~5600 lines across 6 files. Local JSON storage in `data/`. Works well but is desktop-only, has no cloud sync, and the 3200-line `gui_app.py` makes it hard to evolve.

**v3 direction:** Full rewrite as a web product. Keeps all v2 media-tracking logic but moves to a modern web stack: Next.js 14 (App Router, Server Actions, Server Components) + Supabase (PostgreSQL + Auth + RLS + Realtime). PWA service workers enable full offline use.

**Codebase map:** `.planning/codebase/` — 7 documents analyzing v2 architecture, conventions, tech debt, and concerns.

**Data migration:** v2 stores data in `data/movies.json`, `data/books.json`, `data/series.json`. v3 includes a one-time import tool to upload these to Supabase.

## Constraints

- **Tech stack**: Next.js 14+ (App Router), Supabase, TypeScript — no deviations
- **Offline**: Service workers must support full read/write offline, not read-only
- **Auth**: Email + password only via Supabase Auth (no OAuth in v1 of v3)
- **API**: Server-side OMDB key (never exposed to client), Open Library stays free/keyless
- **Design**: Cinematic/immersive — full poster imagery, backdrop blur, dark — not minimal/flat
- **Backward compat**: v2 desktop app is deprecated; no need to maintain parity

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over Firebase | PostgreSQL enables FTS and complex queries for library search | — Pending |
| Next.js App Router | Server Components + Server Actions eliminate separate API layer | — Pending |
| Full offline PWA | Users track media on phones/tablets without reliable connection | — Pending |
| Server-side OMDB key | Simpler UX — no user setup required | — Pending |
| Deprecate Python app | Web+PWA covers all use cases; two codebases = unsustainable | — Pending |

---
*Last updated: 2026-05-05
