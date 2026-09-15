-- TabiBox — schema (Trips + Photos + Years), updated through Phase 11
--
-- Run this in the Supabase SQL Editor (or via `supabase db push` if you use
-- the CLI). Every statement is safe to re-run — table/index creation is
-- `if not exists`, policies are dropped and recreated, and the seed insert
-- is `on conflict (id) do nothing`. See docs/supabase-setup.md for the full
-- setup walkthrough, including the Storage bucket + policies this schema
-- doesn't cover (buckets aren't SQL objects).
--
-- WARNING: this file creates "Dev demo user" RLS policies (search for that
-- phrase below) that let a hardcoded id read and write without any
-- Supabase Auth session. They exist only so upload/favorite/delete work
-- before real Authentication is built. They MUST be dropped before this
-- app is deployed to production — see "Dev vs. production RLS" in
-- docs/supabase-setup.md for the exact drop-policy commands.
--
-- Deviation from a plain "uuid primary key" for trips.id: TabiBox's Trip
-- Detail route is /trip/[id] and Phase 3's mock trips already use stable
-- string ids (e.g. "trip-2026-summer-japan") baked into links throughout
-- the app. Using `id text primary key` here — instead of a fresh
-- server-generated uuid — lets photos.trip_id reference those exact ids
-- with no separate slug/uuid mapping layer. The seed block below inserts
-- the same 6 mock trips under those ids so the photos.trip_id foreign key
-- has something real to point at before any "create trip" flow exists.

create extension if not exists pgcrypto;

