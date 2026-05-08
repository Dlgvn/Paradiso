# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Monolithic GUI Application:**
- Issue: `gui_app.py` is 3,233 lines (57.7% of total codebase) in a single file, making maintenance and testing difficult
- Files: `gui_app.py`
- Impact: Hard to locate functionality, difficult to unit test, increased cognitive load for developers, difficult to refactor UI components independently
- Fix approach: Break GUI into separate modules (windows, dialogs, components) and organize by feature. Extract reusable UI patterns into separate files.

**Bare Exception Handling:**
- Issue: Multiple bare `except Exception:` blocks that swallow all errors without logging details
- Files: `gui_app.py` (lines 103, 549, 2829, 3139), `database.py` (lines 876, 888)
- Impact: Makes debugging difficult when errors occur silently. Hides programming errors and API failures equally
- Fix approach: Replace with specific exception types (e.g., `except (URLError, TimeoutError)`, `except json.JSONDecodeError`). Add proper logging instead of silent failures.

**Silent Error in Image Loading:**
- Issue: ImageLoader exception handling (line 103-104 in gui_app.py) silently catches all errors without logging or user notification
- Files: `gui_app.py` lines 103-104
- Impact: Users don't know when poster images fail to load. Can't diagnose network/file issues
- Fix approach: Log failed URLs with reason. Consider showing placeholder image with error indicator

**Missing Logging Infrastructure:**
- Issue: No logging module configured; errors printed to stdout or silently swallowed
- Files: All modules
- Impact: No audit trail for debugging production issues, lost error context after app restart
- Fix approach: Implement `logging` module with file-based logs. Configure separate loggers for UI, database, API calls

## Known Bugs

**Cursor Configuration Silent Failure (line 548-549):**
- Symptoms: Some widgets may not show hand cursor on hover if their `configure()` method fails
- Files: `gui_app.py` lines 548-549 (MediaCard._bind_events_recursive)
- Trigger: Any widget type that doesn't support `cursor` parameter
- Workaround: Currently caught and ignored. Cursor may not display but interaction still works
- Root cause: Tk/CustomTkinter cursor support varies by widget type

**Race Condition in ImageLoader Cache (line 82-85):**
- Symptoms: Multiple simultaneous requests for same image could bypass cache, causing duplicate loads
- Files: `gui_app.py` lines 82-85 (ImageLoader._cache check)
- Trigger: Rapid navigation between cards showing same image before thread completes
- Root cause: No locking mechanism on shared `_cache` dictionary accessed from daemon threads
- Risk: Memory spike from duplicate image processing, performance degradation

**ISO Date Format Fragility (models.py lines 64-65, 102-103):**
- Symptoms: ISO date parsing fails if timezone info format changes slightly
- Files: `models.py` (Movie.from_db_row, Book.from_db_row lines 64-65, 102-103)
- Trigger: Any database record with unexpected datetime format (e.g., "2026-03-20T10:00:00Z" vs "2026-03-20T10:00:00+00:00")
- Current mitigation: `.replace("Z", "+00:00")` handles Z suffix, but no validation
- Risk: Application crash if database contains malformed dates

## Security Considerations

**Hardcoded API Key Dependency (movie_api.py line 18-26):**
- Risk: OMDB API key required but only loaded from environment variable; no fallback protection
- Files: `movie_api.py` lines 18-26, `gui_app.py` lines 2834-2838
- Current mitigation: API gracefully fails if missing (lines 2837 sets `self.movie_api = None`), allowing app to run without movie search
- Recommendations: Document the optional nature of OMDB_API_KEY. Consider storing encrypted config file as fallback. Add warning dialog explaining feature limitations.

**Unvalidated User File Imports (database.py lines 755-842):**
- Risk: Import functionality accepts arbitrary JSON structure without schema validation
- Files: `database.py` lines 755-842 (Database.import_from_file)
- Current mitigation: Field-level assignment uses `.get()` with defaults
- Recommendations: Add strict schema validation before import. Validate required fields (id, title, status). Reject unknown fields. Log import warnings for skipped records.

**No Input Validation for User Ratings:**
- Risk: User can potentially enter rating values outside 1-10 range through database corruption or API bypass
- Files: `database.py` (update methods), `gui_app.py` (dialog inputs)
- Current mitigation: UI spinboxes constrain to 1-10, but no database-level validation
- Recommendations: Add model-level validation in `Movie`, `Book`, `Series` dataclasses. Validate on save to database.

**Network Request Timeouts:**
- Risk: Timeout of 10 seconds is hardcoded; network-constrained environments may see frequent failures
- Files: `gui_app.py` (line 89), `movie_api.py` (lines 39, 60, 103, 121), `book_api.py` (lines 26, 59)
- Current mitigation: Timeout is present and reasonable
- Recommendations: Make timeout configurable via environment variable. Log timeout events. Consider exponential backoff retry for transient failures.

