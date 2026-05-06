# Phase 1: Foundation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the Next.js 14 + Supabase scaffold with the cinematic design system fully defined and the deployment pipeline in place. This phase is the visual and structural shell that every subsequent phase builds inside. No auth, no data — just the running app with the design language established.

</domain>

<decisions>
## Implementation Decisions

### Cinematic Aesthetic

- **Background treatment:** Dynamic poster backdrop — the currently watching/reading item's poster fills the background with subtle blur + strong gradient overlay at the bottom. Poster is loosely visible, gradient fades to solid dark below.
- **Fallback backdrop:** If no in-progress item exists, use a random item from the watchlist. If watchlist is also empty, fall back to a dark gradient only (no poster).
- **Backdrop transition:** Crossfade animation when switching between Movies/Books/Series sections (like Apple Music).
- **Color palette:** Cooler dark — midnight blue/silver tones. NOT the v2 crimson/gold. Dark base (#0a0a0f range).
- **Accent color:** Midnight blue/silver used for buttons, active nav highlights, and progress indicators.
- **Typography:** All sans-serif, varied weights (Inter or Geist). No serif. Weight contrast creates hierarchy.
- **Card style:** Frosted glass cards — backdrop blur behind each card, slight transparency, layered premium feel.
- **Card default state:** Poster image only — no text overlay at rest. Clean grid.
- **Card hover/tap:** Dark overlay appears with title, star rating, and quick-action buttons (favorite toggle, status change).
- **Progress indicator:** Thin progress bar at the bottom of cards for in-progress items (series episode progress).

### Navigation Structure

- **Desktop:** Icon-only sidebar (no expand on hover, always compact). Tooltips provide labels on hover.
- **Mobile:** Bottom tab bar.
- **Sidebar nav items (desktop):** Movies | Books | Series | Search | Analytics | Recommendations (icons only, background pill for active state).
- **Bottom nav items (mobile):** Movies | Books | Series | Search | Profile.
- **Active state:** Background pill/highlight on the active nav item.
- **Media type pages:** Each media type (/movies, /books, /series) is a separate top-level destination.
- **Status tabs within each section:** Watchlist | Watching | Completed | Dropped — tabs switch the full grid.
- **Default tab:** Watchlist (first tab, selected on load).
- **Search:** Dedicated search page accessed via nav icon — covers both API search and local library search.

### Home Screen

- **Landing page:** No separate home/dashboard. After login, user lands directly on /movies (Movies page).
- **Empty state:** Cinematic placeholder — beautiful dark background with a tagline and a prominent "Search" CTA button. No ghost cards.

### Claude's Discretion

- Exact blur CSS values (backdrop-filter intensity)
- Crossfade animation duration and easing
- Exact gradient stops for the bottom fade
- Frosted glass card border radius and opacity values
- Sidebar icon set (Lucide, Heroicons, or Radix Icons)
- Deployment platform (Vercel recommended for Next.js)
- Tailwind config color token naming convention
- shadcn/ui as component foundation (standard for Next.js + Tailwind)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above.

### Project context
- `.planning/PROJECT.md` — Core value, constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — UI-01 (cinematic immersive), UI-02 (responsive mobile)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

This is a full rewrite — no v2 code is reused in v3. The v2 codebase is Python/CustomTkinter; v3 is Next.js/React/TypeScript.

### Established Patterns (from v2, for reference only)

- v2 uses a dark luxury crimson/gold theme — v3 deliberately shifts to midnight blue/silver
- v2 has a left sidebar with nav links and a main content area — v3 keeps this pattern on desktop, adds bottom nav on mobile
- v2 displays media in grid cards with overlay favorite heart and star rating — v3 uses frosted glass cards with hover overlay
- v2 status tracking: Watchlist / Watching / Completed / Dropped — same statuses in v3

### Integration Points

- Supabase client initialized in Phase 1 (used by all subsequent phases for DB + Auth)
- Design system tokens (colors, spacing, blur values) defined in Phase 1, consumed by all subsequent phases
- Layout shell (sidebar + main content area) established in Phase 1, extended by all subsequent phases

</code_context>

<specifics>
## Specific Ideas

- "Apple TV aesthetic" — full-screen poster backdrops, heavy use of blur and gradient overlays, content feels like it floats on top of the imagery
- Frosted glass cards — think macOS Sonoma widgets or iOS blur panels
- Icon-only sidebar like Figma or VS Code's activity bar — minimal chrome, maximum content
- Netflix-style status tabs but without horizontal scroll rows — tabs switch a full grid instead
- Crossfade backdrop transition like Apple Music's album art background transitions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-20*
