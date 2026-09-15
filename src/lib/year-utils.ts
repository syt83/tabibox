import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";

export function photoYear(photo: Photo): number | null {
  if (!photo.takenAt) return null;
  const date = new Date(photo.takenAt);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

/**
 * Every distinct year the app actually knows about: Trip.year, the
 * calendar year of each Photo.takenAt, and any manually-created empty
 * years — never a hardcoded list. Newest first (future years included,
 * since a manually-added planning year can be ahead of "now").
 */
export function getAvailableYears(trips: Trip[], photos: Photo[], manualYears: number[] = []): number[] {
  const years = new Set<number>();
  trips.forEach((trip) => years.add(trip.year));
  photos.forEach((photo) => {
    const year = photoYear(photo);
    if (year !== null) years.add(year);
  });
  manualYears.forEach((year) => years.add(year));

  return Array.from(years).sort((a, b) => b - a);
}

export interface YearStats {
  year: number;
  tripCount: number;
  photoCount: number;
  cities: string[];
  coverImageUrl?: string;
  /** True when this year has no trips and no photos — only reachable via a manually-created year. */
  isEmpty: boolean;
}

/**
 * Stats for one year. Trips are matched by their own declared `year`;
 * photos are matched by their own `takenAt` calendar year — independently
 * of which trip they're attached to, so a photo dated outside its trip's
 * nominal year still surfaces under its own year here.
 */
export function getYearStats(trips: Trip[], photos: Photo[], year: number): YearStats {
  const yearTrips = trips.filter((trip) => trip.year === year);
  const yearPhotos = photos.filter((photo) => photoYear(photo) === year);
  const cities = Array.from(new Set(yearTrips.flatMap((trip) => trip.cities)));
  const cover = yearPhotos[0];

  return {
    year,
    tripCount: yearTrips.length,
    photoCount: yearPhotos.length,
    cities,
    coverImageUrl: cover?.thumbnailUrl ?? cover?.imageUrl,
    isEmpty: yearTrips.length === 0 && yearPhotos.length === 0,
  };
}
