import { getTripByIdData } from "@/lib/trip-data";
import { getTripPhotosData } from "@/lib/photo-repository";
import TripDetailView from "@/components/trips/trip-detail-view";
import TripDetailFallback from "./trip-detail-fallback";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripByIdData(id);

  if (!trip) return <TripDetailFallback id={id} />;

  const { photos, source } = await getTripPhotosData(trip.id);

  return <TripDetailView trip={trip} photos={photos} photoSource={source} />;
}
