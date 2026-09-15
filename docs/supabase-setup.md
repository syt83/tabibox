# Supabase setup (Phase 7 upload → Phase 11 years)

TabiBox runs fine with zero Supabase configuration — every page falls back
to Phase 3's mock data ("Demo Mode"). Follow this guide only when you want
real photo upload, favoriting, deletion and manually-created years to work.

> **Already ran this before?** Re-run `supabase/schema.sql` — every
> statement is idempotent (policies are dropped and recreated, `years` is
> created `if not exists`). If you're coming from before Phase 8, also add
> the Storage **delete** policy from Step 5 below.

## Step 1 — Create a Supabase project

Create a project at [supabase.com](https://supabase.com) (any region). Wait
for provisioning to finish, then open **Project Settings → API**.

## Step 2 — Environment variables

Copy `.env.example` to `.env.local` in the project root and fill in the two
values from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the "anon" / "public" key>
```

Only the **anon** key goes here — never the `service_role` secret key.
`.env.local` is already git-ignored; `.env.example` stays committed as the
template. Restart `npm run dev` after editing it (Next.js only reads env
files on startup).

## Step 3 — Run the database migration

Open the Supabase **SQL Editor** and run the full contents of
[`supabase/schema.sql`](../supabase/schema.sql) once. It creates:

- `trips`, `photos`, and `years` tables (see the file for the exact columns
  — `years` only ever holds rows for years the user manually created with
  no trips/photos in them yet; every other year is derived dynamically from
  `trips.year` / `photos.taken_at`, see `src/lib/year-data.ts`)
- Row Level Security, enabled on all three tables
- A seed insert for the 6 trips already hardcoded in `src/data/trips.ts`,
  so uploads against today's Trip Detail pages (`/trip/trip-2026-...`) have
  a real `trips` row to attach to

Re-running the file is safe — table creation is `if not exists` and the
seed insert is `on conflict (id) do nothing`.

## Step 4 — Create the Storage bucket

**Storage → New bucket**:

- Name: `photos` (must match exactly — the code hardcodes this bucket name)
- Public bucket: **On** (simplest option for Phase 7; photo URLs are served
  directly via the public CDN URL, matching `getPublicUrl()` in
  `src/lib/photo-upload.ts`)

## Step 5 — Storage policies

Public buckets serve existing files without going through RLS, but
**uploading** still needs a policy. In **Storage → photos → Policies**, add
(or run as SQL — Storage policies live on `storage.objects`):

```sql
-- DEV ONLY — lets the app's hardcoded demo user upload without a session.
-- Remove once real Authentication replaces src/lib/demo-user.ts.
create policy "Dev demo user can upload photos"
on storage.objects for insert
to public
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000001'
);

create policy "Anyone can read photos"
on storage.objects for select
to public
using (bucket_id = 'photos');

-- DEV ONLY — lets Delete photo (Phase 8) remove the underlying file.
create policy "Dev demo user can delete photos"
on storage.objects for delete
to public
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000001'
);
```

**Production version**, once Supabase Auth is wired up (replace the dev
policies with these):

```sql
create policy "Users can upload their own photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

This mirrors the storage path convention the app already uses:
`photos/<user-id>/<trip-id>/<photo-id>.<ext>` — see
`uploadPhotoToSupabase()` in `src/lib/photo-upload.ts`.

## Step 6 — Run the app

```
npm run dev
```

Open a trip (e.g. `/trip/trip-2026-summer-japan`) and use **Upload
Photos**. If the button is disabled, hover it — it tells you whether
Supabase isn't configured or no user is available.

---

## Dev vs. production RLS — important

`supabase/schema.sql` and the Storage policy above include a **"Dev demo
user"** policy set that lets the hardcoded id
`00000000-0000-0000-0000-000000000001` (see `src/lib/demo-user.ts`) read
and write without any Supabase Auth session. This exists purely so upload
works today, before real Authentication is built.

**Before deploying to production:**

1. Implement Supabase Auth (or another auth provider) and make
   `getCurrentUserId()` in `src/lib/demo-user.ts` return the real signed-in
   user's id (it already returns `null` in production as a safety net —
   uploads stay disabled with a "Sign in to upload photos" message until
   you do this).
2. Drop every "Dev demo user ..." policy:
   ```sql
   drop policy "Dev demo user can view trips" on trips;
   drop policy "Dev demo user can insert trips" on trips;
   drop policy "Dev demo user can view photos" on photos;
   drop policy "Dev demo user can insert photos" on photos;
   drop policy "Dev demo user can update photos" on photos;
   drop policy "Dev demo user can delete photos" on photos;
   drop policy "Dev demo user can upload photos" on storage.objects;
   drop policy "Dev demo user can delete photos" on storage.objects;
   drop policy "Dev demo user can view years" on years;
   drop policy "Dev demo user can insert years" on years;
   drop policy "Dev demo user can delete years" on years;
   ```
   The `auth.uid() = user_id` policies already in the schema are the real,
   production-safe ones — they simply have nothing to match against until
   Auth exists.

## What this phase does not do

- No Supabase Auth / sign-in UI (see `src/lib/demo-user.ts` for the seam)
- No AI tagging, semantic search, or duplicate detection for uploaded photos
- No migration of *new* trips created outside `src/data/trips.ts` into
  Supabase — only the 6 existing mock trips are seeded, so uploads only
  work against those trips today
