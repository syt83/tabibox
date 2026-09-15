import type { Photo } from "@/types/photo";
import type { TimelineDayGroup } from "@/lib/timeline";
import { formatCount } from "@/lib/format-utils";
import PhotoGridItem from "@/components/photos/photo-grid-item";

interface TimelineDayProps {
  day: TimelineDayGroup;
  onPhotoClick: (photo: Photo) => void;
}

export default function TimelineDay({ day, onPhotoClick }: TimelineDayProps) {
  // Most days are single-place — only break out 도도부현 sub-headers once a
  // day's photos actually span more than one (e.g. moved from Kyoto to
  // Osaka mid-day), so a normal day still renders as one flat grid.
  const showPlaces = day.places.length > 1;

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-ink">{day.label}</h3>
        <span className="text-xs text-subtext">사진 {formatCount(day.photos.length)}장</span>
      </div>

      {showPlaces ? (
        <div className="flex flex-col gap-4">
          {day.places.map((place) => (
            <div key={place.key}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span aria-hidden className="text-xs">
                  📍
                </span>
                <span className="text-xs font-semibold text-secondary">{place.label}</span>
                <span className="text-xs text-subtext">{formatCount(place.photos.length)}장</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {place.photos.map((photo, i) => (
                  <PhotoGridItem key={photo.id} photo={photo} onClick={() => onPhotoClick(photo)} priority={i < 4} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {day.photos.map((photo, i) => (
            <PhotoGridItem key={photo.id} photo={photo} onClick={() => onPhotoClick(photo)} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
