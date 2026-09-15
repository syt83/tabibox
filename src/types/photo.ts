export type PhotoCategory =
  | "food"
  | "place"
  | "landscape"
  | "people"
  | "transport"
  | "shopping"
  | "other";

export const PHOTO_CATEGORIES: PhotoCategory[] = [
  "food",
  "place",
  "landscape",
  "people",
  "transport",
  "shopping",
  "other",
];

export interface Photo {
  id: string;
  tripId: string;

  imageUrl: string;
  thumbnailUrl?: string;
  /** Path inside the `photos` Storage bucket. Only set for real (Supabase) photos — never inferred from imageUrl. */
  storagePath?: string;

  /** Missing when a photo has no EXIF date and no upload fallback was recorded. */
  takenAt?: string;

  latitude?: number;
  longitude?: number;

  country?: string;
  city?: string;

  locationName?: string;

  aiTags: string[];

  category?: PhotoCategory;

  isFavorite: boolean;

  createdAt: string;
}
