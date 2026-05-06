# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Runner:**
- No test framework detected
- No pytest.ini, setup.py, pyproject.toml, or tox.ini found
- No test files (*.test.py, *.spec.py) in codebase

**Assertion Library:**
- Not applicable - no automated tests present

**Run Commands:**
- No test commands configured
- Manual testing only via GUI application

## Test File Organization

**Location:**
- No test directory structure present
- No co-located test files alongside source code
- Test coverage: 0% (no automated tests)

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Manual Testing Approach

**Current Strategy:**
- Application tested through GUI interaction (`gui_app.py`)
- Command-line interface available in `media_tracker.py` for manual testing
- Two entry points: `python gui_app.py` (GUI) or `python media_tracker.py` (CLI)

**GUI Testing Points:**
- Search functionality tested through `AddMediaDialog` class (lines 692-848)
- CRUD operations through main app UI: add movies/books/series, update status, delete, toggle favorite
- View modes: grid vs. list toggle via `_set_view_mode()` method
- Export functionality through `ExportDialog` (lines 2331-2467)
- Detail views via `MediaDetailDialog` (lines 848-1190) and `SeriesDetailDialog` (lines 2468-2814)

**CLI Testing Points:**
- Command-line interface in `media_tracker.py` (lines 87-708)
- Interactive prompts for all CRUD operations
- Status management: watch status, reading status, ratings
- Search and recommendation features

## Error Handling Test Scenarios

**API Errors:**
- OMDB connection failures: caught as `OMDBError` with user message in GUI
- Open Library connection failures: caught as `OpenLibraryError` with user message in GUI
- Missing API keys: handled with specific error message: `"OMDB API key not configured.\nSet OMDB_API_KEY environment variable."`
- Search results not found: handled gracefully returning empty list

**Database Errors:**
- JSON parse failures: caught in `_load_*` methods returning empty list or empty dict
- File I/O errors: handled with try/except wrapping file operations
- Missing data directory: automatically created on initialization

**UI Scenarios:**
- Duplicate entries: checked before adding with user message: `"'{title}' is already in your library"`
- Missing images: silent failure with fallback emoji icon
- Optional dependencies: matplotlib wrapped in try/except with `MATPLOTLIB_AVAILABLE` flag

## Data Models & Factory Pattern

**Factory Pattern Example (movie_api.py lines 72-95):**
```python
def create_movie_from_api(
    self, imdb_id: str, status: MovieStatus = MovieStatus.WANT_TO_WATCH
) -> Movie:
    """Fetch movie details and create a Movie object."""
    data = self.get_details(imdb_id)

    poster_url = data.get("Poster")
    if poster_url == "N/A":
        poster_url = None

    return Movie(
        id=None,
        imdb_id=data["imdbID"],
        title=data["Title"],
        year=data.get("Year"),
        # ... more fields
        status=status,
    )
```

**From-DB Pattern (models.py lines 47-68):**
```python
@classmethod
def from_db_row(cls, row: dict) -> "Movie":
    """Create a Movie instance from a database row."""
    date_added = row.get("date_added")
    date_completed = row.get("date_completed")
    return cls(
        id=row.get("id"),
        imdb_id=row["imdb_id"],
        # ... fields with None defaults for safety
        is_favorite=row.get("is_favorite", False),
        notes=row.get("notes"),
    )
```

**Type Safety:**
- Dataclass field validation through type hints: `Optional[datetime]`, `Optional[str]`, `int`
- Optional datetime handling with ISO format conversion and Z-character replacement (lines 64-65 in models.py)

## Async & Concurrency Testing

**Threading Pattern (gui_app.py lines 70-106):**
- ImageLoader uses background threads for network operations:
  ```python
  def load_async(cls, url: str, callback: Callable, size: tuple, add_gradient: bool):
      # ... validation ...
      def _load():
          try:
              with urlopen(url, timeout=10) as response:
                  image_data = response.read()
              # ... process image ...
              callback(ctk_image)
          except Exception:
              callback(None)

      threading.Thread(target=_load, daemon=True).start()
  ```

**Callback Pattern:**
- Async completion notified via callback functions
- Error handling in async context: silent failure (callback(None))
- Timeout specified: 10 seconds for all network requests

**Testing Implications:**
- No race condition testing
- Callback-based design makes unit testing difficult without mocking threading
- Daemon threads may be reaped without cleanup on app exit

## Database Operation Testing

**Manual Test Scenarios for database.py:**

**Add Operations:**
- `add_movie(movie)` → integer ID returned
- Duplicate IMDB IDs rejected: `get_movie_by_imdb_id()` checked before add
- New ID auto-generated: `_get_next_id()` increments from existing list

**Read Operations:**
- `get_movie_by_id(id)` → Movie or None
- `get_all_movies()` → List[Movie]
- `get_movies_by_status(status)` → List[Movie]
- `get_movie_by_imdb_id(imdb_id)` → Movie or None
- Status filters: WATCHED, WATCHING, WANT_TO_WATCH

**Update Operations:**
- `update_movie_status(id, status, rating)` → bool success
- Rating update: `user_rating` field updated atomically with status
- Date updated: `date_completed` set when status changed to WATCHED

