import clsx from "clsx";
import type { TimelineYearKey } from "@/lib/timeline";

interface TimelineYearTabsProps {
  years: TimelineYearKey[];
  selected: TimelineYearKey;
  onChange: (year: TimelineYearKey) => void;
}

export default function TimelineYearTabs({ years, selected, onChange }: TimelineYearTabsProps) {
  if (years.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="연도 선택"
      className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0"
    >
      {years.map((year) => (
        <button
          key={year}
          role="tab"
          aria-selected={selected === year}
          onClick={() => onChange(year)}
          className={clsx(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            selected === year ? "bg-primary text-white" : "bg-card text-ink/70 ring-1 ring-black/[0.06] hover:text-ink"
          )}
        >
          {year === "unknown" ? "날짜 미상" : `${year}年`}
        </button>
      ))}
    </div>
  );
}
