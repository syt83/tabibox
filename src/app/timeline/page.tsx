import { Suspense } from "react";
import { getSearchDataset } from "@/lib/search-data";
import TimelinePageClient from "./timeline-page-client";

function TimelineLoadingFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12 animate-pulse">
      <div className="h-8 w-32 rounded bg-border" />
      <div className="mt-2 h-4 w-48 rounded bg-border" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-9 w-16 rounded-full bg-border" />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-subtext">Loading timeline...</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-border" />
        ))}
      </div>
    </div>
  );
}

export default async function TimelinePage() {
  const { trips, photos } = await getSearchDataset();

  return (
    <Suspense fallback={<TimelineLoadingFallback />}>
      <TimelinePageClient trips={trips} photos={photos} />
    </Suspense>
  );
}
