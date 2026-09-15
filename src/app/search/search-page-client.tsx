"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import type { SearchFilters, SearchTab } from "@/types/search";
import { hasActiveFilters } from "@/types/search";
import { searchAll, collectAvailableCities } from "@/lib/search-service";
import { getAvailableYears } from "@/lib/year-utils";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import SearchInput from "@/components/search/search-input";
import SearchTabs from "@/components/search/search-tabs";
import SearchFiltersBar from "@/components/search/search-filters";
import SearchResults from "@/components/search/search-results";

interface SearchPageClientProps {
  trips: Trip[];
  photos: Photo[];
}

function readTab(value: string | null): SearchTab {
  return value === "trips" || value === "photos" ? value : "all";
}

export default function SearchPageClient({ trips, photos: initialPhotos }: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [photos, setPhotos] = useState(initialPhotos);
  useDemoFavoriteSync(setPhotos);

  const query = searchParams.get("q") ?? "";
  const tab = readTab(searchParams.get("tab"));
  const filters: SearchFilters = useMemo(
    () => ({
      year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
      city: searchParams.get("city") ?? undefined,
      favorite: searchParams.get("favorite") === "true" ? true : undefined,
      dateFrom: searchParams.get("from") ?? undefined,
      dateTo: searchParams.get("to") ?? undefined,
    }),
    [searchParams]
  );

  const years = useMemo(() => getAvailableYears(trips, photos), [trips, photos]);
  const cities = useMemo(() => collectAvailableCities(trips, photos), [trips, photos]);

  const results = useMemo(() => searchAll(trips, photos, query, filters), [trips, photos, query, filters]);
  const filtersActive = hasActiveFilters(filters);
  const unfilteredCounts = useMemo(
    () => (filtersActive ? searchAll(trips, photos, query, {}).counts : null),
    [filtersActive, trips, photos, query]
  );

  const tripTitleById = useMemo(() => new Map(trips.map((trip) => [trip.id, trip.title])), [trips]);
  const tripPhotoCounts = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach((photo) => counts.set(photo.tripId, (counts.get(photo.tripId) ?? 0) + 1));
    return counts;
  }, [photos]);

  function updateUrl(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleQueryCommit(next: string) {
    updateUrl({ q: next.trim() || undefined });
  }

  function handleFilterChange(patch: Partial<SearchFilters>) {
    const next: SearchFilters = { ...filters, ...patch };
    updateUrl({
      year: next.year !== undefined ? String(next.year) : undefined,
      city: next.city,
      favorite: next.favorite ? "true" : undefined,
      from: next.dateFrom,
      to: next.dateTo,
    });
  }

  function handleClearFilters() {
    updateUrl({ year: undefined, city: undefined, favorite: undefined, from: undefined, to: undefined });
  }

  function handleTabChange(next: SearchTab) {
    updateUrl({ tab: next === "all" ? undefined : next });
  }

  function handleFavoriteChanged(photoId: string, isFavorite: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isFavorite } : p)));
  }

  function handlePhotoDeleted(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  const hasQuery = query.trim().length > 0;
  const hasSearchCondition = hasQuery || filtersActive;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <p className="text-sm font-semibold text-subtext">記憶を探す</p>
      <h1 className="mt-1 mb-6 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
        여행의 기억을 찾아보세요
      </h1>

      <SearchInput key={query} value={query} onCommit={handleQueryCommit} />

      <div className="mt-5">
        <SearchTabs active={tab} counts={results.counts} onChange={handleTabChange} />
      </div>

      <div className="mt-4">
        <SearchFiltersBar
          years={years}
          cities={cities}
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      <div className="mt-6">
        {hasSearchCondition ? (
          <SearchResults
            tab={tab}
            trips={results.trips}
            photos={results.photos}
            query={query}
            filtersActive={filtersActive}
            wouldMatchWithoutFilters={(unfilteredCounts?.all ?? 0) > 0}
            tripPhotoCounts={tripPhotoCounts}
            getTripTitle={(photo) => tripTitleById.get(photo.tripId) ?? ""}
            onFavoriteChanged={handleFavoriteChanged}
            onPhotoDeleted={handlePhotoDeleted}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-bold text-ink">여행의 기억을 찾아보세요</p>
            <p className="mt-1 text-sm text-subtext">장소, 여행, 사진을 검색하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
