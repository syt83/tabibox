"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { sortPhotosByRecency } from "@/lib/photo-utils";
import { formatCount } from "@/lib/format-utils";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import PhotoGridItem from "@/components/photos/photo-grid-item";
import PhotoViewer from "@/components/photos/photo-viewer";
import EmptyState from "@/components/EmptyState";

interface FavoritesPageClientProps {
  trips: Trip[];
  photos: Photo[];
}

export default function FavoritesPageClient({ trips, photos: initialPhotos }: FavoritesPageClientProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  useDemoFavoriteSync(setPhotos);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const favoritePhotos = useMemo(
    () => sortPhotosByRecency(photos.filter((photo) => photo.isFavorite)),
    [photos]
  );
  const tripTitleById = useMemo(() => new Map(trips.map((trip) => [trip.id, trip.title])), [trips]);

  function handleFavoriteChanged(photoId: string, isFavorite: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isFavorite } : p)));
    setViewerIndex((current) => {
      if (current === null || isFavorite) return current;
      // Unfavoriting from inside the viewer shrinks this screen's own list —
      // keep the viewer open on a valid index (or close it if none remain).
      const remaining = favoritePhotos.length - 1;
      if (remaining <= 0) return null;
      return Math.min(current, remaining - 1);
    });
  }

  function handlePhotoDeleted(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setViewerIndex((current) => {
      if (current === null) return null;
      const remaining = favoritePhotos.length - 1;
      if (remaining <= 0) return null;
      return Math.min(current, remaining - 1);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <p className="text-sm font-semibold text-subtext">お気に入り</p>
      <h1 className="mt-1 mb-6 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
        즐겨찾기한 사진
      </h1>

      {favoritePhotos.length === 0 ? (
        <EmptyState
          icon="♥"
          title="まだありません"
          description={"아직 즐겨찾기한 사진이 없어요.\n사진을 열어서 ♡ 버튼을 눌러보세요."}
          action={
            <Link
              href="/"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              사진 보러 가기
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-subtext">{formatCount(favoritePhotos.length)}장</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {favoritePhotos.map((photo, i) => (
              <PhotoGridItem key={photo.id} photo={photo} onClick={() => setViewerIndex(i)} priority={i < 8} />
            ))}
          </div>
        </>
      )}

      {viewerIndex !== null && (
        <PhotoViewer
          photos={favoritePhotos}
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
