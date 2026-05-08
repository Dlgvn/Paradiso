# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- Python 3.12.5 - Desktop GUI application, backend logic, API integrations

**Secondary:**
- Bash - Shell scripts for running the application

## Runtime

**Environment:**
- Python 3.12.5 (verified from `python3 --version`)

**Package Manager:**
- pip
- Lockfile: No lock file (uses requirements.txt with version pins)

## Frameworks

**GUI:**
- CustomTkinter (ctk) 5.2.0+ - Modern dark-themed GUI framework wrapping Tkinter
- Tkinter (standard library) - Underlying GUI toolkit

**Data Visualization:**
- Matplotlib 3.7.0+ - Chart and graph visualization with TkAgg backend
- Matplotlib TkAgg Backend - Integration layer for embedding plots in Tkinter

**Image Processing:**
- Pillow (PIL) 10.0.0+ - Image loading, resizing, manipulation (gradient overlays)

**HTTP Client:**
- requests 2.28.0+ - HTTP requests for external APIs

**Backend/Database:**
- No explicit database framework - Uses local JSON file persistence

## Key Dependencies

**Critical:**
- requests 2.28.0+ - HTTP library for OMDB and Open Library API calls
- customtkinter 5.2.0+ - Modern dark-luxury UI theming and widgets
- Pillow 10.0.0+ - Image handling (poster loading, gradient effects)
- matplotlib 3.7.0+ - Optional dependency for statistics/visualization (graceful fallback if missing)

**Infrastructure:**
- supabase 2.0.0+ - Listed in requirements.txt but not currently used in local app (legacy from cloud version)

## Configuration

**Environment:**
- `OMDB_API_KEY` - Required for movie/series search and details
  - Set in `run.sh` and `run_gui.sh` (embedded test key: `2a73cc47`)
  - Code checks via: `os.environ.get("OMDB_API_KEY")` in `movie_api.py`

**Data Storage:**
- Stored in `data/` directory relative to project root
- Files: `movies.json`, `books.json`, `series.json`, `search_history.json`
- Auto-created on first run if missing

**Build:**
- No build process - Pure Python application
- Entry points:
  - `python3 gui_app.py` - Desktop GUI (primary)
  - `python3 media_tracker.py` - CLI version (non-GUI)

## Platform Requirements

**Development:**
- macOS (verified from environment - Darwin 25.3.0)
- Python 3.12.5
- pip for dependency installation

**Production:**
- Linux, macOS, or Windows with Python 3.12+
- OMDB_API_KEY environment variable required for movie features
- No external services required - entirely local

## Deployment

**Type:**
- Desktop application (no web deployment)
- Portable - can run from any directory with Python installed
- Data persists locally in `data/` JSON files

**State Storage:**
- All state stored in local JSON files (no database server required)
- Export/import functionality via JSON serialization

---

*Stack analysis: 2026-03-20*
