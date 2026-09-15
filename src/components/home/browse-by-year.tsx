import Link from "next/link";
import type { YearStats } from "@/lib/year-utils";
import { formatCount } from "@/lib/format-utils";

interface BrowseByYearProps {
  years: YearStats[];
  showHeader?: boolean;
  showViewAll?: boolean;
}

export default function BrowseByYear({ years, showHeader = true, showViewAll = true }: BrowseByYearProps) {
  if (years.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      {showHeader && (
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-subtext">旅の年</p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-ink">여행의 기록</h2>
          </div>
          {showViewAll && (
            <Link href="/years" className="text-sm font-semibold text-primary hover:opacity-70 whitespace-nowrap">
              전체보기 →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {years.map((stats) => (
          <Link
            key={stats.year}
            href={`/year/${stats.year}`}
            aria-label={`${stats.year}년 여행 보기`}
            className="rounded-2xl border-2 border-primary/25 bg-primary/[0.06] px-4 py-4 transition-colors hover:bg-primary/[0.1] md:px-5 md:py-5"
          >
            <div className="font-display text-2xl md:text-3xl font-extrabold text-ink">{stats.year}</div>
            <div className="mt-1 text-xs md:text-sm text-subtext">
              여행 {formatCount(stats.tripCount)}개 · 사진 {formatCount(stats.photoCount)}장
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
