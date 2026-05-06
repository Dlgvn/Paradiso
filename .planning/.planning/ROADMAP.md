# Roadmap: Media Tracker v3

## Overview

Seven phases take Media Tracker from a bare Next.js scaffold to a fully offline-capable PWA with cinematic UI, Supabase-backed authentication, complete library management, full-text collection search, analytics, recommendations, and a one-time v2 data migration tool. Each phase delivers a coherent, independently verifiable capability — nothing ships half-finished.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js 14 + Supabase scaffold with cinematic design system and deployment pipeline (completed 2026-03-21)
- [x] **Phase 2: Authentication** - Secure email/password auth with persistent sessions and password reset (completed 2026-03-21)
- [x] **Phase 3: Library Management** - Full add/edit/delete library with API search, filtering, grid/list views, and duplicate detection (completed 2026-05-05)
- [x] **Phase 4: Detail View + Library Search** - Cinematic item detail pages and real-time full-text search of the user's collection (completed 2026-05-05)
- [ ] **Phase 5: Analytics + Recommendations** - Completion charts, genre/rating visualizations, and genre-aware recommendations
- [ ] **Phase 6: PWA + Offline** - Installable PWA with full offline read/write and automatic sync on reconnect
- [ ] **Phase 7: Data Migration** - One-time v2 JSON import tool to bootstrap library from the Python desktop app

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js 14 app with the cinematic design system established, Supabase project connected, and a deployment pipeline in place — the shell every subsequent phase builds inside
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. App loads in a browser and renders the cinematic dark theme (poster-style backgrounds, backdrop blur, dark palette) on at least one route
  2. App is responsive and usable on a 375px mobile viewport
  3. Supabase project is connected — environment variables resolve and a test query returns without error
  4. A push to the main branch automatically deploys to the production URL
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 14 App Router project with TypeScript, Tailwind, Supabase client, and shadcn/ui
- [x] 01-02-PLAN.md — Cinematic design system: backdrop layer, responsive layout shell, status tabs, empty states
- [x] 01-03-PLAN.md — Vercel deployment pipeline with environment variables and visual verification

### Phase 2: Authentication
**Goal**: Users can securely create an account, log in, stay logged in across sessions, and recover a forgotten password
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password and land on an authenticated home screen
  2. User can log in and remain logged in after closing and reopening the browser tab
  3. User can log out from any page and be redirected to the login screen
  4. User can request a password reset and receive an email link that lets them set a new password
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Route group refactor, auth Server Actions, middleware route protection, OTP confirm handler
- [x] 02-02-PLAN.md — Auth UI: frosted glass AuthCard, login/signup/reset/update-password sub-views
- [x] 02-03-PLAN.md — Logout button in Sidebar and BottomNav, end-to-end auth flow verification

### Phase 3: Library Management
**Goal**: Users can build and manage their full media library — searching external APIs to find items, adding them with status and ratings, editing, deleting, filtering, and viewing in grid or list layout
**Depends on**: Phase 2
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-08, LIB-09, LIB-10
**Success Criteria** (what must be TRUE):
  1. User can search for a movie or series by title (OMDB, server-side key) and add it to their library with a status
  2. User can search for a book by title or author (Open Library) and add it to their library with a status
  3. User can update the status and rating (1-10) of any item, and mark/unmark it as a favorite
  4. User can delete an item from their library
  5. User can filter their library by media type and status, and toggle between grid and list views
  6. When adding an item that already exists in the library, the app warns the user before proceeding
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Database schema, domain types, and library CRUD Server Actions
- [x] 03-02-PLAN.md — OMDB and Open Library external API search integrations
- [x] 03-03-PLAN.md — Library UI: grid/list views, status filter tabs, card hover overlay, empty states
- [x] 03-04-PLAN.md — Search page with add-item flow, duplicate detection, result cards
- [x] 03-05-PLAN.md — Card interaction polish (optimistic updates, error toasts) and full verification

### Phase 4: Detail View + Library Search
**Goal**: Users can open a cinematic bottom-sheet detail view for any library item and search their own collection in real time
**Depends on**: Phase 3
**Requirements**: DETAIL-01, DETAIL-02, SRCH-01, SRCH-02
**Success Criteria** (what must be TRUE):
  1. User can open a detail view for any library item showing poster, synopsis, genre tags, and all metadata
  2. Detail view renders a cinematic backdrop — the item's poster image fills the background with a blur overlay
  3. User can type in a library search field and see results filtered in real time by title, author, director, or genre
**Plans**: 3 plans

Plans:
- [x] 04-00-PLAN.md — Wave 0: Jest + RTL setup and test stubs for Nyquist compliance
- [x] 04-01-PLAN.md — Bottom-sheet detail view with cinematic backdrop, genre pills, 10-star rating editor, inline delete
- [x] 04-02-PLAN.md — My Library search tab with client-side filtering, debounced input, MediaTypeSelector

### Phase 5: Analytics + Recommendations
**Goal**: Users can see their media consumption patterns through charts and receive recommendations based on their taste
**Depends on**: Phase 3
**Requirements**: ANALYTICS-01, ANALYTICS-02, ANALYTICS-03, REC-01, REC-02
**Success Criteria** (what must be TRUE):
  1. User can view a chart of items marked completed, grouped by month
  2. User can view a genre breakdown visualization showing the composition of their library
  3. User can view a rating distribution chart across their entire library
  4. User can see recommended items they have not yet added, with a visible reason ("Because you rated X highly")
**Plans**: TBD

Plans:
- [ ] 05-01: Analytics dashboard — completion-by-month chart, genre breakdown, rating distribution
- [ ] 05-02: Recommendations engine — genre/rating-weighted suggestion logic, reason generation, UI display

### Phase 6: PWA + Offline
**Goal**: The app is installable as a PWA and supports full offline read/write — users can browse, update status, and rate items without internet, and all changes sync automatically when connection is restored
**Depends on**: Phase 3
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. User can install the app to their home screen on both mobile (iOS/Android) and desktop
  2. User can navigate their library with no internet connection
  3. User can update an item's status or rating while offline and see the change reflected immediately in the UI
  4. When internet is restored, all offline changes sync to Supabase without user intervention and without data loss
**Plans**: TBD

Plans:
- [ ] 06-01: Service worker setup — PWA manifest, install prompt, asset caching strategy
- [ ] 06-02: IndexedDB offline store — local read/write layer, sync queue implementation
- [ ] 06-03: Sync engine — conflict resolution, background sync on reconnect, UI sync status indicator

### Phase 7: Data Migration
**Goal**: Users can import their existing v2 library (movies.json, books.json, series.json from the Python desktop app) into v3 in a single operation
**Depends on**: Phase 3
**Requirements**: MIG-01
**Success Criteria** (what must be TRUE):
  1. User can upload their three v2 JSON files and see them parsed into a preview before importing
  2. After confirming, all v2 items appear in the v3 library with correct status, rating, and favorite fields intact
  3. Import reports how many items were added, skipped (duplicates), and if any errors occurred
**Plans**: TBD

Plans:
- [ ] 07-01: Migration tool — JSON parser, field mapping (v2 schema → v3 schema), preview UI, Supabase bulk insert, import result summary

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-21 |
| 2. Authentication | 3/3 | Complete | 2026-03-21 |
| 3. Library Management | 5/5 | Complete | 2026-05-05 |
| 4. Detail View + Library Search | 3/3 | Complete | 2026-05-05 |
| 5. Analytics + Recommendations | 0/2 | Not started | - |
| 6. PWA + Offline | 0/3 | Not started | - |
| 7. Data Migration | 0/1 | Not started | - |
