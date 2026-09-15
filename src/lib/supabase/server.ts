import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

/**
 * Server-side Supabase client for Server Components / Route Handlers /
 * Server Actions. Wired to read the visitor's auth cookies so it's ready
 * for Supabase Auth once that's implemented; today (no Auth yet) it simply
 * runs unauthenticated under the anon key + RLS. Returns null when
 * Supabase env vars aren't set.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render, where cookies can't be
          // written — safe to ignore since we only read here (no Auth flow
          // that needs to refresh a session cookie yet).
        }
      },
    },
  });
}
