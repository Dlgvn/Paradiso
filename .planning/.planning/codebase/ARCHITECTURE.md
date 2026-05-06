# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Layered MVC with local JSON persistence, featuring a CustomTkinter GUI as the presentation layer and modular domain logic separated into models, database, and API client layers.

**Key Characteristics:**
- Local-first design: all data persists in JSON files in `data/` directory
- Separation of concerns across API clients, database, models, and UI layers
- Single-file GUI application with nested component classes for different UI elements
- Async image loading with caching to prevent UI freezes
- Support for three media types (Movies, Books, Series) with consistent status tracking

## Layers

**Presentation Layer (GUI):**
- Purpose: Display media items, handle user interactions, provide browsing and search interfaces
- Location: `gui_app.py`
- Contains: CustomTkinter widget classes (MediaCard, MediaListCard, Sidebar, MainContent, dialogs)
- Depends on: Database, MovieAPI, BookAPI, Recommender, Models
- Used by: User interactions, directly invoked via `run_gui.sh`

**Application/Controller Layer:**
- Purpose: Route navigation, trigger content refreshes, orchestrate API calls and database operations
- Location: `gui_app.py` (MediaTrackerApp class, ~400 lines)
- Contains: App initialization, view management, search delegation, event handlers
- Depends on: Database, MovieAPI, BookAPI, Recommender
- Used by: GUI components communicate back to app via callbacks

**Domain Model Layer:**
- Purpose: Define data structures with type safety and serialization logic
- Location: `models.py`
- Contains: Movie, Book, Series dataclasses with status enums and from_db_row() factory methods
- Depends on: Python stdlib (dataclasses, datetime, enum)
- Used by: Database, API clients, GUI components

**Data Access Layer:**
- Purpose: Handle all JSON file I/O and persistence logic
- Location: `database.py` (919 lines)
- Contains: Database class with CRUD operations for movies, books, series, search history
- Depends on: Models, JSON stdlib
- Used by: MediaTrackerApp, Recommender

**API Integration Layer:**
- Movie & Series API: `movie_api.py` - OMDB API client with search and detail methods
- Book API: `book_api.py` - Open Library API client with search and cover URL methods
- Purpose: Fetch external data and transform into domain models
- Contains: API exception classes, request handling, response parsing, model factories
- Depends on: Models, requests library, environment variables (OMDB_API_KEY)
- Used by: MediaTrackerApp (search operations)

**Business Logic Layer:**
- Purpose: Intelligent recommendations based on user history and preferences
- Location: `recommender.py`
- Contains: Recommender class with genre/subject analysis and scoring algorithms
- Depends on: Database, Models
- Used by: MediaTrackerApp (recommendation view)

**CLI Interface (Legacy):**
- Purpose: Terminal-based alternative to GUI
- Location: `media_tracker.py` (718 lines)
- Contains: Menu-driven interface, interactive search and tracking
- Depends on: Database, API clients, Models, Recommender
- Used by: `run.sh` script for CLI users

## Data Flow

**Search Flow (Movies/Series):**

1. User enters query in search box, clicks search button
2. MainContent._on_search() calls app.perform_search(query)
3. MediaTrackerApp.perform_search() delegates to MovieAPI.search() (if OMDB key available)
4. MovieAPI.search() makes HTTP request, parses JSON response, returns list of dicts
5. GUI displays SearchResultCard components for each result with title, year, poster
6. User clicks result → AddMediaDialog opens with MediaTrackerApp.add_media() callback
7. AddMediaDialog calls MovieAPI.get_details(imdb_id) to fetch full details
8. Movie object created via MovieAPI.create_movie_from_api()
9. MediaTrackerApp.add_media() calls Database.add_movie()
10. Database.add_movie() appends to movies.json and saves to disk
11. MainContent.refresh_movies() reloads all movies and updates UI

**Search Flow (Books):**

1. Same pattern as movies, but delegates to BookAPI.search()
2. BookAPI.search() queries Open Library API (no API key required)
3. BookAPI.get_cover_url() constructs cover image URL from OLID
4. Book.from_db_row() deserializes on load, Book model passed to UI

**Recommendation Flow:**

