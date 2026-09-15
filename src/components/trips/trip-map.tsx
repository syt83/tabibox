"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Photo } from "@/types/photo";
import { useDemoFavoriteSync } from "@/lib/use-demo-favorite-sync";
import PhotoViewer from "@/components/photos/photo-viewer";

interface TripMapProps {
  initialPhotos: Photo[];
  tripTitle: string;
}

// Leaflet's default marker icon resolves relative to the bundler's asset
// pipeline, which breaks under Next.js — point it at the package's own
// hosted images instead of trying to ship the PNGs through /public.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function TripMap({ initialPhotos, tripTitle }: TripMapProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  useDemoFavoriteSync(setPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const geotagged = useMemo(
    () => photos.filter((photo) => photo.latitude != null && photo.longitude != null),
    [photos]
  );

  function handleFavoriteChanged(photoId: string, isFavorite: boolean) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isFavorite } : p)));
  }

  function handlePhotoDeleted(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setViewerIndex(null);
  }

  if (geotagged.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-subtext">
        위치 정보가 있는 사진이 없어요.
      </div>
    );
  }

  const center: [number, number] = [geotagged[0].latitude!, geotagged[0].longitude!];

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-black/[0.05]">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geotagged.map((photo, i) => (
          <Marker
            key={photo.id}
            position={[photo.latitude!, photo.longitude!]}
            icon={markerIcon}
            eventHandlers={{ click: () => setViewerIndex(i) }}
          >
            <Popup>{photo.locationName ?? photo.city ?? "사진 보기"}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={geotagged}
          index={viewerIndex}
          getTripTitle={() => tripTitle}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onPhotoDeleted={handlePhotoDeleted}
          onFavoriteChanged={handleFavoriteChanged}
        />
      )}
    </div>
  );
}
