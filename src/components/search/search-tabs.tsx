import clsx from "clsx";
import type { SearchTab } from "@/types/search";
import type { SearchCounts } from "@/lib/search-service";
import { formatCount } from "@/lib/format-utils";

interface SearchTabsProps {
  active: SearchTab;
  counts: SearchCounts;
  onChange: (tab: SearchTab) => void;
}

const TABS: { key: SearchTab; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "trips", label: "여행" },
  { key: "photos", label: "사진" },
];

export default function SearchTabs({ active, counts, onChange }: SearchTabsProps) {
  return (
    <div role="tablist" aria-label="검색 결과 종류" className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            active === tab.key ? "border-primary text-primary" : "border-transparent text-subtext hover:text-ink"
          )}
        >
          {tab.label}
          <span className="text-xs text-subtext">{formatCount(counts[tab.key])}</span>
        </button>
      ))}
    </div>
  );
}
