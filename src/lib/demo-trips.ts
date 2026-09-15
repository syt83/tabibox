import type { Trip } from "@/types/trip";

const DEMO_TRIPS_STORAGE_KEY = "tabibox_demo_trips";

/**
 * Trips created while Supabase isn't configured. There is no "create trip"
 * flow against the mock dataset (TRIPS in src/data/trips.ts is static), so
 * Demo Mode trips live in this browser's localStorage only — gone if the
 * user clears site data, never shared across devices. Same pattern as
 * demo-years.ts / demo-favorites.ts.
 */
export function getDemoTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_TRIPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Trip[]) : [];
  } catch {
    return [];
  }
}

export function saveDemoTrip(trip: Trip) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_TRIPS_STORAGE_KEY, JSON.stringify([...getDemoTrips(), trip]));
}

export function getDemoTripById(id: string): Trip | undefined {
  return getDemoTrips().find((trip) => trip.id === id);
}

export function removeDemoTrip(id: string) {
  if (typeof window === "undefined") return;
  const next = getDemoTrips().filter((trip) => trip.id !== id);
  window.localStorage.setItem(DEMO_TRIPS_STORAGE_KEY, JSON.stringify(next));
}
