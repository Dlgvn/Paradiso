---
status: partial
phase: 06-pwa-offline
source: [06-VERIFICATION.md]
started: 2026-05-07T00:00:00Z
updated: 2026-05-07T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Apply Supabase migration
expected: Run `supabase db push` — migration 002_media_items_updated_at.sql adds updated_at column to media_items with default now() and trigger
result: [pending]

### 2. Install prompt (Chrome/Edge)
expected: On first visit to app in Chrome/Edge desktop, install button appears in header. Clicking it triggers native browser install dialog. After install, app appears in OS app list.
result: [pending]

### 3. Offline app shell
expected: After installing or visiting app once in Chrome, disable network. Reload — app shell (layout, nav) loads without a network request. Network DevTools shows SW serving from cache.
result: [pending]

### 4. Navigation fallback (/~offline)
expected: With SW active and network disabled, navigate to an uncached route — app renders the /~offline fallback page with "You're offline" message.
result: [pending]

### 5. Offline writes to sync_queue
expected: Disable network in DevTools. Update a media item's status or rating. The change appears immediately in UI (optimistic Dexie write). Open IndexedDB DevTools — sync_queue table contains the pending write with operation type and payload.
result: [pending]

### 6. Sync on reconnect
expected: With pending sync_queue entries, re-enable network. Within seconds, toast notification "Library synced" appears. IndexedDB sync_queue empties. Supabase DB reflects the changes.
result: [pending]

### 7. iOS install + offline (requires iPhone/iPad)
expected: Open app in Safari iOS. Share → "Add to Home Screen". App installs with correct icon and name. Launch from home screen — shows standalone (no Safari UI). Airplane mode → app still loads library.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps
