import Link from "next/link";
import { notFound } from "next/navigation";
import { getSearchDataset } from "@/lib/search-data";
import { getRecentTrips } from "@/lib/trip-utils";
import { getYearStats } from "@/lib/year-utils";
import { formatCount, formatTripDateRange } from "@/lib/format-utils";

export default async function YearDetailPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  // Only a malformed route segment 404s — a syntactically valid year with
  // no trips/photos yet is a real, reachable state (an empty year), not an
  // error. See lib/year-utils.ts for how years are computed dynamically.
  if (!Number.isInteger(year)) notFound();

  const { trips, photos } = await getSearchDataset();
  const stats = getYearStats(trips, photos, year);
  const yearTrips = trips.filter((trip) => trip.year === year);
  const latestTrip = getRecentTrips(1)[0];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-12">
      <Link href="/years" className="text-sm text-subtext hover:text-ink">
        ← 여행의 기록
      </Link>

      <h1 className="mt-4 font-display text-3xl md:text-4xl font-extrabold text-ink">{year}年</h1>

      {stats.isEmpty ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-lg font-bold text-ink">まだ旅の記録がありません</p>
          <p className="mt-1 text-sm text-subtext">아직 여행의 기록이 없습니다. {year}년의 첫 여행을 추가해보세요.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/trip/new"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              여행 추가
            </Link>
            {latestTrip && (
              <Link
                href={`/trip/${latestTrip.id}`}
                className="rounded-xl border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-ink hover:bg-black/[0.04]"
              >
                사진 추가
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-subtext">
            여행 {formatCount(stats.tripCount)}개 · 사진 {formatCount(stats.photoCount)}장
            {stats.cities.length > 0 && ` · ${stats.cities.join(" · ")}`}
          </p>

          {yearTrips.length > 0 && (
            <div className="mt-6 flex flex-col divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.03]">
              {yearTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-black/[0.02]"
                >
                  <div>
                    <div className="font-semibold text-ink">{trip.title}</div>
                    <div className="mt-0.5 text-sm text-subtext">
                      {trip.cities.join(" · ")} · {formatTripDateRange(trip.startDate, trip.endDate)}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-secondary">
                    {formatCount(photos.filter((photo) => photo.tripId === trip.id).length)}장
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
