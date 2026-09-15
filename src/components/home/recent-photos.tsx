import Link from "next/link";
import Image from "next/image";
import type { Photo } from "@/types/photo";

interface RecentPhotosProps {
  photos: Photo[];
}

export default function RecentPhotos({ photos }: RecentPhotosProps) {
  if (photos.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="mb-5">
        <p className="text-xs font-semibold text-subtext">最近の写真</p>
        <h2 className="font-display text-xl md:text-2xl font-bold text-ink">최근 추가한 사진</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/trip/${photo.tripId}`}
            aria-label={photo.locationName ? `${photo.locationName} 사진이 포함된 여행 보기` : "사진이 포함된 여행 보기"}
            className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/[0.03]"
          >
            <Image
              src={photo.thumbnailUrl ?? photo.imageUrl}
              alt={photo.locationName ?? photo.city ?? "여행 사진"}
              fill
              unoptimized
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
