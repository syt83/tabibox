import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import type { SearchFilters } from "@/types/search";
import { expandCityAliases } from "./city-aliases";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function tripMatchesQuery(trip: Trip, queries: string[]): boolean {
  if (queries.length === 0 || queries[0] === "") return true;
  const haystack = [trip.title, trip.country, String(trip.year), ...trip.cities].join(" ").toLowerCase();
  return queries.some((q) => haystack.includes(q));
}

function tripMatchesDateFilter(trip: Trip, filters: SearchFilters): boolean {
  if (!filters.dateFrom && !filters.dateTo) return true;
  const from = filters.dateFrom ?? "0000-01-01";
  const to = filters.dateTo ?? "9999-12-31";
  // A trip matches if its date range overlaps the requested range at all.
  return trip.startDate <= to && trip.endDate >= from;
}

/** Trip fields searched: title, country, cities, year. Sorted by startDate DESC (most recent first). */
export function searchTrips(trips: Trip[], query: string, filters: SearchFilters): Trip[] {
  const queries = expandCityAliases(normalizeQuery(query));

  return trips
    .filter((trip) => tripMatchesQuery(trip, queries))
    .filter((trip) => filters.year === undefined || trip.year === filters.year)
    .filter(
      (trip) =>
        filters.city === undefined || trip.cities.some((city) => city.toLowerCase() === filters.city!.toLowerCase())
    )
    .filter((trip) => tripMatchesDateFilter(trip, filters))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function photoMatchesQuery(photo: Photo, queries: string[]): boolean {
  if (queries.length === 0 || queries[0] === "") return true;
  // location_name, city, country, ai_tags — the fields that actually exist
  // on Photo today. No filename (not stored yet) and no semantic/AI-tag
  // matching beyond a literal substring check on whatever tags exist.
  const haystack = [photo.locationName, photo.city, photo.country, ...photo.aiTags]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  return queries.some((q) => haystack.includes(q));
}

function photoYear(photo: Photo): number | null {
  if (!photo.takenAt) return null;
  const year = new Date(photo.takenAt).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function photoMatchesDateFilter(photo: Photo, filters: SearchFilters): boolean {
  if (!filters.dateFrom && !filters.dateTo) return true;
  if (!photo.takenAt) return false;
  const takenDate = photo.takenAt.slice(0, 10);
  if (filters.dateFrom && takenDate < filters.dateFrom) return false;
  if (filters.dateTo && takenDate > filters.dateTo) return false;
  return true;
}

/** Photo fields searched: location_name, city, country, ai_tags. Sorted by takenAt DESC, undated last, tie-broken by createdAt DESC. */
export function searchPhotos(photos: Photo[], query: string, filters: SearchFilters): Photo[] {
  const queries = expandCityAliases(normalizeQuery(query));
  const seen = new Set<string>();

  return photos
    .filter((photo) => photoMatchesQuery(photo, queries))
    .filter((photo) => filters.year === undefined || photoYear(photo) === filters.year)
    .filter((photo) => filters.city === undefined || photo.city?.toLowerCase() === filters.city.toLowerCase())
    .filter((photo) => !filters.favorite || photo.isFavorite)
    .filter((photo) => photoMatchesDateFilter(photo, filters))
    .filter((photo) => {
      // Defensive de-dupe: matching happens on one combined haystack per
      // photo already, so a photo can't match twice — but a photo could in
      // principle appear in the input list more than once (e.g. a real +
      // stale mock copy), so guard against showing it twice regardless.
      if (seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    })
    .sort((a, b) => {
      const aTime = a.takenAt ? new Date(a.takenAt).getTime() : Number.NEGATIVE_INFINITY;
      const bTime = b.takenAt ? new Date(b.takenAt).getTime() : Number.NEGATIVE_INFINITY;
      if (aTime !== bTime) return bTime - aTime;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export interface SearchCounts {
  all: number;
  trips: number;
  photos: number;
}

export interface SearchResult {
  trips: Trip[];
  photos: Photo[];
  counts: SearchCounts;
}

export function searchAll(trips: Trip[], photos: Photo[], query: string, filters: SearchFilters): SearchResult {
  const matchedTrips = searchTrips(trips, query, filters);
  const matchedPhotos = searchPhotos(photos, query, filters);

  return {
    trips: matchedTrips,
    photos: matchedPhotos,
    counts: {
      all: matchedTrips.length + matchedPhotos.length,
      trips: matchedTrips.length,
      photos: matchedPhotos.length,
    },
  };
}

/** Cities that actually appear in the data — trips.cities ∪ photos.city — sorted alphabetically. Never hardcoded. */
export function collectAvailableCities(trips: Trip[], photos: Photo[]): string[] {
  const cities = new Set<string>();
  trips.forEach((trip) => trip.cities.forEach((city) => cities.add(city)));
  photos.forEach((photo) => {
    if (photo.city) cities.add(photo.city);
  });
  return Array.from(cities).sort((a, b) => a.localeCompare(b));
}
