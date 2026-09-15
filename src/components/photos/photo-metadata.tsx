import type { Photo } from "@/types/photo";
import { formatPhotoDateTime, formatPhotoLocation } from "@/lib/format-utils";

interface PhotoMetadataProps {
  photo: Photo;
  tripTitle: string;
  index: number;
  total: number;
}

export default function PhotoMetadata({ photo, tripTitle, index, total }: PhotoMetadataProps) {
  return (
    <div>
      <p className="text-sm font-medium text-subtext">
        {index + 1} / {total}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-ink">{tripTitle}</p>
      <p className="mt-1 text-sm text-ink/80">{formatPhotoDateTime(photo.takenAt)}</p>
      <p className="text-sm text-subtext">{formatPhotoLocation(photo)}</p>
    </div>
  );
}