**Delete Operations:**
- `delete_movie(id)` → bool success
- Removes from list and persists to JSON

**Favorite Operations:**
- `toggle_movie_favorite(id, is_favorite)` → bool success
- `get_favorite_movies()` → List[Movie] filtered by `is_favorite=True`

**Search History:**
- `add_to_search_history(media_type, query)` → persists query string
- `get_search_history(media_type)` → List[str] of recent queries
- Duplicate queries not added (set-based deduplication)

## Recommendation Engine Testing

**Recommender Class Tests (recommender.py):**

**Random Recommendation:**
- `get_random_movie_recommendation()` → picks random from want_to_watch list
- Returns None if list empty
- `get_random_book_recommendation()` → same pattern for books

**Smart Recommendation:**
- `get_smart_movie_recommendation()` → Tuple[Optional[Movie], str]
- Returns (movie, reason) tuple
- Reason example: `"Based on your love of Drama"` or `"Random pick (no watched movies to base preferences on)"`

**Scoring Logic:**
- `_analyze_movie_genres()` → dict of genre → score
- Score based on weighted user ratings: `weight = movie.user_rating if movie.user_rating else 5`
- `_score_movie()` sums genre scores from parsed genre strings: `movie.genre.split(", ")`
- Ties broken randomly: `random.choice(top_movies)`

**Testing Approach:**
- Genre parsing: split by ", " (comma-space) and strip whitespace
- Subject parsing for books: same pattern
- Score calculation: sum of matching preferences
- Empty preference handling: returns random pick with explanatory reason

## API Integration Testing

**MovieAPI (movie_api.py):**

**Search Test Scenario:**
- `search(title, media_type="movie")` → List[Dict]
- Returns [] if "Movie not found!" error
- Raises `OMDBError` for API errors

**Detail Retrieval:**
- `get_details(imdb_id)` → Dict with full movie info
- `get_series_details(imdb_id)` → Dict with series info
- Handle N/A values: convert to None

**Season Episodes:**
- `get_season_episodes(imdb_id, season)` → List[Dict]
- Returns [] if no episodes found
- Parses episode number, title, released date, rating

**BookAPI (book_api.py):**

**Search Test Scenario:**
- `search(query, limit=10)` → List[Dict]
- Requires "key" field in results (OLID)
- Handles missing fields with defaults: `"Unknown Author"`, `"Unknown Title"`
- Subject limit: first 5 only

**Detail Retrieval:**
- `get_details(olid)` → Dict with full book info
- `get_cover_url(olid, size="M")` → constructs URL (no network call)

## Integration Scenarios (Manual)

**Add Movie Workflow:**
1. Search OMDB via MovieAPI.search()
2. Select result, fetch details via MovieAPI.get_details()
3. Create Movie object via MovieAPI.create_movie_from_api()
4. Check duplicate via Database.get_movie_by_imdb_id()
5. Save via Database.add_movie()
6. UI updated via callback

**Export Workflow (gui_app.py lines 3108-3140):**
- Try/except wrapper on entire export
- CSV export calls `_export_to_csv()` method
- JSON export to file dialog location
- Error message shown on failure

**Search History Workflow:**
- Query stored in database after search
- Shown in autocomplete dropdowns
- Duplicates filtered out

## Coverage Gaps

**Untested Functionality:**
- Thread cleanup and daemon thread lifecycle
- Image gradient overlay algorithm (visual validation only)
- Matplotlib integration (optional, not used in core)
- Export to CSV edge cases (empty lists, special characters)
- Series episode tracking (complex nested structure)
- Recommendation ties breaking (randomness hard to test)
- Large dataset performance (1000+ items)

**High-Risk Areas:**
- Async image loading with callback pattern - no timeout handling shown
- Date parsing: `datetime.fromisoformat(date_added.replace("Z", "+00:00"))` - timezone handling
- JSON parsing in database load functions - malformed JSON causes silent empty return
- UI event binding recursion - potential stack overflow on deeply nested widgets

**Recommended Testing Priority:**
1. Database persistence: verify writes and reads match
2. API error handling: network timeouts, invalid keys, rate limiting
3. Recommendation scoring: verify genre matching and tie-breaking
4. Duplicate detection: add same movie twice should fail
5. Data validation: missing required fields on model creation

## Test Utilities & Mocking Needs

**Mock Requirements for Unit Testing:**
- Network requests (requests library, urlopen) - use unittest.mock.patch
- Database file I/O (open, json.load) - use tempfile for real files
- Callbacks - capture with unittest.mock.Mock and verify call count
- Threading - mock threading.Thread or use synchronous test alternative
- DateTime - mock datetime.datetime.now() for date_added/date_completed

**Example Mock Pattern (would need to be added):**
```python
from unittest.mock import patch, MagicMock

@patch('movie_api.requests.get')
def test_search_not_found(mock_get):
    mock_get.return_value.json.return_value = {"Response": "False", "Error": "Movie not found!"}
    api = MovieAPI(api_key="test")
    results = api.search("nonexistent")
    assert results == []
```

---

*Testing analysis: 2026-03-20*
