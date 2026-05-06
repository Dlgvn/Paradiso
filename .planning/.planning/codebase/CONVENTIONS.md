# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- Python modules use lowercase with underscores: `gui_app.py`, `book_api.py`, `movie_api.py`, `media_tracker.py`
- GUI component files have descriptive names: `gui_app.py` contains main application and all UI classes
- API integration files named by service: `movie_api.py` (OMDB), `book_api.py` (Open Library)
- Main entry point: `gui_app.py` contains `main()` function at end of file

**Classes:**
- Use PascalCase: `ImageLoader`, `MediaCard`, `MediaListCard`, `SearchResultCard`, `Sidebar`, `AddMediaDialog`, `MediaDetailDialog`, `MainContent`, `ExportDialog`, `SeriesDetailDialog`, `MediaTrackerApp`
- Custom exception classes named with `Error` suffix: `DatabaseError`, `OMDBError`, `OpenLibraryError`
- UI component classes inherit from ctk framework: `class MediaCard(ctk.CTkFrame)`, `class Sidebar(ctk.CTkFrame)`
- Model classes use `@dataclass` decorator: `Movie`, `Book`, `Series`

**Functions:**
- Public methods use snake_case: `add_movie()`, `get_details()`, `create_movie_from_api()`, `search()`
- Private methods prefixed with underscore: `_load_movies()`, `_save_movies()`, `_handle_click()`, `_on_hover_enter()`, `_toggle_favorite()`, `_bind_events_recursive()`, `_add_gradient_overlay()`, `_set_image()`
- Callback/handler methods named with prefix: `_on_*` for event handlers (`_on_click_favorite`, `_on_hover_enter`), `_handle_*` for logic handlers
- Setup/initialization methods: `__init__()`, factory methods use `from_*` pattern: `Movie.from_db_row()`, `create_movie_from_api()`

**Variables:**
- Use snake_case for all variables: `image_url`, `media_id`, `is_favorite`, `user_rating`, `date_added`, `on_click`, `on_favorite_toggle`
- Boolean flags prefixed with `is_` or `has_`: `is_favorite`, `selectable`, `selected`, `MATPLOTLIB_AVAILABLE`
- Callback parameters use `on_*` naming: `on_click`, `on_favorite_toggle`, `on_select`, `on_add`, `on_press`
- Private/internal variables prefixed with underscore: `_cache`, `_load()`, `_save()`
- Dictionary keys use snake_case: `THEME` dict has keys like `bg_primary`, `accent_primary`, `text_primary`, `status_watched`
- Constants in UPPERCASE: `THEME`, `MATPLOTLIB_AVAILABLE`, `BASE_URL`

**Types/Enums:**
- Status enums use UPPERCASE values: `MovieStatus.WATCHED`, `BookStatus.READ`, `SeriesStatus.COMPLETED`
- Enum class names: `MovieStatus`, `BookStatus`, `SeriesStatus`
- Type hints used throughout: `Optional[str]`, `List[Movie]`, `Callable[[Optional[ctk.CTkImage]], None]`, `Tuple[Optional[Movie], str]`

## Code Style

**Formatting:**
- 4-space indentation (Python standard)
- Line breaks after class definitions and method groups
- Blank lines separate logical sections within methods
- Trailing blank lines at end of files

**Linting:**
- No linter configured in project
- Code follows PEP 8 conventions implicitly
- No type-checking enforced (type hints present but not validated)

**File Headers:**
- Python modules include shebang: `#!/usr/bin/env python3`
- Module docstring as first line: `"""Description of module purpose."""`
- Example from `gui_app.py`: `#!/usr/bin/env python3` followed by `"""Media Tracker GUI (Local) - Stores data in local JSON files."""`

## Import Organization

**Order:**
1. Standard library imports: `import io`, `import os`, `import json`, `import sys`, `from typing import ...`, `from datetime import ...`, `from pathlib import Path`
2. Third-party imports: `import customtkinter as ctk`, `from PIL import Image, ImageDraw`, `import requests`, `import matplotlib`
3. Local project imports: `from book_api import ...`, `from database import ...`, `from models import ...`, `from movie_api import ...`

**Path Aliases:**
- Direct relative imports used: `from models import Movie, BookStatus`
- No path aliases (no `@` or custom PYTHONPATH) observed
- All local modules imported by name from same directory

**Conditional Imports:**
- Optional dependencies wrapped in try/except: matplotlib in `gui_app.py` lines 15-22 with `MATPLOTLIB_AVAILABLE` flag
- Used to handle optional features gracefully without breaking app if dependency missing

## Error Handling

**Patterns:**
- Custom exception classes for each API/module: `OMDBError` in `movie_api.py`, `OpenLibraryError` in `book_api.py`, `DatabaseError` in `database.py`
- API methods catch `requests.RequestException` and raise custom error with context:
  ```python
  except requests.RequestException as e:
      raise OMDBError(f"Network error: {e}")
  ```
- GUI error handling uses `_show_error()` method for user-facing messages: `self._show_error(f"Database Error: {e}")`
- Try/except blocks catch specific exception types first, then general `Exception` as fallback
- ImageLoader silent failure for missing images: `except Exception: callback(None)`
- Validation in constructors: `if not self.api_key: raise OMDBError(...)`

