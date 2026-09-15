import type { Photo } from "@/types/photo";
import { getPrefectureForCoords } from "./japan-prefectures";

export type TimelineYearKey = number | "unknown";

export interface TimelinePlaceGroup {
  key: string;
  label: string;
  photos: Photo[];
}

export interface TimelineDayGroup {
  key: string;
  label: string;
  photos: Photo[];
  /** Same photos, split by 도도부현 (GPS-derived) — lets a multi-city day (e.g. Kyoto → Osaka) show sub-headers instead of one flat grid. Always at least one entry when photos.length > 0. */
  places: TimelinePlaceGroup[];
}

export interface TimelineMonthGroup {
  key: string;
  label: string;
  photoCount: number;
  days: TimelineDayGroup[];
}

export interface TimelineYearGroup {
  year: TimelineYearKey;
  label: string;
  photoCount: number;
  months: TimelineMonthGroup[];
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("ko-KR", { month: "long" });
const DAY_FORMATTER = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

function parsedDate(photo: Photo): Date | null {
  if (!photo.takenAt) return null;
  const date = new Date(photo.takenAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Distinct years across all photos, based on takenAt (not Trip.year) —
 * local-timezone calendar year, consistent with all the grouping below.
 * Newest first; "unknown" (undated photos) is appended last, only when
 * at least one photo actually has no usable date.
 */
export function getAvailablePhotoYears(photos: Photo[]): TimelineYearKey[] {
  const years = new Set<number>();
  let hasUnknown = false;

  for (const photo of photos) {
    const date = parsedDate(photo);
    if (date) years.add(date.getFullYear());
    else hasUnknown = true;
  }

  const sorted: TimelineYearKey[] = Array.from(years).sort((a, b) => b - a);
  if (hasUnknown) sorted.push("unknown");
  return sorted;
}

/** taken_at DESC, undated last, ties broken by createdAt DESC then id. */
function comparePhotosDesc(a: Photo, b: Photo): number {
  const aTime = a.takenAt ? new Date(a.takenAt).getTime() : Number.NEGATIVE_INFINITY;
  const bTime = b.takenAt ? new Date(b.takenAt).getTime() : Number.NEGATIVE_INFINITY;
  if (aTime !== bTime) return bTime - aTime;
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

function placeKeyForPhoto(photo: Photo): string {
  if (photo.latitude == null || photo.longitude == null) return "unknown";
  return getPrefectureForCoords(photo.latitude, photo.longitude)?.ko ?? "unknown";
}

/** Splits one day's (already-sorted) photos into 도도부현 groups, ordered by first appearance. */
function groupPhotosByPlace(dayPhotos: Photo[]): TimelinePlaceGroup[] {
  const byPlace = new Map<string, Photo[]>();
  const order: string[] = [];

  for (const photo of dayPhotos) {
    const key = placeKeyForPhoto(photo);
    if (!byPlace.has(key)) {
      byPlace.set(key, []);
      order.push(key);
    }
    byPlace.get(key)!.push(photo);
  }

  return order.map((key) => ({
    key,
    label: key === "unknown" ? "위치 정보 없음" : key,
    photos: byPlace.get(key)!,
  }));
}

/** Groups photos into Day buckets, both the buckets and each bucket's photos newest-first. */
export function groupPhotosByDay(photos: Photo[]): TimelineDayGroup[] {
  const byDay = new Map<string, Photo[]>();
  for (const photo of photos) {
    const date = parsedDate(photo);
    if (!date) continue;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(photo);
  }

  return Array.from(byDay.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dayKey, dayPhotos]) => {
      const sorted = [...dayPhotos].sort(comparePhotosDesc);
      return {
        key: dayKey,
        label: DAY_FORMATTER.format(parsedDate(sorted[0])!),
        photos: sorted,
        places: groupPhotosByPlace(sorted),
      };
    });
}

/**
 * Groups one year's photos into Month → Day, both newest-first. Always
 * returns a group (photoCount may be 0) so callers can render a
 * "no photos from {year}" state instead of branching on null.
 */
export function buildTimelineForYear(photos: Photo[], year: TimelineYearKey): TimelineYearGroup {
  if (year === "unknown") {
    const undated = photos.filter((photo) => parsedDate(photo) === null).sort(comparePhotosDesc);
    return {
      year,
      label: "날짜 미상",
      photoCount: undated.length,
      months:
        undated.length === 0
          ? []
          : [
              {
                key: "unknown",
                label: "날짜 미상",
                photoCount: undated.length,
                days: [
                  { key: "unknown", label: "날짜 미상", photos: undated, places: groupPhotosByPlace(undated) },
                ],
              },
            ],
    };
  }

  const yearPhotos = photos.filter((photo) => parsedDate(photo)?.getFullYear() === year);

  const byMonth = new Map<number, Photo[]>();
  for (const photo of yearPhotos) {
    const month = parsedDate(photo)!.getMonth();
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(photo);
  }

  const months: TimelineMonthGroup[] = Array.from(byMonth.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([monthIndex, monthPhotos]) => ({
      key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      label: MONTH_FORMATTER.format(new Date(year, monthIndex, 1)),
      photoCount: monthPhotos.length,
      days: groupPhotosByDay(monthPhotos),
    }));

  return { year, label: String(year), photoCount: yearPhotos.length, months };
}

/** Flattens a year group in the same newest-first order it's displayed in — the array Photo Viewer navigates within. */
export function flattenTimelineYear(group: TimelineYearGroup): Photo[] {
  return group.months.flatMap((month) => month.days.flatMap((day) => day.photos));
}
