"use client";

import { useState } from "react";
import type { Photo } from "@/types/photo";
import { groupPhotosByDay } from "@/lib/timeline";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import TimelineDay from "@/components/timeline/timeline-day";
import PhotoViewer from "@/components/photos/photo-viewer";

interface TripTimelineProps {
  initialPhotos: Photo[];
  tripTitle: string;
}

export default function TripTimeline({ initialPhotos, tripTitle }: TripTimelineProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  useDemoFavoriteSync(setPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const days = groupPhotosByDay(photos);
  // Undated photos never get a day bucket (groupPhotosByDay skips them) —
  // a trip's photos are near-always dated, so this simply won't show them
  // rather than inventing a fake "unknown" day for a single-trip view.
  const flatPhotos = days.flatMap((day) => day.photos);

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

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-subtext">
        날짜 정보가 있는 사진이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <TimelineDay key={day.key} day={day} onPhotoClick={handlePhotoClick} />
      ))}

      {viewerIndex !== null && (
        <PhotoViewer
          photos={flatPhotos}
          index={viewerIndex}
          getTripTitle={() => tripTitle}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onPhotoDeleted={handlePhotoDeleted}
          onFavoriteChanged={handleFavoriteChanged}
        />
      )}
    </div>
  );
}
