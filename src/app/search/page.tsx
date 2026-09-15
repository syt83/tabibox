import { Suspense } from "react";
import { getSearchDataset } from "@/lib/search-data";
import SearchPageClient from "./search-page-client";

function SearchLoadingFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12 animate-pulse">
      <div className="h-8 w-32 rounded bg-border" />
      <div className="mt-2 h-4 w-48 rounded bg-border" />
      <div className="mt-6 h-14 w-full rounded-2xl bg-border" />
    </div>
  );
}

export default async function SearchPage() {
  const { trips, photos } = await getSearchDataset();

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageClient trips={trips} photos={photos} />
    </Suspense>
  );
}
