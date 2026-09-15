"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { getDemoTrips } from "@/lib/demo-trips";
import { sortPhotosByRecency, getTripCoverPhotoUrl } from "@/lib/photo-utils";
import { getAvailableYears, getYearStats } from "@/lib/year-utils";
import HomeHero from "@/components/home/home-hero";
import OverallStats from "@/components/home/overall-stats";
import RecentTrips from "@/components/home/recent-trips";
import BrowseByYear from "@/components/home/browse-by-year";
import RecentPhotos from "@/components/home/recent-photos";
import EmptyState from "@/components/EmptyState";

interface HomePageClientProps {
  trips: Trip[];
  photos: Photo[];
  manualYears: number[];
}

export default function HomePageClient({ trips, photos, manualYears }: HomePageClientProps) {
  const [demoTrips, setDemoTrips] = useState<Trip[]>([]);

  useEffect(() => {
    // Demo Mode trips (created via /trip/new when Supabase isn't
    // configured) live in localStorage — read after mount so server and
    // first client render stay identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemoTrips(getDemoTrips());
  }, []);

  const allTrips = useMemo(() => [...trips, ...demoTrips], [trips, demoTrips]);
  const years = useMemo(() => getAvailableYears(allTrips, photos, manualYears), [allTrips, photos, manualYears]);

  if (allTrips.length === 0 && years.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <EmptyState
          icon="📷"
          title="旅はこれから"
          description={"まだ写真がありません\n첫 번째 여행을 추가해보세요."}
          action={
            <Link
              href="/trip/new"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              여행 추가하기
            </Link>
          }
        />
      </div>
    );
  }

  const tripsByRecency = [...allTrips]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((trip) => ({
      trip,
      photoCount: photos.filter((photo) => photo.tripId === trip.id).length,
      coverPhotoUrl: getTripCoverPhotoUrl(photos, trip.id),
    }));
  const recentTrips = tripsByRecency.slice(0, 3);
  const yearStats = years.slice(0, 5).map((year) => getYearStats(allTrips, photos, year));
  const recentPhotos = sortPhotosByRecency(photos).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-14">
      <HomeHero trips={tripsByRecency} collagePhotos={recentPhotos} />
      <OverallStats photoCount={photos.length} tripCount={allTrips.length} yearCount={years.length} />
      <RecentTrips trips={recentTrips} />
      <BrowseByYear years={yearStats} />
      <RecentPhotos photos={recentPhotos} />

      <section className="rounded-3xl border border-border bg-card px-6 py-8 text-center md:px-10">
        <p className="text-xs font-semibold text-subtext">思い出を探す</p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink">장소와 사진을 찾아보세요</h2>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <span aria-hidden>🔍</span> 검색하기
        </Link>
      </section>
    </div>
  );
}
