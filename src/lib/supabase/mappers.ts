import { PHOTO_CATEGORIES, type Photo, type PhotoCategory } from "@/types/photo";
import type { Trip } from "@/types/trip";

/** Shape of a row from the `trips` table (see supabase/schema.sql). */
export interface TripRow {
  id: string;
  user_id: string | null;
  title: string;
  country: string;
  year: number;
  start_date: string;
  end_date: string;
  cities: string[] | null;
  cover_image_url: string | null;
  created_at: string;
}

export function mapTripRowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    userId: row.user_id ?? "",
    title: row.title,
    country: row.country,
    year: row.year,
    startDate: row.start_date,
    endDate: row.end_date,
    cities: row.cities ?? [],
    coverImageUrl: row.cover_image_url ?? undefined,
    createdAt: row.created_at,
  };
}

/** Shape of a row from the `photos` table (see supabase/schema.sql). */
export interface PhotoRow {
  id: string;
  trip_id: string;
  image_url: string;
  storage_path: string;
  thumbnail_url: string | null;
  taken_at: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  location_name: string | null;
  ai_tags: string[] | null;
  category: string | null;
  is_favorite: boolean;
  created_at: string;
}

function isPhotoCategory(value: string | null): value is PhotoCategory {
  return value !== null && (PHOTO_CATEGORIES as readonly string[]).includes(value);
}

export function mapPhotoRowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    tripId: row.trip_id,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    storagePath: row.storage_path,
    takenAt: row.taken_at ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    locationName: row.location_name ?? undefined,
    aiTags: row.ai_tags ?? [],
    category: isPhotoCategory(row.category) ? row.category : undefined,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
  };
}