1. User clicks "Recommend" in sidebar
2. MediaTrackerApp._navigate("recommend") called
3. MediaTrackerApp.refresh_content() calls:
   - Recommender.get_smart_movie_recommendation() → returns (Movie, reason_string)
   - Recommender.get_smart_book_recommendation() → returns (Book, reason_string)
4. Recommender analyzes genres/subjects from watched/read items weighted by user ratings
5. Scores unwatched/unread items by matching genres/subjects
6. Returns highest-scoring item with explanation
7. MainContent.show_recommendations() displays both in UI

**State Management:**

- All state persists in JSON files: `data/movies.json`, `data/books.json`, `data/series.json`, `data/search_history.json`
- In-memory data: loaded on-demand via Database.get_*() methods
- UI state (current view, search mode): stored in MediaTrackerApp instance
- Search history appended to JSON for persistence across sessions
- No real-time sync between CLI and GUI; whichever runs last overwrites state

## Key Abstractions

**Database Abstraction:**
- Purpose: Hide JSON file I/O behind simple CRUD interface
- Examples: `database.py` Database class
- Pattern: Load/save methods with filename + directory management; list-based in-memory manipulation

**Model Factories:**
- Purpose: Convert database rows (dicts) and API responses into typed domain objects
- Examples: `Movie.from_db_row()`, `MovieAPI.create_movie_from_api()`, `BookAPI.create_book_from_search()`
- Pattern: Classmethod factories that handle type conversion, date parsing, null checking

**Async Image Loading:**
- Purpose: Prevent UI freeze when downloading and resizing poster images
- Examples: `ImageLoader.load_async()`, gradient overlay support
- Pattern: Thread-based download, disk cache by URL+size+gradient, callback on completion

**Status Enums:**
- Purpose: Enforce valid states for media items
- Examples: MovieStatus, BookStatus, SeriesStatus enums
- Pattern: Enum.value serialized to JSON strings, deserialized via Enum(row["status"])

## Entry Points

**GUI Application:**
- Location: `gui_app.py` → `main()` function (line 3227)
- Triggers: Invoked by `run_gui.sh` shell script
- Responsibilities: Instantiate MediaTrackerApp (custom Tkinter root), call mainloop()

**CLI Application:**
- Location: `media_tracker.py` → `main()` function
- Triggers: Invoked by `run.sh` shell script
- Responsibilities: Display menu loop, handle user input, call database/API operations

**Database Initialization:**
- Location: `Database.__init__()` in `database.py`
- Triggers: Called by MediaTrackerApp.__init__() and CLI main()
- Responsibilities: Create `data/` directory, initialize JSON files if missing, load/parse on read

## Error Handling

**Strategy:** Try-catch at API boundary; user-facing error dialogs in GUI; exception propagation in database layer.

**Patterns:**

- **API Errors:** Custom exceptions (OMDBError, OpenLibraryError, DatabaseError) raised; GUI wraps calls in try-catch, displays _show_error() dialog
  - Example: `gui_app.py` line 2835-2838 handles missing OMDB key gracefully

- **File I/O:** JSON decode errors caught and handled as empty lists (fallback to initialization)
  - Example: `database.py` lines 52-56, _load_movies() returns [] on JSONDecodeError

- **User Input Validation:** Enums enforce status validity; user_rating validated as 1-10; dates parsed with timezone handling
  - Example: `models.py` uses dataclass with Optional fields for nullable attributes

- **Missing Data:** Marked as None or "N/A"; UI components handle None gracefully with fallbacks
  - Example: `gui_app.py` MediaCard checks `if image_url` before loading; shows emoji fallback

## Cross-Cutting Concerns

**Logging:** No explicit logging framework; uses print() statements in CLI and errors shown via GUI dialogs. API errors printed to stdout as warnings.

**Validation:**
- Status validation via Enums (MovieStatus, BookStatus, SeriesStatus)
- Rating validation in CLI input loop (1-10 range)
- IMDB/OLID string validation implicit in API calls

**Authentication:**
- OMDB API key loaded from `OMDB_API_KEY` environment variable
- Open Library requires no authentication
- No user login system; all data local to machine

---

*Architecture analysis: 2026-03-20*
