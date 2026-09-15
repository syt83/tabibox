import Link from "next/link";
import Image from "next/image";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { formatCount, formatTripDateRange } from "@/lib/format-utils";
import { getTripCoverPhotoUrl } from "@/lib/photo-utils";
import UploadPhotosDialog from "@/components/photos/upload-photos-dialog";
import CameraCaptureButton from "@/components/photos/camera-capture-button";
import TripDetailTabs from "./trip-detail-tabs";
import DeleteTripButton from "./delete-trip-button";

export type TripPhotoSource = "supabase" | "mock" | "demo";

interface TripDetailViewProps {
  trip: Trip;
  photos: Photo[];
  photoSource: TripPhotoSource;
}

export default function TripDetailView({ trip, photos, photoSource }: TripDetailViewProps) {
  const coverUrl = getTripCoverPhotoUrl(photos, trip.id) ?? trip.coverImageUrl;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <Link href="/" className="text-sm text-subtext hover:text-ink">
        ← 홈
      </Link>

      <div className="mt-4 relative h-56 md:h-72 w-full overflow-hidden rounded-3xl bg-card">
        {coverUrl && <Image src={coverUrl} alt={trip.title} fill unoptimized className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
          <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {trip.year}
          </span>
          <h1 className="mt-2 font-display text-2xl md:text-3xl font-extrabold">{trip.title}</h1>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtext">
          <span>{trip.cities.join(" · ")}</span>
          <span aria-hidden>·</span>
          <span>{formatTripDateRange(trip.startDate, trip.endDate)}</span>
          <span aria-hidden>·</span>
          <span className="font-semibold text-secondary">사진 {formatCount(photos.length)}장</span>
        </div>

        <div className="flex items-center gap-2">
          <CameraCaptureButton tripId={trip.id} />
          <UploadPhotosDialog tripId={trip.id} />
          <DeleteTripButton tripId={trip.id} tripTitle={trip.title} photoSource={photoSource} />
        </div>
      </div>

      {photoSource === "mock" && (
        <p className="mt-3 text-xs text-subtext">데모 사진을 보여주고 있어요. 사진을 추가하면 실제 사진으로 바뀌어요.</p>
      )}
      {photoSource === "demo" && (
        <p className="mt-3 text-xs text-subtext">이 여행은 이 브라우저에만 저장돼 있어요. 다른 기기에서는 보이지 않아요.</p>
      )}

      <div className="mt-6">
        <TripDetailTabs photos={photos} tripTitle={trip.title} />
      </div>
    </div>
  );
}
