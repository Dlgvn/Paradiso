# Requirements: Media Tracker v3

**Defined:** 2026-03-20
**Core Value:** Your entire media library, beautifully presented, always available — on any device, online or offline.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can create an account with email and password
- [x] **AUTH-02**: User can log in with email and password and stay logged in across sessions
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: User can reset password via email link

### Library Management

- [x] **LIB-01**: User can search for movies/series via OMDB (server-side key, no user setup)
- [x] **LIB-02**: User can search for books via Open Library
- [x] **LIB-03**: User can add a movie/book/series to their library with a status (watchlist / watching / completed / dropped)
- [x] **LIB-04**: User can update the status of any item in their library
- [x] **LIB-05**: User can set a rating (1–10) on any item
- [x] **LIB-06**: User can mark / unmark items as favorites
- [x] **LIB-07**: User can delete an item from their library
- [x] **LIB-08**: System warns user when adding an item that already exists in their library (duplicate detection)
- [x] **LIB-09**: User can view their library in grid view or list view
- [x] **LIB-10**: User can filter library by media type (movies / books / series) and status

### Local Library Search

- [ ] **SRCH-01**: User can search their own local library by title, author, director, or genre
- [ ] **SRCH-02**: Search results update in real-time as user types

### Detail View

- [ ] **DETAIL-01**: User can open a detail view for any item showing poster, metadata, genre tags, synopsis
- [ ] **DETAIL-02**: Detail view shows cinematic backdrop (poster-based blurred background)

### Analytics

- [ ] **ANALYTICS-01**: User can view completion count by month (chart)
- [ ] **ANALYTICS-02**: User can view genre breakdown of their library (pie/bar chart)
- [ ] **ANALYTICS-03**: User can view rating distribution across their library

### Recommendations

- [ ] **REC-01**: System recommends unwatched/unread items based on genre and rating history
- [ ] **REC-02**: Recommendation shows reason ("Because you rated X highly")

### PWA & Offline

- [ ] **PWA-01**: App is installable as a PWA on mobile and desktop
- [ ] **PWA-02**: User can browse their library while offline
- [ ] **PWA-03**: User can update item status and ratings while offline
- [ ] **PWA-04**: Changes made offline sync automatically when connection is restored

### Data Migration

- [ ] **MIG-01**: User can upload v2 JSON files (movies.json, books.json, series.json) to import existing library

### UI / Design

- [x] **UI-01**: Cinematic immersive design — full poster backgrounds with backdrop blur (Apple TV aesthetic)
- [x] **UI-02**: App is responsive and usable on mobile screen sizes

## v2 Requirements

### Social (deferred)

- **SOC-01**: User can share a watchlist via public link
- **SOC-02**: User can follow other users and see their activity

### Enhanced Auth (deferred)

- **AUTH-05**: User can log in with Google or GitHub OAuth

### Advanced Analytics (deferred)

- **ANALYTICS-04**: Yearly wrapped — year in media summary

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native iOS / Android app | PWA covers mobile use case |
| Per-user OMDB API keys | Server-side key simplifies onboarding |
| Social features (public profiles, followers) | Personal tracker, not a social network |
| Video playback / streaming integration | Tracker only |
| Real-time collaborative libraries | Single-user product |
| Python/CustomTkinter desktop app | Deprecated by v3 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 — Foundation | Complete |
| UI-02 | Phase 1 — Foundation | Complete |
| AUTH-01 | Phase 2 — Authentication | Complete |
| AUTH-02 | Phase 2 — Authentication | Complete |
| AUTH-03 | Phase 2 — Authentication | Complete |
| AUTH-04 | Phase 2 — Authentication | Complete |
| LIB-01 | Phase 3 — Library Management | Complete |
| LIB-02 | Phase 3 — Library Management | Complete |
| LIB-03 | Phase 3 — Library Management | Complete |
| LIB-04 | Phase 3 — Library Management | Complete |
| LIB-05 | Phase 3 — Library Management | Complete |
| LIB-06 | Phase 3 — Library Management | Complete |
| LIB-07 | Phase 3 — Library Management | Complete |
| LIB-08 | Phase 3 — Library Management | Complete |
| LIB-09 | Phase 3 — Library Management | Complete |
| LIB-10 | Phase 3 — Library Management | Complete |
| DETAIL-01 | Phase 4 — Detail View + Library Search | Pending |
| DETAIL-02 | Phase 4 — Detail View + Library Search | Pending |
| SRCH-01 | Phase 4 — Detail View + Library Search | Pending |
| SRCH-02 | Phase 4 — Detail View + Library Search | Pending |
| ANALYTICS-01 | Phase 5 — Analytics + Recommendations | Pending |
| ANALYTICS-02 | Phase 5 — Analytics + Recommendations | Pending |
| ANALYTICS-03 | Phase 5 — Analytics + Recommendations | Pending |
| REC-01 | Phase 5 — Analytics + Recommendations | Pending |
| REC-02 | Phase 5 — Analytics + Recommendations | Pending |
| PWA-01 | Phase 6 — PWA + Offline | Pending |
| PWA-02 | Phase 6 — PWA + Offline | Pending |
| PWA-03 | Phase 6 — PWA + Offline | Pending |
| PWA-04 | Phase 6 — PWA + Offline | Pending |
| MIG-01 | Phase 7 — Data Migration | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 — traceability updated after roadmap creation (30 requirements across 7 phases)*
