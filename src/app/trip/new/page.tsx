"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrip } from "@/lib/trip-mutations";
import { JAPAN_CITIES } from "@/lib/japan-cities";

export default function NewTripPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function toggleCity(city: string) {
    setCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(undefined);

    const result = await createTrip({
      title,
      country: "Japan",
      cities,
      startDate,
      endDate,
    });

    setSubmitting(false);

    if (!result.success || !result.trip) {
      setError(result.message ?? "여행을 추가하지 못했어요.");
      return;
    }

    router.push(`/trip/${result.trip.id}`);
    // The Sidebar's trip list is fetched in the root layout (AppShell), which
    // persists across a client-side push and won't otherwise see this new
    // trip until something reloads it.
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10 md:py-14">
      <Link href="/" className="text-sm text-subtext hover:text-ink">
        ← 홈
      </Link>

      <p className="mt-4 text-sm font-semibold text-subtext">新しい旅</p>
      <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
        새 여행 추가
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtext">여행 이름</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 벚꽃 보러 교토 여행"
            required
            autoFocus
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-ink outline-none focus:border-primary"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtext">
            도시 {cities.length > 0 && `(${cities.length}개 선택됨)`}
          </span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            {JAPAN_CITIES.map((city) => {
              const selected = cities.includes(city.en);
              return (
                <button
                  key={city.en}
                  type="button"
                  onClick={() => toggleCity(city.en)}
                  aria-pressed={selected}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-ink hover:bg-black/[0.04]"
                  }`}
                >
                  {city.ko}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-subtext">시작일</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-subtext">종료일</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>
        </div>

        {error && <p className="text-sm text-primary">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          {submitting ? "추가 중..." : "여행 추가"}
        </button>
      </form>
    </div>
  );
}