create table if not exists trips (
  id text primary key,
  user_id uuid,
  title text not null,
  country text not null default 'Japan',
  year integer not null,
  start_date date not null,
  end_date date not null,
  cities text[] not null default '{}',
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references trips(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  thumbnail_url text,
  taken_at timestamptz,
  latitude double precision,
  longitude double precision,
  country text,
  city text,
  location_name text,
  ai_tags text[] not null default '{}',
  category text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists photos_trip_id_idx on photos (trip_id);

-- Phase 11 — years a user has explicitly created with no trips/photos in
-- them yet (e.g. "planning a 2027 trip"). Years that already have a trip
-- or a photo never need a row here — they're derived dynamically from
-- trips.year / photos.taken_at (see src/lib/year-data.ts) — this table
-- exists purely to remember an otherwise-empty year the user asked for.
create table if not exists years (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  year integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, year)
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- TabiBox has no Auth yet (Phase 7 is upload only), so the "real" owner
-- policies below are written against auth.uid() for when Auth lands, and a
-- separate, clearly-marked DEV ONLY policy set allows the app's hardcoded
-- demo user (see src/lib/demo-user.ts) to read/write without a session.
-- Before shipping real Authentication, drop every "Dev demo user ..."
-- policy — see docs/supabase-setup.md for the exact command.

alter table trips enable row level security;
alter table photos enable row level security;
alter table years enable row level security;

-- Production policies (require Supabase Auth; inert until users sign in
-- and trips/photos carry a real auth.uid() as user_id)
drop policy if exists "Owners can view their own trips" on trips;
create policy "Owners can view their own trips"
  on trips for select
  using (auth.uid() = user_id);

drop policy if exists "Owners can insert their own trips" on trips;
create policy "Owners can insert their own trips"
  on trips for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owners can update their own trips" on trips;
create policy "Owners can update their own trips"
  on trips for update
  using (auth.uid() = user_id);

drop policy if exists "Owners can delete their own trips" on trips;
create policy "Owners can delete their own trips"
  on trips for delete
  using (auth.uid() = user_id);

drop policy if exists "Owners can view their own photos" on photos;
create policy "Owners can view their own photos"
  on photos for select
  using (exists (
    select 1 from trips where trips.id = photos.trip_id and trips.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert their own photos" on photos;
create policy "Owners can insert their own photos"
  on photos for insert
  with check (exists (
    select 1 from trips where trips.id = photos.trip_id and trips.user_id = auth.uid()
  ));

drop policy if exists "Owners can update their own photos" on photos;
create policy "Owners can update their own photos"
  on photos for update
  using (exists (
    select 1 from trips where trips.id = photos.trip_id and trips.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete their own photos" on photos;
create policy "Owners can delete their own photos"
  on photos for delete
  using (exists (
    select 1 from trips where trips.id = photos.trip_id and trips.user_id = auth.uid()
  ));

drop policy if exists "Owners can view their own years" on years;
create policy "Owners can view their own years"
  on years for select
  using (auth.uid() = user_id);

drop policy if exists "Owners can insert their own years" on years;
create policy "Owners can insert their own years"
  on years for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owners can delete their own years" on years;
create policy "Owners can delete their own years"
  on years for delete
  using (auth.uid() = user_id);

-- DEV ONLY — remove before enabling real Authentication in production.
-- Lets the fixed demo user (00000000-0000-0000-0000-000000000001) read and
-- write without a Supabase Auth session, so `npm run dev` works today.
-- Phase 8 needs update/delete too (Favorite toggle, Delete photo) —
-- Phase 7 only granted select/insert.
drop policy if exists "Dev demo user can view trips" on trips;
create policy "Dev demo user can view trips"
  on trips for select
  using (user_id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Dev demo user can insert trips" on trips;
create policy "Dev demo user can insert trips"
  on trips for insert
  with check (user_id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Dev demo user can delete trips" on trips;
create policy "Dev demo user can delete trips"
  on trips for delete
  using (user_id = '00000000-0000-0000-0000-000000000001');

-- Needed so a trip's cover_image_url can be auto-set from its first
-- uploaded photo (see uploadPhotoToSupabase in src/lib/photo-upload.ts).
drop policy if exists "Dev demo user can update trips" on trips;
create policy "Dev demo user can update trips"
  on trips for update
  using (user_id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Dev demo user can view photos" on photos;
create policy "Dev demo user can view photos"
  on photos for select
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
      and trips.user_id = '00000000-0000-0000-0000-000000000001'
  ));

drop policy if exists "Dev demo user can insert photos" on photos;
create policy "Dev demo user can insert photos"
  on photos for insert
  with check (exists (
    select 1 from trips
    where trips.id = photos.trip_id
      and trips.user_id = '00000000-0000-0000-0000-000000000001'
  ));

drop policy if exists "Dev demo user can update photos" on photos;
create policy "Dev demo user can update photos"
  on photos for update
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
      and trips.user_id = '00000000-0000-0000-0000-000000000001'
  ));

drop policy if exists "Dev demo user can delete photos" on photos;
create policy "Dev demo user can delete photos"
  on photos for delete
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
      and trips.user_id = '00000000-0000-0000-0000-000000000001'
  ));

drop policy if exists "Dev demo user can view years" on years;
create policy "Dev demo user can view years"
  on years for select
  using (user_id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Dev demo user can insert years" on years;
create policy "Dev demo user can insert years"
  on years for insert
  with check (user_id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Dev demo user can delete years" on years;
create policy "Dev demo user can delete years"
  on years for delete
  using (user_id = '00000000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------
-- Seed: the 6 trips already hardcoded in src/data/trips.ts, so photo
-- uploads against today's app have a real trips row to reference. Safe to
-- re-run (upsert on id).
-- ---------------------------------------------------------------------

insert into trips (id, user_id, title, country, year, start_date, end_date, cities, cover_image_url)
values
  ('trip-2026-summer-japan', '00000000-0000-0000-0000-000000000001', 'Summer in Japan 2026', 'Japan', 2026, '2026-08-10', '2026-08-18', array['Tokyo','Kyoto','Osaka'], 'https://picsum.photos/seed/trip-2026-summer-japan-cover/1200/800'),
  ('trip-2026-fukuoka-winter', '00000000-0000-0000-0000-000000000001', 'Fukuoka Winter 2026', 'Japan', 2026, '2026-12-20', '2026-12-24', array['Fukuoka'], 'https://picsum.photos/seed/trip-2026-fukuoka-winter-cover/1200/800'),
  ('trip-2025-tokyo-spring', '00000000-0000-0000-0000-000000000001', 'Tokyo Spring 2025', 'Japan', 2025, '2025-04-10', '2025-04-14', array['Tokyo'], 'https://picsum.photos/seed/trip-2025-tokyo-spring-cover/1200/800'),
  ('trip-2025-osaka-autumn', '00000000-0000-0000-0000-000000000001', 'Osaka Autumn 2025', 'Japan', 2025, '2025-10-03', '2025-10-08', array['Osaka','Kyoto'], 'https://picsum.photos/seed/trip-2025-osaka-autumn-cover/1200/800'),
  ('trip-2025-sapporo-winter', '00000000-0000-0000-0000-000000000001', 'Sapporo Winter 2025', 'Japan', 2025, '2025-12-15', '2025-12-19', array['Sapporo'], 'https://picsum.photos/seed/trip-2025-sapporo-winter-cover/1200/800'),
  ('trip-2024-kyoto-autumn', '00000000-0000-0000-0000-000000000001', 'Kyoto Autumn 2024', 'Japan', 2024, '2024-11-12', '2024-11-17', array['Kyoto','Nara'], 'https://picsum.photos/seed/trip-2024-kyoto-autumn-cover/1200/800')
on conflict (id) do nothing;
