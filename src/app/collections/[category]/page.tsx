import Link from "next/link";
import { notFound } from "next/navigation";
import { getSearchDataset } from "@/lib/search-data";
import { PHOTO_CATEGORIES, type PhotoCategory } from "@/types/photo";
import { CATEGORY_META } from "@/lib/category-meta";
import { formatCount } from "@/lib/format-utils";
import PhotoGrid from "@/components/photos/photo-grid";
import EmptyState from "@/components/EmptyState";

export default async function CollectionDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: raw } = await params;
  if (!PHOTO_CATEGORIES.includes(raw as PhotoCategory)) notFound();
  const category = raw as PhotoCategory;

  const { trips, photos } = await getSearchDataset();
  const catPhotos = photos.filter((photo) => photo.category === category);
  const tripTitles = Object.fromEntries(trips.map((trip) => [trip.id, trip.title]));
  const meta = CATEGORY_META[category];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <Link href="/collections" className="text-sm text-subtext hover:text-ink">
        ← 컬렉션
      </Link>

      <div className="mt-3 mb-6 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {meta.icon}
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{meta.koLabel}</h1>
          <p className="text-sm text-subtext">{formatCount(catPhotos.length)}장</p>
        </div>
      </div>

      {catPhotos.length === 0 ? (
        <EmptyState icon={meta.icon} title="まだありません" description="이 컬렉션에는 아직 사진이 없어요." />
      ) : (
        <PhotoGrid initialPhotos={catPhotos} tripTitles={tripTitles} />
      )}
    </div>
  );
}
