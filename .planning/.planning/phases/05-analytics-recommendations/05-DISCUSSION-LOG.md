# Phase 5: Analytics + Recommendations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 05-analytics-recommendations
**Areas discussed:** Chart library, Analytics page location, Recommendations source, Recommendations display, Analytics data scope

---

## Chart Library

| Option | Description | Selected |
|--------|-------------|----------|
| Recharts | React-native, composable, good dark theme support. ~180KB. | |
| Chart.js + react-chartjs-2 | Battle-tested, canvas-based, more chart types. | |
| Tremor | Tailwind-first dashboard components, quickest to set up. | |
| You decide | Claude picks best fit for cinematic dark theme and existing stack. | ✓ |

**User's choice:** Claude's discretion
**Notes:** User deferred to Claude on library selection.

---

## Analytics Page Location

| Option | Description | Selected |
|--------|-------------|----------|
| New /stats route | Dedicated page in sidebar nav — clean separation. | ✓ |
| Tab on home/library page | Stats tab alongside media type tabs. | |
| Bottom sheet / modal | Accessible from a button, not a full page. | |

**User's choice:** New /stats route
**Notes:** Accepted recommended option without modification.

---

## Recommendations Source

| Option | Description | Selected |
|--------|-------------|----------|
| OMDB/Open Library query | Query real titles by top genres, filter against user library. | ✓ |
| Curated seed list | Hardcoded popular titles per genre, fast but limited. | |
| Pure library analysis only | No external candidates, just genre insight cards. | |

**User's choice:** OMDB/Open Library query
**Notes:** Accepted recommended option — real title recommendations with API calls.

---

## Recommendations Display

| Option | Description | Selected |
|--------|-------------|----------|
| Section below charts | Scrollable row below analytics on /stats page. | ✓ |
| Separate /recommendations route | Dedicated page, linked from stats or nav. | |
| Inline with genre breakdown | Recommendations next to the genre chart. | |

**User's choice:** Section below charts

| Option | Description | Selected |
|--------|-------------|----------|
| 3–5 cards | Focused, curated feel. Fast load. | ✓ |
| 8–10 cards | More discovery surface. | |
| Infinite / load more | Paginated with Load More. | |

**User's choice:** 3–5 cards
**Notes:** Accepted both recommended options.

---

## Analytics Data Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Global + per-type toggle | Default all types combined, toggle to filter by type. | ✓ |
| Always global | Simpler, no toggle, all types mixed. | |
| Always per-type | Three sets of charts, one per media type. | |

**User's choice:** Global + per-type toggle
**Notes:** Accepted recommended option.

---

## Claude's Discretion

- Chart library selection (Recharts recommended)
- Chart color palette within cinematic dark theme
- Recommendation card visual design
- Media-type toggle implementation approach
- Recommendation API call caching strategy
- Empty states for charts with no data

## Deferred Ideas

None — discussion stayed within phase scope.
