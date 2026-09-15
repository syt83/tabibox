/**
 * Fixed id for the local "demo user" used before Supabase Auth exists.
 * Must stay a valid uuid so it satisfies the `user_id uuid` column and the
 * dev-only RLS policies in supabase/schema.sql — see docs/supabase-setup.md.
 */
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Resolves the id to attribute uploads to. There's no Auth yet, so this
 * always returns the demo user outside production. Once Supabase Auth is
 * wired up, check the signed-in session here first and only fall back to
 * the demo user in non-production environments.
 *
 * Never returns the demo user in production — callers must treat `null`
 * as "no user available" and disable uploads accordingly.
 */
export function getCurrentUserId(): string | null {
  if (process.env.NODE_ENV !== "production") {
    return DEMO_USER_ID;
  }
  return null;
}
