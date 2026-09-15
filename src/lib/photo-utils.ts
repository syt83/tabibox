import type { Photo } from "@/types/photo";
import { PHOTOS } from "@/data/photos";
import { getTripById } from "./trip-utils";

export function getAllPhotos(): Photo[] {
  return PHOTOS;
}

export function getPhotosByTripId(tripId: string): Photo[] {
  return PHOTOS.filter((photo) => photo.tripId === tripId);
}

export function getTripPhotoCount(tripId: string): number {
  return getPhotosByTripId(tripId).length;
}

export function getRecentPhotos(limit = 6): Photo[] {
  return sortPhotosByRecency(PHOTOS).slice(0, limit);
}

/** Newest-first by takenAt. Works on any Photo[] — mock or the real (Supabase-or-mock) dataset from getSearchDataset(). */
export function sortPhotosByRecency(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => (b.takenAt ?? "").localeCompare(a.takenAt ?? ""));
}

/**
 * A trip's cover is always the most recently-taken photo in it — computed
 * live from its photos rather than a separately-stored "cover" field, so
 * it can never go stale (no gray box for a trip whose first-ever upload
 * predates this and never got backfilled, and no separate write path to
 * keep in sync as photos are added/removed).
 */
export function getTripCoverPhotoUrl(photos: Photo[], tripId: string): string | undefined {
  const tripPhotos = photos.filter((photo) => photo.tripId === tripId);
  const cover = sortPhotosByRecency(tripPhotos)[0];
  return cover?.thumbnailUrl ?? cover?.imageUrl;
}

export function getPhotosByYear(year: number): Photo[] {
  return PHOTOS.filter((photo) => getTripById(photo.tripId)?.year === year);
}

export function searchPhotos(query: string): Photo[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return PHOTOS.filter((photo) => {
    const trip = getTripById(photo.tripId);
    const haystack = [photo.city, photo.locationName, photo.category, ...photo.aiTags, trip?.title]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
