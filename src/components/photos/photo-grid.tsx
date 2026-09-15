"use client";

import { useState } from "react";
import type { Photo } from "@/types/photo";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import PhotoGridItem from "./photo-grid-item";
import PhotoViewer from "./photo-viewer";

interface PhotoGridProps {
  initialPhotos: Photo[];
  /** Single-trip context (Trip Detail): every photo shares this title. */
  tripTitle?: string;
  /**
   * Multi-trip context (Collections): per-photo lookup, keyed by tripId.
   * A plain object (not a function) because this can be passed straight
   * from a Server Component — functions aren't serializable across that
   * boundary. Takes precedence over `tripTitle` when both are given.
   */
  tripTitles?: Record<string, string>;
}

export default function PhotoGrid({ initialPhotos, tripTitle, tripTitles }: PhotoGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  useDemoFavoriteSync(setPhotos);
  const resolveTripTitle = tripTitles
    ? (photo: Photo) => tripTitles[photo.tripId] ?? ""
    : () => tripTitle ?? "";

  function handleFavoriteChanged(photoId: string, isFavorite: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isFavorite } : p)));
  }

  function handlePhotoDeleted(photoId: string) {
    setPhotos((prev) => {
      const deletedAt = prev.findIndex((p) => p.id === photoId);
      const next = prev.filter((p) => p.id !== photoId);

      setViewerIndex((currentIndex) => {
        if (currentIndex === null) return null;
        if (next.length === 0) return null;
        return Math.min(deletedAt, next.length - 1);
      });

      return next;
    });
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-subtext">
        남은 사진이 없어요.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {photos.map((photo, i) => (
          <PhotoGridItem key={photo.id} photo={photo} onClick={() => setViewerIndex(i)} priority={i < 8} />
        ))}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          index={viewerIndex}
          getTripTitle={resolveTripTitle}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onPhotoDeleted={handlePhotoDeleted}
          onFavoriteChanged={handleFavoriteChanged}
        />
      )}
    </>
  );
}
