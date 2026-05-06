create type media_type as enum ('movie', 'book', 'series');
create type media_status as enum ('watchlist', 'watching', 'completed', 'dropped');

create table media_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  media_type  media_type not null,
  external_id text not null,
  title       text not null,
  year        text,
  genre       text,
  director    text,
  author      text,
  plot        text,
  poster_url  text,
  external_rating text,
  status      media_status not null default 'watchlist',
  user_rating smallint check (user_rating between 1 and 10),
  is_favorite boolean not null default false,
  date_added  timestamptz not null default now(),
  date_completed timestamptz,
  notes       text,
  constraint unique_user_item unique (user_id, external_id)
);

create index on media_items (user_id);
create index on media_items (user_id, media_type);
create index on media_items (user_id, status);

alter table media_items enable row level security;

create policy "Users can view their own items"
  on media_items for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own items"
  on media_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own items"
  on media_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own items"
  on media_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);
