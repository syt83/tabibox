"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/types/photo";

interface PhotoGridItemProps {
  photo: Photo;
  onClick: () => void;
  priority?: boolean;
}

export default function PhotoGridItem({ photo, onClick, priority = false }: PhotoGridItemProps) {
  const [failed, setFailed] = useState(false);
  const src = photo.thumbnailUrl ?? photo.imageUrl;

  return (
    <button
      onClick={onClick}
      aria-label={`Open photo${photo.locationName ? `: ${photo.locationName}` : ""}`}
      className="group relative aspect-square overflow-hidden rounded-xl bg-card ring-1 ring-black/[0.03] transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-bg text-subtext">
          <span className="text-xl" aria-hidden>
            🖼️
          </span>
          <span className="text-[11px]">이미지 없음</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={photo.locationName ?? photo.city ?? "여행 사진"}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}

      {!failed && (
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/10" />
      )}

      {photo.isFavorite && (
        <span
          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-sm text-white"
          aria-hidden
        >
          ♥
        </span>
      )}
    </button>
  );
}
