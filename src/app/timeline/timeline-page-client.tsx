"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { getAvailablePhotoYears, buildTimelineForYear, flattenTimelineYear, type TimelineYearKey } from "@/lib/timeline";
import { formatCount } from "@/lib/format-utils";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import TimelineYearTabs from "@/components/timeline/timeline-year-tabs";
import TimelineMonth from "@/components/timeline/timeline-month";
import PhotoViewer from "@/components/photos/photo-viewer";
import EmptyState from "@/components/EmptyState";

interface TimelinePageClientProps {
  trips: Trip[];
  photos: Photo[];
}

function parseYearParam(value: string | null): TimelineYearKey | null {
  if (value === null) return null;
  if (value === "unknown") return "unknown";
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export default function TimelinePageClient({ trips, photos: initialPhotos }: TimelinePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [photos, setPhotos] = useState(initialPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  useDemoFavoriteSync(setPhotos);

  const availableYears = useMemo(() => getAvailablePhotoYears(photos), [photos]);
  const requestedYear = parseYearParam(searchParams.get("year"));
  const selectedYear = requestedYear ?? availableYears[0] ?? null;

  const yearGroup = useMemo(
    () => (selectedYear === null ? null : buildTimelineForYear(photos, selectedYear)),
    [photos, selectedYear]
  );
  const flatPhotos = useMemo(() => (yearGroup ? flattenTimelineYear(yearGroup) : []), [yearGroup]);

  const tripTitleById = useMemo(() => new Map(trips.map((trip) => [trip.id, trip.title])), [trips]);

  function handleYearChange(year: TimelineYearKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(year));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handlePhotoClick(photo: Photo) {
    const index = flatPhotos.findIndex((p) => p.id === photo.id);
    if (index >= 0) setViewerIndex(index);
  }

  function handleFavoriteChanged(photoId: string, isFavorite: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isFavorite } : p)));
  }

  function handlePhotoDeleted(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setViewerIndex((current) => {
      if (current === null) return null;
      const remaining = flatPhotos.length - 1;
      if (remaining <= 0) return null;
      return Math.min(current, remaining - 1);
    });
  }

  if (availableYears.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <EmptyState
          icon="🕰️"
          title="まだ写真がありません"
          description={"아직 시간순으로 정리할 사진이 없어요.\n첫 번째 여행 사진을 추가해보세요."}
          action={
            <Link
              href="/"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              사진 추가
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <p className="text-sm font-semibold text-subtext">時間の記録</p>
      <h1 className="mt-1 mb-6 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
        시간순으로 다시 보는 여행
      </h1>

      <TimelineYearTabs years={availableYears} selected={selectedYear!} onChange={handleYearChange} />

      <div className="mt-8 flex flex-col gap-10">
        {yearGroup && yearGroup.photoCount > 0 ? (
          <>
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-xl font-extrabold text-ink">{yearGroup.label}</h2>
              <span className="text-sm text-subtext">사진 {formatCount(yearGroup.photoCount)}장</span>
            </div>

            {yearGroup.months.map((month) => (
              <TimelineMonth key={month.key} month={month} onPhotoClick={handlePhotoClick} />
            ))}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg font-bold text-ink">
              {selectedYear === "unknown" ? "이 기간" : `${selectedYear}년`}에는 사진이 없어요.
            </p>
            <p className="mt-1 text-sm text-subtext">다른 연도를 선택해보세요.</p>
          </div>
        )}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={flatPhotos}
          index={viewerIndex}
          getTripTitle={(photo) => tripTitleById.get(photo.tripId) ?? ""}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onPhotoDeleted={handlePhotoDeleted}
          onFavoriteChanged={handleFavoriteChanged}
        />
      )}
    </div>
  );
}
