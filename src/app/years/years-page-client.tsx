"use client";

import { useEffect, useMemo, useState } from "react";
import type { Trip } from "@/types/trip";
import type { Photo } from "@/types/photo";
import { getAvailableYears, getYearStats } from "@/lib/year-utils";
import { getDemoYears } from "@/lib/year-mutations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AddYearDialog from "@/components/years/add-year-dialog";
import YearCard from "@/components/years/year-card";
import EmptyState from "@/components/EmptyState";

interface YearsPageClientProps {
  trips: Trip[];
  photos: Photo[];
  manualYears: number[];
}

export default function YearsPageClient({ trips, photos, manualYears }: YearsPageClientProps) {
  const [demoYears, setDemoYears] = useState<number[]>([]);

  useEffect(() => {
    // Demo-mode manually-added years live in localStorage (no Supabase to
    // read them from server-side) — read after mount so server and first
    // client render stay identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemoYears(getDemoYears());
  }, []);

  const allManualYears = useMemo(
    () => Array.from(new Set([...manualYears, ...demoYears])),
    [manualYears, demoYears]
  );
  const years = useMemo(() => getAvailableYears(trips, photos, allManualYears), [trips, photos, allManualYears]);
  const yearStatsList = useMemo(
    () => years.map((year) => getYearStats(trips, photos, year)),
    [years, trips, photos]
  );

  function handleYearAdded(year: number) {
    if (!isSupabaseConfigured()) {
      setDemoYears((prev) => (prev.includes(year) ? prev : [...prev, year]));
    }
    // Real mode: AddYearDialog already calls router.refresh(), which
    // re-fetches manualYears server-side and flows back down as new props.
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-subtext">旅の年</p>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            여행의 기록
          </h1>
          <p className="mt-1 text-sm text-subtext">한 해, 한 해 쌓인 여행의 기억을 둘러보세요.</p>
        </div>
        <AddYearDialog existingYears={years} onAdded={handleYearAdded} />
      </div>

      {yearStatsList.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="🗓️"
            title="旅はこれから"
            description={"아직 등록된 여행이 없어요.\n위의 '연도 추가'로 첫 여행 연도를 만들어보세요."}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {yearStatsList.map((stats) => (
            <YearCard key={stats.year} stats={stats} />
          ))}
        </div>
      )}
    </div>
  );
}
