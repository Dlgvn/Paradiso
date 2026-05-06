# Phase 6: PWA + Offline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 06-pwa-offline
**Areas discussed:** Service Worker Library, Conflict Resolution, Sync Status UX, Cache Scope

---

## Service Worker Library

| Option | Description | Selected |
|--------|-------------|----------|
| Serwist | App Router-native next-pwa fork, Workbox underneath, actively maintained | |
| next-pwa | Most widely used, battle-tested, less maintained for App Router | |
| Custom Workbox | Full control, no abstraction, more boilerplate | |
| Claude's discretion | Claude picks best fit during research | ✓ |

**User's choice:** Claude's discretion
**Notes:** User comfortable letting Claude pick; Serwist noted as recommended default.

---

## Conflict Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Last-write-wins (timestamps) | Latest timestamp wins on sync, simple, no user intervention | ✓ |
| Client always wins | Offline changes always overwrite server state | |
| Server always wins | Server state takes precedence, offline changes discarded if server is newer | |
| Show conflict UI | Flag conflicts, let user pick | |

**User's choice:** Last-write-wins
**Notes:** Personal single-user tracker — edge cases are rare, simplicity preferred.

---

## Sync Status UX

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle corner indicator | Small badge/dot in navbar, not intrusive | |
| Inline item badges | Per-card "pending" indicator on unsynced items | |
| Toast notifications | Pop-up on offline/sync events | |
| Combination | Subtle nav indicator while offline + toast on sync completion | ✓ |

**User's choice:** Combination
**Notes:** Subtle offline indicator in nav, toast when sync completes after reconnect.

---

## Cache Scope

| Option | Description | Selected |
|--------|-------------|----------|
| App shell only | Cache JS/CSS/routes; library data via IndexedDB only | |
| App shell + library data | Pre-cache routes and library data to IndexedDB | |
| App shell + library data + posters | Full cache including poster images | ✓ |
| App shell + library data, posters on-demand | Cache posters only as viewed, up to storage limit | |

**User's choice:** Full cache — app shell + library data + poster images
**Notes:** Accepts storage tradeoff for full offline fidelity.

---

## Claude's Discretion

- Service worker library (Serwist recommended)
- IndexedDB abstraction layer
- Storage quota handling for large poster caches
- Background sync vs. online event listener
- Offline indicator visual design
- Sync toast copy

## Deferred Ideas

None.
