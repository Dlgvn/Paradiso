-- Phase 6 (PWA + Offline): add updated_at column for last-write-wins sync (D-02)
alter table media_items
  add column if not exists updated_at timestamptz not null default now();

-- Backfill existing rows so updated_at is never null
update media_items
  set updated_at = coalesce(date_completed, date_added, now())
  where updated_at is null;

-- Trigger: auto-bump updated_at on every row update
create or replace function set_media_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_media_items_updated_at on media_items;
create trigger trg_media_items_updated_at
  before update on media_items
  for each row execute function set_media_items_updated_at();

-- Index supports last-write-wins comparisons during sync
create index if not exists media_items_user_id_updated_at_idx
  on media_items (user_id, updated_at desc);
