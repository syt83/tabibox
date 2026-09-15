"use client";

import { useState } from "react";
import type { SearchFilters } from "@/types/search";
import { hasActiveFilters } from "@/types/search";

interface SearchFiltersBarProps {
  years: number[];
  cities: string[];
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
}

export default function SearchFiltersBar({ years, cities, filters, onChange, onClear }: SearchFiltersBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = hasActiveFilters(filters);

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="연도로 필터링"
        value={filters.year ?? ""}
        onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : undefined })}
        className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">전체 연도</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        aria-label="도시로 필터링"
        value={filters.city ?? ""}
        onChange={(e) => onChange({ city: e.target.value || undefined })}
        className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">전체 도시</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={filters.favorite ?? false}
          onChange={(e) => onChange({ favorite: e.target.checked ? true : undefined })}
        />
        즐겨찾기만
      </label>

      <div className="flex flex-wrap items-center gap-2 text-sm text-subtext">
        <label className="flex items-center gap-1.5">
          시작일
          <input
            type="date"
            aria-label="시작일"
            value={filters.dateFrom ?? ""}
            onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
            className="rounded-xl border border-border bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="flex items-center gap-1.5">
          종료일
          <input
            type="date"
            aria-label="종료일"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
            className="rounded-xl border border-border bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
      </div>

      {active && (
        <button onClick={onClear} className="text-sm font-semibold text-primary hover:opacity-70">
          필터 초기화
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="hidden md:block">{controls}</div>

      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-ink"
        >
          필터{active ? " •" : ""}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-card p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">필터</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="필터 닫기" className="text-subtext">
                ✕
              </button>
            </div>
            {controls}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              결과 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
