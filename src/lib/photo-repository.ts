import type { Photo } from "@/types/photo";
import { getSupabaseServerClient } from "./supabase/server";
import { mapPhotoRowToPhoto, type PhotoRow } from "./supabase/mappers";
import { getPhotosByTripId as getMockPhotosByTripId } from "./photo-utils";

export type PhotoDataSource = "supabase" | "mock";

export interface TripPhotosData {
  photos: Photo[];
  source: PhotoDataSource;
}

/**
 * Chronological viewing order: taken_at ascending, undated photos pushed to
 * the end, ties broken by createdAt then id so the order is stable.
 */
function sortPhotosChronologically(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const aTime = a.takenAt ? new Date(a.takenAt).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.takenAt ? new Date(b.takenAt).getTime() : Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
  });
}

/**
 * Once Supabase is configured, it's authoritative for a trip's photos —
 * including an empty result (a freshly-created real trip legitimately has
 * zero photos; that's not a signal to fall back to mock decoration). The
 * mock dataset is only used in pure Demo Mode (no Supabase configured).
 */
export async function getTripPhotosData(tripId: string): Promise<TripPhotosData> {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.from("photos").select("*").eq("trip_id", tripId);

    if (error) {
      console.error("Failed to load photos from Supabase:", error);
      return { photos: [], source: "supabase" };
    }
    return { photos: sortPhotosChronologically((data as PhotoRow[]).map(mapPhotoRowToPhoto)), source: "supabase" };
  }

  return { photos: sortPhotosChronologically(getMockPhotosByTripId(tripId)), source: "mock" };
}
