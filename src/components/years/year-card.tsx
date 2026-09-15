import Link from "next/link";
import Image from "next/image";
import type { YearStats } from "@/lib/year-utils";
import { formatCount } from "@/lib/format-utils";

export default function YearCard({ stats }: { stats: YearStats }) {
  if (stats.isEmpty) {
    return (
      <Link
        href={`/year/${stats.year}`}
        className="flex flex-col justify-between rounded-3xl border border-dashed border-border bg-card p-5 transition-colors hover:border-primary/50"
      >
        <div className="font-display text-2xl font-extrabold text-ink">{stats.year}年</div>
        <div className="mt-3">
          <p className="text-sm text-ink/70">まだ旅の記録がありません</p>
          <p className="text-sm text-subtext">{stats.year}년의 여행을 준비해보세요.</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/year/${stats.year}`}
      aria-label={`${stats.year}년 여행 보기`}
      className="group block overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-lg"
    >
      <div className="relative h-36 w-full overflow-hidden bg-bg">
        {stats.coverImageUrl ? (
          <Image
            src={stats.coverImageUrl}
            alt={`${stats.year}년 여행 사진`}
            fill
            unoptimized
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-subtext/50" aria-hidden>
            📷
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="font-display text-xl font-extrabold">{stats.year}年</div>
        </div>
      </div>

      <div className="p-4">
        {stats.cities.length > 0 && <p className="truncate text-sm text-ink/70">{stats.cities.join(" · ")}</p>}
        <p className="mt-1 text-sm text-subtext">
          여행 {formatCount(stats.tripCount)}개 · 사진 {formatCount(stats.photoCount)}장
        </p>
      </div>
    </Link>
  );
}
