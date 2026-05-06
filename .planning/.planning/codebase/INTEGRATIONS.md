# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Movie & Series Data:**
- OMDB (The Open Movie Database) - Movie/series search and detailed information
  - SDK/Client: `requests` library + custom `MovieAPI` class (`movie_api.py`)
  - Base URL: `http://www.omdbapi.com/`
  - Auth: `OMDB_API_KEY` environment variable (free tier key: `2a73cc47`)
  - Endpoints:
    - Search: `/?apikey={key}&s={title}&type={movie|series}` → Search results
    - Details: `/?apikey={key}&i={imdb_id}&plot=short` → Full details (poster, rating, plot)
    - Episodes: `/?apikey={key}&i={imdb_id}&Season={number}` → Season episode list

**Book Data:**
- Open Library API - Book search and metadata
  - SDK/Client: `requests` library + custom `BookAPI` class (`book_api.py`)
  - Base URL: `https://openlibrary.org`
  - Auth: None (public API, no key required)
  - Endpoints:
    - Search: `/search.json?q={query}&limit={limit}` → Book search results
    - Details: `/works/{olid}.json` → Full book metadata
    - Covers: `https://covers.openlibrary.org/b/olid/{olid}-{S|M|L}.jpg` → Book cover images

**Image Loading:**
- External HTTP (via `urllib.request.urlopen`) - Poster and cover image fetching
  - Used by `ImageLoader.load_async()` in `gui_app.py` (lines 88-102)
  - Supports 10-second timeout for network requests
  - Caching: Images cached in-memory with cache keys: `{url}_{size}_{add_gradient}`

## Data Storage

**Databases:**
- None - Uses local JSON file system
- Files in `data/` directory:
  - `data/movies.json` - All movie data with user ratings, status, dates
  - `data/books.json` - All book data with user ratings, status, dates
  - `data/series.json` - All series data with episode tracking, status
  - `data/search_history.json` - Recent search queries for each media type

**File Storage:**
- Local filesystem only - All data stored as JSON files in `data/` directory
- No cloud storage or CDN integration

**Caching:**
- In-memory image cache (`ImageLoader._cache` dict) - Keyed by URL, size, and gradient setting
- Cache persists only during application session
- Search history maintained in local JSON file for recall

## Authentication & Identity

**Auth Provider:**
- None - Application has no user authentication
- All data is local and unprotected (single-user desktop app)

## Monitoring & Observability

**Error Tracking:**
- None configured
- Custom exception classes for API failures:
  - `OMDBError` - Movie/series API errors
  - `OpenLibraryError` - Book API errors
  - `DatabaseError` - JSON file I/O errors

**Logs:**
- No logging framework - Uses console output via `tkinter.messagebox` for user-facing errors
- No persistent logs written to disk

## CI/CD & Deployment

**Hosting:**
- Desktop application - No remote hosting
- Runs locally on user's machine

**CI Pipeline:**
- None - No automated testing or deployment pipeline

## Environment Configuration

**Required env vars:**
- `OMDB_API_KEY` - API key for OMDB movie/series searches
  - Required to use movie/series features
  - Not required for book features (Open Library is public)
  - Graceful error handling if missing: Shows UI error dialog

**Optional env vars:**
- None other than `OMDB_API_KEY`

**Secrets location:**
- Environment variable (system environment or `.env` pattern in shell scripts)
- Embedded in `run.sh` and `run_gui.sh` for convenience (test API key)
- Production should use system environment or external .env loader

## Webhooks & Callbacks

**Incoming:**
- None - Application only initiates requests

**Outgoing:**
- None - No external services are notified of changes

## Network Behavior

**Async Operations:**
- Image loading is asynchronous via threading (`threading.Thread` in `ImageLoader.load_async`)
- Prevents UI blocking during image downloads
- Uses 10-second timeout for all HTTP requests (movies, books, images)

**Error Handling:**
- Network errors caught as `requests.RequestException`
- Converted to domain exceptions (OMDBError, OpenLibraryError)
- UI displays error dialogs when API calls fail
- Graceful degradation if APIs unavailable

---

*Integration audit: 2026-03-20*