**UI Error Display:**
- Method `_show_error()` in main app (`gui_app.py` line 3185) creates dark-themed error dialogs
- User-facing error messages formatted with context: `"'{title}' is already in your library"`, `"OMDB API key not configured.\nSet OMDB_API_KEY environment variable."`
- Network errors wrapped with user-friendly messages

## Logging

**Framework:** `console` (print statements only)

**Patterns:**
- No logging library imported or used
- Status messages printed directly: `print("Using local JSON storage (~/.media-tracker/)")`
- Debug feedback via GUI dialogs, not console
- Progress/loading states handled via UI updates (dialogs, status labels)

## Comments

**When to Comment:**
- Sparse comment usage - mostly self-documenting code
- Comments explain WHY, not WHAT: `# Skip the favorite button - it has its own click handler` (line 303)
- Comments mark significant design decisions: `# Add gradient overlay for cinematic effect` (line 94)
- THEME dict heavily commented to explain color purposes: `# Main app background (near-black)`, `# Crimson red`
- Complex algorithm comments: Genre scoring logic in `recommender.py` lines 25-37

**Docstrings:**
- All public methods have docstring in triple-quotes: `"""Get a random movie from the want_to_watch list."""`
- Functions document parameters and return values in Args/Returns format:
  ```python
  """Search for movies or series by title. Returns a list of search results.

  Args:
      title: Search query
      media_type: "movie" or "series"
  """
  ```
- Class docstrings describe purpose: `"""Dark cinematic card for displaying media items with hover effects."""`
- Private methods may have shorter docstrings: `"""Load movies from JSON file."""`
- No @docstring decorators used

## Function Design

**Size:**
- Most functions 10-50 lines
- Complex UI setup in class `__init__` methods can be 100+ lines (e.g., `MediaCard.__init__`)
- Helper methods factored out: `_add_gradient_overlay()`, `_bind_events_recursive()`, `_analyze_movie_genres()`

**Parameters:**
- Prefer keyword-only arguments for optional config: `add_gradient: bool = False`, `size: tuple = (180, 270)`
- Use `Optional[Type]` for nullable parameters: `Optional[str]`, `Optional[int]`, `Optional[Callable]`
- Default parameters used: `media_type: str = "movie"`, `limit: int = 10`
- Callbacks passed as parameters: `callback: Callable[[Optional[ctk.CTkImage]], None]`

**Return Values:**
- Return `Optional[Type]` when result may be None: `Optional[Movie]`, `Optional[Book]`
- Return tuples for multi-value results: `Tuple[Optional[Movie], str]` (movie + reason in recommender)
- Factory methods return instances: `Movie`, `Book`, `Series`
- Query methods return collections: `List[Movie]`, `List[dict]`, `List[Tuple[Movie, float]]`
- Boolean return for success/failure: `add_movie() -> int`, `delete_movie() -> bool`

## Module Design

**Exports:**
- Models module exports data classes and enums: `Movie`, `Book`, `Series`, `MovieStatus`, `BookStatus`, `SeriesStatus`
- API modules export client class and exception: `MovieAPI`, `OMDBError`; `BookAPI`, `OpenLibraryError`
- Database module exports client class and exception: `Database`, `DatabaseError`
- Main app module exports nothing - consumed by `main()` function

**Barrel Files:**
- No barrel/index files used
- All imports are explicit from source modules
- No re-export pattern observed

**Class Structure in gui_app.py:**
- Single file contains multiple UI component classes before main `MediaTrackerApp` class
- Organized top-to-bottom: `ImageLoader` (utility) → Card classes → Dialog classes → Main app
- Related classes grouped: `MediaCard` and `MediaListCard` near each other

## Pattern Examples

**Dataclass with Factory Method:**
```python
@dataclass
class Movie:
    id: Optional[int]
    # ... fields ...

    @classmethod
    def from_db_row(cls, row: dict) -> "Movie":
        """Create a Movie instance from a database row."""
        # Parse and construct
        return cls(...)
```

**API Search and Detail Pattern:**
```python
def search(self, query: str) -> List[Dict]:
    """Returns search results."""
    # Network call, parse response
    return results

def get_details(self, id: str) -> Dict:
    """Returns full details."""
    # Network call
    return data

def create_from_api(self, id: str) -> Movie:
    """Fetch and construct model object."""
    data = self.get_details(id)
    return Movie(...)
```

**UI Component Pattern:**
```python
class MediaCard(ctk.CTkFrame):
    def __init__(self, parent, title: str, on_click: Optional[Callable] = None, **kwargs):
        super().__init__(parent, **kwargs)
        self.on_click = on_click

        # Build UI widgets
        self.title_label = ctk.CTkLabel(self, text=title)
        self.title_label.pack()

        # Bind event handlers
        self._bind_events_recursive(self)

    def _on_click(self):
        """Handle click."""
        if self.on_click:
            self.on_click()
```

---

*Convention analysis: 2026-03-20*
