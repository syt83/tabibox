/**
 * Fixed id for the local "demo user" used before Supabase Auth exists.
 * Must stay a valid uuid so it satisfies the `user_id uuid` column and the
 * dev-only RLS policies in supabase/schema.sql — see docs/supabase-setup.md.
 */
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Resolves the id to attribute uploads to. There's no Auth yet — this is a
 * single-user personal deployment, so the demo user stands in everywhere,
 * including production. Once Supabase Auth is wired up, check the
 * signed-in session here first and fall back to the demo user only in
 * non-production environments.
 */
export function getCurrentUserId(): string | null {
  return DEMO_USER_ID;
}
