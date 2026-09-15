import Link from "next/link";
import type { Trip } from "@/types/trip";
import TripCard from "@/components/trips/trip-card";

export interface TripWithPhotoCount {
  trip: Trip;
  photoCount: number;
  coverPhotoUrl?: string;
}

interface RecentTripsProps {
  trips: TripWithPhotoCount[];
}

export default function RecentTrips({ trips }: RecentTripsProps) {
  if (trips.length === 0) return null;

  const [featured, ...rest] = trips;

  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-subtext">最近の旅</p>
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink">최근 여행</h2>
        </div>
        <Link href="/trip/new" className="text-sm font-semibold text-primary hover:opacity-70 whitespace-nowrap">
          + 새 여행
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        <TripCard
          trip={featured.trip}
          photoCount={featured.photoCount}
          coverPhotoUrl={featured.coverPhotoUrl}
          featured
        />
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((entry) => (
              <TripCard
                key={entry.trip.id}
                trip={entry.trip}
                photoCount={entry.photoCount}
                coverPhotoUrl={entry.coverPhotoUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
