"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Photo } from "@/types/photo";
import PhotoGrid from "@/components/photos/photo-grid";
import TripTimeline from "./trip-timeline";

// Leaflet touches `window` at module load time — importing it during SSR
// crashes the server render, so the map tab only ever loads client-side.
const TripMap = dynamic(() => import("./trip-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-border bg-card text-sm text-subtext">
      지도를 불러오는 중...
    </div>
  ),
});

type Tab = "photos" | "timeline" | "map";

const TABS: { key: Tab; label: string }[] = [
  { key: "photos", label: "사진" },
  { key: "timeline", label: "타임라인" },
  { key: "map", label: "지도" },
];

interface TripDetailTabsProps {
  photos: Photo[];
  tripTitle: string;
}

export default function TripDetailTabs({ photos, tripTitle }: TripDetailTabsProps) {
  const [tab, setTab] = useState<Tab>("photos");

  return (
    <div>
      <div role="tablist" aria-label="여행 보기 방식" className="mb-5 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-subtext hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "photos" &&
        (photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-subtext">
            まだ写真がありません。 첫 번째 사진을 추가해보세요.
          </div>
        ) : (
          <PhotoGrid initialPhotos={photos} tripTitle={tripTitle} />
        ))}

      {tab === "timeline" && <TripTimeline initialPhotos={photos} tripTitle={tripTitle} />}
      {tab === "map" && <TripMap initialPhotos={photos} tripTitle={tripTitle} />}
    </div>
  );
}
