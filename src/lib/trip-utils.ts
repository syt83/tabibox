import type { Trip } from "@/types/trip";
import { TRIPS } from "@/data/trips";
import { PHOTOS } from "@/data/photos";

export function getAllTrips(): Trip[] {
  return TRIPS;
}

export function getTripsByYear(year: number): Trip[] {
  return TRIPS.filter((trip) => trip.year === year);
}

export function getTripById(id: string): Trip | undefined {
  return TRIPS.find((trip) => trip.id === id);
}

export function getRecentTrips(limit = 3): Trip[] {
  return [...TRIPS].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, limit);
}

export interface OverallStats {
  tripCount: number;
  photoCount: number;
  yearCount: number;
}

export function getOverallStats(): OverallStats {
  const years = new Set(TRIPS.map((trip) => trip.year));
  return {
    tripCount: TRIPS.length,
    photoCount: PHOTOS.length,
    yearCount: years.size,
  };
}
