import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { getSupabaseServerClient } from "./supabase/server";
import { mapPhotoRowToPhoto, mapTripRowToTrip, type PhotoRow, type TripRow } from "./supabase/mappers";
import { getAllTrips as getAllMockTrips } from "./trip-utils";
import { getAllPhotos as getAllMockPhotos } from "./photo-utils";

export interface SearchDataset {
  trips: Trip[];
  photos: Photo[];
}

/**
 * The full corpus Search, Timeline, Home, and Years all run against. Once
 * Supabase is configured, it's the sole source of truth for both trips and
 * photos — no merging with the mock dataset — so deleting a seed trip (or
 * all of them) actually empties the app instead of the hardcoded mock data
 * quietly filling back in. The mock dataset is only used in pure Demo Mode
 * (no Supabase configured at all).
 */
export async function getSearchDataset(): Promise<SearchDataset> {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const [tripsResult, photosResult] = await Promise.all([
      supabase.from("trips").select("*"),
      supabase.from("photos").select("*"),
    ]);

    if (tripsResult.error) {
      console.error("Failed to load trips from Supabase, falling back to mock data:", tripsResult.error);
    } else {
      const trips = (tripsResult.data as TripRow[]).map(mapTripRowToTrip);
      if (photosResult.error) {
        console.error("Failed to load photos from Supabase, continuing with no photos:", photosResult.error);
      }
      const photos = photosResult.error ? [] : (photosResult.data as PhotoRow[]).map(mapPhotoRowToPhoto);
      return { trips, photos };
    }
  }

  return { trips: getAllMockTrips(), photos: getAllMockPhotos() };
}
