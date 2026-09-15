import type { Trip } from "@/types/trip";
import { getSupabaseServerClient } from "./supabase/server";
import { mapTripRowToTrip, type TripRow } from "./supabase/mappers";
import { getTripById as getMockTripById } from "./trip-utils";

/**
 * Resolves a trip by id. Once Supabase is configured, it is the sole
 * source of truth — including for ids that happen to collide with the
 * mock dataset — so a trip deleted from Supabase actually disappears
 * instead of reappearing from the hardcoded fallback. The mock dataset is
 * only consulted in pure Demo Mode (no Supabase configured at all).
 */
export async function getTripByIdData(id: string): Promise<Trip | undefined> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getMockTripById(id);

  const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return mapTripRowToTrip(data as TripRow);
}
