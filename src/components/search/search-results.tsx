import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import type { SearchTab } from "@/types/search";
import TripCard from "@/components/trips/trip-card";
import SearchPhotoResults from "@/components/photos/search-photo-results";
import { formatCount } from "@/lib/format-utils";

interface SearchResultsProps {
  tab: SearchTab;
  trips: Trip[];
  photos: Photo[];
  query: string;
  filtersActive: boolean;
  wouldMatchWithoutFilters: boolean;
  tripPhotoCounts: Map<string, number>;
  getTripTitle: (photo: Photo) => string;
  onFavoriteChanged: (photoId: string, isFavorite: boolean) => void;
  onPhotoDeleted: (photoId: string) => void;
}

export default function SearchResults({
  tab,
  trips,
  photos,
  query,
  filtersActive,
  wouldMatchWithoutFilters,
  tripPhotoCounts,
  getTripTitle,
  onFavoriteChanged,
  onPhotoDeleted,
}: SearchResultsProps) {
  const showTrips = tab === "all" || tab === "trips";
  const showPhotos = tab === "all" || tab === "photos";

  const nothingToShow = (!showTrips || trips.length === 0) && (!showPhotos || photos.length === 0);

  if (nothingToShow) {
    if (filtersActive && wouldMatchWithoutFilters) {
      return (
        <div className="py-16 text-center">
          <p className="text-lg font-bold text-ink">필터 조건에 맞는 결과가 없어요.</p>
          <p className="mt-1 text-sm text-subtext">필터를 하나씩 지워보세요.</p>
        </div>
      );
    }
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-ink">見つかりませんでした</p>
        <p className="mt-1 text-sm text-subtext">
          {query ? (
            <>&ldquo;{query}&rdquo;에 대한 결과가 없어요. 다른 검색어로 다시 찾아보세요.</>
          ) : (
            "다른 검색어나 필터로 다시 찾아보세요."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {showTrips && trips.length > 0 && (
        <section>
          {tab === "all" && (
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtext">
              여행 <span className="text-ink/60">{formatCount(trips.length)}개 결과</span>
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} photoCount={tripPhotoCounts.get(trip.id) ?? 0} />
            ))}
          </div>
        </section>
      )}

      {showPhotos && photos.length > 0 && (
        <section>
          {tab === "all" && (
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-subtext">
              사진 <span className="text-ink/60">{formatCount(photos.length)}개 결과</span>
            </h2>
          )}
          <SearchPhotoResults
            photos={photos}
            getTripTitle={getTripTitle}
            onFavoriteChanged={onFavoriteChanged}
            onPhotoDeleted={onPhotoDeleted}
          />
        </section>
      )}
    </div>
  );
}
