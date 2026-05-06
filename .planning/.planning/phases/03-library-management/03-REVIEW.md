---
phase: 03-library-management
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - media-tracker-v3/src/app/(app)/layout.tsx
  - media-tracker-v3/src/app/(app)/movies/page.tsx
  - media-tracker-v3/src/app/(app)/search/page.tsx
  - media-tracker-v3/src/app/actions/library.ts
  - media-tracker-v3/src/app/actions/search.ts
  - media-tracker-v3/src/components/detail/ItemDetailSheet.tsx
  - media-tracker-v3/src/components/detail/RatingEditor.tsx
  - media-tracker-v3/src/components/detail/DeleteConfirmRow.tsx
  - media-tracker-v3/src/components/library/MediaCard.tsx
  - media-tracker-v3/src/components/library/MediaListItem.tsx
  - media-tracker-v3/src/components/library/LibraryGrid.tsx
  - media-tracker-v3/src/components/library/StatusFilter.tsx
  - media-tracker-v3/src/components/search/AddItemDialog.tsx
  - media-tracker-v3/src/components/search/DuplicateWarningDialog.tsx
  - media-tracker-v3/src/components/search/SearchPageClient.tsx
  - media-tracker-v3/src/components/search/SearchResultCard.tsx
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Reviewed 16 TypeScript/React files covering library management server actions, page components, and UI components. The server actions in `library.ts` are well-structured with Zod validation and proper auth checks on all write operations. The optimistic UI patterns are applied consistently across card components.

Four warnings and four info items were found. The most significant issues are: early UI closure before delete confirmation (DeleteConfirmRow), a silent swallowing of the duplicate-check item `id` in `addMediaItem`, a `useIsMobile` hook that evaluates at module render time and breaks SSR/hydration, and the search page pre-fetching only movies when the search UI supports all three media types.

---

## Warnings

### WR-01: Delete closes sheet before confirming success

**File:** `media-tracker-v3/src/components/detail/DeleteConfirmRow.tsx:43-44`
**Issue:** `onDeleted()` is called immediately at the start of the transition, before `deleteMediaItem` resolves. If the server action fails, the detail sheet is already closed and the user only sees a toast — the item is visually gone but still in the library. The optimistic-close is never rolled back.
**Fix:**
```tsx
onClick={() => {
  startTransition(async () => {
    const result = await deleteMediaItem(itemId)
    if (result?.error) {
      toast("Couldn't remove item. It may still be in your library.", { duration: 4000 })
    } else {
      onDeleted()
    }
  })
}}
```

### WR-02: `useIsMobile` reads `window.innerWidth` at render time — SSR/hydration mismatch

**File:** `media-tracker-v3/src/components/search/AddItemDialog.tsx:41-43`
**Issue:** The hook runs synchronously during the first render. On SSR `window` is undefined (returns `false`), but on the client the true value may differ, causing a hydration mismatch and React warning. Additionally, the value is never updated when the viewport resizes — the dialog type is fixed to whatever width was present at mount.
**Fix:**
```tsx
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}
```

### WR-03: Search page pre-fetches only movies, but library search tab shows all types

**File:** `media-tracker-v3/src/app/(app)/search/page.tsx:7-11`
**Issue:** `SearchPage` server component fetches only `media_type = 'movie'` rows and passes them as `initialLibraryItems`. The `LibrarySearchTab` inside `SearchPageClient` uses these as the starting dataset. Users who have books or series in their library will not see them in the "My Library" tab until the client re-fetches (if it does at all). If the client relies on `initialLibraryItems` without a supplemental fetch, books and series are silently missing.
**Fix:** Remove the media_type filter, or fetch all three types:
```ts
const { data: initialItems } = await supabase
  .from('media_items')
  .select('*')
  .order('date_added', { ascending: false })
```

### WR-04: `addMediaItem` duplicate path drops the existing item's `id`

**File:** `media-tracker-v3/src/app/actions/library.ts:114-116`
**Issue:** When the unique constraint fires, the code returns `{ error: 'DUPLICATE', existingStatus: null }`. `existingStatus` is always `null`, so callers cannot show the actual current status to the user. The `DuplicateWarningDialog` receives `existingStatus` as a prop and displays it — but here it will always be null, which would crash or show incorrect text if the calling code doesn't guard against it.

Looking at the flow: `checkDuplicate` (the pre-check path) correctly returns `status`, but the insert-path fallback (hitting the DB constraint) silently loses the status. The two paths return inconsistent shapes.
**Fix:** Query the existing row when the constraint fires:
```ts
if (insertError.message.includes('unique_user_item')) {
  const { data: existing } = await supabase
    .from('media_items')
    .select('status')
    .eq('external_id', externalId)
    .eq('user_id', user.id)
    .maybeSingle()
  return { error: 'DUPLICATE', existingStatus: (existing?.status ?? null) as MediaStatus | null }
}
```

---

## Info

### IN-01: Unused `mediaType` prop in `DeleteConfirmRow`

**File:** `media-tracker-v3/src/components/detail/DeleteConfirmRow.tsx:14`
**Issue:** The `mediaType` prop is declared in the interface and destructured in the signature, but is never used in the component body.
**Fix:** Remove the prop from the interface and call sites, or use it to construct a type-aware confirmation message.

### IN-02: Unused `mediaType` prop in `RatingEditor`

**File:** `media-tracker-v3/src/components/detail/RatingEditor.tsx:15`
**Issue:** `RatingEditor` accepts `mediaType: MediaType` in its props interface but the destructured signature omits it (`{ itemId, currentRating }`), making it silently unused.
**Fix:** Either remove the prop from the interface or destructure and use it (e.g., for a type-aware label).

### IN-03: `MediaListItem` shows incorrect fallback when `user_rating` is null

**File:** `media-tracker-v3/src/components/library/MediaListItem.tsx:108`
**Issue:** The else branch renders `{item.user_rating ?? '—'}/10`. Since this branch is only reached when `item.user_rating` is falsy, the `??` always evaluates to `'—'`, producing the string `—/10`. This looks like a debugging leftover — the stars branch above already handles the rated case.
**Fix:** Simplify to just `<span className="text-[11px] text-[#94a3b8]">—</span>` or `Not rated`.

### IN-04: Magic numbers for star rating scale conversion duplicated across components

**File:** `media-tracker-v3/src/components/library/MediaCard.tsx:86`, `media-tracker-v3/src/components/library/MediaListItem.tsx:63`
**Issue:** Both components independently compute `Math.round(item.user_rating / 2)` to convert a 1–10 rating to a 1–5 star display. This conversion is duplicated with no shared constant or utility function.
**Fix:** Extract to a shared utility, e.g. `ratingToStars(rating: number): number => Math.round(rating / 2)`, placed in a types or utils module.

---

_Reviewed: 2026-05-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