## Performance Bottlenecks

**Full Data Load on Every Refresh (database.py):**
- Problem: `refresh_content()` loads entire JSON files from disk even when filtering subset of data
- Files: `gui_app.py` (lines 2866-2902), `database.py` (all _load methods)
- Cause: No caching of loaded data between operations. Each operation (filter by status, get all) reloads files
- Impact: O(n) disk I/O for every view change, stats calculation, recommendation
- Improvement path: Implement in-memory cache of loaded data. Invalidate only when data changes (add/update/delete). Consider lazy loading with pagination for large libraries

**ImageLoader Cache No Eviction Policy (gui_app.py lines 67, 82-85):**
- Problem: Poster images cached indefinitely in memory without size limit
- Files: `gui_app.py` lines 64-128 (ImageLoader class)
- Cause: Class-level `_cache` dict grows unbounded
- Impact: Memory leak if user adds hundreds of items. Long-running app could consume significant memory
- Current: Testing data shows 126KB movies.json (likely < 100 items), but could grow to multiple GB
- Improvement path: Implement LRU cache with configurable size limit (e.g., max 50 images). Track memory usage and implement eviction

**Statistics Calculation Loops (database.py lines 845-918):**
- Problem: Completion and rating distribution statistics loop through all items for each month/rating
- Files: `database.py` lines 845-918 (get_completion_by_month, get_rating_distribution)
- Cause: No indexing by date or rating
- Impact: O(n*m) where n=items, m=months (12). Stats generation blocks UI
- Current capacity: ~200 items, acceptable. Breaks at ~5000+ items
- Improvement path: Build indices on date_completed and user_rating fields. Consider async stats calculation in background thread

**Recommendation Engine Loops (recommender.py):**
- Problem: Smart recommendations loop through all unwatched items to score each one
- Files: `recommender.py` lines 75-114 (get_smart_movie_recommendation)
- Cause: Linear scan required for scoring algorithm
- Impact: O(n) where n=unwatched items. Noticeable pause at 1000+ items
- Improvement path: Cache genre_scores between calls. Consider batch scoring with NumPy if scale increases

## Fragile Areas

**DateTime Handling Across All Models:**
- Files: `models.py` (Movie, Book, Series.from_db_row), `database.py` (add_/update_ methods)
- Why fragile: Multiple DateTime formats (ISO string in JSON, Python datetime objects, timezone info handling)
- Safe modification: Add centralized datetime conversion functions in a utils module. Create test cases for all datetime formats. Validate all date inputs
- Test coverage: No unit tests for datetime serialization/deserialization. Missing tests for timezone edge cases (DST transitions, UTC consistency)

**Media Status Enum Conversions:**
- Files: `models.py` (MovieStatus, BookStatus, SeriesStatus enums), `database.py` (all update methods)
- Why fragile: String-to-enum conversions assume exact `.value` matches in database. Invalid status in JSON crashes app
- Safe modification: Add try-catch in `from_db_row` methods with fallback to default status. Validate status values on save
- Test coverage: No validation of enum values from untrusted sources (imports, manual JSON edits)

**Search History Persistence:**
- Files: `database.py` lines 89-100 (search history load/save)
- Why fragile: Search history is separate JSON file not integrated with main data structure. Can grow indefinitely
- Safe modification: Implement max history size (e.g., last 100 searches). Add data cleanup utility
- Test coverage: No tests for malformed search history file. Silent failure if JSON corrupts

**MainContent Widget State Management:**
- Files: `gui_app.py` (MainContent class, large view switching logic)
- Why fragile: Multiple nested frames and labels created/destroyed on view changes. No cleanup of previous widgets
- Safe modification: Implement widget pool pattern. Clear all children before redrawing. Add assertions for widget cleanup
- Test coverage: Can't unit test without running full GUI. Manual testing only

## Scaling Limits

**JSON File Database:**
- Current capacity: ~200 items across all types
- Limit: ~10,000 items before filesystem I/O becomes noticeably slow
- Beyond limit: Loading 10K+ items into memory on every operation becomes prohibitive
- Scaling path: Switch to SQLite for items count > 5000. Implement lazy loading with pagination. Add database migration utility

**In-Memory Image Cache:**
- Current: Holds ~20-50 poster images typical
- Limit: ~500 images before noticeable memory spike
- Beyond: Memory usage > 500MB possible with 1000+ items
- Scaling path: Implement disk-based cache for image thumbnails. Use LRU eviction policy

