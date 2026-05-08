# Paradiso

A full-stack media tracking web application for cataloging and analyzing your personal consumption of movies, books, and TV series.

## Features

- **Library Management** — Add, edit, and delete movies, books, and series with ratings, status, and notes
- **Status Tracking** — Track items as watchlist, watching, completed, or dropped
- **Detail Sheet** — Tap any poster to open a cinematic detail view with a ← back button, inline status controls, and rating editor
- **Advanced Filters** — Filter your library by genre, decade, user rating, or favorites — instantly, client-side
- **Series Episode Tracking** — For watching series: season selector + per-episode checkboxes fetched from OMDB, with a progress bar on the card
- **List & Grid Views** — Toggle between poster grid and a two-column list layout
- **Search** — Search your library with live filtering by title, genre, and status
- **Analytics Dashboard** — Visualize your media habits with genre distribution, rating histograms, and completion timelines
- **Recommendations** — Get personalized suggestions based on your genre preferences and ratings
- **Offline Support** — IndexedDB sync queue keeps the app functional without a connection
- **Authentication** — Secure sign up / sign in via Supabase Auth

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | Supabase (PostgreSQL) |
| Offline | Dexie (IndexedDB) |
| Auth | Supabase Auth + SSR middleware |
| Animations | Framer Motion |
| Charts | Recharts |
| Validation | Zod |
| Testing | Jest + React Testing Library |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OMDB API key](https://www.omdbapi.com/apikey.aspx) (free tier works)

### Installation

```bash
git clone https://github.com/Dlgvn/Paradiso.git
cd Paradiso
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OMDB_API_KEY=your_omdb_api_key
```

### Database Setup

Run the following in your Supabase SQL editor:

```sql
-- Create the main table
create table media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  external_id text not null,
  media_type text check (media_type in ('movie', 'book', 'series')) not null,
  title text not null,
  year text,
  genre text,
  director text,
  author text,
  plot text,
  poster_url text,
  external_rating text,
  status text check (status in ('watchlist', 'watching', 'completed', 'dropped')) not null,
  user_rating integer check (user_rating between 1 and 10),
  is_favorite boolean default false,
  date_added timestamptz default now(),
  date_completed timestamptz,
  notes text,
  updated_at timestamptz default now(),
  total_seasons smallint default null,
  episodes_watched jsonb default '[]'::jsonb,
  unique (user_id, external_id)
);

-- Enable Row Level Security
alter table media_items enable row level security;

create policy "Users can manage their own items"
  on media_items for all
  using (auth.uid() = user_id);
```

> **Existing installations:** If upgrading from an earlier schema, run:
> ```sql
> alter table media_items
>   drop column if exists current_season,
>   drop column if exists current_episode,
>   add column if not exists total_seasons smallint default null,
>   add column if not exists episodes_watched jsonb default '[]'::jsonb;
> ```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated routes
│   │   ├── movies/
│   │   ├── books/
│   │   ├── series/
│   │   ├── search/
│   │   ├── analytics/
│   │   └── recommendations/
│   ├── (auth)/         # Login / signup pages
│   └── actions/        # Server actions (library, search, recommendations)
├── components/
│   ├── detail/         # ItemDetailSheet, RatingEditor, EpisodeTracker
│   ├── library/        # MediaCard, MediaListItem, LibraryGrid, FilterBar
│   ├── search/         # SearchPageClient, AddItemDialog
│   ├── analytics/
│   ├── ui/             # Base UI components (Radix primitives)
│   └── layout/
└── lib/                # Supabase client, Dexie DB, OMDB + Open Library APIs
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run Jest tests
```

## Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Import the repository on [Vercel](https://vercel.com)
2. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OMDB_API_KEY`
3. Deploy

## Architecture Overview

- **Server Actions** handle all data mutations with Zod input validation
- **Supabase SSR** middleware manages session cookies and redirects unauthenticated users
- **Dexie (IndexedDB)** acts as a local cache with a sync queue for offline-first behavior
- **Row Level Security (RLS)** on Supabase ensures users can only access their own data
- **OMDB API** powers series episode lists (fetched per season, cached 5 min by Next.js)
- **Client-side filtering** in `FilterBar` / `LibraryGrid` provides instant filter UX without extra round-trips
