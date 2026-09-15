import { getSupabaseServerClient } from "./supabase/server";

/**
 * Years the user explicitly created (Add Year) that have no trips or
 * photos yet. Returns [] whenever Supabase isn't configured — Demo Mode
 * has no server-side place to persist these, so the client merges in any
 * locally-added years instead (see year-mutations.ts).
 */
export async function getManualYears(): Promise<number[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("years").select("year");
  if (error) {
    console.error("Failed to load manually-created years, continuing without them:", error);
    return [];
  }

  return (data ?? []).map((row) => row.year as number);
}