**UI Rendering Performance:**
- Current: Grid/list views show ~50 items acceptable
- Limit: ~200 items before scrolling becomes noticeably laggy
- Beyond: 1000+ items causes frame drops
- Scaling path: Implement virtual scrolling / lazy rendering. Only render visible cards in viewport

## Dependencies at Risk

**CustomTkinter Development Status:**
- Risk: CustomTkinter is actively developed but not as mature as tkinter. Breaking changes possible in minor versions
- Package: `customtkinter` (used for all UI)
- Impact: Major version bump could break layout/styling across entire app
- Current mitigation: No version pinning in requirements (if exists)
- Migration plan: Pin to current known-good version. Monitor changelog. Plan testing time for minor version upgrades. Consider tkinter fallback if needed

**OMDB API Optional but Critical:**
- Risk: OMDB API is free tier with limits (1000 requests/day). Rate limiting not implemented
- Package: `requests` library via `movie_api.py`
- Impact: Users hitting rate limit lose search functionality. No queuing or backoff
- Current mitigation: API failure shows error dialog but doesn't block app
- Migration plan: Implement request rate limiting (max 10 req/min). Add search caching. Consider fallback to TMDB API. Implement queue for search requests

**Open Library API:**
- Risk: API is public but slow, occasional outages. No SLA
- Package: `requests` library via `book_api.py`
- Impact: Book search hangs for 10s if API down. No retry logic
- Current mitigation: 10s timeout, basic error handling
- Migration plan: Add exponential backoff retry (3 attempts). Implement search result caching. Consider Google Books API as fallback

**Pillow Version Compatibility:**
- Risk: PIL.Image resampling methods changed between versions
- Package: `pillow`
- Impact: Poster resizing could fail silently on old PIL versions
- Current: Uses `Image.Resampling.LANCZOS` (Pillow 9.1+)
- Migration plan: Add PIL version check at startup. Fallback to `Image.LANCZOS` if older version detected

## Missing Critical Features

**No Data Backup:**
- Problem: JSON database has no backup mechanism. Single file corruption = data loss
- Blocks: Users can't recover from accidental deletions or file corruption
- Recommendation: Implement automatic daily backups to data/backups/ directory. Implement restore-from-backup feature. Add data validation on startup

**No Data Validation on Load:**
- Problem: Corrupted JSON file crashes app with cryptic error
- Blocks: Users can't recover from manual JSON editing mistakes or file corruption
- Recommendation: Add data integrity checks on startup. Log errors and allow continue with partial data

**No Undo/Redo:**
- Problem: User deletions are permanent. No transaction support
- Blocks: Users can't undo accidental status changes or deletes
- Recommendation: Implement command pattern for undo/redo. Store operation history. Limit to last 20 operations

**No Duplicate Detection:**
- Problem: User can add same movie/book multiple times (different IMDB/OLID)
- Blocks: Can't prevent library bloat
- Recommendation: Add duplicate detection when adding items. Suggest merge/deduplicate on search results

**No Full-Text Search:**
- Problem: Search only works against API search endpoints, not local library
- Blocks: Can't search local collection efficiently
- Recommendation: Implement local full-text search via SQLite FTS or similar when scaling to database

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All models, database operations, API integration, recommendation engine logic
- Files: `models.py`, `database.py`, `movie_api.py`, `book_api.py`, `recommender.py`
- Risk: Refactoring any module could introduce subtle bugs. No regression detection
- Priority: High - Core business logic untested

**No Integration Tests:**
- What's not tested: API → Database flow, search → add flow, stats calculations
- Files: All files
- Risk: Changes to API response handling could break downstream. Database import/export untested
- Priority: High - User workflows untested

**No UI/End-to-End Tests:**
- What's not tested: GUI workflows, navigation, dialog interactions, event handlers
- Files: `gui_app.py`
- Risk: UI bugs found only through manual testing. Styling changes can break layout unexpectedly
- Priority: Medium - Requires GUI testing framework (pytest-qt or similar)

**No DateTime Edge Cases:**
- What's not tested: Timezone handling, DST transitions, date parsing from malformed JSON
- Files: `models.py`, `database.py` datetime methods
- Risk: Users in different timezones could see wrong dates. Date calculations could be off by hours
- Priority: High - Data integrity issue

**No Error Path Testing:**
- What's not tested: Network timeouts, API rate limiting, malformed JSON imports, missing/invalid files
- Files: All modules
- Risk: Error handling untested. Exception handlers might fail or silently swallow errors
- Priority: High - Critical for reliability

**No Performance Tests:**
- What's not tested: Loading times with large datasets (1000+ items), memory usage growth, UI responsiveness
- Files: All files
- Risk: Performance regressions discovered in production. Scaling limits unknown
- Priority: Medium - Important before scaling

---

*Concerns audit: 2026-03-20*
