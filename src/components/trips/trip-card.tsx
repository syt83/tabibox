import Link from "next/link";
import Image from "next/image";
import type { Trip } from "@/types/trip";
import { formatCount, formatTripDateRange } from "@/lib/format-utils";

export interface TripCardProps {
  trip: Trip;
  photoCount: number;
  featured?: boolean;
  /** Most-recent-photo cover, computed by the caller (see getTripCoverPhotoUrl). Falls back to trip.coverImageUrl when not given. */
  coverPhotoUrl?: string;
}

export default function TripCard({ trip, photoCount, featured = false, coverPhotoUrl }: TripCardProps) {
  const coverUrl = coverPhotoUrl ?? trip.coverImageUrl;

  return (
    <Link
      href={`/trip/${trip.id}`}
      aria-label={`${trip.title} 여행 상세 보기`}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-lg"
    >
      <div className={`relative w-full ${featured ? "h-64 md:h-80" : "h-44"}`}>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={trip.title}
            fill
            unoptimized
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
          <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {trip.year}
          </span>
          <h3
            className={`mt-2 font-display font-extrabold leading-tight ${
              featured ? "text-2xl md:text-3xl" : "text-lg"
            }`}
          >
            {trip.title}
          </h3>
          <p className="mt-1 text-sm text-white/85">{trip.cities.join(" · ")}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/75">
            <span>{formatTripDateRange(trip.startDate, trip.endDate)}</span>
            <span aria-hidden>·</span>
            <span>{formatCount(photoCount)} Photos</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
