"use client";

import { useState } from "react";
import type { Photo } from "@/types/photo";
import { formatCount } from "@/lib/format-utils";
import PhotoGridItem from "./photo-grid-item";
import PhotoViewer from "./photo-viewer";

const PAGE_SIZE = 40;

interface SearchPhotoResultsProps {
  photos: Photo[];
  getTripTitle: (photo: Photo) => string;
  onFavoriteChanged: (photoId: string, isFavorite: boolean) => void;
  onPhotoDeleted: (photoId: string) => void;
}

export default function SearchPhotoResults({
  photos,
  getTripTitle,
  onFavoriteChanged,
  onPhotoDeleted,
}: SearchPhotoResultsProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const visible = photos.slice(0, visibleCount);

  function handleDeleted(photoId: string) {
    onPhotoDeleted(photoId);
    setViewerIndex((current) => {
      if (current === null) return null;
      const remaining = Math.min(visibleCount, photos.length - 1);
      if (remaining <= 0) return null;
      return Math.min(current, remaining - 1);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {visible.map((photo, i) => (
          <PhotoGridItem key={photo.id} photo={photo} onClick={() => setViewerIndex(i)} priority={i < 10} />
        ))}
      </div>

      {visibleCount < photos.length && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04]"
          >
            더 보기 ({formatCount(photos.length - visibleCount)}장 남음)
          </button>
        </div>
      )}

      {viewerIndex !== null && (
        <PhotoViewer
          photos={visible}
          index={viewerIndex}
          getTripTitle={getTripTitle}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onPhotoDeleted={handleDeleted}
          onFavoriteChanged={onFavoriteChanged}
        />
      )}
    </div>
  );
}
