# Paradiso

A full-stack media tracking web application for cataloging and analyzing your personal consumption of movies, books, and TV series.

## Features

- **Library Management** — Add, edit, and delete movies, books, and series with ratings, status, and notes
- **Status Tracking** — Track items as watchlist, watching, completed, or dropped
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
```

### Database Setup

Run the following in your Supabase SQL editor to create the required table:

```sql
create table media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  type text check (type in ('movie', 'book', 'series')) not null,
  status text not null,
  rating integer check (rating between 1 and 10),
  genre text,
  notes text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

alter table media_items enable row level security;

create policy "Users can manage their own items"
  on media_items for all
  using (auth.uid() = user_id);
```

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
│   ├── ui/             # Base UI components
│   ├── auth/
│   ├── analytics/
│   ├── library/
│   └── search/
└── lib/                # Supabase client, Dexie DB, utilities
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
2. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy

## Architecture Overview

- **Server Actions** handle all data mutations with Zod input validation
- **Supabase SSR** middleware manages session cookies and redirects unauthenticated users
- **Dexie (IndexedDB)** acts as a local cache with a sync queue for offline-first behavior
- **Row Level Security (RLS)** on Supabase ensures users can only access their own data
