export function formatTripDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const sameYear = start.getFullYear() === end.getFullYear();

  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });

  return `${startLabel} — ${endLabel}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatPhotoDateTime(iso?: string): string {
  if (!iso) return "날짜 정보 없음";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";

  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} · ${timePart}`;
}

interface PhotoLocationFields {
  locationName?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/** location_name → city (+ country) → country → coordinates → "Location unavailable". */
export function formatPhotoLocation(photo: PhotoLocationFields): string {
  if (photo.locationName) return photo.locationName;
  if (photo.city && photo.country) return `${photo.city}, ${photo.country}`;
  if (photo.city) return photo.city;
  if (photo.country) return photo.country;
  if (typeof photo.latitude === "number" && typeof photo.longitude === "number") {
    return `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`;
  }
  return "위치 정보 없음";
}
