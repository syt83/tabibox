import Link from "next/link";
import Image from "next/image";
import { getSearchDataset } from "@/lib/search-data";
import { PHOTO_CATEGORIES } from "@/types/photo";
import { CATEGORY_META } from "@/lib/category-meta";
import { formatCount } from "@/lib/format-utils";
import EmptyState from "@/components/EmptyState";

export default async function CollectionsPage() {
  const { photos } = await getSearchDataset();

  const categories = PHOTO_CATEGORIES.map((category) => {
    const catPhotos = photos.filter((photo) => photo.category === category);
    return {
      category,
      count: catPhotos.length,
      cover: catPhotos[0]?.thumbnailUrl ?? catPhotos[0]?.imageUrl,
    };
  });

  const hasAny = categories.some((c) => c.count > 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <p className="text-sm font-semibold text-subtext">コレクション</p>
      <h1 className="mt-1 mb-6 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">컬렉션</h1>

      {!hasAny ? (
        <EmptyState icon="🗂️" title="まだありません" description={"분류된 사진이 없어요."} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map(({ category, count, cover }) => {
            const meta = CATEGORY_META[category];
            return (
              <Link
                key={category}
                href={`/collections/${category}`}
                aria-label={`${meta.koLabel} 컬렉션 보기`}
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.03]"
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={meta.koLabel}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 22vw, 45vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-bg" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-2xl">{meta.icon}</div>
                  <div className="font-display font-bold">{meta.koLabel}</div>
                  <div className="text-xs opacity-80">{formatCount(count)}장</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
