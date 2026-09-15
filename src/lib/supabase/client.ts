import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

let cachedClient: SupabaseClient | null = null;

/**
 * Browser-side Supabase client, for use inside Client Components only
 * (direct-to-storage uploads, client-side inserts under RLS). Returns null
 * when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY aren't set,
 * so callers can fall back to Demo Mode instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;

  if (!cachedClient) {
    cachedClient = createBrowserClient(env.url, env.anonKey);
  }
  return cachedClient;
}
